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

import Toast from 'react-native-toast-message';
import {useDispatch, useSelector} from 'react-redux';
import {
  setAuthToken,
  setEmail,
  setUserDetails,
  setDarkMode,
} from '../slices/globalSlice';
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
  const [isLoading, setIsLoading] = useState(false);

  // Form validation state
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Refs for TextInputs
  const passwordRef = useRef(null);

  // Check window dimensions for responsive design
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));
  const isMobile = dimensions.width < 768;

  // Update dimensions when screen size changes
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({window}) => {
      setDimensions(window);
    });
    return () => subscription?.remove();
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
    if (!email) setEmailError('Email is required');
    if (!password) setPasswordError('Password is required');

    if (!email || !password || emailError || passwordError) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please correct the errors in the form',
      });
      return;
    }

    try {
      setIsLoading(true);

      // Mock API call - replace with your actual login logic
      setTimeout(() => {
        // Simulate successful login
        const mockUserData = {
          token: 'fake-jwt-token',
          user: {
            id: '123',
            email: email,
            name: 'User Name',
            isDarkMode: effectiveDarkMode,
          },
        };

        // Update Redux state
        dispatch(setAuthToken(mockUserData.token));
        dispatch(setEmail(email));
        dispatch(setUserDetails(mockUserData.user));
        dispatch(setDarkMode(mockUserData.user.isDarkMode));

        // Show success message
        Toast.show({
          type: 'success',
          text1: 'Login Successful',
          text2: 'Welcome back!',
        });

        // Navigate to home screen
        navigation.navigate('Home');

        setIsLoading(false);
      }, 1500);
    } catch (error) {
      setIsLoading(false);
      Toast.show({
        type: 'error',
        text1: 'Login Failed',
        text2: error?.message || 'Please check your credentials',
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
                  style={styles.passwordInput}
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
                !email || !password ? styles.loginButtonDisabled : null,
              ]}
              onPress={handleLogin}
              disabled={!email || !password || isLoading}>
              {isLoading ? (
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
    color: '#010102', // Will be overridden by container style
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
