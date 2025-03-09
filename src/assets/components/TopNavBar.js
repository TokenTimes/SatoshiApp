import React, {useState, useEffect} from 'react';
import {
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  Text,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useSelector, useDispatch} from 'react-redux';
import {setDarkMode, setRoomId} from '../../slices/globalSlice';

// Import the MobileSidebar component
import MobileSidebar from './MobileSidebar';

const TopNavbar = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const colorScheme = useColorScheme();

  // State to control sidebar visibility
  const [sidebarVisible, setSidebarVisible] = useState(false);

  // Get states from Redux
  const isDarkMode = useSelector(state => state.global.isDarkMode);
  const currentRoomId = useSelector(state => state.global.roomId);

  // Apply dark mode from either Redux or system preference
  const effectiveDarkMode =
    isDarkMode !== undefined ? isDarkMode : colorScheme === 'dark';

  // Toggle sidebar visibility
  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  // Modified home navigation function
  const goHome = () => {
    // First reset roomId to null
    dispatch(setRoomId(null));

    // Then navigate to Home
    navigation.reset({
      index: 0,
      routes: [{name: 'Home'}],
    });

    // Also close sidebar if it's open
    if (sidebarVisible) {
      setSidebarVisible(false);
    }
  };

  return (
    <>
      {/* Mobile Sidebar - will be rendered on top of everything */}
      <MobileSidebar
        isVisible={sidebarVisible}
        onClose={() => setSidebarVisible(false)}
      />

      <View
        style={[
          styles.navbar,
          effectiveDarkMode ? styles.navbarDark : styles.navbarLight,
        ]}>
        {/* Left button - now toggles the sidebar */}
        <TouchableOpacity onPress={toggleSidebar}>
          <Image
            source={
              !isDarkMode
                ? require('../../assets/Icons/ListBlack.png')
                : require('../../assets/Icons/List.png')
            }
            resizeMode="contain"
            style={styles.List}
          />
        </TouchableOpacity>

        {/* Center logo */}
        <TouchableOpacity onPress={goHome}>
          <View style={styles.logoContainer}>
            {' '}
            <Image
              source={
                effectiveDarkMode
                  ? require('../../assets/images/sidebarLogo.png')
                  : require('../../assets/images/sidebarLogoBlack.png')
              }
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
        </TouchableOpacity>

        {/* Right circle - blue with white plus, navigates to Home */}
        <TouchableOpacity style={styles.circleButtonBlue} onPress={goHome}>
          <Text style={styles.plusSign}>+</Text>
        </TouchableOpacity>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  navbar: {
    height: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    zIndex: 1, // Ensure the navbar is above content but below the sidebar
  },
  navbarLight: {
    backgroundColor: '#FFFFFF',
    borderBottomColor: '#EEEEEE',
  },
  navbarDark: {
    backgroundColor: 'black',
    borderBottomColor: '#333333',
  },
  List: {
    width: 25,
    height: 25,
  },
  logoContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 150,
    height: 40,
  },
  circleButtonBlue: {
    width: 30,
    height: 30,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2C83F6',
  },
  plusSign: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    lineHeight: 24,
    textAlign: 'center',
    marginTop: -3,
  },
});

export default TopNavbar;
