import { useRef } from 'react';
import { ScrollView, Text, View, Dimensions, TouchableOpacity } from 'react-native';
import Animated, { 
  useAnimatedReaction,
  useAnimatedStyle, 
  withSpring,
  interpolateColor,
  useSharedValue,
} from 'react-native-reanimated';
import { Category } from 'src/store/notes/types';
import { categories } from 'src/store/notes/data';


interface CategorySelectorProps {
  activeCategory: Category;
  setActiveCategory: (id: Category) => void;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);


const WINDOW_WIDTH = Dimensions.get('window').width;
const ITEM_WIDTH = WINDOW_WIDTH * 0.35;
const SPRING_CONFIG = {
  damping: 15,
  stiffness: 150,
};

const CategoryItem = ({ category, isActive, onPress }: any) => {
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

  const Icon = category.icon
  return (
    <AnimatedTouchable
      onPress={onPress}
      className="mr-3 py-3 px-4 rounded-2xl flex-row items-center"
      style={[{shadowOffset: { width: 0, height: 4 }},animatedStyle]}
    >
      <Icon
        size={18}
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
};


const CategorySelector = ({ 
  activeCategory, 
  setActiveCategory 
}: CategorySelectorProps) => {
  const scrollViewRef = useRef<ScrollView>(null);

  const scrollToCategory = (index: number) => {
    scrollViewRef.current?.scrollTo({
      x: index * ITEM_WIDTH,
      animated: true,
    });
  };

  
  const handleCategorySelect = (id: Category, index: number) => {
    setActiveCategory(id);
    scrollToCategory(index);
  };

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
        {categories.map((category, index) => (
          <CategoryItem
            key={category.id}
            category={category}
            isActive={activeCategory === category}
            onPress={() => handleCategorySelect(category, index)}
          />
        ))}
      </ScrollView>
    </View>
  );
};

CategoryItem.displayName = 'CategoryItem';
CategorySelector.displayName = 'CategorySelector';
export default CategorySelector;