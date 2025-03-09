import 'react-native-gesture-handler'; // IMPORTANT: This must be at the top!
import React, {useEffect} from 'react';
import {Provider} from 'react-redux';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import AppNavigation from './AppNavigation';
import {initializeApp} from './src/slices/globalSlice';
import Toast from 'react-native-toast-message';
import store from './src/store'; // Import your existing store
import SocketProvider from './src/assets/components/SocketProvider/SocketProvider'; // Import the SocketProvider

const App = () => {
  useEffect(() => {
    // Initialize the app state from AsyncStorage when the app starts
    store.dispatch(initializeApp());
  }, []);

  return (
    <Provider store={store}>
      <SocketProvider>
        <SafeAreaProvider>
          <AppNavigation />
          <Toast />
        </SafeAreaProvider>
      </SocketProvider>
    </Provider>
  );
};

export default App;
