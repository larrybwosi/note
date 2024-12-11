import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import Animated, { FadeInDown, FadeOutUp, LinearTransition } from 'react-native-reanimated';
import { ArrowUpCircle, ArrowDownCircle, Check, PlusCircle } from 'lucide-react-native';
import { CategoryType } from 'src/store/finance/types';

interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
  type: CategoryType;
  isSelected: boolean;
}

interface Step3CategoriesProps {
  categories: Category[];
  activeTab: CategoryType;
  handleTabPress: (type: CategoryType) => void;
  toggleCategory: (id: string) => void;
  showNewCategoryModal: () => void;
  error?: string;
}

const Step3Categories: React.FC<Step3CategoriesProps> = ({
  categories,
  activeTab,
  handleTabPress,
  toggleCategory,
  showNewCategoryModal,
  error
}) => (
  <Animated.View
    entering={FadeInDown}
    exiting={FadeOutUp}
    layout={LinearTransition.springify()}
    className="space-y-6"
  >
    <View>
      <Text className="text-2xl font-rbold text-gray-900 mb-2">Customize Categories</Text>
      <Text className="text-base font-rmedium text-gray-600">
        Select the categories you want to track in your budget
      </Text>
    </View>

    <View className="flex-row bg-gray-100 rounded-xl p-1 mb-4">
      {['INCOME', 'EXPENSE'].map((type) => (
        <TouchableOpacity
          key={type}
          onPress={() => handleTabPress(type as CategoryType)}
          className={`flex-1 py-3 px-4 rounded-lg flex-row items-center justify-center ${
            activeTab === type ? 'bg-white' : ''
          }`}
        >
          {type === 'income' ? 
            <ArrowUpCircle size={24} color={activeTab === type ? '#3B82F6' : '#6B7280'}/> :
            <ArrowDownCircle size={24} color={activeTab === type ? '#3B82F6' : '#6B7280'}/>
          }
          <Text
            className={`ml-2 font-rmedium ${
              activeTab === type ? 'text-blue-500' : 'text-gray-500'
            }`}
          >
            {type}
          </Text>
        </TouchableOpacity>
      ))}
    </View>

    <ScrollView className="space-y-4">
      {categories
        .filter((cat) => cat.type === activeTab)
        .map((category, index) => (
          <Animated.View
            key={category.id}
            entering={FadeInDown.delay(index * 100)}
            className="rounded-xl shadow-sm my-2"
          >
            <TouchableOpacity
              onPress={() => toggleCategory(category.id)}
              className="p-4 flex-row items-center space-x-4"
            >
              <Text className="text-2xl">{category.icon}</Text>
              <View className="flex-1 ml-4">
                <Text className="text-lg font-rbold text-gray-900 dark:text-white">
                  {category.name}
                </Text>
                <Text className="text-sm font-rregular text-gray-600">{category.description}</Text>
              </View>
              <View
                className={`w-6 h-6 rounded-full border-2 items-center justify-center`}
                style={{
                  borderColor: category.isSelected ? '#3b82f6' : '#d1d5db',
                  backgroundColor: category.isSelected ? '#3b82f6' : 'white',
                }}
              >
                {category.isSelected && <Check size={16} color="white" />}
              </View>
            </TouchableOpacity>
          </Animated.View>
        ))}
    </ScrollView>

    <TouchableOpacity
      onPress={showNewCategoryModal}
      className="flex-row items-center justify-center bg-gray-100 rounded-xl p-4 mt-4"
    >
      <PlusCircle size={24} color="#3B82F6" />
      <Text className="ml-2 text-blue-500 font-rmedium">Add Custom Category</Text>
    </TouchableOpacity>

    {error && (
      <Text className="text-red-500 text-sm mt-2">{error}</Text>
    )}
  </Animated.View>
);

export default Step3Categories;
