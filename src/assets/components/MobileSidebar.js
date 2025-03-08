import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  FlatList,
  Modal,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useSelector, useDispatch} from 'react-redux';

// Assuming you have these icons in your assets folder
// You might need to install react-native-vector-icons if you don't have it
import Icon from 'react-native-vector-icons/Ionicons';

const MobileSidebar = ({isVisible, onClose}) => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const isDarkMode = useSelector(state => state.global.isDarkMode);
  const [searchText, setSearchText] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Mock data for conversation history - replace with your actual data
  const conversations = [
    {id: '1', title: "What's the current price of Bitcoin?"},
    {id: '2', title: 'Show me the top 10 cryptocurrencies by market cap'},
    {id: '3', title: "What's the current price of Bitcoin (BTC)?"},
    {id: '4', title: 'Show me top 9 transaction of THIS Oct...'},
    {id: '5', title: 'What is the number of unique holders...'},
  ];

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

  // Navigation handler for conversation items
  const handleConversationPress = conversation => {
    // Handle navigation or conversation selection
    // For example: navigation.navigate('Conversation', { id: conversation.id });
    onClose();
  };

  // Handle new chat button
  const handleNewChat = () => {
    // Navigate to home or create new chat
    // navigation.navigate('Home');
    onClose();
  };

  // Toggle search input visibility
  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
    if (!isSearchOpen) {
      // Focus on search input when opened
      setTimeout(() => {
        // You might need a ref to the TextInput to focus it
      }, 100);
    }
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
            <View style={styles.sidebarHeader}>
              {isSearchOpen ? (
                // Search input when search is open
                <View style={styles.searchContainer}>
                  <TextInput
                    style={[
                      styles.searchInput,
                      isDarkMode
                        ? styles.searchInputDark
                        : styles.searchInputLight,
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
                      onPress={toggleSearch}>
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

            <ScrollView style={styles.conversationList}>
              {conversations.map(conversation => (
                <TouchableOpacity
                  key={conversation.id}
                  style={[
                    styles.conversationItem,
                    isDarkMode
                      ? styles.conversationItemDark
                      : styles.conversationItemLight,
                  ]}
                  onPress={() => handleConversationPress(conversation)}>
                  <Text
                    numberOfLines={2}
                    style={[
                      styles.conversationTitle,
                      isDarkMode ? styles.textDark : styles.textLight,
                    ]}>
                    {conversation.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Profile section at bottom */}
            <View
              style={[
                styles.profileSection,
                isDarkMode
                  ? styles.profileSectionDark
                  : styles.profileSectionLight,
              ]}>
              <View style={styles.profileImageContainer}></View>
              <Text
                style={[
                  styles.profileName,
                  isDarkMode ? styles.textDark : styles.textLight,
                ]}>
                Eddie Lake
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
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  searchInputLight: {
    backgroundColor: '#F5F5F5',
    color: '#000000',
  },
  searchInputDark: {
    backgroundColor: '#2A2A2A',
    color: '#FFFFFF',
  },
  closeSearchButton: {
    padding: 8,
    marginLeft: 4,
  },
  conversationList: {
    flex: 1,
  },
  conversationItem: {
    padding: 16,
    borderBottomWidth: 1,
  },
  conversationItemLight: {
    borderBottomColor: '#F0F0F0',
  },
  conversationItemDark: {
    borderBottomColor: '#333333',
  },
  conversationTitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  textLight: {
    color: '#000000',
  },
  textDark: {
    color: '#FFFFFF',
  },
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
  profileName: {
    fontSize: 15,
    fontWeight: '500',
  },
});

export default MobileSidebar;
