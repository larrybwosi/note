import { useCallback, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, Image } from 'react-native';
import { observer } from '@legendapp/state/react';
import Animated, {
  FadeInDown,
  FadeInRight,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Camera, Edit, Moon, Sun, Activity, Award, Settings } from 'lucide-react-native';
import { colorScheme } from 'nativewind';
import { router } from 'expo-router';

import { ProgressRing } from 'src/components/profile/ProgressRing';
import { Avatar } from 'src/components/profile/avatar';
import { useProfile } from 'src/store/profile/actions';
import { Badge } from 'src/components/ui/badge';
import { Card } from 'src/components/ui/card';
import { Tab } from 'src/components/ui/tab';

const ProfileScreen = observer(() => {
  const saveButtonScale = useSharedValue(1);
  const editButtonScale = useSharedValue(1);
  const { personalInfo, productivityMetrics } = useProfile();
  const isDarkMode = colorScheme.get() === 'dark';
  const [activeTab, setActiveTab] = useState('Personal');

  const {
    name,
    dateOfBirth,
    email,
    height,
    weight,
    phone,
    allergies,
    bloodType,
    image,
    waterIntake,
    address,
    gender,
    preferredLanguage,
    medicalNotes,
    sleepGoal,
  } = personalInfo;

  const animatedSaveButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: saveButtonScale.value }],
  }));

  const handleEdit = useCallback(() => {
    editButtonScale.value = withSpring(0.9, {}, () => {
      editButtonScale.value = withSpring(1);
    });
    router.push('/create.profile');
  }, []);

  const handleImagePick = useCallback(async () => {
    // TODO: Implement image picking functionality
  }, []);

  const toggleDarkMode = () => {
    colorScheme.toggle();
  };

  const LabelField = ({ label, value }: { label: string; value: any }) => {
    return (
      <View className="mb-4">
        <Text className="mb-2 font-medium text-gray-700 dark:text-gray-300">{label}</Text>
        <Text className="bg-gray-50 font-normal dark:bg-gray-700 text-gray-900 dark:text-white p-3 rounded-lg">
          {value}
        </Text>
      </View>
    );
  };

  const SectionHeader = ({ title }: { title: string }) => {
    return (
      <View className="mt-6 mb-4">
        <Text className="text-xl font-bold text-gray-900 dark:text-gray-50">{title}</Text>
      </View>
    );
  };

  const QuickActionButton = ({
    icon,
    label,
    onPress,
  }: {
    icon: React.ReactNode;
    label: string;
    onPress: () => void;
  }) => {
    return (
      <TouchableOpacity onPress={onPress} className="items-center">
        <View className="bg-gray-200 dark:bg-gray-700 rounded-full p-3 mb-2">{icon}</View>
        <Text className="text-xs text-gray-600 dark:text-gray-300">{label}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900 py-5">
      <ScrollView className="flex-1">
        <Animated.View
          entering={FadeInDown.duration(600).springify()}
          className="h-40 bg-blue-500 dark:bg-blue-700"
        >
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2073&q=80',
            }}
            className="w-full h-full opacity-50"
            resizeMode="cover"
          />
        </Animated.View>

        <View className="px-4 -mt-20">
          <Animated.View
            entering={FadeInDown.delay(200).duration(600).springify()}
            className="items-center"
          >
            <TouchableOpacity onPress={handleImagePick}>
              <Avatar size={120} source={{ uri: image || '' }} />
              <View className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-2">
                <Camera size={20} color="white" />
              </View>
            </TouchableOpacity>
            <Text className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">{name}</Text>
            <Text className="text-gray-600 dark:text-gray-400">{email}</Text>
            <Badge variant="secondary" className="mt-2">
              Premium Member
            </Badge>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(400).duration(600).springify()}
            className="flex-row justify-around mt-6"
          >
            <QuickActionButton
              icon={<Activity size={24} color={isDarkMode ? '#E5E7EB' : '#4B5563'} />}
              label="Health"
              onPress={() => {}}
            />
            <QuickActionButton
              icon={<Award size={24} color={isDarkMode ? '#E5E7EB' : '#4B5563'} />}
              label="Achievements"
              onPress={() => {}}
            />
            <QuickActionButton
              icon={<Settings size={24} color={isDarkMode ? '#E5E7EB' : '#4B5563'} />}
              label="Settings"
              onPress={() => {}}
            />
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(600).duration(600).springify()}
            className="mt-6"
          >
            <Tab
              tabs={['Personal', 'Health', 'Productivity']}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          </Animated.View>

          {activeTab === 'Personal' && (
            <Animated.View entering={FadeInRight.duration(600)}>
              <SectionHeader title="Personal Information" />
              <LabelField label="Name" value={name} />
              <LabelField label="Email" value={email} />
              <LabelField label="Phone" value={phone} />
              <LabelField label="Address" value={address} />
              <LabelField label="Gender" value={gender} />
              <LabelField label="Preferred Language" value={preferredLanguage} />
            </Animated.View>
          )}

          {activeTab === 'Health' && (
            <Animated.View entering={FadeInRight.duration(600)}>
              <SectionHeader title="Health Information" />
              <Card className="mb-6 bg-white dark:bg-gray-800">
                <View className="p-4 flex-row justify-between items-center">
                  <View>
                    <Text className="text-lg font-bold text-gray-900 dark:text-white">
                      Health Score
                    </Text>
                    <Text className="text-gray-600 dark:text-gray-400 font-normal">
                      Based on your profile
                    </Text>
                  </View>
                  <ProgressRing progress={75} size={60} strokeWidth={6} />
                </View>
              </Card>
              <LabelField label="Blood Type" value={bloodType} />
              <LabelField label="Allergies" value={allergies} />
              <LabelField label="Medical Notes" value={medicalNotes} />
              <LabelField label="Height" value={`${height} cm`} />
              <LabelField label="Weight" value={`${weight} kg`} />
            </Animated.View>
          )}

          {activeTab === 'Productivity' && (
            <Animated.View entering={FadeInRight.duration(600)}>
              <SectionHeader title="Productivity Metrics" />
              <LabelField
                label="Focus Time"
                value={`${productivityMetrics.focusTime.daily.current} / ${productivityMetrics.focusTime.daily.goal} minutes`}
              />
              <LabelField label="Tasks Completed" value={productivityMetrics.tasksCompleted} />
              <SectionHeader title="Habits" />
              {productivityMetrics.habits.map((habit, index) => (
                <LabelField
                  key={index}
                  label={habit.name}
                  value={habit.completed ? 'Completed' : 'Not Completed'}
                />
              ))}
            </Animated.View>
          )}
        </View>
      </ScrollView>

      <Animated.View
        style={[
          animatedSaveButtonStyle,
          {
            position: 'absolute',
            bottom: 20,
            right: 20,
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
          },
        ]}
      >
        <TouchableOpacity onPress={handleEdit} className="bg-blue-500 p-4 rounded-full">
          <Edit color="white" size={24} />
        </TouchableOpacity>
      </Animated.View>

      <View className="absolute top-12 right-4 flex-row items-center bg-gray-200 dark:bg-gray-800 rounded-full p-1">
        <Sun size={20} color={isDarkMode ? '#9CA3AF' : '#4B5563'} />
        <Switch
          value={isDarkMode}
          onValueChange={toggleDarkMode}
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={isDarkMode ? '#f5dd4b' : '#f4f3f4'}
          ios_backgroundColor="#3e3e3e"
          style={{ marginHorizontal: 8 }}
        />
        <Moon size={20} color={isDarkMode ? '#F3F4F6' : '#6B7280'} />
      </View>
    </View>
  );
});

export default ProfileScreen;
