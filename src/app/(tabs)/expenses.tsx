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
import { expenseStore, ExpenseEntry, ExpenseCategory } from 'src/storage'
import { colorScheme } from 'nativewind'
import { BottomSheet } from 'src/components/bottom'
import NewExpenseForm from 'src/components/expense.add'


// Computed values
const totalExpenses$ = computed(() => 
  expenseStore.expenseData.get().reduce((sum, entry) => sum + entry.amount, 0)
)

const remainingBudget$ = computed(() => 
  expenseStore.monthlyBudget.get() - totalExpenses$.get()
)


// Components
const StatusBadge = ({ status }: { status: string }) => {
  const getStatusStyle = (status: string) => {
    const baseStyle = 'px-2 py-1 rounded-full'
    switch (status) {
      case 'Completed':
        return `${baseStyle} bg-green-100 dark:bg-green-900`
      case 'Pending':
        return `${baseStyle} bg-yellow-100 dark:bg-yellow-900`
      case 'Failed':
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

const ExpenseCard = ({ expense, onDelete }: { expense: ExpenseEntry; onDelete: () => void }) => {
  const deleteGesture = Gesture.Pan()
    .activeOffsetX(-50)
    .onEnd((_, success) => {
      if (success) {
        runOnJS(onDelete)();
      }
    })

  return (
    <GestureDetector gesture={deleteGesture}>
      <Animated.View
        entering={SlideInRight.springify()}
        exiting={SlideOutLeft}
        layout={LinearTransition.springify()}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-lg mb-4 overflow-hidden border border-gray-100 dark:border-gray-700"
      >
        <View className="p-4">
          <View className="flex-row justify-between items-center mb-3">
            <View>
              <Text className="font-rmedium text-lg text-gray-800 dark:text-gray-200">
                {expense.description}
              </Text>
              <Text className="text-sm text-gray-500 dark:text-gray-400">
                {expense.category}
              </Text>
            </View>
            <Text className="font-bold text-lg text-red-500">
              -${expense.amount.toLocaleString()}
            </Text>
          </View>
          
          <View className="flex-row justify-between items-center">
            <StatusBadge status={expense.status} />
            <View className="flex-row items-center space-x-2">
              <Text className="text-xs text-gray-500 dark:text-gray-400">
                {format(new Date(`${expense.date}T${expense.time}`), 'PPp')}
              </Text>
              {expense.isRecurring && (
                <Ionicons name="repeat" size={16} color="#4B5563" />
              )}
            </View>
          </View>
        </View>
      </Animated.View>
    </GestureDetector>
  )
}

const MobileExpensePage = () => {
  const handleDeleteExpense = useCallback((id: number) => {
    expenseStore.expenseData.set(
      expenseStore.expenseData.get().filter(expense => expense.id !== id)
    )
  }, [])

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <StatusBar
        barStyle={colorScheme.get() === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={colorScheme.get() === 'dark' ? '#111827' : '#F9FAFB'}
      />
      
      <View className="p-4 border-b border-gray-200 dark:border-gray-800">
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-2xl font-rbold text-gray-800 dark:text-gray-100">
              Expense Tracker
            </Text>
            <Text className="text-sm font-rregular text-gray-500 dark:text-gray-400">
              Track your expenses
            </Text>
          </View>
        </View>

        <View className="mt-4 bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <Text className="text-sm font-aregular text-gray-500 dark:text-gray-400">
            Total Expenses
          </Text>
          <Text className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            ${totalExpenses$.get().toLocaleString()}
          </Text>
          <Text className="text-sm font-aregular text-gray-500 dark:text-gray-400 mt-2">
            Remaining Budget
          </Text>
          <Text className={`text-xl font-bold ${remainingBudget$.get() >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            ${remainingBudget$.get().toLocaleString()}
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1 p-4">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-lg font-aregular text-gray-800 dark:text-gray-200">
            Recent Expenses
          </Text>
          <TouchableOpacity
            onPress={() => expenseStore.showNewExpenseForm.set(true)}
            className="bg-blue-500 px-4 py-2 rounded-xl flex-row items-center"
          >
            <Ionicons name="add" size={20} color="white" />
            <Text className="text-white font-rmedium ml-1">Add Expense</Text>
          </TouchableOpacity>
        </View>

        {expenseStore.expenseData.get().length === 0 ? (
          <View className="flex-1 items-center justify-center py-12">
            <Ionicons name="wallet-outline" size={48} color="#9CA3AF" />
            <Text className="text-gray-500 dark:text-gray-400 mt-4 text-center">
              No expenses recorded yet.{'\n'}Start tracking your spending!
            </Text>
          </View>
        ) : (
          <Animated.View layout={LinearTransition.springify()}>
            {expenseStore.expenseData.get()
              .sort((a, b) => new Date(b.date + 'T' + b.time).getTime() - new Date(a.date + 'T' + a.time).getTime())
              .map((expense) => (
                <ExpenseCard
                  key={expense.id}
                  expense={expense}
                  onDelete={() => handleDeleteExpense(expense.id)}
                />
              ))}
          </Animated.View>
        )}
      </ScrollView>

      <BottomSheet
        isVisible={expenseStore.showNewExpenseForm.get()}
        onClose={() => expenseStore.showNewExpenseForm.set(false)}
      >
        <NewExpenseForm />
      </BottomSheet>
    </SafeAreaView>
  )
}

const getStatusClass = (status: string) => {
  switch (status) {
    case 'Completed':
      return 'text-green-800 dark:text-green-200'
    case 'Pending':
      return 'text-yellow-800 dark:text-yellow-200'
    case 'Failed':
      return 'text-red-800 dark:text-red-200'
    default:
      return 'text-gray-800 dark:text-gray-200'
  }
}

export default observer(MobileExpensePage)