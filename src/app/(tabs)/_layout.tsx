import { Tabs } from 'expo-router';
import {Activity, Wallet2, Calendar, StickyNote, User, CalendarDays, Wallet} from 'lucide-react-native';

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
      backBehavior='history'
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color, size }) => <Activity size={size} color={color} />,
          tabBarLabel: 'Schedule',
        }}
      />
      <Tabs.Screen
        name="finance"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Wallet size={size} color={color} />
          ),
          tabBarLabel: 'Finance',
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          tabBarIcon: ({ color, size }) => <CalendarDays size={size} color={color} />,
          tabBarLabel: 'Calendar',
        }}
      />
      <Tabs.Screen
        name="note"
        options={{
          tabBarIcon: ({ color, size }) => <StickyNote size={size} color={color} />,
          tabBarLabel: 'Notes',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
          tabBarLabel: 'Profile',
        }}
      />
    </Tabs>
  );
}
