import React from 'react';
import { View, Text, FlatList } from 'react-native';
import { ItemCard } from 'src/components/schedule.item';
import { ScheduleItem } from 'src/storage/schedule';


interface UpcomingTasksSectionProps {
  items: ScheduleItem[];
  isDark: boolean;
}


export const UpcomingTasksSection = React.memo(({ items, isDark }: UpcomingTasksSectionProps) => {

  
const RenderScheduleItem = React.memo(({ item }: { item: ScheduleItem }) => (
  <ItemCard
    key={item.id}
    item={item}
    onComplete={() => {}}
    handlePostpone={() => {}}
    theme={isDark ? 'dark' : 'light'}
  />
));
  return (
    <View className="px-4 mt-8">
      <Text
        className={`text-3xl font-rbold mb-2 ${isDark ? 'dark:text-white' : 'text-gray-800'} px-2`}
      >
        Upcoming Tasks & Events
      </Text>
      <Text className={`${isDark ? 'dark:text-gray-400' : 'text-gray-500'} text-lg mb-6 px-2`}>
        Your next steps
      </Text>
      <FlatList
        data={items}
        renderItem={({ item }) => <RenderScheduleItem item={item} />}
        keyExtractor={(item) => item.id.toString()}
      />
    </View>
  );
});