import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Animated, {
  FadeInDown,
  FadeIn,
  withSpring,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import {
  Settings,
  Bell,
  Moon,
  Sun,
  Palette,
  Lock,
  DollarSign,
  Fingerprint,
  Globe,
  ChevronRight,
  Shield,
  Clock,
  Smartphone,
  Eye,
  Vibrate,
} from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { router } from 'expo-router';

// Types
interface ThemeOption {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
  };
}

interface NotificationSetting {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
}

// Custom Components
const SettingSection: React.FC<{
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}> = ({ title, icon, children }) => (
  <Animated.View entering={FadeInDown.duration(400)} className="mb-8">
    <View className="flex-row items-center mb-4">
      {icon}
      <Text className="text-xl font-amedium  dark:text-gray-50  text-gray-800 ml-2">{title}</Text>
    </View>
    {children}
  </Animated.View>
);

const SettingCard: React.FC<{
  title: string;
  description: string;
  icon: React.ReactNode;
  onPress: () => void;
}> = ({ title, description, icon, onPress }) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={() => (scale.value = withSpring(0.98))}
        onPressOut={() => (scale.value = withSpring(1))}
        className="bg-white  dark:bg-gray-900 p-4 rounded-xl mb-3 flex-row items-center border  dark:border-gray-500 border-gray-100"
      >
        <View className="bg-blue-50 dark:bg-gray-900 p-3 rounded-xl">{icon}</View>
        <View className="flex-1 ml-3">
          <Text className="text-gray-800 dark:text-gray-100 font-amedium">{title}</Text>
          <Text className="text-gray-600 mt-1 font-aregular text-sm">
            {description}
          </Text>
        </View>
        <ChevronRight size={20} color="#6b7280" />
      </TouchableOpacity>
    </Animated.View>
  );
};

const ColorThemeButton: React.FC<{
  theme: ThemeOption;
  selected: boolean;
  onSelect: () => void;
}> = ({ theme, selected, onSelect }) => (
  <TouchableOpacity
    onPress={onSelect}
    className={`p-3 rounded-xl mr-3 border-2 ${
      selected ? 'border-blue-500' : 'border-transparent'
    }`}
    style={{ backgroundColor: theme.colors.primary }}
  >
    <Text className="text-white font-medium">{theme.name}</Text>
  </TouchableOpacity>
);

const SettingsScreen: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(true);
  const [selectedTheme, setSelectedTheme] = useState('default');
  const [notifications, setNotifications] = useState<NotificationSetting[]>([
    {
      id: '1',
      title: 'Transaction Alerts',
      description: 'Get notified about new transactions',
      enabled: true,
    },
    {
      id: '2',
      title: 'Budget Updates',
      description: 'Receive updates about your budget status',
      enabled: true,
    },
    {
      id: '3',
      title: 'Investment Alerts',
      description: 'Stay informed about investment opportunities',
      enabled: false,
    },
  ]);
  const colorScheme = useColorScheme()

  const themes: ThemeOption[] = [
    {
      id: 'default',
      name: 'Ocean',
      colors: { primary: '#3b82f6', secondary: '#93c5fd', background: '#eff6ff' },
    },
    {
      id: 'emerald',
      name: 'Forest',
      colors: { primary: '#059669', secondary: '#6ee7b7', background: '#ecfdf5' },
    },
    {
      id: 'purple',
      name: 'Twilight',
      colors: { primary: '#7c3aed', secondary: '#c4b5fd', background: '#f5f3ff' },
    },
  ];

  return (
    <ScrollView className="flex-1 bg-gray-50  dark:bg-gray-900">
      <View className="p-3">
        {/* Header */}
        <Animated.View entering={FadeIn.delay(200)} className="mb-8">
          <Text className="text-3xl font-rbold text-gray-800 dark:text-gray-100">Settings</Text>
          <Text className="text-gray-600 font-aregular text-lg mt-2">
            Customize your app experience
          </Text>
        </Animated.View>

        {/* Appearance */}
        <SettingSection title="Appearance" icon={<Palette size={24} color="#3b82f6" />}>
          <View className="bg-white dark:bg-black-200 p-4 rounded-xl mb-4">
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-row items-center">
                {darkMode ? <Moon size={20} color="#6b7280" /> : <Sun size={20} color="#6b7280" />}
                <Text className="text-gray-800 dark:text-gray-50 font-amedium ml-2">Dark Mode</Text>
              </View>
              <Switch
                value={darkMode}
                onValueChange={() => colorScheme.toggleColorScheme()}
                trackColor={{ false: '#cbd5e1', true: '#93c5fd' }}
                thumbColor={darkMode ? '#3b82f6' : '#f4f4f5'}
              />
            </View>
            <Text className="text-gray-600 font-aregular text-sm mb-4">Color Theme</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {themes.map((theme) => (
                <ColorThemeButton
                  key={theme.id}
                  theme={theme}
                  selected={selectedTheme === theme.id}
                  onSelect={() => setSelectedTheme(theme.id)}
                />
              ))}
            </ScrollView>
          </View>
        </SettingSection>

        {/* Notifications */}
        <SettingSection title="Notifications" icon={<Bell size={24} color="#3b82f6" />}>
          {notifications.map((notification) => (
            <View
              key={notification.id}
              className="bg-white dark:bg-gray-900 p-4 rounded-xl mb-3 border border-gray-100  dark:border-gray-500 "
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-gray-800  dark:text-gray-200  font-amedium">
                    {notification.title}
                  </Text>
                  <Text className="text-gray-600  dark:text-gray-10  text-xs font-aregular mt-1">
                    {notification.description}
                  </Text>
                </View>
                <Switch
                  value={notification.enabled}
                  onValueChange={(value) => {
                    setNotifications(
                      notifications.map((n) =>
                        n.id === notification.id ? { ...n, enabled: value } : n
                      )
                    );
                  }}
                  trackColor={{ false: '#cbd5e1', true: '#93c5fd' }}
                  thumbColor={notification.enabled ? '#3b82f6' : '#f4f4f5'}
                />
              </View>
            </View>
          ))}
        </SettingSection>

        <TouchableOpacity onPress={()=>router.navigate('/auth')}>
          <Text>Auth</Text>
        </TouchableOpacity>

        {/* Security */}
        <SettingSection title="Security" icon={<Lock size={24} color="#3b82f6" />}>
          <SettingCard
            title="Biometric Authentication"
            description="Use Face ID or Touch ID to secure your app"
            icon={<Fingerprint size={24} color="#3b82f6" />}
            onPress={() => setBiometricEnabled(!biometricEnabled)}
          />
          <SettingCard
            title="Password & PIN"
            description="Change your security credentials"
            icon={<Shield size={24} color="#3b82f6" />}
            onPress={() => Alert.alert('Change Password', 'Coming soon!')}
          />
        </SettingSection>

        {/* Preferences */}
        <SettingSection title="Preferences" icon={<Settings size={24} color="#3b82f6" />}>
          <SettingCard
            title="Language"
            description="Choose your preferred language"
            icon={<Globe size={24} color="#3b82f6" />}
            onPress={() => Alert.alert('Language Settings', 'Coming soon!')}
          />
          <SettingCard
            title="Currency"
            description="Set your default currency"
            icon={<DollarSign size={24} color="#3b82f6" />}
            onPress={() => Alert.alert('Currency Settings', 'Coming soon!')}
          />
          <SettingCard
            title="Time Zone"
            description="Configure your local time zone"
            icon={<Clock size={24} color="#3b82f6" />}
            onPress={() => Alert.alert('Time Zone Settings', 'Coming soon!')}
          />
        </SettingSection>

        {/* App Settings */}
        <SettingSection title="App Settings" icon={<Smartphone size={24} color="#3b82f6" />}>
          <SettingCard
            title="App Permissions"
            description="Manage app access and permissions"
            icon={<Eye size={24} color="#3b82f6" />}
            onPress={() => Alert.alert('App Permissions', 'Coming soon!')}
          />
          <SettingCard
            title="Haptic Feedback"
            description="Configure vibration and haptics"
            icon={<Vibrate size={24} color="#3b82f6" />}
            onPress={() => Alert.alert('Haptic Settings', 'Coming soon!')}
          />
        </SettingSection>
      </View>
    </ScrollView>
  );
};

export default SettingsScreen;
