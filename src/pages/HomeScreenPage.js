import React, {useEffect, useState, useRef} from 'react';
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
import {useSelector} from 'react-redux';

const HomeScreen = ({navigation}) => {
  // Use Redux global state for dark mode instead of device settings
  const isDarkMode = useSelector(state => state.global.isDarkMode);
  const [prompt, setPrompt] = useState('');
  const [image, setImage] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [link, setLink] = useState('');
  const [expanded, setExpanded] = useState(false);

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

  const taskList = [
    'Conducting web research',
    'Composing a draft article',
    'Verifying factual accuracy',
    'Editing and refining the content',
    'Applying formatting and structure',
    'Designing and creating visuals',
    'Publishing the article to the website',
    'Completed!',
  ];

  // Suggestion list
  const suggestions = [
    "What's the current price of Bitcoin (BTC)?",
    'Show me the top 5 holders of Shiba Inu.',
    'Show me the top 10 cryptocurrencies by market cap.',
    "What's the trading volume of Solana (SOL) today?",
    'Which tokens have gained the most in the last 24 hours?',
  ];

  // Display limited suggestions initially, or all if "Show More" was clicked
  const displaySuggestions = expanded ? suggestions : suggestions.slice(0, 5);

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  useEffect(() => {
    let interval;
    if (loading) {
      interval = setInterval(() => {
        if (stepIndex < taskList.length - 2) {
          setStatus([{step: taskList[stepIndex]}]);
          setStepIndex(prevStepIndex => prevStepIndex + 1);
        }
      }, 6000);
    }
    return () => clearInterval(interval);
  }, [loading, stepIndex, taskList]);

  useEffect(() => {
    if (image && response) {
      setStepIndex(prevStepIndex => prevStepIndex + 2);
    }
  }, [image, response]);

  const resetStatus = () => {
    setStepIndex(0);
    setStatus([{step: taskList[0]}]);
  };

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

  const StatusComponent = ({taskList, stepIndex, link}) => (
    <View style={styles.statusContainer}>
      <Text style={styles.statusText}>{taskList[stepIndex]}</Text>
      {link && <Text style={styles.linkText}>{link}</Text>}
    </View>
  );

  // Main area shows centered content initially
  // Once user has entered a response, show the response
  const showResponseArea = response || image || loading;

  // Function to dismiss keyboard
  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  // Function to handle send button press
  const handleSendPress = () => {
    if (prompt.trim() !== '') {
      stopRecording(); // Ensure recording is stopped
      resetStatus();
      setLink('');
      // Simulate API call logic
      setLoading(true);
      setTimeout(() => {
        setResponse('Example response');
        setLoading(false);
        // Example of navigation after response
        // navigation.navigate('ResultScreen', { response: 'Example response' });
      }, 2000);
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
            </View>
            {/* Use the InputComponent here */}
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
            {/* Theme Toggle and Logout Button removed from here */}
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
              <>
                <StatusComponent
                  taskList={taskList}
                  stepIndex={stepIndex}
                  link={link}
                />
                {error && <Text style={styles.errorText}>{error}</Text>}
              </>
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
    marginBottom: 10, // Space between logo and input
  },
  headerTitleLight: {
    fontFamily: 'Parsi',
    color: '#010102',
    fontWeight: '700',
    fontSize: 28,
  },
  headerTitleDark: {
    fontFamily: 'Parsi',
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 28,
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
  statusContainer: {
    alignItems: 'center',
    padding: 20,
  },
  statusText: {
    color: 'white',
    fontSize: 16,
    marginBottom: 10,
  },
  linkText: {
    color: '#2c83f6',
    fontSize: 14,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginVertical: 10,
  },
  navigationButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '80%',
    marginTop: 20,
  },
  navButton: {
    backgroundColor: '#2c83f6',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  navButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Removed theme toggle and logout styles
});

export default HomeScreen;
