import { useCallback } from 'react';
import { Text, TextInput, TouchableOpacity, ScrollView, Switch, View } from 'react-native';
import { useObservable } from '@legendapp/state/react';
import { observer } from '@legendapp/state/react';
import { Ionicons } from '@expo/vector-icons';

import {
  TransactionType,
  TransactionStatus,
  RecurrenceFrequency,
  CategoryType,
  Category,
} from 'src/store/finance/types';
import useFinancialStore from 'src/store/finance/store';
import { router, useLocalSearchParams } from 'expo-router';
import DateTimePickerComponent from 'src/components/date.time';
import { SafeAreaView } from 'react-native-safe-area-context';


const TransactionForm = observer(() => {
  const { getCategoriesByType, addTransaction } = useFinancialStore();
  const showDatePicker = useObservable(false);
  const showTimePicker = useObservable(false);

  const {initialType} = useLocalSearchParams()
  // const initialType = TransactionType.EXPENSE 
  const transactionData = useObservable({
    type: initialType as TransactionType,
    amount: '',
    description: '',
    createdAt: new Date(),
    category: { name: '', type: 'expense' as CategoryType },
    status: TransactionStatus.PENDING,
    recurring: false,
    recurringFrequency: 'monthly' as RecurrenceFrequency,
    tags: [] as string[],
    notes: '',
    attachments: [],
    paymentMethod: '',
    location: '',
    isEssential: false,
    metadata: {},
    recurrence: {
      frequency: RecurrenceFrequency.MONTHLY,
      reminderEnabled: false,
    },
  });

  const newTag = useObservable({ value: '' });

  const handleSubmit = useCallback(() => {
    // if (transactionData.description.get() && transactionData.amount.get()) {
    //   addTransaction({
    //     ...transactionData.get(),
    //     amount: parseFloat(transactionData.amount.get()),
    //     id: Date.now().toString(), // Generate a temporary ID
    //   });
    //   showForm.set(false);
    // }
  }, [transactionData, addTransaction]);

  const addTag = () => {
    if (newTag.value.get() && !transactionData.tags.get().includes(newTag.value.get())) {
      transactionData.tags.set([...transactionData.tags.get(), newTag.value.get()]);
      newTag.value.set('');
    }
  };

  const removeTag = (tag: string) => {
    transactionData.tags.set(transactionData.tags.get().filter((t) => t !== tag));
  };

  const categories = getCategoriesByType(transactionData.type.get().toLowerCase() as CategoryType);

  const recurrenceOptions = Object.values(RecurrenceFrequency);

  const isCategorySelected = (category: string) => {
    return transactionData.category.get().name === category;
  };

  return (
    <ScrollView className="flex-1 pt-4">
      <SafeAreaView className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg p-4">
        <Text className="text-2xl font-rbold mb-6 text-gray-800 dark:text-gray-100">
          New {transactionData.type.get().toLowerCase()} 
          {transactionData.type.get() === TransactionType.EXPENSE ? ' 💸' : transactionData.type.get() === TransactionType.INCOME ? ' 💰' : ' 🔄'}
        </Text>

        <View className="space-y-6">
          {/* Transaction Type */}
          <View>
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Transaction Type
            </Text>
            <View className="flex-row justify-between">
              {Object.values(TransactionType).map((type) => (
                <TouchableOpacity
                  key={type}
                  onPress={() => transactionData.type.set(type)}
                  className={`flex-1 py-3 rounded-xl mr-2 ${
                    transactionData.type.get() === type
                      ? 'bg-violet-500'
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <Text
                    className={`text-center ${
                      transactionData.type.get() === type
                        ? 'text-white font-medium'
                        : 'text-gray-800 dark:text-gray-200'
                    }`}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Description */}
          <View>
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </Text>
            <TextInput
              value={transactionData.description.get()}
              onChangeText={(text) => transactionData.description.set(text)}
              placeholder="Enter description"
              className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-700"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Amount */}
          <View>
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Amount
            </Text>
            <TextInput
              value={transactionData.amount.get()}
              onChangeText={(text) => transactionData.amount.set(text.replace(/[^0-9.]/g, ''))}
              placeholder="Enter amount"
              keyboardType="numeric"
              className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-700"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Category Selection */}
          <View>
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row flex-wrap -mx-1">
              {categories.map((category: Category) => (
                <TouchableOpacity
                  key={category.name}
                  onPress={() => transactionData.category.set(category)}
                  className={`m-1 px-4 py-2 rounded-full ${
                    isCategorySelected(category.name)
                      ? 'bg-violet-500'
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <Text
                    className={
                      isCategorySelected(category.name)
                        ? 'text-white font-medium'
                        : 'text-gray-800 dark:text-gray-200'
                    }
                  >
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          
            {/* Date and Time Selection */}
            <DateTimePickerComponent
              value={transactionData.createdAt.get()}
              onDateChange={(selectedDate) => transactionData.createdAt.set(selectedDate)}
              onTimeChange={(selectedDate) => transactionData.createdAt.set(selectedDate)}
              showDatePicker={showDatePicker.get()}
              showTimePicker={showTimePicker.get()}
              setShowDatePicker={showDatePicker.set}
              setShowTimePicker={showDatePicker.set}
            />

          {/* Status */}
          <View>
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status
            </Text>
            <View className="flex-row justify-between">
              {Object.values(TransactionStatus).map((status) => (
                <TouchableOpacity
                  key={status}
                  onPress={() => transactionData.status.set(status)}
                  className={`flex-1 py-2 rounded-xl mr-2 ${
                    transactionData.status.get() === status
                      ? 'bg-violet-500'
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <Text
                    className={`text-center ${
                      transactionData.status.get() === status
                        ? 'text-white font-medium'
                        : 'text-gray-800 dark:text-gray-200'
                    }`}
                  >
                    {status}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Payment Method */}
          <View>
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Payment Method
            </Text>
            <TextInput
              value={transactionData.paymentMethod.get()}
              onChangeText={(text) => transactionData.paymentMethod.set(text)}
              placeholder="Enter payment method"
              className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-700"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Location */}
          <View>
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Location
            </Text>
            <TextInput
              value={transactionData.location.get()}
              onChangeText={(text) => transactionData.location.set(text)}
              placeholder="Enter location"
              className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-700"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Tags */}
          <View>
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tags
            </Text>
            <View className="flex-row items-center">
              <TextInput
                value={newTag.value.get()}
                onChangeText={(text) => newTag.value.set(text)}
                onSubmitEditing={addTag}
                placeholder="Add tag"
                className="flex-1 px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-700"
                placeholderTextColor="#9CA3AF"
              />
              <TouchableOpacity
                onPress={addTag}
                className="ml-2 px-4 py-3 bg-violet-500 rounded-xl"
              >
                <Ionicons name="add" size={24} color="white" />
              </TouchableOpacity>
            </View>
            <View className="flex-row flex-wrap mt-2">
              {transactionData.tags.get().map((tag) => (
                <TouchableOpacity
                  key={tag}
                  onPress={() => removeTag(tag)}
                  className="m-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-xl flex-row items-center"
                >
                  <Text className="text-gray-700 dark:text-gray-300 mr-2">{tag}</Text>
                  <Ionicons name="close-circle" size={16} color="#6B7280" />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Notes */}
          <View>
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Notes
            </Text>
            <TextInput
              value={transactionData.notes.get()}
              onChangeText={(text) => transactionData.notes.set(text)}
              placeholder="Enter notes"
              multiline
              numberOfLines={4}
              className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-700"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Essential Toggle */}
          <View className="flex-row items-center justify-between">
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Essential Transaction
            </Text>
            <Switch
              value={transactionData.isEssential.get()}
              onValueChange={(value) => transactionData.isEssential.set(value)}
              trackColor={{ false: "#767577", true: "#8B5CF6" }}
              thumbColor={transactionData.isEssential.get() ? "#FFFFFF" : "#F4F3F4"}
            />
          </View>

          {/* Recurring Toggle */}
          <View className="flex-row items-center justify-between">
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Recurring Transaction
            </Text>
            <Switch
              value={transactionData.recurring.get()}
              onValueChange={(value) => transactionData.recurring.set(value)}
              trackColor={{ false: "#767577", true: "#8B5CF6" }}
              thumbColor={transactionData.recurring.get() ? "#FFFFFF" : "#F4F3F4"}
            />
          </View>

          {/* Recurrence Frequency (only show if recurring is true) */}
          {transactionData.recurring.get() && (
            <View>
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Recurrence Frequency
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row flex-wrap -mx-1">
                {recurrenceOptions.map((frequency) => (
                  <TouchableOpacity
                    key={frequency}
                    onPress={() => transactionData.recurringFrequency.set(frequency)}
                    className={`m-1 px-4 py-2 rounded-full ${
                      transactionData.recurringFrequency.get() === frequency
                        ? 'bg-violet-500'
                        : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  >
                    <Text
                      className={
                        transactionData.recurringFrequency.get() === frequency
                          ? 'text-white font-medium'
                          : 'text-gray-800 dark:text-gray-200'
                      }
                    >
                      {frequency}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Submit Buttons */}
          <View className="flex-row justify-end space-x-3 mt-6">
            <TouchableOpacity
              onPress={() => router.back()}
              className="px-6 py-3 bg-gray-100 dark:bg-gray-700 rounded-xl"
            >
              <Text className="text-gray-700 dark:text-gray-300 font-medium">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSubmit}
              className="px-6 py-3 bg-violet-500 rounded-xl"
            >
              <Text className="text-white font-medium">Save {transactionData.type.get().toLowerCase()}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </ScrollView>
  );
});

export default TransactionForm;