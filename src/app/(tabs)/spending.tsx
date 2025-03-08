import { ScrollView } from "react-native-gesture-handler";
import BudgetCategoryGroups from "src/components/shopping/category-groups";
import SpendingChart from "src/components/ui/spendingchart";


const SpendingDashboard = (): React.ReactElement => {
  return (
		<ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900 px-4 py-6">
			<SpendingChart />
			<BudgetCategoryGroups />
		</ScrollView>
	);
};

export default SpendingDashboard;