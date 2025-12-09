import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../services/supabase-config';
import { database } from '../services/database';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Safety timeout to prevent infinite loading
        const safetyTimer = setTimeout(() => setLoading(false), 5000);

        // Check active session
        const initSession = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();

                if (session?.user) {
                    // Try to fetch full profile, but don't fail if missing
                    let profile = null;
                    try {
                        profile = await database.findUserByEmail(session.user.email);
                    } catch (dbError) {
                        console.warn('Profile fetch failed, using fallback:', dbError);
                    }

                    // Fallback to session data if profile is missing
                    setUser({
                        ...session.user, // Use basic auth data
                        ...profile,      // Overlay DB profile if exists
                        id: session.user.id,
                        email: session.user.email,
                        name: profile?.name || session.user.email.split('@')[0], // Fallback name
                        goal: profile?.goal || '',
                        hobbies: profile?.hobbies || ''
                    });
                }
            } catch (error) {
                console.error('Error checking session:', error);
            } finally {
                setLoading(false);
            }
        };

        initSession();

        // Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            try {
                if (session?.user) {
                    let profile = null;
                    try {
                        profile = await database.findUserByEmail(session.user.email);
                    } catch (dbError) {
                        console.warn('Profile fetch failed during auth change, using fallback:', dbError);
                    }

                    setUser({
                        ...session.user,
                        ...profile,
                        id: session.user.id,
                        email: session.user.email,
                        name: profile?.name || session.user.email.split('@')[0],
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

        return () => subscription.unsubscribe();
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
