import React from 'react';
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
      {/* Left circle - blue, does nothing */}
      <View>{/* Empty blue circle */}</View>
      <Image
        source={
          !isDarkMode
            ? require('../../assets/Icons/ListBlack.png')
            : require('../../assets/Icons/List.png')
        }
        resizeMode="contain"
        style={styles.List}
      />
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

      {/* Right circle - blue with white plus, navigates to Home */}
      <TouchableOpacity
        style={styles.circleButtonBlue}
        onPress={() => navigation.navigate('Home')}>
        <Text style={styles.plusSign}>+</Text>
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
