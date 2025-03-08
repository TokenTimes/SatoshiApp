import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Platform,
  KeyboardAvoidingView,
  Keyboard,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {SOCKET_EVENTS} from '../utils/Constants';
import {incrementPage, setAllChat, setRoomId} from '../slices/globalSlice';
import {WebView} from 'react-native-webview';
import {useGetAllMessageQuery} from '../services/chat';
import {useGetUserDetailQuery} from '../services/user';
// import Graph from '../components/Graph';
// import TableCreator from '../components/TableCreator';
import Icon from 'react-native-vector-icons/FontAwesome';
import InputComponent from '../assets/components/InputComponent'; // Import the InputComponent

// Helper function to check if string contains HTML
const containsHTML = str => {
  return /<[a-z][\s\S]*>/i.test(str);
};

// Simple HTML sanitizer function for React Native
// Note: This is a basic implementation - for production, consider a more robust solution
const simpleSanitizeHtml = html => {
  // Remove potentially dangerous script tags
  let sanitized = html.replace(
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    '',
  );

  // Remove potentially dangerous onclick and other event attributes
  sanitized = sanitized.replace(/ on\w+="[^"]*"/g, '');

  return sanitized;
};

const ConversationScreen = ({route, navigation}) => {
  // Extract conversationId from route params
  const {conversationId} = route.params || {};

  const chatScrollViewRef = useRef(null);
  const [previousMessage, setPreviousMessage] = useState([]);
  const [seenAllChat, setSeenAllChat] = useState(false);
  const [messageLoading, setMessageLoading] = useState(false);
  const [socketLoader, setSocketLoader] = useState(false);
  const [displayTicker, setDisplayTicker] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [inputMessage, setInputMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false); // State for recording

  // Redux state
  const isDarkMode = useSelector(state => state.global.isDarkMode);
  const {newMessage, socket, roomId, allChat, page} = useSelector(
    state => state.global,
  );
  const dispatch = useDispatch();

  // Set conversation ID in Redux state when it changes
  useEffect(() => {
    if (conversationId && conversationId !== roomId) {
      dispatch(setRoomId(conversationId));
      dispatch(setAllChat([])); // Clear previous conversation messages
    }
  }, [conversationId, roomId, dispatch]);

  // Queries
  const {
    data: roomMessage,
    isLoading,
    isFetching,
  } = useGetAllMessageQuery(
    {roomId: conversationId, page, limit: 10},
    {
      skip: !conversationId || !page,
    },
  );

  const {data: userData} = useGetUserDetailQuery();

  // Create a component to render HTML content safely
  const HTMLRenderer = ({htmlContent}) => {
    const sanitizedHtml = simpleSanitizeHtml(htmlContent);
    const wrappedHtml = `
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              font-size: 16px;
              color: ${isDarkMode ? '#FFFFFF' : '#000000'};
              background-color: transparent;
              margin: 0;
              padding: 0;
            }
            a {
              color: #2c83f6;
              text-decoration: none;
            }
          </style>
        </head>
        <body>${sanitizedHtml}</body>
      </html>
    `;

    return (
      <WebView
        originWhitelist={['*']}
        source={{html: wrappedHtml}}
        style={{backgroundColor: 'transparent', height: 'auto', minHeight: 20}}
        scrollEnabled={false}
        onSizeChanged={event => {
          // Adjust webview height based on content
        }}
      />
    );
  };

  // Send message to the socket
  const sendMessage = useCallback(
    message => {
      setSocketLoader(true);
      socket?.emit(SOCKET_EVENTS.QUERY_SEND, {
        message,
        roomId: conversationId,
        messages: allChat || [],
      });
    },
    [socket, conversationId, allChat],
  );

  // Handle new AI response
  const handleResponse = useCallback(
    message => {
      // If the response is for a room other than the currently active room,
      // clear any loading states and ignore this message.
      if (message?.roomId !== conversationId) {
        setSocketLoader(false);
        setMessageLoading(false);
        return;
      }

      // The response is for the current room—proceed with normal processing.
      setMessageLoading(true);
      const chatArr = allChat;
      setDisplayTicker(message?.ticker);

      dispatch(
        setAllChat([
          ...chatArr,
          {
            sender: 'AI',
            message: message?.message,
            graph: message?.ticker,
            table: message?.table,
          },
        ]),
      );

      setTimeout(() => {
        setMessageLoading(false);
        setSocketLoader(false);
        scrollToBottom();
      }, 500);
    },
    [allChat, dispatch, conversationId],
  );

  // Keyboard event handlers
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        // Scroll to bottom when keyboard appears
        setTimeout(() => scrollToBottom(), 100);
      },
    );

    return () => {
      keyboardDidShowListener.remove();
    };
  }, []);

  // Listen for responses in the room
  const listenRoom = useCallback(() => {
    if (socket) {
      socket.on(SOCKET_EVENTS.QUERY_RESPONSE, handleResponse);
      return () => {
        console.log('Cleaning up QUERY_RESPONSE listener...');
        socket.off(SOCKET_EVENTS.QUERY_RESPONSE, handleResponse);
      };
    }
  }, [socket, handleResponse]);

  // Effect: attach/detach the room listener
  useEffect(() => {
    const cleanup = listenRoom();
    return cleanup;
  }, [listenRoom]);

  // Effect: if newMessage is set externally, send it once
  useEffect(() => {
    if (newMessage && socket) {
      sendMessage(newMessage);
    }
  }, [newMessage, socket, sendMessage]);

  // On form submit
  const handleSendMessage = () => {
    if (!inputMessage || inputMessage.trim() === '') {
      setErrorMessage('Message cannot be empty');
      return;
    }

    if (inputMessage.length > 200) {
      setErrorMessage('Message cannot exceed 200 characters');
      return;
    }

    setErrorMessage('');
    Keyboard.dismiss();
    dispatch(setAllChat([...allChat, {sender: 'User', message: inputMessage}]));
    sendMessage(inputMessage);
    setTimeout(() => {
      scrollToBottom();
    }, 500);
    setInputMessage('');
  };

  // Methods for voice recording
  const startRecording = () => {
    setIsRecording(true);
    // Implement your voice recording logic here
    console.log('Start recording...');
    // You would typically use a library like react-native-voice or similar
  };

  const stopRecording = () => {
    setIsRecording(false);
    // Implement your logic to stop recording and process the audio
    console.log('Stop recording...');
    // After processing, you might update the inputMessage with transcribed text
  };

  // Load older messages if user scrolls to the top
  useEffect(() => {
    if (
      roomMessage?.data?.messages?.length > 0 &&
      previousMessage &&
      !isFetching
    ) {
      const arr = roomMessage?.data?.messages?.map(messageInfo => {
        return {
          sender: messageInfo?.sender,
          message: messageInfo?.message,
          graph: messageInfo?.graph,
          table: messageInfo?.table,
        };
      });
      dispatch(setAllChat([...arr, ...previousMessage]));
    }
  }, [roomMessage, previousMessage, isFetching, dispatch]);

  // Cleanup the allChat when leaving
  useEffect(() => {
    return () => {
      dispatch(setAllChat([]));
    };
  }, [dispatch]);

  // If allChat is empty, reset previousMessage
  useEffect(() => {
    if (!allChat?.length) {
      setPreviousMessage([]);
    }
  }, [allChat]);

  // Check if we've loaded all pages
  useEffect(() => {
    if (roomMessage?.data?.pagination?.totalPages === page) {
      setSeenAllChat(true);
    } else {
      setSeenAllChat(false);
    }
  }, [roomMessage, page]);

  // Handle scroll to load more messages
  const handleScrollToTop = event => {
    const {contentOffset} = event.nativeEvent;
    if (contentOffset.y <= 0 && !isFetching && !seenAllChat) {
      setPreviousMessage(allChat);
      if (page < roomMessage?.data?.pagination?.totalPages) {
        dispatch(incrementPage());
      }
    }
  };

  // Scroll to bottom of chat
  const scrollToBottom = () => {
    if (chatScrollViewRef.current) {
      chatScrollViewRef.current.scrollToEnd({animated: true});
    }
  };

  // Handle back button press
  const handleBackPress = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        isDarkMode ? styles.safeAreaDark : styles.safeAreaLight,
      ]}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 120 : 30}>
        {!isLoading ? (
          <ScrollView
            ref={chatScrollViewRef}
            style={[
              styles.chatScrollArea,
              isDarkMode ? styles.darkBackground : styles.lightBackground,
            ]}
            contentContainerStyle={styles.chatContentContainer}
            onScroll={handleScrollToTop}
            scrollEventThrottle={400}>
            {allChat?.map((item, index) => (
              <View key={index} style={styles.chatLine}>
                {/* User message */}
                {item?.sender === 'User' && (
                  <View
                    style={[
                      styles.userLineContainer,
                      socketLoader &&
                        index === allChat.length - 1 &&
                        styles.userLineContainerLoading,
                    ]}>
                    <View
                      style={[
                        styles.userBubble,
                        isDarkMode ? styles.userBubbleDark : null,
                      ]}>
                      <Text style={styles.userMessageText}>
                        {item?.message}
                      </Text>
                    </View>
                  </View>
                )}

                {/* AI loading indicator */}
                {index === allChat?.length - 1 && socketLoader ? (
                  <View style={styles.aiMessageRow}>
                    <View style={styles.aiIconContainer}>
                      <Image
                        style={styles.aiIcon}
                        source={
                          isDarkMode
                            ? require('../assets/images/ConversationLogoDark.svg')
                            : require('../assets/images/ConversationLogo.svg')
                        }
                      />
                    </View>
                    <View style={styles.aiMessageContainer}>
                      <View style={styles.loadingPlaceholder}>
                        <ActivityIndicator
                          size="small"
                          color={isDarkMode ? '#FFFFFF' : '#000000'}
                        />
                      </View>
                    </View>
                  </View>
                ) : item?.sender === 'AI' ? (
                  <View style={styles.aiMessageRow}>
                    <View style={styles.aiIconContainer}>
                      <Image
                        style={styles.aiIcon}
                        source={
                          isDarkMode
                            ? require('../assets/images/ConversationLogoDark.svg')
                            : require('../assets/images/ConversationLogo.svg')
                        }
                      />
                    </View>

                    {/* AI message */}
                    <View style={styles.aiMessageContainer}>
                      <View
                        style={[
                          styles.aiMessageText,
                          isDarkMode ? styles.aiMessageTextDark : null,
                        ]}>
                        {containsHTML(item?.message) ? (
                          <HTMLRenderer htmlContent={item?.message} />
                        ) : (
                          <Text
                            style={[
                              styles.messageText,
                              isDarkMode ? styles.textDark : styles.textLight,
                            ]}>
                            {typeof item?.message === 'string' &&
                            item?.message !== 'null'
                              ? item.message
                              : ''}
                          </Text>
                        )}
                      </View>

                      {/* Table if available */}
                      {/* {item?.table && (
                        <View style={styles.blockElement}>
                          <TableCreator data={item.table} />
                        </View>
                      )} */}

                      {/* Graph if available */}
                      {/* {item?.graph && (
                        <View style={styles.blockElement}>
                          <Graph symbol={item.graph} />
                        </View>
                      )} */}
                    </View>
                  </View>
                ) : null}
              </View>
            ))}
          </ScrollView>
        ) : (
          <View style={styles.loadingContainer}>
            <ActivityIndicator
              size="large"
              color={isDarkMode ? '#FFFFFF' : '#000000'}
            />
          </View>
        )}

        {/* Replace the old input form with InputComponent */}
        <View
          style={[
            styles.formContainer,
            isDarkMode ? styles.formContainerDark : null,
          ]}>
          <InputComponent
            prompt={inputMessage}
            setPrompt={setInputMessage}
            isRecording={isRecording}
            setIsRecording={setIsRecording}
            loading={socketLoader || messageLoading}
            startRecording={startRecording}
            stopRecording={stopRecording}
            onSendPress={handleSendMessage}
            isDarkMode={isDarkMode}
          />

          {errorMessage ? (
            <Text style={styles.errorMessage}>{errorMessage}</Text>
          ) : null}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  safeAreaLight: {
    backgroundColor: '#F8F8F8',
  },
  safeAreaDark: {
    backgroundColor: 'black',
  },

  backButton: {
    padding: 8,
  },

  container: {
    flex: 1,
  },
  darkBackground: {
    backgroundColor: 'black',
  },
  lightBackground: {
    backgroundColor: '#F8F8F8',
  },
  chatScrollArea: {
    flex: 1,
  },
  chatContentContainer: {
    padding: 16,
    paddingBottom: 120, // Extra space at the bottom for scrolling and keyboard
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatLine: {
    marginBottom: 16,
  },
  userLineContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  userLineContainerLoading: {
    opacity: 0.7,
  },
  userBubble: {
    backgroundColor: '#2c83f6',
    borderRadius: 18,
    padding: 12,
    maxWidth: '75%',
  },
  userBubbleDark: {
    backgroundColor: '#1a5faf', // Darker blue for dark mode
  },
  userMessageText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  aiMessageRow: {
    flexDirection: 'row',
    marginTop: 12,
  },
  aiIconContainer: {
    width: 48,
    height: 48,
    marginRight: 12,
    justifyContent: 'flex-start',
  },
  aiIcon: {
    width: 48,
    height: 48,
    resizeMode: 'contain',
  },
  aiMessageContainer: {
    flex: 1,
    marginTop: 4,
  },
  aiMessageText: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 12,
    maxWidth: '90%',
  },
  aiMessageTextDark: {
    backgroundColor: '#2A2A2A', // Dark bubble for dark mode
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  textLight: {
    color: '#000000',
  },
  textDark: {
    color: '#FFFFFF',
  },
  loadingPlaceholder: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  blockElement: {
    marginTop: 12,
    borderRadius: 8,
    overflow: 'hidden',
  },
  formContainer: {
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 30 : 16, // Extra padding for iOS
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    backgroundColor: '#FFFFFF',
    // Add shadow to make the input stand out
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -3},
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
    zIndex: 10,
  },
  formContainerDark: {
    backgroundColor: 'black',
    borderTopColor: 'black',
  },
  errorMessage: {
    color: '#FF3B30',
    marginTop: 8,
    fontSize: 14,
    textAlign: 'center',
  },
});

export default ConversationScreen;
