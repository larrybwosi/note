import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { X } from 'lucide-react-native';

const templates = [
  { name: 'Cornell Notes', icon: 'format-list-bulleted', color: '#4F46E5' },
  { name: 'Mind Map', icon: 'bubble-chart', color: '#10B981' },
  { name: 'Lecture Notes', icon: 'school', color: '#F59E0B' },
  { name: 'Book Summary', icon: 'book', color: '#EF4444' },
  { name: 'Research Notes', icon: 'science', color: '#8B5CF6' },
  { name: 'To-Do List', icon: 'check-box', color: '#EC4899' },
  { name: 'Meeting Minutes', icon: 'group', color: '#3B82F6' },
  { name: 'Project Plan', icon: 'assignment', color: '#14B8A6' },
];

export const QuickTemplates: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const handleTemplatePress = (templateName: string) => {
    setSelectedTemplate(templateName);
    // Here you would typically navigate to a new screen or open the template
    // For this example, we'll just show a modal
  };

  return (
    <View className="bg-gray-50 p-4 rounded-xl shadow-md">
      <Text className="text-2xl font-rbold mb-4 text-gray-800">Quick Templates</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        className="mb-4"
      >
        {templates.map((template, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => handleTemplatePress(template.name)}
            className="mr-4 mb-2 rounded-xl "
          >
            <LinearGradient
              colors={[template.color, `${template.color}99`]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="p-4 items-center justify-center w-28 h-28 shadow-sm"
            >
              <MaterialIcons name={template.icon as any} size={32} color="white" />
              <Text className="text-white text-center mt-2 font-semibold">{template.name}</Text>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={!!selectedTemplate}
        onRequestClose={() => setSelectedTemplate(null)}
      >
        <View className="flex-1 justify-end">
          <View className="bg-white rounded-t-3xl p-6 shadow-lg">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-2xl font-bold text-gray-800">{selectedTemplate}</Text>
              <TouchableOpacity onPress={() => setSelectedTemplate(null)}>
                <X size={24} color="#4A5568" />
              </TouchableOpacity>
            </View>
            <Text className="text-gray-600 mb-4">
              This template helps you organize your notes effectively. Start by adding a title and then begin taking notes!
            </Text>
            <TouchableOpacity 
              className="bg-blue-500 py-3 px-4 rounded-lg items-center"
              onPress={() => {
                // Here you would typically start the selected template
                setSelectedTemplate(null);
              }}
            >
              <Text className="text-white font-semibold">Start Template</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};