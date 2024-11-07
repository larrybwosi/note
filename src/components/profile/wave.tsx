import React, { useEffect } from 'react';
import { View, Text, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

interface WaveProgressProps {
  progress: number;
  label: string;
  value: string;
  color: string;
  height?: number;
  waveSpeed?: number;
  waveAmplitude?: number;
  style?: ViewStyle;
}

export const WaveProgress: React.FC<WaveProgressProps> = ({
  progress,
  label,
  value,
  color,
  height = 128,
  waveSpeed = 1000,
  waveAmplitude = 20,
  style,
}) => {
  const waveOffset = useSharedValue(0);
  const progressHeight = useSharedValue(0);

  useEffect(() => {
    waveOffset.value = withRepeat(
      withTiming(-100, { duration: waveSpeed, easing: Easing.linear }),
      -1,
      false
    );
    progressHeight.value = withTiming(progress, { duration: 1000 });
  }, [progress, waveSpeed]);

  const waveStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: waveOffset.value }],
  }));

  const containerStyle = useAnimatedStyle(() => ({
    height: `${progressHeight.value}%`,
  }));

  const createWavePath = (width: number, height: number, amplitude: number) => {
    const wavelength = width / 2;
    let path = `M 0 ${height} `;
    for (let i = 0; i <= width; i++) {
      const x = i;
      const y = Math.sin((i / wavelength) * 2 * Math.PI) * amplitude + (height - amplitude);
      path += `L ${x} ${y} `;
    }
    path += `L ${width} ${height} L 0 ${height} Z`;
    return path;
  };

  return (
    <View style={[{ height, overflow: 'hidden', borderRadius: 16 }, style]} className="bg-gray-100">
      <Animated.View 
        className="absolute bottom-0 w-full"
        style={containerStyle}
      >
        <Animated.View style={[waveStyle, { height: height * 2, width: '200%' }]}>
          <LinearGradient
            colors={[color, color.replace('1)', '0.6)')]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={{ flex: 1 }}
          >
            {/* <Animated.Svg width="100%" height="100%" viewBox={`0 0 ${height * 2} ${height}`}>
              <Animated.Path
                d={createWavePath(height * 2, height, waveAmplitude)}
                fill={color.replace('1)', '0.8)')}
              />
            </Animated.Svg> */}
          </LinearGradient>
        </Animated.View>
      </Animated.View>
      <View className="absolute inset-0 items-center justify-center">
        <Text className="text-2xl font-['Poppins-Bold'] text-gray-800">{value}</Text>
        <Text className="text-sm font-['Poppins-Regular'] text-gray-600">{label}</Text>
      </View>
    </View>
  );
};