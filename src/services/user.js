import {createApi} from '@reduxjs/toolkit/query/react';
import {rtkBaseQueryWithReauth} from '../baseQuery';

const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery: rtkBaseQueryWithReauth,
  tagTypes: ['CHAT_SETTING', 'CHANGE_NAME', 'CHANGE_EMAIL', 'DELETE'],
  endpoints: builder => ({
    updateChatSetting: builder.mutation({
      query: data => ({
        method: 'PUT',
        url: `user/updateChatSetting`,
        body: data,
      }),
      invalidatesTags: ['CHAT_SETTING'],
    }),
    getChatSetting: builder.query({
      query: () => ({
        method: 'GET',
        url: `user/getChatSetting`,
      }),
      providesTags: ['CHAT_SETTING'],
    }),
    changePassword: builder.mutation({
      query: data => ({
        method: 'PUT',
        url: `user/changePassword`,
        body: data,
      }),
    }),
    editName: builder.mutation({
      query: data => ({
        method: 'PUT',
        url: `user/editProfileName`,
        body: data,
      }),
      invalidatesTags: ['CHANGE_NAME'],
    }),
    editProfileEmail: builder.mutation({
      query: data => ({
        method: 'PUT',
        url: `user/editProfileEmail`,
        body: data,
      }),
      invalidatesTags: ['CHANGE_EMAIL'],
    }),
    getUserDetail: builder.query({
      query: data => ({
        method: 'GET',
        url: `user/getUserDetail`,
        body: data,
      }),
      providesTags: ['CHANGE_NAME', 'CHANGE_EMAIL'],
    }),
    deleteProfile: builder.mutation({
      query: () => ({
        method: 'DELETE',
        url: `user/deleteProfile`,
      }),
      invalidatesTags: ['DELETE'],
    }),
    updatePreferences: builder.mutation({
      query: data => ({
        method: 'PUT',
        url: `user/preferences`,
        body: data,
      }),
    }),
  }),
});

export const {
  useUpdateChatSettingMutation,
  useGetChatSettingQuery,
  useChangePasswordMutation,
  useEditNameMutation,
  useGetUserDetailQuery,
  useEditProfileEmailMutation,
  useDeleteProfileMutation,
  useUpdatePreferencesMutation,
} = userApi;

export default userApi;
