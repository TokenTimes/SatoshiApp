import {fetchBaseQuery} from '@reduxjs/toolkit/query/react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create a base query with authentication
export const rtkBaseQuery = fetchBaseQuery({
  // Replace with your API base URL
  baseUrl: 'https://your-api-base-url.com/api/',
  prepareHeaders: async headers => {
    // Get token from AsyncStorage
    const token = await AsyncStorage.getItem('userToken');

    // If we have a token, set the authorization header
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    // Set content type for API requests
    headers.set('Content-Type', 'application/json');

    return headers;
  },
  // Handle errors here if needed
  responseHandler: async response => {
    if (!response.ok) {
      // You can handle specific error codes here
      const data = await response.json();
      return {error: data};
    }
    return response.json();
  },
});

// Export other query-related utilities if needed
