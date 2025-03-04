import { Edit3, X } from "lucide-react-native";
import { useState } from "react";
import { Alert, Modal, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Category, ICON_MAP, ICON_OPTIONS, TransactionType } from "src/types/transaction";

interface CustomCategoryModalProps {
	customModalVisible: boolean;
	setCustomModalVisible: (visible: boolean) => void;
	createCustomCategory: (category: Category) => void;
}
const CustomCategoryModal = ({
	customModalVisible,
	setCustomModalVisible,
	createCustomCategory,
}: CustomCategoryModalProps) => {
	const [customCategory, setCustomCategory] = useState<Partial<Category>>({
		name: '',
		type: 'expense',
		color: '#4F46E5',
		icon: 'circle',
		isCustom: true,
	});

	const colorOptions = [
		'#4F46E5',
		'#10B981',
		'#F59E0B',
		'#EF4444',
		'#EC4899',
		'#8B5CF6',
		'#3B82F6',
		'#06B6D4',
		'#14B8A6',
		'#84CC16',
	];

	const handleCreateCustomCategory = () => {
		if (!customCategory.name?.trim()) {
			Alert.alert('Error', 'Please provide a name for your category');
			return;
		}

		const newId = `custom-${Date.now()}`;
		const newCategory: Category = {
			id: newId,
			name: customCategory.name,
			type: customCategory.type as TransactionType,
			color: customCategory.color || '#4F46E5',
			icon: customCategory.icon || 'circle',
			isCustom: true,
			description: customCategory.description || 'Custom category',
		};

		createCustomCategory(newCategory);
		setCustomModalVisible(false);
		setCustomCategory({
			name: '',
			type: 'expense',
			color: '#4F46E5',
			icon: 'circle',
			isCustom: true,
		});
	};
	return (
		<Modal
			visible={customModalVisible}
			animationType="slide"
			transparent={true}
			onRequestClose={() => setCustomModalVisible(false)}
		>
			<View className="flex-1 bg-black bg-opacity-50 justify-center items-center p-5">
				<View className="bg-white rounded-2xl w-full max-w-md p-5">
					<View className="flex-row justify-between items-center mb-4">
						<Text className="text-xl font-abold text-gray-800">Create Custom Category</Text>
						<TouchableOpacity onPress={() => setCustomModalVisible(false)} className="p-1">
							<X size={20} color="#6B7280" />
						</TouchableOpacity>
					</View>

					<View className="mb-4">
						<Text className="text-gray-700 mb-1 font-amedium">Category Name</Text>
						<View className="flex-row items-center bg-gray-100 rounded-lg border border-gray-200">
							<View className="p-3">
								<Edit3 size={18} color="#6B7280" />
							</View>
							<TextInput
								className="flex-1 p-3 text-gray-800"
								value={customCategory.name}
								onChangeText={(text) => setCustomCategory({ ...customCategory, name: text })}
								placeholder="Enter category name"
							/>
						</View>
					</View>

					<View className="mb-4">
						<Text className="text-gray-700 mb-1 font-amedium">Category Type</Text>
						<View className="flex-row">
							{['expense', 'income'].map((type) => (
								<TouchableOpacity
									key={type}
									className={`flex-1 py-3 ${type === 'income' ? 'ml-2' : 'mr-2'} rounded-lg ${
										customCategory.type === type
											? 'bg-indigo-100 border border-indigo-300'
											: 'bg-gray-100 border border-gray-200'
									}`}
									onPress={() =>
										setCustomCategory({ ...customCategory, type: type as TransactionType })
									}
								>
									<Text
										className={`text-center font-medium ${
											customCategory.type === type ? 'text-indigo-700' : 'text-gray-700'
										}`}
									>
										{type.charAt(0).toUpperCase() + type.slice(1)}
									</Text>
								</TouchableOpacity>
							))}
						</View>
					</View>

					<View className="mb-4">
						<Text className="text-gray-700 mb-1 font-amedium text-sm">Category Description (Optional)</Text>
						<TextInput
							className="bg-gray-100 p-3 rounded-lg text-gray-800 border border-gray-200"
							value={customCategory.description || ''}
							onChangeText={(text) => setCustomCategory({ ...customCategory, description: text })}
							placeholder="Brief description of this category"
							multiline
							numberOfLines={2}
						/>
					</View>

					<View className="mb-4">
						<Text className="text-gray-700 mb-1 font-medium">Color</Text>
						<View className="flex-row flex-wrap justify-between">
							{colorOptions.map((color) => (
								<TouchableOpacity
									key={color}
									className={`m-1 rounded-full ${customCategory.color === color ? 'border-2 border-gray-800' : ''}`}
									style={{ backgroundColor: color, width: 30, height: 30 }}
									onPress={() => setCustomCategory({ ...customCategory, color })}
								/>
							))}
						</View>
					</View>

					<View className="mb-4">
						<Text className="text-gray-700 mb-1 font-rmedium">Icon</Text>
						<View className="flex-row flex-wrap">
							{ICON_OPTIONS.map((icon) => {
								const Icon = ICON_MAP[icon];
								return (
									<TouchableOpacity
										key={icon}
										className={`m-1 p-2 rounded-lg ${
											customCategory.icon === icon
												? 'bg-indigo-100 border border-indigo-300'
												: 'bg-gray-50 border border-gray-200'
										}`}
										onPress={() => setCustomCategory({ ...customCategory, icon })}
									>
										<Icon size={20} color={customCategory.icon === icon ? '#4F46E5' : '#6B7280'} />
									</TouchableOpacity>
								);
							})}
						</View>
					</View>

					<View className="flex-row mt-2">
						<TouchableOpacity
							className="flex-1 py-3 bg-gray-200 rounded-lg mr-2"
							onPress={() => setCustomModalVisible(false)}
						>
							<Text className="text-gray-800 font-amedium text-center">Cancel</Text>
						</TouchableOpacity>
						<TouchableOpacity
							className="flex-1 py-3 bg-indigo-600 rounded-lg ml-2"
							onPress={handleCreateCustomCategory}
						>
							<Text className="text-white font-amedium text-center">Create Category</Text>
						</TouchableOpacity>
					</View>
				</View>
			</View>
		</Modal>
	);
};

export default CustomCategoryModal;