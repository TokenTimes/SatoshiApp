import React from 'react';
import {
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useSelector, useDispatch} from 'react-redux';
import {setDarkMode} from '../../slices/globalSlice';

const TopNavbar = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const colorScheme = useColorScheme();

  // Get dark mode state from Redux
  const isDarkMode = useSelector(state => state.global.isDarkMode);

  // Apply dark mode from either Redux or system preference
  const effectiveDarkMode =
    isDarkMode !== undefined ? isDarkMode : colorScheme === 'dark';

  // Toggle dark mode
  const toggleDarkMode = () => {
    dispatch(setDarkMode(!effectiveDarkMode));
  };

  return (
    <View
      style={[
        styles.navbar,
        effectiveDarkMode ? styles.navbarDark : styles.navbarLight,
      ]}>
      {/* Left circle */}
      <TouchableOpacity
        style={[
          styles.circleButton,
          effectiveDarkMode
            ? styles.circleButtonDark
            : styles.circleButtonLight,
        ]}
        onPress={() => navigation.navigate('Home')}>
        <View style={styles.circleDot} />
      </TouchableOpacity>

      {/* Center logo */}
      <View style={styles.logoContainer}>
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

      {/* Right circle (Dark mode toggle) */}
      <TouchableOpacity
        style={[
          styles.circleButton,
          effectiveDarkMode
            ? styles.circleButtonDark
            : styles.circleButtonLight,
        ]}
        onPress={toggleDarkMode}>
        <View
          style={[
            styles.circleDot,
            effectiveDarkMode ? styles.circleDotDark : styles.circleDotLight,
          ]}
        />
      </TouchableOpacity>
    </View>
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
  },
  navbarLight: {
    backgroundColor: '#FFFFFF',
    borderBottomColor: '#EEEEEE',
  },
  navbarDark: {
    backgroundColor: '#121212',
    borderBottomColor: '#333333',
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
  circleButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  circleButtonLight: {
    backgroundColor: '#F9F9F9',
    borderColor: '#E0E0E0',
  },
  circleButtonDark: {
    backgroundColor: '#1E1E1E',
    borderColor: '#333333',
  },
  circleDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2C83F6',
  },
  circleDotLight: {
    opacity: 0.8,
  },
  circleDotDark: {
    opacity: 1,
  },
});

export default TopNavbar;
