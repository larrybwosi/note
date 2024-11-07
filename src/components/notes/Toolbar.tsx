import React from 'react';
import { View, TouchableOpacity, Text, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, { FadeIn, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

interface ToolbarProps {
  handleTextFormat: (format: 'bold' | 'italic' | 'underline' | 'highlight', value?: string) => void;
  highlightColors: string[];
  setShowReferenceModal: (show: boolean) => void;
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export const Toolbar: React.FC<ToolbarProps> = ({
  handleTextFormat,
  highlightColors,
  setShowReferenceModal,
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: withSpring(scale.value) }],
    };
  });

  const handlePress = (format: 'bold' | 'italic' | 'underline', icon: string) => {
    scale.value = 0.9;
    setTimeout(() => {
      scale.value = 1;
      handleTextFormat(format);
    }, 100);
  };

  return (
    <Animated.View 
      entering={FadeIn.duration(500)}
      className="bg-white rounded-2xl shadow-lg p-2"
    >
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ alignItems: 'center' }}
      >
        {[
          { format: 'bold', icon: 'format-bold' },
          { format: 'italic', icon: 'format-italic' },
          { format: 'underline', icon: 'format-underlined' },
        ].map(({ format, icon }) => (
          <AnimatedTouchableOpacity
            key={format}
            onPress={() => handlePress(format as 'bold' | 'italic' | 'underline', icon)}
            style={animatedStyle}
            className="p-3 mx-1 rounded-xl bg-gray-100"
          >
            <MaterialIcons name={icon} size={24} color="#4B5563" />
          </AnimatedTouchableOpacity>
        ))}

        <View className="h-6 w-px bg-gray-300 mx-2" />

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          className="flex-row items-center"
        >
          {highlightColors.map((color, index) => (
            <TouchableOpacity
              key={color}
              onPress={() => handleTextFormat('highlight', color)}
              className="w-8 h-8 rounded-full mx-1 border-2 border-white shadow-sm"
              style={{ backgroundColor: color }}
            />
          ))}
        </ScrollView>

        <View className="h-6 w-px bg-gray-300 mx-2" />

        <TouchableOpacity
          onPress={() => setShowReferenceModal(true)}
          className="flex-row items-center p-2 mx-1 rounded-xl bg-blue-500"
        >
          <MaterialIcons name="library-books" size={20} color="white" />
          <Text className="ml-2 text-white font-semibold">Add Reference</Text>
        </TouchableOpacity>
      </ScrollView>
    </Animated.View>
  );
};