import { format } from "date-fns";
import { Calendar, Clock, DollarSign, Edit, Trash2 } from "lucide-react-native";
import { Text, TouchableOpacity } from "react-native";
import { View } from "react-native";
import { Budget, BUDGET_RULE_ALLOCATIONS } from "src/types/transaction";


const CATEGORY_COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

// Budget Rule allocations labels generator
const getRuleAllocations = (ruleType: string) => {
  return BUDGET_RULE_ALLOCATIONS[ruleType] || [];
};

const BudgetCard = ({
  budget,
  onView,
  onEdit,
  onDelete,
  onActivate,
}: {
  budget: Budget;
  onView: (budget: Budget)=>void;
  onEdit: (id:Budget) => void;
  onDelete: (id: string) => void;
  onActivate: (id: string) => void;
}) => {
  const budgetRuleAllocations = getRuleAllocations(budget?.ruleType)?.groups;

  // Calculate remaining days
  const getRemainingDays = (endDate: Date) => {
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const calculateProgress = (budget: Budget) => {
    const start = new Date(budget.startDate).getTime();
    const end = new Date(budget.endDate).getTime();
    const now = Date.now();
    const progress = ((now - start) / (end - start)) * 100;
    return Math.min(Math.max(progress, 0), 100); // Ensure between 0-100
  };

  return (
    <View className="bg-white rounded-xl mb-4 shadow overflow-hidden border border-gray-100">
      {/* Status indicator strip */}
      <View
        className={`h-1.5 w-full ${
          budget.status === 'active'
            ? 'bg-green-500'
            : budget.status === 'draft'
              ? 'bg-blue-500'
              : 'bg-gray-400'
        }`}
      />

      <TouchableOpacity className="p-4" onPress={() => onView(budget)} activeOpacity={0.7}>
        <View className="flex-row justify-between items-center mb-3">
          <Text className="font-bold text-lg text-gray-800">{budget.name}</Text>
          <View
            className={`px-3 py-1 rounded-full ${
              budget.status === 'active'
                ? 'bg-green-100'
                : budget.status === 'draft'
                  ? 'bg-blue-100'
                  : 'bg-gray-100'
            }`}
          >
            <Text
              className={`text-xs font-medium ${
                budget.status === 'active'
                  ? 'text-green-800'
                  : budget.status === 'draft'
                    ? 'text-blue-800'
                    : 'text-gray-800'
              }`}
            >
              {budget.status.charAt(0).toUpperCase() + budget.status.slice(1)}
            </Text>
          </View>
        </View>

        {/* Amount and Date Range */}
        <View className="mb-3">
          <View className="flex-row items-center mb-1.5">
            <DollarSign size={16} color="#4F46E5" />
            <Text className="text-gray-800 ml-1 font-bold text-base">
              ${budget.amount.toLocaleString()}
            </Text>
          </View>
          <View className="flex-row items-center">
            <Calendar size={16} color="#6B7280" />
            <Text className="text-gray-600 ml-1 font-medium text-sm">
              {format(new Date(budget.startDate), 'MMM d, yyyy')} -{' '}
              {format(new Date(budget.endDate), 'MMM d, yyyy')}
            </Text>
          </View>
          <Text className="text-gray-500 text-xs ml-5">
            {budget.periodType.charAt(0).toUpperCase() + budget.periodType.slice(1)}ly budget
          </Text>
        </View>

        {/* Budget Rule Allocations */}
        <View className="bg-gray-50 p-2.5 rounded-lg mb-3">
          <Text className="text-xs font-medium text-gray-500 mb-2">
            ALLOCATION RULE: {budget.ruleType}
          </Text>
          <View className="flex-row flex-wrap">
            {budgetRuleAllocations.map((allocation, index) => (
              <View key={index} className="flex-row items-center mr-3 mb-1.5">
                <View
                  className="w-3 h-3 rounded-full mr-1"
                  style={{
                    backgroundColor: CATEGORY_COLORS[index % CATEGORY_COLORS?.length],
                  }}
                />
                <Text className="text-xs text-gray-700">
                  {allocation.name} ({allocation.percentage}%)
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Progress Bar for Active Budgets */}
        {budget.status === 'active' && (
          <View className="mt-2 mb-1">
            <View className="flex-row justify-between items-center mb-1">
              <Text className="text-xs font-medium text-gray-600">Progress</Text>
              <View className="flex-row items-center">
                <Clock size={12} color="#6B7280" />
                <Text className="text-xs text-gray-600 ml-1 font-medium">
                  {getRemainingDays(budget.endDate)} days left
                </Text>
              </View>
            </View>
            <View className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
              <View
                className="h-full rounded-full"
                style={{
                  width: `${calculateProgress(budget)}%`,
                  backgroundColor: calculateProgress(budget) > 80 ? '#EF4444' : '#4F46E5',
                }}
              />
            </View>
          </View>
        )}
      </TouchableOpacity>

      {/* Actions Footer */}
      <View className="flex-row border-t border-gray-100">
        <TouchableOpacity
          className="flex-1 p-3 flex-row justify-center items-center"
          onPress={() => onEdit(budget)}
        >
          <Edit size={16} color="#4F46E5" />
          <Text className="ml-1.5 text-indigo-600 font-medium">Edit</Text>
        </TouchableOpacity>

        <View className="w-px bg-gray-100" />

        <TouchableOpacity
          className="flex-1 p-3 flex-row justify-center items-center"
          onPress={() => onDelete(budget.id)}
        >
          <Trash2 size={16} color="#EF4444" />
          <Text className="ml-1.5 text-red-500 font-medium">Delete</Text>
        </TouchableOpacity>

        {budget.status === 'draft' && (
          <>
            <View className="w-px bg-gray-100" />
            <TouchableOpacity
              className="flex-1 p-3 flex-row justify-center items-center bg-indigo-50"
              onPress={() => onActivate(budget.id)}
            >
              <Text className="text-indigo-700 font-medium">Activate</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};

export default BudgetCard;