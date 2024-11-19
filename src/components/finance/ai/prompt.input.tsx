import { Observable } from "@legendapp/state";
import { observer, useObservable } from "@legendapp/state/react";
import { Sparkles } from "lucide-react-native";
import { useCallback } from "react";
import Animated, { FadeInUp, useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { ActivityIndicator, Text, TextInput, TouchableOpacity } from "react-native";
import { AppState, Theme } from "src/store/finance/types";

interface PromptInputProps {
  store: Observable<AppState>;
  inputPlaceholder: string;
  theme: Theme;
  endpoint: string;
  layout: 'card' | 'minimal';
  animation: 'bounce' | 'slide' | 'fade';
}

const PromptInput: React.FC<PromptInputProps> = observer(({ store, endpoint, inputPlaceholder, theme, layout, animation }) => {
  const prompt = useObservable(store.prompt);
  const isLoading = useObservable(store.isLoading);
  const scale = useSharedValue(1);
  
  const fetchAIResponses = async (prompt: string) => {
    const response = await fetch(`${endpoint}?prompt=${prompt}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to generate content');
    }
    
    return response.json();
  };

  const submit = async (inputPrompt: string) => {
    console.log("Submitting")
    if (!inputPrompt.trim()) {
      store.error.set('Please provide a description.');
      return;
    }
    
    store.isLoading.set(true);
    store.error.set(null);
    store.successMessage.set(null);
    
    try {
      const data = await fetchAIResponses(inputPrompt);
      store.responses.set(data);
      store.savedPrompts.push(inputPrompt);
      store.successMessage.set('✨ Generated successfully!');
      store.hasResult.set(true);
    } catch (err: any) {
      store.error.set(err.message || 'Failed to generate. Please try again.');
    } finally {
      store.isLoading.set(false);
    }
  };

  const containerStyle = layout === 'card' 
    ? "bg-white rounded-2xl m-4 shadow-md p-3" 
    : "p-3";

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  const handlePressIn = useCallback(() => {
    if (animation === 'bounce') {
      scale.value = withSpring(0.95);
    }
  }, [animation, scale]);

  const handlePressOut = useCallback(() => {
    if (animation === 'bounce') {
      scale.value = withSpring(1);
    }
  }, [animation, scale]);

  return (
    <Animated.View 
      entering={FadeInUp.duration(800).springify()}
      className={containerStyle}
      style={animatedStyle}
    >
      <TextInput
        className="p-2 rounded-xl mb-4 min-h-[100px] font-aregular"
        style={{
          backgroundColor: theme.background.card,
          color: theme.text.primary,
          borderColor: theme.primary[0],
        }}
        placeholder={inputPlaceholder}
        placeholderTextColor={theme.text.secondary}
        value={prompt.get()}
        onChangeText={(text) => prompt.set(text)}
        multiline
        maxLength={500}
      />
      
      <TouchableOpacity
        onPress={() => submit(prompt.get())}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isLoading.get()}
        style={{
          backgroundColor: isLoading.get() ? theme.secondary[0] : theme.primary[0]
        }}
        className="p-4 rounded-xl flex-row justify-center items-center"
      >
        {isLoading.get() ? (
          <ActivityIndicator color="white" size="small" />
        ) : (
          <>
            <Sparkles size={24} color="white" />
            <Text className="text-white font-amedium ml-2 text-lg">
              Generate Item
            </Text>
          </>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
});

export default PromptInput