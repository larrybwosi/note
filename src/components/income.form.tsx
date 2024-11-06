import { CategoryType, IncomeCategoryId } from "src/store/finance/types"
import { TransactionType } from "src/store/finance/types"
import { useObservable } from "@legendapp/state/react"
import { ObservableBoolean } from "@legendapp/state"
import { observer } from "@legendapp/state/react"
import useFinanceStore from "src/store/finance/actions"
import { Transaction } from "src/store/finance/types"
import { useCallback } from "react"
import { Text, TextInput, TouchableOpacity } from "react-native"
import { View } from "react-native"

// showNewIncomeForm$.set
const NewIncomeForm = observer(({showNewIncomeForm$}:{showNewIncomeForm$:ObservableBoolean})=> {
  const { addTransaction, getTransactions, getCategoriesByType } = useFinanceStore()
  
  const newIncomeData = useObservable<Partial<Transaction>>({
    title: '',
    amount: 0,
    description: '',
    categoryId: IncomeCategoryId['CUSTOM'],
    category: getCategoriesByType(CategoryType.INCOME)[0],
  })

  const { title, amount, description, category, categoryId, paymentMethod } = newIncomeData
  const handleAddIncome = useCallback(() => {
    if (newIncomeData.title && newIncomeData.amount) {
      addTransaction({
        amount: amount.get() || 0,
        title: title.get() || '',
        description: description.get() || '',
        type: TransactionType.INCOME,
        categoryId: IncomeCategoryId['CUSTOM'],
      })
      showNewIncomeForm$.set(false)
    }
  }, [])

  const categories = getCategoriesByType(CategoryType.INCOME)
  console.log(categories)


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
            value={title.get()}
            onChangeText={(text) => title.set(text)}
            placeholder="Enter income source"
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-700"
          />
        </View>

        <View>
          <Text className="text-sm font-plregular text-gray-700 dark:text-gray-300 mb-1">
            Amount
          </Text>
          <TextInput
            value={amount.get()?.toString()}
            onChangeText={(text) => amount.set(parseFloat(text) || 0)}
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
            {categories.map(({id, icon, name: category, color}) => (
              <TouchableOpacity
                key={category}
                onPress={() => newIncomeData.categoryId.set(id)}
                className={`m-1 px-4 py-2 rounded-full ${
                  categoryId.get() === id
                    ? 'bg-blue-500'
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <Text
                  className={
                    categoryId.get() === id
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
            onPress={() => showNewIncomeForm$.set(false)}
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

export default NewIncomeForm