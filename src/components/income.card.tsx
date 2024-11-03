import React from 'react';
import { View, Text, Animated, Dimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Feather } from '@expo/vector-icons';
import { format } from 'date-fns';
import { IncomeEntry } from 'src/storage';
import { runOnJS, useSharedValue, withSpring, withTiming, withSequence, useAnimatedStyle } from 'react-native-reanimated';
import { interpolate } from 'react-native-reanimated';

const SCREEN_WIDTH = Dimensions.get('window').width;
const DELETE_THRESHOLD = -SCREEN_WIDTH * 0.3; // 30% of screen width

const IncomeCard = ({ income, onDelete }: { income: IncomeEntry; onDelete: () => void }) => {
  const translateX = useSharedValue(0);
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);
  const opacity = useSharedValue(1);

  const panGesture = Gesture.Pan()
    .activeOffsetX(-10)
    .onUpdate((event) => {
      translateX.value = Math.min(0, event.translationX);
      
      // Add subtle rotation based on drag distance
      rotation.value = interpolate(
        event.translationX,
        [-200, 0],
        [-10, 0]
      );
      
      // Slightly scale down as user drags
      scale.value = interpolate(
        Math.abs(event.translationX),
        [0, 200],
        [1, 0.95],
        'clamp'
      );
    })
    .onEnd(() => {
      if (translateX.value < DELETE_THRESHOLD) {
        // Trigger delete animation sequence
        translateX.value = withSequence(
          // First bounce slightly back
          withSpring(translateX.value + 50, {
            damping: 20,
            stiffness: 200,
          }),
          // Then slide out with rotation
          withTiming(-SCREEN_WIDTH, {
            duration: 300,
          })
        );
        
        // Rotate and scale down while sliding out
        rotation.value = withTiming(-45, {
          duration: 300,
        });
        
        scale.value = withTiming(0.5, {
          duration: 300,
        });
        
        // Fade out
        opacity.value = withTiming(0, {
          duration: 300,
        }, (finished) => {
          if (finished) {
            runOnJS(onDelete)();
          }
        });
      } else {
        // Spring back to original position
        translateX.value = withSpring(0, {
          damping: 15,
          stiffness: 150,
        });
        rotation.value = withSpring(0);
        scale.value = withSpring(1);
      }
    });

  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { scale: scale.value },
      { rotate: `${rotation.value}deg` }
    ],
    opacity: opacity.value,
  }));

  const deleteIconStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [-100, -50],
      [1, 0],
      'clamp'
    ),
    transform: [
      { scale: interpolate(
        translateX.value,
        [-100, -50],
        [1.2, 0.8],
        'clamp'
      )}
    ]
  }));

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-red-100 text-red-800';
    }
  };

  return (
    <View className="mb-4">
      {/* Delete Icon Background */}
      <Animated.View 
        className="absolute right-5 top-1/2 -translate-y-3"
        style={deleteIconStyle}
      >
        <Feather name="trash-2" size={24} color="#EF4444" />
      </Animated.View>

      {/* Card Content */}
      <GestureDetector gesture={panGesture}>
        <Animated.View 
          className="bg-white rounded-2xl shadow-md border border-gray-100"
          style={cardStyle}
        >
          <View className="p-4">
            {/* Header Section */}
            <View className="flex-row justify-between items-start mb-3">
              <View className="flex-1 mr-4">
                <Text className="text-lg font-semibold text-gray-900 mb-1">
                  {income.title}
                </Text>
                <Text className="text-sm text-gray-500">
                  {income.description}
                </Text>
              </View>
              
              <Text 
                className={`text-lg font-bold ${
                  income.isUp ? 'text-green-500' : 'text-red-500'
                }`}
              >
                ${income.amount.toLocaleString()}
              </Text>
            </View>

            {/* Footer Section */}
            <View className="flex-row justify-between items-center">
              {/* Categories */}
              <View className="flex-row gap-2">
                <View className="bg-blue-100 px-3 py-1 rounded-full">
                  <Text className="text-xs font-medium text-blue-800">
                    {income.category}
                  </Text>
                </View>
                
                <View className={`px-3 py-1 rounded-full ${getStatusStyles(income.status)}`}>
                  <Text className="text-xs font-medium">
                    {income.status}
                  </Text>
                </View>
              </View>

              {/* Date and Trend */}
              <View className="flex-row items-center gap-2">
                <Text className="text-xs text-gray-500">
                  {format(new Date(`${income.date}T${income.time}`), 'MMM d, h:mm a')}
                </Text>
                
                <Text 
                  className={`text-xs font-medium ${
                    income.isUp ? 'text-green-500' : 'text-red-500'
                  }`}
                >
                  {income.trend}
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

export default IncomeCard;