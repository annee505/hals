import { database } from './database';

const SESSION_KEY = 'hals_session';

export const authService = {
    // Email/Password signup
    signup: async (email, password, profile) => {
        try {
            const user = await database.createUser(email, password, profile);
            // Auto-login after signup
            authService.createSession(user);
            return user;
        } catch (error) {
            throw error;
        }
    },

    // Email/Password login
    login: async (email, password) => {
        try {
            const user = await database.authenticateUser(email, password);
            authService.createSession(user);
            return user;
        } catch (error) {
            throw error;
        }
    },

    // Google OAuth mock (updated to be async compatible)
    googleLogin: async (mockGoogleProfile) => {
        const email = mockGoogleProfile.email;

        // Check if user exists
        let user = await database.findUserByEmail(email);

        if (!user) {
            // Create new user from Google profile
            user = await database.createUser(email, 'google-oauth', {
                name: mockGoogleProfile.name,
                hobbies: '',
                learningStyle: 'visual',
                goal: ''
            });
        }

        authService.createSession(user);
        return user;
    },

    createSession: (user) => {
        const session = {
            userId: user.id,
            email: user.email,
            profile: {
                name: user.name,
                hobbies: user.hobbies,
                learningStyle: user.learning_style,
                goal: user.goal
            },
            isAuthenticated: true,
            createdAt: new Date().toISOString()
        };
        localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    },

    logout: () => {
        localStorage.removeItem(SESSION_KEY);
    },

    getUser: () => {
        const session = localStorage.getItem(SESSION_KEY);
        if (!session) return null;

        const parsedSession = JSON.parse(session);
        return {
            id: parsedSession.userId,
            email: parsedSession.email,
            ...parsedSession.profile,
            isAuthenticated: true
        };
    },

    // Get fresh user data from server
    refreshUser: async () => {
        const session = localStorage.getItem(SESSION_KEY);
        if (!session) return null;

        const parsedSession = JSON.parse(session);
        const user = await database.findUserByEmail(parsedSession.email);

        if (user) {
            authService.createSession(user);
            return {
                id: user.id,
                email: user.email,
                name: user.name,
                hobbies: user.hobbies,
                learningStyle: user.learning_style,
                goal: user.goal,
                isAuthenticated: true
            };
        }
        return null;
    },

    updateProfile: async (profileData) => {
        const user = authService.getUser();
        if (!user) return null;

        const updatedUser = await database.updateUserProfile(user.id, profileData);

        // Update session
        authService.createSession(updatedUser);

        return {
            id: updatedUser.id,
            email: updatedUser.email,
            name: updatedUser.name,
            hobbies: updatedUser.hobbies,
            learningStyle: updatedUser.learning_style,
            goal: updatedUser.goal,
            isAuthenticated: true
        };
    }
};
