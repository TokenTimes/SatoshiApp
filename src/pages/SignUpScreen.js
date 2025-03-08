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
  StyleSheet,
  Linking,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import {useDispatch, useSelector} from 'react-redux';
import {setEmail, setPassword} from '../slices/globalSlice';
import {Eye, EyeOff, Check} from 'lucide-react-native';
import DeviceInfo from 'react-native-device-info';
import NetInfo from '@react-native-community/netinfo';
// Import the separate modal component
import VerifyEmailModal from './VeifyEmailModal';
// Import the correct API hooks
import {useSignUpMutation} from '../services/auth';
import {useSendOtpMutation} from '../services/otp';

// Regex patterns for validation
const EMAIL_REGEX = /^\S+@\S+$/i;
const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
const NAME_REGEX = /^[a-zA-Z ]+$/;

const SignUpScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const isDarkMode = useSelector(state => state.global.isDarkMode);
  const colorScheme = useColorScheme();

  // Apply dark mode from either Redux or system preference
  const effectiveDarkMode =
    isDarkMode !== undefined ? isDarkMode : colorScheme === 'dark';

  // Form state
  const [fullName, setFullName] = useState('');
  const [email, setEmailValue] = useState('');
  const [password, setPasswordValue] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);

  // Form validation state
  const [fullNameError, setFullNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [termsError, setTermsError] = useState('');

  // RTK Query hooks - with correct service imports
  const [signUp, {isLoading: isSignUpLoading}] = useSignUpMutation();
  const [sendOtp, {isLoading: isSendingOtp}] = useSendOtpMutation();

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

  // Password validation indicators
  const [passwordValidations, setPasswordValidations] = useState({
    length: false,
    lowercase: false,
    uppercase: false,
    number: false,
    special: false,
  });
  const [showPasswordValidations, setShowPasswordValidations] = useState(false);

  // Refs for TextInputs
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmPasswordRef = useRef(null);

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

  // Validate full name
  const validateFullName = text => {
    setFullName(text);
    if (!text) {
      setFullNameError('Full Name is required');
    } else if (!NAME_REGEX.test(text)) {
      setFullNameError('Full Name must contain only alphabets and spaces');
    } else if (text.length > 30) {
      setFullNameError('Full Name cannot exceed 30 characters');
    } else {
      setFullNameError('');
    }
  };

  // Validate email
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

  // Check password strength
  const checkPasswordStrength = text => {
    const validations = {
      length: text.length >= 8,
      lowercase: /[a-z]/.test(text),
      uppercase: /[A-Z]/.test(text),
      number: /\d/.test(text),
      special: /[@$!%*#?&]/.test(text),
    };
    setPasswordValidations(validations);
    return validations;
  };

  // Validate password
  const validatePassword = text => {
    setPasswordValue(text);
    const validations = checkPasswordStrength(text);

    if (!text) {
      setPasswordError('Password is required');
    } else if (!PASSWORD_REGEX.test(text)) {
      setPasswordError('Password does not meet requirements');
    } else {
      setPasswordError('');
    }

    // Also validate confirm password if it's already entered
    if (confirmPassword) {
      validateConfirmPassword(confirmPassword, text);
    }
  };

  // Validate confirm password
  const validateConfirmPassword = (text, pass = password) => {
    setConfirmPassword(text);
    if (!text) {
      setConfirmPasswordError('Confirm Password is required');
    } else if (text !== pass) {
      setConfirmPasswordError('Passwords do not match');
    } else {
      setConfirmPasswordError('');
    }
  };

  // Validate terms
  const validateTerms = value => {
    setTermsAccepted(value);
    if (!value) {
      setTermsError('You must accept the terms');
    } else {
      setTermsError('');
    }
  };

  // Open URLs
  const openURL = url => {
    Linking.openURL(url).catch(err => {
      console.error('Failed to open URL:', err);
      Toast.show({
        type: 'error',
        text1: 'Could not open link',
        text2: 'Please try again later',
      });
    });
  };

  // Check if form is complete
  const isFormComplete =
    fullName &&
    email &&
    password &&
    confirmPassword &&
    termsAccepted &&
    !fullNameError &&
    !emailError &&
    !passwordError &&
    !confirmPasswordError;

  // Handle form submission with improved error handling
  const handleSignUp = async () => {
    if (!isFormComplete) {
      // Validate all fields again
      validateFullName(fullName);
      validateEmail(email);
      validatePassword(password);
      validateConfirmPassword(confirmPassword);
      validateTerms(termsAccepted);

      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please correct the errors in the form',
      });
      return;
    }

    try {
      // Create sign-up payload with only the required fields
      const signUpPayload = {
        name: fullName,
        email: email,
        password: password,
        // Remove user metadata that might cause API validation issues
      };

      console.log('Sending signup payload:', signUpPayload);

      // Store email and password in Redux (do this first before any API calls)
      dispatch(setEmail(email));
      dispatch(setPassword(password));

      // First show the verification modal
      setShowVerifyModal(true);

      // Then call the sign-up API
      try {
        const signUpResponse = await signUp(signUpPayload).unwrap();
        console.log('Signup successful, response:', signUpResponse);

        // After successful signup, try to send verification OTP
        try {
          const otpResponse = await sendOtp({email}).unwrap();
          console.log('OTP sent successfully:', otpResponse);

          Toast.show({
            type: 'success',
            text1: 'Account Created',
            text2: 'Verification code sent to your email',
          });
        } catch (otpError) {
          console.error('Error sending OTP:', otpError);
          // Even if OTP sending fails, we keep the modal open so user can try resend
          Toast.show({
            type: 'warning',
            text1: 'Account Created',
            text2: 'Could not send verification code. Try "Resend code"',
          });
        }
      } catch (signUpError) {
        console.error('Sign Up error:', signUpError);

        // If it's an "email already exists" error (409), we still try to send OTP
        if (signUpError.status === 409) {
          try {
            // Send OTP to the existing email
            const otpResponse = await sendOtp({email}).unwrap();
            console.log('OTP sent to existing account:', otpResponse);

            Toast.show({
              type: 'info',
              text1: 'Email Already Registered',
              text2: 'Verification code sent. Verify to continue.',
            });
          } catch (otpError) {
            console.error('Error sending OTP to existing email:', otpError);
            Toast.show({
              type: 'error',
              text1: 'Verification Failed',
              text2: 'Could not send verification code. Try again.',
            });
            setShowVerifyModal(false);
          }
        } else {
          // For other signup errors, close the modal and show error
          Toast.show({
            type: 'error',
            text1: 'Sign Up Failed',
            text2: signUpError?.data?.message || 'Please try again later',
          });
          setShowVerifyModal(false);
        }
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      Toast.show({
        type: 'error',
        text1: 'An unexpected error occurred',
        text2: 'Please try again later',
      });
      setShowVerifyModal(false);
    }
  };

  // Handle modal close
  const handleCloseVerifyModal = () => {
    setShowVerifyModal(false);
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
              source={
                isDarkMode
                  ? require('../assets/images/sidebarLogo.png')
                  : require('../assets/images/sidebarLogoBlack.png')
              }
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
              Sign Up to Begin Your Journey
            </Text>
            <Text
              style={[
                styles.headerSubtitle,
                effectiveDarkMode
                  ? styles.textSecondaryDark
                  : styles.textSecondaryLight,
              ]}>
              Your gateway to the future of crypto awaits
            </Text>
          </View>

          <View style={styles.formContainer}>
            {/* Full Name Input */}
            <View style={styles.inputContainer}>
              <TextInput
                style={[
                  styles.input,
                  fullNameError ? styles.inputError : null,
                  effectiveDarkMode ? styles.inputDark : styles.inputLight,
                ]}
                placeholder="Full Name"
                placeholderTextColor={effectiveDarkMode ? '#999999' : '#757575'}
                value={fullName}
                onChangeText={validateFullName}
                autoCapitalize="words"
                returnKeyType="next"
                onSubmitEditing={() => emailRef.current.focus()}
                blurOnSubmit={false}
              />
              {fullNameError ? (
                <Text style={styles.errorText}>{fullNameError}</Text>
              ) : null}
            </View>

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <TextInput
                ref={emailRef}
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
                  onFocus={() => setShowPasswordValidations(true)}
                  onBlur={() => setShowPasswordValidations(false)}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  returnKeyType="next"
                  onSubmitEditing={() => confirmPasswordRef.current.focus()}
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

              {/* Password Validation Indicators */}
              {showPasswordValidations && (
                <View style={styles.passwordValidationContainer}>
                  <View style={styles.validationRow}>
                    <View
                      style={[
                        styles.validationDot,
                        passwordValidations.length
                          ? styles.validationSuccess
                          : styles.validationFail,
                      ]}>
                      {passwordValidations.length && (
                        <Check size={10} color="#FFFFFF" />
                      )}
                    </View>
                    <Text style={styles.validationText}>
                      At least 8 characters
                    </Text>
                  </View>
                  <View style={styles.validationRow}>
                    <View
                      style={[
                        styles.validationDot,
                        passwordValidations.lowercase
                          ? styles.validationSuccess
                          : styles.validationFail,
                      ]}>
                      {passwordValidations.lowercase && (
                        <Check size={10} color="#FFFFFF" />
                      )}
                    </View>
                    <Text style={styles.validationText}>
                      One lowercase letter
                    </Text>
                  </View>
                  <View style={styles.validationRow}>
                    <View
                      style={[
                        styles.validationDot,
                        passwordValidations.uppercase
                          ? styles.validationSuccess
                          : styles.validationFail,
                      ]}>
                      {passwordValidations.uppercase && (
                        <Check size={10} color="#FFFFFF" />
                      )}
                    </View>
                    <Text style={styles.validationText}>
                      One uppercase letter
                    </Text>
                  </View>
                  <View style={styles.validationRow}>
                    <View
                      style={[
                        styles.validationDot,
                        passwordValidations.number
                          ? styles.validationSuccess
                          : styles.validationFail,
                      ]}>
                      {passwordValidations.number && (
                        <Check size={10} color="#FFFFFF" />
                      )}
                    </View>
                    <Text style={styles.validationText}>One number</Text>
                  </View>
                  <View style={styles.validationRow}>
                    <View
                      style={[
                        styles.validationDot,
                        passwordValidations.special
                          ? styles.validationSuccess
                          : styles.validationFail,
                      ]}>
                      {passwordValidations.special && (
                        <Check size={10} color="#FFFFFF" />
                      )}
                    </View>
                    <Text style={styles.validationText}>
                      One special character
                    </Text>
                  </View>
                </View>
              )}
            </View>

            {/* Confirm Password Input */}
            <View style={styles.inputContainer}>
              <View
                style={[
                  styles.passwordContainer,
                  confirmPasswordError ? styles.inputError : null,
                  effectiveDarkMode ? styles.inputDark : styles.inputLight,
                ]}>
                <TextInput
                  ref={confirmPasswordRef}
                  style={[
                    styles.passwordInput,
                    effectiveDarkMode ? {color: '#FFFFFF'} : {color: '#010102'},
                  ]}
                  placeholder="Confirm Password"
                  placeholderTextColor={
                    effectiveDarkMode ? '#999999' : '#757575'
                  }
                  value={confirmPassword}
                  onChangeText={text => validateConfirmPassword(text)}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  returnKeyType="done"
                  onSubmitEditing={handleSignUp}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? (
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
              {confirmPasswordError ? (
                <Text style={styles.errorText}>{confirmPasswordError}</Text>
              ) : null}
            </View>

            {/* Terms and Conditions Checkbox */}
            <View style={styles.termsContainer}>
              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => validateTerms(!termsAccepted)}>
                <View
                  style={[
                    styles.checkbox,
                    termsAccepted ? styles.checkboxChecked : null,
                  ]}>
                  {termsAccepted && <Check size={12} color="#FFFFFF" />}
                </View>
              </TouchableOpacity>
              <View style={styles.termsTextContainer}>
                <Text
                  style={[
                    styles.termsText,
                    effectiveDarkMode
                      ? styles.textSecondaryDark
                      : styles.textSecondaryLight,
                  ]}>
                  By creating your account you agree to the{' '}
                  <Text
                    style={styles.termsLink}
                    onPress={() => openURL('https://olympusai.io/terms')}>
                    Terms of Use
                  </Text>{' '}
                  and our{' '}
                  <Text
                    style={styles.termsLink}
                    onPress={() => openURL('https://olympusai.io/privacy')}>
                    Privacy Policy
                  </Text>
                </Text>
              </View>
            </View>
            {termsError ? (
              <Text style={styles.errorText}>{termsError}</Text>
            ) : null}

            {/* Sign Up Button */}
            <TouchableOpacity
              style={[
                styles.signUpButton,
                !isFormComplete || isSignUpLoading || isSendingOtp
                  ? styles.buttonDisabled
                  : null,
              ]}
              onPress={handleSignUp}
              disabled={!isFormComplete || isSignUpLoading || isSendingOtp}>
              {isSignUpLoading || isSendingOtp ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.signUpButtonText}>Sign Up</Text>
              )}
            </TouchableOpacity>

            {/* Login Link */}
            <View style={styles.loginContainer}>
              <Text
                style={[
                  styles.alreadyHaveAccountText,
                  effectiveDarkMode
                    ? styles.textSecondaryDark
                    : styles.textSecondaryLight,
                ]}>
                Already have an account?
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.loginText}>Log In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>

      {/* Email Verification Modal */}
      <VerifyEmailModal
        visible={showVerifyModal}
        onClose={handleCloseVerifyModal}
      />
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
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
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
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
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

  // Password validation
  passwordValidationContainer: {
    marginTop: 10,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
  },
  validationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  validationDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  validationSuccess: {
    backgroundColor: '#4CAF50',
  },
  validationFail: {
    backgroundColor: '#E0E0E0',
  },
  validationText: {
    fontSize: 12,
    color: '#616161',
  },

  // Terms and conditions checkbox
  termsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  checkboxContainer: {
    marginRight: 10,
    paddingTop: 2,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#2C83F6',
    borderColor: '#2C83F6',
  },
  termsTextContainer: {
    flex: 1,
  },
  termsText: {
    fontSize: 13,
    lineHeight: 18,
  },
  termsLink: {
    color: '#2C83F6',
    fontWeight: '500',
  },

  // Sign Up button
  signUpButton: {
    backgroundColor: '#2C83F6',
    height: 56,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    backgroundColor: '#CCCCCC',
    opacity: 0.7,
  },
  signUpButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  // Login link section
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  alreadyHaveAccountText: {
    fontSize: 14,
    marginRight: 4,
  },
  loginText: {
    color: '#2C83F6',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default SignUpScreen;
