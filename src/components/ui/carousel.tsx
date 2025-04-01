import React, { useState, useRef, useEffect } from "react";
import {
  View,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Image,
  Text,
  StyleSheet,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

interface CarouselItem {
  id: string;
  imageUrl: string;
  title: string;
  description: string;
}

interface CarouselProps {
  data: CarouselItem[];
  autoPlay?: boolean;
  interval?: number;
  showDots?: boolean;
  showControls?: boolean;
  onItemPress?: (item: CarouselItem) => void;
}

const { width: screenWidth } = Dimensions.get("window");

const Carousel: React.FC<CarouselProps> = ({
  data,
  autoPlay = true,
  interval = 3000,
  showDots = true,
  showControls = true,
  onItemPress,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Handle scroll events
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(contentOffsetX / screenWidth);
    if (newIndex !== activeIndex) {
      setActiveIndex(newIndex);
    }
  };

  // Scroll to a specific index
  const scrollToIndex = (index: number) => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        x: index * screenWidth,
        animated: true,
      });
      setActiveIndex(index);
    }
  };

  // Auto play functionality
  useEffect(() => {
    if (autoPlay) {
      startAutoPlay();
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [autoPlay, activeIndex]);

  const startAutoPlay = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      const nextIndex = (activeIndex + 1) % data.length;
      scrollToIndex(nextIndex);
    }, interval);
  };

  const pauseAutoPlay = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // Navigation controls
  const goToPrevious = () => {
    const prevIndex = (activeIndex - 1 + data.length) % data.length;
    scrollToIndex(prevIndex);
  };

  const goToNext = () => {
    const nextIndex = (activeIndex + 1) % data.length;
    scrollToIndex(nextIndex);
  };

  return (
    <View className="flex-1">
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        onScrollBeginDrag={pauseAutoPlay}
        onScrollEndDrag={startAutoPlay}
        className="w-full h-64"
      >
        {data.map((item, index) => (
          <TouchableOpacity
            key={item.id}
            activeOpacity={0.9}
            onPress={() => onItemPress && onItemPress(item)}
            className="w-full h-full"
            style={{ width: screenWidth }}
          >
            <Image
              source={{ uri: item.imageUrl }}
              className="w-full h-full rounded-lg"
              resizeMode="cover"
            />
            <View className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-4 rounded-b-lg">
              <Text className="text-white text-lg font-bold">{item.title}</Text>
              <Text className="text-white text-sm">{item.description}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Dots indicator */}
      {showDots && (
        <View className="flex-row justify-center items-center mt-2">
          {data.map((_, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => scrollToIndex(index)}
              className={`h-2 w-2 rounded-full mx-1 ${
                index === activeIndex ? "bg-blue-500" : "bg-gray-300"
              }`}
            />
          ))}
        </View>
      )}

      {/* Navigation controls */}
      {showControls && (
        <View className="flex-row justify-between absolute left-0 right-0 top-1/2 px-4 -mt-6">
          <TouchableOpacity
            onPress={goToPrevious}
            className="w-12 h-12 rounded-full bg-white bg-opacity-30 justify-center items-center"
          >
            <Text className="text-white text-xl font-bold">{"<"}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={goToNext}
            className="w-12 h-12 rounded-full bg-white bg-opacity-30 justify-center items-center"
          >
            <Text className="text-white text-xl font-bold">{">"}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default Carousel;
