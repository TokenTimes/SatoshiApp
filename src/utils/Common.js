import {useEffect} from 'react';
import {
  BackHandler,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import isJwtTokenExpired from 'jwt-check-expiry';

// React Native equivalent of useOutsideClick - handles hardware back press and touches
export function useBackPressHandler(callback) {
  useEffect(() => {
    // Only add back handler on Android
    if (Platform.OS === 'android') {
      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        () => {
          callback();
          return true; // Prevent default back action
        },
      );

      return () => backHandler.remove();
    }
  }, [callback]);
}

// Dismisses keyboard when clicked outside text inputs
export function useDismissKeyboard(ref, callback) {
  useEffect(() => {
    const dismissKeyboard = () => {
      Keyboard.dismiss();
      if (callback) callback();
    };

    // Return a component that can be used to wrap content
    return {
      DismissKeyboardView: ({children}) => (
        <TouchableWithoutFeedback onPress={dismissKeyboard}>
          {children}
        </TouchableWithoutFeedback>
      ),
    };
  }, [ref, callback]);
}

export function getInitials(name) {
  if (!name || typeof name !== 'string') return '';

  // Split the name into words and filter out empty entries
  const words = name.trim().split(/\s+/);

  // Handle single-word and two-word names
  if (words.length === 1) {
    return words[0][0].toUpperCase();
  } else if (words.length >= 2) {
    return words[0][0].toUpperCase() + words[1][0].toUpperCase();
  }

  return ''; // Default fallback
}

export const checkLogin = (token = '') => {
  try {
    return !isJwtTokenExpired(token);
  } catch (error) {
    console.log('error in check login', error);
    return false;
  }
};

export const extractNumberFromString = str => {
  // Threshold to identify large numbers (e.g., above 1,000,000)
  const threshold = 1_000_000;

  // Replace large numeric values, avoiding transaction hashes or mixed alphanumeric strings
  const newStr = str.replace(/\b\d+(\.\d+)?\b/g, match => {
    const number = parseFloat(match);

    // Replace only if the match is a number above the threshold
    if (!isNaN(number) && number >= threshold) {
      return number.toLocaleString();
    }

    // Return the original match if it's not a large number
    return match;
  });

  return newStr;
};

// Detect if the device is a tablet (could be useful for UI adaptations)
export const isTablet = () => {
  const {width, height} =
    Platform.OS === 'web'
      ? {width: window.innerWidth, height: window.innerHeight}
      : require('react-native').Dimensions.get('window');

  return Math.max(width, height) >= 768;
};

// Format datetime for mobile display
export const formatDateTime = dateString => {
  if (!dateString) return '';

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  return date.toLocaleString();
};
