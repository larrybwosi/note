import { Tabs } from 'expo-router';
import { Activity, User, Home, ShoppingCart, Shapes } from 'lucide-react-native';

export default function TabLayout() {
  return (
		<Tabs
			initialRouteName="index"
			screenOptions={({ route }) => ({
				tabBarHideOnKeyboard: true,
				headerShown: false,
				tabBarStyle: {
					backgroundColor: '#1f1f1f',
					position: 'absolute',
					bottom: 0,
					left: 0,
					right: 0,
					elevation: 0,
					borderTopWidth: 0,
					height: 40,
				},
			})}
			backBehavior="history"
		>
			<Tabs.Screen
				name="index"
				options={{
					tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
					tabBarLabel: 'Home',
				}}
			/>
			<Tabs.Screen
				name="shopping" 
				options={{
					tabBarIcon: ({ color, size }) => <ShoppingCart size={size} color={color} />,
					tabBarLabel: 'Shopping',
				}}
			/>
			<Tabs.Screen
				name="spending"
				options={{
					tabBarIcon: ({ color, size }) => <Shapes size={size} color={color} />,
					tabBarLabel: 'Spending',
				}}
			/>
			<Tabs.Screen
				name="profile"
				options={{
					tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
					tabBarLabel: 'Settings',
				}}
			/>
		</Tabs>
	);
}
