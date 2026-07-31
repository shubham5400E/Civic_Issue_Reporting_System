import { router } from 'expo-router';
import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export default function DebugScreen() {
    const { session, user, loading } = useAuth();

    const clearEverything = async () => {
        try {
            console.log('Debug: Clearing everything...');

            // Clear Supabase session
            await supabase.auth.signOut();

            // Clear localStorage
            if (typeof window !== 'undefined' && window.localStorage) {
                window.localStorage.clear();
                console.log('Debug: localStorage cleared');
            }

            // Clear sessionStorage
            if (typeof window !== 'undefined' && window.sessionStorage) {
                window.sessionStorage.clear();
                console.log('Debug: sessionStorage cleared');
            }

            Alert.alert('Success', 'Everything cleared! Redirecting to login...');

            // Force redirect to login
            router.replace('/login');

        } catch (error) {
            console.error('Debug: Error clearing:', error);
            Alert.alert('Error', 'Failed to clear session: ' + error.message);
        }
    };

    const goToLogin = () => {
        console.log('Debug: Going to login page');
        router.replace('/login');
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>🔧 Debug Page</Text>

            <View style={styles.info}>
                <Text style={styles.infoText}>Session: {session ? '✅ Active' : '❌ None'}</Text>
                <Text style={styles.infoText}>User: {user ? '✅ Logged in' : '❌ Not logged in'}</Text>
                <Text style={styles.infoText}>Loading: {loading ? '⏳ Yes' : '✅ No'}</Text>
            </View>

            <TouchableOpacity style={styles.button} onPress={goToLogin}>
                <Text style={styles.buttonText}>🚀 Go to Login Page</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.button, styles.clearButton]} onPress={clearEverything}>
                <Text style={styles.buttonText}>🧹 Clear Everything & Go to Login</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.button, styles.backButton]} onPress={() => router.back()}>
                <Text style={styles.buttonText}>← Go Back</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#f0f0f0',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 30,
        color: '#333',
    },
    info: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        marginBottom: 30,
        width: '100%',
        maxWidth: 300,
    },
    infoText: {
        fontSize: 16,
        marginBottom: 10,
        color: '#333',
    },
    button: {
        backgroundColor: '#007AFF',
        padding: 15,
        borderRadius: 10,
        marginBottom: 15,
        width: '100%',
        maxWidth: 300,
    },
    clearButton: {
        backgroundColor: '#FF3B30',
    },
    backButton: {
        backgroundColor: '#666',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
});

