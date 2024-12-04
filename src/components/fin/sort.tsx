import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity } from 'react-native';
import { Transaction } from './ts';
import { ArrowUp, ArrowDown } from 'lucide-react-native';

interface SortModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (key: keyof Transaction, direction: 'asc' | 'desc') => void;
  initialSort: {
    key: keyof Transaction;
    direction: 'asc' | 'desc';
  };
}

const sortOptions: { label: string; key: keyof Transaction }[] = [
  { label: 'Date', key: 'createdAt' },
  { label: 'Amount', key: 'amount' },
  { label: 'Description', key: 'description' },
];

export const SortModal: React.FC<SortModalProps> = ({
  visible,
  onClose,
  onApply,
  initialSort,
}) => {
  const [sortKey, setSortKey] = useState<keyof Transaction>(initialSort.key);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(initialSort.direction);

  const handleApply = () => {
    onApply(sortKey, sortDirection);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 justify-end bg-black bg-opacity-50">
        <View className="bg-white dark:bg-gray-800 rounded-t-3xl p-6">
          <Text className="text-2xl font-rbold text-gray-900 dark:text-white mb-4">Sort Transactions</Text>
          <View className="mb-4">
            <Text className="text-lg font-rmedium text-gray-900 dark:text-white mb-2">Sort By</Text>
            {sortOptions.map((option) => (
              <TouchableOpacity
                key={option.key}
                className={`flex-row justify-between items-center p-3 rounded-lg mb-2 ${
                  sortKey === option.key ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-700'
                }`}
                onPress={() => setSortKey(option.key)}
              >
                <Text className={`font-rmedium ${
                  sortKey === option.key ? 'text-white' : 'text-gray-900 dark:text-white'
                }`}>
                  {option.label}
                </Text>
                {sortKey === option.key && (
                  <TouchableOpacity onPress={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}>
                    {sortDirection === 'asc' ? (
                      <ArrowUp color="#ffffff" size={20} />
                    ) : (
                      <ArrowDown color="#ffffff" size={20} />
                    )}
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            ))}
          </View>
          <View className="flex-row justify-between mt-4">
            <TouchableOpacity
              className="bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded-lg"
              onPress={onClose}
            >
              <Text className="text-gray-900 dark:text-white font-rmedium">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-blue-500 px-4 py-2 rounded-lg"
              onPress={handleApply}
            >
              <Text className="text-white font-rmedium">Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

