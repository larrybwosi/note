import { Text, TouchableOpacity } from 'react-native';
import Animated, { FadeInDown, FadeOutUp, LinearTransition } from 'react-native-reanimated';
import { BudgetRuleType } from 'src/store/types';

interface Rule {
  type: BudgetRuleType;
  description: string;
  breakdown: string;
  color: string;
}

interface Step2BudgetRuleProps {
  rules: Rule[];
  selectedRule: BudgetRuleType;
  setSelectedRule: (rule: BudgetRuleType) => void;
}

const Step2BudgetRule: React.FC<Step2BudgetRuleProps> = ({ rules, selectedRule, setSelectedRule }) => (
  <Animated.View
    entering={FadeInDown.duration(600)}
    exiting={FadeOutUp.duration(400)}
    layout={LinearTransition.springify()}
    className="space-y-6"
  >
    <Text className="text-2xl font-rbold text-gray-900 dark:text-white mb-4">
      Choose a Budget Rule
    </Text>
    {rules.map((rule, index) => (
      <TouchableOpacity
        key={rule.type}
        onPress={() => setSelectedRule(rule.type)}
        className={`p-4 rounded-xl space-y-2 my-2 ${
          selectedRule === rule.type
            ? 'bg-blue-100 dark:bg-blue-900'
            : 'bg-gray-100 dark:bg-gray-800'
        }`}
      >
        <Animated.View entering={FadeInDown.delay(index * 100)}>
          <Text className="text-lg font-rbold text-gray-900 dark:text-white mb-2">
            {rule.type}
          </Text>
          <Text className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            {rule.description}
          </Text>
          <Text className="text-xs font-amedium" style={{ color: rule.color }}>
            {rule.breakdown}
          </Text>
        </Animated.View>
      </TouchableOpacity>
    ))}
  </Animated.View>
);

export default Step2BudgetRule;
