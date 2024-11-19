import { useEffect, useRef } from 'react';
import { observer, useComputed, Memo, Show } from '@legendapp/state/react';
import { View, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { observable } from '@legendapp/state';
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Clock, Target, Cloud, CloudRain, CloudSnow, CloudLightning, Sun } from 'lucide-react-native';
import { ObservablePersistMMKV } from '@legendapp/state/persist-plugins/mmkv';
import { currentTime } from '@legendapp/state/helpers/time';
import { syncObservable } from '@legendapp/state/sync';
import * as Location from 'expo-location';

const initialWeather ={"coord":{"lon":-122.4194,"lat":37.7749},"weather":[{"id":803,"main":"Clouds","description":"broken clouds","icon":"04d"}],"base":"stations","main":{"temp":12.99,"feels_like":12.72,"temp_min":11.38,"temp_max":14.35,"pressure":1019,"humidity":91,"sea_level":1019,"grnd_level":1015},"visibility":10000,"wind":{"speed":2.57,"deg":130},"clouds":{"all":75},"dt":1731604146,"sys":{"type":2,"id":2003880,"country":"US","sunrise":1731595776,"sunset":1731632344},"timezone":-28800,"id":5391959,"name":"San Francisco","cod":200}

interface WeatherData {
  main: {
    temp: number;
  };
  weather: {
    main: string;
    description: string;
  }[];
  name: string;
}


const THEME = observable({
  light: {
    gradient: ['#60A5FA', '#A78BFA'],
    weatherGradient: ['#818CF8', '#60A5FA'],
  },
  dark: {
    gradient: ['#3B82F6', '#8B5CF6'],
    weatherGradient: ['#4C1D95', '#1E40AF'],
  },
});

const ANIMATION_CONFIG = {
  spring: { damping: 12, stiffness: 100 },
  timing: { duration: 8000, easing: Easing.linear },
};

const state$ = observable({
  weatherData: initialWeather as WeatherData | null,
  theme: 'light' as 'light' | 'dark',
});

syncObservable(state$, {
  persist:{
    name: 'weather-state',
    plugin: ObservablePersistMMKV,
  }
});

const useAnimations = () => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const cardElevation = useSharedValue(1);
  const weatherIconRotation = useSharedValue(0);
  const weatherScale = useSharedValue(1);

  useEffect(() => {
    initializeAnimations();
  }, []);

  const initializeAnimations = () => {
    scale.value = withRepeat(
      withSequence(
        withSpring(1.1, ANIMATION_CONFIG.spring),
        withSpring(1, ANIMATION_CONFIG.spring)
      ),
      -1,
      true
    );

    opacity.value = withRepeat(
      withSequence(
        withSpring(0.85, ANIMATION_CONFIG.spring),
        withSpring(1, ANIMATION_CONFIG.spring)
      ),
      -1,
      true
    );

    weatherIconRotation.value = withRepeat(
      withTiming(360, ANIMATION_CONFIG.timing),
      -1,
      true
    );
  };

  return {
    scale,
    opacity,
    cardElevation,
    weatherIconRotation,
    weatherScale,
  };
};

// Weather API
const getWeatherData = async () => {
  try {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.warn('Permission to access location was denied');
      return;
    }

    let location = await Location.getCurrentPositionAsync({});
    if (!location.coords) {
      const res = await Location.getLastKnownPositionAsync({});
      if(res) location = res
    }
    const response = await fetch(`http://192.168.42.236:3000/weather?lat=${location.coords.latitude}&lon=${location.coords.longitude}`);

    const data = await response.json();
    state$.weatherData.set(data);
  } catch (error) {
    console.error('Weather fetch error:', error);
  }
};


const WeatherIcon = observer(({ weatherData }: { weatherData: WeatherData }) => {
  const currentTheme = useComputed(() => THEME[state$.theme.get()]);

  if (!weatherData.weather[0].main) return <Sun />;
  const code = weatherData.weather[0].main.toLowerCase();

  if (code.includes('rain')) return <CloudRain size={32} color={currentTheme.weatherGradient[0].get()} />;
  if (code.includes('cloud')) return <Cloud size={32} color={currentTheme.weatherGradient[0].get()} />;
  if (code.includes('snow')) return <CloudSnow size={32} color={currentTheme.weatherGradient[0].get()} />;
  if (code.includes('thunder')) return <CloudLightning size={32} color={currentTheme.weatherGradient[0].get()} />;
  return <Sun />;
});


const TodayCard = observer(() => {
  const animations = useAnimations();
  const currentTheme = useComputed(() => THEME[state$.theme.get()]);

  // const renders = ++useRef(0).current
  // console.log(`TodayCard: ${renders}`)

  useEffect(() => {
    // void getWeatherData();
  }, []);

  const circleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: animations.scale.value }],
    opacity: animations.opacity.value,
  }));

  const weatherIconStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${animations.weatherIconRotation.value}deg` },
      { scale: animations.weatherScale.value },
    ],
  }));

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: animations.cardElevation.value }],
  }));

  const handlePressIn = () => {
    animations.cardElevation.value = withSpring(0.98, ANIMATION_CONFIG.spring);
  };

  const handlePressOut = () => {
    animations.cardElevation.value = withSpring(1, ANIMATION_CONFIG.spring);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      className="px-2 py-2"
    >
      <Animated.View
        entering={FadeIn.duration(1000)}
        style={[cardStyle]}
        className="p-6 rounded-3xl shadow-lg overflow-hidden bg-white dark:bg-gray-800"
      >
        {/* Decorative circles */}
        <Animated.View
          style={[
            {
              position: 'absolute',
              top: -50,
              right: -50,
              width: 150,
              height: 150,
              borderRadius: 80,
            },
            circleStyle,
          ]}
        >
          <LinearGradient
            colors={currentTheme.gradient.get()}
            style={{ borderRadius: 80 }}
            className="w-full h-full opacity-15 dark:opacity-20"
          />
        </Animated.View>

        <Animated.View
          style={[circleStyle]}
          className="absolute -bottom-[30px] -left-[30px] w-[100px] h-[100px]"
        >
          <LinearGradient
            colors={[...currentTheme.gradient.get()].reverse()}
            style={{ borderRadius: 80 }}
            className="w-full h-full opacity-15 dark:opacity-20"
          />
        </Animated.View>

        {/* Greeting */}
        <Memo>
          {() => (
            <Animated.View
              entering={FadeInDown.duration(800)}
              className="mb-4"
            >
              <Text className="text-xl font-amedium text-gray-600 dark:text-gray-300">
                {state$.weatherData.get()?.name}
              </Text>
            </Animated.View>
          )}
        </Memo>

        {/* Time */}
        <Memo>
          {() => (
            <Animated.View
              entering={FadeInDown.duration(800).delay(200)}
              className="flex-row items-center mb-6"
            >
              <Clock className="w-5" color={currentTheme.gradient[0].get()} />
              <View className="flex-row items-baseline ml-3">
                <Text className="text-3xl font-rbold tracking-tight text-gray-800 dark:text-white">
                  {currentTime
                    .get()
                    .toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                </Text>
                <Text className="text-base ml-1 font-medium text-gray-500 dark:text-gray-400">
                  {currentTime.get().getHours() < 12 ? 'AM' : 'PM'}
                </Text>
              </View>
            </Animated.View>
          )}
        </Memo>

        {/* Weather */}
        <Show
          if={state$.weatherData}
          else={<Text className='font-aregular'>Loading weather data...</Text>}
        >
          {(weatherData) => (
            <Animated.View
              entering={FadeInDown.duration(800).delay(300)}
              className="mb-6 p-4 rounded-2xl overflow-hidden bg-gray-50 dark:bg-gray-700"
            >
              <LinearGradient
                colors={currentTheme.weatherGradient.get()}
                className="absolute inset-0 opacity-15"
              />
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-lg font-rmedium text-gray-700 dark:text-gray-200">
                    {Math.round(weatherData?.main?.temp|| 0)}°C
                  </Text>
                  <Text className="text-sm font-rregular text-gray-500 dark:text-gray-400">
                    {weatherData?.weather[0]?.description}
                  </Text>
                </View>
                <Animated.View style={weatherIconStyle}>
                  <WeatherIcon weatherData={weatherData!} />
                </Animated.View>
              </View>
            </Animated.View>
          )}
        </Show>

        {/* Focus section */}
        <Animated.View
          entering={FadeInDown.duration(800).delay(400)}
          className="space-y-2"
        >
          <View className="flex-row items-center space-x-3">
            <Target color={currentTheme.gradient[1].get()} />
            <Text className="text-2xl font-amedium text-gray-800 dark:text-white">
              Today's Focus
            </Text>
          </View>
          <Text className="text-base font-aregular ml-9 text-gray-500 dark:text-gray-400">
            Track your goals and achievements
          </Text>
        </Animated.View>

        {/* Progress bar */}
        <Animated.View
          entering={FadeInDown.duration(800).delay(600)}
          className="mt-6 h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700"
        >
          <LinearGradient
            colors={currentTheme.gradient.get()}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ borderRadius: 100 }}
            className="w-full h-full"
          />
        </Animated.View>
      </Animated.View>
    </TouchableOpacity>
  );
});

export default TodayCard;