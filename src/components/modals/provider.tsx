import { createContext, useState, useContext, useRef, useMemo, ReactNode } from 'react';
import { Modal, View, StyleSheet, TouchableWithoutFeedback, Animated } from 'react-native';
import NewCategory from './new.category';
import Postpone from './postpone';
import CustomRuleForm from './new.customrule';
import { colorScheme } from 'nativewind';

export interface NewCategoryProps{
  type:"INCOME"|"EXPENSES"
}
export interface PostponeProps {
  itemId:string;
  isVisible:boolean;
}

export interface CustomRuleProps {
  isVisible:boolean;
}

export interface ModalConfig {
  NewCategory: NewCategoryProps;
  Postpone: PostponeProps;
  CustomRuleForm:any
}

export type ModalName = keyof ModalConfig;

// Type for the modal components mapping
type ModalComponents = {
  [K in ModalName]: React.FC<ModalConfig[K]>;
};

interface ModalContextType {
  show: <T extends ModalName>(
    modalName: T,
    props?: Omit<ModalConfig[T], 'onClose'>
  ) => void;
  close: () => void;
}

interface ModalState<T extends ModalName = ModalName> {
  name: T | null;
  props?: Omit<ModalConfig[T], 'onClose'>;
}

// Constants
const ANIMATION_DURATION = 300;
const INITIAL_SCALE = 0.8;

const modalComponents: ModalComponents = {
  NewCategory,
  Postpone,
  CustomRuleForm
};

const ModalContext = createContext<ModalContextType | null>(null);

interface ModalProviderProps {
  children: ReactNode;
}

const ModalProvider: React.FC<ModalProviderProps> = ({ children }) => {
  const [modalState, setModalState] = useState<ModalState>({ name: null });
  const animationValue = useRef(new Animated.Value(0)).current;
  const isDark = colorScheme.get() === 'dark';

  const animations = useMemo(
    () => ({
      show: Animated.timing(animationValue, {
        toValue: 1,
        duration: ANIMATION_DURATION,
        useNativeDriver: true,
      }),
      hide: Animated.timing(animationValue, {
        toValue: 0,
        duration: ANIMATION_DURATION,
        useNativeDriver: true,
      }),
    }),
    [animationValue]
  );

  const animatedStyles = useMemo(
    () => ({
      scale: animationValue.interpolate({
        inputRange: [0, 1],
        outputRange: [INITIAL_SCALE, 1],
      }),
      opacity: animationValue,
    }),
    [animationValue]
  );

  const show = <T extends ModalName>(
    name: T,
    props?: Omit<ModalConfig[T], 'onClose'>
  ) => {
    setModalState({ name, props });
    animations.show.start();
  };

  const close = () => {
    animations.hide.start(() => {
      setModalState({ name: null });
    });
  };

  const contextValue = useMemo(
    () => ({ show, close }),
    [] // Empty dependency array since show and close don't depend on any props
  );

  const renderModal = () => {
    if (!modalState.name) return null;
    const ModalComponent = modalComponents[modalState.name];
    const modalProps = {
      ...modalState.props,
      onClose: close,
    } as ModalConfig[typeof modalState.name];

    return <ModalComponent/>
  };

  return (
    <ModalContext.Provider value={contextValue}>
      {children}
      {modalState.name && (
        <Modal
          visible={true}
          animationType="none"
          transparent={true}
          statusBarTranslucent
          onRequestClose={close}
        >
          <TouchableWithoutFeedback onPress={close}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback>
                <Animated.View
                  style={[
                    styles.modalContent,
                    isDark && styles.modalContentDark,
                    {
                      transform: [{ scale: animatedStyles.scale }],
                      opacity: animatedStyles.opacity,
                    },
                  ]}
                >
                  {renderModal()}
                </Animated.View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      )}
    </ModalContext.Provider>
  );
};

// Custom hook with proper return type
export const useModal = (): ModalContextType => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};

// Styles
const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalContentDark: {
    backgroundColor: '#1F2937',
  },
});

export default ModalProvider;