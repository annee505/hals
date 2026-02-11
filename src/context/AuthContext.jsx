import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../services/supabase-config';
import { database } from '../services/database';
import { authService } from '../services/auth';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchProfile = async (sessionUser) => {
        if (!sessionUser?.email) return null;
        try {
            const profile = await database.findUserByEmail(sessionUser.email);
            return {
                ...sessionUser,
                ...(profile || {}),
                id: sessionUser.id,
                email: sessionUser.email,
                name: profile?.name || sessionUser.email?.split('@')[0] || 'User',
                goal: profile?.goal || '',
                hobbies: profile?.hobbies || ''
            };
        } catch (error) {
            console.warn('Profile fetch failed:', error);
            return sessionUser;
        }
    };

    const refreshProfile = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
            const fullUser = await fetchProfile(session.user);
            setUser(fullUser);
        }
    };

    useEffect(() => {
        let mounted = true;

        const initSession = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user && mounted) {
                    const fullUser = await fetchProfile(session.user);
                    if (mounted) setUser(fullUser);
                }
            } catch (error) {
                console.error('Error checking session:', error);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        initSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (!mounted) return;

            if (session?.user) {
                // OPTIMISTIC UPDATE:
                // 1. Set the basic authenticated user IMMEDIATELY to unblock the UI
                setUser(prev => {
                    // Keep existing profile data if we have it, otherwise just use session data
                    // This prevents flickering if we already loaded the profile
                    return { ...session.user, ...prev };
                });
                setLoading(false);

                // 2. Fetch full profile in the background
                try {
                    const fullUser = await fetchProfile(session.user);
                    if (mounted) setUser(fullUser);
                } catch (err) {
                    console.error("Background profile fetch failed", err);
                }
            } else {
                if (mounted) setUser(null);
                if (mounted) setLoading(false);
            }
        });

        return () => {
            mounted = false;
            if (subscription) {
                subscription.unsubscribe();
            }
        };
    }, []);

    const value = {
        user,
        loading,
        isAuthenticated: !!user,
        refreshProfile
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
