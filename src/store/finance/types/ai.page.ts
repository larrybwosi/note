import { themes } from "../data";


export interface AICreatorTemplateProps {
  title: string;
  subtitle: string;
  inputPlaceholder: string;
  examplePrompts: string[];
  type: string;
  endpoint: string;
  addManualRoute: string;
  addManualButtonText: string;
  ItemComponent: React.ComponentType<ItemComponentProps>;
  itemComponentProps?: Record<string, any>;
  theme?: keyof typeof themes;
  layout?: 'card' | 'minimal';
  animation?: 'bounce' | 'slide' | 'fade';
  promptStyle?: 'chips' | 'list' | 'carousel';
}

interface ItemComponentProps {
  item: any;
  [key: string]: any;
}

export interface Theme {
  primary: string[];
  secondary: string[];
  accent: string;
  text: {
    primary: string;
    secondary: string;
  };
  background: {
    main: string;
    card: string;
  };
}

export interface HeaderProps {
  title: string;
  subtitle: string;
  theme: Theme;
  layout: 'card' | 'minimal';
}


