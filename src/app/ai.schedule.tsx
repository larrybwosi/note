import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useObservable, useComputed, observer, Reactive } from '@legendapp/state/react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { observable } from '@legendapp/state';
import { Ionicons } from '@expo/vector-icons';
import { memo } from 'react';
import Animated, { 
  FadeInDown, 
  FadeInUp, 
  FadeOutDown,
  SlideInRight,
  withSpring,
  useAnimatedStyle,
  withSequence,
  withTiming,
  useSharedValue,
  LinearTransition
} from 'react-native-reanimated';
import { ItemCard } from 'src/components/schedule.item';
import { ScheduleItem } from 'src/store/shedule/types';
import { router } from 'expo-router';

// Updated example prompts focused on daily tasks and events
const EXAMPLE_PROMPTS = [
  "Plan weekly team meeting for project updates",
  "Schedule gym sessions three times a week",
  "Organize monthly family dinner gathering",
  "Create daily meditation routine",
  "Set up quarterly business review",
  "Plan weekend grocery shopping list"
];

interface AppState {
  responses: ScheduleItem[];
  isLoading: boolean;
  error: string | null;
  savedPrompts: string[];
  prompt: string;
  successMessage: string | null;
  hasResult: boolean;
}

const store = observable<AppState>({
  responses: [],
  isLoading: false,
  error: null,
  savedPrompts: [],
  prompt: '',
  successMessage: null,
  hasResult: false,
});

const fetchAIResponses = async (prompt: string): Promise<ScheduleItem[]> => {
  const response = await fetch(`http://192.168.42.236:3000/ai/enhance?prompt=${prompt}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ 
      prompt,
      type: 'task_event',
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to generate tasks/events');
  }
  
  return response.json();
};

const Header: React.FC = memo(() => {
  return (
    <LinearGradient
      colors={['#4F46E5', '#7C3AED', '#9333EA']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="p-8 rounded-b-3xl dark:bg-gradient-to-r dark:from-[#312E81] dark:via-[#4F46E5] dark:to-[#6366F1]"
    >
      <Animated.View entering={FadeInDown.duration(800).springify()}>
        <Animated.Text className="text-4xl font-rbold text-white mb-3">
          Tasks & <Text className="text-indigo-100">Events</Text>
        </Animated.Text>
        <Animated.Text 
          entering={FadeInDown.duration(800).delay(200)}
          className="text-xl font-aregular text-indigo-100"
        >
          AI-powered organization assistant
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

const PromptInput: React.FC = observer(() => {
  const prompt = useObservable(store.prompt);
  const isLoading = useObservable(store.isLoading);
  
  const submit = async (inputPrompt: string) => {
    if (!inputPrompt.trim()) {
      store.error.set('Please describe your task or event.');
      return;
    }
    
    store.isLoading.set(true);
    store.error.set(null);
    store.successMessage.set(null);
    
    try {
      const data = await fetchAIResponses(inputPrompt);
      console.log(data);
      store.responses.set(data);
      store.savedPrompts.push(inputPrompt);
      store.successMessage.set('✨ Task generated successfully!');
      store.hasResult.set(true);
    } catch (err: any) {
      store.error.set(err.message || 'Failed to generate task. Please try again.');
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
          What would you like to plan?
        </Text>
        <TouchableOpacity
          onPress={()=>router.push('scheduleadd')}
          className="bg-blue-500 backdrop-blur-lg px-4 py-2 rounded-xl flex-row items-center"
        >
          <Ionicons name="add" size={20} color="white" />
          <Text className="text-white font-rmedium ml-1">Add Manually</Text>
        </TouchableOpacity>
      </View>
      <Reactive.TextInput
        $className="bg-white dark:bg-gray-800 text-gray-800 dark:text-white p-4 rounded-xl mb-4 min-h-[100px] font-aregular"
        placeholder="Describe your task or event..."
        placeholderTextColor="#6B7280"
        value={prompt.get()}
        onChangeText={(text) => prompt.set(text)}
        multiline
        maxLength={500}
        style={{ textAlignVertical: 'top' }}
      /> 
      
      <ExamplePrompts />

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
            <Ionicons name="calendar-outline" size={24} color="white" />
            <Text className="text-white font-rmedium ml-2 text-lg">
              Create Task/Event
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

const ExamplePrompts: React.FC = observer(() => {
  const hasResult = useObservable(store.hasResult);

  if (hasResult.get()) return null;

  return (
    <View>
      <Text className="text-sm mb-3 font-amedium text-gray-600 dark:text-gray-400">
        Quick suggestions:
      </Text>
      <View className="mb-4">
        {EXAMPLE_PROMPTS.map((examplePrompt, index) => (
          <ExamplePromptChip
            key={index}
            prompt={examplePrompt}
            onPress={() => store.prompt.set(examplePrompt)}
          />
        ))}
      </View>
    </View>
  );
});

const MessageBanner: React.FC<{ type: 'error' | 'success' }> = observer(({ type }) => {
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

const ResponsesList: React.FC = observer(() => {
  const responses = useComputed(() => store.responses.get());
  const hasResult = useObservable(store.hasResult);
  
  if (!hasResult.get() || responses?.length === 0) return null;
  
  return (
    <View className="pb-6">
      <Animated.Text 
        entering={FadeInDown.duration(400)}
        className="text-xl font-abold mb-4 px-4 text-gray-800 dark:text-white"
      >
        Generated Tasks & Events:
      </Animated.Text>
      {responses?.map((item, index) => (
        <ItemCard
         key={item.id.get()} 
         item={item.get()}
         handlePostpone={()=>{}} 
         onComplete={()=>{}} 
        />
      ))}
    </View>
  );
});

const AIPromptExplorer: React.FC = () => {
  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <ScrollView>
        <Header />
        <MessageBanner type="error" />
        <MessageBanner type="success" />
        <PromptInput />
        <ResponsesList />
      </ScrollView>
    </SafeAreaView>
  );
};

export default observer(AIPromptExplorer);