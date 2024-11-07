import Feather from '@expo/vector-icons/Feather';
import Ionicons from '@expo/vector-icons/Ionicons';
import Octicons from '@expo/vector-icons/Octicons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { Tabs } from 'expo-router';

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
          height: 50,
        },
      })}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color, size }) => <Feather name="navigation" size={size} color={color} />,
          tabBarLabel: 'Schedule',
        }}
      />
      <Tabs.Screen
        name="finance"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="wallet-outline" size={size} color={color} />
          ),
          tabBarLabel: 'Finance',
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          tabBarIcon: ({ color, size }) => <Feather name="calendar" size={size} color={color} />,
          tabBarLabel: 'Calendar',
        }}
      />
      <Tabs.Screen
        name="note"
        options={{
          tabBarIcon: ({ color, size }) => <FontAwesome5 name="sticky-note" size={size} color={color} />,
          tabBarLabel: 'Notes',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ color, size }) => <Octicons name="person" size={size} color={color} />,
          tabBarLabel: 'Profile',
        }}
      />
    </Tabs>
  );
}
