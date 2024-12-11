import { View, Text } from 'react-native';
import Animated, { FadeInDown, FadeOutUp, LinearTransition } from 'react-native-reanimated';
import { CurrencyInput } from './custom';

interface Step1FinancialInfoProps {
  currentBalance: string;
  setCurrentBalance: (value: string) => void;
  monthlyIncome: string;
  setMonthlyIncome: (value: string) => void;
  errors: {
    currentBalance?: string;
    monthlyIncome?: string;
  };
}

const Step1FinancialInfo: React.FC<Step1FinancialInfoProps> = ({
  currentBalance,
  setCurrentBalance,
  monthlyIncome,
  setMonthlyIncome,
  errors
}) => (
  <Animated.View
    entering={FadeInDown.duration(600)}
    exiting={FadeOutUp.duration(400)}
    layout={LinearTransition.springify()}
    className="space-y-8 dark:bg-gray-900 dark:border-gray-800 bg-gray-50 border-gray-100 rounded-xl"
  >
    <View className="space-y-4">
      <Animated.Text
        entering={FadeInDown.delay(200).duration(600)}
        className="text-3xl font-rbold text-gray-900 dark:text-white"
      >
        Let's Start with Your Finances
      </Animated.Text>
      <Animated.Text
        entering={FadeInDown.delay(400).duration(600)}
        className="text-lg text-gray-600 font-rregular mt-4 dark:text-gray-400"
      >
        Enter your current balance to get started. You can also add your average monthly income if you'd like.
      </Animated.Text>
    </View>

    <Animated.View
      className="bg-white dark:bg-gray-800 mt-5 mb-3"
      entering={FadeInDown.delay(600).duration(800)}
    >
      <View className="space-y-6">
        <CurrencyInput
          label="Current Balance"
          value={currentBalance}
          onChangeText={setCurrentBalance}
          placeholder="0"
          error={errors.currentBalance}
        />
        <CurrencyInput
          label="Average Monthly Income (Optional)"
          value={monthlyIncome}
          onChangeText={setMonthlyIncome}
          placeholder="0"
          error={errors.monthlyIncome}
        />
        <View className="bg-blue-50 rounded-xl p-4 dark:bg-gray-800">
          <Text className="text-xs text-blue-700 leading-relaxed font-aregular">
            Tip: Your current balance is the total amount in your accounts right now. For average income, include all regular sources like salary and investments.
          </Text>
        </View>
      </View>
    </Animated.View>
  </Animated.View>
);

export default Step1FinancialInfo;
