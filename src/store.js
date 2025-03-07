// store.js
import {configureStore} from '@reduxjs/toolkit';
import {setupListeners} from '@reduxjs/toolkit/query';

// Import APIs
import authApi from './services/auth';
import userApi from './services/user';
import otpApi from './services/otp';
import chatApi from './services/chat';

// Import global reducer
import globalReducer from './services/GlobalSlice';

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    [otpApi.reducerPath]: otpApi.reducer,
    [chatApi.reducerPath]: chatApi.reducer,
    global: globalReducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      // Handle non-serializable values like socket objects
      serializableCheck: {
        ignoredActions: ['global/setSocket'],
        ignoredPaths: ['global.socket'],
      },
    })
      .concat(authApi.middleware)
      .concat(userApi.middleware)
      .concat(otpApi.middleware)
      .concat(chatApi.middleware),
});

// Optional, but required for refetchOnFocus/refetchOnReconnect behaviors
setupListeners(store.dispatch);

export default store;
