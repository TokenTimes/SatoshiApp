import React, {useState, useRef} from 'react';
import {
  View,
  TouchableOpacity,
  Animated,
  Easing,
  Image,
  StyleSheet,
  Platform,
} from 'react-native';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import axios from 'axios';

const audioRecorderPlayer = new AudioRecorderPlayer();

const WhisperComponent = ({setPrompt}) => {
  const [isRecording, setIsRecording] = useState(false);
  const animatedRing = useRef(new Animated.Value(0)).current;

  const startRecording = async () => {
    try {
      const path = Platform.select({
        ios: 'audio.m4a',
        android: 'sdcard/audio.m4a',
      });
      await audioRecorderPlayer.startRecorder(path);
      audioRecorderPlayer.addRecordBackListener(() => {});
      setIsRecording(true);
      startCircleAnimation();
    } catch (err) {
      console.error('Recording Error:', err);
    }
  };

  const stopRecording = async () => {
    try {
      const audioPath = await audioRecorderPlayer.stopRecorder();
      audioRecorderPlayer.removeRecordBackListener();
      setIsRecording(false);
      stopCircleAnimation();

      const formData = new FormData();
      formData.append('file', {
        uri: Platform.OS === 'android' ? `file://${audioPath}` : audioPath,
        type: 'audio/m4a',
        name: 'speech.m4a',
      });

      const response = await axios.post(
        // 'https://api-test.olympus-demo.com/transcribe/audio',
        'http://localhost:3001/transcribe/audio',
        formData,
        {headers: {'Content-Type': 'multipart/form-data'}},
      );

      const transcript = response.data.transcript;
      setPrompt(transcript);
    } catch (err) {
      console.error('Transcription Error:', err);
    }
  };

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
    animatedRing.stopAnimation();
    Animated.timing(animatedRing, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View style={styles.buttonContainer}>
      {isRecording && (
        <Animated.View
          style={[
            styles.recordingRing,
            {
              opacity: animatedRing,
              transform: [
                {
                  scale: Animated.add(1, Animated.multiply(animatedRing, 0.3)),
                },
              ],
            },
          ]}
        />
      )}
      <TouchableOpacity
        onPress={isRecording ? stopRecording : startRecording}
        style={[
          styles.actionButtonRecord,
          isRecording && styles.recordingButton,
        ]}>
        <Image
          source={require('../assets/Icons/microphone-red.png')}
          style={styles.microphoneIcon}
          resizeMode="contain"
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
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
    zIndex: 1,
  },
  actionButtonRecord: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 38,
    width: 38,
    borderRadius: 19,
    borderWidth: 2,
    borderColor: 'rgba(255, 0, 0, 0.12)',
    backgroundColor: 'white',
    marginRight: 3,
  },
  recordingButton: {
    backgroundColor: 'rgb(255, 0, 0)',
    zIndex: 2,
  },
  microphoneIcon: {
    width: 18,
    height: 18,
  },
});

export default WhisperComponent;
