import { router } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

export default function IndexPage() {
    useEffect(() => {
        // Always redirect to login page
        console.log('Index: Redirecting to login page');
        router.replace('/login');
    }, []);

    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.text}>Redirecting to login...</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
    },
    text: {
        marginTop: 20,
        fontSize: 16,
        color: '#666',
    },
});

