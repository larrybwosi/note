import { useEffect } from 'react';
import { router } from 'expo-router';
import { View, Text, TouchableOpacity, SafeAreaView, StatusBar, StyleSheet } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withDelay, 
  withSequence,
  withTiming,
  Easing
} from 'react-native-reanimated';

const SplashScreen = () => {
  // Shared values for animations
  const logoScale = useSharedValue(0);
  const logoOffset = useSharedValue(0);
  const contentOpacity = useSharedValue(0);
  const contentTranslateY = useSharedValue(30);

  // Logo animation styles
  const logoSquareStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
  }));

  const logoSquareOffsetStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: logoOffset.value }, { translateY: logoOffset.value }],
  }));

  // Content animation styles
  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentTranslateY.value }],
  }));

  // Trigger animations on mount
  useEffect(() => {
    // Animate logo squares
    logoScale.value = withSequence(
      withTiming(1, { duration: 500, easing: Easing.ease }),
      withSpring(1.2, { damping: 2, stiffness: 100 }),
      withSpring(1, { damping: 2, stiffness: 100 })
    );

    logoOffset.value = withDelay(500, withSpring(8, { damping: 2, stiffness: 100 }));

    // Animate content
    contentOpacity.value = withDelay(800, withTiming(1, { duration: 500 }));
    contentTranslateY.value = withDelay(800, withTiming(0, { duration: 500, easing: Easing.ease }));
  }, []);

  return (
    <SafeAreaView className='bg-[#a6f36a] flex-1 px-2.5'>
      <StatusBar barStyle="dark-content" />
      
      {/* App Logo */}
      <View style={styles.logoContainer}>
        <Animated.View style={[styles.logoSquare, logoSquareStyle]} />
        <Animated.View style={[styles.logoSquare, styles.logoSquareOffset, logoSquareOffsetStyle]} />
      </View>
      <View className='flex-1'/>
      
      {/* Main Content */}
      <Animated.View style={[styles.contentContainer, contentStyle]}>
        <Text className='text-5xl font-rbold text-gray-800'>Track Your Spending{'\n'}Effortlessly</Text>
        
        <Text className='text-md font-rregular text-gray-800 opacity-80 mb-4'>
          Manage your finances easily using our intuitive and user-friendly interface and set financial goals and monitor your progress
        </Text>
        
        {/* Button */}
        <TouchableOpacity onPress={() => router.navigate('signup')} className='bg-[#154715] py-6 px-6 rounded-2xl mb-4'>
          <Text className='text-white font-rbold'>Get Started</Text>
        </TouchableOpacity>
        
        {/* Login Text */}
        <View className='flex-row items-center mt-3'>
          <Text className='text-md font-rregular text-gray-800'>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.navigate('login')}>
            <Text className='text-md font-rbold text-gray-800'>Login</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  logoContainer: {
    marginTop: 30,
    flexDirection: 'row',
    position: 'relative',
  },
  logoSquare: {
    width: 16,
    height: 16,
    backgroundColor: '#154715',
    borderRadius: 2,
  },
  logoSquareOffset: {
    position: 'absolute',
    left: 8,
    top: 8,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 60,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
  },
});

export default SplashScreen;