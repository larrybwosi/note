import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export const ToolsSection: React.FC = () => {
  const handleImageSelection = () => {
    Alert.alert("Image Selection", "This feature will allow you to change the cover image.");
  };

  const handleSetReminder = () => {
    Alert.alert("Set Reminder", "This feature will allow you to set a reminder for your note.");
  };

  const handleVoiceNote = () => {
    Alert.alert("Voice Note", "This feature will allow you to record a voice note.");
  };

  const handleDrawing = () => {
    Alert.alert("Drawing", "This feature will allow you to draw in your notes.");
  };

  const handleTextHighlight = () => {
    Alert.alert("Text Highlight", "This feature will allow you to highlight important text.");
  };

  const handleChecklist = () => {
    Alert.alert("Checklist", "This feature will allow you to create a checklist within your notes.");
  };

  return (
    <View className="mb-4">
      <Text className="text-lg font-bold mb-2">Tools</Text>
      <View className="flex-row flex-wrap">
        <TouchableOpacity
          onPress={handleImageSelection}
          className="bg-gray-100 p-4 rounded-lg mr-2 mb-2 items-center"
        >
          <MaterialIcons name="image" size={24} color="#374151" />
          <Text className="text-sm mt-1">Change Cover</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleSetReminder}
          className="bg-gray-100 p-4 rounded-lg mr-2 mb-2 items-center"
        >
          <MaterialIcons name="alarm" size={24} color="#374151" />
          <Text className="text-sm mt-1">Set Reminder</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleVoiceNote}
          className="bg-gray-100 p-4 rounded-lg mr-2 mb-2 items-center"
        >
          <MaterialIcons name="mic" size={24} color="#374151" />
          <Text className="text-sm mt-1">Voice Note</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleDrawing}
          className="bg-gray-100 p-4 rounded-lg mr-2 mb-2 items-center"
        >
          <MaterialIcons name="brush" size={24} color="#374151" />
          <Text className="text-sm mt-1">Drawing</Text>
        </TouchableOpacity>

        {/* New Tools */}
        <TouchableOpacity
          onPress={handleTextHighlight}
          className="bg-gray-100 p-4 rounded-lg mr-2 mb-2 items-center"
        >
          <MaterialIcons name="highlight" size={24} color="#374151" />
          <Text className="text-sm mt-1">Highlight Text</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleChecklist}
          className="bg-gray-100 p-4 rounded-lg mr-2 mb-2 items-center"
        >
          <MaterialIcons name="check-box" size={24} color="#374151" />
          <Text className="text-sm mt-1">Checklist</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};