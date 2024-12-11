import { View, Text, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { DollarSign, Calendar, Tag, FileText, MapPin, Check, Sparkles } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { observer, useObservable } from '@legendapp/state/react';

import { TransactionType, Category, TransactionStatus, RecurrenceFrequency } from 'src/components/fin/ts';
import { CategorySelector } from 'src/components/fin/category.selector';
import { RecurrenceSelector } from 'src/components/fin/recurence';
import { InputField } from 'src/components/fin/input';
import { Button } from 'src/components/ui/button';
import { Card } from 'src/components/fin/card';
import { router, useLocalSearchParams } from 'expo-router';


const CreateTransaction: React.FC = observer(() => {
  const {type} = useLocalSearchParams()
  const transactionState$ = useObservable({
  type: type === 'expense' ? TransactionType.EXPENSE : TransactionType.INCOME,
  amount: '',
  description: '',
  category: null as Category | null,
  date: new Date(),
  showDatePicker: false,
  tags: [] as string[],
  notes: '',
  location: '',
  isEssential: false,
  status: TransactionStatus.COMPLETED,
  recurrence: RecurrenceFrequency.NONE,
  });

  const handleCreateTransaction = () => {
    console.log('Transaction created:', transactionState$.get());
  };


  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <ScrollView className="flex-1 p-4">
        <View className='flex-col flex justify-between'>
          <Text className="text-2xl font-rbold text-gray-900 dark:text-white mb-6">Create Transaction</Text>
          <TouchableOpacity
            onPress={() => router.push("/ai.create.transaction")}
            className="bg-blue-500 backdrop-blur-lg px-4 py-2 rounded-xl flex-row items-center"
          >
            <Sparkles size={20} color="white" />
            <Text className="text-white font-rmedium ml-1">Try Ai</Text>
          </TouchableOpacity>
        </View>
        <Card title="Transaction Type" description="Choose whether this is an expense or income">
          <View className="flex-row justify-around bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <TouchableOpacity
              className={`flex-1 py-3 rounded-lg ${
                transactionState$.type.get() === TransactionType.EXPENSE
                  ? 'bg-red-500'
                  : 'bg-transparent'
              }`}
              onPress={() => transactionState$.type.set(TransactionType.EXPENSE)}
            >
              <Text
                className={`text-center font-rmedium ${
                  transactionState$.type.get() === TransactionType.EXPENSE
                    ? 'text-white'
                    : 'text-gray-600 dark:text-gray-300'
                }`}
              >
                Expense
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 py-3 rounded-lg ${
                transactionState$.type.get() === TransactionType.INCOME
                  ? 'bg-green-500'
                  : 'bg-transparent'
              }`}
              onPress={() => transactionState$.type.set(TransactionType.INCOME)}
            >
              <Text
                className={`text-center font-rmedium ${
                  transactionState$.type.get() === TransactionType.INCOME
                    ? 'text-white'
                    : 'text-gray-600 dark:text-gray-300'
                }`}
              >
                Income
              </Text>
            </TouchableOpacity>
          </View>
        </Card>

        <Card title="Amount" icon={DollarSign} description="Enter the transaction amount">
          <InputField
            placeholder="0.00"
            keyboardType="decimal-pad"
            value={transactionState$.amount.get()}
            onChangeText={(text) => transactionState$.amount.set(text)}
          />
        </Card>

        <Card title="Description" icon={FileText} description="Provide a brief description of the transaction">
          <InputField
            placeholder="Enter transaction description"
            value={transactionState$.description.get()}
            onChangeText={(text) => transactionState$.description.set(text)}
          />
        </Card>

        <CategorySelector
          transactionType={transactionState$.type.get()}
          selectedCategory={transactionState$.category.get()}
          onSelectCategory={(category) => transactionState$.category.set(category)}
        />

        <Card title="Date" icon={Calendar} description="Select the date of the transaction">
          <TouchableOpacity
            className="bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-3"
            onPress={() => transactionState$.showDatePicker.set(true)}
          >
            <Text className="text-gray-900 dark:text-white">{transactionState$.date.get().toLocaleDateString()}</Text>
          </TouchableOpacity>
          {transactionState$.showDatePicker.get() && (
            <DateTimePicker
              value={transactionState$.date.get()}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                transactionState$.showDatePicker.set(false);
                if (selectedDate) {
                  transactionState$.date.set(selectedDate);
                }
              }}
            />
          )}
        </Card>

        <Card title="Tags" icon={Tag} description="Add tags to categorize your transaction (comma-separated)">
          <InputField
            placeholder="Enter tags (comma-separated)"
            value={transactionState$.tags.get().join(', ')}
            onChangeText={(text) => transactionState$.tags.set(text.split(',').map(tag => tag.trim()))}
          />
        </Card>

        <Card title="Notes" icon={FileText} description="Add any additional notes or details">
          <InputField
            placeholder="Add any additional notes"
            multiline
            numberOfLines={4}
            value={transactionState$.notes.get()}
            onChangeText={(text) => transactionState$.notes.set(text)}
          />
        </Card>

        <Card title="Location" icon={MapPin} description="Specify the location of the transaction">
          <InputField
            placeholder="Enter location"
            value={transactionState$.location.get()}
            onChangeText={(text) => transactionState$.location.set(text)}
          />
        </Card>

        <Card title="Essential" icon={Check} description="Mark this transaction as essential for budget tracking">
          <View className="flex-row items-center justify-between">
            <Text className="text-lg font-rmedium text-gray-900 dark:text-white">Essential</Text>
            <Switch
              value={transactionState$.isEssential.get()}
              onValueChange={(value) => transactionState$.isEssential.set(value)}
              trackColor={{ false: "#767577", true: "#81b0ff" }}
              thumbColor={transactionState$.isEssential.get() ? "#f5dd4b" : "#f4f3f4"}
            />
          </View>
        </Card>

        <RecurrenceSelector
          selectedRecurrence={transactionState$.recurrence.get()}
          onSelectRecurrence={(recurrence) => transactionState$.recurrence.set(recurrence)}
        />

        <Button
          title="Create Transaction"
          onPress={handleCreateTransaction}
          variant="primary"
          className="mt-6"
        />
      </ScrollView>
    </SafeAreaView>
  );
});

export default CreateTransaction;

