import { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Platform } from 'react-native';
// import { useStore } from 'src/store/useStore';
import { Category, Budget } from 'src/types/transaction';
import { Car, Coffee, Copy, Flashlight, Gamepad2, Hotel, House, ShoppingCart, Stethoscope, TrendingUp } from 'lucide-react-native';

const DEFAULT_CATEGORIES = [
  { name: 'Housing', icon: Hotel, color: '#4A90E2', type: 'expense' },
  { name: 'Transportation', icon: Car, color: '#50E3C2', type: 'expense' },
  { name: 'Food', icon: Coffee, color: '#F5A623', type: 'expense' },
  { name: 'Entertainment', icon: Gamepad2, color: '#D0021B', type: 'expense' },
  { name: 'Shopping', icon: ShoppingCart, color: '#9013FE', type: 'expense' },
  { name: 'Healthcare', icon: Stethoscope, color: '#4CAF50', type: 'expense' },
  { name: 'Utilities', icon: Flashlight, color: '#FF9800', type: 'expense' },
  { name: 'Salary', icon: Copy, color: '#2ECC71', type: 'income' },
  { name: 'Investments', icon: TrendingUp, color: '#3498DB', type: 'income' },
];

export default function Setup() {
  // const { addCategory, addBudget } = useStore();
  const [step, setStep] = useState(1);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [budgets, setBudgets] = useState<Record<string, number>>({});
  const [savingsGoal, setSavingsGoal] = useState('');
  const [budgetPeriod, setBudgetPeriod] = useState<'weekly' | 'monthly' | 'yearly'>('monthly');

  const addCategory =()=>{}
  const addBudget =()=>{}
  const handleCategoryToggle = (categoryName: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryName)
        ? prev.filter(c => c !== categoryName)
        : [...prev, categoryName]
    );
  };

  const handleBudgetChange = (category: string, amount: string) => {
    setBudgets(prev => ({
      ...prev,
      [category]: parseFloat(amount) || 0,
    }));
  };

  const handleComplete = () => {
    // Add selected categories
    selectedCategories.forEach(categoryName => {
      const defaultCategory = DEFAULT_CATEGORIES.find(c => c.name === categoryName);
      if (defaultCategory) {
        const category: Category = {
          id: Date.now().toString() + categoryName,
          name: categoryName,
          icon: defaultCategory.icon,
          color: defaultCategory.color,
          type: defaultCategory.type,
          isCustom: false,
        };
        addCategory(category);

        // Add budget if set
        if (budgets[categoryName]) {
          const budget: Budget = {
            id: Date.now().toString() + categoryName,
            categoryId: category.id,
            amount: budgets[categoryName],
            period: budgetPeriod,
            startDate: new Date(),
            endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
          };
          addBudget(budget);
        }
      }
    });
  };

  return (
    <ScrollView className="flex-1 bg-white dark:bg-gray-700">
      <View className="p-4">
        <Text className="text-3xl font-amedium text-black dark:text-white mb-6">
          Financial Setup
        </Text>

        {/* Step 1: Category Selection */}
        <View className="mb-8">
          <Text className="text-lg font-rmedium text-black dark:text-white mb-4">
            1. Select Your Categories
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {DEFAULT_CATEGORIES.map(category => (
              <TouchableOpacity
                key={category.name}
                onPress={() => handleCategoryToggle(category.name)}
                className={`flex-row items-center p-3 rounded-lg ${
                  selectedCategories.includes(category.name)
                    ? 'bg-gray-700'
                    : 'bg-gray-100 dark:bg-gray-800'
                }`}
              >
                <category.icon
                  size={20}
                  color={selectedCategories.includes(category.name) ? 'white' : category.color}
                />
                <Text
                  className={`ml-2 font-rregular ${
                    selectedCategories.includes(category.name)
                      ? 'text-white'
                      : 'text-black dark:text-white'
                  }`}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Step 2: Budget Period */}
        <View className="mb-8">
          <Text className="text-lg font-rmedium text-black dark:text-white mb-4">
            2. Select Budget Period
          </Text>
          <View className="flex-row gap-2">
            {(['weekly', 'monthly', 'yearly'] as const).map(period => (
              <TouchableOpacity
                key={period}
                onPress={() => setBudgetPeriod(period)}
                className={`flex-1 p-3 rounded-lg ${
                  budgetPeriod === period
                    ? 'bg-gray-500'
                    : 'bg-gray-100 dark:bg-gray-800'
                }`}
              >
                <Text
                  className={`text-center font-aregular text-sm ${
                    budgetPeriod === period
                      ? 'text-white'
                      : 'text-black dark:text-white'
                  }`}
                >
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Step 3: Budget Allocation */}
        <View className="mb-8">
          <Text className="text-lg font-rmedium text-black dark:text-white mb-4">
            3. Set Category Budgets
          </Text>
          {selectedCategories.map(category => (
            <View key={category} className="mb-4">
              <Text className="text-black dark:text-white font-aregular mb-2">{category}</Text>
              <TextInput
                className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg font-rregular text-black dark:text-white"
                keyboardType="numeric"
                placeholder={`Enter ${budgetPeriod} budget for ${category}`}
                placeholderTextColor="#999"
                onChangeText={(value) => handleBudgetChange(category, value)}
                value={budgets[category]?.toString() || ''}
              />
            </View>
          ))}
        </View>

        {/* Step 4: Savings Goal */}
        <View className="mb-8">
          <Text className="text-lg font-rmedium text-black dark:text-white mb-4">
            4. Set Savings Goal
          </Text>
          <TextInput
            className="bg-gray-100 dark:bg-gray-800 font-rregular p-3 rounded-lg text-black dark:text-white mb-2"
            keyboardType="numeric"
            placeholder="Enter your savings goal"
            placeholderTextColor="#999"
            value={savingsGoal}
            onChangeText={setSavingsGoal}
          />
        </View>

        {/* Complete Setup Button */}
        <TouchableOpacity
          onPress={handleComplete}
          className="bg-gray-500 p-4 rounded-lg"
        >
          <Text className="text-white text-center font-rmedium ">
            Complete Setup
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}