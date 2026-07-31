import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, TouchableOpacity } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { LinearGradient } from 'expo-linear-gradient';

interface NotificationItem {
  id: string;
  issue_title: string;
  message: string;
  created_at: string;
}

export default function NotificationScreen() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('notification_id, issue_title, message, created_at, is_read')
        .eq('citizen_id', user?.id)
        .order('created_at', { ascending: false });
      if (error) {
        console.error('Error fetching notifications:', error?.message);
        setLoading(false);
        return;
      }
      // If any notification is not read, mark all as read
      const unreadIds = (data || []).filter((item: any) => !item.is_read).map((item: any) => item.notification_id);
      if (unreadIds.length > 0) {
        await supabase
          .from('notifications')
          .update({ is_read: true })
          .in('notification_id', unreadIds);
      }
      // Map notification_id to id for NotificationItem type
      const mapped = (data || []).map((item: any) => ({
        id: item.notification_id,
        issue_title: item.issue_title,
        message: item.message,
        created_at: item.created_at,
      }));
      setNotifications(mapped);
    } catch (err) {
      console.error('Fetch notifications error:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: NotificationItem }) => (
    <LinearGradient colors={['#f5f6fa', '#e0e7ff']} style={styles.card}>
      <Text style={styles.title}>{item.issue_title}</Text>
      <Text style={styles.message}>{item.message}</Text>
      <Text style={styles.date}>{new Date(item.created_at).toLocaleString()}</Text>
    </LinearGradient>
  );
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Notifications</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#667eea" style={{ marginTop: 40 }} />
      ) : notifications.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🔔</Text>
          <Text style={styles.emptyText}>No notifications yet</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 16 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f6fa' },
  header: { fontSize: 24, fontWeight: '700', color: '#667eea', textAlign: 'center', marginTop: 40, marginBottom: 16 },
  card: {
    borderRadius: 14,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  title: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 6 },
  message: { fontSize: 14, color: '#555', marginBottom: 8 },
  date: { fontSize: 12, color: '#999', textAlign: 'right' },
  emptyState: { alignItems: 'center', marginTop: 80 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 16, fontWeight: '600', color: '#888' },
});
