import  { useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useObservable, useComputed, observer } from '@legendapp/state/react';
import { Feather } from '@expo/vector-icons';
import GetLocation from 'react-native-get-location';
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
import { currentTime } from '@legendapp/state/helpers/time';
import { observable } from '@legendapp/state';
import * as Location from 'expo-location';

// Types
interface WeatherData {
  main: {
    temp: number;
  };
  weather: Array<{
    main: string;
    description: string;
  }>;
  name: string;
}

interface Theme {
  gradient: [string, string];
  weatherGradient: [string, string];
}

// Constants
const WEATHER_API_KEY = '9139cfb8cae02e26e356b5d27fff4b48';

const THEME: {
  light: Theme;
  dark: Theme;
} = {
  light: {
    gradient: ['#60A5FA', '#A78BFA'],
    weatherGradient: ['#818CF8', '#60A5FA'],
  },
  dark: {
    gradient: ['#3B82F6', '#8B5CF6'],
    weatherGradient: ['#4C1D95', '#1E40AF'],
  },
};

const ANIMATION_CONFIG = {
  spring: { damping: 12, stiffness: 100 },
  timing: { duration: 8000, easing: Easing.linear },
};

// Create a reactive state
const state = observable({
  weather: null as WeatherData | null,
  theme: 'light' as 'light' | 'dark',
});

const TodayCard = observer(() => {
  // const weather = useObservable(state.weather);
  const theme = useObservable(state.theme);

  const weather ={"base": "stations", "clouds": {"all": 20}, "cod": 200, "coord": {"lat": 37.7749, "lon": -122.4194}, "dt": 1731403589, "id": 5391959, "main": {"feels_like": 10.44, "grnd_level": 1017, "humidity": 89, "pressure": 1021, "sea_level": 1021, "temp": 10.96, "temp_max": 12.12, "temp_min": 8.71}, "name": "San Francisco", "sys": {"country": "US", "id": 2003880, "sunrise": 1731422846, "sunset": 1731459634, "type": 2}, "timezone": -28800, "visibility": 10000, "weather": [{"description": "few clouds", "icon": "02n", "id": 801, "main": "Clouds"}], "wind": {"deg": 0, "gust": 4.92, "speed": 2.68}}
  

  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const cardElevation = useSharedValue(1);
  const weatherIconRotation = useSharedValue(0);
  const weatherScale = useSharedValue(1);

  useEffect(() => {
    initializeAnimations();
    void getWeatherData();
  }, []);

  // Animation initializers
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

  const getWeatherData = async () => {
    try {
       
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      console.log(location.coords.latitude, location.coords.longitude);

      // const location = {
      //   latitude: 37.7749,
      //   longitude: -122.4194,
      // };
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${location.coords.latitude}&lon=${location.coords.longitude}&units=metric&appid=${WEATHER_API_KEY}`
      );
      
      const data = await response.json();
      state.weather.set(data);
    } catch (error) {
      console.error('Weather fetch error:', error);
    }
  };

  const getWeatherIcon = (condition?: string): string => {
    if (!condition) return 'sun';
    const code = condition.toLowerCase();
    
    if (code.includes('rain')) return 'cloud-rain';
    if (code.includes('cloud')) return 'cloud';
    if (code.includes('snow')) return 'cloud-snow';
    if (code.includes('thunder')) return 'cloud-lightning';
    return 'sun';
  };

  // Animated styles
  const circleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const weatherIconStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${weatherIconRotation.value}deg` },
      { scale: weatherScale.value },
    ],
  }));

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardElevation.value }],
  }));

  // Event handlers
  const handlePressIn = () => {
    cardElevation.value = withSpring(0.98, ANIMATION_CONFIG.spring);
  };

  const handlePressOut = () => {
    cardElevation.value = withSpring(1, ANIMATION_CONFIG.spring);
  };

  const currentTheme = useComputed(() => THEME[theme.get()]);

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      className="px-4 py-2"
    >
      <Animated.View
        entering={FadeIn.duration(1000)}
        style={[cardStyle]}
        className="p-6 rounded-3xl shadow-lg overflow-hidden bg-white dark:bg-gray-800"
      >
        {/* Decorative circles */}
        <Animated.View
          style={[{position:'absolute',top:-50 ,right:-50, width:150 ,height:150 ,borderRadius:80 ,}, circleStyle, ]}
        >
          <LinearGradient
            colors={currentTheme.get().gradient}
            style={{borderRadius:80}}
            className="w-full h-full opacity-15 dark:opacity-20"
          />
        </Animated.View>
        
        <Animated.View
          style={[circleStyle]}
          className="absolute -bottom-[30px] -left-[30px] w-[100px] h-[100px]"
        >
          <LinearGradient
            colors={[...currentTheme.get().gradient].reverse()}
            style={{borderRadius:80}}
            className="w-full h-full opacity-15 dark:opacity-20"
          />
        </Animated.View>

        {/* Greeting */}
        <Animated.View
          entering={FadeInDown.duration(800)}
          className="mb-4"
        >
          <Text className="text-xl font-amedium text-gray-600 dark:text-gray-300">
            {weather?.name}
          </Text>
        </Animated.View>

        {/* Time */}
        <Animated.View
          entering={FadeInDown.duration(800).delay(200)}
          className="flex-row items-center mb-6"
        >
          <Feather name="clock" size={24} color={currentTheme.get().gradient[0]} />
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

        {/* Weather */}
        {weather && (
          <Animated.View
            entering={FadeInDown.duration(800).delay(300)}
            className="mb-6 p-4 rounded-2xl overflow-hidden bg-gray-50 dark:bg-gray-700"
          >
            <LinearGradient
              colors={currentTheme.get().weatherGradient}
              className="absolute inset-0 opacity-15"
            />
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-lg font-rmedium text-gray-700 dark:text-gray-200">
                  {Math.round(weather!.main.temp)}°C
                </Text>
                <Text className="text-sm font-rregular text-gray-500 dark:text-gray-400">
                  {weather!.weather[0].description}
                </Text>
              </View>
              <Animated.View style={weatherIconStyle}>
                <Feather
                  name={getWeatherIcon(weather!.weather[0].main) as any}
                  size={32}
                  color={currentTheme.get().weatherGradient[0]}
                />
              </Animated.View>
            </View>
          </Animated.View>
        )}

        {/* Focus section */}
        <Animated.View 
          entering={FadeInDown.duration(800).delay(400)} 
          className="space-y-2"
        >
          <View className="flex-row items-center space-x-3">
            <Feather name="target" size={24} color={currentTheme.get().gradient[1]} />
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
            colors={currentTheme.get().gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{borderRadius:100}}
            className="w-full h-full"
          />
        </Animated.View>
      </Animated.View>
    </TouchableOpacity>
  );
});

export default TodayCard;