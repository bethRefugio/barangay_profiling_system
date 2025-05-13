import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Alert, Modal } from 'react-native';

const RequestPage = () => {
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
  const userId = null; // You can implement AsyncStorage to get userId

  const fetchUserRequests = async () => {
    try {
      const response = await fetch(`http://192.168.1.10:5000/request/user/${userId}`);
      const data = await response.json();
      setRequests(data);
    } catch (error) {
      console.error("Error fetching user requests:", error);
    }
  };

  useEffect(() => {
    fetchUserRequests();
  }, []);

  const handleRequestSubmit = async (requestData) => {
    try {
      const response = await fetch("http://localhost:5000/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      });
      if (response.ok) {
        Alert.alert("Success", "Request submitted successfully!");
        fetchUserRequests();
      } else {
        Alert.alert("Error", "Failed to submit request.");
      }
    } catch (error) {
      Alert.alert("Error", "An error occurred while submitting the request.");
    }
  };

  // For brevity, UI for request form, list, details, and cancel confirmation can be implemented similarly

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Request Document</Text>
      <Text style={styles.text}>Request form and list will be implemented here.</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#121212' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 16, textAlign: 'center' },
  text: { color: '#ccc', fontSize: 16, textAlign: 'center' },
});

export default RequestPage;
