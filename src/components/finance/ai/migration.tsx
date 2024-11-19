import React, { memo, useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Dimensions, TextInput } from 'react-native';
import { useObservable, observer } from '@legendapp/state/react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Observable, observable } from '@legendapp/state';
import Animated, { 
  FadeInDown, 
  FadeInUp, 
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  useAnimatedScrollHandler,
} from 'react-native-reanimated';
import { synced } from '@legendapp/state/sync';
import { ObservablePersistMMKV } from '@legendapp/state/persist-plugins/mmkv';
import { AlertCircle, CheckCircle, Edit, Sparkles, ChevronRight } from 'lucide-react-native';

// Enhanced theme types
interface Theme {
  primary: string[];
  secondary: string[];
  accent: string;
  text: {
    primary: string;
    secondary: string;
  };
  background: {
    main: string;
    card: string;
  };
}

const themes: Record<string, Theme> = {
  modern: {
    primary: ['#FF6B6B', '#4ECDC4'],
    secondary: ['#45B7D1', '#FFBE0B'],
    accent: '#FF6B6B',
    text: {
      primary: '#2C3E50',
      secondary: '#95A5A6'
    },
    background: {
      main: '#F8FAFC',
      card: '#FFFFFF'
    }
  },
  nature: {
    primary: ['#00B894', '#81ECEC'],
    secondary: ['#55EFC4', '#74B9FF'],
    accent: '#00B894',
    text: {
      primary: '#2D3436',
      secondary: '#636E72'
    },
    background: {
      main: '#F0FFF4',
      card: '#FFFFFF'
    }
  },
  sunset: {
    primary: ['#FD746C', '#FF9068'],
    secondary: ['#FC8181', '#F6AD55'],
    accent: '#FD746C',
    text: {
      primary: '#2D3748',
      secondary: '#718096'
    },
    background: {
      main: '#FFFAF0',
      card: '#FFFFFF'
    }
  }
};

interface AppState {
  responses: any[];
  isLoading: boolean;
  error: string | null;
  savedPrompts: string[];
  prompt: string;
  successMessage: string | null;
  hasResult: boolean;
}

interface AICreatorTemplateProps {
  title: string;
  subtitle: string;
  inputPlaceholder: string;
  examplePrompts: string[];
  type: string;
  endpoint: string;
  addManualRoute: string;
  addManualButtonText: string;
  ItemComponent: React.ComponentType<ItemComponentProps>;
  itemComponentProps?: Record<string, any>;
  theme?: keyof typeof themes;
  layout?: 'card' | 'minimal';
  animation?: 'bounce' | 'slide' | 'fade';
  promptStyle?: 'chips' | 'list' | 'carousel';
}

interface ItemComponentProps {
  item: any;
  [key: string]: any;
}

interface HeaderProps {
  title: string;
  subtitle: string;
  theme: Theme;
  layout: 'card' | 'minimal';
}

interface MessageBannerProps {
  type: 'error' | 'success';
  store: Observable<AppState>;
  theme: Theme;
}

interface ResponsesListProps {
  store: Observable<AppState>;
  ItemComponent: React.ComponentType<ItemComponentProps>;
  itemComponentProps?: Record<string, any>;
  theme: Theme;
}

interface PromptInputProps {
  store: Observable<AppState>;
  inputPlaceholder: string;
  theme: Theme;
  endpoint: string;
  layout: 'card' | 'minimal';
  animation: 'bounce' | 'slide' | 'fade';
}

interface ExamplePromptsProps {
  store: Observable<AppState>;
  prompts: string[];
  theme: Theme;
  promptStyle: 'chips' | 'list' | 'carousel';
}

const createStore = (name: string) => observable<AppState>(
  synced({
    initial: {
      responses: [],
      isLoading: false,
      error: null,
      savedPrompts: [],
      prompt: '',
      successMessage: null,
      hasResult: false,
    },
    persist: {
      name: name,
      plugin: ObservablePersistMMKV
    }
  })
);

const Header: React.FC<HeaderProps> = memo(({ title, subtitle, theme, layout }) => {
  const [word1, word2] = title.split(' & ');
  const scale = useSharedValue(1);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  const headerStyle = layout === 'card' 
    ? "p-8 rounded-3xl m-4 shadow-lg" 
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
          <Animated.Text className="text-3xl text-white">
            {word1} & <Text style={{ color: theme.secondary[0] }}>{word2}</Text>
          </Animated.Text>
        </View>
        <Animated.Text 
          entering={FadeInDown.duration(800).delay(200)}
          className="text-xl"
          style={{ color: theme.text.secondary }}
        >
          {subtitle}
        </Animated.Text>
      </Animated.View>
    </LinearGradient>
  );
});

const MessageBanner: React.FC<MessageBannerProps> = observer(({ type, store, theme }) => {
  const message = useObservable(type === 'error' ? store.error : store.successMessage);
  
  if (!message.get()) return null;
  
  const backgroundColor = type === 'error' 
    ? 'bg-red-100 dark:bg-red-900/50'
    : 'bg-green-100 dark:bg-green-900/50';
  
  const textColor = type === 'error'
    ? 'text-red-800 dark:text-red-200'
    : 'text-green-800 dark:text-green-200';
    
  const Icon = type === 'error' ? AlertCircle : CheckCircle;
  
  return (
    <Animated.View 
      entering={FadeInDown.duration(400)}
      className={`${backgroundColor} p-4 mx-4 my-2 rounded-xl flex-row items-center`}
    >
      <Icon
        size={20} 
        color={type === 'error' ? theme.accent : theme.secondary[0]}
      />
      <Text className={`${textColor} ml-2`}>{message.get()}</Text>
    </Animated.View>
  );
});

const ResponsesList: React.FC<ResponsesListProps> = observer(({ store, ItemComponent, itemComponentProps, theme }) => {
  const responses = store.responses.get();
  return (
    <View className="pb-6">
      <Animated.Text 
        entering={FadeInDown.duration(400)}
        className="text-xl mb-4 px-4"
        style={{ color: theme.text.primary }}
      >
        Generated Content:
      </Animated.Text>
      {responses?.map((item: any, index: number) => (
        <ItemComponent
          key={item.id?.get?.() || index}
          item={item.get?.() || item}
          {...itemComponentProps} 
        />
      ))}
    </View>
  );
});

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
        className="p-2 rounded-xl mb-4 min-h-[100px]"
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
            <Edit size={24} color="white" />
            <Text className="text-white ml-2 text-lg">
              Generate Magic
            </Text>
          </>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
});

const ExamplePrompts: React.FC<ExamplePromptsProps> = observer(({ store, prompts, theme, promptStyle }) => {
  const hasResult = useObservable(store.hasResult);
  const scrollX = useSharedValue(0);
  
  if (hasResult.get()) return null;

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
            <Text style={{ color: theme.text.primary }} className="text-sm">{prompt}</Text>
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
            <Text style={{ color: theme.text.primary }} className="ml-2 text-sm">{prompt}</Text>
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
              <Text style={{ color: theme.text.primary }} className="text-sm">{prompt}</Text>
            </TouchableOpacity>
          </Animated.View>
        );
    }
  }, [promptStyle, store, theme]);

  return (
    <View className="mb-4 px-4">
      <Text style={{ color: theme.text.secondary }} className="text-sm mb-3">
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

const AICreatorTemplate: React.FC<AICreatorTemplateProps> = ({
  title,
  subtitle,
  inputPlaceholder,
  examplePrompts,
  type,
  endpoint,
  addManualRoute,
  addManualButtonText,
  ItemComponent,
  itemComponentProps,
  theme = 'modern',
  layout = 'card',
  animation = 'bounce',
  promptStyle = 'chips'
}) => {
  const store = createStore(type);
  const selectedTheme = themes[theme];

  useEffect(() => {
    const timer = setTimeout(() => {
      store.successMessage.set(null);
      store.error.set(null);
    }, 10000);

    return () => clearTimeout(timer);
  }, [store.successMessage, store.error]);

  return (
    <SafeAreaView style={{ backgroundColor: selectedTheme.background.main }} className="flex-1 w-full">
      <ScrollView>
        <Header 
          title={title} 
          subtitle={subtitle} 
          theme={selectedTheme}
          layout={layout}
        />
        <MessageBanner type="error" store={store} theme={selectedTheme} />
        <MessageBanner type="success" store={store} theme={selectedTheme} />
        <PromptInput
          store={store}
          inputPlaceholder={inputPlaceholder}
          theme={selectedTheme}
          layout={layout}
          animation={animation}
          endpoint={endpoint}
        />
        <ExamplePrompts 
          store={store} 
          prompts={examplePrompts}
          theme={selectedTheme}
          promptStyle={promptStyle}
        />
        <ResponsesList 
          store={store} 
          ItemComponent={ItemComponent}
          itemComponentProps={itemComponentProps}
          theme={selectedTheme}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

Header.displayName = "Header";
export default observer(AICreatorTemplate);