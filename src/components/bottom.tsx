import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
} from 'react-native-reanimated';
import React, { useCallback } from 'react';
import { observer } from '@legendapp/state/react';
import { colorScheme } from 'nativewind';
import { useSharedValue, withSpring } from 'react-native-reanimated';
import { Gesture, GestureDetector, ScrollView } from 'react-native-gesture-handler';
import { Dimensions, View } from 'react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const MAX_TRANSLATE_Y = -SCREEN_HEIGHT + 50;
// Bottom Sheet Component
export const BottomSheet = observer(
  ({
    children,
    isVisible,
    onClose,
  }: {
    children: React.ReactNode;
    isVisible: boolean;
    onClose: () => void;
  }) => {
    const translateY = useSharedValue(0);
    const context = useSharedValue({ y: 0 });
    const active = useSharedValue(false);
    const theme = colorScheme.get();

    const scrollTo = useCallback((destination: number) => {
      'worklet';
      active.value = destination !== 0;
      translateY.value = withSpring(destination, { damping: 50 });
    }, []);

    const gesture = Gesture.Pan()
      .onStart(() => {
        context.value = { y: translateY.value };
      })
      .onUpdate((event) => {
        translateY.value = event.translationY + context.value.y;
        translateY.value = Math.max(translateY.value, MAX_TRANSLATE_Y);
      })
      .onEnd(() => {
        if (translateY.value > -SCREEN_HEIGHT / 3) {
          scrollTo(0);
          runOnJS(onClose)();
        } else {
          scrollTo(MAX_TRANSLATE_Y);
        }
      });

    const rBottomSheetStyle = useAnimatedStyle(() => {
      const borderRadius = interpolate(
        translateY.value,
        [MAX_TRANSLATE_Y + 50, MAX_TRANSLATE_Y],
        [25, 5],
        Extrapolation.CLAMP
      );

      return {
        borderRadius,
        transform: [{ translateY: translateY.value }],
      };
    });

    React.useEffect(() => {
      if (isVisible) {
        scrollTo(MAX_TRANSLATE_Y);
      }
    }, [isVisible]);

    if (!isVisible) return null;

    return (
      <GestureDetector gesture={gesture}>
        <Animated.View
          style={[
            {
              height: SCREEN_HEIGHT - 300,
              width: '100%',
              position: 'absolute',
              top: SCREEN_HEIGHT + 250,
              backgroundColor: theme === 'dark' ? '#1F2937' : '#4b5563',
            },
            rBottomSheetStyle,
          ]}
          className="bg-white dark:bg-gray-800"
        >
          <View className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full self-center my-3" />
          <ScrollView className="flex-1">{children}</ScrollView>
        </Animated.View>
      </GestureDetector>
    );
  }
);
