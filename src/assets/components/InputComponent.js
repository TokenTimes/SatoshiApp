import React, {useRef, useState} from 'react';
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
import WhisperComponent from '../../pages/WhisperComponent';

const InputComponent = ({
  prompt,
  setPrompt,
  loading,
  onSendPress,
  isDarkMode,
}) => {
  const [inputHeight, setInputHeight] = useState(40);
  const textInputRef = useRef(null);

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
        {prompt.trim() !== '' && (
          <TouchableOpacity
            onPress={() => {
              setPrompt('');
              setInputHeight(40);
            }}
            style={[
              styles.clearButton,
              isDarkMode ? styles.clearButtonDark : styles.clearButtonLight,
            ]}
            disabled={loading}>
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
          onChangeText={setPrompt}
          editable={!loading}
          multiline={true}
          onContentSizeChange={handleContentSizeChange}
          scrollEnabled={true}
        />
      </View>

      <View style={styles.actionsContainer}>
        <WhisperComponent setPrompt={setPrompt} />

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
    borderColor: '#202324',
    backgroundColor: '#171a1b',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    alignSelf: 'center',
  },
  inputWrapperMobile: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: '80%',
  },
  input: {
    flex: 1,
    color: '#333333',
    fontSize: 14,
    marginTop: 10,
    paddingBottom: 10,
    textAlignVertical: 'top',
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
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    width: 40,
    borderRadius: 20,
    marginRight: 5,
  },
  sendIcon: {
    backgroundColor: '#2c83f6',
  },
  sendIconDisabled: {
    backgroundColor: '#444',
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
  },
  clearButtonTextLight: {color: '#555'},
  clearButtonTextDark: {color: '#f0f0f0'},
});

export default InputComponent;
