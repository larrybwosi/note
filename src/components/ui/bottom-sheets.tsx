import { useCallback, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Animated,
  TouchableWithoutFeedback,
  Dimensions,
  PanResponder,
  StatusBar,
  BackHandler,
  Platform,
  Modal,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface BottomSheetProps {
  isVisible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  height?: number | string;
  snapPoints?: number[];
  closeOnBackdropPress?: boolean;
  closeOnDragDown?: boolean;
  backdropOpacity?: number;
  headerComponent?: React.ReactNode;
  footerComponent?: React.ReactNode;
  customStyle?: object;
  enablePanDownToClose?: boolean;
  animationDuration?: number;
  animationConfig?: Animated.SpringAnimationConfig;
}

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const BottomSheet: React.FC<BottomSheetProps> = ({
  isVisible,
  onClose,
  children,
  height = SCREEN_HEIGHT * 0.5,
  snapPoints,
  closeOnBackdropPress = true,
  closeOnDragDown = true,
  backdropOpacity = 0.5,
  headerComponent,
  footerComponent,
  customStyle = {},
  enablePanDownToClose = true,
  animationDuration = 300,
  animationConfig = { tension: 40, friction: 8 },
}) => {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropOpacityAnim = useRef(new Animated.Value(0)).current;
  const lastGestureState = useRef({ dy: 0 });

  // Calculate actual height based on prop or screen height
  const actualHeight =
    typeof height === "number" ? height : SCREEN_HEIGHT * 0.5;
  const initialSnapPoint = snapPoints ? snapPoints[0] : actualHeight;

  // Reset animation when sheet is closed
  useEffect(() => {
    if (!isVisible) {
      translateY.setValue(SCREEN_HEIGHT);
      backdropOpacityAnim.setValue(0);
    }
  }, [isVisible]);

  // Handle back button press
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        if (isVisible) {
          onClose();
          return true;
        }
        return false;
      }
    );

    return () => backHandler.remove();
  }, [isVisible, onClose]);

  // Animate sheet opening/closing
  useEffect(() => {
    if (isVisible) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: SCREEN_HEIGHT - initialSnapPoint,
          useNativeDriver: true,
          ...animationConfig,
        }),
        Animated.timing(backdropOpacityAnim, {
          toValue: backdropOpacity,
          duration: animationDuration,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: SCREEN_HEIGHT,
          useNativeDriver: true,
          ...animationConfig,
        }),
        Animated.timing(backdropOpacityAnim, {
          toValue: 0,
          duration: animationDuration,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isVisible, initialSnapPoint, backdropOpacity]);

  // Handle snapping to points
  const snapToPoint = useCallback((point: number) => {
    Animated.spring(translateY, {
      toValue: SCREEN_HEIGHT - point,
      useNativeDriver: true,
      ...animationConfig,
    }).start();
  }, []);

  // Create pan responder for gesture handling
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return gestureState.dy > 10;
      },
      onPanResponderGrant: () => {
        translateY.extractOffset();
      },
      onPanResponderMove: (_, gestureState) => {
        // Only allow dragging down, not up past the initial position
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
        lastGestureState.current = gestureState;
      },
      onPanResponderRelease: (_, gestureState) => {
        translateY.flattenOffset();

        // Determine if we should close or snap
        const currentPosition =
          SCREEN_HEIGHT - initialSnapPoint + gestureState.dy;

        // Close if dragged down more than 30% of the sheet height
        if (gestureState.dy > initialSnapPoint * 0.3 && enablePanDownToClose) {
          onClose();
          return;
        }

        // Snap to the nearest point if snapPoints are provided
        if (snapPoints && snapPoints.length > 0) {
          const currentPositionFromBottom = SCREEN_HEIGHT - currentPosition;

          // Find the nearest snap point
          let nearestPoint = snapPoints[0];
          let minDistance = Math.abs(currentPositionFromBottom - snapPoints[0]);

          for (let i = 1; i < snapPoints.length; i++) {
            const distance = Math.abs(
              currentPositionFromBottom - snapPoints[i]
            );
            if (distance < minDistance) {
              minDistance = distance;
              nearestPoint = snapPoints[i];
            }
          }

          snapToPoint(nearestPoint);
        } else {
          // If no snap points, just return to initial position
          snapToPoint(initialSnapPoint);
        }
      },
    })
  ).current;

  if (!isVisible && !translateY._value) return null;

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View className="flex-1">
        {/* Backdrop */}
        <TouchableWithoutFeedback
          onPress={closeOnBackdropPress ? onClose : undefined}
        >
          <Animated.View
            className="absolute inset-0 bg-black"
            style={{ opacity: backdropOpacityAnim }}
          />
        </TouchableWithoutFeedback>

        {/* Bottom Sheet */}
        <Animated.View
          className="absolute left-0 right-0 bg-white rounded-t-3xl shadow-lg"
          style={[
            {
              minHeight: actualHeight,
              paddingBottom: insets.bottom,
              transform: [{ translateY }],
            },
            customStyle,
          ]}
        >
          {/* Drag Handle */}
          <View
            {...(closeOnDragDown ? panResponder.panHandlers : {})}
            className="w-full items-center pt-2 pb-5"
          >
            <View className="w-12 h-1 bg-gray-300 rounded-full" />
          </View>

          {/* Header */}
          {headerComponent && (
            <View className="px-4 pb-4">{headerComponent}</View>
          )}

          {/* Content */}
          <View className="flex-1 px-4">{children}</View>

          {/* Footer */}
          {footerComponent && (
            <View className="px-4 pt-2 pb-4">{footerComponent}</View>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
};

export default BottomSheet;
