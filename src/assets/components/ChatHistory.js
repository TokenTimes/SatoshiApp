import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {useSelector, useDispatch} from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ConversationItem from './ConversationItem';
import {useGetAllRoomQuery} from '../../services/chat';

// Define sorting constants
const SORT_OLDEST = 'old';
const SORT_NEWEST = 'new';
const DEFAULT_SORT = SORT_NEWEST;

const ChatHistory = ({
  onSelectConversation,
  searchQuery = '',
  setSearchQuery = () => {},
}) => {
  const dispatch = useDispatch();
  const isDarkMode = useSelector(state => state.global.isDarkMode);
  const {roomPage} = useSelector(state => state.global);

  // State for sort only (search is now passed from parent)
  const [sort, setSort] = useState(DEFAULT_SORT);

  const {data: roomData, isFetching} = useGetAllRoomQuery({sort});

  // Initialize sort preference from AsyncStorage
  useEffect(() => {
    const loadSortPreference = async () => {
      try {
        const savedSort = await AsyncStorage.getItem('chatSort');
        if (savedSort === SORT_NEWEST || savedSort === SORT_OLDEST) {
          setSort(savedSort);
        } else {
          // Default for new users
          await AsyncStorage.setItem('chatSort', DEFAULT_SORT);
        }
      } catch (error) {
        console.error('Error loading sort preference:', error);
      }
    };

    loadSortPreference();
  }, []);

  // Save sort preference when changed
  useEffect(() => {
    const saveSortPreference = async () => {
      try {
        await AsyncStorage.setItem('chatSort', sort);
      } catch (error) {
        console.error('Error saving sort preference:', error);
      }
    };

    saveSortPreference();
  }, [sort]);

  // Filter conversations based on search query
  const filteredConversations = React.useMemo(() => {
    if (!roomData?.data?.rooms) return [];

    return roomData.data.rooms.filter(room =>
      room.roomName.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [roomData, searchQuery]);

  // Toggle sort between oldest and newest
  const toggleSort = () => {
    setSort(prevSort => (prevSort === SORT_NEWEST ? SORT_OLDEST : SORT_NEWEST));
  };

  return (
    <View style={styles.container}>
      {/* Sort button */}
      <TouchableOpacity
        style={[
          styles.sortButton,
          isDarkMode ? styles.sortButtonDark : styles.sortButtonLight,
        ]}
        onPress={toggleSort}>
        <Text style={isDarkMode ? styles.textDark : styles.textLight}>
          Sort: {sort === SORT_NEWEST ? 'Newest' : 'Oldest'}
        </Text>
      </TouchableOpacity>

      {/* Conversation list */}
      {isFetching ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2C83F6" />
        </View>
      ) : filteredConversations.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={isDarkMode ? styles.textDark : styles.textLight}>
            {searchQuery
              ? 'No conversations found matching your search'
              : 'No conversations yet'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredConversations}
          keyExtractor={item => item._id}
          renderItem={({item, index}) => (
            <ConversationItem
              roomInfo={item}
              index={index}
              totalItems={filteredConversations.length}
              onSelect={onSelectConversation}
            />
          )}
          style={styles.list}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 12,
    marginVertical: 8,
    borderRadius: 8,
  },
  sortButtonLight: {
    backgroundColor: '#F0F0F0',
  },
  sortButtonDark: {
    backgroundColor: '#333',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  retryButton: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#2C83F6',
    borderRadius: 8,
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  textLight: {
    color: '#333',
  },
  textDark: {
    color: '#FFF',
  },
});

export default ChatHistory;
