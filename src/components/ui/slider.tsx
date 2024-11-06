import React, { useEffect, useCallback } from 'react';
import { View, I18nManager, LayoutChangeEvent, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  useAnimatedReaction,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

interface SliderProps {
  value: number;
  minimumValue: number;
  maximumValue: number;
  step?: number;
  minimumTrackTintColor?: string;
  maximumTrackTintColor?: string;
  thumbTintColor?: string;
  thumbStyle?: ViewStyle;
  trackStyle?: ViewStyle;
  style?: ViewStyle;
  disabled?: boolean;
  onValueChange?: (value: number) => void;
  onSlidingStart?: (value: number) => void;
  onSlidingComplete?: (value: number) => void;
  inverted?: boolean;
}

const Slider: React.FC<SliderProps> = ({
  value,
  minimumValue,
  maximumValue,
  step = 0,
  minimumTrackTintColor = '#3f3f3f',
  maximumTrackTintColor = '#b3b3b3',
  thumbTintColor = '#343434',
  thumbStyle = {},
  trackStyle = {},
  style = {},
  disabled = false,
  onValueChange = () => {},
  onSlidingStart = () => {},
  onSlidingComplete = () => {},
  inverted = false,
}) => {
  const containerWidth = useSharedValue(0);
  const translateX = useSharedValue(0);
  const isSliding = useSharedValue(false);
  const prevTranslateX = useSharedValue(0);

  const getValueFromOffset = useCallback(
    (offset: number): number => {
      'worklet';
      const range = maximumValue - minimumValue;
      let newValue = (offset / containerWidth.value) * range + minimumValue;

      if (step > 0) {
        newValue = Math.round(newValue / step) * step;
      }

      return Math.max(minimumValue, Math.min(maximumValue, newValue));
    },
    [minimumValue, maximumValue, step, containerWidth]
  );

  const getOffsetFromValue = useCallback(
    (val: number): number => {
      'worklet';
      const range = maximumValue - minimumValue;
      return ((val - minimumValue) / range) * containerWidth.value;
    },
    [minimumValue, maximumValue, containerWidth]
  );

  useAnimatedReaction(
    () => value,
    (currentValue) => {
      if (!isSliding.value && containerWidth.value > 0) {
        const offset = getOffsetFromValue(currentValue);
        translateX.value = withSpring(inverted ? containerWidth.value - offset : offset, {
          damping: 20,
          stiffness: 300,
        });
      }
    },
    [value, containerWidth.value, inverted]
  );

  const gesture = Gesture.Pan()
    .enabled(!disabled)
    .onStart(() => {
      isSliding.value = true;
      prevTranslateX.value = translateX.value;
      const currentValue = getValueFromOffset(
        inverted ? containerWidth.value - translateX.value : translateX.value
      );
      runOnJS(onSlidingStart)(currentValue);
    })
    .onUpdate((event) => {
      const newTranslateX =
        prevTranslateX.value + event.translationX * (I18nManager.isRTL ? -1 : 1);
      translateX.value = Math.max(0, Math.min(containerWidth.value, newTranslateX));

      const newValue = getValueFromOffset(
        inverted ? containerWidth.value - translateX.value : translateX.value
      );
      runOnJS(onValueChange)(newValue);
    })
    .onEnd(() => {
      isSliding.value = false;
      const finalValue = getValueFromOffset(
        inverted ? containerWidth.value - translateX.value : translateX.value
      );
      runOnJS(onSlidingComplete)(finalValue);
    });

  const measureContainer = useCallback(
    (event: LayoutChangeEvent) => {
      const { width } = event.nativeEvent.layout;
      containerWidth.value = width;
    },
    [containerWidth]
  );

  const animatedThumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    scale: withSpring(isSliding.value ? 1.2 : 1),
  }));

  const animatedTrackStyle = useAnimatedStyle(() => ({
    width: inverted ? containerWidth.value - translateX.value : translateX.value,
  }));

  return (
    <View className="h-10 justify-center" style={style} onLayout={measureContainer}>
      <View
        className="h-1 rounded"
        style={[{ backgroundColor: maximumTrackTintColor }, trackStyle]}
      />
      <Animated.View
        className="absolute h-1 rounded"
        style={[{ backgroundColor: minimumTrackTintColor }, trackStyle, animatedTrackStyle]}
      />
      <GestureDetector gesture={gesture}>
        <Animated.View
          className="absolute w-5 h-5 rounded-full shadow-md"
          style={[
            {
              backgroundColor: thumbTintColor,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 3,
            },
            thumbStyle,
            animatedThumbStyle,
          ]}
        />
      </GestureDetector>
    </View>
  );
};

export default Slider;
