import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
} from 'react-native';
import {useSelector} from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {
  useUpdateChatSettingMutation,
  useGetChatSettingQuery,
} from '../../services/user'; // Adjust path as needed

const ChatSetting = () => {
  const [updateChatSetting, {isLoading}] = useUpdateChatSettingMutation();
  const {data: chatSettings} = useGetChatSettingQuery();
  const isDarkMode = useSelector(state => state.global.isDarkMode);
  const isMobile = useSelector(state => state.global.isMobile);

  const [conversationTags, setConversationTags] = useState(false);
  const [displayHistory, setDisplayHistory] = useState(false);
  const [clearHistory, setClearHistory] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);

  useEffect(() => {
    if (chatSettings) {
      console.log(`chatSettings`, chatSettings);
      setConversationTags(chatSettings?.data?.displayChatHistory);
      setDisplayHistory(chatSettings?.data?.conversationTags);
      setClearHistory(chatSettings?.data?.clearChatHistory);
    }
  }, [chatSettings]);

  const handleSave = async () => {
    try {
      const response = await updateChatSetting({
        conversationTags: conversationTags,
        displayChatHistory: displayHistory,
        clearChatHistory: clearHistory,
      }).unwrap();

      if (response?.data) {
        // Show success message
        setSuccessMessage(true);
        setTimeout(() => setSuccessMessage(false), 3000);
      }
    } catch (error) {
      console.log('handleSave error', error);
      // Alert for error instead of toast
      alert(error?.data?.message || 'Failed to save settings');
    }
  };

  return (
    <View style={[styles.container, isDarkMode ? styles.containerDark : {}]}>
      <Text
        style={[
          styles.contentTitle,
          isDarkMode ? styles.contentTitleDark : {},
        ]}>
        Chat Settings
      </Text>

      {/* Conversation Tags */}
      <View
        style={[
          styles.settingField,
          isDarkMode ? styles.settingFieldDark : {},
        ]}>
        <View style={styles.fieldContent}>
          <Text
            style={[
              styles.fieldLabel,
              isDarkMode ? styles.fieldLabelDark : {},
            ]}>
            Enable Conversation Tags
          </Text>
          <Text style={styles.sectionSubtitle}>
            Organize your chats with customizable tags for easier tracking and
            management.
          </Text>
        </View>
        <Switch
          value={conversationTags}
          onValueChange={() => setConversationTags(!conversationTags)}
          trackColor={{false: '#E9E9EA', true: '#2C83F680'}}
          thumbColor={conversationTags ? '#2C83F6' : '#FFFFFF'}
          ios_backgroundColor="#E9E9EA"
        />
      </View>

      {/* Display Chat History */}
      <View
        style={[
          styles.settingField,
          isDarkMode ? styles.settingFieldDark : {},
        ]}>
        <View style={styles.fieldContent}>
          <Text
            style={[
              styles.fieldLabel,
              isDarkMode ? styles.fieldLabelDark : {},
            ]}>
            Display Chat History
          </Text>
          <Text style={styles.sectionSubtitle}>
            Choose whether to display your chat history in the chat interface.
          </Text>
        </View>
        <Switch
          value={displayHistory}
          onValueChange={() => setDisplayHistory(!displayHistory)}
          trackColor={{false: '#E9E9EA', true: '#2C83F680'}}
          thumbColor={displayHistory ? '#2C83F6' : '#FFFFFF'}
          ios_backgroundColor="#E9E9EA"
        />
      </View>

      {/* Clear Chat History */}
      <View
        style={[
          styles.settingField,
          isDarkMode ? styles.settingFieldDark : {},
        ]}>
        <View style={styles.fieldContent}>
          <Text
            style={[
              styles.fieldLabel,
              isDarkMode ? styles.fieldLabelDark : {},
            ]}>
            Clear Chat History
          </Text>
          <Text style={styles.sectionSubtitle}>
            Permanently delete your chat history from the platform. This action
            cannot be undone.
          </Text>
        </View>
        <Switch
          value={clearHistory}
          onValueChange={() => setClearHistory(!clearHistory)}
          trackColor={{false: '#E9E9EA', true: '#2C83F680'}}
          thumbColor={clearHistory ? '#2C83F6' : '#FFFFFF'}
          ios_backgroundColor="#E9E9EA"
        />
      </View>

      {/* Save Button */}
      <TouchableOpacity
        style={styles.saveButton}
        disabled={isLoading}
        onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save</Text>
        {isLoading && (
          <ActivityIndicator
            size="small"
            color="#FFFFFF"
            style={styles.spinner}
          />
        )}
      </TouchableOpacity>

      {/* Success Message */}
      {successMessage && (
        <View style={styles.successNotification}>
          <Icon
            name="check-circle"
            size={20}
            color="#4CAF50"
            style={styles.successIcon}
          />
          <Text style={styles.successText}>Changes saved successfully</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  containerDark: {
    backgroundColor: '#181a1c',
  },
  contentTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 24,
    color: '#000000',
  },
  contentTitleDark: {
    color: '#FFFFFF',
  },
  settingField: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EAEEF2',
  },
  settingFieldDark: {
    borderBottomColor: '#202324',
  },
  fieldContent: {
    flex: 1,
    marginRight: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    color: '#000000',
  },
  fieldLabelDark: {
    color: '#FFFFFF',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#777A7E',
  },
  saveButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2C83F6',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 24,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  spinner: {
    marginLeft: 8,
  },
  successNotification: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#E7F5E8',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  successIcon: {
    marginRight: 12,
  },
  successText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
});

export default ChatSetting;
