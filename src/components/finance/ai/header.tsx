import { LinearGradient } from "expo-linear-gradient";
import { Sparkles } from "lucide-react-native";
import { memo } from "react";
import { Text, View } from "react-native";
import Animated, { 
  FadeInDown, 
  useAnimatedStyle, 
  useSharedValue 
} from "react-native-reanimated";
import { Theme } from "src/store/finance/types";

interface HeaderProps {
  title: string;
  subtitle: string;
  theme: Theme;
  layout: 'card' | 'minimal';
}

const Header: React.FC<HeaderProps>= memo(({ title, subtitle, theme, layout }) => {
  const [word1, word2] = title.split(' & ');
  const scale = useSharedValue(1);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  const headerStyle = layout === 'card' 
    ? "p-8 rounded-3xl m-2 shadow-lg" 
    : "p-8 rounded-b-3xl";

  return (
    <LinearGradient
      colors={theme.primary}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className={headerStyle}
    >
      <Animated.View 
        entering={FadeInDown.duration(800).springify()}
        style={animatedStyle}
      >
        <View className="flex-row items-center mb-2">
          <Sparkles size={24} color="white" className="mr-2" />
          <Animated.Text className="text-4xl font-abold text-white">
            {word1} & <Text style={{ color: theme.secondary[1] }}>{word2}</Text>
          </Animated.Text>
        </View>
        <Animated.Text 
          entering={FadeInDown.duration(800).delay(200)}
          className="text-xl font-aregular"
          style={{ color: theme.text.secondary }}
        >
          {subtitle}
        </Animated.Text>
      </Animated.View>
    </LinearGradient>
  );
});
Header.displayName = "Header"
export default Header