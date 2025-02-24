import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react-native';

interface AnimatedTitleProps {
  title: string;
  subtitle: string;
}

export const AnimatedTitle: React.FC<AnimatedTitleProps> = ({ title, subtitle }) => (
  <>
    <Animated.Text
      entering={FadeInDown.delay(100)}
      className="text-3xl font-rbold text-gray-900 dark:text-gray-100 text-center"
    >
      {title}
    </Animated.Text>
    <Animated.Text
      entering={FadeInDown.delay(200)}
      className="text-sm font-aregular text-gray-600 dark:text-gray-400 text-center mt-2 mb-8"
    >
      {subtitle}
    </Animated.Text>
  </>
);

interface CurrencyInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  error?: string;
}

export const CurrencyInput: React.FC<CurrencyInputProps> = ({ label, value, onChangeText, placeholder, error }) => (
  <View>
    <Text className="text-lg font-amedium text-gray-700 mb-2 mt-2 dark:text-white">
      {label}
    </Text>
    <View className="flex-row items-center bg-gray-100 rounded-xl p-3 dark:bg-gray-700">
      <Text className="text-2xl font-bold text-blue-500 mr-2">$</Text>
      <TextInput
        className="flex-1 text-4xl font-bold text-gray-900"
        value={value}
        onChangeText={onChangeText}
        keyboardType="numeric"
        placeholder={placeholder}
        placeholderTextColor="#A0AEC0"
      />
    </View>
    {error && <Text className="text-red-500 text-sm mt-1">{error}</Text>}
  </View>
);

interface NavigationButtonsProps {
  step: number;
  onPrevious: () => void;
  onNext: () => void;
  onComplete: () => void;
  isNextDisabled: boolean;
}

export const NavigationButtons: React.FC<NavigationButtonsProps> = ({ step, onPrevious, onNext, onComplete, isNextDisabled }) => (
  <View className="flex-row justify-between items-center mt-8 mb-4">
    {step > 1 && (
      <TouchableOpacity
        className="flex-row items-center py-3 px-4"
        onPress={onPrevious}
      >
        <ArrowLeft size={24} color={'#9CA3AF'} />
        <Text className="ml-2 text-base font-plregular text-gray-600 dark:text-gray-400">
          Previous
        </Text>
      </TouchableOpacity>
    )}

    {step < 4 && (
      <TouchableOpacity
        className={'flex-row items-center bg-blue-500 dark:bg-blue-400 py-3 px-6 rounded-full ml-auto'}
        onPress={onNext}
        disabled={isNextDisabled}
      >
        <Text className="text-base font-plregular text-white dark:text-gray-900 mr-2">
          Next
        </Text>
        <ArrowRight size={24} color={'#111827'} />
      </TouchableOpacity>
    )}
    { step === 4 && (
      <TouchableOpacity
        className="flex-row items-center bg-green-500 dark:bg-green-400 py-3 px-6 rounded-full ml-auto shadow-lg shadow-green-500/20 dark:shadow-green-400/20"
        onPress={onComplete}
      >
        <Text className="text-base font-plregular text-white dark:text-gray-900 mr-2">
          Complete Setup
        </Text>
        <CheckCircle size={24} color={'#111827'} />
      </TouchableOpacity>
    )}
  </View>
);
