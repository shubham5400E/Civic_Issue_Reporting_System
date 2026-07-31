import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { TextInput, RefreshControl } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    FlatList,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

const { width, height } = Dimensions.get('window');

interface UserIssue {
    id: string;
    title: string;
    category: string;
    status: 'pending' | 'in-progress' | 'resolved';
    location: string;
    date: string;
    priority: 'low' | 'medium' | 'high';
    latitude?: number;
    longitude?: number;
}

export default function DashboardScreen() {
    const { user, signOut } = useAuth();
    const [logoutLoading, setLogoutLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'home' | 'map' | 'profile'>('home');
    const [userIssues, setUserIssues] = useState<UserIssue[]>([]);
    const [loadingIssues, setLoadingIssues] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchUserIssues();
    }, []);

    // Refresh when navigating back to this screen
   useFocusEffect(
  useCallback(() => {
    refreshIssues();
  }, [])
);

    const getTimeAgo = (dateString: string) => {
        const now = new Date();
        const date = new Date(dateString);
        const diffMs = now.getTime() - date.getTime();
        const diffSeconds = Math.floor(diffMs / 1000);
        const diffMinutes = Math.floor(diffSeconds / 60);
        const diffHours = Math.floor(diffMinutes / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffDays > 1) return `${diffDays} days ago`;
        if (diffDays === 1) return '1 day ago';
        if (diffHours > 1) return `${diffHours} hours ago`;
        if (diffHours === 1) return '1 hour ago';
        if (diffMinutes > 1) return `${diffMinutes} minutes ago`;
        if (diffMinutes === 1) return '1 minute ago';
        return 'Just now';
    };

    const fetchUserIssues = async () => {
        try {
            setLoadingIssues(true);
            const { data, error } = await supabase
                .from('issues')
                .select('*')
                .eq('citizen_id', user?.id)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching issues:', error.message);
                setLoadingIssues(false);
                return;
            }

            if (data) {
                const mappedIssues: UserIssue[] = data.map((item: any) => ({
                    id: item.issue_id,
                    title: item.issue_title,
                    category: item.issue_category,
                    status: item.status,
                    location: item.location,
                    date: getTimeAgo(item.created_at),
                    priority: item.priority,
                    latitude: item.latitude,
                    longitude: item.longitude,
                }));
                setUserIssues(mappedIssues);
            }
        } catch (err) {
            console.error('Fetch issues error:', err);
        } finally {
            setLoadingIssues(false);
        }
    };

    const refreshIssues = async () => {
        setRefreshing(true);
        await fetchUserIssues();
        setRefreshing(false);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return '#FF9500';
            case 'in-progress': return '#007AFF';
            case 'resolved': return '#34C759';
            default: return '#8E8E93';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending': return '⏳';
            case 'in-progress': return '⚡';
            case 'completed': return '✅';
            default: return '❓';
        }
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'Roads & Traffic': return '🚧';
            case 'Water Supply': return '💧';
            case 'Street Lights': return '💡';
            case 'Waste Management': return '🗑️';
            default: return '📋';
        }
    };

    const handleReportIssue = () => router.push('/report-issue');

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                        setLogoutLoading(true);
                        try { await signOut(); } 
                        catch (error) { console.error('Logout error:', error); setLogoutLoading(false); }
                    },
                },
            ]
        );
    };

  const renderIssueItem = ({ item }: { item: UserIssue }) => (
  <TouchableOpacity style={styles.issueItem} activeOpacity={0.8}>
    <View style={styles.issueHeader}>
      <View style={styles.issueTitleContainer}>
        <Text style={styles.categoryIcon}>{getCategoryIcon(item.category)}</Text>
        <View style={styles.issueTitleText}>
          <Text style={styles.issueTitle} numberOfLines={2}>{item.title}</Text>
          <Text style={styles.issueCategory}>{item.category}</Text>
        </View>
      </View>
      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
        <Text style={styles.statusIcon}>{getStatusIcon(item.status)}</Text>
      </View>
    </View>

    <View style={styles.issueDetails}>
      <Text style={styles.issueLocation}>📍 {item.location}</Text>
      <Text style={styles.issueDate}>🕒 {item.date}</Text>
    </View>
  </TouchableOpacity>
);

    const HomeFragment = () => (
        <FlatList
            data={userIssues}
            renderItem={renderIssueItem}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.content}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={refreshIssues} />
            }
            ListHeaderComponent={
                <>
                    <View style={styles.reportSection}>
                        <TouchableOpacity style={styles.reportButton} onPress={handleReportIssue} activeOpacity={0.8}>
                            <LinearGradient colors={['#FF6B6B', '#FF8E8E']} style={styles.reportButtonGradient}>
                                <Text style={styles.reportButtonIcon}>📝</Text>
                                <Text style={styles.reportButtonText}>Report New Issue</Text>
                                <Text style={styles.reportButtonSubtext}>Help make your community better</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.sectionTitle}>Your Reported Issues</Text>
                </>
            }
            ListEmptyComponent={
                loadingIssues ? (
                    <ActivityIndicator size="large" color="#667eea" style={{ marginTop: 20 }} />
                ) : (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyStateIcon}>📋</Text>
                        <Text style={styles.emptyStateText}>No issues reported yet</Text>
                        <Text style={styles.emptyStateSubtext}>Report your first civic issue to get started</Text>
                    </View>
                )
            }
        />
    );

    const MapFragment = () => (
        <MapView
            style={{ flex: 1 }}
            initialRegion={{
                latitude: Number(userIssues[0]?.latitude) || 20.5937,
                longitude: Number(userIssues[0]?.longitude) || 78.9629,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
            }}
        >
            {userIssues
                .filter(item => item.latitude != null && item.longitude != null)
                .map(item => (
                    <Marker
                        key={item.id}
                        coordinate={{
                            latitude: Number(item.latitude),
                            longitude: Number(item.longitude),
                        }}
                        title={item.title}
                        description={item.category}
                    />
                ))}
        </MapView>
    );

    const ProfileFragment = () => {
        const [name, setName] = useState('');
        const [mobile, setMobile] = useState('');
        const [loading, setLoading] = useState(true);
        const [saving, setSaving] = useState(false);

        const fetchProfile = async () => {
            try {
                setLoading(true);
                const { data, error } = await supabase
                    .from('profiles')
                    .select('name, mobile')
                    .eq('id', user?.id)
                    .single();
                if (error && error.code !== 'PGRST116') {
                    console.error('Profile fetch error:', error.message);
                    return;
                }
                if (data) {
                    setName(data.name || '');
                    setMobile(data.mobile || '');
                }
            } catch (err) {
                console.error('Profile fetch exception:', err);
            } finally {
                setLoading(false);
            }
        };

        useEffect(() => { fetchProfile(); }, []);

        const handleSave = async () => {
            if (!name || !mobile) {
                Alert.alert('Validation', 'Name and Mobile cannot be empty.');
                return;
            }
            try {
                setSaving(true);
                // Update name and mobile in profiles table
                const { error: profileError } = await supabase
                    .from('profiles')
                    .upsert({ id: user?.id, name: name, mobile }, { onConflict: 'id' });
                if (profileError) {
                    console.error('Profile save error:', profileError.message);
                    Alert.alert('Error', 'Failed to save profile.');
                    return;
                }

                // Update name in issues table for all issues with this citizen_id
                const { error: issuesError } = await supabase
                    .from('issues')
                    .update({ name: name })
                    .eq('citizen_id', user?.id);
                if (issuesError) {
                    console.error('Issues name update error:', issuesError.message);
                    Alert.alert('Error', 'Failed to update name.');
                    return;
                }

                Alert.alert('Success', 'name updated successfully!');
            } catch (err) {
                console.error('Profile save exception:', err);
            } finally {
                setSaving(false);
            }
        };

        if (loading) return <ActivityIndicator style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} size="large" color="#667eea" />;

        return (
            <ScrollView contentContainerStyle={{ padding: 20 }}>
                <View style={{ alignItems: 'center', marginBottom: 30 }}>
                    <Text style={{ fontSize: 48 }}>👤</Text>
                    <Text style={{ fontSize: 20, fontWeight: '600', marginTop: 10 }}>Profile</Text>
                </View>

                <View style={{ marginBottom: 20 }}>
                    <Text style={{ marginBottom: 6, fontWeight: '500' }}>Full Name</Text>
                    <View style={{ backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: '#ccc' }}>
                        <TextInput value={name} onChangeText={setName} placeholder="Enter your full name" style={{ fontSize: 16 }} />
                    </View>
                </View>

                <View style={{ marginBottom: 20 }}>
                    <Text style={{ marginBottom: 6, fontWeight: '500' }}>Email</Text>
                    <View style={{ backgroundColor: '#f0f0f0', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 }}>
                        <Text style={{ fontSize: 16 }}>{user?.email}</Text>
                    </View>
                </View>

                <View style={{ marginBottom: 30 }}>
                    <Text style={{ marginBottom: 6, fontWeight: '500' }}>Mobile</Text>
                    <View style={{ backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: '#ccc' }}>
                        <TextInput value={mobile} onChangeText={setMobile} placeholder="Enter your mobile number" keyboardType="phone-pad" style={{ fontSize: 16 }} />
                    </View>
                </View>

                <TouchableOpacity onPress={handleSave} activeOpacity={0.8}>
                    <LinearGradient colors={['#667eea', '#764ba2']} style={{ padding: 16, borderRadius: 12, alignItems: 'center' }}>
                        {saving ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Save Changes</Text>}
                    </LinearGradient>
                </TouchableOpacity>
            </ScrollView>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#667eea" />
            <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
                <View style={styles.headerContent}>
                    <View style={styles.headerLeft}>
                        <Text style={styles.headerTitle}>Civic Connect</Text>
                        <Text style={styles.headerSubtitle}>
                            Hello, {user?.user_metadata?.name || user?.email?.split('@')[0]}!
                        </Text>
                    </View>
                    <View style={styles.headerRight}>
                        <TouchableOpacity 
                          style={styles.notificationButton} 
                          activeOpacity={0.7}
                          onPress={() => router.push('/notification')}
                        >
                            <Text style={styles.notificationIcon}>🔔</Text>
                            <View style={styles.notificationBadge}>
                                <Text style={styles.notificationBadgeText}>3</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.7}>
                            {logoutLoading ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.logoutIcon}>🚪</Text>}
                        </TouchableOpacity>
                    </View>
                </View>
            </LinearGradient>

            <View style={{ flex: 1 }}>
                {activeTab === 'home' && <HomeFragment />}
                {activeTab === 'map' && <MapFragment />}
                {activeTab === 'profile' && <ProfileFragment />}
            </View>

            <View style={styles.bottomNav}>
                <TouchableOpacity style={[styles.navItem, activeTab === 'home' && styles.navItemActive]} onPress={() => setActiveTab('home')} activeOpacity={0.7}>
                    <Text style={[styles.navIcon, activeTab === 'home' && styles.navIconActive]}>🏠</Text>
                    <Text style={[styles.navLabel, activeTab === 'home' && styles.navLabelActive]}>Home</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.navItem, activeTab === 'map' && styles.navItemActive]} onPress={() => setActiveTab('map')} activeOpacity={0.7}>
                    <Text style={[styles.navIcon, activeTab === 'map' && styles.navIconActive]}>🗺️</Text>
                    <Text style={[styles.navLabel, activeTab === 'map' && styles.navLabelActive]}>Map</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.navItem, activeTab === 'profile' && styles.navItemActive]} onPress={() => setActiveTab('profile')} activeOpacity={0.7}>
                    <Text style={[styles.navIcon, activeTab === 'profile' && styles.navIconActive]}>👤</Text>
                    <Text style={[styles.navLabel, activeTab === 'profile' && styles.navLabelActive]}>Profile</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

// Add your existing styles below
const styles = StyleSheet.create({
    issueItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  issueHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  issueTitleContainer: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 12 },
  categoryIcon: { fontSize: 28, marginRight: 12 },
  issueTitleText: { flex: 1 },
  issueTitle: { fontSize: 16, fontWeight: '600', color: '#333', lineHeight: 20 },
  issueCategory: { fontSize: 14, color: '#666', marginTop: 2 },
  statusBadge: { borderRadius: 16, width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  statusIcon: { fontSize: 18, color: '#fff' },
  issueDetails: { marginTop: 6 },
  issueLocation: { fontSize: 13, color: '#666', marginBottom: 4 },
  issueDate: { fontSize: 12, color: '#999' },
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    header: { paddingTop: 40, paddingBottom: 20, paddingHorizontal: 16 },
    headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    headerLeft: {},
    headerTitle: { fontSize: 24, fontWeight: '700', color: '#fff' },
    headerSubtitle: { fontSize: 14, color: '#f0f0f0' },
    headerRight: { flexDirection: 'row', alignItems: 'center' },
    notificationButton: { marginRight: 12 },
    notificationIcon: { fontSize: 24 },
    notificationBadge: { position: 'absolute', top: -6, right: -6, backgroundColor: 'red', borderRadius: 8, paddingHorizontal: 4 },
    notificationBadgeText: { color: '#fff', fontSize: 10 },
    logoutButton: {},
    logoutIcon: { fontSize: 24 },
    bottomNav: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 12, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#ddd' },
    navItem: { alignItems: 'center' },
    navItemActive: {},
    navIcon: { fontSize: 24, color: '#888' },
    navIconActive: { color: '#667eea' },
    navLabel: { fontSize: 12, color: '#888' },
    navLabelActive: { color: '#667eea', fontWeight: '600' },
    content: { paddingHorizontal: 16, paddingBottom: 20 },
    reportSection: { marginVertical: 20 },
    reportButton: {},
    reportButtonGradient: { padding: 16, borderRadius: 12 },
    reportButtonIcon: { fontSize: 24, marginBottom: 8 },
    reportButtonText: { fontSize: 16, fontWeight: '600', color: '#fff' },
    reportButtonSubtext: { fontSize: 12, color: '#fff', marginTop: 4 },
    sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
    emptyState: { alignItems: 'center', marginTop: 50 },
    emptyStateIcon: { fontSize: 48, marginBottom: 12 },
    emptyStateText: { fontSize: 16, fontWeight: '600' },
    emptyStateSubtext: { fontSize: 12, color: '#555', textAlign: 'center', marginTop: 4 },
});
