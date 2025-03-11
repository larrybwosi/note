import { useState } from 'react';
import {
	View,
	Text,
	Modal,
	TouchableOpacity,
	ScrollView,
	TouchableWithoutFeedback,
} from 'react-native';
import useStore from 'src/store/useStore';
import { TransactionStatus, TransactionType } from 'src/types/transaction';
import { getTransactionCategory } from 'src/utils/getCategory';

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
	const { categories } = useStore();

	const handleApply = () => {
		onApply({ type, status, category });
		onClose();
	};

	const handleReset = () => {
		setType(undefined);
		setStatus(undefined);
		setCategory(undefined);
	};

	// Handle click outside modal content to close
	const handleBackdropPress = () => {
		onClose();
	};

	// Prevent clicks inside the modal from closing it
	const handleModalContentPress = (e: any) => {
		e.stopPropagation();
	};

enum TransactionTypeEnum {
	'income',
	'expense',
}

enum TransactionStatusEnum {
	'completed',
	'pending',
}

	return (
		<Modal visible={visible} animationType="slide" transparent>
			<TouchableWithoutFeedback onPress={handleBackdropPress}>
				<View className="flex-1 justify-end bg-black bg-opacity-50">
					<TouchableWithoutFeedback onPress={handleModalContentPress}>
						<View className="bg-white dark:bg-gray-800 rounded-t-3xl p-6">
							<View className="items-center mb-2">
								<View className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
							</View>

							<Text className="text-2xl font-rbold text-gray-900 dark:text-white mb-4">
								Filter Transactions
							</Text>

							<ScrollView className="max-h-96">
								<View className="mb-4">
									<Text className="text-lg font-rmedium text-gray-900 dark:text-white mb-2">
										Transaction Type
									</Text>
									<View className="flex-row flex-wrap">
										{Object.values(TransactionTypeEnum)
											.filter((value) => typeof value === 'string')
											.map((t) => (
												<TouchableOpacity
													key={t as string}
													className={`mr-2 mb-2 px-3 py-2 rounded-full ${
														type === t ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-700'
													}`}
													onPress={() => setType(t as TransactionType)}
												>
													<Text
														className={`font-rmedium ${
															type === t ? 'text-white' : 'text-gray-900 dark:text-white'
														}`}
													>
														{t}
													</Text>
												</TouchableOpacity>
											))}
									</View>
								</View>

								<View className="mb-4">
									<Text className="text-lg font-rmedium text-gray-900 dark:text-white mb-2">
										Transaction Status
									</Text>
									<View className="flex-row flex-wrap">
										{Object.values(TransactionStatusEnum)
											.filter((value) => typeof value === 'string')
											.map((s) => (
												<TouchableOpacity
													key={s as string}
													className={`mr-2 mb-2 px-3 py-2 rounded-full ${
														status === s ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-700'
													}`}
													onPress={() => setStatus(s as TransactionStatus)}
												>
													<Text
														className={`font-rmedium ${
															status === s ? 'text-white' : 'text-gray-900 dark:text-white'
														}`}
													>
														{s}
													</Text>
												</TouchableOpacity>
											))}
									</View>
								</View>

								<View className="mb-4">
									<Text className="text-lg font-rmedium text-gray-900 dark:text-white mb-2">
										Category
									</Text>
									<View className="flex-row flex-wrap">
										{categories.map((c) => (
											<TouchableOpacity
												key={c.id || c.icon}
												className={`mr-2 mb-2 px-3 py-2 rounded-full ${
													category === c.icon ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-700'
												}`}
												onPress={() => setCategory(c.icon)}
											>
												<Text
													className={`font-rmedium ${
														category === c.icon ? 'text-white' : 'text-gray-900 dark:text-white'
													}`}
												>
													{c.name || getTransactionCategory(c.icon).name}
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

							<TouchableOpacity className="mt-4 self-center" onPress={onClose}>
								<Text className="text-gray-500 dark:text-gray-400 font-rmedium">Close</Text>
							</TouchableOpacity>
						</View>
					</TouchableWithoutFeedback>
				</View>
			</TouchableWithoutFeedback>
		</Modal>
	);
};
