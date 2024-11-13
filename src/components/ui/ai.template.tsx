import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useObservable, useComputed, observer, Reactive } from '@legendapp/state/react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { observable } from '@legendapp/state';
import { Ionicons } from '@expo/vector-icons';
import { memo } from 'react';
import Animated, { 
  FadeInDown, 
  FadeInUp, 
  SlideInRight,
  withSequence,
  withTiming,
  useAnimatedStyle,
  useSharedValue
} from 'react-native-reanimated';
import { router } from 'expo-router';
import { synced } from '@legendapp/state/sync';
import { ObservablePersistMMKV } from '@legendapp/state/persist-plugins/mmkv';

interface AICreatorTemplateProps {
  title: string;
  subtitle: string;
  inputPlaceholder: string;
  examplePrompts: string[];
  type: string;
  endpoint: string;
  addManualRoute: string;
  addManualButtonText: string;
  ItemComponent: React.ComponentType<any>;
  itemComponentProps?: Record<string, any>; 
  gradientColors?: string[];
}

interface AppState {
  responses: any[];
  isLoading: boolean;
  error: string | null;
  savedPrompts: string[];
  prompt: string;
  successMessage: string | null;
  hasResult: boolean;
}

const createStore = (name:string) => observable<AppState>(
  synced({
    initial:{
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

const Header: React.FC<{ title: string; subtitle: string; gradientColors: string[] }> = memo(({ title, subtitle, gradientColors }) => {
  const [word1, word2] = title.split(' & ');
  
  return (
    <LinearGradient
      colors={gradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="p-8 rounded-b-3xl"
    >
      <Animated.View entering={FadeInDown.duration(800).springify()}>
        <Animated.Text className="text-4xl font-rbold text-white mb-3">
          {word1} & <Text className="text-indigo-100">{word2}</Text>
        </Animated.Text>
        <Animated.Text 
          entering={FadeInDown.duration(800).delay(200)}
          className="text-xl font-aregular text-indigo-100"
        >
          {subtitle}
        </Animated.Text>
      </Animated.View>
    </LinearGradient>
  );
});

const ExamplePromptChip: React.FC<{ prompt: string; onPress: () => void }> = memo(({ prompt, onPress }) => {
  const scale = useSharedValue(1);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  const handlePress = () => {
    scale.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withTiming(1, { duration: 100 })
    );
    onPress();
  };

  return (
    <Animated.View 
      entering={SlideInRight.duration(400)}
      style={animatedStyle}
    >
      <TouchableOpacity
        onPress={handlePress}
        className="bg-indigo-100 dark:bg-indigo-900/50 px-4 py-2 rounded-lg mr-2 mb-2"
      >
        <Text className="text-indigo-700 dark:text-indigo-200 font-amedium">
          {prompt}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
});

const PromptInput: React.FC<{
  store: any;
  inputPlaceholder: string;
  examplePrompts: string[];
  endpoint: string;
  type: string;
  addManualRoute: string;
  addManualButtonText: string;
}> = observer(({ 
  store, 
  inputPlaceholder, 
  examplePrompts, 
  endpoint, 
  type,
  addManualRoute,
  addManualButtonText 
}) => {
  const prompt = useObservable(store.prompt);
  const isLoading = useObservable(store.isLoading);
  
  const fetchAIResponses = async (prompt: string) => {
    const response = await fetch(`${endpoint}?prompt=${prompt}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

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

  return (
    <Animated.View 
      entering={FadeInUp.duration(800).springify()}
      className="p-6"
    >
      <View className='flex-row justify-between'>
        <Text className="text-base font-rmedium mb-2 text-gray-800 dark:text-gray-200">
          What would you like to create?
        </Text>
        <TouchableOpacity
          onPress={() => router.push(addManualRoute)}
          className="bg-blue-500 backdrop-blur-lg px-4 py-2 rounded-xl flex-row items-center"
        >
          <Ionicons name="add" size={20} color="white" />
          <Text className="text-white font-rmedium ml-1">{addManualButtonText}</Text>
        </TouchableOpacity>
      </View>
      
      <Reactive.TextInput
        $className="bg-white dark:bg-gray-800 text-gray-800 dark:text-white p-4 rounded-xl mb-4 min-h-[100px] font-aregular"
        placeholder={inputPlaceholder}
        placeholderTextColor="#6B7280"
        value={prompt.get()}
        onChangeText={(text) => prompt.set(text)}
        multiline
        maxLength={500}
        style={{ textAlignVertical: 'top' }}
      />
      
      <ExamplePrompts store={store} prompts={examplePrompts} />

      <TouchableOpacity
        onPress={() => submit(prompt.get())}
        disabled={isLoading.get()}
        className={`${
          isLoading.get() ? 'bg-indigo-400' : 'bg-indigo-600'
        } p-4 rounded-xl flex-row justify-center items-center`}
        style={{ elevation: 3 }}
      >
        {isLoading.get() ? (
          <ActivityIndicator color="white" size="small" />
        ) : (
          <>
            <Ionicons name="create-outline" size={24} color="white" />
            <Text className="text-white font-rmedium ml-2 text-lg">
              Generate
            </Text>
          </>
        )}
      </TouchableOpacity>
      
      <Text className="text-right mt-2 text-gray-500 dark:text-gray-400">
        {prompt.get().length}/500
      </Text>
    </Animated.View>
  );
});

const ExamplePrompts: React.FC<{ store: any; prompts: string[] }> = observer(({ store, prompts }) => {
  const hasResult = useObservable(store.hasResult);

  if (hasResult.get()) return null;

  return (
    <View className="mb-4">
      <Text className="text-sm mb-3 font-amedium text-gray-600 dark:text-gray-400">
        Quick suggestions:
      </Text>
      <View>
        {prompts.map((prompt, index) => (
          <ExamplePromptChip
            key={index}
            prompt={prompt}
            onPress={() => store.prompt.set(prompt)}
          />
        ))}
      </View>
    </View>
  );
});

const MessageBanner: React.FC<{ type: 'error' | 'success'; store: any }> = observer(({ type, store }) => {
  const message = useObservable(type === 'error' ? store.error : store.successMessage);
  
  if (!message.get()) return null;
  
  const backgroundColor = type === 'error' 
    ? 'bg-red-100 dark:bg-red-900/50'
    : 'bg-green-100 dark:bg-green-900/50';
  
  const textColor = type === 'error'
    ? 'text-red-800 dark:text-red-200'
    : 'text-green-800 dark:text-green-200';
    
  const icon = type === 'error' ? 'alert-circle' : 'checkmark-circle';
  
  return (
    <Animated.View 
      entering={FadeInDown.duration(400)}
      className={`${backgroundColor} p-4 mx-4 my-2 rounded-xl flex-row items-center`}
    >
      <Ionicons 
        name={icon} 
        size={20} 
        color={type === 'error' ? '#991B1B' : '#166534'} 
      />
      <Text className={`${textColor} font-medium ml-2`}>{message.get()}</Text>
    </Animated.View>
  );
});

const ResponsesList: React.FC<{ 
  store: any; 
  ItemComponent: React.ComponentType<any>
  itemComponentProps?: Record<string, any>;
 }> = observer(({ store, ItemComponent, itemComponentProps }) => {
  const responses = useComputed(() => store.responses.get());
  const hasResult = useObservable(store.hasResult);
  
  if (!hasResult.get() || responses?.length === 0) return null;
  
  return (
    <View className="pb-6">
      <Animated.Text 
        entering={FadeInDown.duration(400)}
        className="text-xl font-abold mb-4 px-4 text-gray-800 dark:text-white"
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
  gradientColors = ['#4F46E5', '#7C3AED', '#9333EA']
}) => {
  const store = createStore(type);

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <ScrollView>
        <Header 
          title={title} 
          subtitle={subtitle} 
          gradientColors={gradientColors} 
        />
        <MessageBanner type="error" store={store} />
        <MessageBanner type="success" store={store} />
        <PromptInput
          store={store}
          inputPlaceholder={inputPlaceholder}
          examplePrompts={examplePrompts}
          endpoint={endpoint}
          type={type}
          addManualRoute={addManualRoute}
          addManualButtonText={addManualButtonText}
        />
        <ResponsesList 
          store={store} 
          ItemComponent={ItemComponent}
          itemComponentProps={itemComponentProps}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default observer(AICreatorTemplate);