import { observable } from '@legendapp/state';
import { observer, useObservable } from '@legendapp/state/react';
import React, { ReactNode, ComponentType, useCallback, useMemo, useEffect, useState } from 'react';
import { View, StyleSheet, TouchableWithoutFeedback, Animated } from 'react-native';
import Postpone from './postpone';
import NewCategory from './new.category';
import NewIncomeForm from '../income.form';

// Base modal props that all modals will extend
interface BaseModalProps {
  isVisible: boolean;
  onClose: () => void;
}

// Modal-specific props interfaces
interface PostponeModalProps extends BaseModalProps {
  itemId: string;
  date: Date;
}

interface NewCategoryModalProps extends BaseModalProps {
  type: 'INCOME' | 'EXPENSE';
}

// Registry of all modal configurations
type ModalRegistry = {
  postpone: { component: ComponentType<PostponeModalProps>; props: Omit<PostponeModalProps, keyof BaseModalProps> };
  newCategory: { component: ComponentType<NewCategoryModalProps>; props: Omit<NewCategoryModalProps, keyof BaseModalProps> };
  newTransaction: { component: ComponentType ; props: {} };
};

// Type helpers
type ModalName = keyof ModalRegistry;
type ModalProps<T extends ModalName> = ModalRegistry[T]['props'];
type ModalComponent<T extends ModalName> = ComponentType<ModalRegistry[T]['props'] & BaseModalProps>;

// Modal state management
interface ModalState {
  activeModal: ModalName | null;
  props: ModalProps<ModalName> | null;
}

const modalState = observable<ModalState>({ activeModal: null, props: null });

// Modal actions
export const showModal = <T extends ModalName>(modalName: T, props: ModalProps<T>) => {
  modalState.set({ activeModal: modalName, props: props as ModalProps<ModalName> });
};

export const hideModal = () => {
  modalState.set({ activeModal: null, props: null });
};

// Custom Modal component
const CustomModal: React.FC<{ isVisible: boolean; onClose: () => void; children: ReactNode }> = ({
  isVisible,
  onClose,
  children,
}) => {
  const fadeAnim = useMemo(() => new Animated.Value(0), []);
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: isVisible ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <TouchableWithoutFeedback onPress={onClose}>
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
          <View style={styles.modalContainer}>{children}</View>
        </TouchableWithoutFeedback>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

// Modal wrapper HOC with proper typing
const withModalWrapper = <P extends BaseModalProps>(WrappedComponent: ComponentType<P>) => {
  const ModalWrapper: React.FC<Omit<P, keyof BaseModalProps>> = (props) => {
    const state = useObservable(modalState);
    const isVisible = useMemo(() => state.get().activeModal !== null, [state]);

    return (
      <CustomModal isVisible={isVisible} onClose={hideModal}>
        <WrappedComponent {...(props as P)} isVisible={isVisible} onClose={hideModal} />
      </CustomModal>
    );
  };

  ModalWrapper.displayName = `WithModalWrapper(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;
  return React.memo(ModalWrapper);
};

// Enhanced modal components
const EnhancedPostpone = withModalWrapper(Postpone);
const EnhancedNewCategory = withModalWrapper(NewCategory);

// Modal registry with components
const MODAL_COMPONENTS: { [K in ModalName]: ModalComponent<K> } = {
  postpone: EnhancedPostpone,
  newCategory: EnhancedNewCategory,
  newTransaction: NewIncomeForm,
};

// Modal Provider Component
const ModalProvider: React.FC<{ children: ReactNode }> = observer(({ children }) => {
  const state = useObservable(modalState);

  const renderActiveModal = useCallback(() => {
    const { activeModal, props } = state.get();
    if (!activeModal || !props) return null;

    const ModalComponent = MODAL_COMPONENTS[activeModal] as ModalComponent<typeof activeModal>;
    return <ModalComponent {...(props as ModalProps<typeof activeModal>)} isVisible={true} onClose={hideModal} />;
  }, [state]);

  return (
    <>
      {children}
      <CustomPortal>{renderActiveModal()}</CustomPortal>
    </>
  );
});

// Portal Component
const CustomPortal: React.FC<{ children: ReactNode }> = ({ children }) => (
  <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
    {children}
  </View>
);

// Updated useModal hook with dynamic return types
export function useModal<T extends ModalName>(modalName: T) {
  const state = useObservable(modalState);

  return {
    show: useCallback((props: ModalProps<T>) => showModal(modalName, props), [modalName]),
    hide: hideModal,
    isVisible: state.get().activeModal === modalName,
    props: (state.get().props || {}) as ModalProps<T>,
  };
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    maxWidth: 400,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});

export default ModalProvider;
