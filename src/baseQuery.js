import {fetchBaseQuery} from '@reduxjs/toolkit/query';
import {setAuthToken, clearUserData} from '../src/slices/globalSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create a base query with custom headers and base URL
const baseQuery = fetchBaseQuery({
  baseUrl: 'https://dev-user.olympus-demo.com/api/',
  prepareHeaders: async (headers, {getState}) => {
    // Get the token from Redux state
    const token = getState().global.authToken;

    // If we have a token set in state, add it to the request headers
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    } else {
      // If token isn't in Redux state, try to get it from AsyncStorage
      const storedToken = await AsyncStorage.getItem('userToken');
      if (storedToken) {
        headers.set('Authorization', `Bearer ${storedToken}`);
      }
    }

    // Add common headers
    headers.set('Content-Type', 'application/json');
    headers.set('Accept', 'application/json');

    return headers;
  },
});

// Custom base query with token refresh logic
export const rtkBaseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  // If the request failed with a 401 Unauthorized, try to refresh the token
  if (result.error && result.error.status === 401) {
    console.log('Trying to refresh token due to 401 error');

    // Try to get the refresh token from AsyncStorage
    const refreshToken = await AsyncStorage.getItem('refreshToken');

    if (!refreshToken) {
      console.log('No refresh token available');
      // No refresh token available, logout the user
      api.dispatch(clearUserData());
      return result;
    }

    // Try to get a new token using the refresh token
    const refreshResult = await baseQuery(
      {
        url: 'auth/refresh',
        method: 'POST',
        body: {refreshToken},
      },
      api,
      extraOptions,
    );

    if (refreshResult.data) {
      // Store the new token
      const {token} = refreshResult.data;

      // Update token in AsyncStorage
      await AsyncStorage.setItem('userToken', token);

      // Update token in Redux state
      api.dispatch(setAuthToken(token));

      // Retry the original request with the new token
      result = await baseQuery(args, api, extraOptions);
    } else {
      // Refresh failed, logout the user
      api.dispatch(clearUserData());
    }
  }

  return result;
};

export default rtkBaseQueryWithReauth;

//   baseUrl: 'https://dev-user.olympus-demo.com/api/',
