import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { 
  Calendar, 
  Clock, 
  Settings2, 
  Plus, 
  X, 
  ChevronRight, 
  BookOpen, 
  Coffee, 
  Briefcase, 
  Dumbbell 
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const ScheduleGenerator = () => {
  const [preferences, setPreferences] = useState({
    workHours: [9, 17],
    breakDuration: 30,
    focusTime: 50,
  });

  const [activities] = useState([
    { id: 1, name: 'Deep Work', icon: BookOpen, color: 'rgba(79, 70, 229, 0.1)', textColor: '#4338ca' },
    { id: 2, name: 'Break', icon: Coffee, color: 'rgba(34, 197, 94, 0.1)', textColor: '#15803d' },
    { id: 3, name: 'Meeting', icon: Briefcase, color: 'rgba(59, 130, 246, 0.1)', textColor: '#1d4ed8' },
    { id: 4, name: 'Exercise', icon: Dumbbell, color: 'rgba(239, 68, 68, 0.1)', textColor: '#b91c1c' },
  ]);

  const [generatedSchedule] = useState([
    { time: '09:00', activity: 'Deep Work', duration: 120 },
    { time: '11:00', activity: 'Break', duration: 30 },
    { time: '11:30', activity: 'Meeting', duration: 60 },
    { time: '12:30', activity: 'Exercise', duration: 45 },
  ]);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header Section */}
      <LinearGradient
        colors={['#7c3aed', '#2563eb']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        className="px-4 py-8"
      >
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-3xl font-bold text-white mb-2">AI Schedule Planner</Text>
            <Text className="text-purple-100">Create your perfect day with AI assistance</Text>
          </View>
          <TouchableOpacity>
            <Settings2 color="white" size={24} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView className="flex-1 px-4 py-8">
        {/* Preferences Panel */}
        <View className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <Text className="text-xl font-semibold text-gray-900 mb-6">Your Preferences</Text>
          
          <View className="space-y-6">
            {/* Work Hours */}
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-2">Work Hours</Text>
              <View className="flex-row items-center space-x-4">
                <Clock color="#8b5cf6" size={20} />
                <Text className="text-gray-600">
                  {preferences.workHours[0]}:00 - {preferences.workHours[1]}:00
                </Text>
              </View>
            </View>

            {/* Break Duration */}
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-2">Break Duration</Text>
              <View className="flex-row items-center space-x-4">
                <Coffee color="#8b5cf6" size={20} />
                <Text className="text-gray-600">{preferences.breakDuration} minutes</Text>
              </View>
            </View>

            {/* Focus Time */}
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-2">Focus Time Blocks</Text>
              <View className="flex-row items-center space-x-4">
                <BookOpen color="#8b5cf6" size={20} />
                <Text className="text-gray-600">{preferences.focusTime} minutes</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity className="mt-6 bg-purple-600 py-2 px-4 rounded-lg">
            <Text className="text-white text-center font-medium">Update Preferences</Text>
          </TouchableOpacity>
        </View>

        {/* Activities */}
        <View className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <Text className="text-xl font-semibold text-gray-900 mb-6">Activities</Text>
          <View className="space-y-4">
            {activities.map(activity => (
              <View
                key={activity.id}
                style={{ backgroundColor: activity.color }}
                className="flex-row items-center justify-between p-3 rounded-lg"
              >
                <View className="flex-row items-center space-x-3">
                  <activity.icon color={activity.textColor} size={20} />
                  <Text style={{ color: activity.textColor }} className="font-medium">
                    {activity.name}
                  </Text>
                </View>
                <TouchableOpacity>
                  <X color={activity.textColor} size={16} />
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity className="mt-4 border-2 border-dashed border-gray-300 rounded-lg p-3 items-center flex-row justify-center">
              <Plus color="#6b7280" size={20} />
              <Text className="text-gray-600 ml-2">Add Activity</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Schedule Display */}
        <View className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <View className="flex-row items-center justify-between mb-6">
            <Text className="text-xl font-semibold text-gray-900">Your Schedule</Text>
            <View className="flex-row items-center space-x-4">
              <Calendar color="#8b5cf6" size={20} />
              <Text className="text-gray-600">Today</Text>
              <ChevronRight color="#9ca3af" size={20} />
            </View>
          </View>

          <View className="space-y-4">
            {generatedSchedule.map((item, index) => (
              <View
                key={index}
                className="flex-row items-center space-x-4 p-4 bg-gray-50 rounded-lg"
              >
                <Text className="w-20 text-gray-600 font-medium">{item.time}</Text>
                <View className="flex-1">
                  <Text className="text-gray-900 font-medium">{item.activity}</Text>
                  <Text className="text-gray-500 text-sm">{item.duration} minutes</Text>
                </View>
                <TouchableOpacity>
                  <Settings2 color="#8b5cf6" size={20} />
                </TouchableOpacity>
              </View>
            ))}
          </View>

          {/* AI Alert */}
          <View className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <Text className="text-blue-800 font-semibold mb-1">AI Suggestions</Text>
            <Text className="text-blue-700">
              Based on your productivity patterns, consider moving your deep work session earlier in the day.
            </Text>
          </View>

          {/* Action Buttons */}
          <View className="mt-6 flex-row space-x-4">
            <TouchableOpacity className="flex-1 bg-purple-600 py-2 px-4 rounded-lg">
              <Text className="text-white text-center font-medium">Generate New Schedule</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 border border-purple-600 py-2 px-4 rounded-lg">
              <Text className="text-purple-600 text-center font-medium">Save as Template</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats/Analytics Section */}
        <View className="flex-row space-x-4">
          <View className="flex-1 bg-white rounded-xl shadow-sm p-4">
            <Text className="text-sm font-medium text-gray-500">Focus Time</Text>
            <Text className="mt-2 text-2xl font-semibold text-gray-900">6.5 hrs</Text>
            <Text className="text-green-500 text-sm">↑ 12% vs. yesterday</Text>
          </View>
          <View className="flex-1 bg-white rounded-xl shadow-sm p-4">
            <Text className="text-sm font-medium text-gray-500">Break Time</Text>
            <Text className="mt-2 text-2xl font-semibold text-gray-900">1.5 hrs</Text>
            <Text className="text-gray-500 text-sm">On target</Text>
          </View>
          <View className="flex-1 bg-white rounded-xl shadow-sm p-4">
            <Text className="text-sm font-medium text-gray-500">Tasks Completed</Text>
            <Text className="mt-2 text-2xl font-semibold text-gray-900">8/10</Text>
            <Text className="text-blue-500 text-sm">80% completion</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ScheduleGenerator;