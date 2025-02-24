// CategoryForm.tsx
import { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { useColorScheme } from 'react-native';
import { Category, ICON_MAP, ICON_OPTIONS, TransactionType } from 'src/types/transaction';
import AnimatedCard from './animated-card';

interface CategoryFormProps {
	onSubmit: (category: Omit<Category, 'id' | 'isCustom'>) => void;
	initialCategory?: Category;
	onCancel?: () => void;
}

const COLOR_OPTIONS = [
	'#FF6B6B',
	'#4ECDC4',
	'#45B7D1',
	'#96CEB4',
	'#FFEEAD',
	'#D4A5A5',
	'#9B59B6',
	'#3498DB',
	'#F1C40F',
	'#2ECC71',
];

const CategoryForm = ({ onSubmit, initialCategory, onCancel }: CategoryFormProps) => {
	const isEditing = !!initialCategory;
	const colorScheme = useColorScheme();
	const isDark = colorScheme === 'dark';

	const [name, setName] = useState(initialCategory?.name || '');
	const [selectedIcon, setSelectedIcon] = useState(initialCategory?.icon || ICON_OPTIONS[0]);
	const [selectedColor, setSelectedColor] = useState(initialCategory?.color || COLOR_OPTIONS[0]);
	const [selectedType, setSelectedType] = useState<TransactionType>(
		initialCategory?.type || 'expense'
	);

	const handleSubmit = () => {
		if (!name.trim()) return;

		onSubmit({
			name: name.trim(),
			type: selectedType,
			color: selectedColor,
			icon: selectedIcon,
		});

		if (!isEditing) {
			setName('');
			setSelectedIcon(ICON_OPTIONS[0]);
			setSelectedColor(COLOR_OPTIONS[0]);
			setSelectedType('expense');
		}
	};

	const renderIcon = (iconName: keyof typeof ICON_MAP, size: number, color: string) => {
		const IconComponent = ICON_MAP[iconName];
		return IconComponent ? <IconComponent size={size} color={color} /> : null;
	};

	return (
		<AnimatedCard>
			<Text className="text-lg font-amedium text-gray-900 dark:text-white mb-2">
				{isEditing ? 'Edit Category' : 'Create Category'}
			</Text>

			<TextInput
				className="bg-gray-100 dark:bg-gray-700 p-4 rounded-xl mb-4 text-gray-900 dark:text-white"
				value={name}
				onChangeText={setName}
				placeholder="Category name"
				placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
			/>

			<View className="flex-row gap-2 mb-4">
				<TouchableOpacity
					onPress={() => setSelectedType('expense')}
					className={`flex-1 p-2 rounded-lg ${selectedType === 'expense' ? 'bg-blue-500' : 'bg-gray-100 dark:bg-gray-700'}`}
				>
					<Text
						className={`text-center text-sm font-aregular ${selectedType === 'expense' ? 'text-white' : 'text-gray-900 dark:text-white'}`}
					>
						Expense
					</Text>
				</TouchableOpacity>
				<TouchableOpacity
					onPress={() => setSelectedType('income')}
					className={`flex-1 p-2 rounded-lg ${selectedType === 'income' ? 'bg-blue-500' : 'bg-gray-100 dark:bg-gray-700'}`}
				>
					<Text
						className={`text-center font-aregular text-sm ${selectedType === 'income' ? 'text-white' : 'text-gray-900 dark:text-white'}`}
					>
						Income
					</Text>
				</TouchableOpacity>
			</View>

			<ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
				{ICON_OPTIONS.map((icon) => (
					<TouchableOpacity
						key={icon}
						onPress={() => setSelectedIcon(icon)}
						className={`p-3 mr-2 rounded-xl ${
							selectedIcon === icon ? 'bg-indigo-500' : 'bg-gray-100 dark:bg-gray-700'
						}`}
					>
						{renderIcon(icon, 24, selectedIcon === icon ? '#fff' : '#6B7280')}
					</TouchableOpacity>
				))}
			</ScrollView>

			<ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
				{COLOR_OPTIONS.map((color) => (
					<TouchableOpacity
						key={color}
						onPress={() => setSelectedColor(color)}
						style={{ backgroundColor: color }}
						className={`w-10 h-10 mr-2 rounded-xl ${
							selectedColor === color ? 'border-4 border-blue-500' : ''
						}`}
					/>
				))}
			</ScrollView>

			<View className="flex-row gap-2">
				<TouchableOpacity
					onPress={handleSubmit}
					className="flex-1 bg-blue-500 dark:bg-blue-600 p-4 rounded-xl"
				>
					<Text className="text-white text-center font-semibold">
						{isEditing ? 'Save Changes' : 'Create Category'}
					</Text>
				</TouchableOpacity>

				{isEditing && (
					<TouchableOpacity
						onPress={onCancel}
						className="bg-gray-100 dark:bg-gray-700 p-4 rounded-xl flex-1"
					>
						<Text className="text-gray-900 dark:text-white text-center font-semibold">Cancel</Text>
					</TouchableOpacity>
				)}
			</View>
		</AnimatedCard>
	);
};


export default CategoryForm;