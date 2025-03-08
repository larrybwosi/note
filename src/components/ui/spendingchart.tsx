import { useState, useEffect, useRef } from 'react';
import { Dimensions, Pressable, ScrollView, Text, View } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { ChevronDown } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  FadeInDown,
  LinearTransition,
} from 'react-native-reanimated';
import useStore from "src/store/useStore";
import { ICON_MAP, IconName, TransactionType } from "src/types/transaction";
import { formatCurrency } from 'src/utils/currency';

const { width } = Dimensions.get('window');

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  color: string;
  icon: IconName;
  isCustom?: boolean;
  subcategories?: string[];
  monthlyTotal?: number;
  monthlyChange?: number;
  colors?: string[];
}

const SpendingBarChart = (): React.ReactElement => {
  const [selectedPeriod, setSelectedPeriod] = useState<'Week' | 'Month' | 'Year'>('Month');
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.9);
  const scrollRef = useRef<ScrollView>(null);
  //transform
  const { categories, getCategoryMonthlyTotal } = useStore();
  const EXPENSE_CATEGORIES = categories.filter((cat) => cat.type === 'expense');

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 800 });
    scale.value = withTiming(1, {
      duration: 800,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });

    if (scrollRef.current) {
      scrollRef.current.scrollTo({ x: 0, animated: true });
    }
  }, [selectedPeriod]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));
  
  const calculateTotalSpending = () => {
    return EXPENSE_CATEGORIES.reduce((total, category) => {
      const categoryTotal = getCategoryMonthlyTotal(category.id) || 0;
      return total + categoryTotal;
    }, 0);
  };
  
  const getCategoryPercentage = (categoryTotal: number) => {
    const total = calculateTotalSpending();
    return total > 0 ? Math.round((categoryTotal / total) * 100) : 0;
  };
  
  const prepareChartData = () => {
    switch (selectedPeriod) {
      case 'Week':
        return {
          labels: EXPENSE_CATEGORIES.map(c => c.name),
          datasets: [{
            data: EXPENSE_CATEGORIES.map(c => (c.monthlyTotal || 0) / 4),
            colors: EXPENSE_CATEGORIES.map(c => () => c.color),
          }],
          total: calculateTotalSpending() / 4,
        };
      case 'Month':
        return {
					labels: EXPENSE_CATEGORIES.map((c) => c.name),
					datasets: [
						{
							data: EXPENSE_CATEGORIES.map((c) => getCategoryMonthlyTotal(c.id) || 0),
							colors: EXPENSE_CATEGORIES.map((c) => () => c.color),
						},
					],
					total: calculateTotalSpending(),
				};
      case 'Year':
        return {
          labels: EXPENSE_CATEGORIES.map(c => c.name),
          datasets: [{
            data: EXPENSE_CATEGORIES.map(c => (c.monthlyTotal || 0) * 12),
            colors: EXPENSE_CATEGORIES.map(c => () => c.color),
          }],
          total: calculateTotalSpending() * 12,
        };
      default:
        return {
          labels: EXPENSE_CATEGORIES.map(c => c.name),
          datasets: [{
            data: EXPENSE_CATEGORIES.map(c => c.monthlyTotal || 0),
            colors: EXPENSE_CATEGORIES.map(c => () => c.color),
          }],
          total: calculateTotalSpending(),
        };
    }
  };

  const currentData = prepareChartData();

  const getCurrentMonth = () => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ];
    return months[new Date().getMonth()];
  };

  const chartConfig = {
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    barPercentage: 0.65,
    color: (opacity = 1, index = 0) => currentData.datasets[0].colors[index]?.() || '#000000',
    labelColor: () => '#6B7280',
    fillShadowGradientOpacity: 1,
    fillShadowGradient: "#000000",
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

  const PeriodSelector = () => (
    <View className="flex-row justify-center mt-4 mb-2 bg-gray-100 rounded-2xl p-1">
      {['Week', 'Month', 'Year'].map((period) => (
        <Pressable
          key={period}
          onPress={() => setSelectedPeriod(period as 'Week' | 'Month' | 'Year')}
          className={`px-4 py-2 rounded-xl ${
            selectedPeriod === period ? 'bg-white shadow' : ''
          }`}
        >
          <Text className={`text-xs font-rmedium ${
            selectedPeriod === period ? 'text-blue-600 font-semibold' : 'text-gray-400'
          }`}>
            {period}
          </Text>
          {selectedPeriod === period && (
            <View className="absolute bottom-0.5 left-1/2 -ml-1.5 w-1.5 h-1.5 rounded-full bg-blue-600" />
          )}
        </Pressable>
      ))}
    </View>
  );


  return (
    <Animated.View
      entering={FadeInDown.delay(300).duration(700).springify()}
      style={animatedStyle}
      layout={LinearTransition.springify()}
      className="w-full bg-white dark:bg-gray-800 rounded-3xl p-5 mb-4 shadow-lg"
    >
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-lg font-rbold text-gray-800">Spending Overview</Text>
        <Pressable className="bg-gray-100 px-3 py-1.5 rounded-xl flex-row items-center">
          <Text className="text-sm font-medium text-gray-700">
            {selectedPeriod === 'Month' ? getCurrentMonth() : selectedPeriod}
          </Text>
          <ChevronDown size={14} className="text-gray-600 ml-1" />
        </Pressable>
      </View>

      <View className="items-center mb-3">
        <Text className="text-sm text-gray-500 font-amedium">Total Spending</Text>
        <Text className="text-3xl font-bold text-gray-800">
          {formatCurrency(currentData.total)}
        </Text>
      </View>

      {EXPENSE_CATEGORIES.length > 0 ? (
        <>
          <ScrollView
            ref={scrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 20 }}
          >
            <BarChart
              data={{
                labels: currentData.labels,
                datasets: currentData.datasets,
              }}
              width={Math.max(width - 40, Math.max(width * 0.9, EXPENSE_CATEGORIES.length * 80))}
              height={220}
              yAxisLabel="$"
              yAxisSuffix=""
              chartConfig={chartConfig}
              verticalLabelRotation={30}
              showValuesOnTopOfBars={true}
              withInnerLines={true}
              fromZero={true}
            />
          </ScrollView>

          <PeriodSelector />

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mt-5"
            contentContainerStyle={{ paddingRight: 20 }}
          >
            {EXPENSE_CATEGORIES.map((category, index) => {
              const categoryTotal = category.monthlyTotal || 0;
              const percentage = getCategoryPercentage(categoryTotal);
              const Icon = ICON_MAP[category.icon];
              
              return (
                <Animated.View
                  key={category.id}
                  entering={FadeInDown.delay(400 + index * 100).duration(600)}
                  style={{ backgroundColor: `${category.color}15` }}
                  className="flex-row items-center px-2 py-2 rounded-2xl mr-2 min-w-[120px]"
                >
                  {Icon && (
                    <View 
                      style={{ backgroundColor: category.color }}
                      className="w-6 h-6 rounded-full mr-2 justify-center items-center"
                    >
                      <Icon size={14} color={'gray'} className="text-white" />
                    </View>
                  )}
                  <View className="flex-1">
                    <Text style={{ color: category.color }} className="text-xs font-semibold">
                      {category.name}
                    </Text>
                    <Text className="text-[10px] text-gray-500 mt-0.5">
                      {formatCurrency(categoryTotal)}
                    </Text>
                  </View>
                  <View 
                    style={{ backgroundColor: `${category.color}30` }}
                    className="px-1.5 py-0.5 rounded-lg ml-1"
                  >
                    <Text style={{ color: category.color }} className="text-[10px] font-bold">
                      {percentage}%
                    </Text>
                  </View>
                </Animated.View>
              );
            })}
          </ScrollView>
        </>
      ) : (
        <View className="h-56 justify-center items-center">
          <Text className="text-base text-gray-400">No expense categories found</Text>
        </View>
      )}
    </Animated.View>
  );
};

export default SpendingBarChart;