import { router, useSegments } from 'expo-router';
import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
    const { session, loading } = useAuth();
    const segments = useSegments();

    React.useEffect(() => {
        console.log('AuthWrapper: Auth state changed', {
            loading,
            hasSession: !!session,
            segments: segments[0]
        });

        if (loading) return;

        const isAuthScreen = segments[0] === 'login' || segments[0] === 'signup';
        const isDashboard = segments[0] === 'dashboard';

        if (!session && !isAuthScreen) {
            // User is not authenticated and not on auth screen, redirect to login
            console.log('AuthWrapper: No session, redirecting to login');
            router.replace('/login');
        } else if (session && isAuthScreen) {
            // User is authenticated but on auth screen, redirect to dashboard
            console.log('AuthWrapper: Has session, redirecting to dashboard');
            router.replace('/dashboard');
        }
    }, [session, segments, loading]);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    return <>{children}</>;
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
    },
});


