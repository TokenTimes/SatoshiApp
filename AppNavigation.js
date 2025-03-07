import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useSelector} from 'react-redux';

// Import screens
import HomeScreen from './src/pages/HomeScreenPage';
import LoginScreen from './src/pages/LoginScreen';

// Use Native Stack Navigator instead of Stack Navigator
const Stack = createNativeStackNavigator();

const AppNavigation = () => {
  const authToken = useSelector(state => state.global.authToken);

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}>
        {authToken ? (
          // Authenticated routes
          <Stack.Screen name="Home" component={HomeScreen} />
        ) : (
          // Non-authenticated routes
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigation;
