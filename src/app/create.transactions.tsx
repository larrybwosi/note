import { View, Text, ScrollView, TouchableOpacity, Switch, TextInput, TextInputProps } from 'react-native';
import { DollarSign, Calendar, Tag, FileText, MapPin, Check, Sparkles, ChevronRight } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { observer, useObservable } from '@legendapp/state/react';
import { router, useLocalSearchParams } from 'expo-router';
import {
  Category,
  RecurrenceFrequency,
  TransactionStatus,
  TransactionType,
} from 'src/store/types';
import { CategorySelector } from 'src/components/fin/category.selector';
import { RecurrenceSelector } from 'src/components/fin/recurence';
import { Button } from 'src/components/ui/button';
import { useFinance } from 'src/lib/actions';

// Extracted components for better organization
const FormSection: React.FC<{
  title: string;
  icon: React.FC<any>;
  description?: string;
  children: React.ReactNode;
}> = ({ title, icon: Icon, description, children }) => (
  <View className="mb-6 bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
    <View className="flex-row items-center mb-2">
      <Icon className="text-blue-500" size={20} />
      <Text className="text-lg font-rbold ml-2 text-gray-900 dark:text-white">{title}</Text>
    </View>
    {description && (
      <Text className="text-sm text-gray-500 dark:text-gray-400 mb-3">{description}</Text>
    )}
    {children}
  </View>
);

const InputField: React.FC<TextInputProps & { label?: string }> = ({ label, ...props }) => (
  <View>
    {label && (
      <Text className="text-sm font-rmedium text-gray-600 dark:text-gray-300 mb-1">{label}</Text>
    )}
    <TextInput
      className="bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl px-4 py-3.5 font-rmedium"
      placeholderTextColor="#9CA3AF"
      {...props}
    />
  </View>
);

const TypeSelector: React.FC<{
  type: TransactionType;
  onTypeChange: (type: TransactionType) => void;
}> = ({ type, onTypeChange }) => (
  <View className="flex-row justify-around bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
    {[TransactionType.EXPENSE, TransactionType.INCOME].map((t) => (
      <TouchableOpacity
        key={t}
        className={`flex-1 py-3.5 rounded-xl ${
          type === t
            ? t === TransactionType.EXPENSE
              ? 'bg-red-500'
              : 'bg-green-500'
            : 'bg-transparent'
        }`}
        onPress={() => onTypeChange(t)}
      >
        <Text
          className={`text-center font-rbold ${
            type === t
              ? 'text-white'
              : 'text-gray-600 dark:text-gray-300'
          }`}
        >
          {t.charAt(0) + t.slice(1).toLowerCase()}
        </Text>
      </TouchableOpacity>
    ))}
  </View>
);

const CreateTransaction: React.FC = observer(() => {
  const { type } = useLocalSearchParams();
  const { createTransaction } = useFinance();
  const state$ = useObservable({
    type: type === 'expense' ? TransactionType.EXPENSE : TransactionType.INCOME,
    amount: '',
    description: '',
    category: null as Category | null,
    date: new Date(),
    showDatePicker: false,
    tags: [] as string[],
    notes: '',
    location: '',
    isEssential: false,
    status: TransactionStatus.COMPLETED,
    recurrence: RecurrenceFrequency.NONE,
  });

  const handleCreateTransaction = () => {
    const data = state$.get();
    // createTransaction({
    //   ...data,
    //   categoryId: data.category?.id!,
    //   amount: parseInt(data.amount)
    // });
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <ScrollView className="flex-1 p-4">
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-3xl font-rbold text-gray-900 dark:text-white">
            New Transaction
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/ai.create.transaction")}
            className="bg-blue-500/90 backdrop-blur-lg px-4 py-2 rounded-xl flex-row items-center"
          >
            <Sparkles size={18} color="white" />
            <Text className="text-white font-rbold ml-2">Try AI</Text>
          </TouchableOpacity>
        </View>

        <FormSection title="Type" icon={ChevronRight}>
          <TypeSelector
            type={state$.type.get()}
            onTypeChange={(t) => state$.type.set(t)}
          />
        </FormSection>

        <FormSection title="Amount" icon={DollarSign} description="How much?">
          <InputField
            placeholder="0.00"
            keyboardType="decimal-pad"
            value={state$.amount.get()}
            onChangeText={(text) => state$.amount.set(text)}
            className="text-2xl"
          />
        </FormSection>

        <FormSection title="Details" icon={FileText}>
          <View className="space-y-4">
            <InputField
              label="Description"
              placeholder="What's this for?"
              value={state$.description.get()}
              onChangeText={(text) => state$.description.set(text)}
            />
            
            <CategorySelector
              transactionType={state$.type.get()}
              selectedCategory={state$.category.get()}
              onSelectCategory={(category) => state$.category.set(category)}
            />

            <TouchableOpacity
              className="bg-gray-50 dark:bg-gray-700 rounded-xl px-4 py-3.5"
              onPress={() => state$.showDatePicker.set(true)}
            >
              <Text className="text-gray-900 dark:text-white font-rmedium">
                {state$.date.get().toLocaleDateString()}
              </Text>
            </TouchableOpacity>
          </View>
        </FormSection>

        <FormSection title="Additional Info" icon={Tag}>
          <View className="gap-3">
            <InputField
              placeholder="Add tags (comma-separated)"
              value={state$.tags.get().join(', ')}
              onChangeText={(text) => state$.tags.set(text.split(',').map(tag => tag.trim()))}
            />

            <InputField
              placeholder="Add notes"
              multiline
              numberOfLines={4}
              value={state$.notes.get()}
              onChangeText={(text) => state$.notes.set(text)}
            />

            <InputField
              placeholder="Location"
              value={state$.location.get()}
              onChangeText={(text) => state$.location.set(text)}
            />

            <View className="flex-row items-center justify-between bg-gray-50 dark:bg-gray-700 rounded-xl px-4 py-3">
              <Text className="font-rmedium text-gray-900 dark:text-white">Essential</Text>
              <Switch
                value={state$.isEssential.get()}
                onValueChange={(value) => state$.isEssential.set(value)}
                trackColor={{ false: "#767577", true: "#81b0ff" }}
                thumbColor={state$.isEssential.get() ? "#f5dd4b" : "#f4f3f4"}
              />
            </View>

            <RecurrenceSelector
              selectedRecurrence={state$.recurrence.get()}
              onSelectRecurrence={(recurrence) => state$.recurrence.set(recurrence)}
            />
          </View>
        </FormSection>

        <Button
          title="Create Transaction"
          onPress={handleCreateTransaction}
          variant="primary"
          className="mt-6 rounded-xl py-4"
        />
      </ScrollView>
    </SafeAreaView>
  );
});

export default CreateTransaction;