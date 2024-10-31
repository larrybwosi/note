import React, { useCallback } from 'react'
import { View, Text, TouchableOpacity, Pressable } from 'react-native'
import Animated, { 
  FadeIn, 
  FadeOut, 
  Layout, 
  SlideInRight,
  withSpring,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
  useSharedValue,
  withSequence
} from 'react-native-reanimated'
import { Ionicons } from '@expo/vector-icons'
import { format } from 'date-fns'
import { handleDeleteItem } from 'src/storage/schedule.modify'
import { ScheduleItem } from 'src/storage/schedule'


interface ItemCardProps {
  item: ScheduleItem
  onPostpone: (id: number) => void
  onComplete: (id: number) => void
  handlePostpone: (id: number) => void
  theme: 'light' | 'dark'
  customStyles?: {
    cardBg?: string
    textColor?: string
    accentColor?: string
    fontFamily?: {
      regular: string
      medium: string
      bold: string
    }
  }
}

const defaultStyles = {
  cardBg: 'bg-white dark:bg-gray-800',
  textColor: 'text-gray-900 dark:text-white',
  accentColor: 'blue',
  fontFamily: {
    regular: 'System',
    medium: 'System',
    bold: 'System'
  }
}

const priorityConfig = {
  Low: {
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
    border: "border-emerald-200 dark:border-emerald-700",
    text: "text-emerald-700 dark:text-emerald-400",
    icon: "leaf",
  },
  Medium: {
    bg: "bg-amber-50 dark:bg-amber-900/20",
    border: "border-amber-200 dark:border-amber-700",
    text: "text-amber-700 dark:text-amber-400",
    icon: "time",
  },
  High: {
    bg: "bg-rose-50 dark:bg-rose-900/20",
    border: "border-rose-200 dark:border-rose-700",
    text: "text-rose-700 dark:text-rose-400",
    icon: "alert-circle",
  },
  Critical: {
    bg: "bg-red-50 dark:bg-red-900/20",
    border: "border-red-200 dark:border-red-700",
    text: "text-red-700 dark:text-red-400",
    icon: "alert-circle",
  }
}

export const ItemCard: React.FC<ItemCardProps> = ({ 
  item, 
  onPostpone, 
  onComplete,
  theme,
  handlePostpone,
  customStyles = defaultStyles 
}) => {
  const pressAnim = useSharedValue(1)
  const cardElevation = useSharedValue(2)
  const completedAnim = useSharedValue(item.completed ? 0.5 : 1)

  const handlePressIn = useCallback(() => {
    pressAnim.value = withSpring(0.98)
    cardElevation.value = withSpring(4)
  }, [])

  const handlePressOut = useCallback(() => {
    pressAnim.value = withSpring(1)
    cardElevation.value = withSpring(2)
  }, [])

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressAnim.value }],
    opacity: completedAnim.value,
    elevation: cardElevation.value,
  }))

  const PriorityBadge = ({ priority }: { priority: ScheduleItem['priority'] }) => (
    <View className={`flex-row items-center px-2 py-1 rounded-lg ${priorityConfig[priority].bg} border ${priorityConfig[priority].border}`}>
      <Ionicons 
        name={priorityConfig[priority].icon as any} 
        size={12} 
        color={theme === 'light' ? '#374151' : '#E5E7EB'} 
        style={{ marginRight: 4 }} 
      />
      <Text className={`text-xs font-rmedium ${priorityConfig[priority].text}`}>
        {priority.charAt(0)?.toUpperCase() + priority.slice(1)}
      </Text>
    </View>
  )

  const renderRightActions = () => (
    <View className="flex-row gap-2 items-center pr-4">
      <TouchableOpacity 
        onPress={() => onComplete(item.id)}
        className="bg-emerald-500 w-16 h-full justify-center items-center rounded-lg"
      >
        <Ionicons name="checkmark" size={24} color="white" />
      </TouchableOpacity>
      <TouchableOpacity 
        onPress={() => handleDeleteItem(item.id)}
        className="bg-rose-500 w-16 h-full justify-center items-center rounded-lg"
      >
        <Ionicons name="trash" size={24} color="white" />
      </TouchableOpacity>
    </View>
  )

  const handleComplete = useCallback(() => {
    completedAnim.value = withSequence(
      withTiming(0.8, { duration: 100 }),
      withTiming(0.5, { duration: 200 })
    )
    onComplete(item.id)
  }, [item.id, onComplete])


  return (
    <Animated.View
      entering={SlideInRight.springify().damping(15)}
      exiting={FadeOut.duration(200)}
      layout={Layout.springify()}
      style={[animatedStyle]}
      className={`${customStyles.cardBg} p-5 rounded-2xl shadow-lg mb-4 border border-gray-100 dark:border-gray-700`}
    >
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        className="flex-1"
      >
        {/* Header */}
        <View className="flex-row justify-between items-start mb-3">
          <View className="flex-row items-center gap-2">
            <PriorityBadge priority={item.priority} />
            <View className={`px-2 py-1 rounded-lg bg-gray-100 `}>
              <Text className={`text-xs font-medium font-rmedium`}>
                {item.scheduleType?.toUpperCase()}
              </Text>
            </View>
          </View>
          <TouchableOpacity 
            className="w-8 h-8 items-center justify-center"
            onPress={() => onPostpone(item.id)}
          >
            <Ionicons name="time" size={20} color={theme === 'light' ? '#6B7280' : '#9CA3AF'} />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View className="mb-3">
          <Text 
            className={`text-lg mb-1 font-rmedium text-gray-200`}
          >
            {item.title}
          </Text>
          <View className="flex-row items-center gap-3">
            <View className="flex-row items-center">
              <Ionicons 
                name="time-outline" 
                size={16} 
                color={theme === 'light' ? '#6B7280' : '#9CA3AF'} 
                style={{ marginRight: 4 }} 
              />
              <Text className="text-sm text-gray-500 dark:text-gray-400">
                {format(item.startDate, 'HH:mm')}
              </Text>
            </View>
            {item.duration && (
              <View className="flex-row items-center">
                <Ionicons 
                  name="hourglass-outline" 
                  size={16} 
                  color={theme === 'light' ? '#6B7280' : '#9CA3AF'} 
                  style={{ marginRight: 4 }} 
                />
                <Text className="text-sm text-gray-500 dark:text-gray-400">
                  {item.duration}min
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Location if exists */}
        {item.location && (
          <View className="flex-row items-center gap-1 mb-1">
            <Ionicons name="location" size={14} color="#6B7280" />
            <Text className="text-sm font-rregular text-gray-500 dark:text-gray-400">{item.location}</Text>
          </View>
        )}

        {/* Footer */}
        <View className="flex-row items-center gap-2">
        <TouchableOpacity 
          onPress={() => handlePostpone(item.id)}
          className="bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-full"
        >
          <Text className="text-blue-600 font-rregular dark:text-blue-400 text-sm">Postpone</Text>
        </TouchableOpacity>
        {item.postponements && item.postponements.length > 0 && (
          <Text className="text-xs text-gray-500 dark:text-gray-400">
            Postponed {item.postponements.length}x
          </Text>
        )}
      </View>

      </Pressable>
    </Animated.View>
  )
}
