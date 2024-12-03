import { useState, useRef } from 'react';
import { View, Text, TextInput, ActivityIndicator, Alert } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';
import { Plus, ExternalLink, X, Check, Trash2 } from 'lucide-react-native';
import { Reference } from 'src/store/notes/types';
import { Swipeable } from 'react-native-gesture-handler';
import * as Linking from 'expo-linking'

interface ReferencesListProps {
  references: Reference[];
  onAddReference: (newReference: Reference) => void;
  onDeleteReference: (id: string) => void;
}

export const ReferencesList: React.FC<ReferencesListProps> = ({ 
  references, 
  onAddReference,
  onDeleteReference
}) => {
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeReference, setActiveReference] = useState<string | null>(null);

  const inputRef = useRef<TextInput>(null);

  const handleAddReference = () => {
    if (newTitle.trim() && newUrl.trim()) {
      if (!newUrl.startsWith('http://') && !newUrl.startsWith('https://')) {
        Alert.alert('Invalid URL', 'Please enter a valid URL starting with http:// or https://');
        return;
      }
      onAddReference({ id: Date.now().toString(), title: newTitle.trim(), url: newUrl.trim(), type:'article' });
      setNewTitle('');
      setNewUrl('');
      setIsAdding(false);
    } else {
      Alert.alert('Missing Information', 'Please enter both a title and a URL for the reference.');
    }
  };

  const handleOpenUrl = async (url: string, id: string) => {
    setIsLoading(true);
    setActiveReference(id);
    try {
      await Linking.openURL(url);
    } catch (error) {
      Alert.alert('Error', 'Could not open the URL. Please check if it is valid.');
    } finally {
      setIsLoading(false);
      setActiveReference(null);
    }
  };

  const renderRightActions = (id: string) => {
    return (
      <TouchableOpacity
        className="bg-red-500 justify-center items-center w-16"
        onPress={() => onDeleteReference(id)}
      >
        <Trash2 size={24} color="#ffffff" />
      </TouchableOpacity>
    );
  };

  return (
    <View className="space-y-4">
      {references.map((reference) => (
        <Animated.View
          key={reference.id}
          entering={FadeIn}
          exiting={FadeOut}
          layout={LinearTransition.springify()}
        >
          <Swipeable renderRightActions={() => renderRightActions(reference.id)}>
            <TouchableOpacity 
              className="flex-row items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm"
              onPress={() => handleOpenUrl(reference.url!, reference.id)}
              disabled={isLoading && activeReference === reference.id}
            >
              <View className="flex-1 mr-2">
                <Text className="text-blue-600 dark:text-blue-400 font-rbold text-base" numberOfLines={1}>{reference.title}</Text>
                <Text className="text-gray-500 dark:text-gray-400 text-xs mt-1" numberOfLines={1}>{reference.url}</Text>
              </View>
              {isLoading && activeReference === reference.id ? (
                <ActivityIndicator color="#60A5FA" />
              ) : (
                <ExternalLink size={20} color="#60A5FA" />
              )}
            </TouchableOpacity>
          </Swipeable>
        </Animated.View>
      ))}
      {isAdding ? (
        <Animated.View 
          className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm"
          entering={FadeIn}
          exiting={FadeOut}
        >
          <TextInput
            ref={inputRef}
            className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white p-3 rounded-lg mb-2"
            placeholder="Reference title"
            placeholderTextColor="#9CA3AF"
            value={newTitle}
            onChangeText={setNewTitle}
            autoFocus
          />
          <TextInput
            className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white p-3 rounded-lg mb-4"
            placeholder="Reference URL"
            placeholderTextColor="#9CA3AF"
            value={newUrl}
            onChangeText={setNewUrl}
            keyboardType="url"
            autoCapitalize="none"
          />
          <View className="flex-row justify-end space-x-2">
            <TouchableOpacity 
              onPress={() => setIsAdding(false)}
              className="bg-gray-200 dark:bg-gray-600 p-2 rounded-lg items-center flex-row"
            >
              <X size={20} color="#EF4444" />
              <Text className="text-gray-800 dark:text-white font-rbold ml-2">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={handleAddReference}
              className="bg-blue-500 p-2 rounded-lg items-center flex-row"
            >
              <Check size={20} color="#ffffff" />
              <Text className="text-white font-rbold ml-2">Add</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      ) : (
        <TouchableOpacity 
          onPress={() => {
            setIsAdding(true);
            setTimeout(() => inputRef.current?.focus(), 100);
          }}
          className="flex-row items-center justify-center bg-blue-500 p-3 rounded-lg"
        >
          <Plus size={20} color="#ffffff" />
          <Text className="ml-2 text-white font-rbold">Add Reference</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

