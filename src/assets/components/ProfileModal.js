import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Image,
  Platform,
  Dimensions,
} from 'react-native';
import {useSelector} from 'react-redux';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

// Import your component screens
import VerifyEmailModal from './VerifyEmailModal';
import AccountSetting from './AccountSetting';
import ChatSetting from './ChatSetting';
import ProfileManagement from './ProfileManagement';

const {width} = Dimensions.get('window');

export function ProfileModal({isOpen, onClose, dialog}) {
  const isMobile = useSelector(state => state.global.isMobile);
  const isDarkMode = useSelector(state => state.global.isDarkMode);

  // Map dialog values to corresponding stage numbers
  const getInitialStage = () => {
    switch (dialog) {
      case 'chat_settings':
        return 2;
      case 'account_settings':
        return 3;
      case 'profile_management':
      default:
        return 1; // Default to profile management
    }
  };

  const [stage, setStage] = useState(getInitialStage());
  const {verifyEmailOtp} = useSelector(
    state => state.global || {verifyEmailOtp: false},
  );

  // Update stage when dialog prop changes
  useEffect(() => {
    setStage(getInitialStage());
  }, [dialog]);

  // Render the header section
  const renderHeader = () => (
    <View style={isDarkMode ? styles.headerDark : styles.header}>
      <Text style={isDarkMode ? styles.titleDark : styles.title}>Settings</Text>
      <TouchableOpacity
        onPress={() => {
          onClose(false);
          setStage(getInitialStage());
        }}
        style={isDarkMode ? styles.closeIconDark : styles.closeIcon}>
        <Icon
          name="close"
          size={24}
          color={isDarkMode ? '#ffffff' : '#000000'}
        />
      </TouchableOpacity>
    </View>
  );

  // Render mobile tabs
  const renderTabs = () => (
    <View style={isDarkMode ? styles.tabContainerDark : styles.tabContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.mobileTabsContent}>
        <TouchableOpacity
          style={[
            isDarkMode ? styles.mobileTabDark : styles.mobileTab,
            stage === 1 &&
              (isDarkMode
                ? styles.mobileTabActiveDark
                : styles.mobileTabActive),
          ]}
          onPress={() => setStage(1)}>
          <View style={styles.tabContent}>
            <MaterialIcons
              name="account-circle"
              size={16}
              style={[
                isDarkMode ? styles.sidebarIconDark : styles.sidebarIcon,
                stage === 1 &&
                  (isDarkMode
                    ? styles.sidebarIconActiveDark
                    : styles.sidebarIconActive),
              ]}
            />
            <Text
              style={[
                isDarkMode ? styles.tabTextDark : styles.tabText,
                stage === 1 &&
                  (isDarkMode
                    ? styles.tabTextActiveDark
                    : styles.tabTextActive),
              ]}>
              Profile
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            isDarkMode ? styles.mobileTabDark : styles.mobileTab,
            stage === 2 &&
              (isDarkMode
                ? styles.mobileTabActiveDark
                : styles.mobileTabActive),
          ]}
          onPress={() => setStage(2)}>
          <View style={styles.tabContent}>
            <Icon
              name="chatbox"
              size={16}
              style={[
                isDarkMode ? styles.sidebarIconDark : styles.sidebarIcon,
                stage === 2 &&
                  (isDarkMode
                    ? styles.sidebarIconActiveDark
                    : styles.sidebarIconActive),
              ]}
            />
            <Text
              style={[
                isDarkMode ? styles.tabTextDark : styles.tabText,
                stage === 2 &&
                  (isDarkMode
                    ? styles.tabTextActiveDark
                    : styles.tabTextActive),
              ]}>
              Chat
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            isDarkMode ? styles.mobileTabDark : styles.mobileTab,
            stage === 3 &&
              (isDarkMode
                ? styles.mobileTabActiveDark
                : styles.mobileTabActive),
          ]}
          onPress={() => setStage(3)}>
          <View style={styles.tabContent}>
            <Icon
              name="settings"
              size={16}
              style={[
                isDarkMode ? styles.sidebarIconDark : styles.sidebarIcon,
                stage === 3 &&
                  (isDarkMode
                    ? styles.sidebarIconActiveDark
                    : styles.sidebarIconActive),
              ]}
            />
            <Text
              style={[
                isDarkMode ? styles.tabTextDark : styles.tabText,
                stage === 3 &&
                  (isDarkMode
                    ? styles.tabTextActiveDark
                    : styles.tabTextActive),
              ]}>
              Account
            </Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  // Render content based on selected stage
  const renderContent = () => (
    <View
      style={isDarkMode ? styles.contentWrapperDark : styles.contentWrapper}>
      <ScrollView
        style={isDarkMode ? styles.mainContentDark : styles.mainContent}
        contentContainerStyle={styles.contentContainer}>
        {stage === 1 && <ProfileManagement />}
        {stage === 2 && <ChatSetting />}
        {stage === 3 && <AccountSetting />}
      </ScrollView>
    </View>
  );

  return (
    <Modal
      visible={isOpen}
      transparent={true}
      animationType="fade"
      onRequestClose={() => {
        onClose(false);
        setStage(getInitialStage());
      }}>
      <View
        style={[
          styles.modalOverlay,
          isDarkMode ? styles.modalOverlayDark : styles.modalOverlayLight,
        ]}>
        <View
          style={[styles.modalView, isDarkMode ? styles.modalViewDark : {}]}>
          {renderHeader()}
          <View style={styles.modalBody}>
            {renderTabs()}
            {renderContent()}
          </View>
        </View>

        {verifyEmailOtp && <VerifyEmailModal />}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(220, 220, 220, 0.8)',
    ...Platform.select({
      ios: {
        backdropFilter: 'blur(4px)',
      },
      android: {
        // Android doesn't support backdropFilter
      },
    }),
  },
  modalOverlayLight: {
    backgroundColor: 'rgba(220, 220, 220, 0.8)',
  },
  modalOverlayDark: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  modalView: {
    width: width * 0.9, // 90% of screen width
    maxWidth: 350, // Maximum width for larger screens
    height: '90%', // 80% of screen height
    maxHeight: 600, // Maximum height
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    flexDirection: 'column',
  },
  modalViewDark: {
    backgroundColor: '#181a1c',
  },
  modalBody: {
    flex: 1,
    flexDirection: 'column',
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eaeef2',
  },
  headerDark: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#202324',
  },
  title: {
    color: '#010102',
    fontSize: 18,
    fontWeight: '700',
  },
  titleDark: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  closeIcon: {
    borderWidth: 1.5,
    borderColor: '#000',
    borderRadius: 50,
    padding: 2,
    justifyContent: 'center',
    alignItems: 'center',
    width: 26,
    height: 26,
  },
  closeIconDark: {
    borderWidth: 1.5,
    borderColor: '#ffffff',
    borderRadius: 50,
    padding: 2,
    justifyContent: 'center',
    alignItems: 'center',
    width: 26,
    height: 26,
  },
  tabContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#eaeef2',
    height: '15%', // This sets the tab container to exactly 15% of the modal body height
  },
  tabContainerDark: {
    borderBottomWidth: 1,
    borderBottomColor: '#202324',
    height: '15%', // This sets the tab container to exactly 15% of the modal body height
  },
  mobileTabsContent: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: '100%',
  },
  mobileTab: {
    padding: 6,
    borderRadius: 10,
    marginHorizontal: 4,
    minWidth: 80,
    height: 32,
  },
  mobileTabDark: {
    padding: 6,
    borderRadius: 10,
    marginHorizontal: 4,
    minWidth: 80,
    height: 32,
  },
  mobileTabActive: {
    backgroundColor: '#eaeef2',
  },
  mobileTabActiveDark: {
    backgroundColor: '#252729',
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(1, 1, 2, 0.5)',
    marginLeft: 6,
  },
  tabTextDark: {
    fontSize: 13,
    fontWeight: '500',
    color: '#777a7e',
    marginLeft: 6,
  },
  tabTextActive: {
    color: '#010102',
  },
  tabTextActiveDark: {
    color: '#ffffff',
  },
  sidebarIcon: {
    fontSize: 16,
    color: 'rgba(1, 1, 2, 0.5)',
  },
  sidebarIconDark: {
    fontSize: 16,
    color: '#777a7e',
  },
  sidebarIconActive: {
    color: '#010102',
  },
  sidebarIconActiveDark: {
    color: '#ffffff',
  },
  contentWrapper: {
    flex: 0.85, // 85% of modal body after tabs take 15%
    backgroundColor: '#fff',
  },
  contentWrapperDark: {
    flex: 0.85, // 85% of modal body after tabs take 15%
    backgroundColor: '#181a1c',
  },
  mainContent: {
    flex: 1,
    backgroundColor: '#fff',
  },
  mainContentDark: {
    flex: 1,
    backgroundColor: '#181a1c',
  },
  contentContainer: {
    paddingBottom: 20,
  },
});

export default ProfileModal;
