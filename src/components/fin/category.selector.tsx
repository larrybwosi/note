import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { TransactionType, Category } from 'src/store/types';
import { Briefcase, DollarSign, Gem, Gift, ShieldCheck, Wallet } from 'lucide-react-native';
import { PREDEFINED_CATEGORY_GROUPS } from 'src/lib/types';

interface CategorySelectorProps {
  transactionType: TransactionType;
  selectedCategory: Category | null;
  onSelectCategory: (category: Category) => void;
}


const getCategoryIcon = (id: string) => {
  switch (id) {
    case 'ACTIVE_INCOME':
      return <Briefcase className="w-6 h-6 bg-cyan-600" color={'#0891b2'} />;
    case 'PASSIVE_INCOME':
      return <Gem className="w-6 h-6" color={'#f97316'}/>;
    case 'GIFT':
      return <Gift className="w-6 h-6" color={'#ef4444'}/>;
    case 'ESSENTIAL_NEEDS':
      return <ShieldCheck className="w-6 h-6" color={'#22c55e'}/>;
    case 'LIFESTYLE':
      return <Wallet className="w-6 h-6" color={'#f59e0b'}/>;
    case 'FINANCIAL_GOALS':
      return <DollarSign className="w-6 h-6" color={'#ef4444'} />;
    default:
      return <DollarSign className="w-6 h-6" color={'#ef4444'} />;
  }
};


export const CategorySelector: React.FC<CategorySelectorProps> = ({
  transactionType,
  selectedCategory,
  onSelectCategory,
}) => {
  const categories = Object.values(PREDEFINED_CATEGORY_GROUPS).filter(
    (category) => category.type === transactionType
  );

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
              {getCategoryIcon(category.id)}
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

