import { useCallback, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { observer } from '@legendapp/state/react';
import Animated, { FadeInDown, FadeInRight, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { Camera, Edit, Moon, Sun } from 'lucide-react-native';
import { router } from 'expo-router';

import { Avatar } from 'src/components/profile/avatar';
import { SectionHeader } from 'src/components/profile/sect-head';
import LabelField from 'src/components/profile/input';
import { ProgressRing } from 'src/components/profile/ProgressRing';
import { useProfile } from 'src/store/profile/actions';
import { Card } from 'src/components/ui/Card';
import { colorScheme } from 'nativewind';

const ProfileScreen = observer(() => {
  const saveButtonScale = useSharedValue(1);
  const editButtonScale = useSharedValue(1);
  const { personalInfo } = useProfile();
  const isDarkMode = colorScheme.get()==='dark'
  console.log(isDarkMode)
  const { 
    name, dateOfBirth, email, height, weight, phone, allergies, bloodType, 
    image, waterIntake, address, gender, calorieGoal, emergencyContact, 
    preferredLanguage, medicalNotes, sleepGoal 
  } = personalInfo;

  const animatedSaveButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: saveButtonScale.value }],
  }));

  const handleSave = useCallback(() => {
    saveButtonScale.value = withSpring(0.9, {}, () => {
      saveButtonScale.value = withSpring(1);
    });
    // Here you would typically send the updated profile to your backend
    console.log('Profile saved:', personalInfo);
  }, [personalInfo]);

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

  return (
    <View className={`flex-1 bg-gray-900 dark:bg-gray-50`}>
      <ScrollView className="flex-1 px-4">
        <View className="flex-row justify-between items-center mt-4 mb-6">
          <Text className={`text-2xl font-rbold text-white dark:text-gray-900`}>
            My Profile
          </Text>
          <View className="flex-row items-center">
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

        <Animated.View 
          entering={FadeInDown.duration(600).springify()} 
          className="items-center mb-8"
        >
          <TouchableOpacity onPress={handleImagePick}>
            <Avatar size={120} source={{ uri: image || '' }} />
            <View className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-2">
              <Camera size={20} color="white" />
            </View>
          </TouchableOpacity>
          <Text className={`mt-4 text-2xl font-rbold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {name}
          </Text>
          <Text className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {email}
          </Text>
        </Animated.View>

        <Card className={`mb-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <Animated.View 
            entering={FadeInDown.delay(200).duration(600).springify()}
            className="p-4 flex-row justify-between items-center"
          >
            <View>
              <Text className={`text-lg font-rbold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Health Score</Text>
              <Text className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} font-rregular`}>Based on your profile</Text>
            </View>
            <ProgressRing progress={75} size={60} strokeWidth={6} />
          </Animated.View>
        </Card>

        <SectionHeader title="Personal Information"/>
        <Animated.View entering={FadeInRight.duration(600).delay(200)}>
          <LabelField label="Name" value={name}/>
          <LabelField label="Email" value={email}/>
          <LabelField label="Phone" value={phone}/>
          <LabelField label="Address" value={address}/>
          <LabelField label="Gender" value={gender}/>
          <LabelField label="Preferred Language" value={preferredLanguage}/>
        </Animated.View>

        <SectionHeader title="Medical Information"/>
        <Animated.View entering={FadeInRight.duration(600).delay(400)}>
          <LabelField label="Blood Type" value={bloodType}/>
          <LabelField label="Allergies" value={allergies}/>
          <LabelField label="Medical Notes" value={medicalNotes}/>
        </Animated.View>

        <SectionHeader title="Emergency Contact"/>
        <Animated.View entering={FadeInRight.duration(600).delay(600)}>
          <LabelField label="Name" value={emergencyContact?.name}/>
          <LabelField label="Phone" value={emergencyContact?.phone}/>
        </Animated.View>

        <SectionHeader title="Health Goals"/>
        <Animated.View entering={FadeInRight.duration(600).delay(800)}>
          <LabelField label="Sleep Goal (hours)" value={sleepGoal}/>
          <LabelField label="Water Intake Goal (ml)" value={waterIntake}/>
        </Animated.View>
      </ScrollView>

      <Animated.View 
        style={[animatedSaveButtonStyle, { 
          position: 'absolute', 
          bottom: 20, 
          right: 20,
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        }]}
      >
        <TouchableOpacity
          onPress={handleEdit}
          className="bg-blue-500 p-4 rounded-full"
        >
          <Edit color="white" size={24} />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
});

export default ProfileScreen;

