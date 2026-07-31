import { Session, User } from '@supabase/supabase-js';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface AuthContextType {
    session: Session | null;
    user: User | null;
    loading: boolean;
    setSession: (session: Session | null) => void;
    setUser: (user: User | null) => void;
    signUp: (email: string, password: string, name: string, mobile: string) => Promise<{ error: any }>;
    signIn: (email: string, password: string) => Promise<{ error: any }>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((event, session) => {
            console.log('AuthContext: Auth state changed:', event, session ? 'User logged in' : 'User logged out');
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
            // AuthWrapper will handle routing based on session state
        });

        return () => subscription.unsubscribe();
    }, []);

    const signUp = async (email: string, password: string, name: string, mobile: string) => {
        try {
            console.log('AuthContext: Attempting to sign up with:', { email, name, mobile });

            // Validate email format more strictly
            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if (!emailRegex.test(email)) {
                console.error('AuthContext: Invalid email format:', email);
                return { error: { message: 'Please enter a valid email address' } };
            }

            // Check for common invalid domains
            const invalidDomains = ['example.com', 'test.com', 'localhost'];
            const domain = email.split('@')[1]?.toLowerCase();
            if (invalidDomains.includes(domain)) {
                console.error('AuthContext: Invalid email domain:', domain);
                return { error: { message: 'Please use a valid email address' } };
            }

            console.log('AuthContext: Email validation passed, proceeding with signup...');

            const { data, error } = await supabase.auth.signUp({
                email: email.trim().toLowerCase(), // Normalize email
                password,
                options: {
                    data: {
                        name,
                        mobile: mobile,
                    },
                },
            });

            console.log('AuthContext: Sign up result:', { data, error });

            if (error) {
                console.error('AuthContext: Supabase signup error details:', {
                    message: error.message,
                    status: error.status,
                });
                return { error };
            }

            // Insert additional user data into profiles table
            if (data.user) {
                console.log('AuthContext: Creating profile for user:', data.user.id);
                const { error: profileError } = await supabase
                    .from('profiles')
                    .insert([
                        {
                            id: data.user.id,
                            name,
                            mobile: mobile,
                        },
                    ]);

                if (profileError) {
                    console.error('Error creating profile:', profileError);
                } else {
                    console.log('AuthContext: Profile created successfully');
                }
            }

            return { error: null };
        } catch (error) {
            console.error('AuthContext: Sign up error:', error);
            return { error };
        }
    };

    const signIn = async (email: string, password: string) => {
        try {
            console.log('AuthContext: Attempting to sign in with:', email);
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            console.log('AuthContext: Sign in result:', { data, error });
            return { error };
        } catch (error) {
            console.error('AuthContext: Sign in error:', error);
            return { error };
        }
    };

    const signOut = async () => {
        try {
            console.log('AuthContext: Signing out...');

            // Clear the session state immediately
            setSession(null);
            setUser(null);

            // Sign out from Supabase
            const { error } = await supabase.auth.signOut();

            if (error) {
                console.error('AuthContext: Sign out error:', error);
                throw error;
            }

            console.log('AuthContext: Sign out successful');

            // Force redirect to login page
            const { router } = await import('expo-router');
            router.replace('/login');

        } catch (error) {
            console.error('Error signing out:', error);
            // Even if there's an error, clear the local state
            setSession(null);
            setUser(null);
        }
    };

    const value = {
        session,
        user,
        loading,
        setSession,
        setUser,
        signUp,
        signIn,
        signOut,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};


