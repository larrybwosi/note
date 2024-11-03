import React, { useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { ExpenseCategory, ExpenseEntry, expenseStore } from 'src/storage';
import { observer } from '@legendapp/state/react';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

export const EXPENSE_CATEGORIES = [
  'Food',
  'Investments',
  'Entertainment',
  'Transport',
  'Utilities',
  'Healthcare',
  'Debts',
  'Shopping',
  'Personal',
];

const CATEGORY_ICONS = {
  'Food': 'restaurant',
  'Investments': 'trending-up',
  'Entertainment': 'film',
  'Transport': 'car',
  'Utilities': 'build',
  'Healthcare': 'medical',
  'Debts': 'card',
  'Shopping': 'cart',
  'Personal': 'person',
};

const NewExpenseForm = observer(() => {
  const navigation = useNavigation();
  
  useFocusEffect(
    useCallback(() => {
      navigation.getParent()?.setOptions({
        tabBarStyle: { display: 'none' },
      });
      return () => {
        navigation.getParent()?.setOptions({
          tabBarStyle: undefined,
        });
      };
    }, [navigation])
  );

  const handleAddExpense = useCallback(() => {
    const newExpenseData = expenseStore.newExpense.get()
    if (newExpenseData.description && newExpenseData.amount) {
      expenseStore.expenseData.set([...expenseStore.expenseData.get(), {
        id: Math.max(...expenseStore.expenseData.get().map(e => e.id), 0) + 1,
        ...newExpenseData as Omit<ExpenseEntry, 'id'>,
      }])
      expenseStore.showNewExpenseForm.set(false)
      expenseStore.newExpense.set({
        date: format(new Date(), 'yyyy-MM-dd'),
        time: format(new Date(), 'HH:mm'),
        category: 'Food',
        status: 'Pending',
        isRecurring: false
      })
    }
  }, [])

  return (
    <View className="p-6 rounded-lg bg-white dark:bg-gray-800 shadow-lg mb-5 pb-3">
      <View className="flex-row items-center mb-6">
        <Ionicons name="add-circle" size={32} color="#3b82f6" className="mr-3" />
        <Text className="text-2xl font-rbold text-gray-800 dark:text-gray-100">
          Add New Expense
        </Text>
      </View>
      
      <View className="space-y-5">
        <View>
          <Text className="text-sm font-plregular text-gray-700 dark:text-gray-300 mb-2">
            Description
          </Text>
          <View className="flex-row items-center">
            <Ionicons name="document-text" size={24} color="#6b7280" className="mr-3" />
            <TextInput
              value={expenseStore.newExpense.description.get()}
              onChangeText={(text) => expenseStore.newExpense.description.set(text)}
              placeholder="Enter expense description"
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-700"
            />
          </View>
        </View>

        <View>
          <Text className="text-sm font-plregular text-gray-700 dark:text-gray-300 mb-2">
            Amount
          </Text>
          <View className="flex-row items-center">
            <Ionicons name="cash" size={24} color="#6b7280" className="mr-3" />
            <TextInput
              value={expenseStore.newExpense.amount.get()?.toString()}
              onChangeText={(text) => expenseStore.newExpense.amount.set(parseFloat(text) || 0)}
              placeholder="Enter amount"
              keyboardType="numeric"
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-700"
            />
          </View>
        </View>

        <View>
          <Text className="text-sm font-plregular text-gray-700 dark:text-gray-300 mb-3">
            Category
          </Text>
          <View className="flex-row flex-wrap -m-1">
            {EXPENSE_CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category}
                onPress={() => expenseStore.newExpense.category.set(category as ExpenseCategory)}
                className={`m-1 px-4 py-2 rounded-full flex-row items-center ${
                  expenseStore.newExpense.category.get() === category
                    ? 'bg-blue-500'
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <Ionicons 
                  name={CATEGORY_ICONS[category]} 
                  size={20} 
                  color={expenseStore.newExpense.category.get() === category ? 'white' : '#6b7280'} 
                  className="mr-2" 
                />
                <Text
                  className={
                    expenseStore.newExpense.category.get() === category
                      ? 'text-white font-rregular'
                      : 'text-gray-800 dark:text-gray-200 font-rregular'
                  }
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View className="flex-row justify-end space-x-3 mt-6 gap-3">
          <TouchableOpacity
            onPress={() => expenseStore.showNewExpenseForm.set(false)}
            className="px-6 py-3 bg-gray-200 dark:bg-gray-700 rounded-lg ml-4 flex-row items-center"
          >
            <Ionicons name="close-circle" size={20} color="#6b7280" className="mr-2" />
            <Text className="text-gray-800 dark:text-gray-200 font-plregular">
              Cancel
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleAddExpense}
            className="px-6 py-3 bg-blue-500 rounded-lg flex-row items-center"
          >
            <Ionicons name="checkmark-circle" size={20} color="white" className="mr-2" />
            <Text className="text-white font-plregular">
              Add Expense
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
})

export default NewExpenseForm;