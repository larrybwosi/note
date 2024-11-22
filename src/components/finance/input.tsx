import { TextInput, TextInputProps } from 'react-native';

interface FormInputProps extends TextInputProps {
  value: string;
  onChangeText: (text: string) => void;
}

export const FormInput: React.FC<FormInputProps> = ({ value, onChangeText, ...props }) => (
  <TextInput
    value={value}
    onChangeText={onChangeText}
    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-700"
    placeholderTextColor="#9CA3AF"
    {...props}
  />
);

