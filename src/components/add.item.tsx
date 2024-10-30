import { observer } from "@legendapp/state/react"
import { format } from "date-fns"
import { Text } from "react-native"
import { Modal, TextInput, TouchableOpacity, View } from "react-native"
import Animated, { SlideInRight, SlideOutLeft } from "react-native-reanimated"


interface Props {
  state$: any
  handleAddItem:any
  priorityColors: any
  setShowDatePicker: any
}
const AddItem =({
    state$, 
    handleAddItem,
    priorityColors,
    setShowDatePicker
  }: Props) =>{
  return(
    <Modal
      visible={state$.isAddingItem.get()}
      transparent
      animationType="slide"
      onRequestClose={() => state$.isAddingItem.set(false)}
    >
      <View className="flex-1 justify-end bg-black/50">
        <Animated.View 
          entering={SlideInRight}
          exiting={SlideOutLeft}
          className="bg-white dark:bg-gray-800 rounded-t-3xl p-6"
        >
          <Text className="text-xl font-rbold text-gray-900 dark:text-white mb-4">
            {state$.editingItem.get() ? 'Edit Item' : 'Add New Item'}
          </Text>

          <View className="space-y-4">
            <View>
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Name
              </Text>
              <TextInput
                className="bg-gray-100 dark:bg-gray-700 p-4 rounded-xl text-gray-900 dark:text-white"
                placeholder="Enter name..."
                value={state$.newItem.name.get()}
                onChangeText={(text) => state$.newItem.name.set(text)}
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View>
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Type
              </Text>
              <View className="flex-row gap-3">
                {['task', 'event'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    onPress={() => state$.newItem.type.set(type as 'task' | 'event')}
                    className={`flex-1 p-4 rounded-xl border ${
                      state$.newItem.type.get() === type
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <Text
                      className={`text-center font-medium ${
                        state$.newItem.type.get() === type
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View>
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Priority
              </Text>
              <View className="flex-row gap-2">
                {['low', 'medium', 'high'].map((priority) => (
                  <TouchableOpacity
                    key={priority}
                    onPress={() => state$.newItem.priority.set(priority as 'low' | 'medium' | 'high')}
                    className={`flex-1 p-3 rounded-xl border ${
                      state$.newItem.priority.get() === priority
                        ? `${priorityColors[priority as 'low' | 'medium' | 'high'].light} border-${
                            priorityColors[priority as 'low' | 'medium' | 'high'].text
                          }`
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <Text
                      className={`text-center font-medium ${
                        state$.newItem.priority.get() === priority
                          ? priorityColors[priority as 'low' | 'medium' | 'high'].text
                          : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View>
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Start Time
              </Text>
              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                className="bg-gray-100 dark:bg-gray-700 p-4 rounded-xl"
              >
                <Text className="text-gray-900 dark:text-white">
                  {format(state$.newItem.startDate.get(), 'PPP p')}
                </Text>
              </TouchableOpacity>
            </View>

            <View>
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Duration (minutes)
              </Text>
              <TextInput
                className="bg-gray-100 dark:bg-gray-700 p-4 rounded-xl text-gray-900 dark:text-white"
                placeholder="Enter duration..."
                value={state$.newItem.duration.get().toString()}
                onChangeText={(text) => state$.newItem.duration.set(parseInt(text) || 30)}
                keyboardType="numeric"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {state$.newItem.type.get() === 'event' && (
              <View>
                <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Location (optional)
                </Text>
                <TextInput
                  className="bg-gray-100 dark:bg-gray-700 p-4 rounded-xl text-gray-900 dark:text-white"
                  placeholder="Enter location..."
                  value={state$.newItem.location?.get() || ''}
                  onChangeText={(text) => state$.newItem.location?.set(text)}
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            )}
          </View>

          <View className="flex-row gap-3 mt-6">
            <TouchableOpacity
              onPress={() => state$.isAddingItem.set(false)}
              className="flex-1 bg-gray-100 dark:bg-gray-700 p-4 rounded-xl"
            >
              <Text className="text-center font-medium text-gray-900 dark:text-white">
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleAddItem}
              className="flex-1 bg-blue-600 p-4 rounded-xl"
              disabled={!state$.newItem.name.get()}
            >
              <Text className="text-center font-medium text-white">
                {state$.editingItem.get() ? 'Update' : 'Add'}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  )
}

export default observer(AddItem)