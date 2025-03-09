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
  Dimensions,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {SOCKET_EVENTS} from '../utils/Constants';
import {incrementPage, setAllChat, setRoomId} from '../slices/globalSlice';
import RenderHtml from 'react-native-render-html'; // Import react-native-render-html
import {useGetAllMessageQuery} from '../services/chat';
import {useGetUserDetailQuery} from '../services/user';
import InputComponent from '../assets/components/InputComponent';
import Voice from 'react-native-voice'; // Import Voice for speech recognition

// Get device width for HTML content sizing
const {width} = Dimensions.get('window');

// Helper function to check if string contains HTML
const containsHTML = str => {
  return str && typeof str === 'string' && /<[a-z][\s\S]*>/i.test(str);
};

// Simple HTML sanitizer function for React Native
const simpleSanitizeHtml = html => {
  if (!html) return '';

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

  // Debug log the conversation ID
  console.log('ConversationScreen initialized with ID:', conversationId);

  const chatScrollViewRef = useRef(null);
  const [previousMessage, setPreviousMessage] = useState([]);
  const [seenAllChat, setSeenAllChat] = useState(false);
  const [messageLoading, setMessageLoading] = useState(false);
  const [socketLoader, setSocketLoader] = useState(false);
  const [displayTicker, setDisplayTicker] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [inputMessage, setInputMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  // Redux state
  const isDarkMode = useSelector(state => state.global.isDarkMode);
  const {newMessage, socket, roomId, allChat, page} = useSelector(
    state => state.global,
  );
  const dispatch = useDispatch();

  // Voice recognition setup
  useEffect(() => {
    // Only setup Voice if platform permissions are granted
    const setupVoice = async () => {
      try {
        // Check for permissions first (this is just a placeholder, actual implementation depends on RN version)
        const permissions = Platform.select({
          ios: async () => {
            // On iOS, Voice.isAvailable() checks for permissions
            const isAvailable = await Voice.isAvailable();
            return isAvailable;
          },
          android: async () => {
            // Android requires separate permission check, which Voice handles internally
            return true;
          },
          default: async () => false,
        });
        const hasPermissions = await permissions();
        if (hasPermissions) {
          Voice.onSpeechStart = onSpeechStart;
          Voice.onSpeechResults = onSpeechResults;
          Voice.onSpeechEnd = onSpeechEnd;
          Voice.onSpeechError = onSpeechError;
        } else {
          console.warn('Speech recognition permissions not granted');
        }
      } catch (error) {
        console.error('Error setting up speech recognition:', error);
      }
    };
    setupVoice();
    return () => {
      // Cleanup voice handlers when component unmounts
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  // Voice recognition event handlers
  const onSpeechStart = () => {
    setIsRecording(true);
  };

  const onSpeechResults = event => {
    const speech = event.value[0];
    setInputMessage(speech); // Set recognized text as input message
  };

  const onSpeechEnd = () => {
    setIsRecording(false);
  };

  const onSpeechError = error => {
    setIsRecording(false);
    console.error('Speech Recognition Error: ', error);
  };

  // Function to start speech recognition
  const startRecording = async () => {
    try {
      // First check if the device is available for speech recognition
      const isAvailable = await Voice.isAvailable();
      if (!isAvailable) {
        // Handle case where speech recognition is not available
        console.warn('Speech recognition is not available on this device');
        setErrorMessage('Speech recognition is not available');
        return;
      }
      setInputMessage(''); // Clear the input field before recording
      setIsRecording(true); // Set recording state before we actually call Voice.start()
      try {
        await Voice.start('en-US'); // Start recognizing speech
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        // Check for specific error codes
        if (error.code === 'permissions') {
          setErrorMessage(
            'Microphone permission denied. Please enable it in settings.',
          );
        } else {
          setErrorMessage('Could not start recording. Please try again.');
        }
        // Reset recording state
        setIsRecording(false);
      }
    } catch (e) {
      console.error('Failed to check voice availability:', e);
      setErrorMessage('Could not access speech recognition');
    }
  };

  // Function to stop speech recognition
  const stopRecording = async () => {
    if (!isRecording) return;
    try {
      await Voice.stop(); // Stop recognizing speech
    } catch (error) {
      console.error('Error stopping speech recognition: ', error);
    }
  };

  // Important: Set conversation ID in Redux state when component mounts or ID changes
  useEffect(() => {
    if (conversationId) {
      console.log('Setting roomId in Redux to:', conversationId);
      dispatch(setRoomId(conversationId));
      if (conversationId !== roomId) {
        console.log('Clearing previous chat messages');
        dispatch(setAllChat([])); // Clear previous conversation messages
      }
    } else {
      console.warn('No conversationId provided in route params!');
    }
  }, [conversationId, dispatch, roomId]);

  // Queries - Make sure to use the conversationId directly from route params
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

  // Debug logs - Keep these to help diagnose issues
  console.log('Room message data:', roomMessage?.data);
  console.log('Room conversation ID:', conversationId);
  console.log(
    'Current socket connection status:',
    socket ? 'Connected' : 'Not connected',
  );
  console.log('Current Redux roomId:', roomId);
  console.log('Current page:', page);

  // Create a component to render HTML content with react-native-render-html
  const HTMLRenderer = ({htmlContent}) => {
    // If no content or not HTML, just render as plain text

    // Sanitize HTML content
    const sanitizedHtml = simpleSanitizeHtml(htmlContent);

    // Define tag styles for HTML elements
    const tagsStyles = {
      body: {
        color: isDarkMode ? '#FFFFFF' : '#000000',
        fontSize: 16,
      },
      p: {
        marginBottom: 10,
        lineHeight: 22,
      },
      h1: {
        fontSize: 24,
        fontWeight: 'bold',
        marginVertical: 10,
        color: isDarkMode ? '#FFFFFF' : '#000000',
      },
      h2: {
        fontSize: 20,
        fontWeight: 'bold',
        marginVertical: 8,
        color: isDarkMode ? '#FFFFFF' : '#000000',
      },
      h3: {
        fontSize: 18,
        fontWeight: 'bold',
        marginVertical: 6,
        color: isDarkMode ? '#FFFFFF' : '#000000',
      },
      h4: {
        fontSize: 16,
        fontWeight: 'bold',
        marginVertical: 5,
        color: isDarkMode ? '#FFFFFF' : '#000000',
      },
      h5: {
        fontSize: 14,
        fontWeight: 'bold',
        marginVertical: 4,
        color: isDarkMode ? '#FFFFFF' : '#000000',
      },
      h6: {
        fontSize: 13,
        fontWeight: 'bold',
        marginVertical: 3,
        color: isDarkMode ? '#FFFFFF' : '#000000',
      },
      a: {
        color: '#2c83f6',
        textDecorationLine: 'underline',
      },
      ul: {
        marginVertical: 8,
        paddingLeft: 16,
      },
      ol: {
        marginVertical: 8,
        paddingLeft: 16,
      },
      li: {
        marginBottom: 4,
      },
      // Bold styling
      b: {
        fontWeight: 'bold',
      },
      strong: {
        fontWeight: 'bold',
      },
      // Italic styling
      i: {
        fontStyle: 'italic',
      },
      em: {
        fontStyle: 'italic',
      },
      // Underline
      u: {
        textDecorationLine: 'underline',
      },
      // Strikethrough
      s: {
        textDecorationLine: 'line-through',
      },
      strike: {
        textDecorationLine: 'line-through',
      },
      del: {
        textDecorationLine: 'line-through',
      },
      // Table styling
      table: {
        borderWidth: 1,
        borderColor: isDarkMode ? '#444' : '#DDD',
        marginVertical: 10,
        borderRadius: 4,
        overflow: 'hidden',
        width: '100%',
      },
      thead: {
        backgroundColor: isDarkMode ? '#333' : '#F5F5F5',
      },
      tbody: {
        backgroundColor: isDarkMode ? '#222' : '#FFFFFF',
      },
      tr: {
        flexDirection: 'row',
      },
      th: {
        padding: 8,
        fontWeight: 'bold',
        borderWidth: 1,
        borderColor: isDarkMode ? '#444' : '#DDD',
        color: isDarkMode ? '#FFF' : '#333',
      },
      td: {
        padding: 8,
        borderWidth: 1,
        borderColor: isDarkMode ? '#444' : '#DDD',
      },
      // Code styling
      code: {
        fontFamily: 'Courier',
        backgroundColor: isDarkMode ? '#333' : '#F5F5F5',
        padding: 2,
        borderRadius: 3,
        fontSize: 14,
      },
      pre: {
        backgroundColor: isDarkMode ? '#333' : '#F5F5F5',
        padding: 10,
        borderRadius: 4,
        marginVertical: 8,
        overflow: 'scroll',
      },
      // Blockquote styling
      blockquote: {
        borderLeftWidth: 4,
        borderLeftColor: isDarkMode ? '#555' : '#DDD',
        paddingLeft: 12,
        marginLeft: 0,
        marginVertical: 8,
        fontStyle: 'italic',
      },
      // Definition lists
      dl: {
        marginVertical: 8,
      },
      dt: {
        fontWeight: 'bold',
        marginTop: 8,
      },
      dd: {
        marginLeft: 16,
      },
      // Horizontal rule
      hr: {
        borderBottomWidth: 1,
        borderBottomColor: isDarkMode ? '#555' : '#DDD',
        marginVertical: 12,
      },
      // Superscript and subscript
      sup: {
        fontSize: 10,
        lineHeight: 14,
      },
      sub: {
        fontSize: 10,
        lineHeight: 14,
      },
      // Mark (highlighted text)
      mark: {
        backgroundColor: '#FFEB3B',
        color: '#000000',
        padding: 0,
        borderRadius: 2,
      },
      // Abbreviation
      abbr: {
        textDecorationLine: 'underline',
        textDecorationStyle: 'dotted',
      },
      // Figure and figcaption
      figure: {
        marginVertical: 10,
      },
      figcaption: {
        fontSize: 12,
        fontStyle: 'italic',
        textAlign: 'center',
        marginTop: 4,
      },
      // Address
      address: {
        fontStyle: 'italic',
        marginVertical: 8,
      },
      // Citations
      cite: {
        fontStyle: 'italic',
      },
      // Quotes
      q: {
        fontStyle: 'italic',
      },
      // Details and summary
      details: {
        marginVertical: 8,
      },
      summary: {
        fontWeight: 'bold',
      },
    };

    // Base style for all text content
    const baseStyle = {
      color: isDarkMode ? '#FFFFFF' : '#000000',
      fontSize: 16,
    };

    try {
      return (
        <RenderHtml
          contentWidth={width - 80} // Adjust based on your bubble width
          source={{html: sanitizedHtml}}
          tagsStyles={tagsStyles}
          baseStyle={baseStyle}
          enableExperimentalBRCollapsing={true}
          enableExperimentalGhostLinesPrevention={true}
          defaultTextProps={{
            selectable: true, // Make text selectable
          }}
          // Handle links if needed
          renderersProps={{
            a: {
              onPress: (event, href) => {
                console.log('Link pressed:', href);
                // Add your link handling logic here if needed
              },
            },
          }}
          // Ignore potentially dangerous tags
          ignoredTags={['script', 'iframe']}
        />
      );
    } catch (error) {
      console.error('Error rendering HTML:', error);
      // Fallback to plain text if rendering fails
      return (
        <Text
          style={[
            styles.messageText,
            isDarkMode ? styles.textDark : styles.textLight,
          ]}>
          {htmlContent
            .replace(/<[^>]*>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()}
        </Text>
      );
    }
  };

  // Send message to the socket
  const sendMessage = useCallback(
    message => {
      if (!socket) {
        console.error('Cannot send message - socket is not connected');
        setErrorMessage('Connection issue. Please try again.');
        return;
      }

      if (!conversationId) {
        console.error('Cannot send message - no conversation ID');
        setErrorMessage('Conversation error. Please restart the chat.');
        return;
      }

      console.log('Sending message to room:', conversationId);
      setSocketLoader(true);
      socket.emit(SOCKET_EVENTS.QUERY_SEND, {
        message,
        roomId: conversationId, // Use conversationId directly from route
        messages: allChat || [],
      });
    },
    [socket, conversationId, allChat],
  );

  // Handle new AI response
  const handleResponse = useCallback(
    message => {
      console.log('Received message from socket:', message);
      console.log('Current conversation ID:', conversationId);

      // If the response is for a room other than the currently active room,
      // clear any loading states and ignore this message.
      if (message?.roomId !== conversationId) {
        console.log('Message is for different room, ignoring');
        setSocketLoader(false);
        setMessageLoading(false);
        return;
      }

      // The response is for the current room—proceed with normal processing.
      console.log('Processing message for current room');
      setMessageLoading(true);
      const chatArr = allChat || []; // Handle potential undefined
      setDisplayTicker(message?.ticker);

      dispatch(
        setAllChat([
          ...chatArr,
          {
            sender: 'AI',
            message: message?.message || '',
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

  // Listen for responses in the room - FIXED to properly clean up listeners
  const listenRoom = useCallback(() => {
    if (socket) {
      console.log('Setting up socket listener for room:', conversationId);
      socket.on(SOCKET_EVENTS.QUERY_RESPONSE, handleResponse);
      return () => {
        console.log('Cleaning up socket listener for room:', conversationId);
        socket.off(SOCKET_EVENTS.QUERY_RESPONSE, handleResponse);
      };
    }
    return () => {}; // Always return a cleanup function
  }, [socket, handleResponse, conversationId]);

  // Effect: attach/detach the room listener - only one listener should be created
  useEffect(() => {
    const cleanup = listenRoom();
    return cleanup;
  }, [listenRoom]);

  // Effect: if newMessage is set externally, send it once
  // IMPORTANT: mirroring the web client approach by NOT including sendMessage in dependencies
  useEffect(() => {
    if (newMessage && socket && conversationId) {
      console.log('New message detected, sending:', newMessage);
      sendMessage(newMessage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newMessage, socket, conversationId]); // Removed sendMessage from dependencies!

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

    // Add user message to chat first
    dispatch(setAllChat([...allChat, {sender: 'User', message: inputMessage}]));

    // Then send to server
    sendMessage(inputMessage);
    setInputMessage('');
    setTimeout(() => {
      scrollToBottom();
    }, 100);

    setInputMessage('');
  };

  // Load older messages if user scrolls to the top
  useEffect(() => {
    if (
      roomMessage?.data?.messages?.length > 0 &&
      previousMessage &&
      !isFetching
    ) {
      console.log('Loading older messages:', roomMessage.data.messages.length);
      const arr = roomMessage.data.messages.map(messageInfo => {
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
      console.log('Component unmounting, clearing chat');
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
      console.log('Scrolled to top, loading more messages');
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
                    <Image
                      style={styles.aiIcon}
                      source={
                        isDarkMode
                          ? require('../assets/images/ConversationLogoDark.svg')
                          : require('../assets/images/ConversationLogo.svg')
                      }
                    />
                    <View style={styles.aiIconContainer}></View>
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
                            ? require('../assets/images/LightIcon.png')
                            : require('../assets/images/LightIcon.png')
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
                        {' '}
                        <HTMLRenderer htmlContent={item?.message} />
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

        {/* Input component */}
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
    backgroundColor: '#FFFFFF',
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
    marginTop: 12,
  },
  aiIconContainer: {
    width: 30,
    height: 30,
    marginLeft: 14,
    marginBottom: 14,
    justifyContent: 'flex-start',
  },
  aiIcon: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
    display: 'block',
  },
  aiMessageContainer: {
    flex: 1,
    marginTop: 4,
    marginLeft: 12,
  },
  aiMessageText: {
    borderRadius: 18,
    maxWidth: '100%',
  },
  aiMessageTextDark: {},
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
  tableContainer: {
    borderWidth: 1,
    borderColor: '#DDD',
    marginVertical: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
});

export default ConversationScreen;
