import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Switch } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import Slider from '@react-native-community/slider';
import { X } from 'lucide-react-native';

interface SettingsModalProps {
  section: string;
  settings: any;
  onSave: (newSettings: any) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  section,
  settings,
  onSave,
  onClose,
}) => {
  const [tempSettings, setTempSettings] = useState(settings);

  const handleSave = () => {
    onSave(tempSettings);
    onClose();
  };

  const renderSection = () => {
    switch (section) {
      case 'focus':
        return (
          <View className="space-y-6">
            <View className="flex-row justify-between items-center">
              <Text className="text-lg font-['Poppins-Medium'] text-gray-800">Enable Focus Mode</Text>
              <Switch
                value={tempSettings.focusMode}
                onValueChange={(value) =>
                  setTempSettings({ ...tempSettings, focusMode: value })
                }
              />
            </View>
            <View>
              <Text className="text-lg font-['Poppins-Medium'] text-gray-800 mb-2">Focus Duration</Text>
              <Slider
                minimumValue={15}
                maximumValue={120}
                step={15}
                value={tempSettings.focusDuration || 60}
                onValueChange={(value) =>
                  setTempSettings({ ...tempSettings, focusDuration: value })
                }
                minimumTrackTintColor="#4F46E5"
                maximumTrackTintColor="#E5E7EB"
              />
              <Text className="text-center text-gray-600 mt-2">
                {tempSettings.focusDuration || 60} minutes
              </Text>
            </View>
          </View>
        );

      case 'notifications':
        return (
          <View className="space-y-6">
            <View className="flex-row justify-between items-center">
              <Text className="text-lg font-['Poppins-Medium'] text-gray-800">Enable Notifications</Text>
              <Switch
                value={tempSettings.notifications.enabled}
                onValueChange={(value) =>
                  setTempSettings({
                    ...tempSettings,
                    notifications: { ...tempSettings.notifications, enabled: value },
                  })
                }
              />
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-lg font-['Poppins-Medium'] text-gray-800">Quiet Hours</Text>
              <Switch
                value={tempSettings.notifications.quiet}
                onValueChange={(value) =>
                  setTempSettings({
                    ...tempSettings,
                    notifications: { ...tempSettings.notifications, quiet: value },
                  })
                }
              />
            </View>
            {tempSettings.notifications.quiet && (
              <View className="space-y-4">
                <Text className="text-lg font-['Poppins-Medium'] text-gray-800">Quiet Hours</Text>
                <View className="flex-row justify-between">
                  <TouchableOpacity className="bg-gray-100 px-4 py-2 rounded-lg">
                    <Text>Start: 22:00</Text>
                  </TouchableOpacity>
                  <TouchableOpacity className="bg-gray-100 px-4 py-2 rounded-lg">
                    <Text>End: 07:00</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        );

      case 'wellness':
        return (
          <View className="space-y-6">
            <View>
              <Text className="text-lg font-['Poppins-Medium'] text-gray-800 mb-2">Daily Water Goal (L)</Text>
              <Slider
                minimumValue={1}
                maximumValue={5}
                step={0.1}
                value={tempSettings.wellness.waterGoal}
                onValueChange={(value) =>
                  setTempSettings({
                    ...tempSettings,
                    wellness: { ...tempSettings.wellness, waterGoal: value },
                  })
                }
                minimumTrackTintColor="#4F46E5"
                maximumTrackTintColor="#E5E7EB"
              />
              <Text className="text-center text-gray-600 mt-2">
                {tempSettings.wellness.waterGoal.toFixed(1)}L
              </Text>
            </View>
            <View>
              <Text className="text-lg font-['Poppins-Medium'] text-gray-800 mb-2">Active Hours Goal</Text>
              <Slider
                minimumValue={1}
                maximumValue={12}
                step={0.5}
                value={tempSettings.wellness.activeHoursGoal}
                onValueChange={(value) =>
                  setTempSettings({
                    ...tempSettings,
                    wellness: { ...tempSettings.wellness, activeHoursGoal: value },
                  })
                }
                minimumTrackTintColor="#4F46E5"
                maximumTrackTintColor="#E5E7EB"
              />
              <Text className="text-center text-gray-600 mt-2">
                {tempSettings.wellness.activeHoursGoal.toFixed(1)} hours
              </Text>
            </View>
          </View>
        );

      case 'theme':
        return (
          <View className="space-y-6">
            <View className="flex-row justify-between items-center">
              <Text className="text-lg font-['Poppins-Medium'] text-gray-800">Dark Mode</Text>
              <Switch
                value={tempSettings.theme.darkMode}
                onValueChange={(value) =>
                  setTempSettings({
                    ...tempSettings,
                    theme: { ...tempSettings.theme, darkMode: value },
                  })
                }
              />
            </View>
            <View>
              <Text className="text-lg font-['Poppins-Medium'] text-gray-800 mb-2">Accent Color</Text>
              <Slider
                minimumValue={0}
                maximumValue={1}
                step={0.1}
                value={tempSettings.theme.accentColor}
                onValueChange={(value) =>
                  setTempSettings({
                    ...tempSettings,
                    theme: { ...tempSettings.theme, accentColor: value },
                  })
                }
                minimumTrackTintColor="#4F46E5"
                maximumTrackTintColor="#E5E7EB"
              />
              <Text className="text-center text-gray-600 mt-2">
                {tempSettings.theme.accentColor.toFixed(1)}
              </Text>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <Animated.View 
      entering={FadeIn.duration(300)}
      exiting={FadeOut.duration(300)}
      className="bg-white rounded-t-3xl p-6"
    >
      <View className="flex-row justify-between items-center mb-6">
        <Text className="text-2xl font-['Poppins-Bold'] text-gray-800">
          {section.charAt(0).toUpperCase() + section.slice(1)} Settings
        </Text>
        <TouchableOpacity onPress={onClose}>
          <X size={24} color="#94A3B8" />
        </TouchableOpacity>
      </View>
      <ScrollView className="max-h-96">
        {renderSection()}
      </ScrollView>
      <TouchableOpacity
        className="bg-indigo-600 p-4 rounded-xl mt-6"
        onPress={handleSave}
      >
        <Text className="text-white text-center font-['Poppins-Medium']">Save Changes</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};