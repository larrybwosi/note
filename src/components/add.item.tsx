import { observer } from "@legendapp/state/react"
import { format, addMinutes } from "date-fns"
import { Text } from "react-native"
import { Modal, TextInput, TouchableOpacity, View, ScrollView } from "react-native"
import Animated, { SlideInRight, SlideOutLeft } from "react-native-reanimated"
import { scheduleStore } from "src/storage/schedule"
import { handleAddItem, resetForm } from "src/storage/schedule.modify"
import { TASK_TYPES, PRIORITY_LEVELS, RECURRENCE_PATTERNS } from "../storage/schedule"


const priorityColors = {
  Low: {
    bg: "bg-emerald-500",
    text: "text-emerald-500",
    light: "bg-emerald-100",
    border: "border-emerald-500",
  },
  Medium: {
    bg: "bg-blue-500",
    text: "text-blue-500",
    light: "bg-blue-100",
    border: "border-blue-500",
  },
  High: {
    bg: "bg-amber-500",
    text: "text-amber-500",
    light: "bg-amber-100",
    border: "border-amber-500",
  },
  Critical: {
    bg: "bg-rose-500",
    text: "text-rose-500",
    light: "bg-rose-100",
    border: "border-rose-500",
  }
}

const energyColors = {
  Low: {
    bg: "bg-slate-400",
    text: "text-slate-500",
    light: "bg-slate-100",
  },
  Medium: {
    bg: "bg-indigo-400",
    text: "text-indigo-500",
    light: "bg-indigo-100",
  },
  High: {
    bg: "bg-purple-400",
    text: "text-purple-500",
    light: "bg-purple-100",
  }
}

const typeColors = {
  Work: { bg: "bg-blue-100", text: "text-blue-600" },
  Personal: { bg: "bg-green-100", text: "text-green-600" },
  Health: { bg: "bg-rose-100", text: "text-rose-600" },
  Learning: { bg: "bg-purple-100", text: "text-purple-600" },
  Social: { bg: "bg-amber-100", text: "text-amber-600" },
  Urgent: { bg: "bg-red-100", text: "text-red-600" }
}

const AddItem = () => {
  const isEvent = scheduleStore.newItem.scheduleType.get() === 'event'

  return(
    <Modal
      visible={scheduleStore.isAddingItem.get()}
      transparent
      animationType="slide"
      onRequestClose={resetForm}
    >
      <View className="flex-1 justify-end bg-black/50">
        <Animated.View 
          entering={SlideInRight}
          exiting={SlideOutLeft}
          className="bg-white dark:bg-gray-800 rounded-t-3xl p-6 h-5/6"
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text className="text-xl font-rbold text-gray-900 dark:text-white mb-4">
              {scheduleStore.editingItem.get() ? 'Edit Item' : 'Add New Item'}
            </Text>

            <View className="space-y-4">
              {/* Schedule Type Selection */}
              <View>
                <Text className="text-sm font-plregular text-gray-700 dark:text-gray-300 mb-2">
                  Type
                </Text>
                <View className="flex-row gap-3">
                  {['task', 'event'].map((type) => (
                    <TouchableOpacity
                      key={type}
                      onPress={() => scheduleStore.newItem.scheduleType.set(type as 'task' | 'event')}
                      className={`flex-1 p-4 rounded-xl border ${
                        scheduleStore.newItem.scheduleType.get() === type
                          ? 'border-violet-600 bg-violet-50 dark:bg-violet-900/30'
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <Text
                        className={`text-center font-medium ${
                          scheduleStore.newItem.scheduleType.get() === type
                            ? 'text-violet-600 dark:text-violet-400'
                            : 'text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Title Input */}
              <View>
                <Text className="text-sm font-plregular text-gray-700 dark:text-gray-300 mb-2">
                  Title *
                </Text>
                <TextInput
                  className="bg-gray-100 dark:bg-gray-700 p-4 rounded-xl text-gray-900 dark:text-white"
                  placeholder="Enter title..."
                  value={scheduleStore.newItem.title.get()}
                  onChangeText={(text) => scheduleStore.newItem.title.set(text)}
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              {/* Description Input */}
              <View>
                <Text className="text-sm font-plregular text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </Text>
                <TextInput
                  className="bg-gray-100 dark:bg-gray-700 p-4 rounded-xl text-gray-900 dark:text-white"
                  placeholder="Enter description..."
                  value={scheduleStore.newItem.description.get()}
                  onChangeText={(text) => scheduleStore.newItem.description.set(text)}
                  placeholderTextColor="#9CA3AF"
                  multiline
                  numberOfLines={3}
                />
              </View>

              {/* Task Type Selection */}
              <View>
                <Text className="text-sm font-plregular text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View className="flex-row gap-2 py-2">
                    {TASK_TYPES.map((type) => (
                      <TouchableOpacity
                        key={type}
                        onPress={() => scheduleStore.newItem.type.set(type)}
                        className={`px-4 py-2 rounded-xl ${
                          scheduleStore.newItem.type.get() === type
                            ? typeColors[type].bg
                            : 'bg-gray-100 dark:bg-gray-700'
                        }`}
                      >
                        <Text
                          className={`${
                            scheduleStore.newItem.type.get() === type
                              ? typeColors[type].text
                              : 'text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {type}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>

              {/* Priority Selection */}
              <View>
                <Text className="text-sm font-plregular text-gray-700 dark:text-gray-300 mb-2">
                  Priority
                </Text>
                <View className="flex-row gap-2">
                  {PRIORITY_LEVELS.map((priority) => (
                    <TouchableOpacity
                      key={priority}
                      onPress={() => scheduleStore.newItem.priority.set(priority)}
                      className={`flex-1 p-3 rounded-xl border ${
                        scheduleStore.newItem.priority.get() === priority
                          ? `${priorityColors[priority].light} ${priorityColors[priority].border}`
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <Text
                        className={`text-center font-medium ${
                          scheduleStore.newItem.priority.get() === priority
                            ? priorityColors[priority].text
                            : 'text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {priority}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Energy Level Selection */}
              <View>
                <Text className="text-sm font-plregular text-gray-700 dark:text-gray-300 mb-2">
                  Energy Level
                </Text>
                <View className="flex-row gap-2">
                  {['Low', 'Medium', 'High'].map((energy) => (
                    <TouchableOpacity
                      key={energy}
                      onPress={() => scheduleStore.newItem.energy.set(energy as 'Low' | 'Medium' | 'High')}
                      className={`flex-1 p-3 rounded-xl ${
                        scheduleStore.newItem.energy.get() === energy
                          ? energyColors[energy as keyof typeof energyColors].light
                          : 'bg-gray-100 dark:bg-gray-700'
                      }`}
                    >
                      <Text
                        className={`text-center font-medium ${
                          scheduleStore.newItem.energy.get() === energy
                            ? energyColors[energy as keyof typeof energyColors].text
                            : 'text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {energy}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Date/Time Selection */}
              <View>
                <Text className="text-sm font-plregular text-gray-700 dark:text-gray-300 mb-2">
                  Start Time
                </Text>
                <TouchableOpacity
                  className="bg-gray-100 dark:bg-gray-700 p-4 rounded-xl"
                >
                  <Text className="text-gray-900 dark:text-white">
                    {format(scheduleStore.newItem.startDate.get() || new Date(), 'PPP p')}
                  </Text>
                </TouchableOpacity>
              </View>

              <View>
                <Text className="text-sm font-plregular text-gray-700 dark:text-gray-300 mb-2">
                  Duration (minutes)
                </Text>
                <TextInput
                  className="bg-gray-100 dark:bg-gray-700 p-4 rounded-xl text-gray-900 dark:text-white"
                  placeholder="Enter duration..."
                  value={scheduleStore.newItem.duration.get()?.toString()}
                  onChangeText={(text) => scheduleStore.newItem.duration.set(parseInt(text) || 30)}
                  keyboardType="numeric"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              {/* Recurrence Pattern */}
              <View>
                <Text className="text-sm font-plregular text-gray-700 dark:text-gray-300 mb-2">
                  Recurrence
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View className="flex-row gap-2 py-2">
                    {RECURRENCE_PATTERNS.map((pattern) => (
                      <TouchableOpacity
                        key={pattern}
                        onPress={() => scheduleStore.newItem.recurrence.set(pattern)}
                        className={`px-4 py-2 rounded-xl ${
                          scheduleStore.newItem.recurrence.get() === pattern
                            ? 'bg-teal-100 dark:bg-teal-900/30'
                            : 'bg-gray-100 dark:bg-gray-700'
                        }`}
                      >
                        <Text
                          className={`${
                            scheduleStore.newItem.recurrence.get() === pattern
                              ? 'text-teal-600 dark:text-teal-400'
                              : 'text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {pattern}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>

              {/* Location (Required for events) */}
              {isEvent && (
                <View>
                  <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Location *
                  </Text>
                  <TextInput
                    className="bg-gray-100 dark:bg-gray-700 p-4 rounded-xl text-gray-900 dark:text-white"
                    placeholder="Enter location..."
                    value={scheduleStore.newItem.location?.get() || ''}
                    onChangeText={(text) => scheduleStore.newItem.location?.set(text)}
                    placeholderTextColor="#9CA3AF"
                  />
                  {isEvent && !scheduleStore.newItem.location?.get() && (
                    <Text className="text-sm text-rose-500 mt-1">
                      Location is required for events
                    </Text>
                  )}
                </View>
              )}

              {/* Reminder Setting */}
              <View>
                <Text className="text-sm font-plregular text-gray-700 dark:text-gray-300 mb-2">
                  Reminder (minutes before)
                </Text>
                <View className="flex-row gap-2">
                  {[5, 15, 30, 60].map((minutes) => (
                    <TouchableOpacity
                      key={minutes}
                      onPress={() => scheduleStore.newItem.reminder.set(minutes)}
                      className={`flex-1 p-3 rounded-xl border ${
                        scheduleStore.newItem.reminder.get() === minutes
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <Text
                        className={`text-center font-medium ${
                          scheduleStore.newItem.reminder.get() === minutes
                            ? 'text-indigo-600 dark:text-indigo-400'
                            : 'text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {minutes}m
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Tags Input */}
              <View>
                <Text className="text-sm font-plregular text-gray-700 dark:text-gray-300 mb-2">
                  Tags (comma separated)
                </Text>
                <TextInput
                  className="bg-gray-100 dark:bg-gray-700 p-4 rounded-xl text-gray-900 dark:text-white"
                  placeholder="Enter tags..."
                  value={scheduleStore.newItem?.tags?.get()?.join(', ')}
                  onChangeText={(text) => {
                    const tags = text.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
                    scheduleStore.newItem.tags.set(tags)
                  }}
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              {/* Notes */}
              <View>
                <Text className="text-sm font-plregular text-gray-700 dark:text-gray-300 mb-2">
                  Notes
                </Text>
                <TextInput
                  className="bg-gray-100 dark:bg-gray-700 p-4 rounded-xl text-gray-900 dark:text-white min-h-[100px]"
                  placeholder="Enter any additional notes..."
                  value={scheduleStore.newItem.notes.get()}
                  onChangeText={(text) => scheduleStore.newItem.notes.set(text)}
                  placeholderTextColor="#9CA3AF"
                  multiline
                  textAlignVertical="top"
                />
              </View>
            </View>

            {/* Action Buttons */}
            <View className="flex-row gap-3 mt-6 mb-4">
              <TouchableOpacity
                onPress={resetForm}
                className="flex-1 bg-gray-100 dark:bg-gray-700 p-4 rounded-xl"
              >
                <Text className="text-center font-plregular text-gray-900 dark:text-white">
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleAddItem}
                className={`flex-1 p-4 rounded-xl ${
                  isFormValid() 
                    ? 'bg-violet-600' 
                    : 'bg-violet-300 dark:bg-violet-700'
                }`}
                disabled={!isFormValid()}
              >
                <Text className="text-center font-plregular text-white">
                  {scheduleStore.editingItem.get() ? 'Update' : 'Add'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  )
}

// Form validation function
const isFormValid = () => {
  const newItem = scheduleStore.newItem
  const isEvent = newItem.scheduleType.get() === 'event'
  
  const hasRequiredFields = 
    newItem?.title?.get()?.trim() !== '' &&
    newItem?.duration?.get()! > 0 &&
    newItem?.startDate?.get() !== null

  if (isEvent) {
    return hasRequiredFields && newItem.location?.get()?.trim() !== ''
  }

  return hasRequiredFields
}

export default observer(AddItem)