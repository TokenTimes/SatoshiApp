/**
 * Application route names for React Native navigation
 * These are used as screen identifiers in navigation
 */
export const ROUTES = {
  // Auth routes
  LOGIN: 'Login',
  SIGNUP: 'Signup',
  FORGOT_PASSWORD: 'ForgotPassword',

  // Main app routes
  HOME: 'Home',
  ROOM: 'Room',
  ROOM_DETAILS: 'RoomDetails',

  // Tab navigation routes
  CHATS: 'Chats',
  PROFILE: 'Profile',
  SETTINGS: 'Settings',
};

// Route stacks (for organizing screens)
export const STACKS = {
  AUTH: 'AuthStack',
  MAIN: 'MainStack',
  TABS: 'TabsStack',
};

// Deep linking configuration (for opening app from links)
export const DEEP_LINKING = {
  prefixes: ['yourapp://', 'https://yourapp.com'],
  config: {
    screens: {
      [STACKS.MAIN]: {
        path: 'main',
        screens: {
          [ROUTES.ROOM]: {
            path: 'room/:id',
            parse: {
              id: id => id,
            },
          },
        },
      },
    },
  },
};
