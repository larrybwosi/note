import { StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

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
          <Text className="text-lg font-bold text-gray-800">{amount}</Text>
          <Text className="text-gray-600 text-xs mb-1">{category}</Text>
          <Text className="text-gray-800 font-medium">{percentage}</Text>
        </View>
      </Animated.View>
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

export default SpendingCategoriesCard;