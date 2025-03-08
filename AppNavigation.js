import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useSelector} from 'react-redux';

// Import MainLayout
import MainLayout from './MainLayout';

// Import screens
import HomeScreen from './src/pages/HomeScreenPage';
import LoginScreen from './src/pages/LoginScreen';
import SignUpScreen from './src/pages/SignUpScreen';

// Create a separate stack for authenticated routes
const AuthStack = createNativeStackNavigator();
const NonAuthStack = createNativeStackNavigator();

// Authenticated navigator with MainLayout
const AuthNavigator = () => {
  return (
    <MainLayout>
      <AuthStack.Navigator
        screenOptions={{
          headerShown: false,
        }}>
        <AuthStack.Screen name="Home" component={HomeScreen} />
        {/* Add other authenticated screens here */}
      </AuthStack.Navigator>
    </MainLayout>
  );
};

// Non-authenticated navigator
const NonAuthNavigator = () => {
  return (
    <NonAuthStack.Navigator
      screenOptions={{
        headerShown: false,
      }}>
      <NonAuthStack.Screen name="Login" component={LoginScreen} />
      <NonAuthStack.Screen name="SignUp" component={SignUpScreen} />
    </NonAuthStack.Navigator>
  );
};

// Main navigator that decides which navigator to show based on auth state
const AppNavigation = () => {
  const authToken = useSelector(state => state.global.authToken);

  return (
    <NavigationContainer>
      {authToken ? <AuthNavigator /> : <NonAuthNavigator />}
    </NavigationContainer>
  );
};

export default AppNavigation;
