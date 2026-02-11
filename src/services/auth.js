import { database } from './database';
import { supabase } from './supabase-config';

const SESSION_KEY = 'hals_session';

export const authService = {
    // Email/Password signup
    signup: async (email, password, profile) => {
        try {
            console.log('[Auth] Starting signup for:', email);

            // 1. Sign up with Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        name: profile.name,
                        hobbies: profile.hobbies,
                        learning_style: profile.learningStyle,
                        goal: profile.goal
                    }
                }
            });

            if (authError) throw authError;

            if (authData?.user) {
                // 2. Create profile in database
                // We do this explicitly to ensure the users table is in sync
                const { error: profileError } = await supabase
                    .from('users')
                    .insert({
                        id: authData.user.id,
                        email: email,
                        name: profile.name,
                        hobbies: profile.hobbies || '',
                        learning_style: profile.learningStyle || 'visual',
                        goal: profile.goal || ''
                    });

                if (profileError) {
                    // Ignore unique violation if it happens (idempotency)
                    if (profileError.code !== '23505') {
                        console.error('[Auth] Profile creation failed:', profileError);
                        // We don't throw here to avoid blocking the user if auth succeeded
                    }
                }

                // Construct user object
                const user = {
                    id: authData.user.id,
                    email,
                    ...profile
                };

                return user;
            }
            throw new Error('Signup failed - no user returned');
        } catch (error) {
            console.error('[Auth] Signup error:', error);
            const message = error?.message || 'Signup failed. Please try again.';
            throw new Error(message);
        }
    },

    login: async (email, password) => {
        try {
            console.log('[Auth] Logging in:', email);

            // Direct Supabase login - no manual timeouts, no pre-clearing
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;
            if (!data.user) throw new Error('No user returned');

            // Return only the auth user immediately for speed
            // Profile will be fetched by AuthContext in the background
            return {
                id: data.user.id,
                email: data.user.email,
                // We don't block on profile fetch here to prevent hangs
            };
        } catch (error) {
            console.error('[Auth] Login error:', error);
            const message = error?.message || 'Login failed. Please check your credentials.';
            throw new Error(message);
        }
    },

    // Google OAuth mock (kept as is for now, or could be real OAuth)
    googleLogin: async (mockGoogleProfile) => {
        const email = mockGoogleProfile.email;
        let user = await database.findUserByEmail(email);

        if (!user) {
            // For mock, we just skip the auth part and assume trust
            // In a real app, this would use supabase.auth.signInWithOAuth
            const { data: authData, error } = await supabase.auth.signUp({
                email,
                password: 'google-oauth-placeholder-' + Date.now(), // Dummy password
            });

            if (authData?.user) {
                await supabase.from('users').insert({
                    id: authData.user.id,
                    email,
                    name: mockGoogleProfile.name,
                    hobbies: '',
                    learning_style: 'visual',
                    goal: ''
                });
                user = await database.findUserByEmail(email);
            }
        }
        return user;
    },

    logout: async () => {
        try {
            await supabase.auth.signOut();
            localStorage.removeItem(SESSION_KEY);
            localStorage.removeItem('hals-auth-token');
        } catch (error) {
            console.error('Logout error:', error);
            // Force clear local storage anyway
            localStorage.clear();
        }
    },

    // Helper to get current session from proper source
    getSession: async () => {
        const { data: { session } } = await supabase.auth.getSession();
        return session;
    }
};
