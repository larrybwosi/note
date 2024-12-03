import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { User } from 'lucide-react-native';

interface ProfileHeaderProps {
  name: string;
  email: string;
  image?: string;
  gradientStart: string;
  gradientEnd: string;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  name,
  email,
  image,
  gradientStart,
  gradientEnd,
}) => (
  <LinearGradient
    colors={[gradientStart, gradientEnd]}
    className="px-6 pt-16 pb-12 rounded-b-[40px]"
  >
    <View className="items-center">
      <View className="mb-4">
        <View className="rounded-full p-1 bg-white/20">
          {image ? (
            <Image
              source={{ uri: image }}
              className="w-28 h-28 rounded-full border-4 border-white"
            />
          ) : (
            <View className="w-28 h-28 rounded-full bg-indigo-200 items-center justify-center">
              <User size={48} color="#4F46E5" />
            </View>
          )}
        </View>
      </View>
      <Text className="text-white text-2xl font-rbold">{name}</Text>
      <Text className="text-indigo-100 mt-1 font-aregular">{email}</Text>
      
      <View className="flex-row mt-6 space-x-4">
        <TouchableOpacity className="bg-white/20 px-4 py-2 rounded-full">
          <Text className="text-white font-amedium">Edit Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity className="bg-white px-4 py-2 rounded-full">
          <Text className="text-indigo-600 font-amedium">Share Stats</Text>
        </TouchableOpacity>
      </View>
    </View>
  </LinearGradient>
);
