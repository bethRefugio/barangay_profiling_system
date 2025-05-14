import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';

const AnnouncementsPage = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [accountType, setAccountType] = useState(null);

  const fetchAnnouncements = async () => {
    try {
      const response = await fetch('http://192.168.1.10:5000/announcements');
      const data = await response.json();
      setAnnouncements(data);
    } catch (error) {
      console.error('Error fetching announcements:', error);
    }
  };

  useEffect(() => {
    // Fetch user account type and announcements
    fetchAnnouncements();
  }, []);

  const handleAddAnnouncement = () => {
    Alert.alert('Add Announcement', 'Functionality to add announcement will be implemented.');
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Announcements</Text>
      {(accountType === "admin" || accountType === "barangay captain" || accountType === "staff") && (
        <TouchableOpacity style={styles.addButton} onPress={handleAddAnnouncement}>
          <Text style={styles.addButtonText}>Add Announcement</Text>
        </TouchableOpacity>
      )}
      {announcements.map((announcement, index) => (
        <View key={index} style={styles.announcementCard}>
          <Text style={styles.announcementTitle}>{announcement.title}</Text>
          <Text style={styles.announcementContent}>{announcement.content}</Text>
          <Text style={styles.announcementMeta}>
            Date: {announcement.date || 'N/A'}
          </Text>
          <Text style={styles.announcementMeta}>
            Time: {announcement.time || 'N/A'}
          </Text>
          <Text style={styles.announcementMeta}>
            Place: {announcement.place || 'N/A'}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#121212' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 16, textAlign: 'center' },
  addButton: { backgroundColor: '#6366F1', padding: 12, borderRadius: 8, marginBottom: 16, alignItems: 'center' },
  addButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  announcementCard: { backgroundColor: 'rgba(55, 65, 81, 0.8)', borderRadius: 8, padding: 12, marginBottom: 12 },
  announcementTitle: { color: '#fff', fontWeight: 'bold', fontSize: 20, marginBottom: 6 },
  announcementContent: { color: '#ccc', fontSize: 16 },
  announcementMeta: { color: '#aaa', fontSize: 14, marginTop: 4 },
});

export default AnnouncementsPage;
