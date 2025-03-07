import {createSlice} from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

const initialState = {
  email: '',
  password: '',
  authToken: '',
  userDetails: '',
  verifyEmailOtp: false,
  socket: null,
  newMessage: '',
  roomId: '',
  allChat: [],
  page: 1,
  roomPage: 1,
  isMobile: false, // This may not be as relevant in React Native, but keeping for compatibility
  isDarkMode: false, // Default theme is light mode
  sidebarCollapsed: false, // This might need adaptation for mobile navigation
};

export const globalSlice = createSlice({
  name: 'global',
  initialState,
  reducers: {
    setEmail: (state, action) => {
      state.email = action.payload;
    },
    setPassword: (state, action) => {
      state.password = action.payload;
    },
    setAuthToken: (state, action) => {
      state.authToken = action.payload;
      // Save token to AsyncStorage when it changes
      if (action.payload) {
        AsyncStorage.setItem('userToken', action.payload);
      } else {
        AsyncStorage.removeItem('userToken');
      }
    },
    setUserDetails: (state, action) => {
      state.userDetails = action.payload;
    },
    setVerifyEmailOtp: (state, action) => {
      state.verifyEmailOtp = action.payload;
    },
    setSocket: (state, action) => {
      state.socket = action.payload;
    },
    setNewMessage: (state, action) => {
      state.newMessage = action.payload;
    },
    setRoomId: (state, action) => {
      state.roomId = action.payload;
    },
    setAllChat: (state, action) => {
      state.allChat = action.payload;
    },
    setPage: (state, action) => {
      state.page = action.payload;
    },
    incrementPage: state => {
      state.page += 1;
    },
    setRoomPage: (state, action) => {
      state.roomPage = action.payload;
    },
    incrementRoomPage: state => {
      state.roomPage += 1;
    },
    setIsMobile: (state, action) => {
      state.isMobile = action.payload;
    },
    setDarkMode: (state, action) => {
      state.isDarkMode = action.payload;
      // Save theme preference to AsyncStorage
      AsyncStorage.setItem('isDarkMode', JSON.stringify(action.payload));
    },
    toggleDarkMode: state => {
      state.isDarkMode = !state.isDarkMode;
      // Save updated theme preference to AsyncStorage
      AsyncStorage.setItem('isDarkMode', JSON.stringify(state.isDarkMode));
    },
    // For mobile, this might control drawer state instead of sidebar
    setSidebarState: (state, action) => {
      state.sidebarCollapsed = action.payload;
    },
    toggleSidebarState: state => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    // New reducer to handle app initialization
    initializeState: (state, action) => {
      // This can be used to set initial state from AsyncStorage
      const {authToken, isDarkMode} = action.payload;
      if (authToken) state.authToken = authToken;
      if (isDarkMode !== undefined) state.isDarkMode = isDarkMode;
    },
    // Logout helper to clear sensitive data
    clearUserData: state => {
      state.email = '';
      state.password = '';
      state.authToken = '';
      state.userDetails = '';
      state.verifyEmailOtp = false;
      state.socket = null;
      state.allChat = [];
      // Clear token from AsyncStorage
      AsyncStorage.removeItem('userToken');
    },
  },
});

export const {
  setEmail,
  setPassword,
  setAuthToken,
  setUserDetails,
  setVerifyEmailOtp,
  setSocket,
  setNewMessage,
  setRoomId,
  setAllChat,
  setPage,
  incrementPage,
  setRoomPage,
  incrementRoomPage,
  setIsMobile,
  setDarkMode,
  toggleDarkMode,
  setSidebarState,
  toggleSidebarState,
  initializeState,
  clearUserData,
} = globalSlice.actions;

// Async thunk to initialize app state from AsyncStorage
export const initializeApp = () => async dispatch => {
  try {
    // Get stored values from AsyncStorage
    const [authTokenValue, isDarkModeValue] = await Promise.all([
      AsyncStorage.getItem('userToken'),
      AsyncStorage.getItem('isDarkMode'),
    ]);

    // Parse the values if they exist
    const isDarkMode = isDarkModeValue ? JSON.parse(isDarkModeValue) : false;

    // Initialize the state with stored values
    dispatch(
      initializeState({
        authToken: authTokenValue || '',
        isDarkMode,
      }),
    );
  } catch (error) {
    console.error('Failed to initialize app state:', error);
  }
};

export default globalSlice.reducer;
