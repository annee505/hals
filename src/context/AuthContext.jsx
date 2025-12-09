import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../services/supabase-config';
import { database } from '../services/database';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check active session
        const initSession = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();

                if (session?.user) {
                    // Fetch full profile
                    const profile = await database.findUserByEmail(session.user.email);
                    setUser({ ...profile, id: session.user.id }); // Ensure ID is present
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
                    const profile = await database.findUserByEmail(session.user.email);
                    setUser({ ...profile, id: session.user.id });
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
