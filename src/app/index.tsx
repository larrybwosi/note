import React, { useEffect, useCallback, useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { format, addMinutes, differenceInMinutes, parseISO } from 'date-fns'
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated'
import { Ionicons } from '@expo/vector-icons'
import { observer, useObservable } from '@legendapp/state/react'
import AddItem from 'src/components/add.item'
import { ItemCard } from 'src/components/schedule.item'
// import { Calendar } from 'react-native-calendars'
// import DateTimePicker from '@react-native-community/datetimepicker'

const priorityColors = {
  low: {
    bg: "bg-emerald-500",
    text: "text-emerald-500",
    light: "bg-emerald-100",
  },
  medium: {
    bg: "bg-amber-500",
    text: "text-amber-500",
    light: "bg-amber-100",
  },
  high: {
    bg: "bg-rose-500",
    text: "text-rose-500",
    light: "bg-rose-100",
  }
}

interface Item {
  id: number
  name: string
  startDate: Date
  duration: number
  priority: 'low' | 'medium' | 'high'
  completed: boolean
  type: 'task' | 'event'
  location?: string
  postponements?: {
    date: Date
    reason: string
  }[]
}

const PriorityBadge = ({ priority }: { priority: 'low' | 'medium' | 'high' }) => (
  <View className={`px-2 py-1 rounded-full ${priorityColors[priority].light}`}>
    <Text className={`text-xs font-medium ${priorityColors[priority].text}`}>
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </Text>
  </View>
)

export default observer(function CalendarApp() {
  const [showPostponeModal, setShowPostponeModal] = useState(false)
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null)
  const [showDatePicker, setShowDatePicker] = useState(false)

  const state$ = useObservable({
    date: new Date(),
    currentTime: '',
    items: [
      { id: 1, name: 'Team Meeting', startDate: addMinutes(new Date(), 120), duration: 60, priority: 'medium', completed: false, type: 'event', location: 'Conference Room A', postponements: [] },
      { id: 2, name: 'Project Deadline', startDate: addMinutes(new Date(), 420), duration: 30, priority: 'high', completed: false, type: 'task', postponements: [] },
      { id: 3, name: 'Lunch Break', startDate: addMinutes(new Date(), 270), duration: 60, priority: 'low', completed: false, type: 'event', location: 'Cafeteria', postponements: [] },
      { id: 4, name: 'Drink Water', startDate: addMinutes(new Date(), 30), duration: 5, priority: 'medium', completed: false, type: 'task', postponements: [] },
    ],
    editingItem: null as Item | null,
    isAddingItem: false,
    newItem: {
      name: '',
      startDate: new Date(),
      duration: 30,
      priority: 'medium' as 'low' | 'medium' | 'high',
      type: 'task' as 'task' | 'event',
      location:''
    },
    postponeData: {
      reason: '',
      newDate: new Date(),
    },
    theme: 'light',
    streak: 5,
  })

  const updateCountdowns = useCallback(() => {
    state$.items.set(prevItems => prevItems.map(item => ({
      ...item,
      countdown: differenceInMinutes(item.startDate, new Date())
    })))
  }, [state$.items])

  useEffect(() => {
    const timer = setInterval(() => {
      state$.currentTime.set(format(new Date(), 'HH:mm:ss'))
      updateCountdowns()
    }, 1000)
    return () => clearInterval(timer)
  }, [state$.currentTime, updateCountdowns])

  const handlePostpone = (itemId: number) => {
    setSelectedItemId(itemId)
    setShowPostponeModal(true)
  }

  // const confirmPostpone = () => {
  //   if (selectedItemId) {
  //     state$.items.set(items => items.map(item => {
  //       if (item.id === selectedItemId) {
  //         return {
  //           ...item,
  //           startDate: state$.postponeData.newDate.get(),
  //           postponements: [
  //             ...(item.postponements || []),
  //             {
  //               date: state$.postponeData.newDate.get(),
  //               reason: state$.postponeData.reason.get()
  //             }
  //           ]
  //         }
  //       }
  //       return item
  //     }))
  //   }
  //   setShowPostponeModal(false)
  //   setSelectedItemId(null)
  //   state$.postponeData.reason.set('')
  //   state$.postponeData.newDate.set(new Date())
  // }

  const handleAddItem = () => {
    const newId = Math.max(...state$.items.get().map(i => i.id), 0) + 1
    state$.items.push({ 
      ...state$.newItem.get(), 
      id: newId, 
      completed: false,
      postponements: []
    })
    state$.isAddingItem.set(false)
    state$.newItem.set({
      name: '',
      startDate: new Date(),
      duration: 30,
      priority: 'medium',
      type: 'task',
      location:''
    })
  }

  const handleDeleteItem = (id: number) => {
    state$.items.set(prevItems => prevItems.filter(item => item.id !== id))
  } 

  const handleEditItem = (item: Item) => {
    state$.editingItem.set(item)
  }

  const confirmPostpone = () => {

  }

  const handleCompleteItem =(id:number)=>{

  }

  const renderItemCard = (item: Item) => (
    <Animated.View
      key={item.id}
      entering={FadeIn.duration(400)}
      exiting={FadeOut.duration(300)}
      layout={LinearTransition.springify()}
      className={`p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm mb-3 border border-gray-100 dark:border-gray-700
        ${item.completed ? 'opacity-50' : ''}`}
    >
      <View className="flex-row justify-between items-start">
        <View className="flex-1">
          <View className="flex-row items-center gap-2 mb-1">
            <PriorityBadge priority={item.priority} />
            <Text className="text-xs text-gray-500 dark:text-gray-400">
              {item.type.toUpperCase()}
            </Text>
          </View>
          <Text className={`text-lg font-rmedium text-gray-800 dark:text-white mb-1 ${item.completed ? 'line-through' : ''}`}>
            {item.name}
          </Text>
          {item.location && (
            <View className="flex-row items-center gap-1 mb-1">
              <Ionicons name="location" size={14} color="#6B7280" />
              <Text className="text-sm font-rregular text-gray-500 dark:text-gray-400">{item.location}</Text>
            </View>
          )}
        </View>
        <Text className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {format(item.startDate, 'HH:mm')}
        </Text>
      </View>

      <View className="flex-row justify-between items-center mt-3">
        <View className="flex-row items-center gap-2">
          <TouchableOpacity 
            onPress={() => handlePostpone(item.id)}
            className="bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-full"
          >
            <Text className="text-blue-600 font-rregular dark:text-blue-400 text-sm">Postpone</Text>
          </TouchableOpacity>
          {item.postponements && item.postponements.length > 0 && (
            <Text className="text-xs text-gray-500 dark:text-gray-400">
              Postponed {item.postponements.length}x
            </Text>
          )}
        </View>
        <View className="flex-row gap-2">
          <TouchableOpacity 
            onPress={() => handleCompleteItem(item.id)}
            className="bg-emerald-50 dark:bg-emerald-900/30 w-8 h-8 rounded-full items-center justify-center"
          >
            <Ionicons name="checkmark" size={18} color="#059669" />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => handleDeleteItem(item.id)}
            className="bg-rose-50 dark:bg-rose-900/30 w-8 h-8 rounded-full items-center justify-center"
          >
            <Ionicons name="trash" size={18} color="#E11D48" />
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  )
{/* <ItemCard
  key={item.id} 
  item={item} 
  onComplete={handleCompleteItem} 
  onDelete={handleDeleteItem} 
  onPostpone={handlePostpone}
  theme={state$.theme.get() as 'light' | 'dark'}
  customStyles={{}}
/> */}
  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <StatusBar style={state$.theme.get() === 'dark' ? 'light' : 'dark'} />
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="px-4 py-6 bg-white dark:bg-gray-800 shadow-sm">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-2xl font-rbold text-gray-900 dark:text-white">
              My Schedule
            </Text>
            <Text className="text-lg font-medium text-blue-600 dark:text-blue-400">
              {state$.currentTime.get()}
            </Text>
          </View>
          <View className="flex-row items-center gap-2">
            <View className="flex-row items-center">
              <Ionicons name="star" size={16} color="#FBBF24" />
              <Text className="ml-1 text-gray-600 dark:text-gray-300">
                {state$.streak.get()} day streak
              </Text>
            </View>
          </View>
        </View>

        {/* Calendar */}
        <View className="mx-4 mt-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          {/* <Calendar
            current={state$.date.get().toISOString()}
            onDayPress={(day) => state$.date.set(new Date(day.timestamp))}
            theme={{
              backgroundColor: state$.theme.get() === 'dark' ? '#1F2937' : '#FFFFFF',
              calendarBackground: state$.theme.get() === 'dark' ? '#1F2937' : '#FFFFFF',
              textSectionTitleColor: state$.theme.get() === 'dark' ? '#E5E7EB' : '#374151',
              selectedDayBackgroundColor: '#2563EB',
              selectedDayTextColor: '#FFFFFF',
              todayTextColor: '#2563EB',
              dayTextColor: state$.theme.get() === 'dark' ? '#E5E7EB' : '#374151',
              textDisabledColor: state$.theme.get() === 'dark' ? '#6B7280' : '#9CA3AF',
              dotColor: '#2563EB',
              selectedDotColor: '#FFFFFF',
              arrowColor: '#2563EB',
              monthTextColor: state$.theme.get() === 'dark' ? '#E5E7EB' : '#374151',
              textDayFontFamily: 'System',
              textMonthFontFamily: 'System',
              textDayHeaderFontFamily: 'System',
              textDayFontWeight: '400',
              textMonthFontWeight: 'bold',
              textDayHeaderFontWeight: '600',
              textDayFontSize: 16,
              textMonthFontSize: 16,
              textDayHeaderFontSize: 14
            }}
          /> */}
        </View>

        {/* Tasks & Events List */}
        <View className="mx-4 mt-4">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-rmedium text-gray-900 dark:text-white">
              Today's Schedule
            </Text>
            <TouchableOpacity
              className="bg-blue-600 p-3 rounded-full shadow-lg shadow-blue-600/30"
              onPress={() => state$.isAddingItem.set(true)}
            >
              <Ionicons name="add" size={24} color="white" />
            </TouchableOpacity>
          </View>
          {state$.items.get().map((item)=>(
              <ItemCard
                key={item.id} 
                item={item as any} 
                onComplete={handleCompleteItem} 
                onDelete={handleDeleteItem} 
                onPostpone={handlePostpone}
                handlePostpone={handlePostpone}
                theme={state$.theme.get() as 'light' | 'dark'}
                customStyles={{cardBg:'bg-white dark:bg-gray-800 '}}
              />
            ))}

        </View>
      </ScrollView>

      {/* Postpone Modal */}
      <Modal
        visible={showPostponeModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPostponeModal(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white dark:bg-gray-800 rounded-t-3xl p-6">
            <Text className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Postpone Item
            </Text>
            
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              New Date & Time
            </Text>
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              className="bg-gray-100 dark:bg-gray-700 p-4 rounded-xl mb-4"
            >
              <Text className="text-gray-900 dark:text-white">
                {format(state$.postponeData.newDate.get(), 'PPP p')}
              </Text>
            </TouchableOpacity>

            {/* {showDatePicker && (
              <DateTimePicker
                value={state$.postponeData.newDate.get()}
                mode="datetime"
                display="spinner"
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false)
                  if (selectedDate) {
                    state$.postponeData.newDate.set(selectedDate)
                  }
                }}
              />
            )} */}

            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Reason for Postponement
            </Text>
            <TextInput
              className="bg-gray-100 dark:bg-gray-700 p-4 rounded-xl mb-6 text-gray-900 dark:text-white"
              placeholder="Enter reason..."
              value={state$.postponeData.reason.get()}
              onChangeText={(text) => state$.postponeData.reason.set(text)}
              multiline
              numberOfLines={3}
              placeholderTextColor="#9CA3AF"
            />

           <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setShowPostponeModal(false)}
                className="flex-1 bg-gray-100 dark:bg-gray-700 p-4 rounded-xl"
              >
                <Text className="text-center font-medium text-gray-900 dark:text-white">
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={confirmPostpone}
                className="flex-1 bg-blue-600 p-4 rounded-xl"
                disabled={!state$.postponeData.reason.get()}
              >
                <Text className="text-center font-medium text-white">
                  Confirm
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add/Edit Item Modal */}
      <AddItem 
        state$={state$}
        handleAddItem={handleAddItem}
        priorityColors={priorityColors}
        setShowDatePicker={setShowPostponeModal}
      />


      {/* Theme Toggle */}
      <TouchableOpacity
        className="absolute bottom-6 right-6 bg-white dark:bg-gray-800 p-4 rounded-full shadow-lg"
        onPress={() => state$.theme.set(state$.theme.get() === 'light' ? 'dark' : 'light')}
      >
        <Ionicons
          name={state$.theme.get() === 'light' ? 'moon' : 'sunny'}
          size={24}
          color={state$.theme.get() === 'light' ? '#374151' : '#E5E7EB'}
        />
      </TouchableOpacity>
    </SafeAreaView>
  )
})