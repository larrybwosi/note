import React, { useCallback, memo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useObservable, useComputed, observer, Reactive, Memo } from '@legendapp/state/react';
import { batch } from '@legendapp/state';
import { useProfile } from 'src/store/profile/actions';
import { colorScheme } from 'nativewind';

type ThemeMode = 'system' | 'light' | 'dark';
type ColorScheme = {
  name: string;
  value: string;
  gradient: [string, string];
};

const ACCENT_COLORS: ColorScheme[] = [
  { name: 'Indigo', value: '#4F46E5', gradient: ['#4F46E5', '#7C3AED'] },
  { name: 'Rose', value: '#E11D48', gradient: ['#E11D48', '#BE123C'] },
  { name: 'Amber', value: '#D97706', gradient: ['#D97706', '#B45309'] },
  { name: 'Emerald', value: '#059669', gradient: ['#059669', '#047857'] },
  { name: 'Sky', value: '#0284C7', gradient: ['#0284C7', '#0369A1'] },
  { name: 'Purple', value: '#7C3AED', gradient: ['#7C3AED', '#6D28D9'] },
];

const THEME_MODES: ThemeMode[] = ['system', 'light', 'dark'];

// Memoized child components
const SettingsCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <View className="bg-white dark:bg-gray-800 rounded-2xl p-4 mb-4 shadow-sm mx-4">
    <Text className="text-lg font-rbold mb-2 text-gray-800 dark:text-gray-100">{title}</Text>
    {children}
  </View>
);

const InputField = ({ label, value, onChangeText, keyboardType = 'default' }: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  keyboardType?: 'default' | 'email-address' | 'numeric';
}) => (
  <Memo>
    {()=>(
      <View className="mb-4">
        <Text className="font-rmedium mb-1 text-gray-700 dark:text-gray-300">{label}</Text>
        <Reactive.TextInput
          $value={value}
          $onChangeText={onChangeText}
          $keyboardType={keyboardType}
          $className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg text-base text-gray-800 dark:text-gray-100 font-rregular"
        />
      </View>
    )}
  </Memo>
);

const TimeDisplay = ({ label, value, onPress }: {
  label: string;
  value: Date;
  onPress: () => void;
}) => (
  <Memo>
    {()=>(
      <TouchableOpacity
        onPress={onPress}
        className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg mb-4"
      >
        <Text className="text-gray-600 dark:text-gray-400 mb-1 font-rregular">{label}</Text>
        <Text className="text-base text-gray-800 dark:text-gray-100 font-rmedium">
          {value.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </TouchableOpacity>
    )}
  </Memo>
);

// Memoized Theme Mode Button
const ThemeModeButton = ({ mode, currentMode, selectedTheme, onPress }: {
  mode: ThemeMode;
  currentMode: ThemeMode;
  selectedTheme: ColorScheme;
  onPress: () => void;
}) => (
  <Memo>
    {()=>(
      <TouchableOpacity
        onPress={onPress}
        className={`p-3 rounded-lg my-2 flex-row justify-between items-center ${
          currentMode === mode 
            ? 'bg-gray-200 dark:bg-gray-600' 
            : 'bg-gray-100 dark:bg-gray-700'
        }`}
      >
        <Text className="text-gray-800 dark:text-gray-100 font-rmedium capitalize">
          {mode}
        </Text>
        {currentMode === mode && (
          <Ionicons name="checkmark-circle" size={20} color={selectedTheme.value} />
        )}
      </TouchableOpacity>
    )}
  </Memo>
);

// Memoized Color Button
const ColorButton = ({ color, selectedTheme, onPress }: {
  color: ColorScheme;
  selectedTheme: ColorScheme;
  onPress: () => void;
}) => (
  <Memo>
    {()=>(
      <TouchableOpacity
        onPress={onPress}
        className="w-12 h-12 rounded-full shadow-sm my-2"
        style={{
          backgroundColor: color.value,
          borderWidth: color.name === selectedTheme.name ? 2 : 0,
          borderColor: 'white'
        }}
      />
    )}
  </Memo>
);

// Profile Header Component
const ProfileHeader = observer(({ personalInfo, bio, selectedTheme }: {
  personalInfo: any;
  bio: string;
  selectedTheme: ColorScheme;
}) => (
  <LinearGradient
    colors={selectedTheme.gradient}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    className="pt-12 pb-16"
  >
    <View className="flex-row justify-between px-4 mb-8">
      <TouchableOpacity className="bg-white/20 p-2.5 rounded-xl">
        <Ionicons name="settings-outline" size={24} color="white" />
      </TouchableOpacity>
      <TouchableOpacity className="bg-white/20 p-2.5 rounded-xl">
        <Ionicons name="notifications-outline" size={24} color="white" />
      </TouchableOpacity>
    </View>

    <View className="items-center">
      <View className="h-24 w-24 rounded-full bg-white/30 mb-4 items-center justify-center border-4 border-white/30">
        <Ionicons name="person" size={48} color="white" />
      </View>
      <Text className="text-white/90 text-lg font-rregular mb-2">
        Good morning, {personalInfo.name.split(' ')[0]}! 👋
      </Text>
      <Text className="text-2xl font-rbold text-white mb-1">
        {personalInfo.name}
      </Text>
      <Text className="font-rregular text-white/80">{bio}</Text>
    </View>
  </LinearGradient>
));

const ProfileSettingsPage: React.FC = observer(() => {
  const settingsState = useObservable({
    personalInfo: {
      bio: 'Productivity Enthusiast',
    },
    theme: {
      mode: 'system' as ThemeMode,
      accent: ACCENT_COLORS[0]
    }
  });

  const { personalInfo, productivityMetrics, updatePersonalInfo } = useProfile();
  const schedule = productivityMetrics.schedule;
  const theme = settingsState.theme;

  const selectedTheme = useComputed(() => theme.accent.get());

  const switchTheme = useCallback((mode: ThemeMode) => {
    colorScheme.set(mode);
  }, []);

  const setAccentColor = useCallback((color: ColorScheme) => {
    theme.accent.set(color);
  }, []);

  const saveChanges = useCallback(() => {
    batch(() => {
      // Implement save logic here
      console.log('Saving changes...');
    });
  }, []);

  const handleBioChange = useCallback((text: string) => {
    settingsState.personalInfo.bio.set(text);
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-gray-100 dark:bg-gray-900">
      <ScrollView className="flex-1">
        <ProfileHeader 
          personalInfo={personalInfo} 
          bio={settingsState.personalInfo.bio.get()} 
          selectedTheme={selectedTheme.get()} 
        />

        <View className="mt-4">
          <SettingsCard title="Profile Information">
            <InputField
              label="Name"
              value={personalInfo.name}
              onChangeText={(text) => updatePersonalInfo('name', text)}
            />
            <InputField
              label="Bio"
              value={settingsState.personalInfo.bio.get()}
              onChangeText={handleBioChange}
            />
            <InputField
              label="Email"
              value={personalInfo.email}
              onChangeText={(text) => updatePersonalInfo('email', text)}
              keyboardType="email-address"
            />
          </SettingsCard>

          <SettingsCard title="Schedule">
            <TimeDisplay
              label="Work Start Time"
              value={schedule.workStartTime!}
              onPress={() => {}}
            />
            <TimeDisplay
              label="Work End Time"
              value={schedule.workEndTime!}
              onPress={() => {}}
            />
            <InputField
              label="Break Duration (minutes)"
              value={schedule.breakDuration?.toString()!}
              onChangeText={(text) => console.log(text)}
              keyboardType="numeric"
            />
          </SettingsCard>

          <SettingsCard title="Theme Settings">
            <Text className="font-rmedium mb-3 text-gray-700 dark:text-gray-300">Theme Mode</Text>
            <View className="space-y-2 mb-6">
              {THEME_MODES.map((mode) => (
                <ThemeModeButton
                  key={mode}
                  mode={mode}
                  currentMode={colorScheme.get()!}
                  selectedTheme={selectedTheme.get()}
                  onPress={() => switchTheme(mode)}
                />
              ))}
            </View>

            <Text className="font-rmedium mb-3 text-gray-700 dark:text-gray-300">Accent Color</Text>
            {/* <View className="flex-row flex-wrap gap-2 space-y-2">
              {ACCENT_COLORS.map((color) => (
                <ColorButton
                  key={color.name}
                  color={color}
                  selectedTheme={selectedTheme.get()}
                  onPress={() => setAccentColor(color)}
                />
              ))}
            </View> */}
          </SettingsCard>

          <TouchableOpacity
            onPress={saveChanges}
            className="mx-4 p-4 rounded-lg items-center mb-8"
            style={{ backgroundColor: selectedTheme.value.get() }}
          >
            <Text className="text-white text-base font-rmedium">
              Save Changes
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
});

export default ProfileSettingsPage;