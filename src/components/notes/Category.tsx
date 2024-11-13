import React, { useRef, useCallback, memo } from 'react';
import { ScrollView, Text, View, Dimensions, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, { 
  useAnimatedStyle, 
  withSpring,
  interpolateColor,
  useSharedValue,
  useAnimatedReaction
} from 'react-native-reanimated';

// Types moved to separate interface file for better organization
interface Category {
  id: string;
  name: string;
  icon: string;
  color?: string;
}

interface CategorySelectorProps {
  activeCategory: string;
  setActiveCategory: (id: string) => void;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

// Constants moved outside component to prevent recreating on each render
const WINDOW_WIDTH = Dimensions.get('window').width;
const ITEM_WIDTH = WINDOW_WIDTH * 0.35;
const SPRING_CONFIG = {
  damping: 15,
  stiffness: 150,
};

// Categories moved to constants to prevent recreation
const CATEGORIES: Category[] = [
  { id: '1', name: 'Class Notes', icon: 'school', color: '#4F46E5' },
  { id: '2', name: 'Meeting Notes', icon: 'business', color: '#0891B2' },
  { id: '3', name: 'Research', icon: 'science', color: '#059669' },
  { id: '4', name: 'Journal', icon: 'book', color: '#8B5CF6' },
  { id: '5', name: 'Project', icon: 'assignment', color: '#EA580C' }
];

// Memoized CategoryItem component to prevent unnecessary rerenders
const CategoryItem = memo(({ category, isActive, onPress }: any) => {
  const active = useSharedValue(isActive ? 1 : 0);

  useAnimatedReaction(
    () => isActive,
    (currentIsActive) => {
      active.value = withSpring(currentIsActive ? 1 : 0, SPRING_CONFIG);
    },
    [isActive]
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ 
      scale: active.value ? 1 : 0.95
    }],
    backgroundColor: interpolateColor(
      active.value,
      [0, 1],
      ['#F3F4F6', category.color || '#3B82F6']
    ),
    shadowColor: category.color || '#3B82F6',
    shadowOpacity: active.value * 0.2,
    shadowRadius: 8,
    elevation: active.value * 4,
    borderWidth: 1.5,
    borderColor: active.value ? 'transparent' : '#E5E7EB',
  }), [category.color]);

  return (
    <AnimatedTouchable
      onPress={onPress}
      className="mr-3 py-3 px-4 rounded-2xl flex-row items-center"
      style={[{shadowOffset: { width: 0, height: 4 }},animatedStyle]}
    >
      <MaterialIcons
        name={category.icon as any}
        size={20}
        color={isActive ? 'white' : category.color || '#6B7280'}
        style={{ marginRight: 8 }}
      />
      <Text
        className={`text-[15px] ${
          isActive 
            ? 'font-aregular text-white' 
            : 'font-amedium text-gray-700'
        }`}
      >
        {category.name}
      </Text>
    </AnimatedTouchable>
  );
});

CategoryItem.displayName = 'CategoryItem';

export const CategorySelector = memo(({ 
  activeCategory, 
  setActiveCategory 
}: CategorySelectorProps) => {
  const scrollViewRef = useRef<ScrollView>(null);

  // Memoized scroll handler to prevent recreating on each render
  const scrollToCategory = useCallback((index: number) => {
    scrollViewRef.current?.scrollTo({
      x: index * ITEM_WIDTH,
      animated: true,
    });
  }, []);

  // Memoized category selection handler
  const handleCategorySelect = useCallback((id: string, index: number) => {
    setActiveCategory(id);
    scrollToCategory(index);
  }, [setActiveCategory, scrollToCategory]);

  return (
    <View className="mb-4">
      <Text className="text-base font-amedium mx-4 mb-3 text-gray-800">
        Select Category
      </Text>

      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        className="px-4 py-1"
        decelerationRate="fast"
        snapToAlignment="center"
        snapToInterval={ITEM_WIDTH}
        contentContainerStyle={{ paddingEnd: 16 }}
      >
        {CATEGORIES.map((category, index) => (
          <CategoryItem
            key={category.id}
            category={category}
            isActive={activeCategory === category.id}
            onPress={() => handleCategorySelect(category.id, index)}
          />
        ))}
      </ScrollView>
    </View>
  );
});

CategorySelector.displayName = 'CategorySelector';

export default CategorySelector;