import React, { useRef, useEffect } from 'react';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationScreens } from '../types';
import DeepLinkService from '../services/DeepLinkService';

// Import screens (we'll create these next)
import DashboardScreen from '../screens/DashboardScreen';
import AddAppScreen from '../screens/AddAppScreen';
import AppSelectionScreen from '../screens/AppSelectionScreen';
import CustomAppScreen from '../screens/CustomAppScreen';
import ReflectionScreen from '../screens/ReflectionScreen';
import PostReflectionScreen from '../screens/PostReflectionScreen';
import SettingsScreen from '../screens/SettingsScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import AppSettingsScreen from '../screens/AppSettingsScreen';
import ProductiveAppsSettingsScreen from '../screens/ProductiveAppsSettingsScreen';

const Stack = createStackNavigator<NavigationScreens>();

export default function AppNavigator() {
  const navigationRef = useRef<NavigationContainerRef<NavigationScreens>>(null);

  useEffect(() => {
    // Set navigation ref for deep link handling
    if (navigationRef.current) {
      const deepLinkService = DeepLinkService.getInstance();
      deepLinkService.setNavigationRef(navigationRef.current);
    }
  }, []);

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        initialRouteName="Dashboard"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#6B73FF',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen
          name="Dashboard"
          component={DashboardScreen}
          options={{
            title: 'Intentional',
          }}
        />
        
        <Stack.Screen
          name="AddApp"
          component={AddAppScreen}
          options={{
            presentation: 'modal',
            headerShown: false,
            gestureDirection: 'horizontal',
          }}
        />
        
        <Stack.Screen
          name="AppSelection"
          component={AppSelectionScreen}
          options={{
            title: 'Select App',
          }}
        />
        
        <Stack.Screen
          name="CustomApp"
          component={CustomAppScreen}
          options={{
            title: 'Custom App',
          }}
        />
        
        <Stack.Screen
          name="Reflection"
          component={ReflectionScreen}
          options={{
            title: 'Take a Moment',
            headerShown: false, // Full screen experience
            gestureEnabled: false, // Prevent swipe to dismiss
          }}
        />
        
        <Stack.Screen
          name="PostReflection"
          component={PostReflectionScreen}
          options={{
            title: 'What\'s Next?',
            headerShown: false, // Full screen experience
            gestureEnabled: false, // Prevent swipe to dismiss
          }}
        />
        
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            title: 'Settings',
            headerBackTitle: 'Home',
          }}
        />
        
        <Stack.Screen
          name="ProductiveAppsSettings"
          component={ProductiveAppsSettingsScreen}
          options={{
            title: 'Productive Apps',
          }}
        />
        
        <Stack.Screen
          name="Onboarding"
          component={OnboardingScreen}
          options={{
            title: 'Welcome',
            headerShown: false, // Full screen experience
            gestureEnabled: false, // Prevent swipe to dismiss
          }}
        />
        
        <Stack.Screen
          name="AppSettings"
          component={AppSettingsScreen}
          options={{
            title: 'App Settings',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
} 