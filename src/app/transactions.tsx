import { useState, useMemo } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity } from 'react-native';
import { Search, Filter, ArrowUpDown, PlusCircle, } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { observer } from '@legendapp/state/react';

import { TransactionItem } from 'src/components/transaction/item';
import { FilterModal } from 'src/components/transaction/filter';
import { SortModal } from 'src/components/transaction/sort';
import EmptyState from 'src/components/empty_transaction';
import { router } from 'expo-router';
import useStore from 'src/store/useStore';
import { Transaction, TransactionStatus, TransactionType } from 'src/types/transaction';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
}

interface ActionButtonProps {
  onPress: () => void;
  icon: any;
  label: string;
  color: string;
}


const SearchBar = ({ value, onChangeText }:SearchBarProps) => (
  <View className="bg-white dark:bg-gray-800 rounded-2xl p-2 shadow-sm">
    <View className="flex-row items-center">
      <Search color="#9CA3AF" size={20} className="mr-2" />
      <TextInput
        className="flex-1 text-gray-900 dark:text-white font-rregular text-base py-2"
        placeholder="Search transactions..."
        placeholderTextColor="#9CA3AF"
        value={value}
        onChangeText={onChangeText}
      />
    </View>
  </View>
);


const ActionButton = ({ onPress, icon: Icon, label, color }:ActionButtonProps) => (
  <TouchableOpacity
    className={`flex-row items-center bg-gradient-to-r ${color} rounded-xl px-4 py-3 shadow-sm`}
    onPress={onPress}
  >
    <Icon color="#ffffff" size={20} className="mr-2" />
    <Text className="text-white font-rmedium">{label}</Text>
  </TouchableOpacity>
);

const FinanceScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [sortModalVisible, setSortModalVisible] = useState(false);
  const [activeFilters, setActiveFilters] = useState<{
    type?: TransactionType;
    status?: TransactionStatus;
    category?: string;
  }>({});
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Transaction;
    direction: 'asc' | 'desc';
  }>({ key: 'date', direction: 'desc' });

  const { transactions } = useStore();

  const filteredAndSortedTransactions = useMemo(() => {
    return transactions
      .filter((transaction) => {
        const matchesSearch = transaction.description
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
        const matchesType = !activeFilters.type || transaction.type === activeFilters.type;
        const matchesStatus = !activeFilters.status || transaction.status === activeFilters.status;
        const matchesCategory =
          !activeFilters.category || transaction.categoryId === activeFilters.category;
        return matchesSearch && matchesType && matchesStatus && matchesCategory;
      })
      .sort((a, b) => {
        const aValue = a[sortConfig.key]!;
        const bValue = b[sortConfig.key]!;
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
  }, [transactions, searchQuery, activeFilters, sortConfig]);

  const handleFilter = (filters: typeof activeFilters) => {
    setActiveFilters(filters);
    setFilterModalVisible(false);
  };

  const handleSort = (key: keyof Transaction, direction: 'asc' | 'desc') => {
    setSortConfig({ key, direction });
    setSortModalVisible(false);
  };

  
  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <View className="p-4">
        <View className="flex-row items-center justify-between mb-6">
          <Text className="text-3xl font-rbold text-gray-900 dark:text-white">
            Transactions
          </Text>
          <TouchableOpacity
            className="rounded-xl flex-row items-center gap-1 p-2 dark:bg-blue-500"
            onPress={() => router.navigate('create.transactions')}
          >
            <Text className='dark:text-gray-200'>Create</Text>
            <PlusCircle size={18} color="white" />
          </TouchableOpacity>
        </View>

        <View className="space-y-4">
          <SearchBar value={searchQuery} onChangeText={setSearchQuery} />

          <View className="flex-row justify-between">
            <ActionButton
              onPress={() => setFilterModalVisible(true)}
              icon={Filter}
              label="Filter"
              color="from-blue-500 to-blue-600"
            />
            <ActionButton
              onPress={() => setSortModalVisible(true)}
              icon={ArrowUpDown}
              label="Sort"
              color="from-green-500 to-green-600"
            />
          </View>
        </View>

        {transactions.length === 0 ? (
          <EmptyState type="no-transactions" />
        ) : filteredAndSortedTransactions.length === 0 ? (
          <EmptyState type="no-results" searchQuery={searchQuery} />
        ) : (
          <FlatList
            className="mt-4"
            data={filteredAndSortedTransactions}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <TransactionItem transaction={item} />}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        )}
      </View>

      <FilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        onApply={handleFilter}
        initialFilters={activeFilters}
      />
      <SortModal
        visible={sortModalVisible}
        onClose={() => setSortModalVisible(false)}
        onApply={handleSort}
        initialSort={sortConfig}
      />
    </SafeAreaView>
  );
};

export default observer(FinanceScreen);