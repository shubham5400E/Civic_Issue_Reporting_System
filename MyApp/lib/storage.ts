import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Create a storage adapter that works for both web and mobile
const createStorage = () => {
    if (Platform.OS === 'web') {
        // Web storage using localStorage
        return {
            getItem: async (key: string) => {
                if (typeof window !== 'undefined' && window.localStorage) {
                    try {
                        return window.localStorage.getItem(key);
                    } catch (error) {
                        console.warn('Error getting item from localStorage:', error);
                        return null;
                    }
                }
                return null;
            },
            setItem: async (key: string, value: string) => {
                if (typeof window !== 'undefined' && window.localStorage) {
                    try {
                        window.localStorage.setItem(key, value);
                    } catch (error) {
                        console.warn('Error setting item in localStorage:', error);
                    }
                }
            },
            removeItem: async (key: string) => {
                if (typeof window !== 'undefined' && window.localStorage) {
                    try {
                        window.localStorage.removeItem(key);
                    } catch (error) {
                        console.warn('Error removing item from localStorage:', error);
                    }
                }
            },
        };
    } else {
        // Mobile storage using AsyncStorage
        return AsyncStorage;
    }
};

export const storage = createStorage();

