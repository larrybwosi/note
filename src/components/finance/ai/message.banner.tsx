import { Observable } from "@legendapp/state";
import { observer, useObservable } from "@legendapp/state/react";
import { AlertCircle, CheckCircle } from "lucide-react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Text } from "react-native-svg";
import { Theme } from "src/store/finance/types";

interface AppState {
  responses: any[];
  isLoading: boolean;
  error: string | null;
  savedPrompts: string[];
  prompt: string;
  successMessage: string | null;
  hasResult: boolean;
}

export interface MessageBannerProps {
  type: 'error' | 'success';
  store: Observable<AppState>;
  theme: Theme;
}
const MessageBanner: React.FC<MessageBannerProps> = observer(({ type, store, theme }) => {
  const message = useObservable(type === 'error' ? store.error : store.successMessage);
  
  if (!message.get()) return null;
  
  const backgroundColor = type === 'error' 
    ? 'bg-red-100 dark:bg-red-900/50'
    : 'bg-green-100 dark:bg-green-900/50';
  
  const textColor = type === 'error'
    ? 'text-red-800 dark:text-red-200'
    : 'text-green-800 dark:text-green-200';
    
  const Icon = type === 'error' ? AlertCircle : CheckCircle;
  
  return (
    <Animated.View 
      entering={FadeInDown.duration(400)}
      className={`${backgroundColor} p-4 mx-4 my-2 rounded-xl flex-row items-center`}
    >
      <Icon
        size={20} 
        color={type === 'error' ? theme.accent : theme.secondary[0]}
      />
      <Text className={`${textColor} font-amedium ml-2`}>{message.get()}</Text>
    </Animated.View>
  );
});

export default MessageBanner