import {createApi} from '@reduxjs/toolkit/query/react';
import rtkBaseQueryWithReauth from '../baseQuery';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  setAuthToken,
  setUserDetails,
  setDarkMode,
  setEmail,
} from '../slices/globalSlice';

const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: rtkBaseQueryWithReauth,
  endpoints: builder => ({
    signUp: builder.mutation({
      query: data => ({
        method: 'POST',
        url: `auth/signup`,
        body: data,
      }),
      async onQueryStarted(arg, {queryFulfilled, dispatch}) {
        try {
          const result = await queryFulfilled;
          // Handle successful signup
          console.log('Account created successfully');

          // If the API returns a token upon signup, store it
          if (result.data?.token) {
            await AsyncStorage.setItem('userToken', result.data.token);
            // Dispatch to Redux
            dispatch(setAuthToken(result.data.token));

            if (result.data?.user) {
              await AsyncStorage.setItem(
                'userDetails',
                JSON.stringify(result.data.user),
              );
              dispatch(setUserDetails(result.data.user));
              dispatch(setEmail(result.data.user.email || arg.email));
            }
          }
        } catch (error) {
          console.error('Signup error:', error);
        }
      },
    }),

    login: builder.mutation({
      query: data => ({
        method: 'POST',
        url: `auth/login`,
        body: data,
      }),
      // Handle the isDarkMode in the response transformation
      transformResponse: response => {
        return {
          ...response,
          isDarkMode: response.data?.user?.isDarkMode || false,
        };
      },
      async onQueryStarted(arg, {queryFulfilled, dispatch}) {
        try {
          const result = await queryFulfilled;

          // Store token in AsyncStorage and update Redux
          if (result.data?.token) {
            await AsyncStorage.setItem('userToken', result.data.token);
            dispatch(setAuthToken(result.data.token));
          }

          // Store user details if available
          if (result.data?.user) {
            await AsyncStorage.setItem(
              'userDetails',
              JSON.stringify(result.data.user),
            );
            dispatch(setUserDetails(result.data.user));
            dispatch(setEmail(result.data.user.email || arg.email));
          }

          // Save dark mode preference
          const isDarkMode = result.isDarkMode || false;
          await AsyncStorage.setItem('isDarkMode', JSON.stringify(isDarkMode));
          dispatch(setDarkMode(isDarkMode));
        } catch (error) {
          console.error('Login error:', error);
        }
      },
    }),

    forgotPassword: builder.mutation({
      query: data => ({
        method: 'POST',
        url: `auth/forgot-password`,
        body: data,
      }),
    }),

    // Endpoint for email verification OTP
    sendOtp: builder.mutation({
      query: data => ({
        method: 'POST',
        url: `auth/send-otp`,
        body: data,
      }),
    }),

    verifyOtp: builder.mutation({
      query: data => ({
        method: 'POST',
        url: `auth/verify-otp`,
        body: data,
      }),
    }),

    // Endpoint for logout
    logout: builder.mutation({
      query: () => ({
        method: 'POST',
        url: `auth/logout`,
      }),
      async onQueryStarted(arg, {queryFulfilled, dispatch}) {
        try {
          await queryFulfilled;

          // Clear all auth-related data from AsyncStorage
          const keys = [
            'userToken',
            'userDetails',
            'refreshToken',
            'isDarkMode',
          ];
          await AsyncStorage.multiRemove(keys);

          // Reset redux state
          dispatch({type: 'global/clearUserData'});

          console.log('Logged out successfully');
        } catch (error) {
          // Even if the API call fails, we still want to clear local storage
          const keys = [
            'userToken',
            'userDetails',
            'refreshToken',
            'isDarkMode',
          ];
          await AsyncStorage.multiRemove(keys);

          dispatch({type: 'global/clearUserData'});

          console.error('Logout error:', error);
        }
      },
    }),
  }),
});

export const {
  useSignUpMutation,
  useLoginMutation,
  useForgotPasswordMutation,
  useSendOtpMutation,
  useVerifyOtpMutation,
  useLogoutMutation,
} = authApi;

export default authApi;
