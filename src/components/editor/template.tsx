import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const templates = [
  { id: 'bullet', name: 'Bullet Points', icon: 'list', content: '• \n• \n• ' },
  { id: 'todo', name: 'To-Do List', icon: 'checkbox', content: '[ ] \n[ ] \n[ ] ' },
  { id: 'class', name: 'Class Notes', icon: 'school', content: '# Topic\n## Subtopic\n- \n- \n' },
];

const TemplateSelector = ({ onSelectTemplate, onClose }) => {
  return (
    <View className="absolute inset-0 bg-black bg-opacity-50 justify-center items-center">
      <View className="bg-white dark:bg-gray-800 rounded-2xl p-4 w-4/5 max-h-[80%]">
        <Text className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Choose a Template</Text>
        <ScrollView>
          {templates.map((template) => (
            <TouchableOpacity
              key={template.id}
              onPress={() => onSelectTemplate(template)}
              className="flex-row items-center p-4 mb-2 bg-gray-100 dark:bg-gray-700 rounded-lg"
            >
              <Ionicons name={template.icon} size={24} color="#4a5568" className="mr-4" />
              <Text className="text-lg text-gray-800 dark:text-gray-200">{template.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <TouchableOpacity onPress={onClose} className="mt-4 items-center">
          <Text className="text-indigo-600 dark:text-indigo-400 text-lg font-semibold">Close</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default TemplateSelector;