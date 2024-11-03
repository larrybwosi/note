import React, { useCallback, useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { format, addMinutes, differenceInMinutes, parseISO, formatDate } from 'date-fns'
import { Ionicons } from '@expo/vector-icons'
import { Memo, observer, useObservable } from '@legendapp/state/react'
import AddItem from 'src/components/add.item'
import { colorScheme as colorSchemeNW } from "nativewind"
import { currentTime } from "@legendapp/state/helpers/time"


import { Calendar } from 'react-native-calendars'
import DateTimePicker from '@react-native-community/datetimepicker'
import { ScheduleItem, scheduleStore } from 'src/storage/schedule'
import { confirmPostpone as confirmPostponeAction } from 'src/storage/schedule.modify'
import { ItemCard } from 'src/components/schedule.item'
import { useInterval } from "usehooks-ts"
import { createScheduleNotification } from 'src/utils/notifications'
import { testNotifications } from 'src/utils/test.notifications'

export default observer(function CalendarApp() {
  const [showPostponeModal, setShowPostponeModal] = useState(false)
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const time = useObservable(format(currentTime.get().getTime(), 'hh : mm '))
  const theme = colorSchemeNW.get()

  const notification = async() =>{
    console.log("notification")
    await testNotifications()
  }

  // notification()
  const items = scheduleStore.items.get()

  const updateCountdowns = useCallback(() => {
    scheduleStore.items.set(prevItems => prevItems.map(item => ({
      ...item,
      countdown: differenceInMinutes(item.startDate, new Date())
    })))
  }, [scheduleStore.items])

  const handlePostpone = (itemId: number) => {
    setSelectedItemId(itemId)
    setShowPostponeModal(true)
  }

  const confirmPostpone = () => {
    if (selectedItemId) {
      confirmPostponeAction(selectedItemId, setShowPostponeModal, setSelectedItemId)
    }
    setShowPostponeModal(false)
    setSelectedItemId(null)
    scheduleStore.postponeData.reason.set('')
    scheduleStore.postponeData.newDate.set(new Date())
  }


  useInterval(() => {
    time.set(format(currentTime.get().getTime(), 'hh : mm '))
    updateCountdowns()
  }, 1)
  

  const handleEditItem = (item: ScheduleItem) => {
    scheduleStore.editingItem.set(item)
  }

  const handleCompleteItem =(id:number)=>{

  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="px-4 py-6 bg-white dark:bg-gray-800 shadow-sm">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-2xl font-rbold text-gray-900 dark:text-white">
              My Schedule
            </Text>
            <Text className="text-lg font-rmedium text-blue-600 dark:text-blue-400">
              <Memo>{time}</Memo>
            </Text>
          </View>
          <View className="flex-row items-center gap-2">
            <View className="flex-row items-center">
              <Ionicons name="star" size={16} color="#FBBF24" />
              <Text className="ml-1 text-gray-600 dark:text-gray-300">
                5 day streak
              </Text>
            </View>
          </View>
        </View>

        {/* Calendar */}
        <View className="mx-4 mt-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          <Calendar
            current={currentTime.get().toISOString()}
            onMonthChange={(month:any) => currentTime.set(new Date(month.timestamp))}
            onDayPress={(day:any) => currentTime.set(new Date(day.timestamp))}
            onDayLongPress={(day:any) => currentTime.set(new Date(day.timestamp))}
            theme={{
              backgroundColor: theme === 'dark' ? '#1F2937' : '#4b5563',
              calendarBackground: theme === 'dark' ? '#1F2937' : '#FFFFFF',
              textSectionTitleColor: theme === 'dark' ? '#E5E7EB' : '#374151',
              selectedDayBackgroundColor: '#2563EB',
              selectedDayTextColor: '#FFFFFF',
              todayTextColor: '#2563EB',
              dayTextColor: theme === 'dark' ? '#E5E7EB' : '#374151',
              textDisabledColor: theme === 'dark' ? '#6B7280' : '#9CA3AF',
              dotColor: '#2563EB',
              selectedDotColor: '#FFFFFF',
              arrowColor: '#2563EB',
              monthTextColor: theme === 'dark' ? '#E5E7EB' : '#374151',
              textDayFontFamily: 'roboto-bold',
              textMonthFontFamily: 'roboto-bold',
              textDayHeaderFontFamily: 'roboto-bold',
              textDayFontWeight: '400',
              textDayHeaderFontWeight: '600',
              textDayFontSize: 16,
              textMonthFontSize: 16,
              textDayHeaderFontSize: 14,
            }}
          />
        </View>

        {/* Tasks & Events List */}
        <View className="mx-4 mt-4">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-rmedium text-gray-900 dark:text-white">
              Today's Schedule
            </Text>
            <TouchableOpacity
              className="bg-blue-600 p-3 rounded-full shadow-lg shadow-blue-600/30"
              onPress={() => scheduleStore.isAddingItem.set(true)}
            >
              <Ionicons name="add" size={24} color="white" />
            </TouchableOpacity>
          </View>
           {items.map((item, index) => (
              <ItemCard
                key={item.id}
                item={item}
                onComplete={handleCompleteItem}
                onPostpone={handlePostpone}
                handlePostpone={handlePostpone}
                theme={theme as 'light' | 'dark'}
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
            <Text className="text-xl font-plregular text-gray-900 dark:text-white mb-4">
              Postpone Item
            </Text>
            
            <Text className="text-sm font-rmedium text-gray-700 dark:text-gray-300 mb-2">
              New Date & Time
            </Text>
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              className="bg-gray-100 dark:bg-gray-700 p-4 rounded-xl mb-4"
            >
              <Text className="text-gray-900 dark:text-white">
                {format(scheduleStore.postponeData.newDate.get(), 'PPP p')}
              </Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={scheduleStore.postponeData.newDate.get()}
                mode="datetime"
                display="spinner"
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false)
                  if (selectedDate) {
                    scheduleStore.postponeData.newDate.set(selectedDate)
                  }
                }}
              />
            )}

            <Text className="text-sm font-rregular text-gray-700 dark:text-gray-300 mb-2">
              Reason for Postponement
            </Text>
            <TextInput
              className="bg-gray-100 dark:bg-gray-700 p-4 rounded-xl mb-6 text-gray-900 dark:text-white"
              placeholder="Enter reason..."
              value={scheduleStore.postponeData.reason.get()}
              onChangeText={(text) => scheduleStore.postponeData.reason.set(text)}
              multiline
              numberOfLines={3}
              placeholderTextColor="#9CA3AF"
            />

           <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setShowPostponeModal(false)}
                className="flex-1 bg-gray-100 dark:bg-gray-700 p-4 rounded-xl"
              >
                <Text className="text-center font-plregular text-gray-900 dark:text-white">
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={confirmPostpone}
                className="flex-1 bg-blue-600 p-4 rounded-xl"
                disabled={!scheduleStore.postponeData.reason.get()}
              >
                <Text className="text-center font-plregular text-white">
                  Confirm
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add/Edit Item Modal */}
      <AddItem/>
    </SafeAreaView>
  )
})
