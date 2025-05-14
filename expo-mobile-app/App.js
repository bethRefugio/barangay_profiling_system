import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, ActivityIndicator, Image, Text, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import LoginPage from './src/pages/LoginPage';
import SignupPage from './src/pages/SignupPage';
import OverviewPage from './src/pages/OverviewPage';
import OfficialsPage from './src/pages/OfficialsPage';
import ProjectsPage from './src/pages/ProjectsPage';
import RequestPage from './src/pages/RequestPage';
import AnnouncementsPage from './src/pages/AnnouncementsPage';
import SettingsPage from './src/pages/SettingsPage';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function Header() {
  return (
    <View style={styles.headerContainer}>
      <Image
        source={require('./assets/logo_enhanced.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.headerText}>Brgy. Bunawan</Text>
    </View>
  );
}

function ResidentTabs({ onLogout }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        header: () => <Header />,
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === 'Overview') {
            iconName = 'home';
          } else if (route.name === 'Request') {
            iconName = 'document-text';
          } else if (route.name === 'Officials') {
            iconName = 'people';
          } else if (route.name === 'Announcements') {
            iconName = 'megaphone';
          } else if (route.name === 'Projects') {
            iconName = 'briefcase';
          } else if (route.name === 'Settings') {
            iconName = 'settings';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#6366F1',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Overview" component={OverviewPage} />
      {/*<Tab.Screen name="Request" component={RequestPage} />*/}
      <Tab.Screen name="Officials" component={OfficialsPage} />
      <Tab.Screen name="Announcements" component={AnnouncementsPage} />
      <Tab.Screen name="Projects" component={ProjectsPage} />
      <Tab.Screen name="Settings">
        {(props) => <SettingsPage {...props} onLogout={onLogout} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true); // Add a loading state to prevent rendering before checking login status

  const handleLogout = async () => {
    await AsyncStorage.removeItem('userId');
    setIsLoggedIn(false);
  };

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        // Retrieve the userId from AsyncStorage
        const userId = await AsyncStorage.getItem('userId');
        if (userId) {
          setIsLoggedIn(true); // User is logged in
        } else {
          setIsLoggedIn(false); // User is not logged in
        }
      } catch (error) {
        console.error('Error checking login status:', error);
      } finally {
        setLoading(false); // Set loading to false after checking
      }
    };

    checkLoginStatus();
  }, []);

  if (loading) {
    // Show a loading screen while checking login status
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {!isLoggedIn ? (
          <>
            <Stack.Screen name="Login" options={{ headerShown: false }}>
              {(props) => <LoginPage {...props} onLogin={() => setIsLoggedIn(true)} />}
            </Stack.Screen>
            <Stack.Screen name="Signup" component={SignupPage} options={{ headerShown: true }} />
          </>
        ) : (
          <>
            <Stack.Screen
              name="ResidentTabs"
              options={{ headerShown: false }}
            >
              {(props) => <ResidentTabs {...props} onLogout={handleLogout} />}
            </Stack.Screen>
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 10,
    justifyContent: 'center',
  },
  logo: {
    width: 40,
    height: 40,
    marginRight: 12,
  },
  headerText: {
    color: 'gray',
    fontSize: 20,
    fontWeight: 'bold',
    paddingTop: 5,
    paddingBottom: 5,
  },
});
