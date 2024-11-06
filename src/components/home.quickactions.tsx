import { Pressable, Text, View } from 'react-native';

const QuickActionCard = ({ icon, title, count, color, description }: any) => (
  <Pressable
    className={`dark:bg-gray-900 dark:border-gray-800 bg-white border-gray-100 
        p-6 rounded-3xl shadow-lg flex-1 mx-2 mb-4 border`}
    style={{
      borderLeftWidth: 4,
      borderLeftColor: color,
      transform: [{ scale: 1 }],
    }}
  >
    <View
      className="w-16 h-16 rounded-2xl items-center justify-center mb-4"
      style={{ backgroundColor: color }}
    >
      {icon}
    </View>
    <Text className={`dark:text-white text-gray-800 text-xl font-rbold mb-2`}>{title}</Text>
    <Text className={`dark:text-gray-400 text-gray-500 text-sm mb-3 font-aregular`}>{count}</Text>
    <Text className={`dark:text-gray-500 text-gray-600 text-xs leading-relaxed font-aregular`}>
      {description}
    </Text>
  </Pressable>
);

export default QuickActionCard;
