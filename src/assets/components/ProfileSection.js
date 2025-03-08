import React, {useState, useRef} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Modal} from 'react-native';
import {useSelector} from 'react-redux';

// Create a simplified version of the dropdown for direct use
const ProfileDropdownMenu = ({
  isVisible,
  onClose,
  navigation,
  setIsDialogOpen,
  setDialog,
}) => {
  const isDarkMode = useSelector(state => state.global.isDarkMode);

  if (!isVisible) return null;

  const handleProfileManagement = () => {
    if (setIsDialogOpen && setDialog) {
      setDialog('profile_management');
      setIsDialogOpen(true);
    } else {
      // Fallback if the proper props aren't available
      navigation.navigate('ProfileManagement');
    }
    onClose();
  };

  const handleChatSettings = () => {
    if (setIsDialogOpen && setDialog) {
      setDialog('chat_settings');
      setIsDialogOpen(true);
    } else {
      // Fallback if the proper props aren't available
      navigation.navigate('ChatSettings');
    }
    onClose();
  };

  const handleAccountSettings = () => {
    if (setIsDialogOpen && setDialog) {
      setDialog('account_settings');
      setIsDialogOpen(true);
    } else {
      // Fallback if the proper props aren't available
      navigation.navigate('AccountSettings');
    }
    onClose();
  };

  const handleLogout = () => {
    // Placeholder for logout functionality
    console.log('Logout clicked');
    onClose();
  };

  return (
    <Modal
      transparent
      visible={isVisible}
      animationType="fade"
      onRequestClose={onClose}>
      <TouchableOpacity
        style={styles.dropdownOverlay}
        activeOpacity={1}
        onPress={onClose}>
        <View
          style={[
            styles.dropdownMenu,
            isDarkMode ? styles.dropdownMenuDark : {},
          ]}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleProfileManagement}>
            <Text
              style={[styles.menuText, isDarkMode ? styles.menuTextDark : {}]}>
              Profile Management
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleChatSettings}>
            <Text
              style={[styles.menuText, isDarkMode ? styles.menuTextDark : {}]}>
              Chat Settings
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleAccountSettings}>
            <Text
              style={[styles.menuText, isDarkMode ? styles.menuTextDark : {}]}>
              Account Settings
            </Text>
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          <TouchableOpacity style={styles.menuItem}>
            <Text
              style={[styles.menuText, isDarkMode ? styles.menuTextDark : {}]}>
              Dark Theme
            </Text>
            <View style={styles.toggleContainer}>
              <View
                style={[
                  styles.toggleTrack,
                  isDarkMode ? styles.toggleTrackActive : {},
                ]}>
                <View
                  style={[
                    styles.toggleThumb,
                    isDarkMode ? styles.toggleThumbActive : {},
                  ]}
                />
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const ProfileSection = ({navigation, setIsDialogOpen, setDialog}) => {
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const isDarkMode = useSelector(state => state.global.isDarkMode);
  const user = useSelector(state => state.global.user || {});

  // Get user initials for avatar
  const getInitials = name => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Toggle dropdown visibility
  const toggleDropdown = () => {
    setIsDropdownVisible(!isDropdownVisible);
  };

  return (
    <>
      <TouchableOpacity
        style={[
          styles.profileContainer,
          isDarkMode ? styles.profileContainerDark : {},
        ]}
        onPress={toggleDropdown}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {getInitials(user.name || 'User')}
          </Text>
        </View>
        <Text style={[styles.userName, isDarkMode ? styles.userNameDark : {}]}>
          {user.name ? user.name.split(' ')[0] : 'User'}
        </Text>
      </TouchableOpacity>

      <ProfileDropdownMenu
        isVisible={isDropdownVisible}
        onClose={() => setIsDropdownVisible(false)}
        navigation={navigation}
        setIsDialogOpen={setIsDialogOpen}
        setDialog={setDialog}
      />
    </>
  );
};

const styles = StyleSheet.create({
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  profileContainerDark: {
    backgroundColor: '#121212',
  },
  avatarContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2C83F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#000000',
  },
  userNameDark: {
    color: '#FFFFFF',
  },
  // Dropdown styles
  dropdownOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  dropdownMenu: {
    position: 'absolute',
    left: 16,
    bottom: 80,
    width: 240,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  dropdownMenuDark: {
    backgroundColor: '#1E1E1E',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  menuText: {
    flex: 1,
    fontSize: 15,
    color: '#000000',
  },
  menuTextDark: {
    color: '#FFFFFF',
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginVertical: 4,
  },
  toggleContainer: {
    marginLeft: 'auto',
  },
  toggleTrack: {
    width: 40,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#EEEEEE',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleTrackActive: {
    backgroundColor: '#2C83F6',
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },
  toggleThumbActive: {
    transform: [{translateX: 16}],
  },
  logoutText: {
    fontSize: 15,
    color: '#FF3B30',
  },
});

export default ProfileSection;
