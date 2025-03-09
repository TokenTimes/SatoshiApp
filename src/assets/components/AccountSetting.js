import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {
  useChangePasswordMutation,
  useDeleteProfileMutation,
} from '../../services/user'; // Adjust the import path as needed
import {setAuthToken, setUserDetails} from '../../slices/globalSlice'; // Adjust the import path as needed

// Custom components - these would need to be created separately
const PasswordChangeModal = ({visible, onClose, onSubmit, isLoading}) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const isDarkMode = useSelector(state => state.global.isDarkMode);

  const handleSubmit = () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      setError('All fields are required');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    onSubmit({
      oldPassword,
      newPassword,
      confirmPassword,
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View
          style={[
            styles.modalContent,
            isDarkMode ? styles.modalContentDark : {},
          ]}>
          <Text
            style={[
              styles.modalTitle,
              isDarkMode ? styles.modalTitleDark : {},
            ]}>
            Change Password
          </Text>

          <Text
            style={[
              styles.fieldLabel,
              isDarkMode ? styles.fieldLabelDark : {},
            ]}>
            Current Password
          </Text>
          <View
            style={[
              styles.inputContainer,
              isDarkMode ? styles.inputContainerDark : {},
            ]}>
            <TextInput
              style={[styles.input, isDarkMode ? styles.inputDark : {}]}
              placeholder="Enter your current password"
              placeholderTextColor={isDarkMode ? '#777A7E' : '#A0A4A8'}
              secureTextEntry
              value={oldPassword}
              onChangeText={setOldPassword}
            />
          </View>

          <Text
            style={[
              styles.fieldLabel,
              isDarkMode ? styles.fieldLabelDark : {},
            ]}>
            New Password
          </Text>
          <View
            style={[
              styles.inputContainer,
              isDarkMode ? styles.inputContainerDark : {},
            ]}>
            <TextInput
              style={[styles.input, isDarkMode ? styles.inputDark : {}]}
              placeholder="Enter your new password"
              placeholderTextColor={isDarkMode ? '#777A7E' : '#A0A4A8'}
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
            />
          </View>

          <Text
            style={[
              styles.fieldLabel,
              isDarkMode ? styles.fieldLabelDark : {},
            ]}>
            Confirm New Password
          </Text>
          <View
            style={[
              styles.inputContainer,
              isDarkMode ? styles.inputContainerDark : {},
            ]}>
            <TextInput
              style={[styles.input, isDarkMode ? styles.inputDark : {}]}
              placeholder="Confirm your new password"
              placeholderTextColor={isDarkMode ? '#777A7E' : '#A0A4A8'}
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[
                styles.button,
                styles.cancelButton,
                isDarkMode ? styles.cancelButtonDark : {},
              ]}
              onPress={onClose}>
              <Text
                style={[
                  styles.buttonText,
                  styles.cancelButtonText,
                  isDarkMode ? styles.cancelButtonTextDark : {},
                ]}>
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                styles.saveButton,
                isLoading ? styles.disabledButton : {},
              ]}
              onPress={handleSubmit}
              disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.saveButtonText}>Save</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const DeleteAccountModal = ({visible, onClose, onConfirm, isLoading}) => {
  const isDarkMode = useSelector(state => state.global.isDarkMode);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View
          style={[
            styles.modalContent,
            isDarkMode ? styles.modalContentDark : {},
          ]}>
          <Text
            style={[
              styles.modalTitle,
              isDarkMode ? styles.modalTitleDark : {},
            ]}>
            Delete Account
          </Text>

          <Text
            style={[styles.modalText, isDarkMode ? styles.modalTextDark : {}]}>
            Are you sure you want to delete your account? This action cannot be
            undone.
          </Text>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[
                styles.button,
                styles.cancelButton,
                isDarkMode ? styles.cancelButtonDark : {},
              ]}
              onPress={onClose}>
              <Text
                style={[
                  styles.buttonText,
                  styles.cancelButtonText,
                  isDarkMode ? styles.cancelButtonTextDark : {},
                ]}>
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                styles.deleteButton,
                isLoading ? styles.disabledButton : {},
              ]}
              onPress={onConfirm}
              disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.deleteButtonText}>Delete</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Main Component
const AccountSetting = () => {
  const dispatch = useDispatch();
  const isDarkMode = useSelector(state => state.global.isDarkMode);
  const isMobile = useSelector(state => state.global.isMobile);

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const [changePassword, {isLoading}] = useChangePasswordMutation();
  const [deleteProfile, {isLoading: isLoadingDelete}] =
    useDeleteProfileMutation();

  const handlePasswordSave = async data => {
    try {
      await changePassword(data).unwrap();
      setShowPasswordModal(false);
      setPasswordSuccess(true);
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (error) {
      console.error('ChangePassword error', error);
      // You'd use a toast alternative for React Native here
      alert('Failed to change password. Please try again.');
    }
  };

  const handleConfirmDelete = async () => {
    try {
      const response = await deleteProfile().unwrap();
      if (response) {
        dispatch(setAuthToken(''));
        dispatch(setUserDetails(''));
        // You'll need navigation logic here instead of Next.js router
        // navigation.navigate('Login');
        setShowDeleteModal(false);
      }
    } catch (error) {
      console.error('Delete Error:', error);
      alert(error?.data?.message || 'Failed to delete account');
    }
  };

  return (
    <View style={[styles.container, isDarkMode ? styles.containerDark : {}]}>
      <Text
        style={[
          styles.contentTitle,
          isDarkMode ? styles.contentTitleDark : {},
        ]}>
        Account Settings
      </Text>

      {/* Change Password Section */}
      <View
        style={[
          styles.profileField,
          isDarkMode ? styles.profileFieldDark : {},
        ]}>
        <View style={styles.fieldContent}>
          <Text
            style={[
              styles.fieldLabel,
              isDarkMode ? styles.fieldLabelDark : {},
            ]}>
            Change Password
          </Text>
          <Text style={styles.sectionSubtitle}>
            Update your password to keep your account secure.
          </Text>
        </View>
        <TouchableOpacity
          style={[
            styles.actionButton,
            isDarkMode ? styles.actionButtonDark : {},
          ]}
          onPress={() => setShowPasswordModal(true)}>
          <Text
            style={[
              styles.actionButtonText,
              isDarkMode ? styles.actionButtonTextDark : {},
            ]}>
            Change
          </Text>
        </TouchableOpacity>
      </View>

      {/* Delete Account Section */}
      <View
        style={[styles.dangerZone, isDarkMode ? styles.dangerZoneDark : {}]}>
        <View style={styles.profileField}>
          <View style={styles.fieldContent}>
            <Text
              style={[
                styles.fieldLabel,
                isDarkMode ? styles.fieldLabelDark : {},
              ]}>
              Delete Account
            </Text>
            <Text style={styles.sectionSubtitle}>
              Permanently remove your account and data.
            </Text>
          </View>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => setShowDeleteModal(true)}>
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Password Change Modal */}
      <PasswordChangeModal
        visible={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onSubmit={handlePasswordSave}
        isLoading={isLoading}
      />

      {/* Delete Account Modal */}
      <DeleteAccountModal
        visible={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        isLoading={isLoadingDelete}
      />

      {/* Success Notification */}
      {passwordSuccess && (
        <View style={styles.successNotification}>
          <Icon
            name="check-circle"
            size={20}
            color="#4CAF50"
            style={styles.successIcon}
          />
          <Text style={styles.successText}>Password changed successfully</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  containerDark: {
    backgroundColor: '#181a1c',
  },
  contentTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 24,
    color: '#000000',
  },
  contentTitleDark: {
    color: '#FFFFFF',
  },
  profileField: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EAEEF2',
  },
  profileFieldDark: {
    borderBottomColor: '#202324',
  },
  fieldContent: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    color: '#000000',
  },
  fieldLabelDark: {
    color: '#FFFFFF',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#777A7E',
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
  },
  actionButtonDark: {
    backgroundColor: '#252729',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
  },
  actionButtonTextDark: {
    color: '#FFFFFF',
  },
  dangerZone: {
    marginTop: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFE5E5',
    overflow: 'hidden',
  },
  dangerZoneDark: {
    borderColor: '#3A2A2A',
    backgroundColor: '#2A1A1A',
  },
  deleteButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#FFE5E5',
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FF3B30',
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalContentDark: {
    backgroundColor: '#252729',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    color: '#000000',
  },
  modalTitleDark: {
    color: '#FFFFFF',
  },
  modalText: {
    fontSize: 14,
    marginBottom: 24,
    color: '#000000',
  },
  modalTextDark: {
    color: '#FFFFFF',
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: '#EAEEF2',
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  inputContainerDark: {
    borderColor: '#202324',
    backgroundColor: '#181a1c',
  },
  input: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#000000',
  },
  inputDark: {
    color: '#FFFFFF',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginLeft: 12,
    minWidth: 80,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
  },
  cancelButtonDark: {
    backgroundColor: '#252729',
  },
  saveButton: {
    backgroundColor: '#2C83F6',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  cancelButtonText: {
    color: '#000000',
  },
  cancelButtonTextDark: {
    color: '#FFFFFF',
  },
  saveButtonText: {
    color: '#FFFFFF',
  },
  deleteButtonText: {
    color: '#FFFFFF',
  },

  // Success notification
  successNotification: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#E7F5E8',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  successIcon: {
    marginRight: 12,
  },
  successText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
});

export default AccountSetting;
