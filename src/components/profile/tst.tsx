import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { observer } from '@legendapp/state/react';
import Animated, { FadeInDown, FadeInRight, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { Camera, ChevronRight, Edit2, Save, X } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { observable } from '@legendapp/state';
import { ProgressRing } from 'src/components/profile/ProgressRing';
import { SectionHeader } from 'src/components/profile/sect-head';
import { InputField } from 'src/components/profile/input';
import { Avatar } from 'src/components/profile/avatar';

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
  const [isEditMode, setIsEditMode] = useState(false);
  const editButtonScale = useSharedValue(1);
  const saveButtonScale = useSharedValue(1);

  const animatedEditButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: editButtonScale.value }],
  }));

  const animatedSaveButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: saveButtonScale.value }],
  }));

  const handleEdit = useCallback(() => {
    editButtonScale.value = withSpring(0.9, {}, () => {
      editButtonScale.value = withSpring(1);
    });
    setIsEditMode(true);
  }, []);

  const handleSave = useCallback(() => {
    saveButtonScale.value = withSpring(0.9, {}, () => {
      saveButtonScale.value = withSpring(1);
    });
    setIsEditMode(false);
    // Here you would typically send the updated profile to your backend
    console.log('Profile saved:', profileState.get());
  }, []);

  const handleImagePick = useCallback(async () => {
    // const result = await ImagePicker.launchImageLibraryAsync({
    //   mediaTypes: ImagePicker.MediaTypeOptions.Images,
    //   allowsEditing: true,
    //   aspect: [1, 1],
    //   quality: 1,
    // });

    // if (!result.canceled && result.assets[0].uri) {
    //   profileState.image.set(result.assets[0].uri);
    // }
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <ScrollView className="flex-1">
        <LinearGradient
          colors={['#4F46E5', '#7C3AED']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="px-4 pt-8 pb-16 rounded-b-3xl"
        >
          <Animated.View 
            entering={FadeInDown.duration(600).springify()} 
            className="items-center"
          >
            <TouchableOpacity onPress={handleImagePick} disabled={!isEditMode}>
              <Avatar
                size={120} 
                source={{ uri: profileState.image.get() }} 
              />
              {isEditMode && (
                <View className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-2">
                  <Camera size={20} color="white" />
                </View>
              )}
            </TouchableOpacity>
            <Text className="mt-4 text-2xl font-rbold text-white">
              {profileState.name.get()}
            </Text>
            <Text className="text-indigo-200">
              {profileState.email.get()}
            </Text>
          </Animated.View>
        </LinearGradient>

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

        <View className="px-4 mt-8">
          <SectionHeader title="Personal Information" />
          <Animated.View entering={FadeInRight.duration(600).delay(200)}>
            <InputField
              label="Name"
              value={profileState.name}
              editable={isEditMode}
            />
            <InputField
              label="Email"
              value={profileState.email}
              editable={isEditMode}
              keyboardType="email-address"
            />
            {/* <DatePicker
              label="Date of Birth"
              value={profileState.dateOfBirth}
              editable={isEditMode}
            /> */}
            <InputField
              label="Phone"
              value={profileState.phone}
              editable={isEditMode}
              keyboardType="phone-pad"
            />
            <InputField
              label="Address"
              value={profileState.address}
              editable={isEditMode}
              multiline
            />
            <InputField
              label="Gender"
              value={profileState.gender}
              editable={isEditMode}
            />
            <InputField
              label="Preferred Language"
              value={profileState.preferredLanguage}
              editable={isEditMode}
            />
          </Animated.View>

          <SectionHeader title="Medical Information" />
          <Animated.View entering={FadeInRight.duration(600).delay(400)}>
            <InputField
              label="Blood Type"
              value={profileState.bloodType}
              editable={isEditMode}
            />
            <InputField
              label="Allergies"
              value={profileState.allergies}
              editable={isEditMode}
              onChangeText={(text) => profileState.allergies}
            />
            <InputField
              label="Medical Notes"
              value={profileState.medicalNotes}
              editable={isEditMode}
              multiline
            />
          </Animated.View>

          <SectionHeader title="Emergency Contact" />
          <Animated.View entering={FadeInRight.duration(600).delay(600)}>
            <InputField
              label="Name"
              value={profileState.emergencyContact.name}
              editable={isEditMode}
            />
            <InputField
              label="Phone"
              value={profileState.emergencyContact.phone}
              editable={isEditMode}
              keyboardType="phone-pad"
            />
          </Animated.View>

          <SectionHeader title="Health Goals" />
          <Animated.View entering={FadeInRight.duration(600).delay(800)}>
            <InputField
              label="Sleep Goal (hours)"
              value={profileState.sleepGoal}
              editable={isEditMode}
              keyboardType="numeric"
              onChangeText={(text) => profileState.sleepGoal.set(Number(text))}
            />
            <InputField
              label="Water Intake Goal (ml)"
              value={profileState.waterIntake}
              editable={isEditMode}
              keyboardType="numeric"
              onChangeText={(text) => profileState.waterIntake.set(Number(text))}
            />
          </Animated.View>
        </View>
      </ScrollView>

      <Animated.View 
        style={[animatedEditButtonStyle, { 
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
        {isEditMode ? (
          <TouchableOpacity
            onPress={handleSave}
            className="bg-green-500 p-4 rounded-full"
          >
            <Save color="white" size={24} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={handleEdit}
            className="bg-blue-500 p-4 rounded-full"
          >
            <Edit2 color="white" size={24} />
          </TouchableOpacity>
        )}
      </Animated.View>
    </SafeAreaView>
  );
});

export default ProfileScreen;

