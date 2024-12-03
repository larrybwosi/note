import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { observer } from '@legendapp/state/react';
import Animated, { FadeInDown, FadeInRight, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { Camera, Save } from 'lucide-react-native';

import { observable } from '@legendapp/state';
import { Avatar } from 'src/components/profile/avatar';
import { SectionHeader } from 'src/components/profile/sect-head';
import { InputField } from 'src/components/profile/input';
import { ProgressRing } from 'src/components/profile/ProgressRing';

const profileState = observable({
  name: 'John Doe',
  email: 'john.doe@example.com',
  dateOfBirth: '1990-01-01',
  image: 'https://example.com/avatar.jpg',
  height: 180,
  weight: 75,
  phone: '+1234567890',
  address: '123 Main St, City, Country',
  gender: 'Male',
  preferredLanguage: 'English',
  emergencyContact: { name: 'Jane Doe', phone: '+9876543210' },
  bloodType: 'A+',
  allergies: ['Peanuts', 'Penicillin'],
  medicalNotes: 'No significant medical history',
  sleepGoal: 8,
  waterIntake: 2000,
});

const ProfileScreen = observer(() => {
  const saveButtonScale = useSharedValue(1);
  const editButtonScale = useSharedValue(1);
  const [isEditMode, setIsEditMode] = useState(false);

  const animatedSaveButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: saveButtonScale.value }],
    };
  });

  const handleSave = useCallback(() => {
    saveButtonScale.value = withSpring(0.9, {}, () => {
      saveButtonScale.value = withSpring(1);
    });
    // Here you would typically send the updated profile to your backend
    console.log('Profile saved:', profileState.get());
  }, []);

  const handleEdit = useCallback(() => {
    editButtonScale.value = withSpring(0.9, {}, () => {
      editButtonScale.value = withSpring(1);
    });
    setIsEditMode(true);
  }, []);

  const handleImagePick = useCallback(async () => {
    //TODO
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <ScrollView className="flex-1 px-4">
        <Animated.View 
          entering={FadeInDown.duration(600).springify()} 
          className="items-center mt-6 mb-8"
        >
          <TouchableOpacity onPress={handleImagePick} disabled={!isEditMode}>
              <Avatar
                size={120} 
                source={{ uri: profileState.image.get() }} 
              />
              {!isEditMode && (
                <View className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-2">
                  <Camera size={20} color="white" />
                </View>
              )}
            </TouchableOpacity>
          <Text className="mt-4 text-2xl font-rbold text-gray-900 dark:text-white">
            {profileState.name.get()}
          </Text>
          <Text className="text-gray-600 dark:text-gray-400">
            {profileState.email.get()}
          </Text>
        </Animated.View>

        <View className="px-4 -mt-8">
          <Animated.View 
            entering={FadeInDown.delay(200).duration(600).springify()}
            className="bg-white dark:bg-gray-800 rounded-xl p-4 flex-row justify-between items-center shadow-md"
          >
            <View>
              <Text className="text-lg font-rbold text-gray-900 dark:text-white">Health Score</Text>
              <Text className="text-gray-600 dark:text-gray-400">Based on your profile</Text>
            </View>
            <ProgressRing progress={75} size={60} strokeWidth={6} />
          </Animated.View>
        </View>

        <SectionHeader title="Personal Information" />
        <Animated.View entering={FadeInRight.duration(600).delay(200)}>
          <InputField
            label="Name"
            value={profileState.name}
              editable={isEditMode}
            placeholder="Enter your name"
          />
          <InputField
            label="Email"
            value={profileState.email}
            placeholder="Enter your email"
              editable={isEditMode}
            keyboardType="email-address"
          />
          <InputField
            label="Phone"
            value={profileState.phone}
              editable={isEditMode}
            placeholder="Enter your phone number"
            keyboardType="phone-pad"
          />
          <InputField
            label="Address"
            value={profileState.address}
              editable={isEditMode}
            placeholder="Enter your address"
            multiline
          />
          <InputField
            label="Gender"
            value={profileState.gender}
              editable={isEditMode}
            placeholder="Enter your gender"
          />
          <InputField
            label="Preferred Language"
            value={profileState.preferredLanguage}
              editable={isEditMode}
            placeholder="Enter your preferred language"
          />
        </Animated.View>

        <SectionHeader title="Medical Information" />
        <Animated.View entering={FadeInRight.duration(600).delay(400)}>
          <InputField
            label="Blood Type"
            value={profileState.bloodType}
            editable={isEditMode}
            placeholder="Enter your blood type"
          />
          <InputField
            label="Allergies"
            value={profileState.allergies}
            editable={isEditMode}
            placeholder="Enter your allergies (comma-separated)"
            onChangeText={(text) => profileState.allergies.set(text.split(', '))}
          />
          <InputField
            label="Medical Notes"
            value={profileState.medicalNotes}
            editable={isEditMode}
            placeholder="Enter any medical notes"
            multiline
          />
        </Animated.View>

        <SectionHeader title="Emergency Contact" />
        <Animated.View entering={FadeInRight.duration(600).delay(600)}>
          <InputField
            label="Name"
            value={profileState.emergencyContact.name}
            editable={isEditMode}
            placeholder="Enter emergency contact name"
          />
          <InputField
            label="Phone"
            value={profileState.emergencyContact.phone}
            editable={isEditMode}
            placeholder="Enter emergency contact phone"
            keyboardType="phone-pad"
          />
        </Animated.View>

        <SectionHeader title="Health Goals" />
        <Animated.View entering={FadeInRight.duration(600).delay(800)}>
          <InputField
            label="Sleep Goal (hours)"
            value={profileState.sleepGoal}
            placeholder="Enter your daily sleep goal"
            keyboardType="numeric"
            editable={isEditMode}
            onChangeText={(text) => profileState.sleepGoal.set(Number(text))}
          />
          <InputField
            label="Water Intake Goal (ml)"
            value={profileState.waterIntake}
            placeholder="Enter your daily water intake goal"
            keyboardType="numeric"
            editable={isEditMode}
            onChangeText={(text) => profileState.waterIntake.set(Number(text))}
          />
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
          onPress={handleSave}
          className="bg-blue-500 p-4 rounded-full"
        >
          <Save color="white" size={24} />
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
});

export default ProfileScreen;

