import { TouchableOpacity, Text } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';

interface AnimatedButtonProps {
  onPress: () => void;
  isSelected: boolean;
  label: string;
  activeClassName: string;
  inactiveClassName: string;
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  onPress,
  isSelected,
  label,
  activeClassName,
  inactiveClassName,
}) => {
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: withTiming(isSelected ? 1.05 : 1) }],
    };
  });

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        onPress={onPress}
        className={`p-3 rounded-xl ${isSelected ? activeClassName : inactiveClassName}`}
      >
        <Text
          className={`text-center font-amedium ${
            isSelected ? 'text-white' : 'text-gray-700 dark:text-gray-300'
          }`}
        >
          {label}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

