import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Platform,
  ActivityIndicator,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import {X} from 'lucide-react-native';
import {useNavigation} from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import {useDispatch, useSelector} from 'react-redux';
import {useSendOtpMutation, useVerifyOtpMutation} from '../services/otp';

const VerifyEmailModal = ({visible, onClose}) => {
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef([]);

  const navigation = useNavigation();
  const dispatch = useDispatch();
  const email = useSelector(state => state.global.email);
  const isDarkMode = useSelector(state => state.global.isDarkMode);

  // RTK Query hooks for OTP operations
  const [sendOtp, {isLoading: isSendingOtp}] = useSendOtpMutation();
  const [verifyOtp, {isLoading: isVerifyingOtp}] = useVerifyOtpMutation();

  // Initialize input refs
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, 6);
  }, []);

  // Auto-focus first input when modal opens
  useEffect(() => {
    if (visible && inputRefs.current[0]) {
      setTimeout(() => {
        inputRefs.current[0].focus();
      }, 300);
    }
  }, [visible]);

  // Clear inputs when modal closes
  useEffect(() => {
    if (!visible) {
      setOtpValues(['', '', '', '', '', '']);
    }
  }, [visible]);

  const handleInputChange = (index, value) => {
    // Only allow digits
    if (!/^\d*$/.test(value)) return;

    // Copy the current OTP values
    const newOtpValues = [...otpValues];

    // Update the value at the specified index (only keep the last character if multiple are entered)
    newOtpValues[index] = value.slice(-1);
    setOtpValues(newOtpValues);

    // If the input has a value and there's a next input, focus on it
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyPress = (index, e) => {
    // Handle backspace to move to previous input
    if (e.nativeEvent.key === 'Backspace' && !otpValues[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleResendCode = async () => {
    if (!email) {
      Toast.show({
        type: 'error',
        text1: 'Email not found',
        text2: 'Please try again',
      });
      return;
    }

    try {
      console.log('Attempting to resend OTP to:', email);

      // Call the resend OTP API
      const response = await sendOtp({email}).unwrap();
      console.log('Resend OTP response:', response);

      Toast.show({
        type: 'success',
        text1: 'Code Resent',
        text2: 'Check your email for the verification code',
      });

      // Reset OTP fields
      setOtpValues(['', '', '', '', '', '']);
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
    } catch (error) {
      console.error('Error resending OTP:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to resend code',
        text2: error?.data?.message || 'Please try again later',
      });
    }
  };

  const handleVerifyOtp = async () => {
    // Combine all OTP values
    const completeOtp = otpValues.join('');

    // Validate OTP
    if (completeOtp.length !== 6) {
      Toast.show({
        type: 'error',
        text1: 'Please enter all 6 digits',
      });
      return;
    }

    if (!email) {
      Toast.show({
        type: 'error',
        text1: 'Email not found',
        text2: 'Please try again',
      });
      return;
    }

    try {
      console.log(
        'Attempting to verify OTP:',
        completeOtp,
        'for email:',
        email,
      );

      // Call the verify OTP API
      const response = await verifyOtp({
        otp: completeOtp,
        email,
      }).unwrap();

      console.log('Verify OTP response:', response);

      if (response?.success) {
        Toast.show({
          type: 'success',
          text1: 'Email verified successfully!',
        });
        onClose();
        navigation.navigate('Login');
      } else {
        Toast.show({
          type: 'error',
          text1: 'Failed to verify email',
          text2: response?.message || 'Please try again',
        });
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      Toast.show({
        type: 'error',
        text1: 'Verification Failed',
        text2: error?.data?.message || 'Please try again later',
      });
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContainer,
              isDarkMode
                ? styles.modalContainerDark
                : styles.modalContainerLight,
            ]}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text
                style={[
                  styles.modalTitle,
                  isDarkMode ? styles.textDark : styles.textLight,
                ]}>
                Email Verification
              </Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <X size={24} color={isDarkMode ? '#FFFFFF' : '#010102'} />
              </TouchableOpacity>
            </View>

            {/* Modal Content */}
            <View style={styles.modalContent}>
              <Text
                style={[
                  styles.confirmationTitle,
                  isDarkMode ? styles.textDark : styles.textLight,
                ]}>
                Confirmation Message
              </Text>

              <Text
                style={[
                  styles.verificationText,
                  isDarkMode
                    ? styles.textSecondaryDark
                    : styles.textSecondaryLight,
                ]}>
                Please verify your email by entering the code we sent to your
                inbox.
              </Text>

              {/* OTP Input Container */}
              <View style={styles.otpContainer}>
                {otpValues.map((value, index) => (
                  <TextInput
                    key={index}
                    ref={el => (inputRefs.current[index] = el)}
                    style={[
                      styles.otpInput,
                      isDarkMode ? styles.otpInputDark : styles.otpInputLight,
                      value ? styles.otpInputFilled : null,
                    ]}
                    value={value}
                    onChangeText={text => handleInputChange(index, text)}
                    onKeyPress={e => handleKeyPress(index, e)}
                    maxLength={1}
                    keyboardType="number-pad"
                    textContentType="oneTimeCode" // iOS autofill support
                    autoComplete="sms-otp" // Android autofill support
                    selectionColor="#0077ff"
                  />
                ))}
              </View>

              {/* Verify Button */}
              <TouchableOpacity
                style={[styles.verifyButton, isVerifyingOtp && {opacity: 0.8}]}
                onPress={handleVerifyOtp}
                disabled={isVerifyingOtp}
                activeOpacity={0.75}>
                {isVerifyingOtp ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.verifyButtonText}>Verify</Text>
                )}
              </TouchableOpacity>

              {/* Resend Code Link */}
              <View style={styles.resendContainer}>
                <TouchableOpacity
                  onPress={handleResendCode}
                  disabled={isSendingOtp}
                  activeOpacity={0.6}>
                  {isSendingOtp ? (
                    <ActivityIndicator size="small" color="#0077ff" />
                  ) : (
                    <Text style={styles.resendLink}>Resend code</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(220, 220, 220, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 450,
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  modalContainerLight: {
    backgroundColor: '#FFFFFF',
  },
  modalContainerDark: {
    backgroundColor: '#1E1E1E',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eaeef2',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    padding: 24,
    alignItems: 'center',
  },
  confirmationTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  verificationText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 21,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 30,
  },
  otpInput: {
    width: 52,
    height: 52,
    borderWidth: 1,
    borderRadius: 4,
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
  },
  otpInputLight: {
    backgroundColor: '#FFFFFF',
    borderColor: '#dddddd',
    color: '#000000',
  },
  otpInputDark: {
    backgroundColor: '#2A2A2A',
    borderColor: '#444444',
    color: '#FFFFFF',
  },
  otpInputFilled: {
    borderColor: '#0077ff',
  },
  verifyButton: {
    backgroundColor: '#0077ff',
    width: '100%',
    height: 52,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  verifyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  resendContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  resendLink: {
    color: '#0077ff',
    fontSize: 14,
    fontWeight: '400',
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
});

export default VerifyEmailModal;
