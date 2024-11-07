import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export const ToolsSection: React.FC = () => (
  <View className="mb-4">
    <Text className="text-lg font-bold mb-2">Tools</Text>
    <View className="flex-row flex-wrap">
      <TouchableOpacity
        onPress={() => {
          /* Handle image selection */
        }}
        className="bg-gray-100 p-4 rounded-lg mr-2 mb-2 items-center"
      >
        <MaterialIcons name="image" size={24} color="#374151" />
        <Text className="text-sm mt-1">Change Cover</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => {
          const date = new Date();
          date.setDate(date.getDate() + 1);
          // Set reminder logic here
        }}
        className="bg-gray-100 p-4 rounded-lg mr-2 mb-2 items-center"
      >
        <MaterialIcons name="alarm" size={24} color="#374151" />
        <Text className="text-sm mt-1">Set Reminder</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => {
          // Implement voice recording
        }}
        className="bg-gray-100 p-4 rounded-lg mr-2 mb-2 items-center"
      >
        <MaterialIcons name="mic" size={24} color="#374151" />
        <Text className="text-sm mt-1">Voice Note</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => {
          // Implement drawing
        }}
        className="bg-gray-100 p-4 rounded-lg mr-2 mb-2 items-center"
      >
        <MaterialIcons name="brush" size={24} color="#374151" />
        <Text className="text-sm mt-1">Drawing</Text>
      </TouchableOpacity>
    </View>
  </View>
);