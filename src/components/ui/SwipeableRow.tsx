import React, { useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, I18nManager } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { MaterialIcons } from '@expo/vector-icons';

interface Action {
	text: string;
	color: string;
	icon: string;
	onPress: () => void;
}

interface SwipeableRowProps {
	children: React.ReactNode;
	rightActions?: Action[];
	leftActions?: Action[];
}

export const SwipeableRow: React.FC<SwipeableRowProps> = ({
	children,
	rightActions = [],
	leftActions = [],
}) => {
	const swipeableRef = useRef<Swipeable>(null);

	const renderRightAction = (
		action: Action,
		index: number,
		progress: Animated.AnimatedInterpolation<number>
	) => {
		const trans = progress.interpolate({
			inputRange: [0, 1],
			outputRange: [80 * (index + 1), 0],
		});

		const pressHandler = () => {
			swipeableRef.current?.close();
			action.onPress();
		};

		return (
			<Animated.View key={action.text} style={{ transform: [{ translateX: trans }], width: 80 }}>
				<TouchableOpacity
					style={[styles.rightAction, { backgroundColor: action.color }]}
					onPress={pressHandler}
				>
					<MaterialIcons name={action.icon as any} size={22} color="white" />
					<Text style={styles.actionText}>{action.text}</Text>
				</TouchableOpacity>
			</Animated.View>
		);
	};

	const renderLeftAction = (
		action: Action,
		index: number,
		progress: Animated.AnimatedInterpolation<number>
	) => {
		const trans = progress.interpolate({
			inputRange: [0, 1],
			outputRange: [-80 * (index + 1), 0],
		});

		const pressHandler = () => {
			swipeableRef.current?.close();
			action.onPress();
		};

		return (
			<Animated.View key={action.text} style={{ transform: [{ translateX: trans }], width: 80 }}>
				<TouchableOpacity
					style={[styles.leftAction, { backgroundColor: action.color }]}
					onPress={pressHandler}
				>
					<MaterialIcons name={action.icon as any} size={22} color="white" />
					<Text style={styles.actionText}>{action.text}</Text>
				</TouchableOpacity>
			</Animated.View>
		);
	};

	const renderRightActions = (progress: Animated.AnimatedInterpolation<number>) => {
		return (
			<View style={styles.actionsContainer}>
				{rightActions.map((action, i) => renderRightAction(action, i, progress))}
			</View>
		);
	};

	const renderLeftActions = (progress: Animated.AnimatedInterpolation<number>) => {
		return (
			<View style={styles.actionsContainer}>
				{leftActions.map((action, i) => renderLeftAction(action, i, progress))}
			</View>
		);
	};

	return (
		<Swipeable
			ref={swipeableRef}
			friction={2}
			leftThreshold={30}
			rightThreshold={30}
			renderRightActions={rightActions.length > 0 ? renderRightActions : undefined}
			renderLeftActions={leftActions.length > 0 ? renderLeftActions : undefined}
		>
			{children}
		</Swipeable>
	);
};

const styles = StyleSheet.create({
	actionsContainer: {
		flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
	},
	rightAction: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		height: '100%',
	},
	leftAction: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		height: '100%',
	},
	actionText: {
		fontSize: 12,
		color: 'white',
		backgroundColor: 'transparent',
		marginTop: 4,
	},
});
