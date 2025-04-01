import { View, Text, TouchableOpacity } from 'react-native'
import { useState } from 'react'
import { ChevronDown, ChevronUp, ShoppingBag, X } from 'lucide-react-native';
import { Category, ShoppingItem } from 'src/types/transaction';

interface ShoppingListProps {
	shoppingItems: ShoppingItem[];
	category: Category;
	removeItem: (id:string)=>void
}
function ShoppingList({ category, shoppingItems, removeItem }: ShoppingListProps) {
	const [expanded, setExpanded] = useState<{ [key: string]: boolean }>({});

	// Get category items and total
	const getCategoryItems = (categoryId: string) => {
		const items = shoppingItems.filter((item) => item.categoryId === categoryId);
		const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
		return { items, total };
	};

	const toggleExpand = (categoryId: string) => {
		setExpanded({
			...expanded,
			[categoryId]: !expanded[categoryId],
		});
	};
	const { items, total } = getCategoryItems(category.id);
	if (items.length === 0) return null;

	return (
    <View
      key={category.id}
      className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm mb-3"
    >
      <TouchableOpacity
        className="flex-row justify-between items-center p-4"
        onPress={() => toggleExpand(category.id)}
        style={{
          borderLeftWidth: 4,
          borderLeftColor: category.color,
        }}
      >
        <View className="flex-row items-center">
          <View
            className="w-8 h-8 rounded-full justify-center items-center mr-2"
            style={{ backgroundColor: category.color }}
          >
            <ShoppingBag size={16} color="white" />
          </View>
          <View>
            <Text className="font-medium text-gray-800 dark:text-white">
              {category.name}
            </Text>
            <Text className="text-xs text-gray-500 dark:text-gray-400">
              {items.length} items
            </Text>
          </View>
        </View>
        <View className="flex-row items-center">
          <View className="bg-gray-200 dark:bg-gray-600 px-3 py-1 rounded-full">
            <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              ${total?.toFixed(2)}
            </Text>
          </View>{" "}
          {expanded[category.id] ? (
            <ChevronUp size={20} color="#9CA3AF" />
          ) : (
            <ChevronDown size={20} color="#9CA3AF" />
          )}
        </View>
      </TouchableOpacity>

      {expanded[category.id] && (
        <View className="p-4 border-t border-gray-100 dark:border-gray-700">
          {items?.map((item) => (
            <View
              key={item.id}
              className="flex-row justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700"
            >
              <View>
                <Text className="text-gray-800 dark:text-white">
                  {item.name}
                </Text>
                <Text className="text-xs text-gray-500 dark:text-gray-400">
                  ${item.price.toFixed(2)} × {item.quantity}
                </Text>
              </View>
              <View className="flex-row items-center">
                <Text className="font-medium text-gray-800 dark:text-white mr-3">
                  ${(item.price * item.quantity).toFixed(2)}
                </Text>
                <TouchableOpacity onPress={() => removeItem(item.id)}>
                  <X size={18} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

export default ShoppingList;