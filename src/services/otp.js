import {createApi} from '@reduxjs/toolkit/query/react';
import {rtkBaseQueryWithReauth} from '../baseQuery';

const otpApi = createApi({
  reducerPath: 'otpApi',
  baseQuery: rtkBaseQueryWithReauth,
  tagTypes: ['CHAT_SETTING', 'CHANGE_NAME', 'CHANGE_EMAIL', 'DELETE'],
  endpoints: builder => ({
    verifyChangeEmail: builder.mutation({
      query: data => ({
        method: 'POST',
        url: `otp/verifyChangeEmail`,
        body: data,
      }),
      invalidatesTags: ['CHANGE_EMAIL'],
      async onQueryStarted(arg, {queryFulfilled, dispatch}) {
        try {
          const result = await queryFulfilled;
          // You can dispatch actions here if needed
          console.log('Email change verified successfully');
        } catch (error) {
          console.error('Email verification error:', error);
        }
      },
    }),
    verifyOtp: builder.mutation({
      query: data => ({
        method: 'POST',
        url: `/otp/verifyEmail`,
        body: data,
      }),
      async onQueryStarted(arg, {queryFulfilled, dispatch}) {
        try {
          const result = await queryFulfilled;
          // You can dispatch actions here if needed
          // For example: dispatch(setVerifyEmailOtp(true));
        } catch (error) {
          console.error('OTP verification error:', error);
        }
      },
    }),
    sendOtp: builder.mutation({
      query: data => ({
        method: 'POST',
        url: `auth/verify-user`,
        body: data,
      }),
    }),
    verifyForgotPassword: builder.mutation({
      query: data => ({
        method: 'POST',
        url: `otp/verifyForgotPassword`,
        body: data,
      }),
      async onQueryStarted(arg, {queryFulfilled, dispatch}) {
        try {
          const result = await queryFulfilled;
          // You can navigate to reset password screen or dispatch actions
          console.log('Forgot password verification successful');
        } catch (error) {
          console.error('Forgot password verification error:', error);
        }
      },
    }),
  }),
});

export const {
  useVerifyChangeEmailMutation,
  useVerifyOtpMutation,
  useSendOtpMutation,
  useVerifyForgotPasswordMutation,
} = otpApi;

export default otpApi;
