import { View, Text, TouchableOpacity } from 'react-native';
import { cn } from 'src/lib/utils/cn';

interface TabProps {
  tabs: string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Tab: React.FC<TabProps> = ({ tabs, activeTab, onTabChange }) => {
  return (
    <View className="flex-row bg-gray-100 dark:bg-gray-800 rounded-full p-1">
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab}
          onPress={() => onTabChange(tab)}
          className={cn(
            'flex-1 py-2 px-4 rounded-full',
            activeTab === tab ? 'bg-white dark:bg-gray-700 shadow-sm' : 'bg-transparent'
          )}
        >
          <Text
            className={cn(
              'text-center font-medium',
              activeTab === tab
                ? 'text-gray-900 dark:text-white'
                : 'text-gray-500 dark:text-gray-400'
            )}
          >
            {tab}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};
