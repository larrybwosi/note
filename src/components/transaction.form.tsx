import { useObservable } from '@legendapp/state/react';
import { ObservableBoolean } from '@legendapp/state';
import { observer } from '@legendapp/state/react';
import { useCallback } from 'react';
import { Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';

import {
  TransactionType,
  CategoryId,
  RecurrenceFrequency,
  CategoryType,
  TransactionInput,
} from 'src/store/finance/types';
import useFinanceStore from 'src/store/finance/actions';
import { getCategory, useGetCategoriesByType } from 'src/store/finance/utils/category';

interface TransactionFormProps {
  showForm: ObservableBoolean;
  type: TransactionType;
  onSubmit: (transaction: TransactionInput) => void;
}

const TransactionForm = observer(({ showForm, type, onSubmit }: TransactionFormProps) => {
  const { getCategoriesByType } = useFinanceStore();
  const transactionData = useObservable<TransactionInput>({
    type,
    amount: 0,
    title: '',
    description: '',
    categoryId: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    time: format(new Date(), 'HH:mm'),
    paymentMethod: '',
    location: '',
    tags: [],
    isEssential: false,
    recurrence: {
      frequency: RecurrenceFrequency.MONTHLY,
      reminderEnabled: false,
    },
  });

  const newTag = useObservable({ value: '' });

  const handleSubmit = useCallback(() => {
    if (transactionData.title && transactionData.amount) {
      onSubmit(transactionData.get());
      showForm.set(false);
    }
  }, []);

  const addTag = () => {
    if (newTag.value.get() && !transactionData.tags.get()?.includes(newTag.value.get())) {
      transactionData.tags.set([...(transactionData.tags.get() || []), newTag.value.get()]);
      newTag.value.set('');
    }
  };

  const removeTag = (tag: string) => {
    transactionData.tags.set(transactionData.tags.get()?.filter((t) => t !== tag) || []);
  };

  const categories = useGetCategoriesByType(
    type === TransactionType.INCOME ? CategoryType.INCOME : CategoryType.EXPENSE
  );

  const recurrenceOptions = Object.values(RecurrenceFrequency);

  return (
    <ScrollView className="p-2 ">
      <View className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg p-6">
        <Text className="text-2xl font-rbold mb-6 text-gray-800 dark:text-gray-100 flex-row items-center">
          New {type.toLowerCase()} {type === 'EXPENSE' ? '💸' : '💰'}
        </Text>

        <View className="space-y-5">
          {/* Title */}
          <View>
            <Text className="text-sm font-plregular text-gray-700 dark:text-gray-300 mb-1.5">
              Title
            </Text>
            <TextInput
              value={transactionData.title.get()}
              onChangeText={(text) => transactionData.title.set(text)}
              placeholder="Enter title"
              className="w-full px-4 py-3.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-700 focus:border-violet-500 dark:focus:border-violet-400"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Amount */}
          <View>
            <Text className="text-sm font-plregular text-gray-700 dark:text-gray-300 mb-1.5">
              Amount
            </Text>
            <TextInput
              value={transactionData.amount.get()?.toString()}
              onChangeText={(text) => transactionData.amount.set(parseFloat(text) || 0)}
              placeholder="Enter amount"
              keyboardType="numeric"
              className="w-full px-4 py-3.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-700 focus:border-violet-500 dark:focus:border-violet-400"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Description */}
          <View>
            <Text className="text-sm font-plregular text-gray-700 dark:text-gray-300 mb-1.5">
              Description
            </Text>
            <TextInput
              value={transactionData.description.get()}
              onChangeText={(text) => transactionData.description.set(text)}
              placeholder="Enter description"
              multiline
              numberOfLines={3}
              className="w-full px-4 py-3.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-700 focus:border-violet-500 dark:focus:border-violet-400"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Category Selection */}
          <View>
            <Text className="text-sm font-plregular text-gray-700 dark:text-gray-300 mb-2">
              Category
            </Text>
            <View className="flex-row flex-wrap -m-1">
              {categories.map(({ id, name, color }) => (
                <TouchableOpacity
                  key={id}
                  onPress={() => transactionData.categoryId.set(id)}
                  className={`m-1 px-4 py-2 rounded-full ${
                    transactionData.categoryId.get() === id
                      ? 'bg-blue-500'
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <Text
                    className={
                      transactionData.categoryId.get() === id
                        ? 'text-white font-rregular'
                        : 'text-gray-800 dark:text-gray-200 font-rregular'
                    }
                  >
                    {name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Payment Method */}
          <View>
            <Text className="text-sm font-plregular text-gray-700 dark:text-gray-300 mb-1.5">
              Payment Method
            </Text>
            <TextInput
              value={transactionData.paymentMethod.get()}
              onChangeText={(text) => transactionData.paymentMethod.set(text)}
              placeholder="Enter payment method"
              className="w-full px-4 py-3.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-700 focus:border-violet-500 dark:focus:border-violet-400"
              placeholderTextColor="#9CA3AF"
            />
          </View>
          {/* Tags */}
          <View>
            <Text className="text-sm font-plregular text-gray-700 dark:text-gray-300 mb-1.5">
              Tags
            </Text>
            <View className="flex-row items-center">
              <TextInput
                value={newTag.value.get()}
                onChangeText={(text) => newTag.value.set(text)}
                onSubmitEditing={addTag}
                placeholder="Add tag"
                className="flex-1 px-4 py-3.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-700 focus:border-violet-500 dark:focus:border-violet-400"
                placeholderTextColor="#9CA3AF"
              />
              <TouchableOpacity
                onPress={addTag}
                className="ml-2 px-4 py-3.5 bg-violet-500 rounded-xl shadow-sm shadow-violet-200 dark:shadow-violet-900"
              >
                <Text className="text-white font-plregular">Add</Text>
              </TouchableOpacity>
            </View>
            <View className="flex-row flex-wrap mt-2">
              {transactionData.tags.get()?.map((tag) => (
                <TouchableOpacity
                  key={tag}
                  onPress={() => removeTag(tag)}
                  className="m-1 px-3.5 py-2 bg-gray-100 dark:bg-gray-700 rounded-xl flex-row items-center"
                >
                  <Text className="text-gray-700 dark:text-gray-300 mr-2">{tag}</Text>
                  <Text className="text-gray-500">×</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Essential Toggle */}
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => transactionData.isEssential.set(!transactionData.isEssential.get())}
              className={`w-6 h-6 border-2 rounded-lg mr-2 ${
                transactionData.isEssential.get()
                  ? 'bg-violet-500 border-violet-500'
                  : 'border-gray-300 dark:border-gray-600'
              }`}
            />
            <Text className="text-gray-700 dark:text-gray-300">Essential Transaction</Text>
          </View>

          {/* Recurrence */}
          <View>
            <Text className="text-sm font-plregular text-gray-700 dark:text-gray-300 mb-2">
              Recurrence
            </Text>
            <View className="flex-row flex-wrap -m-1">
              {recurrenceOptions.map((frequency) => (
                <TouchableOpacity
                  key={frequency}
                  onPress={() => transactionData.recurrence.frequency.set(frequency)}
                  className={`m-1 px-4 py-2 rounded-full ${
                    transactionData.recurrence.frequency.get() === frequency
                      ? 'bg-blue-500'
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <Text
                    className={
                      transactionData.recurrence.frequency.get() === frequency
                        ? 'text-white font-rregular'
                        : 'text-gray-800 dark:text-gray-200 font-rregular'
                    }
                  >
                    {frequency}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Submit Buttons */}
          <View className="flex-row justify-end space-x-3 mt-8">
            <TouchableOpacity
              onPress={() => showForm.set(false)}
              className="px-6 py-3.5 bg-gray-100 dark:bg-gray-700 rounded-xl"
            >
              <Text className="text-gray-700 dark:text-gray-300 font-plregular">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSubmit}
              className="px-6 py-3.5 bg-violet-500 rounded-xl shadow-sm shadow-violet-200 dark:shadow-violet-900"
            >
              <Text className="text-white font-plregular">Save {type.toLowerCase()}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
});

export default TransactionForm;
