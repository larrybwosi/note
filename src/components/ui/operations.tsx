import { LinearGradient } from "expo-linear-gradient";
import { ArrowRight, BusFront, Coffee, LucideIcon, ShoppingCart, Video } from "lucide-react-native";
import { Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown, FadeInRight, useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";

// Custom Icons with different colors
const CustomShoppingCart = () => <ShoppingCart size={24} color="#FF5252" />;
const CustomBusFront = () => <BusFront size={24} color="#3F7AFF" />;
const CustomVideo = () => <Video size={24} color="#7B68EE" />;
const CustomCoffee = () => <Coffee size={24} color="#FFB800" />;

// Transaction Item Component
type TransactionItemProps = {
  logo: React.ReactElement;
  company: string;
  description: string;
  amount: string;
  date?: string;
};

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
          <View className="w-10 h-10 rounded-full justify-center items-center overflow-hidden bg-white" style={{
            shadowColor: '#000',
            shadowOffset: {
            width: 0,
            height: 2,
            },
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 2,
        }}>
            {logo}
          </View>
          <View className="ml-3">
            <Text className="font-rmedium text-gray-800">{company}</Text>
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

const OperationsCard = (): React.ReactElement => {
  const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

  // Data array for transactions
  const transactions = [
    {
      logo: <CustomShoppingCart />,
      company: "Groceries",
      description: "Restocked the fridge",
      amount: "-$34.99",
      date: "Today"
    },
    {
      logo: <CustomBusFront />,
      company: "Transport",
      description: "Morning bus to work",
      amount: "-$59.99",
      date: "Today"
    },
    {
      logo: <CustomVideo />,
      company: "Blizzard Entertainment",
      description: "6-Month Subscription",
      amount: "-$79.89",
      date: "Yesterday"
    },
    {
      logo: <CustomCoffee />,
      company: "Breakfirst",
      description: "Breakfirst with Larry",
      amount: "-$7.99",
      date: "Yesterday"
    }
  ];

  return (
    <AnimatedLinearGradient
      colors={['#fffbeb', '#fff']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      entering={FadeInDown.delay(400).duration(700).springify()}
      style={[{
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 4,
          },
          shadowOpacity: 0.08,
          shadowRadius: 12,
          elevation: 4,
        }]}
      className="w-full bg-white rounded-3xl p-5 mb-4"
    >
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-lg font-amedium text-gray-800">Operations</Text>
        <TouchableOpacity activeOpacity={0.7} className="flex-row items-center">
          <Text className="text-purple-600 font-rregular text-sm mr-1">View All</Text>
          <ArrowRight size={14} color="#7C3AED" />
        </TouchableOpacity>
      </View>
      
      {transactions.map((transaction, index) => (
        <View key={index}>
          {index === 0 && <Text className="text-gray-500 font-medium mb-2">{transaction.date}</Text>}
          {index === 2 && <Text className="text-gray-500 font-medium my-2">{transaction.date}</Text>}
          <TransactionItem 
            logo={transaction.logo}
            company={transaction.company}
            description={transaction.description}
            amount={transaction.amount}
          />
        </View>
      ))}
    </AnimatedLinearGradient>
  );
};

export default OperationsCard;