import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';
import { storage } from './storage';

const supabaseUrl = 'https://rnwzravumeouzrvneahg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJud3pyYXZ1bWVvdXpydm5lYWhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzMDA3ODYsImV4cCI6MjA3Mzg3Njc4Nn0.FnK-0jK8OeMGyCn51LLQkVNn88aGI19lhbHuIGC_GjE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: storage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});
