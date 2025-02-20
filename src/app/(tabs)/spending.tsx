import { StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import SpendingChart from "src/components/ui/spendingchart";

// Type Definitions
type SpendingDataPoint = {
  category: string;
  percentage: number;
  color: string;
  total: number;
};

type CategoryItemProps = {
  icon: string;
  category: string;
  amount: string;
  percentage: string;
  backgroundColor: string;
  iconBgColor: string;
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
        <Text className="text-lg font-amedium text-gray-800">{amount}</Text>
        <Text className="text-gray-600 text-xs mb-1 font-rregular">{category}</Text>
        <Text className="text-gray-800 font-rmedium">{percentage}</Text>
      </View>
    </Animated.View>
  );
};

// Spending Categories Card Component
const SpendingCategoriesCard = (): React.ReactElement => {

    const spendingData: SpendingDataPoint[] = [
      { category: 'Utilities', percentage: 36, color: '#FFB800', total: 447.84, backgroundColor: "#FFF9E8", iconBgColor: "#FFE8B0", icon: "⚡" },
      { category: 'Payments', percentage: 20, color: '#3F7AFF', total: 248.8, backgroundColor: "#F0F4FF", iconBgColor: "#DCE6FF", icon: "💰" },
      { category: 'Expenses', percentage: 12, color: '#4CAF50', total: 149.28, backgroundColor: "#F0F9F0", iconBgColor: "#D0F0D0", icon: "📝" },
      { category: 'Entertainment', percentage: 24, color: '#7B68EE', total: 299.21, backgroundColor: "#F9F0FF", iconBgColor: "#E8D9FF", icon: "🎥" },
    ];
    
  return (
    <Animated.View 
      entering={FadeInDown.delay(600).duration(700).springify()}
      style={[styles.cardShadow]}
      className="w-full bg-white rounded-3xl p-5"
    >
      <Text className="text-xl font-amedium text-gray-800 mb-4">Spending Categories</Text>
      
      <View className="flex-row flex-wrap -mx-2">
        {spendingData.map((item, index) => (
          <CategoryItem 
            key={index}
            icon={item.icon}
            category={item.category}
            amount={`$${item.total.toFixed(2)}`}
            percentage={`${item.percentage}%`}
            backgroundColor={item.backgroundColor}
            iconBgColor={item.iconBgColor}
          />
        ))}
      </View>
    </Animated.View>
  );
};

// Main Dashboard Component
const SpendingDashboard = (): React.ReactElement => {
  return (
    <View className="flex-1 bg-gray-50 px-4 py-6">
      <SpendingChart />
      <SpendingCategoriesCard />
    </View>
  );
};

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
  chartLabel: {
    position: 'absolute',
    fontSize: 12,
    fontWeight: '500',
  }
});

export default SpendingDashboard;