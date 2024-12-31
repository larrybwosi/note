import { useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { observer, useComputed } from '@legendapp/state/react';
import { currentTime } from '@legendapp/state/helpers/time';
import { batch } from '@legendapp/state';
import { router } from 'expo-router';
import { homeState } from './data';


export const WaterReminderSection = observer(() => {
  const pulseAnim = useSharedValue(1);

  const waterReminderStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnim.value }],
  }));

  const getTimeUntilNextWater = useComputed(() => {
    const diff = homeState.nextWaterTime.get().getTime() - currentTime.get().getTime();
    const minutes = Math.floor(diff / 60000);
    return minutes > 0 ? `${minutes} min` : 'Now';
  });

  useEffect(() => {
    pulseAnim.value = withRepeat(
      withSequence(withTiming(1.1, { duration: 2000 }), withTiming(1, { duration: 2000 })),
      -1,
      true
    );
  }, []);

  
  const handleWaterLog = useCallback(() => {
    batch(() => {
      homeState.nextWaterTime.set(new Date(Date.now() + 2 * 60 * 60 * 1000));
      homeState.achievements.waterStreak.set(homeState.achievements.waterStreak.get() + 1);
    });
  }, []);

  return (
    <Animated.View style={waterReminderStyle} className="mx-6 mt-6">
      <TouchableOpacity className="bg-blue-500/10 p-4 rounded-2xl border border-blue-500/20">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Text className="text-2xl mr-2">💧</Text>
            <View>
              <Text className="text-blue-500 font-rbold">Water Reminder</Text>
              <Text className="text-gray-500 dark:text-gray-400 font-aregular">
                Next in: {getTimeUntilNextWater.get()}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            className="bg-blue-500 px-4 py-2 rounded-xl"
            onPress={()=>router.push('/schedule')}
          >
            <Text className="text-white font-rmedium">Log</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
});