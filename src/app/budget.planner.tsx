import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
  Alert,
  Platform,
} from 'react-native';
import Animated, {
  FadeInDown,
  FadeIn,
  withSpring,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import {
  Wallet,
  PieChart,
  Sliders,
  Plus,
  Trash2,
  DollarSign,
  Sparkles,
  ArrowRight,
  Heart,
  TrendingUp,
  Lock,
  ArrowUpRight,
  AlertCircle,
  Info,
} from 'lucide-react-native';

// Types
type BudgetRule = '50-30-20' | 'custom' | 'zero-based' | '70-20-10';

interface Category {
  id: string;
  name: string;
  allocation: number;
  description?: string;
  color?: string;
  icon?: string;
}

interface BudgetRuleInfo {
  title: string;
  description: string;
  longDescription: string;
  color: string;
  icon: any;
  recommended?: boolean;
}

// Constants
const BUDGET_RULES: Record<BudgetRule, BudgetRuleInfo> = {
  '50-30-20': {
    title: '50/30/20 Rule',
    description: 'Classic balanced budgeting approach',
    longDescription:
      'Allocate 50% to needs, 30% to wants, and 20% to savings and debt repayment. Ideal for balanced financial management.',
    color: 'indigo',
    icon: PieChart,
    recommended: true,
  },
  'custom': {
    title: 'Custom Split',
    description: 'Personalized budget allocation',
    longDescription:
      'Create your own custom budget splits based on your unique financial situation and goals.',
    color: 'purple',
    icon: Sliders,
  },
  'zero-based': {
    title: 'Zero-Based Budget',
    description: 'Every dollar has a purpose',
    longDescription:
      'Assign every dollar of income to specific categories, ensuring purposeful spending and maximum control.',
    color: 'emerald',
    icon: DollarSign,
  },
  '70-20-10': {
    title: '70/20/10 Rule',
    description: 'Simplified money management',
    longDescription:
      '70% for monthly expenses, 20% for savings, and 10% for debt/donations. Perfect for beginners.',
    color: 'blue',
    icon: TrendingUp,
  },
};

// Custom Components
const InfoCard: React.FC<{ title: string; description: string }> = ({ title, description }) => (
  <Animated.View entering={FadeIn.delay(300)} className="bg-blue-50 p-4 rounded-xl mb-4">
    <View className="flex-row items-start">
      <Info size={20} color="#3b82f6" />
      <View className="ml-3 flex-1">
        <Text className="font-semibold text-gray-800">{title}</Text>
        <Text className="text-gray-600 mt-1 text-sm">{description}</Text>
      </View>
    </View>
  </Animated.View>
);

const BudgetRuleCard: React.FC<{
  rule: BudgetRule;
  info: BudgetRuleInfo;
  selected: boolean;
  onSelect: () => void;
}> = ({ rule, info, selected, onSelect }) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onSelect}
        className={`p-5 rounded-xl mb-4 border-2 ${
          selected ? `border-${info.color}-500 bg-${info.color}-50` : 'border-gray-200'
        }`}
      >
        <View className="flex-row items-start">
          <View className={`bg-${info.color}-100 p-3 rounded-xl`}>
            <info.icon size={24} color={`#${selected ? '3b82f6' : '6b7280'}`} />
          </View>
          <View className="ml-3 flex-1">
            <View className="flex-row items-center">
              <Text
                className={`font-bold text-lg ${
                  selected ? `text-${info.color}-800` : 'text-gray-800'
                }`}
              >
                {info.title}
              </Text>
              {info.recommended && (
                <View className="bg-green-100 px-2 py-1 rounded-full ml-2">
                  <Text className="text-green-800 text-xs font-medium">Recommended</Text>
                </View>
              )}
            </View>
            <Text className="text-gray-600 mt-1">{info.description}</Text>
            <Text className="text-gray-500 text-sm mt-2">{info.longDescription}</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const CategoryInput: React.FC<{
  category: Category;
  onUpdate: (category: Category) => void;
  onDelete: () => void;
}> = ({ category, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);

  const validateAllocation = (value: string) => {
    const num = parseInt(value);
    if (isNaN(num) || num < 0 || num > 100) {
      Alert.alert('Invalid Percentage', 'Please enter a number between 0 and 100');
      return category.allocation;
    }
    return num;
  };

  return (
    <Animated.View
      entering={FadeInDown}
      className="bg-white shadow-sm border border-gray-100 p-4 rounded-xl mb-3"
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          {isEditing ? (
            <TextInput
              value={category.name}
              onChangeText={(text) => onUpdate({ ...category, name: text })}
              className="text-gray-800 text-lg font-medium"
              autoFocus
              onBlur={() => setIsEditing(false)}
              placeholder="Category name"
            />
          ) : (
            <TouchableOpacity onPress={() => setIsEditing(true)}>
              <Text className="text-gray-800 text-lg font-medium">{category.name}</Text>
            </TouchableOpacity>
          )}
          <Text className="text-gray-500 text-sm mt-1">
            {category.description || 'Tap to add description'}
          </Text>
        </View>
        <View className="flex-row items-center">
          <TextInput
            value={category.allocation.toString()}
            onChangeText={(text) =>
              onUpdate({
                ...category,
                allocation: validateAllocation(text),
              })
            }
            keyboardType="numeric"
            className="text-right text-gray-800 text-lg font-medium bg-gray-50 rounded-lg px-3 py-2 w-20"
            maxLength={3}
          />
          <Text className="text-gray-600 ml-2">%</Text>
          <TouchableOpacity onPress={onDelete} className="ml-4 p-2">
            <Trash2 size={20} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
};

const BudgetConfigScreen: React.FC = () => {
  const [selectedRule, setSelectedRule] = useState<BudgetRule>('50-30-20');
  const [categories, setCategories] = useState<Category[]>([
    {
      id: '1',
      name: 'Essential Expenses',
      allocation: 50,
      description: 'Rent, utilities, groceries, etc.',
    },
    {
      id: '2',
      name: 'Lifestyle & Entertainment',
      allocation: 30,
      description: 'Dining out, hobbies, shopping',
    },
    {
      id: '3',
      name: 'Financial Goals',
      allocation: 20,
      description: 'Savings, investments, debt payment',
    },
  ]);
  const [guiltFreeBalance, setGuiltFreeBalance] = useState(true);

  const totalAllocation = categories.reduce((sum, cat) => sum + cat.allocation, 0);

  const addCategory = () => {
    if (categories.length >= 8) {
      Alert.alert('Maximum Categories', 'You can have up to 8 categories.');
      return;
    }

    const newCategory: Category = {
      id: Date.now().toString(),
      name: 'New Category',
      allocation: 0,
      description: 'Tap to add description',
    };
    setCategories([...categories, newCategory]);
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-6">
        {/* Header */}
        <Animated.View entering={FadeIn.delay(200)} className="mb-8">
          <Text className="text-3xl font-bold text-gray-800">Budget Setup</Text>
          <Text className="text-gray-600 text-lg mt-2">Design your perfect budget strategy</Text>
        </Animated.View>

        <InfoCard
          title="Why set up a budget?"
          description="A well-planned budget helps you take control of your finances, reach your goals faster, and reduce financial stress."
        />

        {/* Budget Rules */}
        <View className="mb-8">
          <Text className="text-xl font-bold text-gray-800 mb-2">Choose Your Strategy</Text>
          <Text className="text-gray-600 mb-4">
            Select a budgeting approach that matches your lifestyle and goals
          </Text>

          {(Object.keys(BUDGET_RULES) as BudgetRule[]).map((rule) => (
            <BudgetRuleCard
              key={rule}
              rule={rule}
              info={BUDGET_RULES[rule]}
              selected={selectedRule === rule}
              onSelect={() => setSelectedRule(rule)}
            />
          ))}
        </View>

        {/* Guilt-Free Balance */}
        <Animated.View
          entering={FadeInDown.delay(400)}
          className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-xl mb-8"
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              <Heart size={24} color="#3b82f6" />
              <View className="ml-3 flex-1">
                <Text className="text-gray-800 font-bold text-lg">Guilt-Free Balance</Text>
                <Text className="text-gray-600 mt-1">
                  Set aside money for spontaneous spending without compromising your budget
                </Text>
              </View>
            </View>
            <Switch
              value={guiltFreeBalance}
              onValueChange={setGuiltFreeBalance}
              trackColor={{ false: '#cbd5e1', true: '#93c5fd' }}
              thumbColor={guiltFreeBalance ? '#3b82f6' : '#f4f4f5'}
              ios_backgroundColor="#cbd5e1"
            />
          </View>
        </Animated.View>

        {/* Spending Categories */}
        <View className="mb-8">
          <View className="flex-row items-center justify-between mb-4">
            <View>
              <Text className="text-xl font-bold text-gray-800">Categories</Text>
              <Text className="text-gray-600 mt-1">Total Allocation: {totalAllocation}%</Text>
            </View>
            <TouchableOpacity
              onPress={addCategory}
              className="flex-row items-center bg-blue-500 px-4 py-2 rounded-lg"
            >
              <Plus size={20} color="#ffffff" />
              <Text className="text-white font-medium ml-2">Add Category</Text>
            </TouchableOpacity>
          </View>

          {totalAllocation > 100 && (
            <View className="bg-red-50 p-4 rounded-lg mb-4 flex-row items-center">
              <AlertCircle size={20} color="#ef4444" />
              <Text className="text-red-600 ml-2 flex-1">
                Total allocation exceeds 100%. Please adjust your categories.
              </Text>
            </View>
          )}

          {categories.map((category) => (
            <CategoryInput
              key={category.id}
              category={category}
              onUpdate={(updated) => {
                setCategories(categories.map((cat) => (cat.id === updated.id ? updated : cat)));
              }}
              onDelete={() => {
                setCategories(categories.filter((cat) => cat.id !== category.id));
              }}
            />
          ))}
        </View>

        {/* Save Button */}
        <TouchableOpacity
          className={`${
            totalAllocation === 100 ? 'bg-blue-500' : 'bg-gray-300'
          } p-4 rounded-xl flex-row items-center justify-center mt-4 mb-8`}
          disabled={totalAllocation !== 100}
          onPress={() => {
            // Handle save
            Alert.alert('Success', 'Budget configuration saved successfully!');
          }}
        >
          <Text className="text-white font-bold text-lg mr-2">Save Configuration</Text>
          <ArrowRight color="white" size={20} />
        </TouchableOpacity>

        {totalAllocation !== 100 && (
          <Text className="text-center text-gray-500 mb-8">
            Total allocation must equal 100% to save
          </Text>
        )}
      </View>
      
    </ScrollView>
  );
};

export default BudgetConfigScreen;
