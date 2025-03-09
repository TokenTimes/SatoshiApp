import React, {useRef, useState, useEffect} from 'react';
import {
  StyleSheet,
  TextInput,
  View,
  Text,
  TouchableOpacity,
  Animated,
  Easing,
  Image,
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
  isDarkMode,
}) => {
  // For animated record button ring
  const animatedRing = useRef(new Animated.Value(0)).current;
  const [inputHeight, setInputHeight] = useState(40); // Initial height
  const textInputRef = useRef(null);

  const startCircleAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedRing, {
          toValue: 1,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(animatedRing, {
          toValue: 0.3,
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

  useEffect(() => {
    if (isRecording) {
      startCircleAnimation();
    } else {
      stopCircleAnimation();
    }
  }, [isRecording]);

  const handleContentSizeChange = event => {
    const {height} = event.nativeEvent.contentSize;
    const newHeight = Math.min(Math.max(40, height), 180);
    setInputHeight(newHeight);
  };

  return (
    <View
      style={[
        isDarkMode
          ? styles.inputContainerDarkMobile
          : styles.inputContainerMobile,
      ]}>
      <View style={styles.inputWrapperMobile}>
        {/* Clear button (X) - redesigned to be more elegant */}
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
                // Reset height when clearing
                setInputHeight(40);
              }
            }}
            style={[
              styles.clearButton,
              isDarkMode ? styles.clearButtonDark : styles.clearButtonLight,
            ]}
            disabled={loading && !isRecording}>
            <Text
              style={[
                styles.clearButtonText,
                isDarkMode
                  ? styles.clearButtonTextDark
                  : styles.clearButtonTextLight,
              ]}>
              ✕
            </Text>
          </TouchableOpacity>
        )}

        <TextInput
          ref={textInputRef}
          style={[
            styles.input,
            isDarkMode && styles.inputDark,
            {height: inputHeight},
          ]}
          placeholder="Ask Satoshi GPT"
          placeholderTextColor="#888"
          value={prompt}
          onChangeText={text => setPrompt(text)}
          editable={!loading}
          multiline={true}
          onContentSizeChange={handleContentSizeChange}
          scrollEnabled={true} // Enable scrolling within TextInput
        />
      </View>

      <View style={styles.actionsContainer}>
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
                stopRecording();
                setPrompt('');
              } else {
                startRecording();
              }
            }}
            style={[
              styles.actionButtonRecord,
              !isDarkMode ? styles.recordButton : styles.recordButtonDark,
              isRecording && styles.recordingButton,
            ]}
            disabled={loading}>
            <Image
              source={require('../Icons/microphone-red.png')}
              style={styles.microphoneIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={onSendPress}
          style={[
            styles.actionButton,
            styles.sendIcon,
            prompt.trim() === '' && styles.sendIconDisabled,
          ]}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
          disabled={loading || prompt.trim() === ''}>
          <Text style={styles.buttonIconText}>↑</Text>
        </TouchableOpacity>
      </View>
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
    paddingLeft: 24,
    paddingRight: 8,
    paddingVertical: 13,
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
    paddingLeft: 24,
    paddingRight: 8,
    paddingVertical: 13,
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
    paddingTop: 13,
  },
  inputWrapperMobile: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start', // Changed to flex-start for multiline alignment
    width: '80%',
  },
  input: {
    flex: 1,
    color: '#333333',
    fontSize: 14,
    textAlign: 'left',
    marginTop: 10,
    paddingBottom: 10, // Added bottom padding for better text visibility
    textAlignVertical: 'top', // Changed to top for better multiline alignment
    marginRight: 10,
  },
  inputDark: {
    color: 'white',
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: '100%',
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
    width: 40,
    height: 40,
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
    height: 40,
    width: 40,
    borderRadius: 20,
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
    borderColor: 'rgba(255, 0, 0, 0.12)',
    marginRight: 3,
    backgroundColor: 'white',
  },
  recordButtonDark: {
    borderWidth: 2,
    borderColor: 'rgba(138, 138, 138, 0.11)',
    marginRight: 3,
    backgroundColor: 'rgba(255, 0, 0, 0.2)',
  },
  recordingButton: {
    backgroundColor: 'rgb(255, 0, 0)',
    zIndex: 2,
  },
  buttonIconText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  clearButton: {
    height: 20,
    width: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginTop: 15,
  },
  clearButtonLight: {
    backgroundColor: '#e0e0e0',
  },
  clearButtonDark: {
    backgroundColor: '#444',
  },
  clearButtonText: {
    fontSize: 10,
    fontWeight: '600',
    lineHeight: 20,
    textAlign: 'center',
  },
  clearButtonTextLight: {
    color: '#555',
  },
  clearButtonTextDark: {
    color: '#f0f0f0',
  },
  microphoneIcon: {
    width: 18,
    height: 18,
  },
});

export default InputComponent;
