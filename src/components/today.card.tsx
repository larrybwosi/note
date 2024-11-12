import { useEffect } from 'react';
import { currentTime } from '@legendapp/state/helpers/time';
import { View, Text, useColorScheme } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { observer } from '@legendapp/state/react';
import { Feather } from '@expo/vector-icons';
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withRepeat,
} from 'react-native-reanimated';

const TodayCard = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(withSpring(1.1, { damping: 10 }), withSpring(1, { damping: 10 })),
      -1,
      true
    );

    opacity.value = withRepeat(
      withSequence(withSpring(0.8), withSpring(1)),
      -1,
      true
    );
  }, []);

  const circleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const theme = {
    gradient: isDarkMode ? ['#3B82F6', '#8B5CF6'] : ['#60A5FA', '#A78BFA'],
  };

  return (
    <Animated.View
      entering={FadeIn.duration(1000)}
      className={`mx-4 my-2 p-6 rounded-3xl shadow-lg overflow-hidden ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}
    >
      {/* Decorative animated circles */}
      <Animated.View
        style={[
          { position: 'absolute', top: -50, right: -50, width: 150, height: 150, borderRadius: 75 },
          circleStyle,
        ]}
      >
        <LinearGradient
          colors={theme.gradient}
          style={{ width: '100%', height: '100%', borderRadius: 75, opacity: 0.1 }}
        />
      </Animated.View>
      <Animated.View
        className="absolute -bottom-[30px] -left-[30px] w-[100px] h-[100px]"
        style={circleStyle}
      >
        <LinearGradient
          colors={[...theme.gradient].reverse()}
          style={{ width: '100%', height: '100%', borderRadius: 75, opacity: 0.1 }}
        />
      </Animated.View>

      {/* Time Section */}
      <Animated.View
        entering={FadeInDown.duration(800).delay(200)}
        className="flex-row items-center mb-6"
      >
        <Feather name="clock" size={24} color={theme.gradient[0]} />
        <View className="flex-row items-baseline ml-3">
          <Text
            className={`text-3xl font-rbold tracking-tight ${
              isDarkMode ? 'text-white' : 'text-gray-800'
            }`}
          >
            {currentTime
              .get()
              .toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
          </Text>
          <Text
            className={`text-base ml-1 font-medium ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}
          >
            {currentTime.get().getHours() < 12 ? 'AM' : 'PM'}
          </Text>
        </View>
      </Animated.View>

      {/* Content Section */}
      <Animated.View entering={FadeInDown.duration(800).delay(400)} className="space-y-2">
        <View className="flex-row items-center space-x-3">
          <Feather name="target" size={24} color={theme.gradient[1]} />
          <Text className={`text-2xl font-rmedium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            Today's Focus
          </Text>
        </View>
        <Text
          className={`text-base font-rregular ml-9 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}
        >
          Track your goals and achievements
        </Text>
      </Animated.View>

      {/* Bottom Gradient Bar */}
      <Animated.View
        entering={FadeInDown.duration(800).delay(600)}
        className="mt-6 h-2 overflow-hidden rounded-full"
      >
        <LinearGradient
          colors={theme.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className="w-full h-full"
        />
      </Animated.View>
    </Animated.View>
  );
};

export default observer(TodayCard);