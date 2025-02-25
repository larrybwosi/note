import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import Animated, { FadeInDown } from "react-native-reanimated";
import useStore from "src/store/useStore";
import { ICON_MAP } from "src/types/transaction";

type CategoryItemProps = {
	id: string;
	icon: string;
	category: string;
	amount: string;
	percentage: string;
	gradient: string[];
	color: string;
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
}: CategoryItemProps): React.ReactElement => {
	const Icon = ICON_MAP[icon];
	const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);
	const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

	return (
		<AnimatedTouchableOpacity
			entering={FadeInDown.duration(600).delay(700)}
			onPress={() => router.push(`categoryId?id=${id}`)}
			className={`w-[48%] rounded-2xl p-4 mb-4 bg-amber-50 dark:bg-gray-700`}
		>
			<View className="flex items-center flex-row gap-2">
				<AnimatedLinearGradient
					colors={gradient}
					className="w-10 h-10 rounded-full items-center justify-center mb-3"
					style={{ borderRadius: 16 }}
				>
					<Icon size={24} color="white" />
				</AnimatedLinearGradient>
				<Text className="text-lg font-amedium text-gray-600 mt-1 dark:text-gray-50 mb-3">
					{category}
				</Text>
			</View>
			<Text className="text-lg font-semibold text-gray-800 dark:text-gray-100">{amount}</Text>
			<Text className="text-xs text-gray-500 mt-1 dark:text-gray-400">{percentage}</Text>
		</AnimatedTouchableOpacity>
	);
};

// Spending Categories Card Component
const SpendingCategoriesCard = (): React.ReactElement => {
	const { categories, getCategoryMonthlyTotal } = useStore();
	const EXPENSE_CATEGORIES = categories.filter((cat) => cat.type === 'expense');

	return (
		<Animated.View
			entering={FadeInDown.delay(600).duration(700).springify()}
			style={[styles.cardShadow]}
			className="w-full bg-white dark:bg-gray-800 rounded-3xl p-5 shadow-lg dark:shadow-gray-900"
		>
			<Text className="text-xl font-amedium text-gray-800 dark:text-gray-200 mb-4">
				Spending Categories
			</Text>

			<ScrollView className="-mx-2">
				<View className="flex-row flex-wrap w-full gap-4 flex-1">
					{EXPENSE_CATEGORIES.map((item, index) => (
						<CategoryItem
							key={index}
							id={item.id}
							icon={item.icon}
							category={item.name}
							amount={getCategoryMonthlyTotal(item.id)}
							percentage={`${20}%`}
							gradient={item.colors || ['#f472b6', '#db2777']}
							color={item.color}
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
      chartLabel: {
        position: 'absolute',
        fontSize: 12,
        fontWeight: '500',
      }
    });

export default SpendingCategoriesCard;