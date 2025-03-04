import { View } from "react-native";
import SpendingCategoriesCard from "src/components/ui/spendingcategory";
import SpendingChart from "src/components/ui/spendingchart";


const SpendingDashboard = (): React.ReactElement => {
  return (
		<View className="flex-1 bg-gray-50 dark:bg-gray-900 px-4 py-6">
			<SpendingChart />
			<SpendingCategoriesCard />
		</View>
	);
};

export default SpendingDashboard;