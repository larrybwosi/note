import { Observable } from "@legendapp/state";
import { observer } from "@legendapp/state/react";
import { View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Theme } from "src/store/finance/types";

// Define a generic type for the response item
export interface ResponseItem {
  id?: string | number;
  [key: string]: any;
}

interface AppState {
  responses: ResponseItem[];
  isLoading: boolean;
  error: string | null;
  savedPrompts: string[];
  prompt: string;
  successMessage: string | null;
  hasResult: boolean;
}

// Generic type for the ItemComponent props
export interface ItemComponentProps<T extends ResponseItem = ResponseItem> {
  item: T;
  theme?: Theme;
  [key: string]: any;
}

export interface ResponsesListProps {
  store: Observable<AppState>;
  ItemComponent: React.ComponentType<ItemComponentProps>;
  itemComponentProps?: Omit<ItemComponentProps, 'item'>;
  theme: Theme;
}

const ResponsesList: React.FC<ResponsesListProps> = observer(({ 
  store, 
  ItemComponent, 
  itemComponentProps, 
  theme 
}) => {
  const responses = store.responses.get();
  
  // Early return if no responses
  if (!responses || responses.length === 0) {
    return null;
  }

  const handleItemRender = (item: ResponseItem, index: number) => {
    // Handle both Observable and regular objects
    const itemData = item.get?.() || item;
    const itemId = itemData.id?.get?.() || itemData.id || index;

    return (
      <ItemComponent
        key={itemId}
        item={itemData}
        theme={theme}
        {...itemComponentProps}
      />
    );
  };

  return (
    <View className="pb-6">
      <Animated.Text 
        entering={FadeInDown.duration(400)}
        className="text-xl mb-4 px-4 font-rbold"
        style={{ color: theme.text.primary }}
      >
        Generated Content:
      </Animated.Text>
      
      {responses.map(handleItemRender)}
    </View>
  );
});

ResponsesList.displayName = 'ResponsesList';

export default ResponsesList;