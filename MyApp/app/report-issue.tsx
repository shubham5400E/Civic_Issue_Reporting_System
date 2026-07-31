import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Image,
  Dimensions, Alert, ActivityIndicator
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import type { Region } from 'react-native-maps';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, FontAwesome5, Entypo } from '@expo/vector-icons';
import { useLocation } from '../contexts/LocationContext';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '../lib/supabase'; 

const CLOUDINARY_CLOUD_NAME = "dqvw1zfyd"; // Replace with your cloud name
const CLOUDINARY_UPLOAD_PRESET = "issue_images";


const { width } = Dimensions.get('window');

const categories = [
  { id: 'pothole', label: 'Pothole', icon: 'road' },
  { id: 'streetlight', label: 'Streetlight', icon: 'lightbulb' },
  { id: 'garbage', label: 'Garbage', icon: 'trash' },
  { id: 'water', label: 'Water', icon: 'tint' },
  { id: 'electricity', label: 'Electricity', icon: 'bolt' },
  { id: 'park', label: 'Park', icon: 'tree' },
];

export default function ReportIssueScreen() {
  // Track full region for interactive mini map
  const [miniMapRegion, setMiniMapRegion] = useState<Region | null>(null);
  const router = useRouter();
  const { location, setLocation } = useLocation();
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);

  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [step, setStep] = useState(1);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [selectOnMiniMap, setSelectOnMiniMap] = useState(false);
const [priority, setPriority] = useState<'low' | 'medium' | 'high' | null>(null);

const [loadingSubmit, setLoadingSubmit] = useState(false);
const [uploadProgress, setUploadProgress] = useState<number[]>([]); // store progress for each image
const [loadingSelectLocation, setLoadingSelectLocation] = useState(false);

const uriToBuffer = async (uri: string) => {
  const response = await fetch(uri);
  const arrayBuffer = await response.arrayBuffer(); // get raw bytes
  return Buffer.from(arrayBuffer); // convert to Node buffer for Supabase
};

  // Get params from map-picker
  const params = useLocalSearchParams();
  const selectedLocationRef = React.useRef<{ latitude: number; longitude: number; address: string } | null>(null);
  useFocusEffect(
    React.useCallback(() => {
      if (params.lat && params.lng && params.address) {
        const newCoords = { latitude: parseFloat(params.lat as string), longitude: parseFloat(params.lng as string) };
        selectedLocationRef.current = {
          latitude: newCoords.latitude,
          longitude: newCoords.longitude,
          address: params.address as string,
        };
        setCoords(newCoords);
        setLocation({ address: params.address as string, coords: { latitude: params.lat as string, longitude: params.lng as string } });
      } else if (selectedLocationRef.current) {
        // Use the previously selected location if available
        setCoords({
          latitude: selectedLocationRef.current.latitude,
          longitude: selectedLocationRef.current.longitude,
        });
        setLocation({
          address: selectedLocationRef.current.address,
          coords: {
            latitude: selectedLocationRef.current.latitude.toString(),
            longitude: selectedLocationRef.current.longitude.toString(),
          },
        });
      }
    }, [params])
  );

  // Always update mini map marker when locationBox text changes
  useEffect(() => {
    if (location?.coords?.latitude && location?.coords?.longitude) {
      setCoords({
        latitude: parseFloat(location.coords.latitude),
        longitude: parseFloat(location.coords.longitude),
      });
    }
  }, [location]);

  useEffect(() => {
    if (selectedImages.length > 0 && step < 2) setStep(2);
    if (selectedCategory && step < 3) setStep(3);
    if (title && description && step < 4) setStep(4);
  }, [selectedImages, selectedCategory, title, description]);

  useEffect(() => {
    // Only fetch current location if no selected location exists
    if (!selectedLocationRef.current) {
      getCurrentLocation();
    }
  }, [selectedLocationRef.current]);

  const getCurrentLocation = async () => {
    try {
      setLoadingLocation(true);
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required.');
        setLoadingLocation(false);
        return;
      }
      let loc = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = loc.coords;
      setCoords({ latitude, longitude });

      let addressData = await Location.reverseGeocodeAsync({ latitude, longitude });
      let addressText = addressData[0]
        ? `${addressData[0].name || ''}, ${addressData[0].street || ''}, ${addressData[0].city || ''}`
        : `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
      setLocation({ address: addressText, coords: { latitude: latitude.toString(), longitude: longitude.toString() } });
    } catch (error) {
      Alert.alert('Error', 'Unable to fetch location.');
    } finally {
      setLoadingLocation(false);
    }
  };

  // Replace your handleAddPhoto with this:
const handleAddPhoto = async () => {
  if (selectedImages.length >= 3) {
    Alert.alert("Limit Reached", "You can only upload a maximum of 3 images.");
    return;
  }

  Alert.alert(
    "Upload Photo",
    "Choose an option",
    [
      {
        text: "Camera",
        onPress: async () => {
          let result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.5,
          });
          if (!result.canceled) {
            const uris = result.assets.map(asset => asset.uri);
            const remainingSlots = 3 - selectedImages.length;
            setSelectedImages([...selectedImages, ...uris.slice(0, remainingSlots)]);
          }
        },
      },
      {
        text: "Gallery",
        onPress: async () => {
          let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true,
            quality: 0.5,
          });
          if (!result.canceled) {
            const uris = result.assets.map(asset => asset.uri);
            const remainingSlots = 3 - selectedImages.length;
            setSelectedImages([...selectedImages, ...uris.slice(0, remainingSlots)]);
          }
        },
      },
      { text: "Cancel", style: "cancel" },
    ],
    { cancelable: true }
  );
};


 const handleSelectCurrentLocation = async () => {
  try {
    setLoadingSelectLocation(true); // start loading
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Location permission is required.');
      return;
    }
    let loc = await Location.getCurrentPositionAsync({});
    const { latitude, longitude } = loc.coords;

    if (
      coords &&
      Math.abs(coords.latitude - latitude) < 0.00001 &&
      Math.abs(coords.longitude - longitude) < 0.00001
    ) {
      Alert.alert('Info', 'Already using your current location.');
      return;
    }

    setCoords({ latitude, longitude });
    setMiniMapRegion({
      latitude,
      longitude,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005,
    });

    let addressData = await Location.reverseGeocodeAsync({ latitude, longitude });
    let addressText = addressData[0]
      ? `${addressData[0].name || ''}, ${addressData[0].street || ''}, ${addressData[0].city || ''}`
      : `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;

    setLocation({ address: addressText, coords: { latitude: latitude.toString(), longitude: longitude.toString() } });

    if (selectOnMiniMap) setSelectOnMiniMap(false);

  } catch (error) {
    Alert.alert('Error', 'Unable to fetch location.');
  } finally {
    setLoadingSelectLocation(false); // stop loading
  }
};

const uploadImage = async (uri: string) => {
  try {
    const formData = new FormData();
    formData.append('file', {
      uri: uri,
      type: 'image/jpeg',
      name: `image_${Date.now()}.jpg`,
    } as any);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    
    const data = await response.json();
    return data.secure_url; // This is your image URL
  } catch (error) {
    throw error;
  }
};

// 3. Update your handleSubmit (replace the image upload section):
const handleSubmit = async () => {
  if (!selectedImages.length || !selectedCategory || !title || !description || !priority) {
    Alert.alert('Incomplete', 'Please fill all required fields and select priority.');
    return;
  }

  setLoadingSubmit(true);
  setUploadProgress(Array(selectedImages.length).fill(0));

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      Alert.alert('Not logged in', 'Please login to submit an issue.');
      setLoadingSubmit(false);
      return;
    }

    // Fetch user's name from profiles table
    let userName = '';
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', user.id)
      .single();
    if (profileError) {
      console.error('Error fetching user name:', profileError.message);
    } else {
      userName = profileData?.name || '';
    }

    // Upload images to Cloudinary (instead of Supabase)
    const imageUrls: string[] = [];
    for (let i = 0; i < selectedImages.length; i++) {
      const uri = selectedImages[i];
      const imageUrl = await uploadImage(uri); // Using Cloudinary now
      imageUrls.push(imageUrl);
      
      // Update progress
      setUploadProgress(prev => {
        const newProgress = [...prev];
        newProgress[i] = 100;
        return newProgress;
      });
    }

    // Save to database (same as before), now with name
    const { data: insertData, error: insertError } = await supabase
      .from('issues')
      .insert([{
        citizen_id: user.id,
        name: userName,
        issue_category: selectedCategory,
        issue_title: title,
        description,
        priority,
        location: location?.address || null,
        latitude: coords?.latitude.toString() || null,
        longitude: coords?.longitude.toString() || null,
        image_urls: imageUrls, // Cloudinary URLs
      }])
      .select()
      .single();

    if (insertError) throw insertError;

    Alert.alert('Success', 'Your issue has been submitted successfully.');
    
    // Reset form
    setSelectedImages([]);
    setSelectedCategory(null);
    setTitle('');
    setDescription('');
    setPriority(null);
    setUploadProgress([]);
    
  } catch (error: any) {
    Alert.alert('Error', error.message || 'Something went wrong.');
  } finally {
    setLoadingSubmit(false);
  }
};



  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Title & Description */}
      <Text style={styles.sectionTitle}>Issue Title</Text>
      <TextInput
        style={styles.input}
        placeholder="Short title of the issue"
        value={title}
        onChangeText={setTitle}
      />

      <Text style={styles.sectionTitle}>Description</Text>
      <TextInput
        style={[styles.input, { height: 120 }]}
        placeholder="Describe the problem in detail"
        value={description}
        onChangeText={setDescription}
        multiline
      />

      {/* Category Selection */}
      <Text style={styles.sectionTitle}>Issue Category</Text>
      <View style={styles.categoryGrid}>
        {categories.map(cat => (
          <TouchableOpacity
            key={cat.id}
            style={[styles.categoryCard, selectedCategory === cat.id && styles.categorySelected]}
            onPress={() => setSelectedCategory(cat.id)}
            activeOpacity={0.8}
          >
            <FontAwesome5
              name={cat.icon}
              size={24}
              color={selectedCategory === cat.id ? '#fff' : '#667eea'}
            />
            <Text style={[styles.categoryLabel, selectedCategory === cat.id && { color: '#fff' }]}>
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

{/* ✅ Priority Section */}
<View style={{ marginTop: 0 }}>
  <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 12 }}>
    Priority Level
  </Text>

  {[
    { key: 'low', title: 'Low Priority', desc: 'Minor issue that can wait', color: 'green' },
    { key: 'medium', title: 'Medium Priority', desc: 'Issue that needs attention soon', color: 'orange' },
    { key: 'high', title: 'High Priority', desc: 'Urgent issue requiring immediate action', color: 'red' },
  ].map(item => (
    <TouchableOpacity
      key={item.key}
      onPress={() => setPriority(item.key as 'low' | 'medium' | 'high')}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 8,
        marginBottom: 10,
        borderWidth: 2,
        borderColor: priority === item.key ? item.color : '#d0d0d0ff', // highlight selected
        backgroundColor: priority === item.key ? `${item.color}15` : '#fff', // light tint when active
      }}
    >
      {/* Radio circle */}
      <View
        style={{
          height: 22,
          width: 22,
          borderRadius: 11,
          borderWidth: 2,
          borderColor: item.color,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 12,
        }}
      >
        {priority === item.key && (
          <View
            style={{
              height: 12,
              width: 12,
              borderRadius: 6,
              backgroundColor: item.color,
            }}
          />
        )}
      </View>

      {/* Texts */}
      <View>
        <Text style={{ color: item.color, fontWeight: '600', fontSize: 15 }}>
          {item.title}
        </Text>
        <Text style={{ fontSize: 12, color: '#555' }}>{item.desc}</Text>
      </View>
    </TouchableOpacity>
  ))}
</View>

 {/* Location Section (moved below photos) */}
      <Text style={styles.sectionTitle}>Location</Text>
      <View style={styles.miniMapContainer}>
        {coords ? (
          <>
            <View style={{ flex: 1 }}>
              <MapView
                style={styles.miniMap}
                region={miniMapRegion || {
                  latitude: coords.latitude,
                  longitude: coords.longitude,
                  latitudeDelta: 0.005,
                  longitudeDelta: 0.005,
                }}
                onRegionChangeComplete={selectOnMiniMap ? async (reg) => {
                  setMiniMapRegion(reg);
                  setCoords({ latitude: reg.latitude, longitude: reg.longitude });
                  try {
                    const geocode = await Location.reverseGeocodeAsync({ latitude: reg.latitude, longitude: reg.longitude });
                    if (geocode.length > 0) {
                      const addr = geocode[0];
                      const addressText = `${addr.name || ''} ${addr.street || ''}, ${addr.city || ''}, ${addr.region || ''}`;
                      setLocation({ address: addressText, coords: { latitude: reg.latitude.toString(), longitude: reg.longitude.toString() } });
                    }
                  } catch {
                    setLocation({ address: 'Unable to fetch address', coords: { latitude: reg.latitude.toString(), longitude: reg.longitude.toString() } });
                  }
                } : undefined}
                onPress={!selectOnMiniMap ? () => router.push('/map-picker') : undefined}
                pointerEvents="auto"
              >
                {!selectOnMiniMap && (
                  <Marker coordinate={{ latitude: coords.latitude, longitude: coords.longitude }}>
                    <View style={{ alignItems: 'center' }}>
                      <FontAwesome5 name="map-marker-alt" size={32} color="#ff4757" style={{ shadowColor: '#333', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4 }} />
                    </View>
                  </Marker>
                )}
              </MapView>
              {selectOnMiniMap && (
                <View style={{ position: 'absolute', left: '50%', top: '50%', marginLeft: -16, marginTop: -32, alignItems: 'center' }}>
                  <FontAwesome5 name="map-marker-alt" size={32} color="#ff4757" style={{ shadowColor: '#333', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4 }} />
                </View>
              )}
            </View>
            <TouchableOpacity
              style={[styles.miniMapToggle, selectOnMiniMap ? styles.miniMapToggleOn : styles.miniMapToggleOff]}
              onPress={() => setSelectOnMiniMap(!selectOnMiniMap)}
            >
              <FontAwesome5 name="map-marker-alt" size={18} color="#fff" />
              <Text style={styles.miniMapToggleText}>
                {selectOnMiniMap ? 'Select on Mini Map: ON' : 'Select on Mini Map: OFF'}
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <ActivityIndicator size="large" color="#667eea" style={{ flex: 1 }} />
        )}
      </View>

      <View style={styles.locationBox}>
        <MaterialIcons name="location-pin" size={24} color="#ff4757" />
        <Text style={styles.locationText}>
          {loadingLocation ? 'Detecting...' : location?.address || 'Location not available'}
        </Text>
        <TouchableOpacity style={styles.refreshButton} onPress={getCurrentLocation}>
          <MaterialIcons name="refresh" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
     <TouchableOpacity
  style={styles.mapButton}
  onPress={handleSelectCurrentLocation}
  disabled={loadingSelectLocation} // disable while fetching
>
  <FontAwesome5 name="map-marker-alt" size={18} color="#fff" />
  {loadingSelectLocation ? (
    <Text style={styles.mapButtonText}>Fetching...</Text>
  ) : (
    <Text style={styles.mapButtonText}>Select Current Location</Text>
  )}
  {loadingSelectLocation && (
    <ActivityIndicator size="small" color="#fff" style={{ marginLeft: 8 }} />
  )}
</TouchableOpacity>


 {/* Photo/Video Upload */}
      <Text style={styles.sectionTitle}>Upload Photo</Text>
      <TouchableOpacity
  style={[styles.uploadBox, selectedImages.length >= 3 && { opacity: 0.5 }]}
  onPress={handleAddPhoto}
  disabled={selectedImages.length >= 3}
>
  <Entypo name="camera" size={40} color="#667eea" />
  <Text style={styles.uploadText}>Tap to upload photo</Text>
</TouchableOpacity>


      {selectedImages.length > 0 && (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    style={styles.previewContainer}
  >
   {selectedImages.map((uri, index) => (
  <View key={index} style={styles.imageWrapper}>
    <Image source={{ uri }} style={styles.previewImage} />
    
    {/* Progress Bar */}
    {loadingSubmit && (
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${uploadProgress[index] || 0}%` }]} />
      </View>
    )}

    <TouchableOpacity
      style={styles.removeButton}
      onPress={() => {
        Alert.alert(
          "Remove Photo",
          "Are you sure you want to delete this photo?",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Delete",
              style: "destructive",
              onPress: () => {
                const updated = selectedImages.filter((_, i) => i !== index);
                setSelectedImages(updated);
                setUploadProgress(prev => prev.filter((_, i) => i !== index));
              },
            },
          ]
        );
      }}
    >
      <Text style={styles.removeButtonText}>×</Text>
    </TouchableOpacity>
  </View>
))}

  </ScrollView>
)}

      {/* Submit Button */}
     <LinearGradient colors={['#667eea', '#764ba2']} style={styles.submitButton}>
  <TouchableOpacity
    onPress={handleSubmit}
    disabled={loadingSubmit}
    style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}
  >
    {loadingSubmit && <ActivityIndicator size="small" color="#fff" style={{ marginRight: 8 }} />}
    <Text style={styles.submitText}>{loadingSubmit ? 'Submitting...' : 'Submit Issue'}</Text>
  </TouchableOpacity>
</LinearGradient>

      

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  progressBarContainer: {
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  height: 4,
  backgroundColor: '#eee',
  borderBottomLeftRadius: 8,
  borderBottomRightRadius: 8,
},
progressBar: {
  height: '100%',
  backgroundColor: '#667eea',
  borderBottomLeftRadius: 8,
  borderBottomRightRadius: 8,
},

  imageWrapper: {
  position: 'relative',
  marginRight: 10,
},
removeButton: {
  position: 'absolute',
  top: 0, // change from -6 to 0
  right: -6,
  backgroundColor: '#ff4757',
  borderRadius: 12,
  width: 24,
  height: 24,
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1,
  elevation: 3,
},
removeButtonText: {
  color: '#fff',
  fontSize: 16,
  fontWeight: 'bold',
  lineHeight: 20,
},

  container: { flex: 1, padding: 20, backgroundColor: '#f5f6fa' },
  miniMapContainer: {
    height: 200,
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 10,
    elevation: 3,
    backgroundColor: '#ddd',
    position: 'relative',
  },
  miniMapToggle: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    minWidth: 40,
    minHeight: 32,
  },
  miniMapToggleOn: {
    backgroundColor: '#28a745', // Green for ON
    borderWidth: 1,
    borderColor: '#218838',
  },
  miniMapToggleOff: {
    backgroundColor: '#667eea', // Default for OFF
    borderWidth: 1,
    borderColor: '#4b5fc9',
  },
  miniMapToggleText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 4,
    fontSize: 12,
    letterSpacing: 0.2,
  },
  miniMap: { flex: 1 },
  locationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 2,
  },
  locationText: { flex: 1, marginLeft: 8, color: '#333' },
  refreshButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ff4757',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
  },
  mapButtonText: { color: '#fff', fontWeight: 'bold', marginLeft: 8 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10, color: '#333' },
  uploadBox: {
    height: 120,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#667eea',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  uploadText: { marginTop: 8, color: '#667eea', fontWeight: '500' },
  previewContainer: { flexDirection: 'row', marginBottom: 20 },
  previewImage: { width: 80, height: 80, borderRadius: 8, marginRight: 10 },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  categoryCard: {
    width: (width - 60) / 3,
    height: 80,
    backgroundColor: '#fff',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#667eea',
  },
  categorySelected: { backgroundColor: '#667eea', borderColor: '#667eea' },
  categoryLabel: { marginTop: 6, color: '#667eea', fontWeight: '500' },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#dcdde1',
  },
  submitButton: { borderRadius: 12, marginBottom: 12 },
  submitText: { color: '#fff', fontWeight: 'bold', textAlign: 'center', padding: 14, fontSize: 16 },
});
