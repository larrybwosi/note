import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { TransactionType, Category, ExpenseGroup, IncomeCategory } from './ts';
import { ShoppingCart, Home, Utensils, Briefcase, DollarSign } from 'lucide-react-native';

interface CategorySelectorProps {
  transactionType: TransactionType;
  selectedCategory: Category | null;
  onSelectCategory: (category: Category) => void;
}

const expenseCategories: Category[] = Object.values(ExpenseGroup).map(name => ({ name, type: 'expense' }));
const incomeCategories: Category[] = Object.values(IncomeCategory).map(name => ({ name, type: 'income' }));

const getCategoryIcon = (name: string) => {
  switch (name) {
    case ExpenseGroup.SHOPPING:
      return <ShoppingCart size={24} color="#4B5563" />;
    case ExpenseGroup.HOUSING:
      return <Home size={24} color="#4B5563" />;
    case ExpenseGroup.FOOD:
      return <Utensils size={24} color="#4B5563" />;
    case IncomeCategory.SALARY:
    case IncomeCategory.BUSINESS:
      return <Briefcase size={24} color="#4B5563" />;
    default:
      return <DollarSign size={24} color="#4B5563" />;
  }
};

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  transactionType,
  selectedCategory,
  onSelectCategory,
}) => {
  const categories = transactionType === TransactionType.EXPENSE ? expenseCategories : incomeCategories;

  return (
    <View className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-6 shadow-sm">
      <Text className="text-lg font-rmedium text-gray-900 dark:text-white mb-4">Category</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category.name}
            className={`mr-4 items-center ${
              selectedCategory?.name === category.name ? 'opacity-100' : 'opacity-50'
            }`}
            onPress={() => onSelectCategory(category)}
          >
            <View className="bg-gray-100 dark:bg-gray-700 rounded-full p-3 mb-2">
              {getCategoryIcon(category.name)}
            </View>
            <Text className="text-sm font-rmedium text-gray-900 dark:text-white text-center">
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

