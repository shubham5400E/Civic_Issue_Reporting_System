// app/map.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

const { width, height } = Dimensions.get('window');

export default function MapScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [markers, setMarkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchMarkers = async () => {
      try {
        setLoading(true);
        // Query issues for this user — ensure your table has latitude & longitude columns
        const { data, error } = await supabase
          .from('issues')
          .select('issue_id, issue_title, issue_category, latitude, longitude, status, created_at')
          .eq('citizen_id', user?.id)
          .not('latitude', 'is', null)
          .not('longitude', 'is', null)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Supabase fetch markers error:', error);
          setMarkers([]);
          return;
        }
        if (mounted && data) {
          const mapped = data.map((r: any) => ({
            id: r.issue_id,
            title: r.issue_title,
            category: r.issue_category,
            latitude: Number(r.latitude),
            longitude: Number(r.longitude),
            status: r.status,
          }));
          setMarkers(mapped);
        }
      } catch (err) {
        console.error('fetch markers', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchMarkers();
    return () => { mounted = false; };
  }, [user?.id]);

  // default region (India center) — replaced by first marker if exists
  const defaultRegion = {
    latitude: markers.length ? markers[0].latitude : 20.5937,
    longitude: markers.length ? markers[0].longitude : 78.9629,
    latitudeDelta: 5,
    longitudeDelta: 5,
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 30 }} />
      ) : (
        <MapView style={styles.map} initialRegion={defaultRegion}>
          {markers.map((m) => (
            <Marker
              key={m.id}
              coordinate={{ latitude: m.latitude, longitude: m.longitude }}
              title={m.title}
              description={m.category}
              onPress={() => {
                // Optional: navigate to issue details page if you have one
                // router.push({ pathname: '/issue-details', params: { id: m.id } });
              }}
            />
          ))}
        </MapView>
      )}

      <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.8}>
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  backButton: {
    position: 'absolute',
    top: 48,
    left: 16,
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    elevation: 4,
  },
  backButtonText: { fontSize: 16, color: '#333' },
});
