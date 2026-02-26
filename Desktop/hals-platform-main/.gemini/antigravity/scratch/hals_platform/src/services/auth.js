import { database } from './database';

const SESSION_KEY = 'hals_session';

export const authService = {
    // Email/Password signup
    signup: (email, password, profile) => {
        try {
            const user = database.createUser(email, password, profile);
            // Auto-login after signup
            authService.createSession(user);
            return user;
        } catch (error) {
            throw error;
        }
    },

    // Email/Password login
    login: (email, password) => {
        try {
            const user = database.authenticateUser(email, password);
            authService.createSession(user);
            return user;
        } catch (error) {
            throw error;
        }
    },

    // Google OAuth mock
    googleLogin: (mockGoogleProfile) => {
        const email = mockGoogleProfile.email;

        // Check if user exists
        let user = database.findUserByEmail(email);

        if (!user) {
            // Create new user from Google profile
            user = database.createUser(email, 'google-oauth', {
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
            profile: user.profile,
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

        // Get fresh user data from database
        const user = database.findUserByEmail(parsedSession.email);
        if (!user) {
            authService.logout();
            return null;
        }

        return {
            id: user.id,
            email: user.email,
            ...user.profile,
            isAuthenticated: true
        };
    },

    updateProfile: (profileData) => {
        const user = authService.getUser();
        if (!user) return null;

        const updatedUser = database.updateUserProfile(user.id, profileData);

        // Update session
        authService.createSession(updatedUser);

        return {
            id: updatedUser.id,
            email: updatedUser.email,
            ...updatedUser.profile,
            isAuthenticated: true
        };
    }
};
