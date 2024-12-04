import { TouchableOpacity, Text, ViewStyle, TextStyle } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({ title, onPress, variant = 'primary', className = '' }) => {
  const baseStyle = 'rounded-xl py-4';
  const variantStyle = variant === 'primary' ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-700';
  const textStyle = variant === 'primary' ? 'text-white' : 'text-gray-900 dark:text-white';

  return (
    <TouchableOpacity
      className={`${baseStyle} ${variantStyle} ${className}`}
      onPress={onPress}
    >
      <Text className={`text-center font-rbold text-lg ${textStyle}`}>{title}</Text>
    </TouchableOpacity>
  );
};

