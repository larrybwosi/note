import { LinearGradient } from 'expo-linear-gradient';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import useStore from 'src/store/useStore';
import { ICON_MAP } from 'src/types/transaction';

type CategoryItemProps = {
	id: string;
	icon: string;
	category: string;
	amount: string;
	percentage: string;
	gradient: string[];
	color: string;
	type?: string;
	subcategories?: string[];
};

// Category Item Component
const CategoryItem = ({
	id,
	icon,
	category,
	amount,
	percentage,
	gradient,
	color,
	type,
	subcategories,
}: CategoryItemProps): React.ReactElement => {
	const Icon = ICON_MAP[icon];
	const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);
	const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

	return (
		<AnimatedTouchableOpacity
			className="w-[48%] rounded-2xl p-4 mb-4 bg-amber-50 dark:bg-gray-700"
			style={styles.categoryItem}
		>
			<View className="flex-row items-center gap-2 mb-2">
				<AnimatedLinearGradient
					colors={gradient}
					className="w-10 h-10 rounded-full items-center justify-center"
					style={{ borderRadius: 16 }}
				>
					<Icon size={20} color="white" />
				</AnimatedLinearGradient>
				<Text
					className="text-sm font-abold text-gray-600 dark:text-gray-50"
					numberOfLines={1}
					ellipsizeMode="tail"
				>
					{category}
				</Text>
			</View>

			<Text className="text-lg font-semibold text-gray-800 dark:text-gray-100">{amount}</Text>
			<Text className="text-xs text-gray-500 mt-1 dark:text-gray-400">{percentage}</Text>

			{type && subcategories && subcategories.length > 0 && (
				<View className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
					<Text className="text-xs font-amedium text-gray-500 dark:text-gray-400 mb-1">
						Includes:
					</Text>
					<View className="flex-row flex-wrap">
						{subcategories.slice(0, 2).map((subcat, idx) => (
							<View
								key={idx}
								className="bg-gray-200 dark:bg-gray-600 rounded-full px-2 py-1 mr-1 mb-1"
							>
								<Text className="text-xs text-gray-700 dark:text-gray-300">{subcat}</Text>
							</View>
						))}
						{subcategories.length > 2 && (
							<View className="bg-gray-200 dark:bg-gray-600 rounded-full px-2 py-1 mr-1 mb-1">
								<Text className="text-xs text-gray-700 dark:text-gray-300">
									+{subcategories.length - 2}
								</Text>
							</View>
						)}
					</View>
				</View>
			)}
		</AnimatedTouchableOpacity>
	);
};

// Spending Categories Card Component
const SpendingCategoriesCard = (): React.ReactElement => {
	const { categories, getCategoryMonthlyTotal } = useStore();
	const EXPENSE_CATEGORIES = categories.filter((cat) => cat.type === 'expense');

	return (
		<Animated.View
			style={[styles.cardShadow]}
			className="w-full bg-white dark:bg-gray-800 rounded-3xl p-5 shadow-lg dark:shadow-gray-900"
		>
			<Text className="text-xl font-amedium text-gray-800 dark:text-gray-200 mb-4">
				Spending Categories
			</Text>

			<ScrollView showsVerticalScrollIndicator={false} className="w-full">
				<View className="flex-row flex-wrap justify-between w-full">
					{EXPENSE_CATEGORIES.map((item, index) => (
						<CategoryItem
							key={index}
							id={item.id}
							icon={item.icon}
							category={item.name}
							amount={getCategoryMonthlyTotal(item.id).toString()}
							percentage={`${20}%`}
							gradient={item.colors || ['#f472b6', '#db2777']}
							color={item.color}
							type={item.type}
							subcategories={item.subcategories}
						/>
					))}
				</View>
			</ScrollView>
		</Animated.View>
	);
};

const styles = StyleSheet.create({
	cardShadow: {
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 4,
		},
		shadowOpacity: 0.08,
		shadowRadius: 12,
		elevation: 4,
	},
	categoryItem: {
		elevation: 1,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.05,
		shadowRadius: 2,
	},
});

export default SpendingCategoriesCard;
