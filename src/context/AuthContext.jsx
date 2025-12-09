import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../services/supabase-config';
import { database } from '../services/database';
import { authService } from '../services/auth';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const safetyTimer = setTimeout(() => setLoading(false), 5000);

        const initSession = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();

                if (session?.user) {
                    // Try to fetch full profile from the users table
                    let profile = null;
                    try {
                        profile = await database.findUserByEmail(session.user.email);
                    } catch (dbError) {
                        console.warn('Profile fetch failed:', dbError);
                    }

                    // Even if profile doesn't exist, still set a basic user object
                    // The user might be new and needs to complete profile setup
                    // Only sign out if we're sure they were deleted (on login, not signup)
                    setUser({
                        ...session.user,
                        ...(profile || {}),
                        id: session.user.id,
                        email: session.user.email,
                        name: profile?.name || session.user.email?.split('@')[0] || 'User',
                        goal: profile?.goal || '',
                        hobbies: profile?.hobbies || ''
                    });
                }
            } catch (error) {
                console.error('Error checking session:', error);
            } finally {
                clearTimeout(safetyTimer);
                setLoading(false);
            }
        };

        initSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            try {
                if (session?.user) {
                    let profile = null;
                    try {
                        profile = await database.findUserByEmail(session.user.email);
                    } catch (dbError) {
                        console.warn('Profile fetch failed during auth change:', dbError);
                    }

                    // For new signups, profile might temporarily not exist
                    // Just set the user and let them complete profile-setup
                    // For existing users logging in, database.authenticateUser already handles the "deleted user" case
                    setUser({
                        ...session.user,
                        ...(profile || {}),
                        id: session.user.id,
                        email: session.user.email,
                        name: profile?.name || session.user.email?.split('@')[0] || 'User',
                        goal: profile?.goal || '',
                        hobbies: profile?.hobbies || ''
                    });
                } else {
                    setUser(null);
                }
            } catch (error) {
                console.error('Auth state change error:', error);
            } finally {
                setLoading(false);
            }
        });

        return () => {
            clearTimeout(safetyTimer);
            if (subscription) {
                subscription.unsubscribe();
            }
        };
    }, []);

    const value = {
        user,
        loading,
        isAuthenticated: !!user
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading ? children : (
                <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                </div>
            )}
        </AuthContext.Provider>
    );
};
