import React, {useEffect, useState, useRef, useCallback} from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  KeyboardAvoidingView,
  Platform,
  Text,
  TouchableOpacity,
  Keyboard,
  Animated,
  Easing,
  TouchableWithoutFeedback,
} from 'react-native';
import Voice from 'react-native-voice';
import InputComponent from '../assets/components/InputComponent';
import {useSelector, useDispatch} from 'react-redux';
import {SOCKET_EVENTS} from '../utils/Constants';
import {setNewMessage, setRoomId} from '../slices/globalSlice';
import chatApi from '../services/chat';

const HomeScreen = ({navigation}) => {
  // Use Redux global state for dark mode instead of device settings
  const isDarkMode = useSelector(state => state.global.isDarkMode);
  const socket = useSelector(state => state.global.socket);
  const dispatch = useDispatch();

  const [prompt, setPrompt] = useState('');
  const [image, setImage] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isRecording, setIsRecording] = useState(false);

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
    startCircleAnimation();
  };

  const onSpeechResults = event => {
    const speech = event.value[0];
    setPrompt(speech); // Set recognized text as prompt
  };

  const onSpeechEnd = () => {
    setIsRecording(false);
    stopCircleAnimation();
  };

  const onSpeechError = error => {
    setIsRecording(false);
    stopCircleAnimation();
    console.error('Speech Recognition Error: ', error);
  };

  // Listen for room creation event from socket
  const listenRoom = useCallback(() => {
    if (socket) {
      console.log('Setting up ROOM_CREATED listener');

      socket.on(SOCKET_EVENTS.ROOM_CREATED, message => {
        console.log('ROOM_CREATED event received!', message);
        console.log('Room ID:', message?.roomId);
        dispatch(setRoomId(message?.roomId));
        dispatch(chatApi?.util?.resetApiState());
        navigation.navigate('Room', {conversationId: message?.roomId});
      });

      return () => {
        console.log('Cleaning up ROOM_CREATED listener');
        socket.off(SOCKET_EVENTS.ROOM_CREATED);
      };
    }
    return () => {}; // Always return a cleanup function
  }, [socket, dispatch, navigation]);
  // Effect: attach/detach the room listener
  useEffect(() => {
    const cleanup = listenRoom();
    return cleanup;
  }, [listenRoom]);
  // Send message to create a new room
  const sendMessage = useCallback(
    message => {
      if (!socket) {
        console.error('Cannot send message - socket is not connected');
        setError('Connection issue. Please try again.');
        return false;
      }
      console.log('Sending ROOM_CREATE event with message:', message);
      // Emit the ROOM_CREATE event (same as in web version)
      socket.emit(SOCKET_EVENTS.ROOM_CREATE, {
        message,
      });
      console.log('ROOM_CREATE event sent!');

      return true;
    },
    [socket],
  );

  // Function to start speech recognition
  const startRecording = async () => {
    try {
      // First check if the device is available for speech recognition
      const isAvailable = await Voice.isAvailable();
      if (!isAvailable) {
        // Handle case where speech recognition is not available
        console.warn('Speech recognition is not available on this device');
        setError('Speech recognition is not available');
        return;
      }
      setPrompt(''); // Clear the input field before recording
      setIsRecording(true); // Set recording state before we actually call Voice.start()
      startCircleAnimation(); // Start the animation
      try {
        await Voice.start('en-US'); // Start recognizing speech
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        // Check for specific error codes
        if (error.code === 'permissions') {
          setError(
            'Microphone permission denied. Please enable it in settings.',
          );
        } else {
          setError('Could not start recording. Please try again.');
        }
        // Reset recording state
        setIsRecording(false);
        stopCircleAnimation();
      }
    } catch (e) {
      console.error('Failed to check voice availability:', e);
      setError('Could not access speech recognition');
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

  // For animated recording indicator
  const animatedCircle = useRef(new Animated.Value(1)).current;

  const startCircleAnimation = () => {
    // Create a loop animation for the pulsing effect
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedCircle, {
          toValue: 1.5, // Grow the circle
          duration: 500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(animatedCircle, {
          toValue: 1, // Shrink the circle back to normal
          duration: 500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  };

  const stopCircleAnimation = () => {
    // Stop any running animations and reset the circle
    animatedCircle.stopAnimation();
    Animated.timing(animatedCircle, {
      toValue: 1, // Return the circle to its original size
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  // Main area shows centered content initially
  // Once user has entered a response, show the response
  const showResponseArea = response || image || loading;

  // Function to dismiss keyboard
  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  // Function to handle send button press - this now creates a room
  const handleSendPress = () => {
    if (prompt.trim() !== '') {
      stopRecording(); // Ensure recording is stopped

      // Set loading state
      setLoading(true);

      // Send message to create a new room
      const sent = sendMessage(prompt);
      // Store message in Redux (same as web app)
      dispatch(setNewMessage(prompt));
      if (!sent) {
        // If message couldn't be sent, reset loading state
        setLoading(false);
        setError('Failed to connect to server');
      }

      // Clear the input after sending
      setPrompt('');
      Keyboard.dismiss();
    }
  };

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <KeyboardAvoidingView
        style={!isDarkMode ? styles.containerLight : styles.containerDark}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={10}>
        {/* If no response, show centered elements */}
        {!showResponseArea && (
          <View style={styles.centeredContentContainer}>
            {/* Logo and Header Section */}
            <View style={styles.headerContainerMobile}>
              <Text
                style={
                  isDarkMode ? styles.headerTitleDark : styles.headerTitleLight
                }>
                Satoshi <Text style={styles.highlight}>GPT</Text>
              </Text>
              <Text
                style={isDarkMode ? styles.subtitleDark : styles.subtitleLight}>
                Your Crypto Friend
                {/* I am an AI agent that provides real-time crypto market analysis,
                on-chain insights, autonomous trading, and social sentiment
                tracking. */}
              </Text>
            </View>

            {/* Input Component */}
            <InputComponent
              prompt={prompt}
              setPrompt={setPrompt}
              isRecording={isRecording}
              setIsRecording={setIsRecording}
              loading={loading}
              startRecording={startRecording}
              stopRecording={stopRecording}
              onSendPress={handleSendPress}
              isDarkMode={isDarkMode}
            />
          </View>
        )}

        {/* Response area - Show only when there's a response */}
        {showResponseArea && (
          <ScrollView
            contentInsetAdjustmentBehavior="automatic"
            style={styles.conversationContainer}>
            {isRecording ? (
              <View style={styles.animatedContainer}>
                <TouchableOpacity onPress={stopRecording}>
                  <Animated.View
                    style={[
                      styles.animatedCircle,
                      {transform: [{scale: animatedCircle}]},
                    ]}
                  />
                  <Text style={styles.recordingText}>
                    Listening... Tap to stop
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>{error && <Text style={styles.errorText}>{error}</Text>}</>
            )}
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  containerLight: {
    flex: 1,
    backgroundColor: 'white',
  },
  containerDark: {
    flex: 1,
    backgroundColor: 'black',
  },
  centeredContentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 100,
  },
  headerContainerMobile: {
    alignItems: 'center',
    marginBottom: 0,
  },
  headerTitleLight: {
    fontFamily: 'Parsi',
    color: '#010102',
    fontWeight: '700',
    fontSize: 28,
    marginBottom: 10,
  },
  headerTitleDark: {
    fontFamily: 'Parsi',
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 28,
    marginBottom: 10,
  },
  subtitleLight: {
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  subtitleDark: {
    color: '#AAA',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  highlight: {
    color: '#2c83f6',
  },
  conversationContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  animatedContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginTop: 100,
  },
  animatedCircle: {
    position: 'relative',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 122, 255, 0.5)',
  },
  recordingText: {
    color: 'white',
    marginTop: 70,
    textAlign: 'center',
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginVertical: 10,
  },
  // Suggestions styles
  suggestionsContainer: {
    width: '100%',
    marginTop: 20,
    paddingHorizontal: 10,
  },
});

export default HomeScreen;
