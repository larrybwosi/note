import React, { useState, useCallback, createContext, useContext } from 'react';
import FeedbackModal, { FeedbackType } from '../delete-success-modal';

interface FeedbackModalOptions {
	title: string;
	message: string;
	type: FeedbackType;
	primaryButtonText?: string;
	secondaryButtonText?: string;
	onPrimaryAction?: () => void;
	onSecondaryAction?: () => void;
	hideCloseButton?: boolean;
	autoClose?: boolean;
	autoCloseTime?: number;
}

interface FeedbackModalContextType {
	showModal: (options: FeedbackModalOptions) => void;
	hideModal: () => void;
}

const FeedbackModalContext = createContext<FeedbackModalContextType | null>(null);
export const FeedbackModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [visible, setVisible] = useState(false);
	const [options, setOptions] = useState<FeedbackModalOptions>({
		title: '',
		message: '',
		type: 'info',
		primaryButtonText: 'OK',
	});

	const showModal = useCallback((newOptions: FeedbackModalOptions) => {
		setOptions(newOptions);
		setVisible(true);
	}, []);

	const hideModal = useCallback(() => {
		setVisible(false);
	}, []);

	const handlePrimaryAction = useCallback(() => {
		if (options.onPrimaryAction) {
			options.onPrimaryAction();
		}
		hideModal();
	}, [options, hideModal]);

	const handleSecondaryAction = useCallback(() => {
		if (options.onSecondaryAction) {
			options.onSecondaryAction();
		}
		hideModal();
	}, [options, hideModal]);

	const modal = (
		<FeedbackModal
			visible={visible}
			type={options.type}
			title={options.title}
			message={options.message}
			primaryButtonText={options.primaryButtonText}
			secondaryButtonText={options.secondaryButtonText}
			onPrimaryAction={handlePrimaryAction}
			onSecondaryAction={handleSecondaryAction}
			onClose={hideModal}
			hideCloseButton={options.hideCloseButton}
			autoClose={options.autoClose}
			autoCloseTime={options.autoCloseTime}
		/>
	);

	return (
		<FeedbackModalContext.Provider value={{ showModal, hideModal }}>
			{children}
			{modal}
		</FeedbackModalContext.Provider>
	);
};

export const useFeedbackModal = () => {
	const context = useContext(FeedbackModalContext);
	if (!context) {
		throw new Error('useFeedbackModal must be used within a FeedbackModalProvider');
	}
	return context;
};


  // const handleDelete = () => {
	// 	showModal({
	// 		type: 'confirmation',
	// 		title: 'Delete Transaction',
	// 		message: 'Are you sure you want to delete this transaction? This action cannot be undone.',
	// 		primaryButtonText: 'Cancel',
	// 		secondaryButtonText: 'Delete',
	// 		onSecondaryAction: () => {
	// 			// Perform delete operation
	// 			console.log('Item deleted');

	// 			// Show success message after deletion
	// 			setTimeout(() => {
	// 				showModal({
	// 					type: 'success',
	// 					title: 'Successfully Deleted',
	// 					message: 'The transaction has been removed from your records.',
	// 					autoClose: true,
	// 				});
	// 			}, 500);
	// 		},
	// 	});
	// };

	// const showSuccessModal = () => {
	// 	showModal({
	// 		type: 'success',
	// 		title: 'Payment Successful',
	// 		message: 'Your payment has been processed successfully.',
	// 		primaryButtonText: 'Great!',
	// 		autoClose: true,
	// 	});
	// };

	// const showErrorModal = () => {
	// 	showModal({
	// 		type: 'error',
	// 		title: 'Connection Error',
	// 		message:
	// 			'Unable to connect to the server. Please check your internet connection and try again.',
	// 		primaryButtonText: 'Try Again',
	// 		onPrimaryAction: () => {
	// 			// Attempt reconnection
	// 			console.log('Trying again...');
	// 		},
	// 	});
	// };

	// const showWarningModal = () => {
	// 	showModal({
	// 		type: 'warning',
	// 		title: 'Low Balance',
	// 		message: 'Your account balance is below $50. Would you like to add funds?',
	// 		primaryButtonText: 'Add Funds',
	// 		secondaryButtonText: 'Not Now',
	// 		onPrimaryAction: () => {
	// 			// Navigate to add funds screen
	// 			console.log('Navigating to add funds...');
	// 		},
	// 	});
	// };

	// const showInfoModal = () => {
	// 	showModal({
	// 		type: 'info',
	// 		title: 'New Feature',
	// 		message: "We've added budget categories! Now you can organize your transactions better.",
	// 		primaryButtonText: 'Learn More',
	// 		onPrimaryAction: () => {
	// 			// Navigate to feature tutorial
	// 			console.log('Showing tutorial...');
	// 		},
	// 	});
	// };
