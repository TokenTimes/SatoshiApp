import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import {useSelector} from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useGetUserDetailQuery} from '../../services/user'; // Adjust the import path as needed

// Edit Name Modal Component
const EditNameModal = ({
  visible,
  onClose,
  currentName,
  onNameUpdated,
  isMobile,
}) => {
  const [name, setName] = useState(currentName || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const isDarkMode = useSelector(state => state.global.isDarkMode);

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Name cannot be empty');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Simulating API call for demo - replace with your actual API call
      setTimeout(() => {
        onNameUpdated(name);
        setIsLoading(false);
        onClose(true);
      }, 1000);
    } catch (error) {
      setError('Failed to update name');
      setIsLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => onClose(false)}>
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
            Edit Name
          </Text>

          <Text
            style={[
              styles.fieldLabel,
              isDarkMode ? styles.fieldLabelDark : {},
            ]}>
            Name
          </Text>
          <View
            style={[
              styles.inputContainer,
              isDarkMode ? styles.inputContainerDark : {},
            ]}>
            <TextInput
              style={[styles.input, isDarkMode ? styles.inputDark : {}]}
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
              placeholderTextColor={isDarkMode ? '#777A7E' : '#A0A4A8'}
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
              onPress={() => onClose(false)}>
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
              onPress={handleSave}
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

// Edit Email Modal Component
const EditEmailModal = ({
  visible,
  onClose,
  currentEmail,
  onEmailUpdated,
  isMobile,
}) => {
  const [email, setEmail] = useState(currentEmail || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const isDarkMode = useSelector(state => state.global.isDarkMode);

  const handleSave = async () => {
    if (!email.trim()) {
      setError('Email cannot be empty');
      return;
    }

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Simulating API call for demo - replace with your actual API call
      setTimeout(() => {
        onEmailUpdated(email);
        setIsLoading(false);
        onClose(true);
      }, 1000);
    } catch (error) {
      setError('Failed to update email');
      setIsLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => onClose(false)}>
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
            Edit Email
          </Text>

          <Text
            style={[
              styles.fieldLabel,
              isDarkMode ? styles.fieldLabelDark : {},
            ]}>
            Email Address
          </Text>
          <View
            style={[
              styles.inputContainer,
              isDarkMode ? styles.inputContainerDark : {},
            ]}>
            <TextInput
              style={[styles.input, isDarkMode ? styles.inputDark : {}]}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              placeholderTextColor={isDarkMode ? '#777A7E' : '#A0A4A8'}
              keyboardType="email-address"
              autoCapitalize="none"
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
              onPress={() => onClose(false)}>
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
              onPress={handleSave}
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

// Main Component
const ProfileManagement = () => {
  const [showNameModal, setShowNameModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [nameSuccessMessage, setNameSuccessMessage] = useState(false);
  const [emailSuccessMessage, setEmailSuccessMessage] = useState(false);
  const isDarkMode = useSelector(state => state.global.isDarkMode);
  const isMobile = useSelector(state => state.global.isMobile);

  const {data: userData} = useGetUserDetailQuery();
  const [name, setName] = useState('Eddie Lake');
  const [email, setEmail] = useState('eddie_lake@gmail.com');

  // Update state with user data when available
  useEffect(() => {
    if (userData?.data) {
      setName(userData.data.name || '');
      setEmail(userData.data.email || '');
    }
  }, [userData]);

  return (
    <View style={[styles.container, isDarkMode ? styles.containerDark : {}]}>
      <View style={styles.profileContainer}>
        {/* Title at the top */}
        <Text
          style={[
            styles.profileTitle,
            isDarkMode ? styles.profileTitleDark : {},
          ]}>
          Profile Management
        </Text>

        {/* Profile avatar and info section */}
        <View style={styles.profileHeader}>
          <View
            style={
              isDarkMode ? styles.avatarWrapperDark : styles.avatarWrapper
            }>
            <Image
              source={
                !isDarkMode
                  ? require('../../assets/images/sidebarLogoBlack.png')
                  : require('../../assets/images/sidebarLogo.png')
              } // Update path as needed
              style={styles.avatar}
              resizeMode="contain"
            />
          </View>
          <View style={styles.uploadInfo}>
            <Text
              style={[
                styles.sectionTitle,
                isDarkMode ? styles.sectionTitleDark : {},
              ]}>
              Profile Image
            </Text>
            <Text style={styles.sectionSubtitle}>
              Upload image in 500x500 resolution. Max 5 MB in JPEG or PNG format
            </Text>
            <TouchableOpacity
              style={[
                styles.changeImageButton,
                isDarkMode ? styles.changeImageButtonDark : {},
              ]}>
              <Text
                style={[
                  styles.changeImageButtonText,
                  isDarkMode ? styles.changeImageButtonTextDark : {},
                ]}>
                Change Image
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Name Field */}
      <View
        style={[
          styles.profileField,
          styles.profileFieldX,
          isDarkMode ? styles.profileFieldDark : {},
        ]}>
        <View>
          <Text style={styles.fieldLabel}>Name</Text>
          <Text
            style={[
              styles.fieldValue,
              isDarkMode ? styles.fieldValueDark : {},
            ]}>
            {name}
          </Text>
        </View>
        <TouchableOpacity onPress={() => setShowNameModal(true)}>
          <Icon
            name="edit"
            size={20}
            color={isDarkMode ? '#ffffff' : '#000000'}
            style={styles.editIcon}
          />
        </TouchableOpacity>
      </View>

      {/* Email Field */}
      <View
        style={[
          styles.profileField,
          isDarkMode ? styles.profileFieldDark : {},
        ]}>
        <View>
          <Text style={styles.fieldLabel}>Email address</Text>
          <Text
            style={[
              styles.fieldValue,
              isDarkMode ? styles.fieldValueDark : {},
            ]}>
            {email}
          </Text>
        </View>
        <TouchableOpacity onPress={() => setShowEmailModal(true)}>
          <Icon
            name="edit"
            size={20}
            color={isDarkMode ? '#ffffff' : '#000000'}
            style={styles.editIcon}
          />
        </TouchableOpacity>
      </View>

      {/* Name Modal */}
      <EditNameModal
        visible={showNameModal}
        onClose={success => {
          setShowNameModal(false);
          if (success) {
            setNameSuccessMessage(true);
            setTimeout(() => setNameSuccessMessage(false), 3000);
          }
        }}
        currentName={name}
        onNameUpdated={newName => setName(newName)}
        isMobile={isMobile}
      />

      {/* Email Modal */}
      <EditEmailModal
        visible={showEmailModal}
        onClose={success => {
          setShowEmailModal(false);
          if (success) {
            setEmailSuccessMessage(true);
            setTimeout(() => setEmailSuccessMessage(false), 3000);
          }
        }}
        currentEmail={email}
        onEmailUpdated={newEmail => setEmail(newEmail)}
        isMobile={isMobile}
      />

      {/* Success Notifications */}
      {nameSuccessMessage && (
        <View style={styles.successNotification}>
          <Icon
            name="check-circle"
            size={20}
            color="#4CAF50"
            style={styles.successIcon}
          />
          <Text style={styles.successText}>Name changed successfully</Text>
        </View>
      )}

      {emailSuccessMessage && (
        <View style={styles.successNotification}>
          <Icon
            name="check-circle"
            size={20}
            color="#4CAF50"
            style={styles.successIcon}
          />
          <Text style={styles.successText}>
            Email address changed successfully
          </Text>
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
  profileContainer: {
    paddingBottom: 16,
  },
  profileTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 24,
    color: '#000000',
  },
  profileTitleDark: {
    color: '#FFFFFF',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarWrapper: {
    width: 70,
    height: 70,
    borderRadius: 35,
    overflow: 'hidden',
    marginRight: 16,
    backgroundColor: '#EAEEF2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarWrapperDark: {
    width: 70,
    height: 70,
    borderRadius: 35,
    overflow: 'hidden',
    marginRight: 16,
    backgroundColor: '#3e3e3e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
  },
  uploadInfo: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#000000',
  },
  sectionTitleDark: {
    color: '#FFFFFF',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#777A7E',
    marginBottom: 12,
  },
  changeImageButton: {
    backgroundColor: '#F5F5F5',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  changeImageButtonDark: {
    backgroundColor: '#252729',
  },
  changeImageButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#000000',
  },
  changeImageButtonTextDark: {
    color: '#FFFFFF',
  },
  profileFieldX: {
    borderTopWidth: 1,
    borderTopColor: '#EAEEF2',
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
    borderTopColor: '#202324',
    borderBottomColor: '#202324',
  },
  fieldLabel: {
    fontSize: 12,
    color: '#777A7E',
    marginBottom: 4,
  },
  fieldLabelDark: {
    color: '#A0A4A8',
  },
  fieldValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
  },
  fieldValueDark: {
    color: '#FFFFFF',
  },
  editIcon: {
    padding: 4,
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

export default ProfileManagement;
