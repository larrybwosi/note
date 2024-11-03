import Feather from '@expo/vector-icons/Feather';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs
      initialRouteName="index"
      screenOptions={({ route }) => ({
        tabBarHideOnKeyboard: true,
        headerShown: false,

        tabBarIcon: ({ color, size }) => {
          if (route.name === 'index') {
            return <Feather name="calendar" size={size} color={color} />
          } else if (route.name === 'expenses') {
            return <Feather name="dollar-sign" size={size} color={color} />
          } else if (route.name === 'income') {
            return <Ionicons name="cash" size={size} color={color} />
          } else if (route.name === 'setup') {
            return <Feather name="message-circle" size={size} color={color} />
          } else if (route.name === 'finance') {
            return <Feather name="airplay" size={size} color={color} />
          } 
        }, 
      })}
    >
      {/* <Tabs.Screen name="index" /> 
      <Tabs.Screen name="search" />
      <Tabs.Screen name="create-post" />
      <Tabs.Screen name="messages" />
      <Tabs.Screen name="profile" /> */}
    </Tabs> 
  );
}

