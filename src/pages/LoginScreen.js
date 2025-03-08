import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  Dimensions,
  ActivityIndicator,
  StatusBar,
  useColorScheme,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {Eye, EyeOff, Check} from 'lucide-react-native';
import DeviceInfo from 'react-native-device-info';
import NetInfo from '@react-native-community/netinfo';

import Toast from 'react-native-toast-message';
import {useDispatch, useSelector} from 'react-redux';
import {
  setAuthToken,
  setEmail,
  setUserDetails,
  setDarkMode,
} from '../slices/globalSlice';
import {useLoginMutation} from '../services/auth';
import {StyleSheet} from 'react-native';

// Regex for email validation
const EMAIL_REGEX = /^\S+@\S+$/i;

const LoginScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const isDarkMode = useSelector(state => state.global.isDarkMode);
  const colorScheme = useColorScheme();

  // Apply dark mode from either Redux or system preference
  const effectiveDarkMode =
    isDarkMode !== undefined ? isDarkMode : colorScheme === 'dark';

  // Form state
  const [email, setEmailValue] = useState('');
  const [password, setPasswordValue] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Remove the redundant isLoading state - use only the RTK Query loading state
  // const [isLoading, setIsLoading] = useState(false);

  // User data state for analytics
  const [userData, setUserData] = useState({
    country: '',
    regionName: '',
    city: '',
    ip: '',
    device: '',
    os: '',
    browser: '',
  });

  // Form validation state
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Refs for TextInputs
  const passwordRef = useRef(null);

  // Check window dimensions for responsive design
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));
  const isMobile = dimensions.width < 768;

  // RTK Query login mutation hook
  const [login, {isLoading: isLoginLoading}] = useLoginMutation();

  // Update dimensions when screen size changes
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({window}) => {
      setDimensions(window);
    });
    return () => subscription?.remove();
  }, []);

  // Fetch user location and device data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Get location data
        const locationRes = await fetch('https://ipapi.co/json/');
        const locationData = await locationRes.json();

        // Get device information
        const deviceType = DeviceInfo.getDeviceType();
        const systemName = DeviceInfo.getSystemName();
        const systemVersion = await DeviceInfo.getSystemVersion();
        const ipAddress = await NetInfo.fetch().then(
          state => state.details?.ipAddress || '',
        );

        setUserData({
          country: locationData.country_name || '',
          regionName: locationData.region || '',
          city: locationData.city || '',
          ip: ipAddress || locationData.ip || '',
          device: deviceType || '',
          os: `${systemName || ''} ${systemVersion || ''}`,
          browser: 'React Native WebView', // Since it's a mobile app
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
        // Set default values if fetch fails
        setUserData({
          country: '',
          regionName: '',
          city: '',
          ip: '',
          device: Platform.OS || '',
          os: Platform.OS || '',
          browser: 'React Native WebView',
        });
      }
    };

    fetchUserData();
  }, []);

  // Validate email on change
  const validateEmail = text => {
    setEmailValue(text);
    if (!text) {
      setEmailError('Email is required');
    } else if (!EMAIL_REGEX.test(text)) {
      setEmailError('Invalid email format');
    } else {
      setEmailError('');
    }
  };

  // Validate password on change
  const validatePassword = text => {
    setPasswordValue(text);
    if (!text) {
      setPasswordError('Password is required');
    } else if (text.length < 6) {
      setPasswordError('Password must be at least 6 characters');
    } else {
      setPasswordError('');
    }
  };

  // Handle form submission
  const handleLogin = async () => {
    // Validate form before submission
    let hasErrors = false;

    if (!email) {
      setEmailError('Email is required');
      hasErrors = true;
    }

    if (!password) {
      setPasswordError('Password is required');
      hasErrors = true;
    }

    if (hasErrors || emailError || passwordError) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please correct the errors in the form',
      });
      return;
    }

    try {
      // Prepare payload with user data
      const payload = {
        email: email,
        password: password,
        ...userData,
      };

      console.log('Login payload:', payload);

      // Use RTK Query mutation to login
      const loginData = await login(payload).unwrap();

      if (loginData?.data?.token) {
        // Extract isDarkMode from user data or fallback to false
        const userIsDarkMode = loginData?.data?.user?.isDarkMode || false;

        // Update Redux state - the onQueryStarted in authApi.js already handles AsyncStorage
        dispatch(setAuthToken(loginData.data.token));
        dispatch(setEmail(email));
        dispatch(setUserDetails(loginData.data.user));
        dispatch(setDarkMode(userIsDarkMode));

        // Show success message
        Toast.show({
          type: 'success',
          text1: 'Login Successful',
          text2: 'Welcome back!',
        });

        // Navigate to home screen
        navigation.navigate('Home');
      } else if (!loginData?.data?.emailVerified) {
        // Handle email verification flow
        Toast.show({
          type: 'info',
          text1: 'Verification Required',
          text2: loginData?.message || 'Please verify your email to continue',
        });

        // Navigate to verification screen
        navigation.navigate('VerifyEmail', {email});
      }
    } catch (error) {
      console.error('Error during login:', error);
      Toast.show({
        type: 'error',
        text1: 'Login Failed',
        text2:
          error?.error ||
          error?.data?.message ||
          'Please check your credentials',
      });
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[
        styles.container,
        effectiveDarkMode ? styles.containerDark : styles.containerLight,
      ]}>
      <StatusBar
        barStyle={effectiveDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={effectiveDarkMode ? '#121212' : '#FFFFFF'}
      />

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={styles.scrollViewContent}
          keyboardShouldPersistTaps="handled">
          <View style={styles.logoContainer}>
            <Image
              source={require('../assets/images/sidebarLogoBlack.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <View style={styles.headerContainer}>
            <Text
              style={[
                styles.headerTitle,
                effectiveDarkMode ? styles.textDark : styles.textLight,
              ]}>
              Log In to Begin Your Journey
            </Text>
          </View>

          <View style={styles.formContainer}>
            {/* Email Input */}
            <View style={styles.inputContainer}>
              <TextInput
                style={[
                  styles.input,
                  emailError ? styles.inputError : null,
                  effectiveDarkMode ? styles.inputDark : styles.inputLight,
                ]}
                placeholder="Email Address"
                placeholderTextColor={effectiveDarkMode ? '#999999' : '#757575'}
                value={email}
                onChangeText={validateEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current.focus()}
                blurOnSubmit={false}
              />
              {emailError ? (
                <Text style={styles.errorText}>{emailError}</Text>
              ) : null}
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <View
                style={[
                  styles.passwordContainer,
                  passwordError ? styles.inputError : null,
                  effectiveDarkMode ? styles.inputDark : styles.inputLight,
                ]}>
                <TextInput
                  ref={passwordRef}
                  style={[
                    styles.passwordInput,
                    effectiveDarkMode ? {color: '#FFFFFF'} : {color: '#010102'},
                  ]}
                  placeholder="Password"
                  placeholderTextColor={
                    effectiveDarkMode ? '#999999' : '#757575'
                  }
                  value={password}
                  onChangeText={validatePassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}>
                  {showPassword ? (
                    <Eye
                      size={20}
                      color={effectiveDarkMode ? '#FFFFFF' : '#757575'}
                    />
                  ) : (
                    <EyeOff
                      size={20}
                      color={effectiveDarkMode ? '#FFFFFF' : '#757575'}
                    />
                  )}
                </TouchableOpacity>
              </View>
              {passwordError ? (
                <Text style={styles.errorText}>{passwordError}</Text>
              ) : null}
            </View>

            {/* Remember Me & Forgot Password */}
            <View style={styles.rememberForgotContainer}>
              <TouchableOpacity
                style={styles.rememberMeContainer}
                onPress={() => setRememberMe(!rememberMe)}>
                <View
                  style={[
                    styles.checkbox,
                    rememberMe ? styles.checkboxChecked : null,
                  ]}>
                  {rememberMe && <Check size={12} color="#FFFFFF" />}
                </View>
                <Text
                  style={[
                    styles.rememberMeText,
                    effectiveDarkMode
                      ? styles.textSecondaryDark
                      : styles.textSecondaryLight,
                  ]}>
                  Remember me
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => navigation.navigate('ForgotPassword')}>
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            {/* Login Button */}
            <TouchableOpacity
              style={[
                styles.loginButton,
                !email || !password || isLoginLoading
                  ? styles.loginButtonDisabled
                  : null,
              ]}
              onPress={handleLogin}
              disabled={!email || !password || isLoginLoading}>
              {isLoginLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.loginButtonText}>Sign In</Text>
              )}
            </TouchableOpacity>

            {/* Sign Up Link */}
            <View style={styles.signUpContainer}>
              <Text
                style={[
                  styles.dontHaveAccountText,
                  effectiveDarkMode
                    ? styles.textSecondaryDark
                    : styles.textSecondaryLight,
                ]}>
                Don't have an account?
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                <Text style={styles.signUpText}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  // Container styles
  container: {
    flex: 1,
  },
  containerLight: {
    backgroundColor: '#FFFFFF',
  },
  containerDark: {
    backgroundColor: '#121212',
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 24,
  },

  // Text colors based on theme
  textLight: {
    color: '#010102',
  },
  textDark: {
    color: '#FFFFFF',
  },
  textSecondaryLight: {
    color: '#616161',
  },
  textSecondaryDark: {
    color: '#AAAAAA',
  },

  // Logo and header styles
  logoContainer: {
    marginTop: 40,
    alignItems: 'center',
    marginBottom: 120,
  },
  logo: {
    width: 200,
    height: 50,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  headerTitle: {
    fontFamily: 'System',
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },

  // Form container
  formContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },

  // Input styles
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    height: 56,
    borderWidth: 1,
    borderRadius: 13,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  inputLight: {
    backgroundColor: '#F9F9F9',
    borderColor: '#E0E0E0',
    color: '#010102',
  },
  inputDark: {
    backgroundColor: '#1E1E1E',
    borderColor: '#333333',
    color: '#FFFFFF',
  },
  inputError: {
    borderColor: '#FF5252',
  },
  errorText: {
    color: '#FF5252',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },

  // Password field with eye icon
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    borderWidth: 1,
    borderRadius: 13,
    paddingHorizontal: 16,
  },
  passwordInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    padding: 0,
  },
  eyeIcon: {
    padding: 10,
    marginRight: -10,
  },

  // Remember me and forgot password row
  rememberForgotContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 4,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#2C83F6',
    borderColor: '#2C83F6',
  },
  rememberMeText: {
    fontSize: 14,
  },
  forgotPasswordText: {
    color: '#2C83F6',
    fontSize: 14,
    fontWeight: '500',
  },

  // Login button
  loginButton: {
    backgroundColor: '#2C83F6',
    height: 56,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  loginButtonDisabled: {
    backgroundColor: '#CCCCCC',
    opacity: 0.7,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  // Sign up section
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  dontHaveAccountText: {
    fontSize: 14,
    marginRight: 4,
  },
  signUpText: {
    color: '#2C83F6',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default LoginScreen;
