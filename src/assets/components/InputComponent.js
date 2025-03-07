import React, {useRef} from 'react';
import {
  StyleSheet,
  TextInput,
  View,
  useColorScheme,
  Text,
  TouchableOpacity,
  Animated,
  Easing,
} from 'react-native';

const InputComponent = ({
  prompt,
  setPrompt,
  isRecording,
  setIsRecording,
  loading,
  startRecording,
  stopRecording,
  onSendPress,
}) => {
  const isDarkMode = useColorScheme() === 'light';
  // For animated record button ring
  const animatedRing = useRef(new Animated.Value(0)).current;

  const startCircleAnimation = () => {
    // Create animation for the record button ring
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedRing, {
          toValue: 1, // Full opacity
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(animatedRing, {
          toValue: 0.3, // Low opacity
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  };

  const stopCircleAnimation = () => {
    // Stop any running animations and reset the circle
    animatedRing.stopAnimation();

    Animated.timing(animatedRing, {
      toValue: 0, // Hide the ring
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  // Start animation when recording starts
  if (isRecording) {
    startCircleAnimation();
  }

  return (
    <View
      style={
        isDarkMode
          ? styles.inputContainerDarkMobile
          : styles.inputContainerMobile
      }>
      <View style={styles.inputWrapperMobile}>
        {/* White "X" button for clearing input or canceling recording - only visible when there's text */}
        {(prompt.trim() !== '' || isRecording) && (
          <TouchableOpacity
            onPress={() => {
              if (isRecording) {
                // Cancel recording
                stopRecording();
                setPrompt('');
              } else {
                // Clear input box
                setPrompt('');
              }
            }}
            style={styles.clearButton}
            disabled={loading && !isRecording}>
            <Text style={styles.clearButtonText}>X</Text>
          </TouchableOpacity>
        )}

        <TextInput
          style={[styles.input, isDarkMode && styles.inputDark]}
          placeholder="Ask Satoshi GPT"
          placeholderTextColor="#888"
          value={prompt}
          onChangeText={text => setPrompt(text)}
          editable={!loading}
          textAlign="left"
          textAlignVertical="center"
        />
      </View>

      {/* Record button with the same design as send button but red */}
      <View style={styles.buttonContainer}>
        {isRecording && (
          <Animated.View
            style={[
              styles.recordingRing,
              {
                opacity: animatedRing,
                transform: [
                  {
                    scale: Animated.add(
                      1,
                      Animated.multiply(animatedRing, 0.3),
                    ),
                  },
                ],
              },
            ]}
          />
        )}

        <TouchableOpacity
          onPress={() => {
            if (isRecording) {
              // Cancel recording when already recording
              stopRecording();
              setPrompt('');
            } else {
              // Start recording when not recording
              startRecording();
            }
          }}
          style={[
            styles.actionButtonRecord,
            styles.recordButton,
            isRecording && styles.recordingButton,
          ]}
          disabled={loading}>
          <Text style={styles.buttonIconText}>↑</Text>
        </TouchableOpacity>
      </View>

      {/* Send button */}
      <TouchableOpacity
        onPress={onSendPress}
        style={[
          styles.actionButton,
          styles.sendIcon,
          prompt.trim() === '' && styles.sendIconDisabled,
        ]}
        disabled={loading || prompt.trim() === ''}>
        <Text style={styles.buttonIconText}>↑</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainerMobile: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '90%',
    maxWidth: 745,
    height: 66,
    paddingLeft: 24,
    paddingRight: 8,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#f1f1f1',
    backgroundColor: '#f9f9f9',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    alignSelf: 'center',
  },
  inputContainerDarkMobile: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '90%',
    maxWidth: 745,
    height: 66,
    paddingLeft: 24,
    paddingRight: 8,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#202324',
    backgroundColor: '#171a1b',
    alignSelf: 'center',
  },
  inputWrapperMobile: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    width: '90%',
  },
  input: {
    flex: 1,
    color: '#333333',
    paddingVertical: 15,
    fontSize: 14,
    textAlign: 'left',
  },
  inputDark: {
    color: 'white',
  },
  sendIcon: {
    backgroundColor: '#2c83f6',
  },
  sendIconDisabled: {
    backgroundColor: '#444', // Darker color when disabled
  },
  buttonContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  recordingRing: {
    position: 'absolute',
    width: 45,
    height: 45,
    borderRadius: 22.5,
    borderWidth: 2,
    borderColor: 'rgba(255, 0, 0, 0.7)',
    backgroundColor: 'transparent',
    marginRight: 3,
    zIndex: 1,
  },
  actionButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: 35,
    width: 35,
    borderRadius: 17.5,
    marginRight: 5,
  },
  actionButtonRecord: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: 38,
    width: 38,
    borderRadius: 19,
  },
  recordButton: {
    borderWidth: 2,
    borderColor: 'rgba(138, 138, 138, 0.11)',
    marginRight: 3,
  },
  recordingButton: {
    backgroundColor: '#990000', // Darker red when
    zIndex: 2,
  },
  buttonIconText: {
    color: 'white',
    fontSize: 15,
  },
  clearButton: {
    paddingHorizontal: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default InputComponent;
