import { router } from "expo-router";
import { DollarSign, Plus } from "lucide-react-native";
import { useEffect } from "react";
import { TouchableOpacity } from "react-native";
import { Text, View } from "react-native";
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";

export default function BalanceCard () {
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
      style={[animatedStyle, {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 4,
        },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
      }]}
      className="w-full bg-amber-100 rounded-3xl p-5 mb-4"
    >
      <Text className="text-gray-500 text-sm mb-1">Available on card</Text>
      <Text className="text-4xl font-amedium mb-4 text-gray-800">$13,528.31</Text>
      
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
          onPress={()=>router.navigate('create.transaction')}
        >
          <Text className="text-white font-amedium mr-1">Pay</Text>
          <DollarSign size={16} color="white" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          className="bg-black rounded-xl py-3.5 px-6 flex-1 ml-2 items-center flex-row justify-center"
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.8}
        >
          <Text className="text-white font-amedium mr-1">Deposit</Text>
          <Plus size={16} color="white" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};
