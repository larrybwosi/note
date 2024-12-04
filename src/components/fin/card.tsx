import { View, Text } from 'react-native';
import { LucideIcon } from 'lucide-react-native';

interface CardProps {
  title: string;
  icon?: LucideIcon;
  description?: string;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ title, icon: Icon, description, children }) => {
  return (
    <View className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-6">
      <View className="flex-row items-center mb-2">
        {Icon && <Icon size={24} color="#4B5563" className="mr-2" />}
        <Text className="text-lg font-rmedium text-gray-900 dark:text-white">{title}</Text>
      </View>
      {description && (
        <Text className="text-sm font-rregular text-gray-500 dark:text-gray-400 mb-2">{description}</Text>
      )}
      {children}
    </View>
  );
};

