import 'react-native-gesture-handler'; // IMPORTANT: This must be at the top!
import React, {useEffect} from 'react';
import {Provider} from 'react-redux';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import AppNavigation from './AppNavigation';
import {initializeApp} from './src/slices/globalSlice';
import Toast from 'react-native-toast-message';
import store from './src/store'; // Import your existing store

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
