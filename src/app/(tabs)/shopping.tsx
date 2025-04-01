import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import {
  ShoppingBag,
  PlusCircle,
  DollarSign,
  ArrowUpCircle,
} from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { observer } from "@legendapp/state/react";
import { router } from "expo-router";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

import NewItemModal from "src/components/shopping/new-item-modal";
import { useFeedbackModal } from "src/components/ui/feedback";
import ShoppingList from "src/components/shopping/list";
import useShoppingStore from "src/store/shopping";
import useStore from "src/store/useStore";

const ShoppingBudgetPlanner = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const { showModal, hideModal } = useFeedbackModal();
  const { getActiveList, removeItemFromList } =
    useShoppingStore();
  const activeShoppingList = getActiveList();
  const shoppingItems = activeShoppingList?.items;

  // Store hooks
  const { getActiveBudgetSpending, categories } = useStore();
  const currentBudget = getActiveBudgetSpending();

  // Filter expense categories
  const EXPENSE_CATEGORIES = categories.filter((cat) => cat.type === "expense");

  // Budget calculations
  const totalSpent =
    shoppingItems?.reduce((sum, item) => sum + item.price * item.quantity, 0) ||
    0;
  const remainingBudget = (currentBudget?.totalRemaining || 0) - totalSpent;
  const percentageSpent = currentBudget?.percentUsed ?? 0;

  // Open modal and reset form
  const handleOpenModal = () => {
    if (!currentBudget) {
      showModal({
        type: "info",
        title: "No Budget Selected",
        message: "Please select a budget before adding an item.",
        primaryButtonText: "Set Budget",
        secondaryButtonText: "Cancel",
        onPrimaryAction: () => router.push("/create-edit-budget"),
        onSecondaryAction: () => hideModal(),
      });
      return;
    }
    setModalVisible(true);
  };

  // Close modal
  const closeModal = () => {
    setModalVisible(false);
  };

  // Remove item from shopping list
  const removeItem = (id: string) => {
    removeItemFromList(id, activeShoppingList?.id);
  };

  // Get budget status color based on percentage spent
  const getBudgetStatusColor = () => {
    if (percentageSpent >= 90) return "#EF4444"; // Red
    if (percentageSpent >= 70) return "#F59E0B"; // Amber
    return "#10B981"; // Green
  };

  // Get formatted category items for display
  const getCategoryItems = (categoryId: string) => {
    return shoppingItems?.filter((item) => item.categoryId === categoryId);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header with budget information */}
      <Animated.View
        entering={FadeInDown.duration(600).springify()}
        className="bg-white dark:bg-gray-800 px-5 pt-4 pb-6 rounded-b-3xl shadow-sm border-b border-gray-100"
      >
        <Text className="text-2xl font-bold text-gray-800 mb-4 dark:text-white">
          Shopping Budget
        </Text>

        <View className="mt-2">
          <View className="mb-4 flex-row justify-between items-center">
            <View>
              <Text className="text-sm text-gray-500 mb-1 dark:text-gray-400">
                Remaining Budget
              </Text>
              <View className="flex-row items-center">
                <DollarSign size={20} color={getBudgetStatusColor()} />
                <Text
                  className={`text-3xl font-bold ml-1 ${
                    remainingBudget >= 0 ? "text-emerald-500" : "text-red-500"
                  }`}
                >
                  {Math.abs(remainingBudget).toFixed(2)}
                  <Text className="text-sm ml-1">
                    {remainingBudget < 0 ? " overspent" : ""}
                  </Text>
                </Text>
              </View>
            </View>

            <View className="bg-gray-100 dark:bg-gray-700 p-3 rounded-full">
              <Text
                className="text-xl font-bold"
                style={{ color: getBudgetStatusColor() }}
              >
                {percentageSpent.toFixed(0)}%
              </Text>
            </View>
          </View>

          {/* Progress bar */}
          <View className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-3">
            <Animated.View
              entering={FadeInUp.delay(300).duration(1000)}
              style={{
                width: `${Math.min(percentageSpent, 100)}%`,
                backgroundColor: getBudgetStatusColor(),
                height: "100%",
                borderRadius: 8,
              }}
            />
          </View>

          {/* Stats row */}
          <View className="flex-row justify-between mt-3">
            <View className="items-start bg-gray-50 dark:bg-gray-700 p-3 rounded-xl flex-1 mr-2">
              <Text className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                Spent
              </Text>
              <Text className="text-base font-semibold text-gray-800 dark:text-white">
                ${totalSpent?.toFixed(2)}
              </Text>
            </View>
            <View className="items-start bg-gray-50 dark:bg-gray-700 p-3 rounded-xl flex-1 ml-2">
              <Text className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                Budget Total
              </Text>
              <Text className="text-base font-semibold text-gray-800 dark:text-white">
                ${(currentBudget?.totalRemaining || 0) + totalSpent}
              </Text>
            </View>
          </View>
        </View>
      </Animated.View>

      {/* Main content */}
      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {/* Add Item Button */}
        <TouchableOpacity
          className="bg-indigo-600 rounded-2xl p-4 mt-6 flex-row justify-between items-center shadow-md"
          onPress={handleOpenModal}
          activeOpacity={0.7}
        >
          <View className="flex-row items-center">
            <PlusCircle size={20} color="#FFFFFF" />
            <Text className="text-base font-semibold text-white ml-3">
              Add New Item
            </Text>
          </View>
          <ArrowUpCircle size={20} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Shopping lists by category */}
        <View className="mt-6 mb-16">
          <Text className="text-lg font-bold text-gray-800 dark:text-white mb-3">
            Shopping List
          </Text>

          {EXPENSE_CATEGORIES?.filter(
            (category) => getCategoryItems(category?.id)?.length! > 0
          ).map((category, index) => (
            <Animated.View
              key={category.id}
              entering={FadeInDown.delay(100 * index).duration(400)}
              className="bg-white dark:bg-gray-800 rounded-2xl mb-4 overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700"
            >
              <ShoppingList
                category={category}
                removeItem={removeItem}
                shoppingItems={getCategoryItems(category.id) || []}
              />
            </Animated.View>
          ))}

          {activeShoppingList?.items?.length === 0 && (
            <Animated.View
              entering={FadeInUp.duration(400)}
              className="bg-white dark:bg-gray-800 rounded-2xl p-8 items-center justify-center mt-2 shadow-sm border border-gray-100 dark:border-gray-700"
            >
              <ShoppingBag size={64} color="#9CA3AF" />
              <Text className="text-base text-gray-500 text-center mt-4 leading-6 max-w-xs">
                Your shopping list is empty. Add items to get started!
              </Text>
              <TouchableOpacity
                className="mt-5 bg-indigo-50 dark:bg-indigo-900/20 px-5 py-3 rounded-xl"
                onPress={handleOpenModal}
                activeOpacity={0.7}
              >
                <Text className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                  Add your first item
                </Text>
              </TouchableOpacity>
            </Animated.View>
          )}
        </View>
      </ScrollView>
      <NewItemModal
        isVisible={modalVisible}
        onClose={closeModal}
        categories={EXPENSE_CATEGORIES}
        budget={currentBudget?.budget!}
      />
    </SafeAreaView>
  );
};

export default observer(ShoppingBudgetPlanner);
