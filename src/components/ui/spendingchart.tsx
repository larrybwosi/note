import { ChevronDown } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import Svg, { Path, Circle } from 'react-native-svg';

const SpendingChart = (): React.ReactElement => {
  const rotation = useSharedValue(0);
  const [selectedPeriod, setSelectedPeriod] = useState<'Week' | 'Month' | 'Year'>('Month');

  useEffect(() => {
    rotation.value = withTiming(360, {
      duration: 1500,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotateZ: `${rotation.value}deg` }],
  }));

  const describeArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number): string => {
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
    return `M ${x} ${y} L ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y} Z`;
  };

  const polarToCartesian = (x: number, y: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: x + radius * Math.cos(angleInRadians),
      y: y + radius * Math.sin(angleInRadians),
    };
  };

  const segments = [
    { percentage: 36, color: '#FFB800' }, // Yellow
    { percentage: 20, color: '#3F7AFF' }, // Blue
    { percentage: 8, color: '#FF5252' },  // Red
    { percentage: 12, color: '#4CAF50' }, // Green
    { percentage: 24, color: '#7B68EE' }, // Purple
  ];

  let startAngle = 0;
  const totalRadius = 50;
  const center = { x: totalRadius, y: totalRadius };

  return (
		<View className="flex">
			<Animated.View className="w-full bg-white dark:bg-gray-800 rounded-3xl p-4 mb-4 shadow-lg dark:shadow-gray-900">
				<View style={{ alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
					<Animated.View style={[animatedStyle]}>
						<Svg height="200" width="200" viewBox="0 0 100 100">
							{segments.map((segment, index) => {
								const endAngle = startAngle + (segment.percentage / 100) * 360;
								const path = describeArc(center.x, center.y, totalRadius, startAngle, endAngle);
								startAngle = endAngle;
								return <Path key={index} d={path} fill={segment.color} opacity={0.9} />;
							})}
							<Circle cx="50" cy="50" r="35" fill="white" />
						</Svg>
					</Animated.View>

					<View style={{ position: 'absolute', zIndex: 10, alignItems: 'center' }}>
						<View style={{ flexDirection: 'row', alignItems: 'center' }}>
							<Text style={{ color: '#6B7280', fontSize: 14 }}>
								Spent this <Text style={{ fontWeight: '600', color: '#374151' }}>April</Text>
							</Text>
							<ChevronDown size={14} color="#4B5563" style={{ marginLeft: 4 }} />
						</View>
						<Text style={{ fontSize: 32, fontWeight: 'bold', marginTop: 4, color: '#1F2937' }}>
							$1,244.65
						</Text>
					</View>

					<Text style={{ position: 'absolute', top: 16, right: 40, color: '#3F7AFF' }}>20%</Text>
					<Text style={{ position: 'absolute', top: 40, right: 8, color: '#FF5252' }}>8%</Text>
					<Text style={{ position: 'absolute', right: 24, top: 96, color: '#4CAF50' }}>12%</Text>
					<Text style={{ position: 'absolute', bottom: 40, right: 40, color: '#7B68EE' }}>24%</Text>
					<Text style={{ position: 'absolute', bottom: 64, left: 16, color: '#FFB800' }}>36%</Text>
				</View>

				<View
					style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 24, marginBottom: 8 }}
				>
					{['Week', 'Month', 'Year'].map((period) => (
						<Pressable
							key={period}
							onPress={() => setSelectedPeriod(period as 'Week' | 'Month' | 'Year')}
							style={{ paddingHorizontal: 16, paddingVertical: 4, marginHorizontal: 4 }}
						>
							<Text
								style={{
									fontSize: 12,
									color: selectedPeriod === period ? '#1F2937' : '#9CA3AF',
									fontWeight: selectedPeriod === period ? '500' : '400',
								}}
								className="font-amedium"
							>
								{period}
							</Text>
						</Pressable>
					))}
				</View>
			</Animated.View>
		</View>
	);
};

export default SpendingChart;