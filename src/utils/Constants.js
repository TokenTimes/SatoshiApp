/**
 * Socket event constants for the chat application
 * These are used to standardize event names across client and server
 */
export const SOCKET_EVENTS = Object.freeze({
  // Room events
  ROOM_CREATE: 'room:create',
  ROOM_CREATED: 'room:created',

  // Message events
  QUERY_SEND: 'query:send',
  QUERY_RESPONSE: 'query:response',

  // Mobile-specific connection events
  RECONNECT: 'reconnect',
  DISCONNECT: 'disconnect',
  CONNECT_ERROR: 'connect_error',

  // Typing indicators
  TYPING_START: 'typing:start',
  TYPING_STOP: 'typing:stop',
});

// Connection status enum for tracking socket state in the app
export const CONNECTION_STATUS = Object.freeze({
  CONNECTED: 'connected',
  DISCONNECTED: 'disconnected',
  CONNECTING: 'connecting',
  ERROR: 'error',
});

// Default socket configuration for React Native
export const SOCKET_CONFIG = {
  // React Native specific socket.io options
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 2000,
  reconnectionDelayMax: 5000,
  timeout: 10000,
  // Automatically connect when the socket is created
  autoConnect: true,
  // Important for mobile: Enable offline detection and queue events
  forceNew: true,
};
