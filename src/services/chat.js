import {createApi} from '@reduxjs/toolkit/query/react';
import {rtkBaseQueryWithReauth} from '../baseQuery';

const chatApi = createApi({
  reducerPath: 'chatApi',
  baseQuery: rtkBaseQueryWithReauth,
  tagTypes: ['CHANGE_NAME', 'DELETE', 'NEW_CHAT'],
  endpoints: builder => ({
    getAllRoom: builder.query({
      query: params => ({
        method: 'GET',
        url: `chat/getAllRoom`,
        params,
      }),

      // Force refetch when params change
      forceRefetch({currentArg, previousArg}) {
        return currentArg !== previousArg;
      },

      // Provide tags for cache invalidation
      providesTags: ['CHANGE_NAME', 'DELETE'],

      // Handle potential errors in response
      transformResponse: (response, meta, arg) => {
        // Check if response exists and has expected format
        if (!response || !response.data) {
          console.warn('Unexpected response format from getAllRoom');
          return {data: []};
        }
        return response;
      },

      // Custom error handling for React Native
      async onQueryStarted(arg, {queryFulfilled}) {
        try {
          await queryFulfilled;
        } catch (error) {
          console.error('Error fetching rooms:', error);
          // You could add mobile-specific error handling here
        }
      },
    }),

    deleteRoom: builder.mutation({
      query: params => ({
        method: 'DELETE',
        url: `chat/deleteRoom`,
        body: params,
      }),
      invalidatesTags: ['DELETE'],

      // Add success and error handling
      async onQueryStarted(arg, {queryFulfilled, dispatch}) {
        try {
          await queryFulfilled;
          // Could dispatch actions here if needed
          console.log('Room deleted successfully');
        } catch (error) {
          console.error('Error deleting room:', error);
        }
      },
    }),

    getAllMessage: builder.query({
      query: params => ({
        method: 'GET',
        url: `chat/getAllMessage`,
        params: params,
      }),

      // Transform the response to reverse message order (newest first)
      transformResponse: response => {
        if (!response || !response.data || !response.data.messages) {
          console.warn('Unexpected message format from getAllMessage');
          return {data: {messages: []}};
        }

        return {
          ...response,
          data: {
            ...response.data,
            messages: response.data.messages.reverse(),
          },
        };
      },

      providesTags: ['NEW_CHAT'],

      // Add custom error handling for mobile
      async onQueryStarted(arg, {queryFulfilled}) {
        try {
          await queryFulfilled;
        } catch (error) {
          console.error('Error fetching messages:', error);
          // Mobile-specific error handling
        }
      },
    }),

    changeRoomName: builder.mutation({
      query: params => ({
        method: 'PUT',
        url: `chat/changeRoomName`,
        body: params,
      }),
      invalidatesTags: ['CHANGE_NAME'],

      // Add success and error handling
      async onQueryStarted(arg, {queryFulfilled}) {
        try {
          await queryFulfilled;
          console.log('Room name changed successfully');
        } catch (error) {
          console.error('Error changing room name:', error);
        }
      },
    }),

    // New endpoint for sending messages
    sendMessage: builder.mutation({
      query: messageData => ({
        method: 'POST',
        url: `chat/sendMessage`,
        body: messageData,
      }),
      invalidatesTags: ['NEW_CHAT'],
    }),
  }),
});

export const {
  useGetAllRoomQuery,
  useChangeRoomNameMutation,
  useDeleteRoomMutation,
  useGetAllMessageQuery,
  useSendMessageMutation,
} = chatApi;

export default chatApi;
