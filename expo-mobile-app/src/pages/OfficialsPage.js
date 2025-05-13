import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Image, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import axios from 'axios';

const OfficialsPage = () => {
  const [officials, setOfficials] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch officials from the backend
  useEffect(() => {
    const fetchOfficials = async () => {
      try {
        const response = await axios.get('http://192.168.1.10:5000/official'); // Replace with your backend URL
        setOfficials(response.data);
      } catch (error) {
        console.error('Error fetching officials:', error);
        Alert.alert('Error', 'Failed to fetch officials. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchOfficials();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.loadingText}>Loading officials...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Barangay Officials</Text>
      {officials.map((official) => (
        <View key={official._id} style={styles.card}>
          <Image
            source={{ uri: `http://192.168.1.10:5000/${official.profilePhoto}` }} // Replace with your backend URL
            style={styles.profilePhoto}
            onError={(e) => {
              e.target.src = 'http://192.168.1.10:5000/uploads/default-profile.png'; // Fallback image
            }}
          />
          <View style={styles.infoContainer}>
            <Text style={styles.position}>{official.position}</Text>
            <Text style={styles.name}>{official.fullname}</Text>
            <Text style={styles.contact}>
              📞 {official.phone} | ✉️ {official.email}
            </Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#121212' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 16, textAlign: 'center' },
  card: {
    flexDirection: 'row',
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  profilePhoto: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#444',
  },
  infoContainer: { flex: 1 },
  position: { fontSize: 14, color: '#ccc', marginBottom: 4 },
  name: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  contact: { fontSize: 12, color: '#aaa' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' },
  loadingText: { marginTop: 8, fontSize: 16, color: '#ccc' },
});

export default OfficialsPage;