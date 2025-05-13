import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ImageBackground } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';


const LoginPage = ({ navigation, onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
  try {
    const response = await axios.post('http://192.168.1.10:5000/login', { email, password }, { withCredentials: true });
    if (response.status === 200) {
      const { userId } = response.data;

      // Store userId in AsyncStorage as a string
      await AsyncStorage.setItem('userId', String(userId));

      // Call the onLogin callback to update the app state
      onLogin();
    }
  } catch (error) {
    console.error("Login error:", error.response?.data?.message || error.message);

    // Handle specific error messages
    if (error.response?.status === 403 && error.response?.data?.message === "This account doesn't exist anymore") {
      Alert.alert('Login Failed', "This account doesn't exist anymore");
    } else {
      Alert.alert('Login Failed', error.response?.data?.message || 'Invalid email or password');
    }
  }
};

  return (
    <ImageBackground source={require('../../assets/logo_enhanced.png')} style={styles.background}>
      <View style={styles.overlay} />
      <View style={styles.container}>
        <Text style={styles.title}>Login</Text>
        <TextInput
          placeholder="Email"
          placeholderTextColor="#ccc"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          placeholder="Password"
          placeholderTextColor="#ccc"
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
          <Text style={styles.link}>Don't have an account? Sign up now</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.7)' },
  container: { width: '80%', backgroundColor: '#222', padding: 20, borderRadius: 10 },
  title: { fontSize: 24, fontWeight: 'bold', color: 'white', marginBottom: 20, textAlign: 'center' },
  input: { backgroundColor: '#333', color: 'white', padding: 10, marginBottom: 15, borderRadius: 5 },
  button: { backgroundColor: '#6366F1', padding: 15, borderRadius: 5, alignItems: 'center' },
  buttonText: { color: 'white', fontWeight: 'bold' },
  link: { color: '#6366F1', marginTop: 15, textAlign: 'center' },
});

export default LoginPage;
