import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { getAuth } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, storage } from '../config/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';


export default function CompleteProfileScreen() {
  const auth = getAuth();
  const user = auth.currentUser;
  const [name, setName] = useState('');
  const [sport, setSport] = useState('');
  const [level, setLevel] = useState('');
  const [image, setImage] = useState(null);
  const [imageURL, setImageURL] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [approvedAdvanced, setApprovedAdvanced] = useState(false);


  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setName(data.name || '');
          setSport(data.sport || '');
          setLevel(data.level || '');
          setImageURL(data.imageURL || '');
          setApprovedAdvanced(data.approvedAdvanced || false);
        }
      };
      fetchProfile();
    }
  }, [user]);

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'You need to allow access to the media library to upload a badge.');
      return;
    }
  
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, 
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
  
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImage(result.assets[0].uri);
    }
  };
  

  const uploadImageAsync = async (uri: string) => {
    if (!user) return null;

    const response = await fetch(uri);
    const blob = await response.blob();
    const storageRef = ref(storage, `profileImages/${user.uid}.jpg`);
    await uploadBytes(storageRef, blob);
    return await getDownloadURL(storageRef);
  };

  const handleSave = async () => {
    if (!user) return;
  
    try {
      Alert.alert('Saving...', 'Please wait');
      console.log('Saving profile...');
  
      let uploadedImageURL = imageURL;
  
      if (image && image !== imageURL) {
        console.log('Uploading new image...');
        uploadedImageURL = await uploadImageAsync(image);
      }
  
      await setDoc(doc(db, 'users', user.uid), {
        name,
        sport,
        level,
        email: user.email,
        imageURL: uploadedImageURL || '',
        approvedAdvanced: false, // admin will approve manually
      });
  
      setImageURL(uploadedImageURL);
      setIsEditing(false);
      Alert.alert('Success', 'Profile saved successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'There was an issue saving your profile.');
    }
  };
  

  const selectSport = (selectedSport: string) => {
    setSport(selectedSport);
  };

  const selectLevel = (selectedLevel: string) => {
    setLevel(selectedLevel);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Your Profile</Text>

      {isEditing ? (
        <>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Full Name"
          />

          <Text style={styles.label}>Select Sport</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {['Tennis', 'Basketball', 'Football'].map((s) => (
              <TouchableOpacity key={s} onPress={() => selectSport(s)} style={styles.optionButton}>
                <Text style={sport === s ? styles.selectedOption : styles.option}>{s}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.label}>Select Level</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {['Beginner', 'Intermediate', 'Advanced'].map((lvl) => (
              <TouchableOpacity key={lvl} onPress={() => selectLevel(lvl)} style={styles.optionButton}>
                <Text style={level === lvl ? styles.selectedOption : styles.option}>{lvl}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {level === 'Advanced' && (
          <>
          <Text style={styles.label}>Upload Badge Image (for Advanced Players)</Text>
          {image && <Image source={{ uri: image }} style={styles.imagePreview} />}
          <Button title="📷 Pick an Image" onPress={handlePickImage} color="#0ea5e9" />
          </>
          )}
          <Button title="💾 Save" onPress={handleSave} color="#10b981" />
        </>
      ) : (
        <>
          <Text style={styles.label}>👤 Name: <Text style={styles.value}>{name}</Text></Text>
          <Text style={styles.label}>🏀 Sport: <Text style={styles.value}>{sport}</Text></Text>
          <Text style={styles.label}>📈 Level: <Text style={styles.value}>{level}</Text></Text>
          {level === 'Advanced' && (
            <View style={{ marginVertical: 10 }}>
              {approvedAdvanced ? (
                <Text style={styles.approved}>✅ Approved as Advanced Player</Text>
              ) : (
                <Text style={styles.pending}>⏳ Awaiting Admin Approval</Text>
              )}
            </View>
          )}
          {imageURL ? <Image source={{ uri: imageURL }} style={styles.imagePreview} /> : null}
          <Button title="✏️ Edit Profile" onPress={() => setIsEditing(true)} color="#10b981" />
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, marginTop: 40, backgroundColor: '#f0fdf4' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#10b981' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 10, borderRadius: 6 },
  label: { fontSize: 18, marginBottom: 6 },
  value: { fontWeight: '600' },
  optionButton: {
    padding: 10,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    alignItems: 'center',
  },
  approved: {
    color: '#16a34a',
    fontWeight: '600',
    fontSize: 16,
  },
  pending: {
    color: '#d97706',
    fontWeight: '600',
    fontSize: 16,
  },  
  option: { fontSize: 16, color: '#333' },
  selectedOption: { fontSize: 16, color: '#10b981', fontWeight: 'bold' },
  imagePreview: { width: 200, height: 200, borderRadius: 8, marginVertical: 10, alignSelf: 'center' },
});
