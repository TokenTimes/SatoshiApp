import React, {useEffect, useState, useCallback} from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  KeyboardAvoidingView,
  Platform,
  Text,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
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

  useEffect(() => {
    if (socket) {
      socket.on(SOCKET_EVENTS.ROOM_CREATED, message => {
        dispatch(setRoomId(message?.roomId));
        dispatch(chatApi?.util?.resetApiState());
        navigation.navigate('Room', {conversationId: message?.roomId});
      });
      return () => socket.off(SOCKET_EVENTS.ROOM_CREATED);
    }
  }, [socket, dispatch, navigation]);

  const sendMessage = useCallback(
    message => {
      if (!socket) {
        setError('Connection issue. Please try again.');
        return false;
      }
      socket.emit(SOCKET_EVENTS.ROOM_CREATE, {message});
      return true;
    },
    [socket],
  );

  const handleSendPress = () => {
    if (prompt.trim() !== '') {
      setLoading(true);
      const sent = sendMessage(prompt);
      dispatch(setNewMessage(prompt));
      if (!sent) {
        setLoading(false);
        setError('Failed to connect to server');
      }
      setPrompt('');
      Keyboard.dismiss();
    }
  };

  const dismissKeyboard = () => Keyboard.dismiss();

  const showResponseArea = response || image || loading;

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <KeyboardAvoidingView
        style={!isDarkMode ? styles.containerLight : styles.containerDark}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={10}>
        {!showResponseArea && (
          <View style={styles.centeredContentContainer}>
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
              </Text>
            </View>

            <InputComponent
              prompt={prompt}
              setPrompt={setPrompt}
              loading={loading}
              onSendPress={handleSendPress}
              isDarkMode={isDarkMode}
            />
          </View>
        )}

        {showResponseArea && (
          <ScrollView style={styles.conversationContainer}>
            {error && <Text style={styles.errorText}>{error}</Text>}
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  containerLight: {flex: 1, backgroundColor: 'white'},
  containerDark: {flex: 1, backgroundColor: 'black'},
  centeredContentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 100,
  },
  headerContainerMobile: {alignItems: 'center', marginBottom: 20},
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
  highlight: {color: '#2c83f6'},
  conversationContainer: {flex: 1, paddingHorizontal: 20},
  errorText: {color: 'red', textAlign: 'center', marginVertical: 10},
});

export default HomeScreen;
