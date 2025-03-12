import { observer } from "@legendapp/state/react";
import { ScrollView } from "react-native-gesture-handler";
import BudgetCategoryGroups from "src/components/shopping/category-groups";
import ExpenseOverview from "src/components/spending-overview";


const SpendingDashboard = (): React.ReactElement => {
  return (
		<ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900 px-4 py-6">
			<ExpenseOverview />
			<BudgetCategoryGroups />
		</ScrollView>
	);
};

export default observer(SpendingDashboard);