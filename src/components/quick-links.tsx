import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import {
	PieChart,
	CreditCard,
	ListTodo,
	ArrowRight,
  LucideIcon,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
interface QuickLinkItem {
	id: string;
	icon: LucideIcon;
	title: string;
	description: string;
	gradient: [string, string];
	route: string;
	accentColor: string;
}

const quickLinks: QuickLinkItem[] = [
	{
		id: 'budget',
		icon: PieChart,
		title: 'Budget Insights',
		description: 'Comprehensive financial planning',
		gradient: ['#60a5fa', '#93c5fd'],
		route: '/budget.planner',
		accentColor: '#8A56F5',
	},
	{
		id: 'categories',
		icon: ListTodo,
		title: 'Financial Categories',
		description: 'Organize your money flows',
		gradient: ['#22d3ee', '#1BD193'],
		route: '/categories',
		accentColor: '#1BD193',
	},
	{
		id: 'transactions',
		icon: CreditCard,
		title: 'Transaction Hub',
		description: 'Detailed financial tracking',
		gradient: ['#d97706', '#fcd34d'],
		route: '/transactions',
		accentColor: '#FF6B7A',
	},
];

const QuickLinkCard: React.FC<{
	item: QuickLinkItem;
	index: number;
}> = ({ item, index }) => {
	return (
		<Link href={item.route} asChild>
			<TouchableOpacity
				activeOpacity={0.8}
			>
				<View
					style={{
							marginBottom: 16,
							shadowColor: '#000',
							shadowOffset: { width: 0, height: 4 },
							shadowOpacity: 0.1,
							shadowRadius: 6,
							elevation: 5,
						}}
				>
					<LinearGradient
						colors={item.gradient}
						start={{ x: 0, y: 0 }}
						end={{ x: 1, y: 1 }}
						className="rounded-2xl overflow-hidden"
					>
						<View
							className="p-3 flex-row items-center bg-[rgba(255,255,255,0.1)] rounded-2xl"
						>
							{/* Icon Container */}
							<View
								className="mr-4 rounded-full p-3 items-center justify-centers "
								style={{
									backgroundColor: 'rgba(255,255,255,0.2)',
									shadowColor: '#000',
									shadowOffset: { width: 0, height: 2 },
									shadowOpacity: 0.1,
									shadowRadius: 4,
								}}
							>
								<item.icon color="#FFFFFF" size={24} />
							</View>

							{/* Content */}
							<View className="flex-1">
								<Text
									className="text-gray-800 font-amedium "
								>
									{item.title}
								</Text>
								<Text
									className="text-gray-500 text-opacity-80 text-sm font-aregular"
								>
									{item.description}
								</Text>
							</View>

							{/* Arrow */}
							<View
								className="rounded-full p-2 items-center justify-center"
								style={{
									backgroundColor: 'rgba(255,255,255,0.2)',
									shadowColor: '#000',
									shadowOffset: { width: 0, height: 2 },
									shadowOpacity: 0.1,
									shadowRadius: 4,
								}}
							>
								<ArrowRight color="#FFFFFF" size={20} />
							</View>
						</View>
					</LinearGradient>
				</View>
			</TouchableOpacity>
		</Link>
	);
};

const FinancialQuickLinks: React.FC = () => {
	return (
		<View
			className="px-2 pt-4 bg-gray-50 dark:bg-gray-900"
			style={{
				minHeight: 300,
				paddingBottom: 20,
			}}
		>
			<View className="mb-6">
				<Text
					className="text-xl font-rbold text-gray-900 dark:text-gray-100 mb-2 "
					style={{
						letterSpacing: -0.5,
						textShadowColor: 'rgba(0,0,0,0.05)',
						textShadowOffset: { width: 0, height: 1 },
						textShadowRadius: 2,
					}}
				>
					Financial Command Center
				</Text>
				<Text className="text-gray-600 dark:text-gray-300 text-base font-rregular mb-4">
					Quick access to your financial tools and insights
				</Text>
			</View>

			<View>
				{quickLinks.map((item, index) => (
					<QuickLinkCard key={item.id} item={item} index={index} />
				))}
			</View>
		</View>
	);
};

export default FinancialQuickLinks;
