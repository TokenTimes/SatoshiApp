import 'react-native-gesture-handler'; // IMPORTANT: This must be at the top!
import React, {useEffect} from 'react';
import {Provider} from 'react-redux';
import {configureStore} from '@reduxjs/toolkit';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import AppNavigation from './AppNavigation';
import globalReducer, {initializeApp} from './src/slices/globalSlice';
import Toast from 'react-native-toast-message';

// Configure the Redux store
const store = configureStore({
  reducer: {
    global: globalReducer,
    // Add other reducers here if needed
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['global/setSocket'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['payload.socket'],
        // Ignore these paths in the state
        ignoredPaths: ['global.socket'],
      },
    }),
});

const App = () => {
  useEffect(() => {
    // Initialize the app state from AsyncStorage when the app starts
    store.dispatch(initializeApp());
  }, []);

  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <AppNavigation />
        <Toast />
      </SafeAreaProvider>
    </Provider>
  );
};

export default App;
