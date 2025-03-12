import { useState, useEffect, useRef } from 'react';
import {
	View,
	Text,
	TextInput,
	ScrollView,
	TouchableOpacity,
	Platform,
	KeyboardAvoidingView,
	Animated,
	Easing,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import {
	DollarSign,
	ArrowRight,
	ArrowUp,
	ArrowDown,
	RepeatIcon,
	Briefcase,
	Check,
	Plus,
	CalendarDays,
	CheckCircle,
} from 'lucide-react-native';
import useStore from 'src/store/useStore';
import { ICON_MAP, TransactionStatus, TransactionType } from 'src/types/transaction';
import { router, useLocalSearchParams } from 'expo-router';
import { useFeedbackModal } from 'src/components/ui/feedback';
import { createUniqueId } from 'src/utils/store';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const CreateTransactionScreen = () => {
	const { type } = useLocalSearchParams();
	const { showModal } =useFeedbackModal();

	const [description, setDescription] = useState<string>('');
	const [amount, setAmount] = useState<string>('');
	const [selectedType, setSelectedType] = useState<TransactionType>(
		(type as TransactionType) || 'expense'
	);
	const [selectedCategory, setSelectedCategory] = useState<string>();
	const [date, setDate] = useState<Date>(new Date());
	const [showDatePicker, setShowDatePicker] = useState(false);
	const [isRecurring, setIsRecurring] = useState(false);
	const [recurringPeriod, setRecurringPeriod] = useState('monthly');

	const { addTransaction, categories } = useStore();

	const INCOME_CATEGORIES = categories?.filter((cat) => cat.type === 'income');
	const EXPENSE_CATEGORIES = categories?.filter((cat) => cat.type === 'expense');

	// React Native Animated values
	const formProgress = useRef(new Animated.Value(0)).current;
	const submitEnabled = useRef(new Animated.Value(0)).current;
	const recurringAnim = useRef(new Animated.Value(0)).current;
	const fadeAnim = useRef(new Animated.Value(0)).current;
	const slideAnim1 = useRef(new Animated.Value(50)).current;
	const slideAnim2 = useRef(new Animated.Value(50)).current;
	const slideAnim3 = useRef(new Animated.Value(50)).current;
	const slideAnim4 = useRef(new Animated.Value(50)).current;
	const slideAnim5 = useRef(new Animated.Value(50)).current;
	const slideAnim6 = useRef(new Animated.Value(50)).current;

	// Interpolated colors for progress bar
	const progressBarColor = formProgress.interpolate({
		inputRange: [0, 0.5, 1],
		outputRange: ['#f97316', '#f59e0b', '#10b981'],
	});

	// Reset category when transaction type changes
	useEffect(() => {
		setSelectedCategory('');
	}, [selectedType]);

	// Run entrance animations on mount
	useEffect(() => {
		Animated.timing(fadeAnim, {
			toValue: 1,
			duration: 600,
			useNativeDriver: true,
		}).start();

		// Sequence entrance animations for sections
		Animated.stagger(50, [
			Animated.timing(slideAnim1, {
				toValue: 0,
				duration: 300,
				useNativeDriver: true,
				easing: Easing.bezier(0.25, 0.1, 0.25, 1),
			}),
			Animated.timing(slideAnim2, {
				toValue: 0,
				duration: 300,
				useNativeDriver: true,
				easing: Easing.bezier(0.25, 0.1, 0.25, 1),
			}),
			Animated.timing(slideAnim3, {
				toValue: 0,
				duration: 300,
				useNativeDriver: true,
				easing: Easing.bezier(0.25, 0.1, 0.25, 1),
			}),
			Animated.timing(slideAnim4, {
				toValue: 0,
				duration: 300,
				useNativeDriver: true,
				easing: Easing.bezier(0.25, 0.1, 0.25, 1),
			}),
			Animated.timing(slideAnim5, {
				toValue: 0,
				duration: 300,
				useNativeDriver: true,
				easing: Easing.bezier(0.25, 0.1, 0.25, 1),
			}),
			Animated.timing(slideAnim6, {
				toValue: 0,
				duration: 300,
				useNativeDriver: true,
				easing: Easing.bezier(0.25, 0.1, 0.25, 1),
			}),
		]).start();
	}, []);

	// Update form progress based on filled fields
	useEffect(() => {
		const isFormValid =
			description?.trim()?.length > 0 &&
			amount?.trim()?.length > 0 &&
			selectedCategory !== undefined;

		Animated.timing(submitEnabled, {
			toValue: isFormValid ? 1 : 0,
			duration: 300,
			useNativeDriver: true,
			easing: Easing.bezier(0.25, 0.1, 0.25, 1),
		}).start();

		let progress = 0;
		if (description) progress += 0.2;
		if (amount) progress += 0.2;
		if (selectedType) progress += 0.2;
		if (selectedCategory) progress += 0.2;
		if (isRecurring ? recurringPeriod : true) progress += 0.2;

		Animated.timing(formProgress, {
			toValue: progress,
			duration: 600,
			useNativeDriver: false, // We can't use native driver for width changes
			easing: Easing.bezier(0.25, 0.1, 0.25, 1),
		}).start();
	}, [description, amount, selectedType, selectedCategory, isRecurring, recurringPeriod]);

	useEffect(() => {
		Animated.timing(recurringAnim, {
			toValue: isRecurring ? 1 : 0,
			duration: 300,
			useNativeDriver: false, // We can't use native driver for height changes
			easing: Easing.bezier(0.25, 0.1, 0.25, 1),
		}).start();
	}, [isRecurring]);

	// Date picker handling
	const onDateChange = (event: DateTimePickerEvent, selectedDate: Date | undefined) => {
		const currentDate = selectedDate || date;
		setShowDatePicker(Platform.OS === 'ios');
		setDate(currentDate);
	};

	// Handle form submission
	const handleSubmit = () => {
		if (!description || !amount || !selectedCategory) {
			showModal({
				type: 'error',
				title: 'Missing Fields',
				message: 'Please fill in all required fields before submitting.',
			});
			return;
		};

		const newTransaction = {
			id: createUniqueId(),
			description,
			amount: Number(amount),
			type: selectedType,
			categoryId: selectedCategory,
			date,
			status: 'completed' as TransactionStatus,
			isRecurring,
			recurringPeriod: isRecurring ? recurringPeriod : null,
		};

		addTransaction({ ...newTransaction });
		// Reset form with animation
		setDescription('');
		setAmount('');
		setSelectedCategory('');
		setDate(new Date());
		setIsRecurring(false);
		setRecurringPeriod('monthly');
		showModal({
			type: 'success',
			title: 'Success',
			message: `${newTransaction.description} added successfully!`,
			autoClose: true,
			autoCloseTime: 2000,
		});
		router.back();
	};

	const recurringOptions = [
		{ value: 'daily', label: 'Daily' },
		{ value: 'weekly', label: 'Weekly' },
		{ value: 'monthly', label: 'Monthly' },
		{ value: 'quarterly', label: 'Quarterly' },
		{ value: 'yearly', label: 'Yearly' },
	];

	// Transaction type options scale
	const transactionTypes = [
		{
			type: 'income',
			icon: <ArrowUp color="white" size={20} />,
			label: 'Income',
			colors: ['#0ea5e9', '#10b981'],
		},
		{
			type: 'expense',
			icon: <ArrowDown color="white" size={20} />,
			label: 'Expense',
			colors: ['#f97316', '#ef4444'],
		},
	];

	return (
		<KeyboardAvoidingView
			behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
			className="flex-1"
		>
			<ScrollView className="flex-1 bg-white" contentContainerClassName="pb-24">
				{/* Progress Indicator */}
				<View className="h-1 w-full bg-gray-100 mb-6">
					<Animated.View
						className="h-1 rounded-r"
						style={{
							width: formProgress.interpolate({
								inputRange: [0, 1],
								outputRange: ['0%', '100%'],
							}),
							backgroundColor: progressBarColor,
						}}
					/>
				</View>

				<View className="px-5">
					<Animated.Text
						className="text-3xl font-rbold text-gray-900 mb-6"
						style={{ opacity: fadeAnim }}
					>
						Add Transaction
					</Animated.Text>

					{/* Description Input */}
					<Animated.View
						className="mb-6"
						style={{
							opacity: fadeAnim,
							transform: [{ translateY: slideAnim1 }],
						}}
					>
						<Text className="text-base font-rmedium text-gray-600 mb-2">What was it for?</Text>
						<View className="flex-row items-center bg-gray-50 rounded-xl p-4 border border-gray-200">
							<TextInput
								className="flex-1 text-sm font-rregular text-gray-900 ml-2"
								placeholder="Coffee, groceries, gas money..."
								placeholderTextColor="#9ca3af"
								value={description}
								onChangeText={setDescription}
							/>
						</View>
					</Animated.View>

					{/* Amount Input */}
					<Animated.View
						className="mb-6"
						style={{
							opacity: fadeAnim,
							transform: [{ translateY: slideAnim2 }],
						}}
					>
						<Text className="text-base font-rmedium text-gray-600 mb-2">How much?</Text>
						<View className="flex-row items-center bg-gray-50 rounded-xl p-4 border border-gray-200">
							<DollarSign size={20} color="#6b7280" />
							<TextInput
								className="flex-1 text-sm font-rregular text-gray-900 ml-2"
								placeholder="0.00"
								placeholderTextColor="#9ca3af"
								keyboardType="decimal-pad"
								value={amount}
								onChangeText={setAmount}
							/>
						</View>
					</Animated.View>

					{/* Transaction Type Selector */}
					<Animated.View
						className="mb-6"
						style={{
							opacity: fadeAnim,
							transform: [{ translateY: slideAnim3 }],
						}}
					>
						<Text className="text-base font-rmedium text-gray-600 mb-2">Transaction Type</Text>
						<ScrollView horizontal showsHorizontalScrollIndicator={false} className="pb-2">
							{transactionTypes.map((item) => {
								const isSelected = selectedType === item.type;
								return (
									<AnimatedTouchable
										key={item.type}
										onPress={() => setSelectedType(item.type as TransactionType)}
										className={`mr-3 rounded-xl overflow-hidden`}
										style={{ opacity: !isSelected ? 0.85 : 1 }}
									>
										<LinearGradient
											colors={item.colors}
											start={{ x: 0, y: 0 }}
											end={{ x: 1, y: 1 }}
											className="px-4 py-3 flex-row items-center"
										>
											<View className="mr-2">{item.icon}</View>
											<Text className="font-rmedium text-white text-sm">{item.label}</Text>
											{isSelected && (
												<View className="ml-2 bg-white bg-opacity-30 rounded-xl p-1">
													<CheckCircle size={12} color="gray" />
												</View>
											)}
										</LinearGradient>
									</AnimatedTouchable>
								);
							})}
						</ScrollView>
					</Animated.View>

					{/* Category Selector - Conditionally render based on type */}
					<Animated.View
						className="mb-6"
						style={{
							opacity: fadeAnim,
							transform: [{ translateY: slideAnim4 }],
						}}
					>
						<Text className="text-base font-rmedium text-gray-600 mb-2">
							{selectedType === 'income' ? 'Income Source' : 'Expense Category'}
						</Text>
						<View className="flex-row flex-wrap">
							{(selectedType === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map(
								(category) => {
									const isSelected = selectedCategory === category.id;
									const Icon = ICON_MAP[category.icon] || Briefcase;

									return (
										<AnimatedTouchable
											key={category.id}
											onPress={() => setSelectedCategory(category.id)}
											className={`mr-3 mb-3 rounded-xl overflow-hidden`}
											style={{ opacity: !isSelected ? 0.85 : 1 }}
										>
											<LinearGradient
												colors={category.colors || ['#f97316', '#ef4444']}
												start={{ x: 0, y: 0 }}
												end={{ x: 1, y: 1 }}
												className="px-4 py-3 flex-row items-center rounded-xl"
											>
												<View className="mr-2">
													<Icon size={20} color="white" />
												</View>
												<Text className="font-rmedium text-white text-sm">{category.name}</Text>
												{isSelected && (
													<View className="ml-2 bg-white bg-opacity-30 rounded-xl p-1">
														<Check size={12} color="gray" />
													</View>
												)}
											</LinearGradient>
										</AnimatedTouchable>
									);
								}
							)}
						</View>
					</Animated.View>

					{/* Date Picker */}
					<Animated.View
						className="mb-6"
						style={{
							opacity: fadeAnim,
							transform: [{ translateY: slideAnim5 }],
						}}
					>
						<Text className="text-base font-rmedium text-gray-600 mb-2">When?</Text>
						<TouchableOpacity
							onPress={() => setShowDatePicker(true)}
							className="flex-row items-center justify-between bg-gray-50 rounded-xl p-4 border border-gray-200"
						>
							<View className="flex-row items-center">
								<CalendarDays size={20} color="#6b7280" />
								<Text className="ml-3 text-sm font-rregular text-gray-900">
									{date.toLocaleDateString(undefined, {
										year: 'numeric',
										month: 'long',
										day: 'numeric',
									})}
								</Text>
							</View>
							<ArrowRight size={18} color="#6b7280" />
						</TouchableOpacity>

						{showDatePicker && (
							<DateTimePicker
								value={date}
								mode="date"
								display={Platform.OS === 'ios' ? 'spinner' : 'default'}
								onChange={onDateChange}
							/>
						)}
					</Animated.View>

					{/* Recurring Toggle */}
					<Animated.View
						className="mb-6"
						style={{
							opacity: fadeAnim,
							transform: [{ translateY: slideAnim6 }],
						}}
					>
						<TouchableOpacity
							onPress={() => setIsRecurring(!isRecurring)}
							className="flex-row items-center justify-between mb-3"
						>
							<View className="flex-row items-center">
								<RepeatIcon size={20} color={isRecurring ? '#6366f1' : '#6b7280'} />
								<Text
									className={`ml-3 text-base font-rmedium ${isRecurring ? 'text-indigo-500' : 'text-gray-600'}`}
								>
									Repeating Transaction
								</Text>
							</View>
							<View
								className={`w-12 h-6 rounded-full px-0.5 flex justify-center ${isRecurring ? 'bg-indigo-100' : 'bg-gray-200'}`}
							>
								<Animated.View
									className={`w-5 h-5 rounded-full ${isRecurring ? 'bg-indigo-500 self-end' : 'bg-gray-400 self-start'}`}
									style={{
										transform: [
											{
												translateX: recurringAnim.interpolate({
													inputRange: [0, 1],
													outputRange: [0, 6], // Adjust the toggle movement
												}),
											},
										],
									}}
								/>
							</View>
						</TouchableOpacity>

						{/* Recurring Options */}
						<Animated.View
							style={{
								height: recurringAnim.interpolate({
									inputRange: [0, 1],
									outputRange: [0, 100],
								}),
								opacity: recurringAnim,
								marginBottom: recurringAnim.interpolate({
									inputRange: [0, 1],
									outputRange: [0, 24],
								}),
								overflow: 'hidden',
							}}
						>
							<Text className="text-base font-rmedium text-gray-600 mb-2">How often?</Text>
							<View className="flex-row flex-wrap">
								{recurringOptions.map((option) => {
									const isSelected = recurringPeriod === option.value;
									return (
										<TouchableOpacity
											key={option.value}
											onPress={() => setRecurringPeriod(option.value)}
											className={`mr-3 mb-2 px-4 py-2 rounded-xl border ${
												isSelected
													? 'bg-indigo-100 border-indigo-300'
													: 'bg-gray-50 border-gray-200'
											}`}
										>
											<Text
												className={`font-aregular text-sm ${
													isSelected ? 'text-indigo-500' : 'text-gray-600'
												}`}
											>
												{option.label}
											</Text>
										</TouchableOpacity>
									);
								})}
							</View>
						</Animated.View>
					</Animated.View>
				</View>
			</ScrollView>

			{/* Submit Button - Fixed to bottom */}
			<Animated.View
				style={{
					opacity: submitEnabled,
					position: 'absolute',
					bottom: 32,
					left: 0,
					right: 0,
					paddingHorizontal: 20,
					borderRadius: 12,
				}}
			>
				<TouchableOpacity
					onPress={handleSubmit}
					disabled={!description || !amount || !selectedCategory}
					className="w-full"
				>
					<LinearGradient
						colors={selectedType === 'income' ? ['#0ea5e9', '#10b981'] : ['#f97316', '#ef4444']}
						start={{ x: 0, y: 0 }}
						end={{ x: 1, y: 0 }}
						style={{ borderRadius: 18 }}
						className="w-full py-2 flex-row items-center justify-center shadow-lg"
					>
						<Plus size={20} color="white" />
						<Text className="ml-2 text-white dark:text-black-100 font-rbold text-md">
							Save {selectedType === 'income' ? 'Income' : 'Expense'}
						</Text>
					</LinearGradient>
				</TouchableOpacity>
			</Animated.View>
		</KeyboardAvoidingView>
	);
};

export default CreateTransactionScreen;
