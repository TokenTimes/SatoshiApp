import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  Modal,
  TouchableWithoutFeedback,
  Animated,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useSelector, useDispatch} from 'react-redux';
import Icon from 'react-native-vector-icons/Ionicons';
import ChatHistory from './ChatHistory';

const MobileSidebar = ({isVisible, onClose}) => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const isDarkMode = useSelector(state => state.global.isDarkMode);
  const user = useSelector(state => state.global.user || {});

  const [searchText, setSearchText] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Animation for sidebar entry
  const slideAnim = useRef(new Animated.Value(-300)).current;

  useEffect(() => {
    if (isVisible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -300,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isVisible, slideAnim]);

  // Handle new chat button
  const handleNewChat = () => {
    // Navigate to home screen to start a new chat
    navigation.navigate('Home');
    onClose();
  };

  // Get user initials for avatar fallback
  const getInitials = name => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <Modal
      transparent={true}
      visible={isVisible}
      animationType="none"
      onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.modalOverlay} />
        </TouchableWithoutFeedback>

        <Animated.View
          style={[
            styles.sidebarContainer,
            isDarkMode ? styles.sidebarDark : styles.sidebarLight,
            {transform: [{translateX: slideAnim}]},
          ]}>
          <SafeAreaView style={styles.safeArea}>
            <View
              style={[
                styles.sidebarHeader,
                isDarkMode ? styles.headerDark : styles.headerLight,
              ]}>
              {isSearchOpen ? (
                // Search input when search is open
                <View style={styles.searchContainer}>
                  <TextInput
                    style={[
                      styles.searchInput,
                      isDarkMode ? styles.textDark : styles.textLight,
                    ]}
                    placeholder="Search conversations..."
                    placeholderTextColor={isDarkMode ? '#999' : '#666'}
                    value={searchText}
                    onChangeText={setSearchText}
                    autoFocus
                  />
                  <TouchableOpacity
                    style={styles.closeSearchButton}
                    onPress={() => setIsSearchOpen(false)}>
                    <Icon
                      name="close-outline"
                      size={24}
                      color={isDarkMode ? '#fff' : '#000'}
                    />
                  </TouchableOpacity>
                </View>
              ) : (
                // Normal header when search is closed
                <View style={styles.headerContent}>
                  <TouchableOpacity
                    style={styles.headerButton}
                    onPress={onClose}>
                    <Icon
                      name="menu-outline"
                      size={24}
                      color={isDarkMode ? '#fff' : '#000'}
                    />
                  </TouchableOpacity>

                  <View style={styles.headerActions}>
                    <TouchableOpacity
                      style={styles.headerButton}
                      onPress={() => setIsSearchOpen(true)}>
                      <Icon
                        name="search-outline"
                        size={22}
                        color={isDarkMode ? '#fff' : '#000'}
                      />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.newChatButton}
                      onPress={handleNewChat}>
                      <Text style={styles.newChatPlus}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>

            {/* Pass the search text to chat history if search is open */}
            <View style={styles.historyContainer}>
              {isSearchOpen ? (
                <ChatHistory
                  onSelectConversation={onClose}
                  initialSearchQuery={searchText}
                />
              ) : (
                <ChatHistory onSelectConversation={onClose} />
              )}
            </View>

            {/* Profile section at bottom */}
            <View
              style={[
                styles.profileSection,
                isDarkMode
                  ? styles.profileSectionDark
                  : styles.profileSectionLight,
              ]}>
              <View style={styles.profileImageContainer}>
                {user.profilePicture ? (
                  <Image
                    source={{uri: user.profilePicture}}
                    style={styles.profileImage}
                  />
                ) : (
                  <View
                    style={[
                      styles.initialsContainer,
                      {backgroundColor: '#2C83F6'},
                    ]}>
                    <Text style={styles.initials}>
                      {getInitials(user.name || 'User')}
                    </Text>
                  </View>
                )}
              </View>
              <Text
                style={[
                  styles.profileName,
                  isDarkMode ? styles.textDark : styles.textLight,
                ]}>
                {user.name ? user.name.split(' ')[0] : 'User'}
              </Text>
            </View>
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    flexDirection: 'row',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sidebarContainer: {
    width: 280,
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 5,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 1001,
  },
  sidebarLight: {
    backgroundColor: '#FFFFFF',
  },
  sidebarDark: {
    backgroundColor: '#121212',
  },
  safeArea: {
    flex: 1,
    paddingTop: StatusBar.currentHeight || 0,
  },
  sidebarHeader: {
    height: 60,
    borderBottomWidth: 1,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  headerLight: {
    borderBottomColor: '#EEEEEE',
  },
  headerDark: {
    borderBottomColor: '#333333',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: 8,
  },
  newChatButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#2C83F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  newChatPlus: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    lineHeight: 22,
    marginTop: -2,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  closeSearchButton: {
    padding: 8,
    marginLeft: 4,
  },
  historyContainer: {
    flex: 1,
  },
  // Profile section
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
  },
  profileSectionLight: {
    borderTopColor: '#F0F0F0',
  },
  profileSectionDark: {
    borderTopColor: '#333333',
  },
  profileImageContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
    marginRight: 12,
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  initialsContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  profileName: {
    fontSize: 15,
    fontWeight: '500',
  },
  textLight: {
    color: '#000000',
  },
  textDark: {
    color: '#FFFFFF',
  },
});

export default MobileSidebar;
