import { memo, useCallback, useMemo, useRef } from 'react';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withSequence, FadeIn, SlideInRight } from 'react-native-reanimated';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, TextInput, Alert, Platform, Modal } from 'react-native';
import { useObservable, observer, useComputed, Memo, For } from '@legendapp/state/react';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import { observable, batch } from '@legendapp/state';
import { Ionicons } from '@expo/vector-icons';
import { colorScheme } from 'nativewind';
import { format } from 'date-fns';

import { useProfile } from 'src/store/profile/actions';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

const ACCENT_COLORS = observable([
  { name: 'Indigo', value: '#4F46E5', gradient: ['#4F46E5', '#7C3AED'] },
  { name: 'Rose', value: '#E11D48', gradient: ['#E11D48', '#BE123C'] },
  { name: 'Amber', value: '#D97706', gradient: ['#D97706', '#B45309'] },
  { name: 'Emerald', value: '#059669', gradient: ['#059669', '#047857'] },
  { name: 'Sky', value: '#0284C7', gradient: ['#0284C7', '#0369A1'] },
  { name: 'Purple', value: '#7C3AED', gradient: ['#7C3AED', '#6D28D9'] },
]);

interface TimePickerProps {
  visible: boolean;
  value: Date;
  onClose: () => void;
  onChange: (date: Date) => void;
}

const TimePicker: React.FC<TimePickerProps> = observer(({ visible, value, onClose, onChange }) => {
  if (Platform.OS === 'ios') {
    return (
      <Modal visible={visible} transparent animationType="slide">
        <View className="flex-1 justify-end">
          <View className="bg-white p-4 rounded-t-3xl">
            <DateTimePicker
              value={value}
              mode="time"
              display="spinner"
              onChange={(_, date) => date && onChange(date)}
            />
            <TouchableOpacity
              onPress={onClose}
              className="items-center py-3 mt-2"
            >
              <Text className="text-indigo-600 text-base font-rmedium">Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  return visible ? (
    <DateTimePicker
      value={value}
      mode="time"
      display="default"
      onChange={(_, date) => {
        onClose();
        date && onChange(date);
      }}
    />
  ) : null;
});

const ColorPickerButton = memo(({ color, isSelected, onPress }: { color: string; isSelected: boolean; onPress: () => void }) => (
  <TouchableOpacity
    onPress={onPress}
    className={`w-12 h-12 rounded-full shadow-md ${isSelected ? 'border-2 border-white' : ''}`}
    style={{ backgroundColor: color }}
  />
));

const ThemeModal = observer(({ settingsState, isVisible, onClose }: { isVisible: boolean; onClose: () => void, settingsState: any }) => {
  const selectedMode = useComputed(() => colorScheme.get());
  const themeColor = useComputed(() => settingsState.theme.color.get());

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end">
        <View className="bg-white p-5 rounded-t-3xl">
          <Text className="text-lg font-rbold mb-4">Choose Theme</Text>
          <For each={observable(['system', 'light', 'dark'])}>
            {(mode) => (
              <TouchableOpacity
                key={mode.get()}
                onPress={() => {
                  colorScheme.set(mode.get() as "dark" | "light" | "system");
                  console.log(mode.get())
                  settingsState.set(mode.get())
                  onClose();
                }}
                className={`p-4 rounded-lg mb-2.5 ${colorScheme.get() === mode.get() ? 'bg-indigo-600' : 'bg-gray-100'}`}
              >
                <Text className={`text-lg font-rmedium ${selectedMode.get() === mode.get() ? 'text-white' : 'text-black'}`}>
                  {mode.get().charAt(0).toUpperCase() + mode.get().slice(1)}
                </Text>
              </TouchableOpacity>
            )}
          </For>
          <TouchableOpacity
            onPress={onClose}
            className="mt-2.5 p-4 rounded-lg items-center"
          >
            <Text className="text-base font-rsemibold" style={{ color: themeColor.get() }}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
});

const SettingsSection: React.FC<{ title: string; children: React.ReactNode }> = memo(({ title, children }) => (
  <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
    <Text className="text-lg font-rbold mb-2">{title}</Text>
    {children}
  </View>
));

const ColorPicker = observer(({ settingsState, isVisible, onClose }: { settingsState: any; isVisible: boolean; onClose: () => void }) => {
  const selectedColor = useComputed(() => settingsState.theme.color.get());

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end">
        <View className="bg-white p-5 rounded-t-3xl">
          <Text className="text-xl font-rbold mb-5">Choose Accent Color</Text>
          <View className="flex-row flex-wrap gap-2.5">
            <For each={ACCENT_COLORS}>
              {(color) => (
                <ColorPickerButton
                  key={color.value.get()}
                  color={color.value.get()}
                  isSelected={selectedColor.get() === color.value}
                  onPress={() => {
                    batch(() => {
                      settingsState.theme.color.set(color.value);
                      settingsState.theme.gradient.set(color.gradient);
                    });
                    onClose();
                  }}
                />
              )}
            </For>
          </View>
          <TouchableOpacity
            onPress={onClose}
            className="mt-5 p-4 items-center"
          >
            <Text className="text-base font-rsemibold" style={{ color: selectedColor.get() }}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
});

const ProfileSettingsPage: React.FC = observer(() => {
  const avatarScale = useSharedValue(1);
  const isColorPickerVisible = useObservable(false);
  const isThemeModalVisible = useObservable(false);
  const showTimePicker = useObservable({ show: false, type: null as 'end' | 'start' | null });
  const { personalInfo, updatePersonalInfo, updateSchedule } = useProfile();

  const renderCount = ++useRef(0).current
  console.log('renderCount', renderCount)
  const settingsState = useObservable({
    focusMode: false,
    notifications: {
      enabled: true,
      quiet: false,
      schedule: true,
    },
    schedule: {
      workStartTime: new Date('2024-01-01T08:00:00'),
      workEndTime: new Date('2024-01-01T17:00:00'),
      breakDuration: 30,
    },
    wellness: {
      waterGoal: 2,
      activeHoursGoal: 8,
      sleepGoal: 8,
    },
    theme: {
      color: ACCENT_COLORS[0].value,
      gradient: ACCENT_COLORS[0].gradient,
    },
    profile: {
      name: personalInfo.name || 'Sarah Johnson',
      bio: 'Productivity Enthusiast',
      email: personalInfo.email || 'sarah.j@example.com'
    }
  });

  const avatarStyle = useAnimatedStyle(() => ({
    transform: [{ scale: avatarScale.value }],
  }));

  const pulseAvatar = useCallback(() => {
    avatarScale.value = withSequence(
      withSpring(1.1, { damping: 4 }),
      withSpring(1, { damping: 4 })
    );
  }, []);

  const saveChanges = useCallback(async () => {
    try {
      console.log(settingsState.get());
      
      updatePersonalInfo('name', settingsState.profile.name.get());
      updatePersonalInfo('email', settingsState.profile.email.get());
      updateSchedule('workStartTime', format(settingsState.schedule.workStartTime.get(), 'HH:mm'));
      updateSchedule('workEndTime', format(settingsState.schedule.workEndTime.get(), 'HH:mm'));
      updateSchedule('breakDuration', settingsState.schedule.breakDuration.get());

      await new Promise(resolve => setTimeout(resolve, 1000));
      Alert.alert('Success', 'Settings saved successfully!');
    } catch (error) {
      console.log(error)
      Alert.alert('Error', 'Failed to save settings. Please try again.');
    }
  }, []);

  const gradientColors = useComputed(() => settingsState.theme.gradient.get());
  const themeColor = useComputed(() => colorScheme.get());

  const GreetingMessage = observer(() => {
    const name = useComputed(() => personalInfo.name?.split(' ')[0]);
    const greeting = useObservable(() => {
      const hour = new Date().getHours();
      if (hour < 12) return 'Good morning';
      if (hour < 17) return 'Good afternoon';
      return 'Good evening';
    });
    
    return (
      <Animated.Text 
        entering={SlideInRight.duration(800)} 
        className="text-white/90 text-lg font-rregular mb-2"
      >
        {greeting.get()}, {name.get()}! 👋
      </Animated.Text>
    );
  });

  const renderProfileInfo = useMemo(() => (
    <SettingsSection title="Profile Information">
      <View className="space-y-4">
        <For each={observable(['name', 'bio', 'email'])}>
          {(field) => (
            <Memo>
              {() => (
                <View key={field.get()}>
                  <Text className="font-rmedium mb-1 text-gray-700 capitalize">{field.get()}</Text>
                  <TextInput
                    value={settingsState.profile[field.get() as 'name' | 'bio' | 'email'].get()}
                    onChangeText={(v) => settingsState.profile[field.get() as 'name' | 'bio' | 'email'].set(v)}
                    keyboardType={field.get() === 'email' ? 'email-address' : 'default'}
                    className="bg-gray-100 p-3 rounded-lg text-base text-gray-800 font-rregular"
                  />
                </View>
              )}
            </Memo>
          )}
        </For>
      </View>
    </SettingsSection>
  ), []);

  const renderSchedule = useMemo(() => (
    <SettingsSection title="Schedule">
      <View className="space-y-4">
        <For each={observable(['start', 'end'])}>
          {(type) => (
            <Memo>
              {() => (
                <TouchableOpacity
                  key={type.get()}
                  onPress={() => showTimePicker.set({ show: true, type: type.get() as 'start' | 'end' })}
                  className="bg-gray-100 p-3 rounded-lg mb-2.5"
                >
                  <Text className="text-gray-600 mb-1 font-rregular">Work {type.get().charAt(0).toUpperCase() + type.get().slice(1)} Time</Text>
                  <Text className="text-base text-gray-800 font-rmedium">
                    {settingsState.schedule[`work${type.get().charAt(0).toUpperCase() + type.get().slice(1)}Time` as 'workStartTime' | 'workEndTime']
                      .get()
                      .toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </TouchableOpacity>
              )}
            </Memo>
          )}
        </For>
        <View>
          <Text className="text-gray-600 mb-1 font-rregular">Break Duration (minutes)</Text>
          <TextInput
            value={settingsState.schedule.breakDuration.get().toString()}
            onChangeText={(text) => settingsState.schedule.breakDuration.set(parseInt(text) || 0)}
            keyboardType="numeric"
            className="bg-gray-100 p-3 rounded-lg text-base text-gray-800 font-rmedium"
          />
        </View>
      </View>
    </SettingsSection>
  ), []);

  const renderTheme = useMemo(() => (
    <SettingsSection title="Theme">
      <View className="space-y-4">
        <TouchableOpacity
          onPress={() => isThemeModalVisible.set(true)}
          className="flex-row items-center justify-between bg-gray-100 p-3 rounded-lg mb-2.5"
        >
          <Text className="text-base text-gray-800 font-rmedium">Theme Mode</Text>
          <Text className="text-base text-gray-600 capitalize font-rregular">{colorScheme.get()}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => isColorPickerVisible.set(true)}
          className="flex-row items-center justify-between bg-gray-100 p-3 rounded-lg"
        >
          <Text className="text-base text-gray-800 font-rmedium">Accent Color</Text>
          <View className="w-8 h-8 rounded-full" style={{ backgroundColor: themeColor.get() }} />
        </TouchableOpacity>
      </View>
    </SettingsSection>
  ), []);

  return (
    <SafeAreaView className="flex-1 bg-gray-100 mb-10">
      <ScrollView>
        <LinearGradient
          colors={gradientColors.get()}
          className="p-2 pt-10"
        >
          <View className="flex-row justify-between mb-8">
            <TouchableOpacity className="bg-white/20 p-2.5 rounded-xl">
              <Ionicons name="settings-outline" size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity className="bg-white/20 p-2.5 rounded-xl">
              <Ionicons name="notifications-outline" size={24} color="white" />
            </TouchableOpacity>
          </View>

          <View className="items-center">
            <AnimatedTouchableOpacity
              className="h-24 w-24 rounded-full bg-white/30 mb-4 items-center justify-center border-4 border-white/30"
              style={avatarStyle}
              onPress={pulseAvatar}
            >
              <Ionicons name="person" size={48} color="white" />
            </AnimatedTouchableOpacity>
            <GreetingMessage />
            <Animated.Text 
              entering={FadeIn.duration(800)} 
              className="text-2xl font-rbold text-white mb-1"
            >
              {personalInfo.name}
            </Animated.Text>
            <Text className="font-rregular text-white/80">Productivity Enthusiast</Text>
          </View>
        </LinearGradient>

        <View className="p-4 mt-5">
          {renderProfileInfo}
          {renderSchedule}
          {renderTheme}

          <TouchableOpacity
            onPress={saveChanges}
            className="p-4 rounded-lg items-center mt-2.5 mb-5"
            style={{ backgroundColor: themeColor.get() }}
          >
            <Text className="text-white text-base font-rmedium">Save Changes</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <ColorPicker 
        settingsState={settingsState}
        isVisible={isColorPickerVisible.get()} 
        onClose={() => isColorPickerVisible.set(false)} 
      />

      <ThemeModal 
        settingsState={settingsState}
        isVisible={isThemeModalVisible.get()}
        onClose={() => isThemeModalVisible.set(false)}
      />

      <TimePicker
        visible={showTimePicker.get().show}
        value={
          showTimePicker.get().type === 'start' 
            ? settingsState.schedule.workStartTime.get() 
            : settingsState.schedule.workEndTime.get()
        }
        onClose={() => showTimePicker.set({ show: false, type: null })}
        onChange={(date) => {
          if (showTimePicker.get().type === 'start') {
            settingsState.schedule.workStartTime.set(date);
          } else {
            settingsState.schedule.workEndTime.set(date);
          }
          showTimePicker.set({ show: false, type: null });
        }}
      />
    </SafeAreaView>
  );
});

ColorPickerButton.displayName = 'ColorPickerButton';
SettingsSection.displayName = 'SettingsSection';
export default ProfileSettingsPage;