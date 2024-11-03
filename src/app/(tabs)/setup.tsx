import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { observer, useObservable } from '@legendapp/state/react';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { observable } from '@legendapp/state';

const PRESET_COLORS = [
  '#6366F1', // Indigo
  '#EC4899', // Pink
  '#22C55E', // Green
  '#F59E0B', // Amber
  '#3B82F6', // Blue
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#14B8A6', // Teal
];

const INCOME_ICONS = [
  { name: 'wallet', label: 'Wallet' },
  { name: 'cash', label: 'Cash' },
  { name: 'briefcase', label: 'Salary' },
  { name: 'business', label: 'Business' },
  { name: 'gift', label: 'Gift' },
  { name: 'trending-up', label: 'Investment' },
  { name: 'home', label: 'Rent' },
  { name: 'card', label: 'Royalty' },
];

const EXPENSE_ICONS = [
  { name: 'cart', label: 'Shopping' },
  { name: 'car', label: 'Transport' },
  { name: 'home', label: 'Housing' },
  { name: 'restaurant', label: 'Food' },
  { name: 'medical', label: 'Healthcare' },
  { name: 'school', label: 'Education' },
  { name: 'airplane', label: 'Travel' },
  { name: 'game-controller', label: 'Entertainment' },
  { name: 'fitness', label: 'Fitness' },
  { name: 'phone-portrait', label: 'Utilities' },
];

const FREQUENCIES = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'annually', label: 'Annually' },
];


interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  isRecurring: boolean;
}

interface RecurringExpense {
  id: string;
  amount: number;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually';
  startDate: Date;
  endDate: Date | null;
  categoryId: string;
}

// Store
const store = observable({
  incomeCategories: [] as Category[],
  expenseCategories: [] as Category[],
  recurringExpenses: [] as RecurringExpense[],
});

// Placeholder data
const placeholderCategories: Category[] = [
  { id: '1', name: 'Salary', icon: 'cash', color: '#4CAF50', isRecurring: true },
  { id: '2', name: 'Groceries', icon: 'cart', color: '#2196F3', isRecurring: false },
];


const SetupComponent: React.FC = () => {
  const state = observable({
    newCategory: {
      name: '',
      icon: 'add-circle',
      color: '#000000',
      isIncome: true,
    },
    newRecurringExpense: {
      amount: 0,
      frequency: 'monthly' as RecurringExpense['frequency'],
      startDate: new Date(),
      endDate: null as Date | null,
      categoryId: '',
    },
    showColorPicker: false,
    showIconPicker: false,
    showDatePicker: false,
    showFrequencyModal: false,
    datePickerMode: 'start' as 'start' | 'end',
  });
  
  console.log(state)
  const [demoMode, setDemoMode] = useState(false);

  const addCategory = () => {
    const newCategory: Category = {
      id: Date.now().toString(),
      name: state.newCategory.name.get(),
      icon: state.newCategory.icon.get(),
      color: state.newCategory.color.get(),
      isRecurring: false,
    };

    if (state.newCategory.isIncome.get()) {
      store.incomeCategories.push(newCategory);
    } else {
      store.expenseCategories.push(newCategory);
    }

    // Reset form
    state.newCategory.set({
      name: '',
      icon: 'add-circle',
      color: '#000000',
      isIncome: true,
    });
  };

  const addRecurringExpense = () => {
    const newRecurringExpense: RecurringExpense = {
      id: Date.now().toString(),
      amount: state.newRecurringExpense.amount.get(),
      frequency: state.newRecurringExpense.frequency.get(),
      startDate: state.newRecurringExpense.startDate.get(),
      endDate: state.newRecurringExpense.endDate.get(),
      categoryId: state.newRecurringExpense.categoryId.get(),
    };

    store.recurringExpenses.push(newRecurringExpense);

    // Reset form
    state.newRecurringExpense.set({
      amount: 0,
      frequency: 'monthly',
      startDate: new Date(),
      endDate: null,
      categoryId: '',
    });
  };

  const renderIconGrid = (icons: { name: string; label: string }[]) => (
    <View className="flex-row flex-wrap justify-between px-2">
      {icons.map((icon) => (
        <TouchableOpacity
          key={icon.name}
          className={`w-1/4 p-2 items-center mb-4`}
          onPress={() => {
            state.newCategory.icon.set(icon.name);
            state.showIconPicker.set(false);
          }}
        >
          <View 
            className={`w-12 h-12 rounded-full items-center justify-center mb-1`}
            style={{ backgroundColor: state.newCategory.color.get() }}
          >
            <Ionicons name={icon.name as any} size={24} color="white" />
          </View>
          <Text className="text-xs text-center text-gray-600 dark:text-gray-400">
            {icon.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <View className="px-6 py-8">
        {/* Header Section */}
        <View className="mb-8">
          <Text className="text-3xl font-rbold text-gray-900 dark:text-white mb-4">
            Finance Tracker Setup
          </Text>
          <Text className="text-base font-rregular text-gray-600 dark:text-gray-300 leading-relaxed">
            Welcome to your personalized finance tracker! Let's set up your categories and recurring expenses for better financial management.
          </Text>
        </View>

        {/* Add Category Section */}
        <View className="bg-white dark:bg-gray-800 rounded-2xl p-6 mb-6 shadow-lg">
          <Text className="text-xl font-rmedium text-gray-900 dark:text-white mb-6">
            Add New Category
          </Text>
          
          {/* Category Type Selection - Move to top */}
          <View className="mb-6">
            <View className="flex-row bg-gray-100 dark:bg-gray-700 p-1 rounded-xl">
              <TouchableOpacity
                className={`flex-1 py-3 rounded-lg ${
                  state.newCategory.isIncome.get() 
                    ? 'bg-white dark:bg-gray-600 shadow-sm' 
                    : 'bg-transparent'
                }`}
                onPress={() => state.newCategory.isIncome.set(true)}
              >
                <Text 
                  className={`text-center font-rmedium ${
                    state.newCategory.isIncome.get()
                      ? 'text-gray-900 dark:text-white'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  Income
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 py-3 rounded-lg ${
                  !state.newCategory.isIncome.get()
                    ? 'bg-white dark:bg-gray-600 shadow-sm'
                    : 'bg-transparent'
                }`}
                onPress={() => state.newCategory.isIncome.set(false)}
              >
                <Text
                  className={`text-center font-rmedium ${
                    !state.newCategory.isIncome.get()
                      ? 'text-gray-900 dark:text-white'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  Expense
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Category Name Input */}
          <View className="mb-6">
            <Text className="text-sm font-rmedium text-gray-700 dark:text-gray-300 mb-2">
              Category Name
            </Text>
            <TextInput
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white"
              placeholder="Enter category name"
              placeholderTextColor="#9CA3AF"
              value={state.newCategory.name.get()}
              onChangeText={(text) => state.newCategory.name.set(text)}
            />
          </View>

          {/* Icon Selection */}
          <View className="mb-6">
            <Text className="text-sm font-rmedium text-gray-700 dark:text-gray-300 mb-4">
              Choose Icon
            </Text>
            <Modal
              visible={state.showIconPicker.get()}
              transparent={true}
              animationType="slide"
            >
              <View className="flex-1 bg-black/50">
                <View className="mt-auto bg-white dark:bg-gray-800 rounded-t-3xl p-6">
                  <View className="flex-row justify-between items-center mb-6">
                    <Text className="text-xl font-rmedium text-gray-900 dark:text-white">
                      Select Icon
                    </Text>
                    <TouchableOpacity
                      onPress={() => state.showIconPicker.set(false)}
                      className="p-2"
                    >
                      <Ionicons name="close" size={24} color="#9CA3AF" />
                    </TouchableOpacity>
                  </View>
                  <ScrollView className="max-h-96">
                    {renderIconGrid(state.newCategory.isIncome.get() ? INCOME_ICONS : EXPENSE_ICONS)}
                  </ScrollView>
                </View>
              </View>
            </Modal>

            <TouchableOpacity
              className="flex-row items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600"
              onPress={() => state.showIconPicker.set(true)}
            >
              <Text className="text-gray-700 dark:text-gray-300">Select an Icon</Text>
              <View 
                className="w-8 h-8 rounded-full items-center justify-center"
                style={{ backgroundColor: state.newCategory.color.get() }}
              >
                <Ionicons 
                  name={state.newCategory.icon.get() as any} 
                  size={20} 
                  color="white"
                />
              </View>
            </TouchableOpacity>
          </View>

          {/* Color Picker */}
          <View className="mb-6">
            <Text className="text-sm font-rmedium text-gray-700 dark:text-gray-300 mb-4">
              Choose Color
            </Text>
            <View className="flex-row flex-wrap justify-center -mx-2">
              {PRESET_COLORS.map((color) => (
                <TouchableOpacity
                  key={color}
                  className="m-2 p-1.5 rounded-full border-2 border-transparent"
                  style={{
                    borderColor: state.newCategory.color.get() === color ? color : 'transparent',
                  }}
                  onPress={() => state.newCategory.color.set(color)}
                >
                  <View 
                    className="w-10 h-10 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Add Button */}
          <TouchableOpacity
            className="bg-indigo-600 active:bg-indigo-700 py-4 rounded-xl shadow-sm"
            onPress={addCategory}
          >
            <Text className="text-white font-rmedium text-center text-lg">
              Add Category
            </Text>
          </TouchableOpacity>
        </View>

        {/* Recurring Expense Section */}
        <View className="bg-white dark:bg-gray-800 rounded-2xl p-6 mb-6 shadow-lg">
          <Text className="text-xl font-rbold text-gray-900 dark:text-white mb-6">
            Add Recurring Expense
          </Text>

          {/* Amount Input */}
          <View className="mb-6">
            <Text className="text-sm font-rmedium text-gray-700 dark:text-gray-300 mb-2">
              Amount
            </Text>
            <View className="flex-row items-center">
              <Text className="text-lg text-gray-700 dark:text-gray-300 mr-2">$</Text>
              <TextInput
                className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white text-lg"
                placeholder="0.00"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                value={state.newRecurringExpense.amount.get().toString()}
                onChangeText={(text) => state.newRecurringExpense.amount.set(parseFloat(text) || 0)}
              />
            </View>
          </View>

          {/* Frequency Modal */}
          <Modal
            visible={state.showFrequencyModal.get()}
            transparent={true}
            animationType="slide"
          >
            <View className="flex-1 bg-black/50">
              <View className="mt-auto bg-white dark:bg-gray-800 rounded-t-3xl p-6">
                <View className="flex-row justify-between items-center mb-6">
                  <Text className="text-xl font-rmedium text-gray-900 dark:text-white">
                    Select Frequency
                  </Text>
                  <TouchableOpacity
                    onPress={() => state.showFrequencyModal.set(false)}
                    className="p-2"
                  >
                    <Ionicons name="close" size={24} color="#9CA3AF" />
                  </TouchableOpacity>
                </View>
                {FREQUENCIES.map((freq) => (
                  <TouchableOpacity
                    key={freq.value}
                    className="py-4 border-b border-gray-100 dark:border-gray-700"
                    onPress={() => {
                      state.newRecurringExpense.frequency.set(freq.value as any);
                      state.showFrequencyModal.set(false);
                    }}
                  >
                    <Text className="text-lg text-gray-700 dark:text-gray-300">
                      {freq.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </Modal>

          {/* Frequency Picker */}
          <TouchableOpacity
            className="mb-6 px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600"
            onPress={() => state.showFrequencyModal.set(true)}
          >
            <Text className="text-gray-700 dark:text-gray-300 text-lg">
              {FREQUENCIES.find(f => f.value === state.newRecurringExpense.frequency.get())?.label || 'Select Frequency'}
            </Text>
          </TouchableOpacity>

          {/* Date Pickers */}
           <View className="space-y-4 mb-6">
            <View>
              <Text className="text-sm font-rmedium text-gray-700 dark:text-gray-300 mb-2">
                Start Date
              </Text>
              <TouchableOpacity
                className="px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600"
                onPress={() => {
                  state.showDatePicker.set(true);
                  state.datePickerMode.set('start');
                }}
              >
                <Text className="text-gray-700 dark:text-gray-300 text-lg">
                  {state.newRecurringExpense.startDate.get().toLocaleDateString()}
                </Text>
              </TouchableOpacity>
            </View>

            <View>
              <Text className="text-sm font-rmedium text-gray-700 dark:text-gray-300 mb-2">
                End Date (Optional)
              </Text>
              <TouchableOpacity
                className="px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600"
                onPress={() => {
                  state.showDatePicker.set(true);
                  state.datePickerMode.set('end');
                }}
              >
                <Text className="text-gray-700 dark:text-gray-300 text-lg">
                  {state.newRecurringExpense.endDate.get()?.toLocaleDateString() || 'Until Cancelled'}
                </Text>
                </TouchableOpacity>
            </View>
          </View>

          {/* Add Button */}
          <TouchableOpacity
            className="bg-indigo-600 active:bg-indigo-700 py-4 rounded-xl shadow-sm"
            onPress={addRecurringExpense}
          >
            <Text className="text-white font-rmedium text-center text-lg">
              Add Recurring Expense
            </Text>
          </TouchableOpacity>
        </View>

        {/* Category Lists */}
        {store.incomeCategories.get().length > 0 && (
          <View className="bg-white dark:bg-gray-800 rounded-2xl p-6 mb-6 shadow-lg">
            <Text className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Income Categories
            </Text>
            {store.incomeCategories.get().map((category) => (
              <View 
                key={category.id} 
                className="flex-row items-center py-4 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
              >
                <View 
                  className="w-12 h-12 rounded-full items-center justify-center mr-4 shadow-sm"
                  style={{ backgroundColor: category.color }}
                >
                  <Ionicons name={category.icon as any} size={24} color="white" />
                </View>
                <View className="flex-1">
                  <Text className="text-gray-900 dark:text-white font-rmedium text-lg">
                    {category.name}
                  </Text>
                  <Text className="text-gray-500 dark:text-gray-400 text-sm">
                    {category.isRecurring ? 'Recurring' : 'One-time'}
                  </Text>
                </View>
                <TouchableOpacity className="p-2">
                  <Ionicons name="ellipsis-vertical" size={20} color="#9CA3AF" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {store.expenseCategories.get().length > 0 && (
          <View className="bg-white dark:bg-gray-800 rounded-2xl p-6 mb-6 shadow-lg">
            <Text className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Expense Categories
            </Text>
            {store.expenseCategories.get().map((category) => (
              <View 
                key={category.id} 
                className="flex-row items-center py-4 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
              >
                <View 
                  className="w-12 h-12 rounded-full items-center justify-center mr-4 shadow-sm"
                  style={{ backgroundColor: category.color }}
                >
                  <Ionicons name={category.icon as any} size={24} color="white" />
                </View>
                <View className="flex-1">
                  <Text className="text-gray-900 dark:text-white font-rmedium text-lg">
                    {category.name}
                  </Text>
                  <Text className="text-gray-500 dark:text-gray-400 text-sm">
                    {category.isRecurring ? 'Recurring' : 'One-time'}
                  </Text>
                </View>
                <TouchableOpacity className="p-2">
                  <Ionicons name="ellipsis-vertical" size={20} color="#9CA3AF" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Demo Mode Button */}
        <TouchableOpacity
          className={`py-4 rounded-xl mb-6 shadow-sm ${
            demoMode 
              ? 'bg-red-600 active:bg-red-700' 
              : 'bg-green-600 active:bg-green-700'
          }`}
          onPress={() => {
            setDemoMode(!demoMode);
            if (!demoMode) {
              store.incomeCategories.set(placeholderCategories);
              store.expenseCategories.set([]);
              store.recurringExpenses.set([]);
            } else {
              store.incomeCategories.set([]);
              store.expenseCategories.set([]);
              store.recurringExpenses.set([]);
            }
          }}
        >
          <View className="flex-row items-center justify-center">
            <Ionicons 
              name={demoMode ? 'exit-outline' : 'play-outline'} 
              size={24} 
              color="white" 
              style={{ marginRight: 8 }}
            />
            <Text className="text-white font-rmedium text-lg text-center">
              {demoMode ? 'Exit Demo Mode' : 'Enter Demo Mode'}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Date Picker Modal */}
      {state.showDatePicker.get() && (
        <View className="absolute inset-0 bg-black/50 items-center justify-center">
          <View className="bg-white dark:bg-gray-800 rounded-2xl p-6 mx-6 shadow-xl">
            <Text className="text-xl font-rmedium text-gray-900 dark:text-white mb-4">
              Select {state.datePickerMode.get() === 'start' ? 'Start' : 'End'} Date
            </Text>
            <DateTimePicker
              value={
                state.datePickerMode.get() === 'start'
                  ? state.newRecurringExpense.startDate.get()
                  : state.newRecurringExpense.endDate.get() || new Date()
              }
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                state.showDatePicker.set(false);
                if (selectedDate) {
                  if (state.datePickerMode.get() === 'start') {
                    state.newRecurringExpense.startDate.set(selectedDate);
                  } else {
                    state.newRecurringExpense.endDate.set(selectedDate);
                  }
                }
              }}
            />
            <TouchableOpacity
              className="mt-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-xl"
              onPress={() => state.showDatePicker.set(false)}
            >
              <Text className="text-center text-gray-700 dark:text-gray-300 font-rmedium">
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

export default observer(SetupComponent);