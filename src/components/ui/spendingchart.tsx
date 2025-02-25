import { useState, useEffect, useRef } from 'react';
import { View, Text, Pressable, Dimensions, ScrollView } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { ChevronDown } from 'lucide-react-native';
import Animated, {
	useSharedValue,
	useAnimatedStyle,
	withTiming,
	Easing,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

const SpendingBarChart = (): React.ReactElement => {
	const [selectedPeriod, setSelectedPeriod] = useState<'Week' | 'Month' | 'Year'>('Month');
	const opacity = useSharedValue(0);
	const scale = useSharedValue(0.9);
	const scrollRef = useRef<ScrollView>(null);

	// Category data with colors - enhanced version
	const categories = [
		{ name: 'Food', percentage: 36, amount: 448.07, color: '#FFB800' },
		{ name: 'Transport', percentage: 20, amount: 248.93, color: '#3F7AFF' },
		{ name: 'Shopping', percentage: 8, amount: 99.57, color: '#FF5252' },
		{ name: 'Bills', percentage: 12, amount: 149.36, color: '#4CAF50' },
		{ name: 'Entertainment', percentage: 24, amount: 298.72, color: '#7B68EE' },
	];

	// Different data for each time period
	const data = {
		Week: {
			labels: categories.map((c) => c.name),
			datasets: [
				{
					data: [112, 62, 25, 37, 75],
					colors: categories.map((c) => () => c.color),
				},
			],
			total: 311.0,
		},
		Month: {
			labels: categories.map((c) => c.name),
			datasets: [
				{
					data: categories.map((c) => c.amount),
					colors: categories.map((c) => () => c.color),
				},
			],
			total: 1244.65,
		},
		Year: {
			labels: categories.map((c) => c.name),
			datasets: [
				{
					data: [5376.84, 2987.16, 1194.84, 1792.32, 3584.64],
					colors: categories.map((c) => () => c.color),
				},
			],
			total: 14935.8,
		},
	};

	const currentData = data[selectedPeriod];

	// Get month name based on current date console
	const getCurrentMonth = () => {
		const months = [
			'January',
			'February',
			'March',
			'April',
			'May',
			'June',
			'July',
			'August',
			'September',
			'October',
			'November',
			'December',
		];
		return months[new Date().getMonth()];
	};

	useEffect(() => {
		// Animate chart appearance
		opacity.value = withTiming(1, { duration: 800 });
		scale.value = withTiming(1, {
			duration: 800,
			easing: Easing.bezier(0.25, 0.1, 0.25, 1),
		});

		// Scroll to start when period changes
		if (scrollRef.current) {
			scrollRef.current.scrollTo({ x: 0, animated: true });
		}
	}, [selectedPeriod]);

	const animatedStyle = useAnimatedStyle(() => ({
		opacity: opacity.value,
		transform: [{ scale: scale.value }],
	}));

	const chartConfig = {
		backgroundGradientFrom: '#ffffff',
		backgroundGradientTo: '#ffffff',
		decimalPlaces: 0,
		barPercentage: 0.7,
		color: (opacity = 1, index = 0) => currentData.datasets[0].colors[index]?.() || '#000000',
		labelColor: () => '#6B7280',
		style: {
			borderRadius: 16,
		},
		propsForBackgroundLines: {
			strokeDasharray: '',
			strokeWidth: 1,
			stroke: '#E5E7EB',
		},
		propsForLabels: {
			fontSize: 10,
			fontWeight: '500',
		},
	};

	// Period selector with active indicator
	const PeriodSelector = () => (
		<View
			style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 16, marginBottom: 8 }}
		>
			{['Week', 'Month', 'Year'].map((period) => (
				<View key={period} style={{ position: 'relative' }}>
					<Pressable
						onPress={() => setSelectedPeriod(period as 'Week' | 'Month' | 'Year')}
						style={{
							paddingHorizontal: 16,
							paddingVertical: 8,
							marginHorizontal: 4,
							borderRadius: 20,
							backgroundColor: selectedPeriod === period ? '#F3F4FF' : 'transparent',
						}}
					>
						<Text
							style={{
								fontSize: 13,
								color: selectedPeriod === period ? '#3F7AFF' : '#9CA3AF',
								fontWeight: selectedPeriod === period ? '600' : '400',
							}}
						>
							{period}
						</Text>
					</Pressable>
					{selectedPeriod === period && (
						<View
							style={{
								position: 'absolute',
								bottom: 0,
								left: '50%',
								marginLeft: -3,
								width: 6,
								height: 6,
								borderRadius: 3,
								backgroundColor: '#3F7AFF',
							}}
						/>
					)}
				</View>
			))}
		</View>
	);

	return (
		<View className="flex">
			<Animated.View
				style={[animatedStyle]}
				className="w-full bg-white dark:bg-gray-800 rounded-3xl p-5 mb-4 shadow-lg"
			>
				<View
					style={{
						flexDirection: 'row',
						justifyContent: 'space-between',
						alignItems: 'center',
						marginBottom: 16,
					}}
				>
					<Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1F2937' }}>
						Spending Overview
					</Text>
					<View
						style={{
							flexDirection: 'row',
							alignItems: 'center',
							backgroundColor: '#F3F4F6',
							paddingHorizontal: 12,
							paddingVertical: 6,
							borderRadius: 20,
						}}
					>
						<Text style={{ color: '#374151', fontSize: 14, fontWeight: '500' }}>
							{selectedPeriod === 'Month' ? getCurrentMonth() : selectedPeriod}
						</Text>
						<ChevronDown size={14} color="#4B5563" style={{ marginLeft: 4 }} />
					</View>
				</View>

				<View style={{ alignItems: 'center', marginBottom: 8 }}>
					<Text style={{ color: '#6B7280', fontSize: 14 }}>Total Spending</Text>
					<Text style={{ fontSize: 32, fontWeight: 'bold', color: '#1F2937' }}>
						$
						{currentData.total.toLocaleString('en-US', {
							minimumFractionDigits: 2,
							maximumFractionDigits: 2,
						})}
					</Text>
				</View>

				<ScrollView
					ref={scrollRef}
					horizontal
					showsHorizontalScrollIndicator={false}
					contentContainerStyle={{ paddingRight: 20 }}
				>
					{/* <BarChart
						data={{
							labels: currentData.labels,
							datasets: currentData.datasets,
						}}
						width={Math.max(width - 40, width * 0.8)}
						height={220}
						yAxisLabel="$"
						yAxisSuffix="k"
						chartConfig={chartConfig}
						verticalLabelRotation={0}
						showValuesOnTopOfBars={true}
						withInnerLines={true}
						fromZero={true}
						style={{
							marginVertical: 8,
							borderRadius: 16,
						}}
					/> */}
				</ScrollView>

				<PeriodSelector />

				{/* Category Legend */}
				<ScrollView
					horizontal
					showsHorizontalScrollIndicator={false}
					style={{ marginTop: 16 }}
					contentContainerStyle={{ paddingRight: 20 }}
				>
					{categories.map((category, index) => (
						<View
							key={index}
							style={{
								flexDirection: 'row',
								alignItems: 'center',
								backgroundColor: `${category.color}15`,
								paddingHorizontal: 12,
								paddingVertical: 8,
								borderRadius: 20,
								marginRight: 8,
							}}
						>
							<View
								style={{
									width: 8,
									height: 8,
									borderRadius: 4,
									backgroundColor: category.color,
									marginRight: 6,
								}}
							/>
							<Text style={{ color: category.color, fontWeight: '500', fontSize: 12 }}>
								{category.name} ({category.percentage}%)
							</Text>
						</View>
					))}
				</ScrollView>
			</Animated.View>
		</View>
	);
};

export default SpendingBarChart;
