import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, useColorScheme } from 'react-native';
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
  LinearTransition,
  runOnJS,
  SlideOutLeft
} from 'react-native-reanimated';
// import TransactionCard from 'src/components/transaction.card';
import { Transaction, TransactionStatus, TransactionType } from 'src/store/finance/types';
import { format } from 'date-fns';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { colorScheme } from 'nativewind';
import TransactionCard from 'src/components/finance/transaction.card';
import { synced } from '@legendapp/state/sync';
import { ObservablePersistMMKV } from '@legendapp/state/persist-plugins/mmkv';
import useFinancialStore from 'src/store/finance/store';

const EXAMPLE_PROMPTS = [
  "Paid $49.99 for Netflix subscription, monthly payment",
  "Received salary of $5000 from Tech Corp",
  "Bought groceries at Walmart for $123.45 using credit card",
  "Monthly gym membership fee of $30 at LA Fitness",
  "Electric bill payment of $85.50, recurring monthly expense",
  "Coffee at Starbucks for $4.75",
  "Transferred $1000 to savings account"
];

interface AppState {
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  savedPrompts: string[];
  prompt: string;
  successMessage: string | null;
  hasResult: boolean;
}

const store = observable<AppState>(
  synced({
    initial:{
      transactions: [],
      error: null,
      savedPrompts: [],
      prompt: '',
      successMessage: null,
      hasResult: false,
    },
    persist: {
      name: 'ai-transaction',
      plugin: ObservablePersistMMKV
    }
  })
);

const fetchFinancePlanner = async (prompt: string): Promise<Transaction[]> => {
  const response = await fetch(`http://192.168.42.236:3000/ai/transaction?prompt=${prompt}`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to generate financial plan');
  }
  
  return response.json();
};

const Header: React.FC = memo(() => {
  return (
    <LinearGradient
      colors={['#10B981', '#059669', '#047857']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="p-8 rounded-b-3xl dark:bg-gradient-to-r dark:from-[#065F46] dark:via-[#047857] dark:to-[#059669]"
    >
      <Animated.View entering={FadeInDown.duration(800).springify()}>
        <Animated.Text className="text-4xl font-rbold text-white mb-3">
          Finance <Text className="text-emerald-100">Planner</Text>
        </Animated.Text>
        <Animated.Text 
          entering={FadeInDown.duration(800).delay(200)}
          className="text-xl font-aregular text-emerald-100"
        >
          AI-powered financial assistant
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
        className="bg-emerald-100 dark:bg-emerald-900/50 px-4 py-2 rounded-lg mr-2 mb-2"
      >
        <Text className="text-emerald-700 dark:text-emerald-200 font-amedium">
          {prompt}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
});

const PromptInput: React.FC = observer(() => {
  const prompt = useObservable(store.prompt);
  const isLoading = useObservable(false);
  
  const submit = async (inputPrompt: string) => {
    if (!inputPrompt.trim()) {
      store.error.set('Please describe your financial goal or plan.');
      return;
    }
    
    isLoading.set(true);
    store.error.set(null);
    store.successMessage.set(null);
    
    try {
      const data = await fetchFinancePlanner(inputPrompt);
      data.forEach(transaction => store.transactions.push(transaction));
      store.savedPrompts.push(inputPrompt);
      store.successMessage.set('💰 Financial plan generated successfully!');
      store.hasResult.set(true);
    } catch (err: any) {
      store.error.set(err.message || 'Failed to generate plan. Please try again.');
    } finally {
      isLoading.set(false);
    }
  };

  return (
    <Animated.View 
      entering={FadeInUp.duration(800).springify()}
      className="p-6"
    >
      <Text className="text-base font-amedium mb-2 text-gray-800 dark:text-gray-200">
        What would you like to plan financially?
      </Text>
      <Reactive.TextInput
        $className="bg-white dark:bg-gray-800 text-gray-800 dark:text-white p-4 rounded-xl mb-4 min-h-[100px]"
        placeholder="Describe your financial goal or plan..."
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
          isLoading.get() ? 'bg-emerald-400' : 'bg-emerald-600'
        } p-4 rounded-xl flex-row justify-center items-center`}
        style={{ elevation: 3 }}
      >
        {isLoading.get() ? (
          <ActivityIndicator color="white" size="small" />
        ) : (
          <>
            <Ionicons name="wallet-outline" size={24} color="white" />
            <Text className="text-white font-rmedium ml-2 text-lg">
              Create Financial Plan
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

const TransactionsList: React.FC = observer(() => {
  const transactions = useComputed(() => store.transactions.get());
  const hasResult = useObservable(store.hasResult);
  const { addTransaction } = useFinancialStore();
  
  if (!hasResult.get() || transactions?.length === 0) return null;

  const handleAccept = (transaction: Transaction) => {
    console.log(`Accepted transaction with ID: ${transaction}`);
    addTransaction(transaction)
  }

  const handleDelete = (id: string) => {
    console.log(`Deleted transaction with ID: ${id}`);
  }

  const handleReject = (id: string) => {
    console.log(`Rejected transaction with ID: ${id}`);
  }
  
  return (
    <View className="pb-6">
      <Animated.Text 
        entering={FadeInDown.duration(400)}
        className="text-xl font-abold mb-4 px-4 text-gray-800 dark:text-white"
      >
        Generated Financial Plan:
      </Animated.Text>
      {transactions?.map((item, index) => (
        <TransactionCard
        key={index}
          transaction={item.get()}
          onDelete={() => handleDelete(item.id.get().toString())}
          showActions={true} // Optional: Show accept/reject buttons
          onAccept={() => handleAccept(item.get())}
          onReject={() => handleReject(item.id.get())}
          showAttachments={true} // Optional: Show attachments section
        />
      ))}
    </View>
  );
});

const FinanceCreator: React.FC = () => {
  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <ScrollView>
        <Header />
        <MessageBanner type="error" />
        <MessageBanner type="success" />
        <PromptInput />
        <TransactionsList />
      </ScrollView>
    </SafeAreaView>
  );
};

export default observer(FinanceCreator);