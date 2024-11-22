import React from 'react';
import { Text, TouchableOpacity, ScrollView, Switch, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useObservable } from '@legendapp/state/react';
import { Plus, Sparkles, XCircle } from 'lucide-react-native';
import { observer } from '@legendapp/state/react';
import { router } from 'expo-router';

import {
  TransactionType,
  TransactionStatus,
  RecurrenceFrequency,
  CategoryType,
  Category,
} from 'src/store/finance/types';
import DateTimePickerComponent from 'src/components/date.time';
import useFinancialStore from 'src/store/finance/store';
import { FormLabel } from 'src/components/finance/label';
import { FormInput } from 'src/components/finance/input';

const TransactionForm = observer(() => {
  const { getCategoriesByType, addTransaction } = useFinancialStore();
  const showDatePicker = useObservable(false);
  const showTimePicker = useObservable(false);
  const recurring = useObservable(false);

  const transactionData = useObservable({
    type: "income" as TransactionType,
    amount: '',
    description: '',
    createdAt: new Date(),
    category: { name: '', type: 'expense' as CategoryType },
    status: TransactionStatus.PENDING,
    tags: [] as string[],
    notes: '',
    attachments: [] as string[],
    paymentMethod: '',
    location: '',
    isEssential: false,
    metadata: {},
    recurrence: {
      frequency: RecurrenceFrequency.NONE,
      reminderEnabled: false,
    },
  });

  const newTag = useObservable({ value: '' });

  const handleSubmit = () => {
    if (transactionData.description.get() && transactionData.amount.get()) {
      addTransaction({
        ...transactionData.get(),
        amount: parseFloat(transactionData.amount.get()),
        id: Date.now().toString(),
      });
      router.back();
    }
  };

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

  const getStatusColor = (status: TransactionStatus) => {
    switch (status) {
      case TransactionStatus.COMPLETED:
        return 'bg-green-500';
      case TransactionStatus.PENDING:
        return 'bg-yellow-500';
      case TransactionStatus.UPCOMING:
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <ScrollView className="flex-1 pt-4">
      <SafeAreaView className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg p-4">
        <View className='justify-between flex-row'>
          <Text className="text-2xl font-rbold mb-6 text-gray-800 dark:text-gray-100">
            New {transactionData.type.get().toLowerCase()} 
            {transactionData.type.get() === TransactionType.EXPENSE ? ' 💸' : transactionData.type.get() === TransactionType.INCOME ? ' 💰' : ' 🔄'}
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/ai.transaction")}
            className="bg-blue-500 backdrop-blur-lg px-4 py-2 rounded-xl flex-row items-center"
          >
            <Sparkles size={20} color="white" />
            <Text className="text-white font-rmedium ml-1">Try AI</Text>
          </TouchableOpacity>
        </View>

        <View className="space-y-6">
          {/* Transaction Type */}
          <View>
            <FormLabel label="Transaction Type" />
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
            <FormLabel label="Description" />
            <FormInput
              value={transactionData.description.get()}
              onChangeText={(text) => transactionData.description.set(text)}
              placeholder="Enter description"
            />
          </View>

          {/* Amount */}
          <View>
            <FormLabel label="Amount" />
            <FormInput
              value={transactionData.amount.get()}
              onChangeText={(text) => transactionData.amount.set(text.replace(/[^0-9.]/g, ''))}
              placeholder="Enter amount"
              keyboardType="numeric"
            />
          </View>

          {/* Category Selection */}
          <View>
            <FormLabel label="Category" />
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
          <View className='my-2'>
            <FormLabel label="Status" />
            <View className="flex-row justify-between">
              {Object.values(TransactionStatus).map((status) => (
                <TouchableOpacity
                  key={status}
                  onPress={() => transactionData.status.set(status)}
                  className={`flex-1 py-2 rounded-xl mr-2 ${
                    transactionData.status.get() === status
                      ? getStatusColor(status)
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <Text
                    className={`text-center font-amedium ${
                      transactionData.status.get() === status
                        ? 'text-white'
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
            <FormLabel label="Payment Method" />
            <FormInput
              value={transactionData.paymentMethod.get()}
              onChangeText={(text) => transactionData.paymentMethod.set(text)}
              placeholder="Enter payment method"
            />
          </View>

          {/* Location */}
          <View>
            <FormLabel label="Location" />
            <FormInput
              value={transactionData.location.get()}
              onChangeText={(text) => transactionData.location.set(text)}
              placeholder="Enter location"
            />
          </View>

          {/* Tags */}
          <View>
            <FormLabel label="Tags" />
            <View className="flex-row items-center">
              <FormInput
                value={newTag.value.get()}
                onChangeText={(text) => newTag.value.set(text)}
                onSubmitEditing={addTag}
                placeholder="Add tag"
                className="flex-1"
              />
              <TouchableOpacity
                onPress={addTag}
                className="ml-2 px-4 py-3 bg-violet-500 rounded-xl"
              >
                <Plus size={24} color="white" />
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
                  <XCircle size={16} color="#6B7280" />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Notes */}
          <View>
            <FormLabel label="Notes" />
            <FormInput
              value={transactionData.notes.get()}
              onChangeText={(text) => transactionData.notes.set(text)}
              placeholder="Enter notes"
              multiline
              numberOfLines={4}
            />
          </View>

          {/* Essential Toggle */}
          <View className="flex-row items-center justify-between">
            <FormLabel label="Essential Transaction" />
            <Switch
              value={transactionData.isEssential.get()}
              onValueChange={(value) => transactionData.isEssential.set(value)}
              trackColor={{ false: "#767577", true: "#8B5CF6" }}
              thumbColor={transactionData.isEssential.get() ? "#FFFFFF" : "#F4F3F4"}
            />
          </View>

          {/* Recurring Toggle */}
          <View className="flex-row items-center justify-between">
            <FormLabel label="Recurring Transaction" />
            <Switch
              value={recurring.get()}
              onValueChange={(value) => recurring.set(value)}
              trackColor={{ false: "#767577", true: "#8B5CF6" }}
              thumbColor={recurring.get() ? "#FFFFFF" : "#F4F3F4"}
            />
          </View>

          {/* Recurrence Frequency (only show if recurring is true) */}
          {recurring.get() && (
            <View>
              <FormLabel label="Recurrence Frequency" />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row flex-wrap -mx-1">
                {recurrenceOptions.map((frequency) => (
                  <TouchableOpacity
                    key={frequency}
                    onPress={() => transactionData.recurrence.frequency.set(frequency)}
                    className={`m-1 px-4 py-2 rounded-full ${
                      transactionData.recurrence.frequency.get() === frequency
                        ? 'bg-violet-500'
                        : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  >
                    <Text
                      className={
                        transactionData.recurrence.frequency.get() === frequency
                          ? 'text-white font-amedium'
                          : 'text-gray-800 font-amedium dark:text-gray-200'
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
              <Text className="text-gray-700 dark:text-gray-300 font-amedium">Cancel</Text>
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

