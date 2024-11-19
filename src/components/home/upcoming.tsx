import { View, Text } from 'react-native';
import TasksList from 'src/components/schedule.item';
import { scheduleStore } from 'src/store/shedule/store';


export const UpcomingTasksSection = () => {
  const items = scheduleStore.items.get();

  return (
    <View className="px-2 mt-8">
      <Text
        className={`text-3xl font-rbold mb-2 dark:text-white text-gray-800 px-2`}
      >
        Upcoming Tasks & Events
      </Text>
      <Text className={`dark:text-gray-400 text-gray-500 text-lg mb-6 px-2`}>
        Your next steps
      </Text>
      <TasksList items={items} />
    </View>
  );
};

UpcomingTasksSection.displayName = 'UpcomingTasksSection'