import { observable } from '@legendapp/state';
import { ObservablePersistMMKV } from '@legendapp/state/persist-plugins/mmkv';
import { synced } from '@legendapp/state/sync';
import { format } from 'date-fns';
import { Profile } from './types';

const initialProfile: Profile = {
  personalInfo: {
    name: 'Jane Doe',
    email: 'jane@dealio.com',
    dateOfBirth: format(new Date(), 'dd MM yyyy'),
    height: 0,
    weight: 0,
    image: 'https://via.placeholder.com/150',
  },
  healthMetrics: {
    waterIntake: {
      daily: {
        goal: 2000,
        current: 0,
      },
    },
    sleep: {
      averageHours: 0,
      goal: 8,
    },
    exercise: {
      weeklyGoal: 150,
      weeklyProgress: 0,
    },
  },
  productivityMetrics: {
    focusTime: {
      daily: {
        goal: 240,
        current: 0,
      },
    },
    habits: [
      { name: 'Meditate', frequency: 'daily', completed: false },
      { name: 'Read', frequency: 'daily', completed: false },
      { name: 'Exercise', frequency: 'weekly', completed: false },
    ],
    schedule: {
      workStartTime: new Date('2024-01-01T08:00:00'),
      workEndTime: new Date('2024-01-01T17:00:00'),
      breakDuration: 30,
    },
  },
  systemSettings: {
    theme: 'system',
    accentColor: 'indigo',
    gradient: {
      startColor: '#4F46E5',
      endColor: '#7C3AED',
    },
    notifications: {
      reminders: true,
      waterReminder: true,
      exerciseReminder: true,
      sleepReminder: true,
    }
  }
};

export const profileStore = observable(
  synced<Profile>({
    initial: initialProfile,
    persist: {
      name: 'profile',
      plugin: ObservablePersistMMKV,
    },
  })
);
