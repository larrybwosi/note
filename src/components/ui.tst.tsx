import React, { useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, StatusBar, StyleSheet, Platform, SafeAreaView } from 'react-native';
import { Svg, Path, Circle, G } from 'react-native-svg';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming, 
  Easing,
  FadeInDown,
  FadeInRight
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  DollarSign, 
  Plus, 
  ChevronDown, 
  CreditCard, 
  ArrowRight 
} from 'lucide-react-native';

// Type Definitions
type TransactionItemProps = {
  logo: any;
  company: string;
  description: string;
  amount: string;
  date?: string;
};

type CategoryItemProps = {
  icon: string;
  category: string;
  amount: string;
  percentage: string;
  backgroundColor: string;
  iconBgColor: string;
};

type SpendingDataPoint = {
  category: string;
  percentage: number;
  color: string;
  total: number;
};

// Main App Component
export default function BankingApp(): React.ReactElement {
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
      <View className="px-4 pt-4 pb-2">
        <Text className="text-2xl font-bold text-gray-800">My Finance</Text>
        <Text className="text-gray-500">February 16, 2025</Text>
      </View>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingBottom: 32}}
      >
        <View className="px-4">
          <BalanceCard />
          <SpendingChart />
          <OperationsCard />
          <SpendingCategoriesCard />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Balance Card Component
const BalanceCard = (): React.ReactElement => {
  const scale = useSharedValue(0.98);
  
  useEffect(() => {
    scale.value = withSpring(1, { damping: 12 });
  }, []);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  
  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 10 });
  };
  
  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 10 });
  };
  
  return (
    <Animated.View 
      entering={FadeInDown.duration(700).springify()}
      style={[animatedStyle, styles.cardShadow]}
      className="w-full bg-white rounded-3xl p-5 mb-4"
    >
      <Text className="text-gray-500 text-sm mb-1">Available on card</Text>
      <Text className="text-4xl font-bold mb-4 text-gray-800">$13,528.31</Text>
      
      <View className="mb-2">
        <View className="flex-row justify-between items-center mb-1">
          <Text className="text-gray-500 text-sm">Transfer Limit</Text>
          <Text className="text-gray-800 font-semibold">$12,000</Text>
        </View>
        <View className="h-2 bg-gray-200 rounded-full w-full overflow-hidden">
          <View className="h-2 bg-black rounded-full w-3/4" />
        </View>
      </View>
      
      <Text className="text-gray-500 text-sm my-3">Spent $1,244.65</Text>
      
      <View className="flex-row justify-between mt-3">
        <TouchableOpacity 
          className="bg-black rounded-xl py-3.5 px-6 flex-1 mr-2 items-center flex-row justify-center"
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.8}
        >
          <Text className="text-white font-semibold mr-1">Pay</Text>
          <DollarSign size={16} color="white" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          className="bg-black rounded-xl py-3.5 px-6 flex-1 ml-2 items-center flex-row justify-center"
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.8}
        >
          <Text className="text-white font-semibold mr-1">Deposit</Text>
          <Plus size={16} color="white" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

// Spending Chart Component
const SpendingChart = (): React.ReactElement => {
  const rotation = useSharedValue(0);
  
  const spendingData: SpendingDataPoint[] = [
    { category: 'Utilities', percentage: 36, color: '#FFB800', total: 447.84 },
    { category: 'Payments', percentage: 20, color: '#3F7AFF', total: 248.8 },
    { category: 'Subscriptions', percentage: 8, color: '#FF5252', total: 99.52 },
    { category: 'Expenses', percentage: 12, color: '#4CAF50', total: 149.28 },
    { category: 'Entertainment', percentage: 24, color: '#7B68EE', total: 299.21 },
  ];
  
  useEffect(() => {
    rotation.value = withTiming(360, {
      duration: 1500,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
  }, []);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotateZ: `${rotation.value}deg` }],
  }));
  
  return (
    <Animated.View 
      entering={FadeInDown.delay(200).duration(700).springify()}
      style={[styles.cardShadow]}
      className="w-full bg-white rounded-3xl p-5 mb-4"
    >
      <View className="items-center justify-center relative">
        <Animated.View style={[{position: 'absolute'}, animatedStyle]}>
          <Svg height="200" width="200" viewBox="0 0 100 100">
            {/* Yellow segment - 36% */}
            <Path
              d="M50,50 L50,0 A50,50 0 0,1 93.3,75 Z"
              fill="#FFB800"
              opacity={0.9}
            />
            {/* Blue segment - 20% */}
            <Path
              d="M50,50 L93.3,75 A50,50 0 0,1 75,93.3 Z"
              fill="#3F7AFF"
              opacity={0.9}
            />
            {/* Red segment - 8% */}
            <Path
              d="M50,50 L75,93.3 A50,50 0 0,1 50,100 Z"
              fill="#FF5252"
              opacity={0.9}
            />
            {/* Green segment - 12% */}
            <Path
              d="M50,50 L50,100 A50,50 0 0,1 25,93.3 Z"
              fill="#4CAF50"
              opacity={0.9}
            />
            {/* Purple segment - 24% */}
            <Path
              d="M50,50 L25,93.3 A50,50 0 0,1 6.7,75 Z"
              fill="#7B68EE"
              opacity={0.9}
            />
            {/* Center white circle */}
            <Circle cx="50" cy="50" r="35" fill="white" />
          </Svg>
        </Animated.View>

        <View className="z-10 items-center">
          <View className="flex-row items-center">
            <Text className="text-gray-500 text-sm">
              Spent this <Text className="font-semibold text-gray-700">April</Text>
            </Text>
            <ChevronDown size={14} color="#4B5563" style={{marginLeft: 4}} />
          </View>
          <Text className="text-3xl font-bold mt-1 text-gray-800">$1,244.65</Text>
        </View>
        
        {/* Percentage labels with improved positioning */}
        <Text style={[styles.chartLabel, {top: 16, right: 40, color: '#3F7AFF'}]}>20%</Text>
        <Text style={[styles.chartLabel, {top: 40, right: 8, color: '#FF5252'}]}>8%</Text>
        <Text style={[styles.chartLabel, {right: 24, top: 96, color: '#4CAF50'}]}>12%</Text>
        <Text style={[styles.chartLabel, {bottom: 40, right: 40, color: '#7B68EE'}]}>24%</Text>
        <Text style={[styles.chartLabel, {bottom: 64, left: 16, color: '#FFB800'}]}>36%</Text>
      </View>
    </Animated.View>
  );
};

// Operations Card Component
const OperationsCard = (): React.ReactElement => {
  return (
    <Animated.View 
      entering={FadeInDown.delay(400).duration(700).springify()}
      style={[styles.cardShadow]}
      className="w-full bg-white rounded-3xl p-5 mb-4"
    >
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-xl font-semibold text-gray-800">Operations</Text>
        <TouchableOpacity activeOpacity={0.7} className="flex-row items-center">
          <Text className="text-purple-600 font-medium mr-1">View All</Text>
          <ArrowRight size={14} color="#7C3AED" />
        </TouchableOpacity>
      </View>
      
      <Text className="text-gray-500 font-medium mb-2">Today</Text>
      
      <TransactionItem 
        logo={require('./assets/att-logo.png')} 
        company="AT&T"
        description="Unlimited Family Plan"
        amount="-$34.99"
      />
      
      <TransactionItem 
        logo={require('./assets/adobe-logo.png')} 
        company="CC Subscription"
        description="CC All Apps"
        amount="-$59.99"
      />
      
      <Text className="text-gray-500 font-medium my-2">Yesterday</Text>
      
      <TransactionItem 
        logo={require('./assets/blizzard-logo.png')} 
        company="Blizzard Entertainment"
        description="6-Month Subscription"
        amount="-$79.89"
      />
      
      <TransactionItem 
        logo={require('./assets/netflix-logo.png')} 
        company="Netflix"
        description="Basic Plan"
        amount="-$7.99"
      />
    </Animated.View>
  );
};

// Transaction Item Component
const TransactionItem = ({ 
  logo, 
  company, 
  description, 
  amount,
  date 
}: TransactionItemProps): React.ReactElement => {
  const scale = useSharedValue(1);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  
  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15 });
  };
  
  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
  };
  
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View 
        entering={FadeInRight.duration(400).delay(100)}
        style={[animatedStyle]}
        className="flex-row items-center justify-between p-3 mb-2 rounded-xl bg-gray-50"
      >
        <View className="flex-row items-center">
          <View className="w-10 h-10 rounded-full justify-center items-center overflow-hidden bg-white" style={styles.logoShadow}>
            <Image source={logo} className="w-8 h-8" resizeMode="contain" />
          </View>
          <View className="ml-3">
            <Text className="font-semibold text-gray-800">{company}</Text>
            <Text className="text-gray-500 text-xs">{description}</Text>
          </View>
        </View>
        <View className="items-end">
          <Text className="text-gray-800 font-semibold">{amount}</Text>
          {date && <Text className="text-gray-400 text-xs">{date}</Text>}
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

// Spending Categories Card Component
const SpendingCategoriesCard = (): React.ReactElement => {
  return (
    <Animated.View 
      entering={FadeInDown.delay(600).duration(700).springify()}
      style={[styles.cardShadow]}
      className="w-full bg-white rounded-3xl p-5"
    >
      <Text className="text-xl font-semibold text-gray-800 mb-4">Spending Categories</Text>
      
      <View className="flex-row flex-wrap -mx-2">
        <CategoryItem 
          icon="⚡"
          category="Utilities"
          amount="$447.84"
          percentage="36%"
          backgroundColor="#FFF9E8"
          iconBgColor="#FFE8B0"
        />
        
        <CategoryItem 
          icon="📝"
          category="Expenses"
          amount="$149.28"
          percentage="12%"
          backgroundColor="#F0F9F0"
          iconBgColor="#D0F0D0"
        />
        
        <CategoryItem 
          icon="💰"
          category="Payments"
          amount="$248.8"
          percentage="20%"
          backgroundColor="#F0F4FF"
          iconBgColor="#DCE6FF"
        />
        
        <CategoryItem 
          icon="📺"
          category="Subscriptions"
          amount="$99.52"
          percentage="8%"
          backgroundColor="#FFF0F0"
          iconBgColor="#FFD9D9"
        />
      </View>
    </Animated.View>
  );
};

// Category Item Component
const CategoryItem = ({ 
  icon, 
  category, 
  amount, 
  percentage, 
  backgroundColor,
  iconBgColor
}: CategoryItemProps): React.ReactElement => {
  return (
    <Animated.View 
      entering={FadeInDown.duration(600).delay(700)}
      className="w-1/2 p-2"
    >
      <View style={{backgroundColor}} className="p-4 rounded-xl">
        <View style={{backgroundColor: iconBgColor}} className="w-10 h-10 rounded-full items-center justify-center mb-3">
          <Text className="text-lg">{icon}</Text>
        </View>
        <Text className="text-lg font-bold text-gray-800">{amount}</Text>
        <Text className="text-gray-600 text-xs mb-1">{category}</Text>
        <Text className="text-gray-800 font-medium">{percentage}</Text>
      </View>
    </Animated.View>
  );
};

// Shared styles
const styles = StyleSheet.create({
  cardShadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  logoShadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  chartLabel: {
    position: 'absolute',
    fontSize: 12,
    fontWeight: '500',
  }
});