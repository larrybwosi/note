import React, { useCallback } from 'react'
import { View, Text, ScrollView, TouchableOpacity, TextInput, StatusBar, Dimensions } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Animated, {
  LinearTransition,
  SlideInRight, 
  SlideOutLeft,
  withSpring,
  useAnimatedStyle,
  useSharedValue,
  runOnJS,
  interpolate,
  Extrapolation
} from 'react-native-reanimated'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import { format } from 'date-fns'
import { Ionicons } from '@expo/vector-icons'
import { computed } from '@legendapp/state'
import { observer } from '@legendapp/state/react'
import { INCOME_CATEGORIES, IncomeEntry, incomeStore,TransactionStatus } from 'src/storage'
import { colorScheme } from 'nativewind'

const { height: SCREEN_HEIGHT } = Dimensions.get('window')
const MAX_TRANSLATE_Y = -SCREEN_HEIGHT + 50

const TRANSACTION_STATUS = {
  PENDING: 'Pending',
  COMPLETED: 'Completed',
  FAILED: 'Failed',
  CANCELLED: 'Cancelled',
} as const;

// Computed values
const totalIncome$ = computed(() => 
  incomeStore.incomeData.get().reduce((sum, entry) => sum + entry.amount, 0)
)

// Bottom Sheet Component
const BottomSheet = observer(({ children, isVisible, onClose }: { children: React.ReactNode, isVisible: boolean, onClose: () => void }) => {
  const translateY = useSharedValue(0)
  const context = useSharedValue({ y: 0 })
  const active = useSharedValue(false)
  const theme = colorScheme.get()

  const scrollTo = useCallback((destination: number) => {
    'worklet'
    active.value = destination !== 0
    translateY.value = withSpring(destination, { damping: 50 })
  }, [])

  const gesture = Gesture.Pan()
    .onStart(() => {
      context.value = { y: translateY.value }
    })
    .onUpdate((event) => {
      translateY.value = event.translationY + context.value.y
      translateY.value = Math.max(translateY.value, MAX_TRANSLATE_Y)
    })
    .onEnd(() => {
      if (translateY.value > -SCREEN_HEIGHT / 3) {
        scrollTo(0)
        runOnJS(onClose)()
      } else {
        scrollTo(MAX_TRANSLATE_Y)
      }
    })

  const rBottomSheetStyle = useAnimatedStyle(() => {
    const borderRadius = interpolate(
      translateY.value,
      [MAX_TRANSLATE_Y + 50, MAX_TRANSLATE_Y],
      [25, 5],
      Extrapolation.CLAMP
    )

    return {
      borderRadius,
      transform: [{ translateY: translateY.value }],
    }
  })

  React.useEffect(() => {
    if (isVisible) {
      scrollTo(MAX_TRANSLATE_Y)
    }
  }, [isVisible])

  if (!isVisible) return null

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        style={[{
          height: SCREEN_HEIGHT - 300,
          width: '100%',
          position: 'absolute',
          top: SCREEN_HEIGHT + 250,
          backgroundColor: theme === 'dark' ? '#1F2937' : '#4b5563',
        }, rBottomSheetStyle]}
        className="bg-white dark:bg-gray-800"
      >
        <View className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full self-center my-3" />
        <ScrollView className="flex-1">{children}</ScrollView>
      </Animated.View>
    </GestureDetector>
  )
})

// Components
const StatusBadge = ({ status }: { status: TransactionStatus }) => {
  const getStatusStyle = (status: TransactionStatus) => {
    const baseStyle = 'px-2 py-1 rounded-full'
    switch (status) {
      case TRANSACTION_STATUS.COMPLETED:
        return `${baseStyle} bg-green-100 dark:bg-green-900`
      case TRANSACTION_STATUS.PENDING:
        return `${baseStyle} bg-yellow-100 dark:bg-yellow-900`
      case TRANSACTION_STATUS.FAILED:
        return `${baseStyle} bg-red-100 dark:bg-red-900`
      default:
        return `${baseStyle} bg-gray-100 dark:bg-gray-900`
    }
  }

  return (
    <View className={getStatusStyle(status)}>
      <Text className={`text-[10px] font-rregular ${getStatusClass(status)}`}>
        {status}
      </Text>
    </View>
  )
}

const IncomeCard = ({ income, onDelete }: { income: IncomeEntry; onDelete: () => void }) => {
  const deleteGesture = Gesture.Pan()
    .activeOffsetX(-50)
    .onEnd((_, success) => {
      if (success) {
        onDelete()
      }
    })

  return (
    <GestureDetector gesture={deleteGesture}>
      <Animated.View
        entering={SlideInRight.springify()}
        exiting={SlideOutLeft}
        layout={ LinearTransition.springify()}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-lg mb-4 overflow-hidden border border-gray-100 dark:border-gray-700"
      >
        <View className="p-4">
          <View className="flex-row justify-between items-center mb-3">
            <View>
              <Text className="font-rmedium text-lg text-gray-800 dark:text-gray-200">
                {income.title}
              </Text>
              <Text className="text-sm text-gray-500 dark:text-gray-400">
                {income.description}
              </Text>
            </View>
            <Text className={`font-bold text-lg ${income.isUp ? 'text-green-500' : 'text-red-500'}`}>
              ${income.amount.toLocaleString()}
            </Text>
          </View>
          
          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center space-x-2">
              <View className="bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded-full">
                <Text className="text-xs font-rregular text-blue-800 dark:text-blue-200">
                  {income.category}
                </Text>
              </View>
              <StatusBadge status={income.status} />
            </View>
            <View className="flex-row items-center space-x-2">
              <Text className="text-xs text-gray-500 dark:text-gray-400">
                {format(new Date(`${income.date}T${income.time}`), 'PPp')}
              </Text>
              <Text className={`text-xs font-medium ${income.isUp ? 'text-green-500' : 'text-red-500'}`}>
                {income.trend}
              </Text>
            </View>
          </View>
        </View>
      </Animated.View>
    </GestureDetector>
  )
}

const NewIncomeForm = observer(()=> {
  const handleAddIncome = useCallback(() => {
    const newIncomeData = incomeStore.newIncome.get()
    if (newIncomeData.title && newIncomeData.amount) {
      incomeStore.incomeData.set([...incomeStore.incomeData.get(), {
        id: Math.max(...incomeStore.incomeData.get().map(i => i.id)) + 1,
        ...newIncomeData as Omit<IncomeEntry, 'id'>,
        isUp: Math.random() > 0.5,
        trend: `${Math.random() > 0.5 ? '+' : '-'}${(Math.random() * 5).toFixed(1)}%`,
      }])
      incomeStore.showNewIncomeForm.set(false)
      incomeStore.newIncome.set({
        date: format(new Date(), 'yyyy-MM-dd'),
        time: format(new Date(), 'HH:mm'),
        category: INCOME_CATEGORIES[0],
        status: TRANSACTION_STATUS.PENDING,
        title: '',
        amount: 0,
      })
    }
  }, [])

  return (
    <View className="p-6 rounded-sm">
      <Text className="text-2xl font-rbold mb-6 text-gray-800 dark:text-gray-100">
        Add New Income
      </Text>
      
      <View className="space-y-4">
        <View>
          <Text className="text-sm font-plregular text-gray-700 dark:text-gray-300 mb-1">
            Income Source
          </Text>
          <TextInput
            value={incomeStore.newIncome.title.get()}
            onChangeText={(text) => incomeStore.newIncome.title.set(text)}
            placeholder="Enter income source"
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-700"
          />
        </View>

        <View>
          <Text className="text-sm font-plregular text-gray-700 dark:text-gray-300 mb-1">
            Amount
          </Text>
          <TextInput
            value={incomeStore.newIncome.amount.get()?.toString()}
            onChangeText={(text) => incomeStore.newIncome.amount.set(parseFloat(text) || 0)}
            placeholder="Enter amount"
            keyboardType="numeric"
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-700"
          />
        </View>

        <View>
          <Text className="text-sm font-plregular text-gray-700 dark:text-gray-300 mb-2">
            Category
          </Text>
          <View className="flex-row flex-wrap -m-1">
            {INCOME_CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category}
                onPress={() => incomeStore.newIncome.category.set(category)}
                className={`m-1 px-4 py-2 rounded-full ${
                  incomeStore.newIncome.category.get() === category
                    ? 'bg-blue-500'
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <Text
                  className={
                    incomeStore.newIncome.category.get() === category
                      ? 'text-white font-rregular'
                      : 'text-gray-800 dark:text-gray-200 font-rregular'
                  }
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View className="flex-row justify-end space-x-3 mt-6 gap-3">
          <TouchableOpacity
            onPress={() => incomeStore.showNewIncomeForm.set(false)}
            className="px-6 py-3 bg-gray-200 dark:bg-gray-700 rounded-lg ml-4"
          >
            <Text className="text-gray-800 dark:text-gray-200 font-plregular">
              Cancel
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleAddIncome}
            className="px-6 py-3 bg-blue-500 rounded-lg"
          >
            <Text className="text-white font-plregular">
              Add Income
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
})

const MobileIncomePage = () => {
  const handleDeleteIncome = useCallback((id: number) => {
    incomeStore.incomeData.set(
      incomeStore.incomeData.get().filter(income => income.id !== id)
    )
  }, [])

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <StatusBar
        barStyle={'dark-content'}
        backgroundColor={incomeStore.isDarkMode.get() ? '#111827' : '#F9FAFB'}
      />
      
      <View className="p-4 border-b border-gray-200 dark:border-gray-800">
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-2xl font-rbold text-gray-800 dark:text-gray-100">
              Income Tracker
            </Text>
            <Text className="text-sm font-rregular text-gray-500 dark:text-gray-400">
              Track your income sources
            </Text>
          </View>
        </View>

        <View className="mt-4 bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <Text className="text-sm font-aregular text-gray-500 dark:text-gray-400">
            Total Income
          </Text>
          <Text className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            ${totalIncome$.get().toLocaleString()}
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1 p-4">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-lg font-aregular text-gray-800 dark:text-gray-200">
            Recent Income
          </Text>
          <TouchableOpacity
            onPress={() => incomeStore.showNewIncomeForm.set(true)}
            className="bg-blue-500 px-4 py-2 rounded-xl flex-row items-center"
          >
            <Ionicons name="add" size={20} color="white" />
            <Text className="text-white font-rmedium ml-1">Add Income</Text>
          </TouchableOpacity>
        </View>

        {incomeStore.incomeData.get().length === 0 ? (
          <View className="flex-1 items-center justify-center py-12">
            <Ionicons name="cash-outline" size={48} color="#9CA3AF" />
            <Text className="text-gray-500 dark:text-gray-400 mt-4 text-center">
              No income entries yet.{'\n'}Add your first income source!
            </Text>
          </View>
        ) : (
          <Animated.View layout={ LinearTransition.springify()}>
            {incomeStore.incomeData.get()
              .sort((a, b) => new Date(b.date + 'T' + b.time).getTime() - new Date(a.date + 'T' + a.time).getTime())
              .map((income) => (
                <IncomeCard
                  key={income.id}
                  income={income}
                  onDelete={() => handleDeleteIncome(income.id)}
                />
              ))}
          </Animated.View>
        )}
      </ScrollView>

      <BottomSheet
        isVisible={incomeStore.showNewIncomeForm.get()}
        onClose={() => incomeStore.showNewIncomeForm.set(false)}
      >
        <NewIncomeForm />
      </BottomSheet>
    </SafeAreaView>
  )
}

const getStatusClass = (status: TransactionStatus) => {
  switch (status) {
    case TRANSACTION_STATUS.COMPLETED:
      return 'text-green-800 dark:text-green-200'
    case TRANSACTION_STATUS.PENDING:
      return 'text-yellow-800 dark:text-yellow-200'
    case TRANSACTION_STATUS.FAILED:
      return 'text-red-800 dark:text-red-200'
    default:
      return 'text-gray-800 dark:text-gray-200'
  }
}

export default observer(MobileIncomePage)