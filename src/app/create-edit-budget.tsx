import {
	View,
	Text,
	TouchableOpacity,
	ScrollView,
	TextInput,
	FlatList,
	ActivityIndicator,
} from 'react-native';
import { Check, DollarSign, SlidersHorizontal, MoveLeft } from 'lucide-react-native';
import {
	Budget,
	BUDGET_RULE_ALLOCATIONS,
	BudgetPeriodType,
	BudgetRuleType,
	BudgetStatus,
	Category,
} from 'src/types/transaction';
import useStore from 'src/store/useStore';
import { useEffect } from 'react';
import CategoryItem from 'src/components/create-edit-budget/category-item';
import AllocationGroup from 'src/components/create-edit-budget/allocation-group';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import DateTimePickerComponent from 'src/components/date.time';
import { observer, use$, useObservable } from '@legendapp/state/react';
import { useFeedbackModal } from 'src/components/ui/feedback';


function CreateEditBudget(): React.ReactElement {
	const { categories, getBudgetById } = useStore();
	const EXPENSE_CATEGORIES = categories.filter((cat) => cat.type === 'expense');
  const { selectedBudgetId } = useLocalSearchParams()
		const { showModal, hideModal } = useFeedbackModal()

  const selectedBudget = getBudgetById(selectedBudgetId as string || '');
  const state$ = useObservable({
    date: new Date(),
    showDatePicker :false,
		currentBudget: selectedBudget,
		loading: false,
		activeGroupIndex: null as number | null,
		searchText: '',
  })

  const { showDatePicker, date, currentBudget, loading, activeGroupIndex } = use$(state$)
  const setShowDatePicker = state$.showDatePicker.set
  const setDate = state$.date.set
	const setCurrentBudget = state$.currentBudget.set
	const setLoading = state$.loading.set
	const setActiveGroupIndex = state$.activeGroupIndex.set

	const { updateBudget, createBudget } = useStore();
	// Initialize or update the budget allocation groups when the rule type changes
	useEffect(() => {
		if (currentBudget?.ruleType) {
			setLoading(true);
			setTimeout(() => {
				if (!currentBudget?.categoryAllocations) {
					// Initialize with default groups from the selected rule
					const initialGroups =
						BUDGET_RULE_ALLOCATIONS[currentBudget.ruleType]?.groups.map((group) => ({
							...group,
							categories: [],
						})) || [];

					setCurrentBudget({
						...currentBudget,
						categoryAllocations: initialGroups,
					});
				} else {
					// Check if rule type changed and we need to restructure
					const currentGroupCount = currentBudget.categoryAllocations.length;
					const expectedGroupCount =
						BUDGET_RULE_ALLOCATIONS[currentBudget.ruleType]?.groups.length || 0;

					if (currentGroupCount !== expectedGroupCount) {
						// Rule type changed, we need to reset the allocations
						const newGroups =
							BUDGET_RULE_ALLOCATIONS[currentBudget.ruleType]?.groups.map((group) => ({
								...group,
								categories: [],
							})) || [];

						setCurrentBudget({
							...currentBudget,
							categoryAllocations: newGroups,
						});
					}
				}
				setLoading(false);
			}, 150); // Small delay for smoother transition
		}
	}, [currentBudget?.ruleType]);

	// Function to toggle a category in a specific group
	const toggleCategoryInGroup = (categoryId: string, groupIndex: number) => {
		if (!currentBudget?.categoryAllocations) return;

		const updatedAllocations = [...currentBudget.categoryAllocations];

		// First, remove this category from any other group it might be in
		updatedAllocations.forEach((group, idx) => {
			if (group.categories.includes(categoryId)) {
				updatedAllocations[idx] = {
					...group,
					categories: group.categories.filter((id) => id !== categoryId),
				};
			}
		});

		// Then, add it to the selected group if it's not already there
		if (!updatedAllocations[groupIndex].categories.includes(categoryId)) {
			updatedAllocations[groupIndex] = {
				...updatedAllocations[groupIndex],
				categories: [...updatedAllocations[groupIndex].categories, categoryId],
			};
		}

		setCurrentBudget({
			...currentBudget,
			categoryAllocations: updatedAllocations,
		});
	};

	// Helper to check if a category is in any group
	const getCategoryGroup = (categoryId: string): number | null => {
		if (!currentBudget?.categoryAllocations) return null;

		for (let i = 0; i < currentBudget.categoryAllocations.length; i++) {
			if (currentBudget.categoryAllocations[i].categories.includes(categoryId)) {
				return i;
			}
		}
		return null;
	};

	// Render a category item for selection
	const renderCategoryItem = ({ item }: { item: Category }) => {
		return (
			<CategoryItem
				item={item}
				activeGroupIndex={activeGroupIndex}
				getCategoryGroup={getCategoryGroup}
				toggleCategoryInGroup={toggleCategoryInGroup}
				currentBudget={currentBudget}
			/>
		);
	};

	// Calculate category count for each group
	const getCategoryCountForGroup = (index: number) => {
		if (!currentBudget?.categoryAllocations) return 0;
		return currentBudget.categoryAllocations[index].categories.length;
	};

	const handleSaveBudget = () => {
		if (!currentBudget?.name || currentBudget?.amount <= 0) {
			showModal({
				type: 'warning',
				title: 'Empty name',
				message: 'Please provide a name and valid amount',
			});
			
			return;
		}

		setLoading(true);
		try {
			if (currentBudget.id) {
				// Update existing budget
				updateBudget(currentBudget as Budget);
			} else {
				// Create new budget
				createBudget({...currentBudget, startDate: date});
			}
			setTimeout(() => {
				setLoading(false);
				router.back()
			}, 300); // Small delay for visual feedback
		} catch (error: any) {
			setLoading(false);
			showModal({
				type: 'error',
				title: 'Error',
				message: error.message,
			});
			
		}
	};

	return (
    <SafeAreaView className="flex-1 bg-black bg-opacity-60 justify-end">
      <View className="bg-white p-4 h-full">
        {/* Header */}
        <View className="flex-row gap-4 items-center mb-4">
          <TouchableOpacity onPress={() => router.back()}>
            <MoveLeft size={24} />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-800">
            {currentBudget?.id ? "Update Budget" : "Create Budget"}
          </Text>
        </View>

        <View className="bg-indigo-50 p-3 rounded-xl mb-5">
          <Text className="text-xs text-indigo-700 font-medium">
            The budget will be created as a draft and will not be visible until
            it is activated.
          </Text>
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Budget Name */}
          <View className="mb-5">
            <Text className="text-gray-700 mb-2 font-rmedium text-base">
              Budget Name
            </Text>
            <TextInput
              className="bg-gray-100 p-4 rounded-xl text-gray-800 border border-gray-200"
              value={currentBudget?.name}
              onChangeText={(text) =>
                setCurrentBudget({ ...currentBudget!, name: text })
              }
              placeholder="Budget name eg: Saving for vacation"
            />
          </View>

          {/* Budget Amount */}
          <View className="mb-5">
            <Text className="text-gray-700 mb-2 font-rmedium text-base">
              Budget Amount
            </Text>
            <View className="flex-row items-center bg-gray-100 rounded-xl border border-gray-200 overflow-hidden">
              <View className="p-4">
                <DollarSign size={20} color="#4F46E5" />
              </View>
              <TextInput
                className="flex-1 p-4 text-gray-800"
                value={
                  currentBudget?.amount ? currentBudget.amount.toString() : ""
                }
                onChangeText={(text) => {
                  const amount = text.replace(/[^0-9]/g, "");
                  setCurrentBudget({
                    ...currentBudget!,
                    amount: parseInt(amount || "0"),
                  });
                }}
                keyboardType="numeric"
                placeholder="0"
              />
            </View>
          </View>

          {/* Budget Period */}
          <View className="mb-5">
            <Text className="text-gray-700 mb-2 font-amedium text-sm">
              Budget Period
            </Text>
            <View className="flex-row">
              {["week", "month", "year"].map((period) => (
                <TouchableOpacity
                  key={period}
                  className={`flex-1 py-2 ${
                    period === "year" ? "" : "mr-3"
                  } rounded-xl ${
                    currentBudget?.periodType === period
                      ? "bg-indigo-100 border-2 border-indigo-300"
                      : "bg-gray-100 border border-gray-200"
                  }`}
                  onPress={() =>
                    setCurrentBudget({
                      ...currentBudget!,
                      periodType: period as BudgetPeriodType,
                    })
                  }
                >
                  <Text
                    className={`text-center font-medium ${
                      currentBudget?.periodType === period
                        ? "text-indigo-700"
                        : "text-gray-700"
                    }`}
                  >
                    {period.charAt(0).toUpperCase() + period.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <DateTimePickerComponent
            onDateChange={setDate}
            showDatePicker={showDatePicker}
            setShowDatePicker={setShowDatePicker}
            showTimePicker={false}
            timeSelection={false}
            onTimeChange={(e) => console.log(e)}
            value={date}
          />
          {/* Allocation Rule */}
          <View className="mb-5">
            <Text className="text-gray-700 mb-2 font-amedium text-base">
              Allocation Rule
            </Text>
            <View className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {Object.keys(BUDGET_RULE_ALLOCATIONS).map(
                (rule, index, array) => (
                  <TouchableOpacity
                    key={rule}
                    className={`py-4 px-4 flex-row justify-between items-center ${
                      index < array.length - 1 ? "border-b border-gray-200" : ""
                    }`}
                    onPress={() => {
                      setCurrentBudget({
                        ...currentBudget!,
                        ruleType: rule as BudgetRuleType,
                      });
                      // Reset active group when changing rule
                      setActiveGroupIndex(null);
                    }}
                  >
                    <View className="flex-row items-center">
                      <View className="w-10 h-10 bg-indigo-100 rounded-full items-center justify-center mr-3">
                        <SlidersHorizontal size={18} color="#4F46E5" />
                      </View>
                      <View>
                        <Text className="font-medium text-gray-800">
                          {rule} Rule
                        </Text>
                        <Text className="text-xs text-gray-500 mt-1">
                          {rule === "50-30-20"
                            ? "Needs 50%, Wants 30%, Savings 20%"
                            : rule === "10-70-20"
                            ? "Savings 10%, Expenses 70%, Investments 20%"
                            : "Necessities 80%, Discretionary 20%"}
                        </Text>
                      </View>
                    </View>

                    {currentBudget?.ruleType === rule ? (
                      <View className="bg-indigo-100 w-6 h-6 rounded-full items-center justify-center">
                        <Check size={16} color="#4F46E5" />
                      </View>
                    ) : null}
                  </TouchableOpacity>
                )
              )}
            </View>
          </View>

          {/* Category Allocations */}
          {currentBudget?.ruleType && currentBudget?.categoryAllocations && (
            <View className="mb-5">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-gray-700 font-rmedium text-base">
                  Category Allocations
                </Text>
                {activeGroupIndex !== null && (
                  <TouchableOpacity
                    onPress={() => setActiveGroupIndex(null)}
                    className="bg-gray-100 px-3 py-1 rounded-full"
                  >
                    <Text className="text-xs text-indigo-600 font-medium">
                      Done
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              <Text className="text-xs text-gray-500 mb-3">
                {activeGroupIndex !== null
                  ? `Select categories for "${currentBudget.categoryAllocations[activeGroupIndex].name}"`
                  : "Tap a group to assign categories"}
              </Text>

              {loading ? (
                <View className="items-center justify-center py-10">
                  <ActivityIndicator size="large" color="#4F46E5" />
                  <Text className="text-gray-500 mt-3">
                    Loading allocation groups...
                  </Text>
                </View>
              ) : (
                <View>
                  {/* Render allocation groups */}
                  {currentBudget.categoryAllocations.map(
                    (group: any, index: number) => (
                      <AllocationGroup
                        key={index}
                        index={index}
                        group={group}
                        categoryCount={getCategoryCountForGroup(index)}
                        activeGroupIndex={activeGroupIndex}
                        expenseCategories={EXPENSE_CATEGORIES}
                        isActive={activeGroupIndex === index}
                        setActiveGroupIndex={setActiveGroupIndex}
                        toggleCategoryInGroup={toggleCategoryInGroup}
                      />
                    )
                  )}
                </View>
              )}

              {/* Show category selection when a group is active */}
              {activeGroupIndex !== null && (
                <View className="bg-white rounded-xl border border-gray-200 mt-3 pb-2">
                  <FlatList
                    data={EXPENSE_CATEGORIES}
                    renderItem={renderCategoryItem}
                    keyExtractor={(item) => item.id}
                    nestedScrollEnabled={true}
                    style={{ maxHeight: 250 }}
                    ListEmptyComponent={() => (
                      <View className="items-center justify-center py-10">
                        <Text className="text-gray-500">
                          No categories found
                        </Text>
                        <TouchableOpacity className='bg-blue-500 p-4 rounded-xl mt-2'
													onPress={()=>router.navigate('/categories')}
												>
                          <Text className="text-gray-50">
                            Create Categories
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  />
                </View>
              )}
            </View>
          )}

        </ScrollView>

        {/* Save Button */}
        <TouchableOpacity
          className={`py-4 rounded-xl mt-4 ${
            loading ? "bg-indigo-400" : "bg-indigo-600"
          }`}
          onPress={handleSaveBudget}
          disabled={loading}
        >
          {loading ? (
            <View className="flex-row justify-center items-center">
              <ActivityIndicator size="small" color="#FFFFFF" />
              <Text className="text-white font-bold text-center ml-2">
                {currentBudget?.id ? "Updating..." : "Creating..."}
              </Text>
            </View>
          ) : (
            <Text className="text-white font-bold text-center">
              {currentBudget?.id ? "Update Budget" : "Create Budget"}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

export default observer(CreateEditBudget);
