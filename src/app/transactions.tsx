import { useState, useMemo } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Transaction, TransactionType, TransactionStatus } from 'src/components/fin/ts';
import { Search, Filter, ArrowUpDown } from 'lucide-react-native';
import { TransactionItem } from 'src/components/fin/item';
import { FilterModal } from 'src/components/fin/filter';
import { SortModal } from 'src/components/fin/sort';
import useFinancialStore from 'src/store/finance/store';
import { mockTrans } from 'src/components/fin/dt';

const FinanceScreen: React.FC = () => {
  const { getTransactions } = useFinancialStore();
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
  }>({ key: 'createdAt', direction: 'desc' });
  const transactions = getTransactions();

  const filteredAndSortedTransactions = useMemo(() => {
    return transactions
      .filter((transaction) => {
        const matchesSearch = transaction.description
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
        const matchesType = !activeFilters.type || transaction.type === activeFilters.type;
        const matchesStatus = !activeFilters.status || transaction.status === activeFilters.status;
        const matchesCategory =
          !activeFilters.category || transaction.category.name === activeFilters.category;
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

  const handleSearch = (text: string) => {
    setSearchQuery(text);
  };

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
        <Text className="text-2xl font-rbold text-gray-900 dark:text-white mb-4">Finance Overview</Text>
        <View className="flex-row items-center bg-white dark:bg-gray-800 rounded-lg p-2 mb-4">
          <Search color="#9CA3AF" size={20} className="mr-2" />
          <TextInput
            className="flex-1 text-gray-900 dark:text-white font-rregular"
            placeholder="Search transactions..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>
        <View className="flex-row justify-between mb-4">
          <TouchableOpacity
            className="flex-row items-center bg-blue-500 rounded-lg px-4 py-2"
            onPress={() => setFilterModalVisible(true)}
          >
            <Filter color="#ffffff" size={20} className="mr-2" />
            <Text className="text-white font-rmedium">Filter</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-row items-center bg-green-500 rounded-lg px-4 py-2"
            onPress={() => setSortModalVisible(true)}
          >
            <ArrowUpDown color="#ffffff" size={20} className="mr-2" />
            <Text className="text-white font-rmedium">Sort</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={filteredAndSortedTransactions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <TransactionItem transaction={item} />}
        />
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

export default FinanceScreen
