import React, {useState, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import {useSelector, useDispatch} from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useNavigation} from '@react-navigation/native';

// Import Redux actions and API hooks
import {setPage, setRoomId, setAllChat} from '../../slices/globalSlice';
import {
  useChangeRoomNameMutation,
  useDeleteRoomMutation,
} from '../../services/chat';

const ConversationItem = ({roomInfo, index, totalItems, onSelect}) => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const isDarkMode = useSelector(state => state.global.isDarkMode);
  const currentRoomId = useSelector(state => state.global.roomId);

  // Local state
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(roomInfo.roomName);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

  // API mutation hooks
  const [changeRoomName, {isLoading: isRenamingLoading}] =
    useChangeRoomNameMutation();
  const [deleteRoom, {isLoading: isDeleting}] = useDeleteRoomMutation();

  // Check if this conversation is the currently selected one
  const isSelected = currentRoomId === roomInfo._id;

  // Position the menu based on item position in the list
  const isLastThree = totalItems >= 5 && index >= totalItems - 2;

  // Handle selecting a conversation
  const handleSelectConversation = () => {
    if (isSelected) return;

    // Reset state
    dispatch(setPage(''));
    dispatch(setRoomId(''));
    dispatch(setAllChat([]));

    // Set new room
    dispatch(setRoomId(roomInfo._id));
    dispatch(setPage(1));

    // Close the sidebar
    if (onSelect) onSelect();

    // Navigate to the conversation
    navigation.navigate('Room', {conversationId: roomInfo._id});
  };

  // Handle renaming a conversation
  const handleRename = () => {
    setIsMenuOpen(false);
    setIsRenaming(true);
  };

  // Save the new conversation name
  const saveNewName = async () => {
    if (newName.trim().length < 3) {
      Alert.alert('Error', 'Room name must be at least 3 characters long');
      return;
    }

    try {
      // Call the API to change room name
      await changeRoomName({
        roomId: roomInfo._id,
        roomName: newName.trim(),
      }).unwrap();

      // Close rename input
      setIsRenaming(false);

      // Show success message
      Alert.alert('Success', 'Room name updated successfully');
    } catch (error) {
      console.error('Error changing room name:', error);
      Alert.alert(
        'Error',
        error?.data?.message || 'Failed to update room name',
      );
    }
  };

  // Handle sharing a conversation
  const handleShare = () => {
    setIsMenuOpen(false);
    // Implement share functionality
    Alert.alert('Share', 'Sharing functionality to be implemented');
  };

  // Handle deleting a conversation
  const handleDelete = () => {
    setIsMenuOpen(false);
    setIsDeleteModalVisible(true);
  };

  // Confirm deletion
  const confirmDelete = async () => {
    try {
      // Call the API to delete the room
      await deleteRoom({roomId: roomInfo._id}).unwrap();

      setIsDeleteModalVisible(false);

      // If the deleted room is the current one, navigate to home
      if (currentRoomId === roomInfo._id) {
        dispatch(setRoomId(''));
        dispatch(setPage(''));
        navigation.navigate('Home');
      }

      // Show success message
      Alert.alert('Success', 'Conversation deleted successfully');
    } catch (error) {
      console.error('Error deleting room:', error);
      Alert.alert(
        'Error',
        error?.data?.message || 'Failed to delete conversation',
      );
      setIsDeleteModalVisible(false);
    }
  };

  return (
    <>
      <TouchableOpacity
        style={[
          styles.container,
          isSelected && isDarkMode
            ? styles.selectedDark
            : isSelected
            ? styles.selected
            : isDarkMode
            ? styles.containerDark
            : styles.containerLight,
        ]}
        onPress={handleSelectConversation}
        activeOpacity={0.7}>
        {isRenaming ? (
          <View style={styles.renameContainer}>
            <TextInput
              style={[
                styles.renameInput,
                isDarkMode ? styles.textDark : styles.textLight,
              ]}
              value={newName}
              onChangeText={setNewName}
              autoFocus
              selectTextOnFocus
            />
            <TouchableOpacity
              onPress={saveNewName}
              style={styles.iconButton}
              disabled={isRenamingLoading}>
              <Icon name="check" size={20} color="#2C83F6" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setIsRenaming(false)}
              style={styles.iconButton}
              disabled={isRenamingLoading}>
              <Icon name="close" size={20} color="#FF5252" />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.contentContainer}>
            <Text
              style={[
                styles.title,
                isSelected && isDarkMode
                  ? styles.selectedTextDark
                  : isSelected
                  ? styles.selectedText
                  : isDarkMode
                  ? styles.textDark
                  : styles.textLight,
              ]}
              numberOfLines={2}>
              {roomInfo.roomName}
            </Text>

            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => setIsMenuOpen(!isMenuOpen)}>
              <Icon
                name="dots-vertical"
                size={20}
                color={isDarkMode ? '#DDD' : '#666'}
              />
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>

      {/* Menu popup */}
      {isMenuOpen && (
        <View
          style={[
            styles.menuContainer,
            isDarkMode ? styles.menuDark : styles.menuLight,
            isLastThree ? styles.menuTop : styles.menuBottom,
          ]}>
          <TouchableOpacity style={styles.menuItem} onPress={handleShare}>
            <Icon
              name="share-outline"
              size={18}
              color={isDarkMode ? '#FFF' : '#333'}
            />
            <Text style={isDarkMode ? styles.textDark : styles.textLight}>
              Share
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={handleRename}>
            <Icon
              name="pencil-outline"
              size={18}
              color={isDarkMode ? '#FFF' : '#333'}
            />
            <Text style={isDarkMode ? styles.textDark : styles.textLight}>
              Rename
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={handleDelete}>
            <Icon
              name="delete-outline"
              size={18}
              color={isDarkMode ? '#FFF' : '#333'}
            />
            <Text style={isDarkMode ? styles.textDark : styles.textLight}>
              Delete
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Delete confirmation modal */}
      <Modal
        visible={isDeleteModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsDeleteModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContainer,
              isDarkMode ? styles.modalDark : styles.modalLight,
            ]}>
            <Text
              style={[
                styles.modalTitle,
                isDarkMode ? styles.textDark : styles.textLight,
              ]}>
              Delete Conversation
            </Text>

            <Text
              style={[
                styles.modalText,
                isDarkMode
                  ? styles.textSecondaryDark
                  : styles.textSecondaryLight,
              ]}>
              Are you sure you want to delete "{roomInfo.roomName}"? This action
              cannot be undone.
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setIsDeleteModalVisible(false)}
                disabled={isDeleting}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.deleteButton]}
                onPress={confirmDelete}
                disabled={isDeleting}>
                {isDeleting ? (
                  <Text style={styles.deleteButtonText}>Deleting...</Text>
                ) : (
                  <Text style={styles.deleteButtonText}>Delete</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  containerLight: {
    backgroundColor: 'transparent',
    borderBottomColor: '#F0F0F0',
  },
  containerDark: {
    backgroundColor: 'transparent',
    borderBottomColor: '#333',
  },
  selected: {
    backgroundColor: '#F0F7FF',
    borderBottomColor: '#F0F0F0',
  },
  selectedDark: {
    backgroundColor: '#1A2E42',
    borderBottomColor: '#333',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    flex: 1,
    fontSize: 14,
    marginRight: 8,
  },
  textLight: {
    color: '#333',
  },
  textDark: {
    color: '#FFF',
  },
  textSecondaryLight: {
    color: '#666',
  },
  textSecondaryDark: {
    color: '#AAA',
  },
  selectedText: {
    color: '#2C83F6',
    fontWeight: '500',
  },
  selectedTextDark: {
    color: '#5AA9FF',
    fontWeight: '500',
  },
  menuButton: {
    padding: 4,
  },
  // Rename input
  renameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  renameInput: {
    flex: 1,
    fontSize: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#2C83F6',
    paddingVertical: 2,
    marginRight: 8,
  },
  iconButton: {
    padding: 4,
  },
  // Popup menu
  menuContainer: {
    position: 'absolute',
    right: 16,
    width: 140,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 10,
  },
  menuLight: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#EEE',
  },
  menuDark: {
    backgroundColor: '#2A2A2A',
    borderWidth: 1,
    borderColor: '#444',
  },
  menuBottom: {
    top: 46,
  },
  menuTop: {
    bottom: 46,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 8,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  modalLight: {
    backgroundColor: '#FFF',
  },
  modalDark: {
    backgroundColor: '#2A2A2A',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  modalText: {
    fontSize: 14,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginLeft: 8,
  },
  cancelButton: {
    backgroundColor: '#F0F0F0',
  },
  cancelButtonText: {
    color: '#333',
  },
  deleteButton: {
    backgroundColor: '#FF5252',
  },
  deleteButtonText: {
    color: '#FFF',
  },
});

export default ConversationItem;
