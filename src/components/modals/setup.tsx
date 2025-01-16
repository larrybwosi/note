import React from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import Animated, { 
  FadeIn, 
  FadeInDown, 
  BounceIn,
  useAnimatedStyle, 
  withSpring,
  useSharedValue
} from 'react-native-reanimated';
import { 
  ChevronRight, 
  Wallet, 
  TrendingUp, 
  PiggyBank,
  Target
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

const FeatureCard = ({ icon: Icon, title, description }:any) => (
  <Animated.View 
    entering={FadeInDown.delay(300).springify()}
    className="flex-row items-start p-4 bg-blue-50 rounded-xl mb-3"
  >
    <View className="bg-blue-100 p-2 rounded-lg">
      <Icon size={24} color="#3b82f6" />
    </View>
    <View className="ml-3 flex-1">
      <Text className="font-semibold text-gray-800 text-lg">{title}</Text>
      <Text className="text-gray-600 mt-1">{description}</Text>
    </View>
  </Animated.View>
);

const FinanceRedirectModal = ({ isVisible, onClose, onRedirect, username = "there" }:any) => {
  const scale = useSharedValue(1);
  
  const buttonStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  if (!isVisible) return null;

  return (
    <View className="justify-center items-center">
      <Animated.View 
        entering={BounceIn}
        className="bg-white m-2 p-2 rounded-2xl w-full max-w-md"
      >
        {/* Header */}
        <Animated.View entering={FadeIn.delay(200)}>
          <Text className="text-2xl font-bold text-gray-800 mb-2">
            Hey {username}! 👋
          </Text>
          <Text className="text-gray-600 text-lg mb-6">
            Complete your financial profile to unlock all features
          </Text>
        </Animated.View>

        {/* Features List */}
        <FeatureCard
          icon={Wallet}
          title="Track Expenses"
          description="Monitor your spending patterns and stay within budget"
        />
        
        <FeatureCard
          icon={TrendingUp}
          title="Investment Insights"
          description="Get personalized investment recommendations"
        />
        
        <FeatureCard
          icon={PiggyBank}
          title="Smart Savings"
          description="Set and achieve your savings goals effectively"
        />
        
        <FeatureCard
          icon={Target}
          title="Custom Goals"
          description="Create and track your financial milestones"
        />

        {/* Action Buttons */}
        <Animated.View entering={FadeInDown.delay(600)} className="mt-6">
          <TouchableOpacity
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={onRedirect}
          >
            <Animated.View 
              style={buttonStyle}
              className="bg-blue-500 p-4 rounded-xl flex-row items-center justify-center mb-3"
            >
              <Text className="text-white font-semibold text-lg mr-2">
                Complete Setup
              </Text>
              <ChevronRight color="white" size={20} />
            </Animated.View>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={onClose}
            className="p-4"
          >
            <Text className="text-gray-600 text-center font-medium">
              Maybe Later
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </View>
  );
};

export default FinanceRedirectModal;