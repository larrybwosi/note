import { observable } from '@legendapp/state';
import { ObservablePersistMMKV } from '@legendapp/state/persist-plugins/mmkv';
import { synced } from '@legendapp/state/sync';
import { addMinutes, format } from 'date-fns';
import { ScheduleItem, ScheduleStore } from './types';

const initialScheduleState: ScheduleItem[] = [
  {
    id: 1,
    title: 'Team Strategy Meeting',
    description: 'Quarterly planning session with department heads',
    type: 'Work',
    startDate: addMinutes(new Date(), 60),
    endDate: addMinutes(new Date(), 120),
    duration: 60,
    priority: 'High',
    recurrence: 'None',
    location: 'Conference Room A',
    completed: false,
    inProgress: false,
    estimatedDuration: 60,
    postponements: [],
    tags: ['planning', 'quarterly', 'team'],
    notes: 'Prepare quarterly metrics',
    scheduleType: 'event',
    reminder: 15,
  },
  {
    id: 2,
    title: 'Workout Session',
    description: 'High-intensity interval training',
    type: 'Health',
    startDate: addMinutes(new Date(), 180),
    endDate: addMinutes(new Date(), 240),
    duration: 60,
    priority: 'Medium',
    recurrence: 'Daily',
    location: 'Gym',
    completed: false,
    inProgress: false,
    estimatedDuration: 60,
    postponements: [],
    tags: ['exercise', 'health', 'routine'],
    notes: 'Remember to bring workout gear',
    reminder: 15,
    scheduleType: 'task',
  },
];

export const scheduleStore = observable(
  synced<ScheduleStore>({
    initial: {
      currentDate: new Date(),
      currentTime: format(new Date(), 'HH:mm'),
      items: initialScheduleState,
      deletedItems: [], // New array for deleted items
      completedItems: [], // New array for completed items
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
