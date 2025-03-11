import { useState, useEffect } from 'react';
import {
	View,
	Text,
	Modal,
	TouchableOpacity,
	ScrollView,
	Image,
	TextInput,
	Switch,
	Platform,
	KeyboardAvoidingView,
} from 'react-native';
import {
	X,
	CalendarDays,
	Clock,
	RepeatIcon,
	PaperclipIcon,
	ChevronRight,
	AlertCircle,
	Check,
} from 'lucide-react-native';
import { formatDistanceToNow, format } from 'date-fns';
import { Transaction, TransactionStatus, TransactionType, Category } from 'src/types/transaction';
import useStore from 'src/store/useStore';
import { getTransactionIcon } from 'src/utils/getCategory';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useFeedbackModal } from '../ui/feedback';

interface TransactionDetailsModalProps {
	transaction: Transaction | null;
	visible: boolean;
	onClose: () => void;
}

const StatusBadge = ({ status }: { status?: TransactionStatus }) => {
	if (!status) return null;

	const getStatusColor = () => {
		switch (status) {
			case 'completed':
				return 'bg-green-100 text-green-800';
			case 'due-to-pay':
				return 'bg-red-100 text-red-800';
			case 'pending':
				return 'bg-yellow-100 text-yellow-800';
			default:
				return 'bg-gray-100 text-gray-800';
		}
	};

	const getStatusText = () => {
		switch (status) {
			case 'completed':
				return 'Completed';
			case 'due-to-pay':
				return 'Due to Pay';
			case 'pending':
				return 'Pending';
			default:
				return status;
		}
	};

	return (
		<View className={`px-3 py-1 rounded-full ${getStatusColor().split(' ')[0]}`}>
			<Text className={`text-xs font-rmedium ${getStatusColor().split(' ')[1]}`}>
				{getStatusText()}
			</Text>
		</View>
	);
};

const TransactionDetailsModal: React.FC<TransactionDetailsModalProps> = ({
	transaction,
	visible,
	onClose,
}) => {
	const { categories } = useStore();
	const [expandedAttachment, setExpandedAttachment] = useState<string | null>(null);
	const [isEditing, setIsEditing] = useState(false);
	const [editedTransaction, setEditedTransaction] = useState<Transaction | null>(null);
	const [showDatePicker, setShowDatePicker] = useState(false);
	const [showRecurringEndDatePicker, setShowRecurringEndDatePicker] = useState(false);
	const [showStatusDropdown, setShowStatusDropdown] = useState(false);
	const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
	const [showFrequencyDropdown, setShowFrequencyDropdown] = useState(false);

		const { showModal, hideModal } = useFeedbackModal();
		const { deleteTransaction, updateBudget } = useStore();

		useEffect(() => {
		if (transaction) {
			setEditedTransaction({ ...transaction });
		}
	}, [transaction]);

	if (!transaction || !editedTransaction) return null;

	const category = categories.find(
		(cat) => cat.id === (isEditing ? editedTransaction.categoryId : transaction.categoryId)
	);

	const formatAmount = (amount: number, type: TransactionType) => {
		const formattedAmount = new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
		}).format(Math.abs(amount));

		return type === 'income' ? `+${formattedAmount}` : `-${formattedAmount}`;
	};

	const getTypeColor = (type: TransactionType) => {
		return type === 'income' ? 'text-green-600' : 'text-red-600';
	};

	const getBackgroundColor = (type: TransactionType) => {
		return type === 'income' ? 'bg-green-100' : 'bg-red-100';
	};

	const renderFrequencyText = (frequency: string) => {
		switch (frequency) {
			case 'daily':
				return 'Daily';
			case 'weekly':
				return 'Weekly';
			case 'monthly':
				return 'Monthly';
			case 'yearly':
				return 'Yearly';
			default:
				return frequency;
		}
	};

	const renderAttachments = () => {
		const attachments = isEditing ? editedTransaction.attachments : transaction.attachments;
		if (!attachments || attachments.length === 0) return null;

		return (
			<View className="mt-4">
				<Text className="text-lg font-rbold text-gray-800 dark:text-white mb-2">Attachments</Text>
				<View className="flex-row flex-wrap">
					{attachments.map((attachment, index) => (
						<TouchableOpacity
							key={index}
							onPress={() => setExpandedAttachment(attachment)}
							className="mr-2 mb-2"
						>
							{isEditing && (
								<TouchableOpacity
									className="absolute right-0 top-0 z-10 bg-red-500 rounded-full p-1"
									onPress={() => {
										if (editedTransaction.attachments) {
											const newAttachments = [...editedTransaction.attachments];
											newAttachments.splice(index, 1);
											setEditedTransaction({ ...editedTransaction, attachments: newAttachments });
										}
									}}
								>
									<X size={12} color="white" />
								</TouchableOpacity>
							)}
							<Image
								source={{ uri: attachment }}
								className="w-20 h-20 rounded-lg"
								resizeMode="cover"
							/>
						</TouchableOpacity>
					))}
				</View>
			</View>
		);
	};

	const Icon = getTransactionIcon(
		isEditing ? editedTransaction.categoryId : transaction.categoryId
	);

	const handleSave = () => {
		if (editedTransaction) {
			updateBudget(editedTransaction);
			setIsEditing(false);
		}
	};

	const toggleType = () => {
		if (editedTransaction) {
			const newType: TransactionType = editedTransaction.type === 'income' ? 'expense' : 'income';
			setEditedTransaction({ ...editedTransaction, type: newType });
		}
	};

	const handleCancel = () => {
		setEditedTransaction({ ...transaction });
		setIsEditing(false);
	};

	const handleDelete = () => {
		if (transaction) {
			showModal({
				type: 'confirmation',
				title: 'Delete Transaction',
				message: `Are you sure you want to delete "${transaction.description}"? This action cannot be undone.`,
				primaryButtonText: 'Cancel',
				secondaryButtonText: 'Delete',
				onSecondaryAction: () => {
					// Close the details modal first
					hideModal();

					// Delete the transaction
					deleteTransaction(transaction.id);

					// Show success feedback
					setTimeout(() => {
						showModal({
							type: 'success',
							title: 'Transaction Deleted',
							message: 'The transaction has been successfully removed from your records.',
							autoClose: true,
						});
					}, 300);
				},
				onPrimaryAction: ()=> onClose(),
				autoClose:true
			});
		}
	};

	const renderStatusOptions = () => {
		const statuses: TransactionStatus[] = ['completed', 'due-to-pay', 'pending'];

		return (
			<View className="absolute top-10 right-0 bg-white dark:bg-gray-700 rounded-lg shadow-md z-10 w-40">
				{statuses.map((status) => (
					<TouchableOpacity
						key={status}
						className="px-4 py-2 border-b border-gray-100 dark:border-gray-600"
						onPress={() => {
							setEditedTransaction({ ...editedTransaction, status });
							setShowStatusDropdown(false);
						}}
					>
						<Text className="text-gray-700 dark:text-gray-200">
							{status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
						</Text>
					</TouchableOpacity>
				))}
			</View>
		);
	};

	const renderCategoryOptions = () => {
		// Filter categories based on the transaction type
		const filteredCategories = categories.filter(
			(cat) =>
				cat.type === editedTransaction?.type || (cat.type === 'income' && cat.type === 'expense')
		);
		return (
			<View className="absolute top-10 right-0 bg-white dark:bg-gray-700 rounded-lg shadow-md z-10 w-56 max-h-64">
				<ScrollView>
					{filteredCategories.map((cat) => {
						const Icon = getTransactionIcon(cat.id);
						return(
						<TouchableOpacity
							key={cat.id}
							className="px-4 py-3 border-b border-gray-100 dark:border-gray-600 flex-row items-center"
							onPress={() => {
								setEditedTransaction({ ...editedTransaction, categoryId: cat.id });
								setShowCategoryDropdown(false);
							}}
						>
							<View className="mr-3 bg-gray-100 dark:bg-gray-600 rounded-full p-1">
								<Icon size={20} color={cat.color} />
							</View>
							<Text className="text-gray-700 dark:text-gray-200">{cat.name}</Text>
						</TouchableOpacity>
					)})}
				</ScrollView>
			</View>
		);
	};

	const renderFrequencyOptions = () => {
		const frequencies = ['daily', 'weekly', 'monthly', 'yearly'];

		return (
			<View className="absolute top-10 right-0 bg-white dark:bg-gray-700 rounded-lg shadow-md z-10 w-40">
				{frequencies.map((frequency) => (
					<TouchableOpacity
						key={frequency}
						className="px-4 py-2 border-b border-gray-100 dark:border-gray-600"
						onPress={() => {
							const recurring = editedTransaction.recurring
								? { ...editedTransaction.recurring, frequency: frequency as any }
								: { frequency: frequency as any };
							setEditedTransaction({ ...editedTransaction, recurring });
							setShowFrequencyDropdown(false);
						}}
					>
						<Text className="text-gray-700 dark:text-gray-200">
							{frequency.charAt(0).toUpperCase() + frequency.slice(1)}
						</Text>
					</TouchableOpacity>
				))}
			</View>
		);
	};

	return (
		<Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
			{expandedAttachment ? (
				<View className="flex-1 bg-black">
					<TouchableOpacity
						onPress={() => setExpandedAttachment(null)}
						className="absolute top-12 right-4 z-10 p-2 bg-gray-900 rounded-full"
					>
						<X color="white" size={24} />
					</TouchableOpacity>
					<Image source={{ uri: expandedAttachment }} className="flex-1" resizeMode="contain" />
				</View>
			) : (
				<KeyboardAvoidingView
					behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
					className="flex-1"
				>
					<View className="flex-1 justify-end">
						<View
							className="bg-black/50 absolute inset-0"
							onTouchEnd={!isEditing ? onClose : undefined}
						/>
						<View className="bg-white dark:bg-gray-800 rounded-t-3xl max-h-5/6">
							{/* Header with close/cancel button */}
							<View className="flex-row justify-between items-center px-6 pt-6 pb-2">
								<Text className="text-2xl font-rbold text-gray-900 dark:text-white">
									{isEditing ? 'Edit Transaction' : 'Transaction Details'}
								</Text>
								<TouchableOpacity onPress={isEditing ? handleCancel : onClose} className="p-2">
									<X size={24} color="#6B7280" />
								</TouchableOpacity>
							</View>

							<ScrollView className="px-6 pb-8">
								{/* Transaction Title and Amount */}
								<View
									className={`mt-4 p-6 rounded-2xl ${getBackgroundColor(isEditing ? editedTransaction.type : transaction.type)}`}
								>
									{isEditing ? (
										<>
											<TextInput
												value={editedTransaction.description}
												onChangeText={(text) =>
													setEditedTransaction({ ...editedTransaction, description: text })
												}
												className="text-xl font-rmedium text-gray-800 dark:text-gray-200 mb-2 border-b border-gray-300 dark:border-gray-600 pb-2"
												placeholder="Description"
												placeholderTextColor="#9CA3AF"
											/>
											<View className="flex-row items-center justify-between">
												<TextInput
													value={editedTransaction.amount.toString()}
													onChangeText={(text) => {
														const amount = parseFloat(text.replace(/[^0-9.]/g, ''));
														if (!isNaN(amount)) {
															setEditedTransaction({ ...editedTransaction, amount });
														}
													}}
													keyboardType="numeric"
													className={`text-3xl font-rbold ${getTypeColor(editedTransaction.type)}`}
												/>
												<TouchableOpacity
													onPress={toggleType}
													className="bg-white dark:bg-gray-700 px-3 py-1 rounded-full"
												>
													<Text className={getTypeColor(editedTransaction.type)}>
														{editedTransaction.type.charAt(0).toUpperCase() +
															editedTransaction.type.slice(1)}
													</Text>
												</TouchableOpacity>
											</View>
										</>
									) : (
										<>
											<Text className="text-xl font-rmedium text-gray-800 dark:text-gray-200 mb-2">
												{transaction.description}
											</Text>
											<Text className={`text-3xl font-rbold ${getTypeColor(transaction.type)}`}>
												{formatAmount(transaction.amount, transaction.type)}
											</Text>
										</>
									)}
									<View className="flex-row items-center mt-3">
										<CalendarDays size={16} color="#6B7280" />
										{isEditing ? (
											<TouchableOpacity
												onPress={() => setShowDatePicker(true)}
												className="ml-2 flex-row items-center"
											>
												<Text className="text-sm text-blue-500 dark:text-blue-400">
													{format(editedTransaction.date, 'MMMM d, yyyy')}
												</Text>
												<ChevronRight size={16} color="#3B82F6" />
											</TouchableOpacity>
										) : (
											<Text className="ml-2 text-sm text-gray-600 dark:text-gray-300">
												{format(transaction.date, 'MMMM d, yyyy')}
											</Text>
										)}
									</View>
								</View>

								{/* Status Badge */}
								<View className="mt-4 flex-row items-center justify-between">
									<Text className="text-lg font-rbold text-gray-800 dark:text-white">Status</Text>
									{isEditing ? (
										<View className="relative">
											<TouchableOpacity
												onPress={() => setShowStatusDropdown(!showStatusDropdown)}
												className="flex-row items-center bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded-lg"
											>
												<StatusBadge status={editedTransaction.status} />
												<ChevronRight size={16} color="#6B7280" className="ml-2" />
											</TouchableOpacity>
											{showStatusDropdown && renderStatusOptions()}
										</View>
									) : (
										transaction.status && <StatusBadge status={transaction.status} />
									)}
								</View>

								{/* Category Information */}
								<View className="mt-6">
									<View className="flex-row justify-between items-center mb-2">
										<Text className="text-lg font-rbold text-gray-800 dark:text-white">
											Category
										</Text>
										{isEditing && (
											<View className="relative">
												<TouchableOpacity
													onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
													className="flex-row items-center bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded-lg"
												>
													<Text className="text-sm text-blue-500 dark:text-blue-400 mr-1">
														Change
													</Text>
													<ChevronRight size={16} color="#3B82F6" />
												</TouchableOpacity>
												{showCategoryDropdown && renderCategoryOptions()}
											</View>
										)}
									</View>
									{category && (
										<View className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
											<View className="flex-row items-center">
												<View className="mr-4 bg-gray-100 dark:bg-gray-700 rounded-full p-2">
													<Icon color={category?.color || '#9CA3AF'} />
												</View>
												<View className="ml-3">
													<Text className="text-base font-rmedium text-gray-800 dark:text-white">
														{category.name}
													</Text>
													{isEditing ? (
														<TextInput
															value={editedTransaction.subcategory || ''}
															onChangeText={(text) =>
																setEditedTransaction({
																	...editedTransaction,
																	subcategory: text || undefined,
																})
															}
															placeholder="Subcategory (optional)"
															placeholderTextColor="#9CA3AF"
															className="text-sm text-gray-600 dark:text-gray-300"
														/>
													) : transaction.subcategory ? (
														<Text className="text-sm text-gray-600 dark:text-gray-300">
															{transaction.subcategory}
														</Text>
													) : null}
												</View>
											</View>
										</View>
									)}
								</View>

								{/* Timing Information */}
								<View className="mt-4">
									<Text className="text-lg font-rbold text-gray-800 dark:text-white mb-2">
										Timing
									</Text>
									<View className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
										<View className="flex-row items-center mb-3">
											<CalendarDays size={18} color="#6B7280" />
											<Text className="ml-3 text-base text-gray-700 dark:text-gray-300">
												{format(
													isEditing ? editedTransaction.date : transaction.date,
													'EEEE, MMMM d, yyyy'
												)}
											</Text>
										</View>
										<View className="flex-row items-center">
											<Clock size={18} color="#6B7280" />
											<Text className="ml-3 text-base text-gray-700 dark:text-gray-300">
												{formatDistanceToNow(
													isEditing ? editedTransaction.date : transaction.date,
													{ addSuffix: true }
												)}
											</Text>
										</View>
									</View>
								</View>

								{/* Recurring Information */}
								<View className="mt-4">
									<View className="flex-row justify-between items-center mb-2">
										<Text className="text-lg font-rbold text-gray-800 dark:text-white">
											Recurring
										</Text>
										{isEditing && (
											<Switch
												value={!!editedTransaction.recurring}
												onValueChange={(value) => {
													if (value) {
														setEditedTransaction({
															...editedTransaction,
															recurring: { frequency: 'monthly' },
														});
													} else {
														setEditedTransaction({
															...editedTransaction,
															recurring: undefined,
														});
													}
												}}
											/>
										)}
									</View>

									{(isEditing && editedTransaction.recurring) ||
									(!isEditing && transaction.recurring) ? (
										<View className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
											<View className="flex-row items-center justify-between">
												<View className="flex-row items-center">
													<RepeatIcon size={18} color="#6B7280" />
													<Text className="ml-3 text-base text-gray-700 dark:text-gray-300">
														{renderFrequencyText(
															isEditing
																? editedTransaction.recurring?.frequency || 'monthly'
																: transaction.recurring?.frequency || 'monthly'
														)}{' '}
														payment
													</Text>
												</View>
												{isEditing && (
													<View className="relative">
														<TouchableOpacity
															onPress={() => setShowFrequencyDropdown(!showFrequencyDropdown)}
															className="flex-row items-center"
														>
															<Text className="text-sm text-blue-500 dark:text-blue-400 mr-1">
																Change
															</Text>
															<ChevronRight size={16} color="#3B82F6" />
														</TouchableOpacity>
														{showFrequencyDropdown && renderFrequencyOptions()}
													</View>
												)}
											</View>

											<View className="flex-row items-center justify-between mt-3">
												<View className="flex-row items-center">
													<AlertCircle size={18} color="#6B7280" />
													<Text className="ml-3 text-base text-gray-700 dark:text-gray-300">
														{isEditing
															? editedTransaction.recurring?.endDate
																? `Ends on ${format(editedTransaction.recurring.endDate, 'MMMM d, yyyy')}`
																: 'No end date'
															: transaction.recurring?.endDate
																? `Ends on ${format(transaction.recurring.endDate, 'MMMM d, yyyy')}`
																: 'No end date'}
													</Text>
												</View>
												{isEditing && (
													<TouchableOpacity
														onPress={() => setShowRecurringEndDatePicker(true)}
														className="flex-row items-center"
													>
														<Text className="text-sm text-blue-500 dark:text-blue-400 mr-1">
															{editedTransaction.recurring?.endDate ? 'Change' : 'Set'}
														</Text>
														<ChevronRight size={16} color="#3B82F6" />
													</TouchableOpacity>
												)}
											</View>
										</View>
									) : (
										!isEditing && (
											<View className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
												<Text className="text-base text-gray-700 dark:text-gray-300">
													Not a recurring transaction
												</Text>
											</View>
										)
									)}
								</View>

								{/* Attachments */}
								{renderAttachments()}

								{/* Date Pickers (invisible until needed) */}
								{showDatePicker && (
									<DateTimePicker
										value={editedTransaction.date}
										mode="date"
										display="default"
										onChange={(event, selectedDate) => {
											setShowDatePicker(false);
											if (selectedDate) {
												setEditedTransaction({ ...editedTransaction, date: selectedDate });
											}
										}}
									/>
								)}

								{showRecurringEndDatePicker && (
									<DateTimePicker
										value={editedTransaction.recurring?.endDate || new Date()}
										mode="date"
										display="default"
										onChange={(event, selectedDate) => {
											setShowRecurringEndDatePicker(false);
											if (selectedDate && editedTransaction.recurring) {
												setEditedTransaction({
													...editedTransaction,
													recurring: { ...editedTransaction.recurring, endDate: selectedDate },
												});
											}
										}}
									/>
								)}

								{/* Actions */}
								<View className="mt-6 space-y-2">
									{isEditing ? (
										<>
											<TouchableOpacity
												onPress={handleSave}
												className="bg-blue-500 p-4 rounded-xl flex-row items-center justify-center"
											>
												<Check size={20} color="white" className="mr-2" />
												<Text className="text-white font-rmedium text-base">Save Changes</Text>
											</TouchableOpacity>
											<TouchableOpacity
												onPress={handleCancel}
												className="border border-gray-300 p-4 rounded-xl flex-row items-center justify-center"
											>
												<Text className="text-gray-700 dark:text-gray-300 font-rmedium text-base">
													Cancel
												</Text>
											</TouchableOpacity>
										</>
									) : (
										<>
											<TouchableOpacity
												onPress={() => setIsEditing(true)}
												className="bg-blue-500 p-4 rounded-xl flex-row items-center justify-center"
											>
												<Text className="text-white font-rmedium text-base">Edit Transaction</Text>
											</TouchableOpacity>
											<TouchableOpacity
												onPress={handleDelete}
												className="border border-red-500 p-4 rounded-xl flex-row items-center justify-center"
											>
												<Text className="text-red-500 font-rmedium text-base">
													Delete Transaction
												</Text>
											</TouchableOpacity>
										</>
									)}
								</View>
							</ScrollView>
						</View>
					</View>
				</KeyboardAvoidingView>
			)}
		</Modal>
	);
};

export default TransactionDetailsModal;
