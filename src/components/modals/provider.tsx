import { createContext, useContext, useMemo, ReactNode, memo } from 'react';
import { Modal, View, TouchableWithoutFeedback } from 'react-native';
import { observer, useObservable } from '@legendapp/state/react';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  Easing,
  runOnJS
} from 'react-native-reanimated';
import { Category, Reference } from 'src/store/notes/types';
import { AddReferenceModalProps } from './refrence';
import { PostponeProps } from './postpone';
import { NewCategoryProps } from './new.category';

// Constants
const ANIMATION_DURATION = 300;
const ANIMATION_CONFIG = {
  duration: ANIMATION_DURATION,
  easing: Easing.out(Easing.exp)
};

// Types


export interface NoteCategorySelectProps {
  categories: readonly Category[];
  selectedCategoryId: string;
  onSelectCategory: (categoryId: string) => void;
  onClose: () => void;
}

export interface ModalConfig {
  NewCategory: NewCategoryProps;
  Postpone: PostponeProps;
  NoteCategorySelect: NoteCategorySelectProps
  AddReferenceModal:AddReferenceModalProps
  CustomRuleForm: any;
}

export type ModalName = keyof ModalConfig;

type ModalComponents = {
  [K in ModalName]: React.FC<ModalConfig[K] & { onClose: () => void }>;
};

interface ModalContextType {
  show: <T extends ModalName>(
    modalName: T,
    props: Omit<ModalConfig[T], 'onClose'>
  ) => void;
  close: () => void;
}

interface ModalState<T extends ModalName = ModalName> {
  name: T | null;
  props?: Omit<ModalConfig[T], 'onClose'>;
}

// Lazy load modal components
const modalComponents: ModalComponents = {
  NewCategory: memo(require('./new.category').default),
  Postpone: memo(require('./postpone').default),
  CustomRuleForm: memo(require('./custom.rule').default),
  NoteCategorySelect: memo(require('./note.category.select').default),
  AddReferenceModal: memo(require('./refrence').default)
};

const ModalContext = createContext<ModalContextType | null>(null);

// Memoized Modal Content Component
const ModalContent = memo(({ 
  modalName, 
  modalProps, 
  animatedStyles, 
  onClose 
}: { 
  modalName: ModalName; 
  modalProps: any; 
  animatedStyles: any; 
  onClose: () => void;
}) => {
  const ModalComponent = modalComponents[modalName];
  const props = {
    ...modalProps,
    onClose,
    isVisible: true,
  };

  return (
    <Modal
      visible={true}
      transparent={true}
      statusBarTranslucent
      onRequestClose={onClose}
      animationType="none"
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View className="flex-1 bg-black/50 justify-center items-center">
          <TouchableWithoutFeedback>
            <Animated.View
              className="bg-white dark:bg-gray-800 p-6 rounded-3xl w-11/12 max-w-md shadow-lg"
              style={animatedStyles}
            >
              <ModalComponent {...props} />
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
});

interface ModalProviderProps {
  children: ReactNode;
}

const ModalProvider: React.FC<ModalProviderProps> = ({ children }) => {
  const state$ = useObservable<ModalState>({ name: null });
  const modalState = state$.get();
  const setModalState = state$.set;

  // Shared animation values
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);
 
  const animatedStyles = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }), []);

  const show = useMemo(() => <T extends ModalName>(
    name: T,
    props: Omit<ModalConfig[T], 'onClose'>
  ) => {
    setModalState({ name, props });
    scale.value = withTiming(1, ANIMATION_CONFIG);
    opacity.value = withTiming(1, { duration: ANIMATION_DURATION });
  }, [scale, opacity, setModalState]);

  const close = useMemo(() => () => {
    scale.value = withTiming(0.8, {
      ...ANIMATION_CONFIG,
      easing: Easing.in(Easing.exp)
    });
    opacity.value = withTiming(0, { duration: ANIMATION_DURATION }, (finished) => {
      if (finished) {
        runOnJS(setModalState)({ name: null });
      }
    });
  }, [scale, opacity, setModalState]);

  const contextValue = useMemo(() => ({ 
    show, 
    close 
  }), [show, close]);

  return (
    <ModalContext.Provider value={contextValue}> 
      {children}
      {modalState.name && (
        <ModalContent
          modalName={modalState.name}
          modalProps={modalState.props}
          animatedStyles={animatedStyles}
          onClose={close}
        />
      )}
    </ModalContext.Provider>
  );
};

export const useModal = (): ModalContextType => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};

export default observer(ModalProvider);
