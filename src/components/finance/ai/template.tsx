import { ScrollView } from 'react-native';
import { observer } from '@legendapp/state/react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { observable } from '@legendapp/state';
import { synced } from '@legendapp/state/sync';
import { ObservablePersistMMKV } from '@legendapp/state/persist-plugins/mmkv';
import Header from 'src/components/finance/ai/header';
import MessageBanner from 'src/components/finance/ai/message.banner';
import PromptInput from 'src/components/finance/ai/prompt.input';
import ResponsesList from 'src/components/finance/ai/response.list';
import ExamplePrompts from 'src/components/finance/ai/example.prompts';
import { AICreatorTemplateProps, themes } from 'src/store/finance/types';

interface AppState {
  responses: any[];
  isLoading: boolean;
  error: string | null;
  savedPrompts: string[];
  prompt: string;
  successMessage: string | null;
  hasResult: boolean;
}

const createStore = (name: string) => observable<AppState>(
  synced({
    initial: {
      responses: [],
      isLoading: false,
      error: null,
      savedPrompts: [],
      prompt: '',
      successMessage: null,
      hasResult: false,
    },
    persist: {
      name: name,
      plugin: ObservablePersistMMKV
    }
  })
);

const AICreatorTemplate: React.FC<AICreatorTemplateProps> = ({
  title,
  subtitle,
  inputPlaceholder,
  examplePrompts,
  type,
  endpoint,
  addManualRoute,
  addManualButtonText,
  ItemComponent,
  itemComponentProps,
  theme = 'modern',
  layout = 'card',
  animation = 'bounce',
  promptStyle = 'chips'
}) => {
  const store = createStore(type);
  const selectedTheme = themes[theme];

  return (
    <SafeAreaView style={{ backgroundColor: selectedTheme.background.main }} className="flex-1 w-full">
      <ScrollView>
        <Header
          title={title} 
          subtitle={subtitle} 
          theme={selectedTheme}
          layout={layout}
        />
        <MessageBanner type="error" store={store} theme={selectedTheme} />
        <MessageBanner type="success" store={store} theme={selectedTheme} />
        <PromptInput
          store={store}
          inputPlaceholder={inputPlaceholder}
          theme={selectedTheme}
          layout={layout}
          animation={animation}
          endpoint={endpoint}
        />
        <ExamplePrompts
          store={store} 
          prompts={examplePrompts}
          theme={selectedTheme}
          promptStyle={promptStyle}
        />
        <ResponsesList 
          store={store} 
          ItemComponent={ItemComponent}
          itemComponentProps={itemComponentProps}
          theme={selectedTheme}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default observer(AICreatorTemplate);