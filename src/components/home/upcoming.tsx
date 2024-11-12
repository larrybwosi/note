import { memo } from 'react';
import { View, Text } from 'react-native';
import { ItemCard } from 'src/components/schedule.item';
import { ScheduleItem } from 'src/store/shedule/types';

interface UpcomingTasksSectionProps {
  items: ScheduleItem[];
  isDark: boolean;
}

export const UpcomingTasksSection = memo(({ items, isDark }: UpcomingTasksSectionProps) => {

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
      {items.map((item)=>(
        <ItemCard
          key={item.id}
          item={item}
          onComplete={() => {}}
          handlePostpone={() => {}}
          theme={isDark ? 'dark' : 'light'}
        />
      ))}
    </View>
  );
});
