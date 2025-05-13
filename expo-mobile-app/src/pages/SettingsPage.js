import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert, ScrollView, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import axios from 'axios';

const SettingsPage = ({ navigation, onLogout }) => {
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [updatedUser, setUpdatedUser] = useState({ name: '', email: '', password: '' });
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qrCode, setQRCode] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
      const fetchUser = async () => {
        try {
          const userIdStr = await AsyncStorage.getItem('userId');
          console.log('Fetched userId from AsyncStorage:', userIdStr);
          if (!userIdStr) {
            throw new Error('User ID not found');
          }
          const userId = Number(userIdStr);
          if (isNaN(userId)) {
            throw new Error('User ID is not a valid number');
          }
          const response = await axios.get(`http://192.168.1.10:5000/user/${userId}`);
          setUser(response.data);
          setUpdatedUser({ name: response.data.name, email: response.data.email, password: '' });
          setProfilePhoto(response.data.profilePhoto || 'http://192.168.1.10:5000/uploads/default-profile.png');

          // Fetch QR code based on account type
          if (response.data.accountType === 'Resident') {
            try {
              const residentResponse = await axios.get(`http://192.168.1.10:5000/resident/${String(response.data.linkedId)}`);
              console.log('Resident QR code:', residentResponse.data.qrCode);
              setQRCode(residentResponse.data.qrCode);
            } catch (error) {
              console.warn('Resident QR code not found:', error);
              setQRCode(null);
            }
          } else if (response.data.accountType === 'Staff') {
            try {
              const officialResponse = await axios.get(`http://192.168.1.10:5000/official/${String(response.data.linkedId)}`);
              console.log('Official QR code:', officialResponse.data.qrCode);
              setQRCode(officialResponse.data.qrCode);
            } catch (error) {
              console.warn('Official QR code not found:', error);
              setQRCode(null);
            }
          }
        } catch (error) {
          console.error('Error fetching user:', error);
          if (error.response && error.response.status === 404) {
            Alert.alert('Error', 'User not found. Please log in again.');
          } else {
            Alert.alert('Error', 'Failed to fetch user data.');
          }
        } finally {
          setLoading(false);
        }
      };

      fetchUser();
    }, []);

  const handleInputChange = (key, value) => {
    setUpdatedUser({ ...updatedUser, [key]: value });
  };

  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permissionResult.granted === false) {
        Alert.alert('Permission Denied', 'Permission to access media library is required!');
        return;
      }
      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });
      if (!pickerResult.cancelled) {
        const localUri = pickerResult.uri;
        const filename = localUri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image`;
        setProfilePhoto({
          uri: localUri,
          name: filename,
          type,
        });
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image.');
    }
  };

  const handleEditProfile = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      const formData = new FormData();
      formData.append('name', updatedUser.name);
      formData.append('email', updatedUser.email);
      if (updatedUser.password) {
        formData.append('password', updatedUser.password);
      }
      if (profilePhoto && typeof profilePhoto !== 'string') {
        formData.append('profilePhoto', {
          uri: profilePhoto.uri,
          name: profilePhoto.name,
          type: profilePhoto.type,
        });
      }

      await axios.put(`http://192.168.1.10:5000/user/${userId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      Alert.alert('Success', 'Profile updated successfully!');
      setEditMode(false);
      setUser({ ...user, ...updatedUser });
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile.');
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      await axios.delete(`http://192.168.1.10:5000/user/${userId}`);
      Alert.alert('Success', 'Account deleted successfully!');
      await AsyncStorage.removeItem('userId');
      onLogout();
    } catch (error) {
      console.error('Error deleting account:', error);
      Alert.alert('Error', 'Failed to delete account.');
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('userId');
    onLogout();
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleDownloadQRCode = async () => {
    if (!qrCode) return;
    try {
      // Download QR code image to device's document directory
      const fileUri = FileSystem.documentDirectory + 'qrcode.png';
      const downloadResult = await FileSystem.downloadAsync(qrCode, fileUri);
      Alert.alert('Download Complete', `QR code saved to: ${downloadResult.uri}`);
    } catch (error) {
      console.error('Error downloading QR code:', error);
      Alert.alert('Error', 'Failed to download QR code.');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.loadingText}>Loading settings...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      {/* Profile Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Profile</Text>
        {editMode ? (
          <>
            <TouchableOpacity onPress={pickImage} style={{ alignSelf: 'center', marginBottom: 16 }}>
              {profilePhoto ? (
                <Image source={{ uri: profilePhoto.uri || profilePhoto }} style={styles.profilePhoto} />
              ) : (
                <View style={[styles.profilePhoto, styles.profilePhotoPlaceholder]}>
                  <Text style={{ color: '#888' }}>Select Photo</Text>
                </View>
              )}
            </TouchableOpacity>
            <TextInput
              style={styles.input}
              placeholder="Name"
              value={updatedUser.name}
              onChangeText={(value) => handleInputChange('name', value)}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={updatedUser.email}
              onChangeText={(value) => handleInputChange('email', value)}
              keyboardType="email-address"
            />
            <View style={{ position: 'relative' }}>
              <TextInput
                style={styles.input}
                placeholder="Password"
                value={updatedUser.password}
                onChangeText={(value) => handleInputChange('password', value)}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                onPress={togglePasswordVisibility}
                style={styles.passwordToggle}
              >
                <Text style={{ color: '#6366F1', fontWeight: 'bold' }}>
                  {showPassword ? 'Hide' : 'Show'}
                </Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.button} onPress={handleEditProfile}>
              <Text style={styles.buttonText}>Save Changes</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={() => setEditMode(false)}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Image source={{ uri: profilePhoto }} style={styles.profilePhoto} />
            <Text style={styles.text}>Name: {user.name}</Text>
            <Text style={styles.text}>Email: {user.email}</Text>
            <TouchableOpacity style={styles.button} onPress={() => setEditMode(true)}>
              <Text style={styles.buttonText}>Edit Profile</Text>
            </TouchableOpacity>
            {qrCode && (
              <View style={styles.qrCodeContainer}>
                <Text style={styles.qrCodeTitle}>Your QR Code</Text>
                <Image source={{ uri: qrCode }} style={styles.qrCodeImage} />
                <TouchableOpacity style={styles.button} onPress={handleDownloadQRCode}>
                  <Text style={styles.buttonText}>Download QR Code</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
      </View>

      {/* Danger Zone Section */}
      <View style={[styles.section, styles.dangerZone]}>
        <Text style={styles.sectionTitle}>Danger Zone</Text>
        <Text style={styles.text}>Delete your account permanently.</Text>
        <TouchableOpacity style={[styles.button, styles.deleteButton]} onPress={handleDeleteAccount}>
          <Text style={styles.buttonText}>Delete Account</Text>
        </TouchableOpacity>
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={handleLogout}>
        <Text style={styles.buttonText}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#121212' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 16, textAlign: 'center' },
  section: { marginBottom: 24, padding: 16, backgroundColor: '#1E1E1E', borderRadius: 8 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
  input: { backgroundColor: '#333', color: '#fff', padding: 10, marginBottom: 12, borderRadius: 5 },
  button: { backgroundColor: '#6366F1', padding: 12, borderRadius: 5, alignItems: 'center', marginBottom: 8 },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  cancelButton: { backgroundColor: '#555' },
  deleteButton: { backgroundColor: '#E53E3E' },
  logoutButton: { backgroundColor: '#444' },
  text: { color: '#ccc', fontSize: 16, marginBottom: 8 },
  profilePhoto: { width: 80, height: 80, borderRadius: 40, marginBottom: 16, alignSelf: 'center' },
  profilePhotoPlaceholder: { backgroundColor: '#444', justifyContent: 'center', alignItems: 'center' },
  dangerZone: { borderColor: '#E53E3E', borderWidth: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' },
  loadingText: { marginTop: 8, fontSize: 16, color: '#ccc' },
  passwordToggle: { position: 'absolute', right: 10, top: 12 },
  qrCodeContainer: { marginTop: 16, alignItems: 'center' },
  qrCodeTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
  qrCodeImage: { width: 150, height: 150, marginBottom: 8 },
});

export default SettingsPage;
