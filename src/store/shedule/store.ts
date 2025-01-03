import { observable } from '@legendapp/state';
import { ObservablePersistMMKV } from '@legendapp/state/persist-plugins/mmkv';
import { synced } from '@legendapp/state/sync';
import { addMinutes, format } from 'date-fns';
import { ScheduleItem, ScheduleStore } from './types';

const initialSheduleState: ScheduleItem[] = [
];

export const sheduleStore = observable(
  synced<ScheduleStore>({
    initial: {
      currentDate: new Date(),
      currentTime: format(new Date(), 'HH:mm'),
      items: initialSheduleState,
      deletedItems: [],
      completedItems: [],
      filteredItems: [],
      selectedItem: null,
      isAddingItem: false,
      isPostponing: false,
      editingItem: null,
      newItem: {
        title: '',
        type: 'Work',
        priority: 'Medium',
        recurrence: 'None',
        duration: 30,
        tags: [],
        postponements: [],
        scheduleType: 'task',
      },
      postponeData: {
        itemId: null,
        reason: '',
        reasonCategory: 'Other',
        newDate: addMinutes(new Date(), 60),
        impact: 'Low',
      },
      performance: {
        completionRate: 85,
        postponementRate: 15,
        averageDelay: 12,
        streakDays: 5,
        focusTime: 240,
        productiveHours: ['09:00', '10:00', '14:00', '15:00'],
      },
      settings: {
        workingHours: {
          start: '09:00',
          end: '17:00',
        },
        breakDuration: 15,
        focusSessionDuration: 45,
        theme: 'light',
        notifications: true,
        autoScheduleBreaks: true,
      },
      view: 'day',
      showCompleted: false,
    },
    persist: {
      name: 'schedule',
      plugin: ObservablePersistMMKV,
    },
  })
);
