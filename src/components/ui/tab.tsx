import { View, Text, TouchableOpacity } from 'react-native';

interface TabProps {
  tabs: string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Tab: React.FC<TabProps> = ({ tabs, activeTab, onTabChange }) => {
  const buttonStyle = (tab:any) =>{
    return activeTab === tab ? 'bg-white dark:bg-gray-700 shadow-sm' : 'bg-transparent';
  }
  const textStyle = (tab:any) =>{
    return activeTab === tab ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400';
  }
  return (
    <View className="flex-row bg-gray-100 dark:bg-gray-800 rounded-full p-1">
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab}
          onPress={() => onTabChange(tab)}
          style={{backgroundColor:activeTab === tab ?'white':'transparent', shadowOpacity:70}}
          className={'flex-1 py-2 px-4 rounded-full'}
        >
          <Text className={'text-center font-medium'} style={{}}>{tab}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};
