import { useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, Pressable } from 'react-native';
import Animated, {
  FadeOut,
  SlideInRight,
  withSpring,
  useAnimatedStyle,
  withTiming,
  useSharedValue,
  withSequence,
  LinearTransition,
  FadeInUp,
} from 'react-native-reanimated';
import { Clock, MapPin, Trash2, Hourglass, CheckCircle, CheckCircle2, Leaf, AlertCircle } from 'lucide-react-native';
import { format, isPast, isWithinInterval, addMinutes } from 'date-fns';
import { LinearGradient } from 'expo-linear-gradient';

import { deleteItem, markCompleted } from 'src/store/shedule/actions';
import { ScheduleItem } from 'src/store/shedule/types';
import { colorScheme } from 'nativewind';
import { observer, useObservable } from '@legendapp/state/react';
import { useModal } from './modals/provider';

interface ItemCardProps {
  item: ScheduleItem;
  customStyles?: {
    cardBg?: string;
    textColor?: string;
    accentColor?: string;
    fontFamily?: {
      regular: string;
      medium: string;
      bold: string;
    };
  };
}

const defaultStyles = {
  cardBg: 'bg-white dark:bg-gray-800',
  textColor: 'text-gray-900 dark:text-white',
  accentColor: 'blue',
  fontFamily: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
  },
};

const priorityConfig = {
  Low: {
    bg: ['#E6F9E8', '#C7F5CC'],
    darkBg: ['rgba(16, 185, 129, 0.1)', 'rgba(16, 185, 129, 0.2)'],
    border: 'border-emerald-200 dark:border-emerald-700',
    text: 'text-emerald-700 dark:text-emerald-400',
    icon: Leaf,
  },
  Medium: {
    bg: ['#FEF5E7', '#FCE7B6'],
    darkBg: ['rgba(245, 158, 11, 0.1)', 'rgba(245, 158, 11, 0.2)'],
    border: 'border-amber-200 dark:border-amber-700',
    text: 'text-amber-700 dark:text-amber-400',
    icon: Clock,
  },
  High: {
    bg: ['#FEE7EF', '#FCCDE0'],
    darkBg: ['rgba(225, 29, 72, 0.1)', 'rgba(225, 29, 72, 0.2)'],
    border: 'border-rose-200 dark:border-rose-700',
    text: 'text-rose-700 dark:text-rose-400',
    icon: AlertCircle,
  },
  Critical: {
    bg: ['#FEE2E2', '#FCA5A5'],
    darkBg: ['rgba(239, 68, 68, 0.1)', 'rgba(239, 68, 68, 0.2)'],
    border: 'border-red-200 dark:border-red-700',
    text: 'text-red-700 dark:text-red-400',
    icon: AlertCircle,
  },
};

export const ItemCard: React.FC<ItemCardProps> = ({
  item,
  customStyles = defaultStyles,
}) => {
  const pressAnim = useSharedValue(1);
  const cardElevation = useSharedValue(2);
  const completedAnim = useSharedValue(item.completed ? 0.5 : 1);
  const status$ = useObservable<'upcoming' | 'in progress' | 'completed'>('upcoming');
  const { show } = useModal();
  const {get:status,set:setStatus} =status$


  const handlePostpone = () => {
    show('Postpone',{itemId:item.id as any,isVisible:true});
  };
  const handlePressIn = useCallback(() => {
    pressAnim.value = withSpring(0.98);
    cardElevation.value = withSpring(4);
  }, []);

  const handlePressOut = useCallback(() => {
    pressAnim.value = withSpring(1);
    cardElevation.value = withSpring(2);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressAnim.value }],
    elevation: cardElevation.value,
  }));

  useEffect(() => {
    const updateStatus = () => {
      const now = new Date();
      if (
        isPast(item.startDate) &&
        (!item.duration || isPast(addMinutes(item.startDate, item.duration)))
      ) {
        setStatus('completed');
      } else if (
        isWithinInterval(now, {
          start: item.startDate,
          end: addMinutes(item.startDate, item.duration || 0),
        })
      ) {
        setStatus('in progress');
      } else {
        setStatus('upcoming');
      }
    };

    updateStatus();
    const interval = setInterval(updateStatus, 60000);

    return () => clearInterval(interval);
  }, [item, setStatus]);

  const PriorityBadge = ({ priority }: { priority: ScheduleItem['priority'] }) => {
    const Icon = priorityConfig[priority].icon
    return (
    <LinearGradient
      colors={colorScheme.get() === 'light' ? priorityConfig[priority].bg : priorityConfig[priority].darkBg}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{borderRadius:8, zIndex:10, padding:1}}
    >
      <View className="flex-row items-center px-2 py-1 rounded-lg">
        <Icon
          size={12}
          color={colorScheme.get() === 'light' ? '#374151' : '#E5E7EB'}
          style={{ marginRight: 4 }}
        />
        <Text className={`text-xs font-rmedium ${priorityConfig[priority].text}`}>
          {priority.charAt(0)?.toUpperCase() + priority.slice(1)}
        </Text>
      </View>
    </LinearGradient>
  )};

  const handleComplete = useCallback(async() => {
    completedAnim.value = withSequence(
      withTiming(0.8, { duration: 100 }),
      withTiming(0.5, { duration: 200 })
    );
   await markCompleted(item.id);
  }, [item.id, completedAnim]);

  const getStatusColor = () => {
    switch (status()) {
      case 'in progress':
        return 'text-blue-500 dark:text-blue-400';
      case 'completed':
        return 'text-green-500 dark:text-green-400';
      default:
        return 'text-gray-500 dark:text-gray-400';
    }
  };

  const Icon = item.completed ? CheckCircle : CheckCircle2
  return (
    <Animated.View
      entering={SlideInRight.springify().damping(15)}
      exiting={FadeOut.duration(200)}
      layout={LinearTransition.springify()}
      style={[animatedStyle]}
      className="overflow-hidden rounded-2xl shadow-lg mb-4"
    >
      <LinearGradient
        colors={
          colorScheme.get() === 'light'
            ? ['#FFFFFF', '#F8FAFC']
            : ['#1F2937', '#111827']
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="p-5 border border-gray-100 dark:border-gray-700"
      >
        <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut} className="flex-1">
          {/* Header */}
          <View className="flex-row justify-between items-start mb-3">
            <View className="flex-row items-center gap-2">
              <PriorityBadge priority={item.priority} />
              <LinearGradient
                colors={
                  colorScheme.get() === 'light'
                    ? ['#F3F4F6', '#E5E7EB']
                    : ['rgba(107, 114, 128, 0.1)', 'rgba(107, 114, 128, 0.2)']
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{borderRadius:8, padding:1, zIndex:19, shadowOpacity:1}}
              >
                <Text className="px-2 py-1 text-xs font-medium font-rmedium text-gray-600 dark:text-gray-300">
                  {item.scheduleType?.toUpperCase()}
                </Text>
              </LinearGradient>
            </View>
            <TouchableOpacity
              className="w-8 h-8 items-center justify-center"
              onPress={handleComplete}
            >
              <Icon
                size={20}
                // className={`${item.completed ? 'bg-[#10B981] dark:bg-[#34D399]' : 'bg-[#6B7280] dark:bg-[#9CA3AF]'}`}
                color={
                  item.completed
                    ? colorScheme.get() === 'light'
                      ? '#10B981'
                      : '#34D399'
                    : colorScheme.get() === 'light'
                      ? '#6B7280'
                      : '#9CA3AF'
                }
              />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View className="mb-3">
            <Text className="text-lg mb-1 font-rmedium text-gray-800 dark:text-gray-100">
              {item.title}
            </Text>
            <View className="flex-row items-center gap-3">
              <View className="flex-row items-center">
                <Clock
                  size={16}
                  color={colorScheme.get() === 'light' ? '#6B7280' : '#9CA3AF'}
                  style={{ marginRight: 4 }}
                />
                <Text className={`text-sm ${getStatusColor()}`}>
                  {format(item.startDate, 'HH:mm')} -{' '}
                  {status().charAt(0).toUpperCase() + status().slice(1)}
                </Text>
              </View>
              {item.duration && (
                <View className="flex-row items-center">
                  <Hourglass
                    size={16}
                    color={colorScheme.get() === 'light' ? '#6B7280' : '#9CA3AF'}
                    style={{ marginRight: 4 }}
                  />
                  <Text className="text-sm text-gray-500 dark:text-gray-400">
                    {item?.countdown! > 60
                      ? `${Math.floor(item?.countdown! / 60)}hr ${item?.countdown! % 60}min`
                      : `${item?.countdown}min`}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Location if exists */}
          {item.location && (
            <View className="flex-row items-center gap-1 mb-3">
              <MapPin size={14} color="#6B7280" />
              <Text className="text-sm font-rregular text-gray-500 dark:text-gray-400">
                {item.location}
              </Text>
            </View>
          )}

          {/* Footer */}
          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center gap-2">
              <TouchableOpacity
                onPress={() => handlePostpone()}
                className="overflow-hidden rounded-full"
              >
                <LinearGradient
                  colors={
                    colorScheme.get() === 'light'
                      ? ['#EFF6FF', '#DBEAFE']
                      : ['rgba(59, 130, 246, 0.1)', 'rgba(59, 130, 246, 0.2)']
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  className="px-3 py-1.5"
                >
                  <Text className="text-blue-600 font-rregular dark:text-blue-400 text-sm">
                    Postpone
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
              {item.postponements && item.postponements.length > 0 && (
                <Text className="text-xs text-gray-500 dark:text-gray-400">
                  Postponed {item.postponements.length}x
                </Text>
              )}
            </View>
            <TouchableOpacity onPress={async () => await deleteItem(item.id)}>
              <Trash2 size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </Pressable>
      </LinearGradient>
    </Animated.View>
  );
};

interface TasksListProps{
  items:ScheduleItem[],
}

const TasksList = ({ items }: TasksListProps) => (
  <Animated.View 
    className="space-y-4"
    entering={FadeInUp.duration(800)}
  >
    {items.map((item: any) => (
      <ItemCard
        key={item.id}
        item={item}
      />
    ))}
  </Animated.View>
);
export default observer(TasksList)