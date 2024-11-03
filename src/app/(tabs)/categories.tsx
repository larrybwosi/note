import { observer } from '@legendapp/state/react';
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import useFinanceStore, {
  CategoryGroup,
  ExpenseGroup,
  IncomeCategory,
  CategoryType,
  Category
} from 'src/finance/unified';

// Enhanced category options with descriptions
const INCOME_CATEGORIES = {
  [IncomeCategory.SALARY]: {
    icon: '💰',
    description: 'Regular employment income, wages, and bonuses',
  },
  [IncomeCategory.INVESTMENTS]: {
    icon: '📈',
    description: 'Returns from stocks, bonds, real estate, and other investments',
  },
  [IncomeCategory.BUSINESS]: {
    icon: '🏢',
    description: 'Income from business operations and side hustles',
  },
  [IncomeCategory.SIDE_HUSTLE]: {
    icon: '💻',
    description: 'Income from freelance work and consulting',
  },
  [IncomeCategory.GIFTS]: {
    icon: '🎁',
    description: 'Monetary gifts and inheritance',
  },
  [IncomeCategory.OTHER]: {
    icon: '🔄',
    description: 'Other miscellaneous income sources',
  },
};

const EXPENSE_CATEGORIES = {
  [ExpenseGroup.HOUSING]: {
    icon: '🏠',
    description: 'Rent, mortgage, utilities, and home maintenance',
  },
  [ExpenseGroup.TRANSPORTATION]: {
    icon: '🚗',
    description: 'Car payments, fuel, public transit, and maintenance',
  },
  [ExpenseGroup.FOOD]: {
    icon: '🍔',
    description: 'Groceries, dining out, and food delivery',
  },
  [ExpenseGroup.UTILITIES]: {
    icon: '⚡',
    description: 'Electricity, water, internet, and phone bills',
  },
  [ExpenseGroup.ENTERTAINMENT]: {
    icon: '🎮',
    description: 'Movies, games, streaming services, and hobbies',
  },
  [ExpenseGroup.HEALTHCARE]: {
    icon: '💊',
    description: 'Medical bills, insurance, and medications',
  },
  [ExpenseGroup.DEBT]: {
    icon: '💳',
    description: 'Credit card payments, loans, and other debt',
  },
  [ExpenseGroup.INSURANCE]: {
    icon: '🛡️',
    description: 'Health, life, home, and vehicle insurance',
  },
  [ExpenseGroup.SHOPPING]: {
    icon: '🛍️',
    description: 'Clothing, electronics, and general shopping',
  },
  [ExpenseGroup.OTHER]: {
    icon: '📦',
    description: 'Miscellaneous expenses and one-time purchases',
  },
};

const COLORS = [
  '#6366F1', // Indigo
  '#EC4899', // Pink
  '#14B8A6', // Teal
  '#F59E0B', // Amber
  '#8B5CF6', // Purple
  '#10B981', // Emerald
  '#EF4444', // Red
  '#3B82F6', // Blue
  '#F97316', // Orange
];

interface CategoryFormProps {
  onSuccess?: (category: Category) => void;
  onCancel?: () => void;
  initialData?: Partial<Category>;
}

const CategoryForm: React.FC<CategoryFormProps> = observer(({
  onSuccess,
  onCancel,
  initialData,
}) => {
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [formData, setFormData] = useState<Partial<Category>>({
    name: '',
    icon: '📊',
    color: COLORS[0],
    group: CategoryGroup.EXPENSE,
    type: CategoryType.CUSTOM,
    budgetPercentage: 0,
    monthlyLimit: 0,
    warningThreshold: 80,
    ...initialData,
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { store, addCustomCategory, getCategoriesByGroup } = useFinanceStore();

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name) newErrors.name = 'Category name is required';
    if (!formData.icon) newErrors.icon = 'Please select an icon';
    if (!formData.color) newErrors.color = 'Please select a color';
    if (formData.monthlyLimit && formData.monthlyLimit < 0) {
      newErrors.monthlyLimit = 'Budget limit must be positive';
    }
    if (formData.warningThreshold && (formData.warningThreshold < 0 || formData.warningThreshold > 100)) {
      newErrors.warningThreshold = 'Warning threshold must be between 0 and 100';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (name: keyof Category, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'subgroup') {
      const categoryInfo = formData.group === CategoryGroup.INCOME
        ? INCOME_CATEGORIES[value as IncomeCategory]
        : EXPENSE_CATEGORIES[value as ExpenseGroup];
      
      if (categoryInfo) {
        setFormData(prev => ({
          ...prev,
          icon: categoryInfo.icon,
          metadata: {
            ...prev.metadata,
            description: categoryInfo.description,
          },
        }));
      }
    }
  };

  const handleCategorySelect = async (categoryKey: string, info: typeof INCOME_CATEGORIES[keyof typeof INCOME_CATEGORIES]) => {
    if (categoryKey === 'CUSTOM') {
      setShowCustomForm(true);
      return;
    }

    try {
      const newCategory: Omit<Category, 'id' | 'isDefault' | 'isArchived'> = {
        name: categoryKey,
        icon: info.icon,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        group: formData.group!,
        type: CategoryType.CUSTOM,
        subgroup: categoryKey as ExpenseGroup | IncomeCategory,
        metadata: {
          description: info.description,
        },
      };

      const category = await addCustomCategory(newCategory);
      onSuccess?.(category);
      Alert.alert('Success', 'Category added successfully!');
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to add category. Please try again.');
    }
  };

  const handleSubmit = useCallback(async () => {
    if (validateForm()) {
      try {
        const category = await addCustomCategory(formData as Omit<Category, 'id' | 'isDefault' | 'isArchived'>);
        onSuccess?.(category);
        setShowCustomForm(false);
        Alert.alert('Success', 'Custom category created successfully!');
      } catch (error) {
        Alert.alert('Error', 'Failed to create category. Please try again.');
      }
    }
  }, [formData, addCustomCategory, onSuccess]);

  const renderSubgroupOptions = () => {
    const categoryOptions = formData.group === CategoryGroup.INCOME
      ? INCOME_CATEGORIES
      : EXPENSE_CATEGORIES;

    return (
      <View className="gap-2 mt-2">
        {Object.entries(categoryOptions).map(([key, value]) => (
          <TouchableOpacity
            key={key}
            onPress={() => handleCategorySelect(key, value)}
            className={`p-4 rounded-lg border ${
              formData.subgroup === key
                ? 'bg-indigo-50 border-indigo-600'
                : 'bg-white border-gray-300'
            }`}
          >
            <View className="flex-row items-center">
              <Text className="text-xl mr-2">{value.icon}</Text>
              <View className="flex-1">
                <Text className={`text-sm font-rbold ${
                  formData.subgroup === key ? 'text-indigo-600' : 'text-gray-900'
                }`}>
                  {key}
                </Text>
                <Text className="text-xs text-gray-500 mt-1">
                  {value.description}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
        
        <TouchableOpacity
          onPress={() => handleCategorySelect('CUSTOM', {
            icon: '➕',
            description: 'Create a custom category'
          })}
          className="p-4 rounded-lg border border-dashed border-gray-300"
        >
          <View className="flex-row items-center">
            <Text className="text-xl mr-2">➕</Text>
            <Text className="text-sm font-rbold text-gray-900">
              Create Custom Category
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const renderExistingCategories = () => {
    const categories = getCategoriesByGroup(formData.group!);
    
    return (
      <View className="mt-8">
        <Text className="text-lg font-rbold text-gray-900 mb-4">
          Existing Categories
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {categories.map((category, index) => (
            <View
              key={index}
              className="p-3 rounded-lg border border-gray-300 bg-white"
            >
              <View className="flex-row items-center">
                <Text className="text-xl mr-2">{category.icon}</Text>
                <View>
                  <Text className="text-sm font-rbold text-gray-900">
                    {category.name}
                  </Text>
                  {category.monthlyLimit && (
                    <Text className="text-xs text-gray-500">
                      Budget: ${category.monthlyLimit}
                    </Text>
                  )}
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  };

  return (
    <ScrollView
      className="flex-1 bg-white"
      contentContainerStyle={{ padding: 24, paddingBottom: 80 }}
    >
      <Text className="text-2xl font-rbold text-gray-900 mb-6">
        Categories
      </Text>

      <View className="mb-6">
        <Text className="text-sm font-rmedium text-gray-700 mb-1">
          Category Type
        </Text>
        <View className="flex-row gap-4">
          {Object.values(CategoryGroup).map((group) => (
            <TouchableOpacity
              key={group}
              onPress={() => handleChange('group', group)}
              className={`flex-1 py-3 rounded-lg border ${
                formData.group === group
                  ? 'bg-indigo-600 border-indigo-600'
                  : 'bg-white border-gray-300'
              }`}
            >
              <Text className={`text-center font-medium ${
                formData.group === group ? 'text-white' : 'text-gray-700'
              }`}>
                {group}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {!showCustomForm ? (
        <>
          <View className="mb-6">
            <Text className="text-sm font-rmedium text-gray-700 mb-1">
              Select Category
            </Text>
            {renderSubgroupOptions()}
          </View>
          {renderExistingCategories()}
        </>
      ) : (
        <>
          <View className="mb-6">
            <Text className="text-sm font-rmedium text-gray-700 mb-1">
              Category Name
            </Text>
            <TextInput
              className={`px-4 py-3 rounded-lg border ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              } bg-white text-gray-900`}
              placeholder="Enter category name"
              onChangeText={(value) => handleChange('name', value)}
              value={formData.name}
            />
            {errors.name && (
              <Text className="mt-1 text-sm text-red-500">{errors.name}</Text>
            )}
          </View>

          <View className="mb-6">
            <Text className="text-sm font-rmedium text-gray-700 mb-1">
              Accent Color
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {COLORS.map((color) => (
                <TouchableOpacity
                  key={color}
                  onPress={() => handleChange('color', color)}
                  className={`w-12 h-12 rounded-full border-2 ${
                    formData.color === color ? 'border-black' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </View>
          </View>

          <View className="mb-6">
            <Text className="text-sm font-rmedium text-gray-700 mb-1">
              Monthly Budget Limit (Optional)
            </Text>
            <TextInput
              className="px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900"
              placeholder="Enter monthly budget limit"
              keyboardType="numeric"
              onChangeText={(text) => handleChange('monthlyLimit', parseFloat(text) || 0)}
              value={formData.monthlyLimit?.toString()}
            />
          </View>

          <View className="mb-6">
            <Text className="text-sm font-rmedium text-gray-700 mb-1">
              Warning Threshold % (Optional)
            </Text>
            <TextInput
              className="px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900"
              placeholder="Enter warning threshold (0-100)"
              keyboardType="numeric"
              onChangeText={(text) => handleChange('warningThreshold', parseFloat(text) || 0)}
              value={formData.warningThreshold?.toString()}
            />
          </View>

          <View className="flex-row gap-4 mt-6">
            <TouchableOpacity
              onPress={() => setShowCustomForm(false)}
              className="flex-1 py-3 rounded-lg border border-gray-300"
            >
              <Text className="text-center text-gray-700 font-plregular">
                Back
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSubmit}
              className="flex-1 py-3 rounded-lg bg-indigo-600"
            >
              <Text className="text-center text-white font-plregular">
                Create Category
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </ScrollView>
  );
});

export default observer(CategoryForm);