import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Dimensions, StatusBar, useColorScheme } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  FadeIn,
  FadeOut,
  SlideInRight,
  SlideInUp,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { 
  Sparkles, 
  Send, 
  Lightbulb, 
  ArrowRight, 
  DollarSign, 
  Calendar, 
  Repeat,
  TrendingUp,
  CheckCircle,
  AlertCircle
} from 'lucide-react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const GRADIENTS = {
  light: {
    primary: ['#6366F1', '#4F46E5', '#4338CA'], // Indigo gradient
    secondary: ['#F472B6', '#EC4899', '#DB2777'], // Pink gradient
    success: ['#34D399', '#10B981', '#059669'], // Emerald gradient
  },
  dark: {
    primary: ['#818CF8', '#6366F1', '#4F46E5'], // Brighter indigo for dark mode
    secondary: ['#F9A8D4', '#F472B6', '#EC4899'], // Brighter pink for dark mode
    success: ['#6EE7B7', '#34D399', '#10B981'], // Brighter emerald for dark mode
  }
};

const CoolTransactionPrompt = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [transaction, setTransaction] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Enhanced animated values
  const buttonScale = useSharedValue(1);
  const inputScale = useSharedValue(1);
  const sparkleRotation = useSharedValue(0);
  const sparkleScale = useSharedValue(1);
  const sparkleY = useSharedValue(0);
  const headerHeight = useSharedValue(SCREEN_HEIGHT * 0.35);
  const successScale = useSharedValue(0);
  const backgroundOpacity = useSharedValue(0);

  const categories = [
    { id: 1, name: 'Bills', icon: DollarSign, color: isDark ? '#818CF8' : '#6366F1' },
    { id: 2, name: 'Shopping', icon: Calendar, color: isDark ? '#F9A8D4' : '#EC4899' },
    { id: 3, name: 'Income', icon: TrendingUp, color: isDark ? '#6EE7B7' : '#34D399' },
    { id: 4, name: 'Subscriptions', icon: Repeat, color: isDark ? '#A5B4FC' : '#818CF8' },
  ];

  const examplePrompts = [
    { text: "Pay rent $1500 monthly", category: "Bills", icon: DollarSign },
    { text: "Grocery shopping $200 weekly", category: "Shopping", icon: Calendar },
    { text: "Netflix subscription $15.99 monthly", category: "Subscriptions", icon: Repeat },
    { text: "Salary deposit $3000 bi-weekly", category: "Income", icon: TrendingUp },
    { text: "Gym membership $50 monthly", category: "Subscriptions", icon: Repeat },
  ];

  // Enhanced sparkle animation
  const sparkleAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { rotate: `${sparkleRotation.value}deg` },
        { scale: sparkleScale.value },
        { translateY: sparkleY.value }
      ],
    };
  });

  const startSparkleAnimation = useCallback(() => {
    // Complex rotation animation
    sparkleRotation.value = withRepeat(
      withSequence(
        withTiming(180, { duration: 1500 }),
        withTiming(360, { duration: 1500 })
      ),
      -1,
      true
    );

    // Floating animation
    sparkleY.value = withRepeat(
      withSequence(
        withTiming(-10, { duration: 1000 }),
        withTiming(0, { duration: 1000 })
      ),
      -1,
      true
    );

    // Pulse animation
    sparkleScale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 1000 }),
        withTiming(1, { duration: 1000 })
      ),
      -1,
      true
    );
  }, []);

  useEffect(() => {
    startSparkleAnimation();
    headerHeight.value = withSpring(SCREEN_HEIGHT * 0.3, {
      damping: 15,
      stiffness: 80,
    });
  }, []);

  // Rest of the animated styles...
  const headerAnimatedStyle = useAnimatedStyle(() => ({
    height: headerHeight.value,
    opacity: interpolate(
      headerHeight.value,
      [SCREEN_HEIGHT * 0.3, SCREEN_HEIGHT * 0.35],
      [0.8, 1],
      Extrapolation.CLAMP
    ),
  }));

  const handleSubmit = async () => {
    if (!prompt.trim()) {
      inputScale.value = withSequence(
        withSpring(1.02),
        withSpring(0.98),
        withSpring(1)
      );
      return;
    }

    setIsLoading(true);
    buttonScale.value = withSequence(
      withSpring(0.95),
      withSpring(1.05),
      withSpring(1)
    );

    backgroundOpacity.value = withTiming(1, { duration: 300 });

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      const mockTransaction = {
        id: Math.random().toString(36).substr(2, 9),
        description: prompt,
        amount: Math.floor(Math.random() * 1000),
        date: new Date().toISOString(),
        category: selectedCategory || categories[0].name,
      };
      setTransaction(mockTransaction);
      
      successScale.value = withSequence(
        withSpring(1.2),
        withSpring(1)
      );
    } catch (error) {
      console.error('Error creating transaction:', error);
    } finally {
      setIsLoading(false);
      backgroundOpacity.value = withTiming(0, { duration: 300 });
    }
  };

  const CategoryItem = ({ category, onSelect, isSelected }) => (
    <TouchableOpacity
      onPress={() => onSelect(category)}
      className={`p-3 rounded-xl mr-3 ${isSelected ? 'bg-blue-100 dark:bg-blue-900' : 'bg-gray-100 dark:bg-gray-800'}`}
    >
      <View style={{ backgroundColor: category.color }} className="w-12 h-12 rounded-full items-center justify-center mb-2">
        <category.icon size={24} color="white" />
      </View>
      <Text className={`text-center ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>
        {category.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      
      <ScrollView bounces={false}>
        <Animated.View style={headerAnimatedStyle}>
          <LinearGradient
            colors={isDark ? GRADIENTS.dark.primary : GRADIENTS.light.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="flex-1 px-6 pt-12 pb-8 rounded-b-3xl"
          >
            <Animated.View style={sparkleAnimatedStyle} className="mb-4">
              <Sparkles size={32} color={isDark ? "#FDF4FF" : "#FFD700"} />
            </Animated.View>
            <Text className="text-4xl text-white mb-2 font-rbold">
              Smart Transactions
            </Text>
            <Text className="text-lg text-gray-100 font-rregular">
              Create transactions naturally with AI assistance
            </Text>
          </LinearGradient>
        </Animated.View>

        <View className="px-6 py-8">
          {/* Categories */}
          <Text className="text-xl text-gray-900 dark:text-gray-100 mb-4 font-rbold">
            Categories
          </Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            className="mb-8"
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                onPress={() => setSelectedCategory(category)}
                className={`p-3 rounded-xl mr-3 ${
                  selectedCategory?.id === category.id 
                    ? 'bg-blue-100 dark:bg-blue-900' 
                    : 'bg-gray-100 dark:bg-gray-800'
                }`}
              >
                <View 
                  style={{ backgroundColor: category.color }} 
                  className="w-12 h-12 rounded-full items-center justify-center mb-2"
                >
                  <category.icon size={24} color="white" />
                </View>
                <Text className={`text-center font-rmedium ${
                  selectedCategory?.id === category.id 
                    ? 'text-blue-600 dark:text-blue-400' 
                    : 'text-gray-700 dark:text-gray-300'
                }`}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Input Section */}
          <TextInput
            className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 min-h-[100px] rounded-xl p-4 text-lg font-rregular shadow-sm"
            placeholder="Describe your transaction..."
            placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
            value={prompt}
            onChangeText={setPrompt}
            multiline
          />

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isLoading}
            className="mt-6 rounded-xl overflow-hidden"
          >
            <LinearGradient
              colors={isDark ? GRADIENTS.dark.secondary : GRADIENTS.light.secondary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="p-4 flex-row items-center justify-center"
            >
              {isLoading ? (
                <Text className="text-white font-rmedium text-lg">Processing...</Text>
              ) : (
                <>
                  <Send size={24} color="white" />
                  <Text className="text-white font-rmedium text-lg ml-2">
                    Create Transaction
                  </Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Transaction Result */}
          {transaction && (
            <Animated.View 
              entering={SlideInUp.springify().damping(15)}
              className="mt-8 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
            >
              <View className="flex-row items-center mb-4">
                <CheckCircle size={24} color="#10B981" />
                <Text className="text-2xl font-bold text-gray-900 dark:text-gray-100 ml-2">
                  Success!
                </Text>
              </View>
              <View className="space-y-3">
                <Text className="text-gray-700 dark:text-gray-300">
                  <Text className="font-medium">Description:</Text> {transaction.description}
                </Text>
                <Text className="text-gray-700 dark:text-gray-300">
                  <Text className="font-medium">Amount:</Text> ${transaction.amount}
                </Text>
                <Text className="text-gray-700 dark:text-gray-300">
                  <Text className="font-medium">Category:</Text> {transaction.category}
                </Text>
                <Text className="text-gray-700 dark:text-gray-300">
                  <Text className="font-medium">Date:</Text> {new Date(transaction.date).toLocaleDateString()}
                </Text>
              </View>
            </Animated.View>
          )}

          {/* Example Prompts */}
          <View className="mt-12">
            <Text className="text-xl font-rbold text-gray-900 dark:text-gray-100 mb-4">
              Quick Suggestions
            </Text>
            {examplePrompts.map((prompt, index) => (
              <Animated.View
                key={index}
                entering={SlideInRight.delay(index * 100).springify()}
              >
                <TouchableOpacity
                  onPress={() => {
                    setPrompt(prompt.text);
                    const category = categories.find(c => c.name === prompt.category);
                    setSelectedCategory(category);
                  }}
                  className="flex-row items-center bg-white dark:bg-gray-800 rounded-xl p-4 mb-3 shadow-sm"
                >
                  <View className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 items-center justify-center mr-4">
                    <prompt.icon size={20} color="#3B82F6" />
                  </View>
                  <Text className="flex-1 text-gray-800 dark:text-gray-200 font-amedium">
                    {prompt.text}
                  </Text>
                  <ArrowRight size={20} color="#3B82F6" />
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>

          {/* Pro Tip */}
          <Animated.View
            entering={FadeIn.delay(1000)}
            className="mt-8 mb-4 bg-yellow-100 dark:bg-yellow-900 rounded-xl p-4 flex-row items-start"
          >
            <Lightbulb size={24} color="#FFA000" className="mr-3 mt-1" />
            <Text className="flex-1 font-aregular text-yellow-800 dark:text-yellow-100">
              <Text className="font-amedium">Pro Tip:</Text> Use natural language like "weekly grocery shopping" or "monthly rent payment" for better results.
            </Text>
          </Animated.View>
        </View>
      </ScrollView>
    </View>
  );
};

export default CoolTransactionPrompt;