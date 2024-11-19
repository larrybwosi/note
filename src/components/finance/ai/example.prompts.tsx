import { Observable } from "@legendapp/state";
import { observer } from "@legendapp/state/react";
import { Sparkles } from "lucide-react-native";
import { useCallback } from "react";
import { Dimensions, ScrollView, Text, TouchableOpacity, View } from "react-native";
import Animated, { useAnimatedScrollHandler, useSharedValue } from "react-native-reanimated";
import { AppState, Theme } from "src/store/finance/types";

export interface ExamplePromptsProps {
  store: Observable<AppState>;
  prompts: string[];
  theme: Theme;
  promptStyle: 'chips' | 'list' | 'carousel';
}

const ExamplePrompts: React.FC<ExamplePromptsProps> = observer(({ store, prompts, theme, promptStyle }) => {
  const scrollX = useSharedValue(0);
  
  if (!!store.responses.get().length) return null;

  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollX.value = event.contentOffset.x;
  });

  const renderPrompt = useCallback((prompt: string, index: number) => {
    switch (promptStyle) {
      case 'chips':
        return (
          <TouchableOpacity
            key={index}
            onPress={() => store.prompt.set(prompt)}
            style={{ backgroundColor: theme.secondary[0] }}
            className="px-4 py-2 rounded-full mr-2 mb-2"
          >
            <Text style={{ color: theme.text.primary }} className=" font-aregular text-sm">{prompt}</Text>
          </TouchableOpacity>
        );
      case 'list':
        return (
          <TouchableOpacity
            key={index}
            onPress={() => store.prompt.set(prompt)}
            style={{ backgroundColor: theme.background.card }}
            className="p-4 mb-2 rounded-xl flex-row items-center"
          >
            <Sparkles size={20} color={theme.accent} />
            <Text style={{ color: theme.text.primary }} className="ml-2 font-aregular text-sm">{prompt}</Text>
          </TouchableOpacity>
        );
      case 'carousel':
        return (
          <Animated.View
            key={index}
            style={[{
              width: Dimensions.get('window').width - 80,
              marginHorizontal: 10,
            }]}
          >
            <TouchableOpacity
              onPress={() => store.prompt.set(prompt)}
              style={{ backgroundColor: theme.background.card }}
              className="p-6 rounded-xl shadow-sm"
            >
              <Text style={{ color: theme.text.primary }} className="font-aregular text-sm">{prompt}</Text>
            </TouchableOpacity>
          </Animated.View>
        );
    }
  }, [promptStyle, store, theme]);

  return (
    <View className="mb-4 px-4">
      <Text style={{ color: theme.text.secondary }} className="text-sm mb-3 font-amedium">
        Quick suggestions:
      </Text>
      {promptStyle === 'carousel' ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          onScroll={scrollHandler}
          scrollEventThrottle={16}
        >
          {prompts.map((prompt, index) => renderPrompt(prompt, index))}
        </ScrollView>
      ) : (
        <View className={promptStyle === 'chips' ? "flex-row flex-wrap" : ""}>
          {prompts.map((prompt, index) => renderPrompt(prompt, index))}
        </View>
      )}
    </View>
  );
});

export default ExamplePrompts