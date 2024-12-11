import { View, Text } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

interface FormSectionProps {
  title: string;
  children: React.ReactNode;
}

export const FormSection: React.FC<FormSectionProps> = ({ title, children }) => {
  return (
    <Animated.View entering={FadeIn} className="my-4">
      <Text className="text-sm font-abold text-gray-700 dark:text-gray-300 mb-2">
        {title}
      </Text>
      {children}
    </Animated.View>
  );
};

