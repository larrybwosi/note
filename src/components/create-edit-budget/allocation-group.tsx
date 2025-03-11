import { MoveRight, X } from "lucide-react-native";
import { Text, TouchableOpacity, View } from "react-native";
import { Category, ICON_MAP } from "src/types/transaction";

interface AllocationGroup {
	expenseCategories: Category[];
	group: any;
	categoryCount: number;
	activeGroupIndex: string|number|null;
	isActive: boolean;
	setActiveGroupIndex: (index: number) => void;
	index: number;
	toggleCategoryInGroup: (categoryId: string, groupIndex: number) => void;
}

const AllocationGroup = ({
	activeGroupIndex,
	categoryCount,
	expenseCategories,
	group,
	isActive,
	setActiveGroupIndex,
  index,
  toggleCategoryInGroup
}: AllocationGroup) => {
	return (
		<TouchableOpacity
			className={`p-4 mb-3 rounded-xl shadow-sm ${
				isActive ? 'border-2 border-indigo-500 bg-indigo-50' : 'border border-gray-200 bg-white'
			}`}
			onPress={() => setActiveGroupIndex(index === activeGroupIndex ? '' : index)}
		>
			<View className="flex-row justify-between items-center">
				<View className="flex-row items-center">
					<View
						className="w-10 h-10 rounded-full mr-3 items-center justify-center"
						style={{ backgroundColor: group.color + '30' }}
					>
						<Text className="font-bold" style={{ color: group.color }}>
							{group.percentage}%
						</Text>
					</View>
					<View>
						<Text className="font-amedium text-gray-800 text-base">{group.name}</Text>
						<Text className="text-xs text-gray-500 font-aregular">{group.description}</Text>
					</View>
				</View>
				<View className="flex-row items-center">
					<View className="bg-gray-100 px-2 py-1 rounded-full mr-2">
						<Text className="text-xs text-gray-600 font-aregular">{categoryCount}</Text>
					</View>
					<MoveRight size={18} color={isActive ? '#4F46E5' : '#9CA3AF'} />
				</View>
			</View>

			{group.categories.length > 0 && (
				<View className="mt-4 pt-3 border-t border-gray-200">
					<Text className="text-xs text-gray-500 mb-2 font-aregular">Assigned Categories:</Text>
					<View className="flex-row flex-wrap">
						{group.categories.map((catId: string) => {
							const category = expenseCategories.find((c) => c.id === catId);
							const Icon = ICON_MAP[category?.icon!];
							return category ? (
								<View
									key={catId}
									className="flex-row items-center bg-gray-100 rounded-full px-3 py-1 mr-2 mb-2"
								>
									<View className="w-4 h-4 rounded-full mr-2 items-center justify-center">
										<Icon size={14} />
									</View>
									<Text className="text-xs text-gray-700 mr-1 font-rmedium">{category.name}</Text>
									<TouchableOpacity
										onPress={() => toggleCategoryInGroup(catId, index)}
										className="ml-1"
									>
										<X size={12} color="#9CA3AF" />
									</TouchableOpacity>
								</View>
							) : null;
						})}
					</View>
				</View>
			)}
		</TouchableOpacity>
	);
};

export default AllocationGroup;