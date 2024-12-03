import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Zap, Rocket, Crown, Check, ChevronRight, Clock, Users, Star } from 'lucide-react-native';
import Animated, { FadeInDown, FadeInRight, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { PlanCard } from 'src/components/plans/plan.card';
import { FeatureList } from 'src/components/plans/features';
import { TestimonialCarousel } from 'src/components/plans/testimonial';
import { ComparisonTable } from 'src/components/plans/comparison';


const { width } = Dimensions.get('window');

const PlansScreen: React.FC = () => {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const buttonScale = useSharedValue(1);

  const plans = [
    {
      name: 'Starter',
      price: '$9.99',
      icon: Zap,
      color: '#60A5FA',
      features: [
        'Essential task management',
        '5 projects',
        '1GB storage',
        'Email support',
      ],
      description: 'Perfect for individuals just starting their productivity journey.',
      popularityScore: 70,
    },
    {
      name: 'Pro',
      price: '$19.99',
      icon: Rocket,
      color: '#34D399',
      features: [
        'Advanced task management',
        'Unlimited projects',
        '10GB storage',
        'Priority support',
        'Team collaboration (up to 5 members)',
        'Advanced analytics',
      ],
      description: 'Ideal for professionals and small teams looking to boost their productivity.',
      popularityScore: 90,
      recommended: true,
    },
    {
      name: 'Enterprise',
      price: '$49.99',
      icon: Crown,
      color: '#F59E0B',
      features: [
        'Custom solutions',
        'Dedicated account manager',
        'Unlimited storage',
        '24/7 premium support',
        'Advanced security features',
        'API access',
        'Custom integrations',
      ],
      description: 'Tailored for large organizations with complex needs and high-volume usage.',
      popularityScore: 85,
    },
  ];

  useEffect(() => {
    setSelectedPlan('Pro'); // Pre-select the recommended plan
  }, []);

  const buttonAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: buttonScale.value }],
    };
  });

  const handlePressIn = () => {
    buttonScale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    buttonScale.value = withSpring(1);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <ScrollView className="flex-1">
        <LinearGradient
          colors={['#4F46E5', '#7C3AED']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="px-6 py-12 rounded-b-3xl"
        >
          <Animated.Text 
            entering={FadeInDown.duration(600).springify()} 
            className="text-4xl font-rbold text-white text-center mb-2"
          >
            Unlock Your Potential
          </Animated.Text>
          <Animated.Text 
            entering={FadeInDown.duration(600).delay(200).springify()} 
            className="text-lg font-aregular text-indigo-100 text-center"
          >
            Choose the plan that fits your ambition
          </Animated.Text>
        </LinearGradient>

        <View className="px-6 mt-8 space-y-6">
          {plans.map((plan, index) => (
            <Animated.View key={plan.name} entering={FadeInRight.duration(600).delay(index * 200).springify()}>
              <PlanCard
                plan={plan}
                isSelected={selectedPlan === plan.name}
                onSelect={() => setSelectedPlan(plan.name)}
              />
            </Animated.View>
          ))}
        </View>

        <View className="px-6 mt-12">
          <Text className="text-2xl font-rbold text-gray-900 dark:text-white mb-6">
            Why Choose Us?
          </Text>
          <FeatureList
            features={[
              { icon: Clock, text: 'Save up to 10 hours per week' },
              { icon: Users, text: 'Used by over 100,000 professionals' },
              { icon: Star, text: '4.9/5 star rating from 10,000+ reviews' },
            ]}
          />
        </View>


        <View className="px-6 mt-12 mb-8">
          <Text className="text-2xl font-rbold text-gray-900 dark:text-white mb-6">
            Compare Plans
          </Text>
          <ComparisonTable plans={plans} />
        </View>
      </ScrollView>

      <Animated.View 
        className="px-6 py-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700"
        style={[
          {
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: -4,
            },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 5,
          },
        ]}
      >
        <Animated.View style={buttonAnimatedStyle}>
          <TouchableOpacity
            className="bg-indigo-600 py-4 px-6 rounded-xl flex-row items-center justify-center"
            activeOpacity={0.8}
            onPress={() => console.log('Get Started with', selectedPlan)}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
          >
            <Text className="text-white font-rbold text-lg mr-2">Get Started Now</Text>
            <ChevronRight color="white" size={20} />
          </TouchableOpacity>
        </Animated.View>
        <Text className="text-center text-gray-500 dark:text-gray-400 mt-2 font-aregular">
          30-day money-back guarantee
        </Text>
      </Animated.View>
    </SafeAreaView>
  );
};

export default PlansScreen;
