import { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { ExpenseGroup, IncomeCategory } from 'src/store/types';
import { TransactionStatus, TransactionType } from 'src/types/transaction';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: {
    type?: TransactionType;
    status?: TransactionStatus;
    category?: string;
  }) => void;
  initialFilters: {
    type?: TransactionType;
    status?: TransactionStatus;
    category?: string;
  };
}

export const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  onClose,
  onApply,
  initialFilters,
}) => {
  const [type, setType] = useState<TransactionType | undefined>(initialFilters.type);
  const [status, setStatus] = useState<TransactionStatus | undefined>(initialFilters.status);
  const [category, setCategory] = useState<string | undefined>(initialFilters.category);

  const handleApply = () => {
    onApply({ type, status, category });
  };

  const handleReset = () => {
    setType(undefined);
    setStatus(undefined);
    setCategory(undefined);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 justify-end bg-black bg-opacity-50">
        <View className="bg-white dark:bg-gray-800 rounded-t-3xl p-6">
          <Text className="text-2xl font-rbold text-gray-900 dark:text-white mb-4">Filter Transactions</Text>
          <ScrollView className="max-h-96">
            <View className="mb-4">
              <Text className="text-lg font-rmedium text-gray-900 dark:text-white mb-2">Transaction Type</Text>
              <View className="flex-row flex-wrap">
                {/* {Object.values(TransactionType).map((t) => (
                  <TouchableOpacity
                    key={t}
                    className={`mr-2 mb-2 px-3 py-2 rounded-full ${
                      type === t ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                    onPress={() => setType(t)}
                  >
                    <Text className={`font-rmedium ${
                      type === t ? 'text-white' : 'text-gray-900 dark:text-white'
                    }`}>
                      {t}
                    </Text>
                  </TouchableOpacity>
                ))} */}
              </View>
            </View>
            <View className="mb-4">
              <Text className="text-lg font-rmedium text-gray-900 dark:text-white mb-2">Transaction Status</Text>
              <View className="flex-row flex-wrap">
                {/* {Object.values(TransactionStatus).map((s) => (
                  <TouchableOpacity
                    key={s}
                    className={`mr-2 mb-2 px-3 py-2 rounded-full ${
                      status === s ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                    onPress={() => setStatus(s)}
                  >
                    <Text className={`font-rmedium ${
                      status === s ? 'text-white' : 'text-gray-900 dark:text-white'
                    }`}>
                      {s}
                    </Text>
                  </TouchableOpacity>
                ))} */}
              </View>
            </View>
            <View className="mb-4">
              <Text className="text-lg font-rmedium text-gray-900 dark:text-white mb-2">Category</Text>
              <View className="flex-row flex-wrap">
                {[...Object.values(ExpenseGroup), ...Object.values(IncomeCategory)].map((c) => (
                  <TouchableOpacity
                    key={c}
                    className={`mr-2 mb-2 px-3 py-2 rounded-full ${
                      category === c ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                    onPress={() => setCategory(c)}
                  >
                    <Text className={`font-rmedium ${
                      category === c ? 'text-white' : 'text-gray-900 dark:text-white'
                    }`}>
                      {c}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>
          <View className="flex-row justify-between mt-4">
            <TouchableOpacity
              className="bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded-lg"
              onPress={handleReset}
            >
              <Text className="text-gray-900 dark:text-white font-rmedium">Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-blue-500 px-4 py-2 rounded-lg"
              onPress={handleApply}
            >
              <Text className="text-white font-rmedium">Apply</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            className="mt-4 self-center"
            onPress={onClose}
          >
            <Text className="text-gray-500 dark:text-gray-400 font-rmedium">Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

