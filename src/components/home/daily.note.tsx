import { Text, View, Pressable, Keyboard } from 'react-native';
import { useState } from 'react';
import { Edit, Save } from 'lucide-react-native';
import { colorScheme, } from 'nativewind';
import { Reactive } from '@legendapp/state/react';

const DailyNotes = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [notes, setNotes] = useState('');
  const isDark = colorScheme.get() === "dark"

  const handleSave = () => {
    // homeState.dailyNotes.set(notes);
    setIsEditing(false);
    Keyboard.dismiss();
  };
  return (
    <View
      className="flex-1 mx-2 mt-6 p-4 bg-white rounded-2xl shadow-lg dark:bg-gray-900 mb-4 z-10 " >
      <View className="flex-row justify-between items-center mb-3">
        <Text className={`text-lg font-rmedium dark:text-white text-gray-800`} >
          Daily Notes
        </Text>
        <Pressable
          onPress={() => {
            if (isEditing) {
              handleSave();
            } else {
              setIsEditing(true);
            }
          }}
          className="p-2"
        >
          {isEditing ? (
            <Save/>
          ) : (
            <Edit size={20} className='dark:bg-white bg-[#374151]'/>
          )}
        </Pressable>
      </View>
      <Reactive.TextInput
        multiline
        value={notes}
        onChangeText={setNotes}
        editable={isEditing}
        className={`min-h-[100] text-base font-aregular dark:text-gray-100 text-gray-700`}
        placeholder="Write your thoughts for today..."
        placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
        style={{ textAlignVertical: 'top' }}
      />
    </View>
  );
};

export default DailyNotes