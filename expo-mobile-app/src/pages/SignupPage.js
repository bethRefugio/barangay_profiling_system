import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ImageBackground } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';

const SignupPage = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accountType, setAccountType] = useState('Resident');

  const handleSignup = async () => {
    try {
      const response = await axios.post('http://192.168.1.10:5000/user', { name, email, password, accountType });
      if (response.status === 200 || response.status === 201) {
        Alert.alert('Success', 'Account created successfully');
        navigation.navigate('Login');
      }
    } catch (error) {
      Alert.alert('Signup Failed', error.response?.data?.message || 'Signup failed. Please try again.');
    }
  };

  return (
    <ImageBackground source={require('../../assets/logo_enhanced.png')} style={styles.background}>
      <View style={styles.overlay} />
      <View style={styles.container}>
        <Text style={styles.title}>Sign Up</Text>
        <TextInput
          placeholder="Name"
          placeholderTextColor="#ccc"
          style={styles.input}
          value={name}
          onChangeText={setName}
        />
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
        {/*}
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={accountType}
            onValueChange={(itemValue) => setAccountType(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Select Role" value="" />
            <Picker.Item label="Resident" value="Resident" />
            <Picker.Item label="Staff" value="Staff" />
          </Picker>
        </View> */}
        <TouchableOpacity style={styles.button} onPress={handleSignup}>
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.link}>Already have an account? Login now</Text>
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
  pickerContainer: { backgroundColor: '#333', borderRadius: 5, marginBottom: 15 },
  picker: { color: 'white', height: 50, width: '100%' },
  button: { backgroundColor: '#6366F1', padding: 15, borderRadius: 5, alignItems: 'center' },
  buttonText: { color: 'white', fontWeight: 'bold' },
  link: { color: '#6366F1', marginTop: 15, textAlign: 'center' },
});

export default SignupPage;
