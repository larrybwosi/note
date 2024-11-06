import { memo, useCallback, useRef } from 'react'
import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Animated, {
  LinearTransition
} from 'react-native-reanimated'
import { Ionicons } from '@expo/vector-icons'
import { observer, useObservable } from '@legendapp/state/react'
import { BottomSheet } from 'src/components/bottom'
import useFinanceStore from 'src/store/finance/actions'
import { TransactionType } from 'src/store/finance/types'
import TransactionCard from 'src/components/transaction.card'
import TransactionForm from 'src/components/transaction.form'


const IncomePage = () => {
  const { useGetTransactionsByCategoryId, getTransactions } = useFinanceStore()
  const renderCount = ++useRef(0).current
  console.log(renderCount)

  const handleDeleteIncome = useCallback((id: string) => {
    console.log(id)
  }, [])

  // const incomeData = useGetTransactionsByCategoryId(TransactionType.INCOME)
  const transactions = getTransactions(new Date())

  const showNewIncomeForm$ = useObservable(false)

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
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
            {/* ${totalIncome$.get().toLocaleString()} */}
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1 p-4">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-lg font-aregular text-gray-800 dark:text-gray-200">
            Recent Income
          </Text>
          <TouchableOpacity
            onPress={() => showNewIncomeForm$.set(true)}
            className="bg-blue-500 px-4 py-2 rounded-xl flex-row items-center"
          >
            <Ionicons name="add" size={20} color="white" />
            <Text className="text-white font-rmedium ml-1">Add Income</Text>
          </TouchableOpacity>
        </View>

        {transactions.length === 0 ? (
          <View className="flex-1 items-center justify-center py-12">
            <Ionicons name="cash-outline" size={48} color="#9CA3AF" />
            <Text className="text-gray-500 dark:text-gray-400 mt-4 text-center">
              No income entries yet.{'\n'}Add your first income source!
            </Text>
          </View>
        ) : (
          <Animated.View layout={ LinearTransition.springify()}>
            {transactions
              .sort((a, b) => new Date(b.date + 'T' + b.time).getTime() - new Date(a.date + 'T' + a.time).getTime())
              .map((income) => (
                <TransactionCard
                  key={income.id}
                  transaction={income}
                  onDelete={() => handleDeleteIncome(income.id)}
                />
              ))}
          </Animated.View>
        )}
      </ScrollView>

      <BottomSheet
        isVisible={showNewIncomeForm$.get()}
        onClose={() => showNewIncomeForm$.set(false)}
      >
        <TransactionForm
         showForm={showNewIncomeForm$} 
         type={TransactionType.INCOME}
         onSubmit={(transaction) => {
           console.log(transaction)
         }}
        />
      </BottomSheet>
    </SafeAreaView>
  )
}

export default memo(observer(IncomePage))