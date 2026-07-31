import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import MapView, { PROVIDER_GOOGLE, Region } from "react-native-maps";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useLocation } from "../contexts/LocationContext"; 

export default function MapPicker() {
  const { setLocation } = useLocation();
  const router = useRouter();
  const mapRef = useRef<MapView | null>(null);
  const [region, setRegion] = useState<Region | null>(null);
  const [address, setAddress] = useState<string>("Fetching address...");
  const [loading, setLoading] = useState(true);

  // Get user location on mount
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setAddress("Permission denied");
        setLoading(false);
        return;
      }

      let loc = await Location.getCurrentPositionAsync({});
      const initialRegion: Region = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      setRegion(initialRegion);
      setLoading(false);
    })();
  }, []);

  // Reverse geocode when region changes
  const handleRegionChange = async (reg: Region) => {
    setRegion(reg);
    try {
      const geocode = await Location.reverseGeocodeAsync({
        latitude: reg.latitude,
        longitude: reg.longitude,
      });
      if (geocode.length > 0) {
        const addr = geocode[0];
        setAddress(
          `${addr.name || ""} ${addr.street || ""}, ${addr.city || ""}, ${addr.region || ""}`
        );
      }
    } catch (err) {
      setAddress("Unable to fetch address");
    }
  };

  const handleConfirm = () => {
    if (region) {
        setLocation({
  address,
  coords: {
    latitude: region.latitude.toFixed(5),
    longitude: region.longitude.toFixed(5),
  },
});

      router.back(); // go back to report-issue
      // You can also store location in AsyncStorage or Context for ReportIssue
      console.log("Selected Location:", region, address);
    }
  };

  if (loading || !region) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text>Loading map...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={{ flex: 1 }}
        initialRegion={region}
        onRegionChangeComplete={handleRegionChange}
      />

      {/* Static pin at center */}
      <View style={styles.pinContainer}>
        <Ionicons name="location-sharp" size={40} color="red" />
      </View>

      {/* Address Display */}
      <View style={styles.addressBox}>
        <Text style={{ fontSize: 14, fontWeight: "500" }}>{address}</Text>
      </View>

      {/* Confirm Button */}
      <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm}>
        <Text style={styles.confirmText}>Confirm Location</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  pinContainer: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginLeft: -20,
    marginTop: -40,
  },
  addressBox: {
    position: "absolute",
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: "white",
    padding: 12,
    borderRadius: 10,
    elevation: 3,
    alignItems: "center",
  },
  confirmBtn: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    backgroundColor: "#007AFF",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  confirmText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
