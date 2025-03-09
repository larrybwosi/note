import { BarChart3 } from "lucide-react-native";
import { TouchableOpacity } from "react-native";
import { Text } from "react-native";
import { View } from "react-native";

const EmptyState = ({ activeTab, onCreateBudget }: { activeTab:string ;onCreateBudget: ()=> void }) => (
  <View className="items-center justify-center py-10">
    <View className="bg-gray-100 rounded-full p-4 mb-4">
      <BarChart3 size={40} color="#6B7280" />
    </View>
    <Text className="text-gray-700 text-lg font-bold">No budgets found</Text>
    <Text className="text-gray-500 text-center mt-2 mb-6 px-8">
      {activeTab === 'active'
        ? "You don't have any active budgets yet. Create and activate one to track your finances."
        : activeTab === 'draft'
          ? 'Start creating a new budget to save as draft.'
          : 'No expired budgets to display.'}
    </Text>
    <TouchableOpacity
      className="bg-indigo-600 py-3 px-6 rounded-xl shadow-sm"
      onPress={onCreateBudget}
    >
      <Text className="text-white font-bold">Create New Budget</Text>
    </TouchableOpacity>
  </View>
);

export default EmptyState