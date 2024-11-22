import { View, TouchableOpacity, Text, ScrollView } from 'react-native';
import Animated, { 
  FadeIn, 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Bold, Italic, Underline, BookOpen, Palette } from 'lucide-react-native';

interface ToolbarProps {
  setShowReferenceModal: (show: boolean) => void;
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);


const Toolbar: React.FC<ToolbarProps> = ({
  setShowReferenceModal,
}) => {
  const toolbarScale = useSharedValue(1);
  const buttonScale = useSharedValue(1);

  const toolbarAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: withSpring(toolbarScale.value, { damping: 15, stiffness: 150 }) }],
    };
  });

  const buttonAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: withSpring(buttonScale.value, { damping: 15, stiffness: 150 }) }],
    };
  });

  
  const handleTextFormat = (
    format: 'bold' | 'italic' | 'underline' | 'highlight',
    value?: string
  ) => {
    // const currentText = state.note.content.get();
    // const { start, end } = state.selectedText.get();
    // Add your text formatting logic here
  };

  const handlePress = (format: 'bold' | 'italic' | 'underline') => {
    buttonScale.value = withTiming(0.9, { duration: 50, });
    setTimeout(() => {
      buttonScale.value = withTiming(1, { duration: 100, });
      handleTextFormat(format);
    }, 100);
  };

  return (
    <Animated.View 
      entering={FadeIn.duration(500)}
      style={[toolbarAnimatedStyle]}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-3"
    >
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ alignItems: 'center' }}
        className="space-x-2"
      >
        {[
          { format: 'bold', Icon: Bold },
          { format: 'italic', Icon: Italic },
          { format: 'underline', Icon: Underline },
        ].map(({ format, Icon }) => (
          <AnimatedTouchableOpacity
            key={format}
            onPress={() => handlePress(format as 'bold' | 'italic' | 'underline')}
            style={[buttonAnimatedStyle]}
            className="p-3 rounded-xl bg-gray-100 mr-1 dark:bg-gray-700"
          >
            <Icon size={24} color="gray" className="dark:text-gray-300" />
          </AnimatedTouchableOpacity>
        ))}

        <View className="h-8 w-px bg-gray-300 dark:bg-gray-600 mx-2" />

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ alignItems: 'center', flexDirection: "row" }}
          className="space-x-2"
        >
          <AnimatedTouchableOpacity
            style={[buttonAnimatedStyle]}
            className="p-3 rounded-xl bg-gray-100 dark:bg-gray-700"
          >
            <Palette size={24} color="#4B5563" className="dark:text-gray-300" />
          </AnimatedTouchableOpacity>
        </ScrollView>

        <View className="h-8 w-px bg-gray-300 dark:bg-gray-600 mx-2" />

        <AnimatedTouchableOpacity
          onPress={() => setShowReferenceModal(true)}
          style={[buttonAnimatedStyle]}
          className="flex-row items-center p-3 rounded-xl bg-blue-500"
        >
          <BookOpen size={20} color="white" />
          <Text className="ml-2 text-white font-semibold">Add Reference</Text>
        </AnimatedTouchableOpacity>
      </ScrollView>
    </Animated.View>
  );
};

export default Toolbar;