import { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList } from 'react-native';
import { DollarSign, ChevronRight, Check } from 'lucide-react-native';
import Animated, { FadeInDown, SlideInRight } from 'react-native-reanimated';
import { observer, use$ } from '@legendapp/state/react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { currencies, Currency } from 'src/utils/currency';
import { profile, profileData$ } from 'src/store/useProfile';

const CurrencySelector = () => {
	const [selectedCurrency, setSelectedCurrency] = useState<Currency>(currencies['USD']);
	const [modalVisible, setModalVisible] = useState(false);

	const handleCurrencySelect = (currency: Currency) => {
		setSelectedCurrency(currency);
		profileData$.currency.set(currency.code);
		setModalVisible(false);
	};

	const renderCurrencyItem = ({ item }: { item: Currency }) => (
		<TouchableOpacity
			onPress={() => handleCurrencySelect(item)}
			className="flex-row items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800"
		>
			<View className="flex-row items-center">
				<Text className="text-lg font-amedium mr-2 text-gray-800 dark:text-gray-200">
					{item.symbol}
				</Text>
				<Text className="text-base font-aregular text-gray-800 dark:text-gray-200">
					{item.code} - {item.name}
				</Text>
			</View>
			{selectedCurrency.code === item.code && (
				<Check size={20} className="text-purple-600 dark:text-purple-400" />
			)}
		</TouchableOpacity>
	);

	return (
		<SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
			<Text className="text-2xl font-rbold text-gray-800 dark:text-gray-200 px-4 mb-4 mt-4 pt-4">
				Currency Settings
			</Text>

			<Animated.View
				entering={FadeInDown.duration(400)}
				className="bg-white dark:bg-gray-800 rounded-2xl p-4 mx-4 mb-3 mt-4"
			>
				<TouchableOpacity
					onPress={() => setModalVisible(true)}
					activeOpacity={0.7}
					className="flex-row items-center justify-between"
				>
					<View className="flex-row items-center flex-1">
						<View className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-300 items-center justify-center">
							<DollarSign size={20} className="text-purple-600 dark:text-purple-400" />
						</View>
						<View className="ml-3 flex-1">
							<Text className="text-sm text-gray-500 dark:text-gray-400 font-amedium">
								Preferred Currency
							</Text>
							<Text className="text-sm font-aregular text-gray-900 dark:text-gray-100 mt-1">
								{selectedCurrency.symbol} {selectedCurrency.code} - {selectedCurrency.name}
							</Text>
						</View>
					</View>
					<ChevronRight size={20} className="text-gray-400 dark:text-gray-500" />
				</TouchableOpacity>
			</Animated.View>

			<Modal
				animationType="slide"
				transparent={true}
				visible={modalVisible}
				onRequestClose={() => setModalVisible(false)}
			>
				<View className="flex-1 bg-black bg-opacity-50">
					<Animated.View
						entering={SlideInRight}
						className="flex-1 mt-16 bg-white dark:bg-gray-900 rounded-t-3xl"
					>
						<View className="p-4 border-b border-gray-200 dark:border-gray-700 flex-row items-center justify-between">
							<Text className="text-xl font-rbold text-gray-800 dark:text-gray-200">
								Select Currency
							</Text>
							<TouchableOpacity
								onPress={() => setModalVisible(false)}
								className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700"
							>
								<Text className="text-gray-800 dark:text-gray-200 font-rmedium">Cancel</Text>
							</TouchableOpacity>
						</View>

						<FlatList
							data={Object.values(currencies)}
							renderItem={renderCurrencyItem}
							keyExtractor={(item) => item.code}
						/>
					</Animated.View>
				</View>
			</Modal>
		</SafeAreaView>
	);
};

CurrencySelector.displayName = 'CurrencySelector';
export default observer(CurrencySelector);
