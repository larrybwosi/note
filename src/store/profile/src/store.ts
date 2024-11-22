import { observable } from '@legendapp/state';
import { ObservablePersistMMKV } from '@legendapp/state/persist-plugins/mmkv';
import { synced } from '@legendapp/state/sync';
import { format } from 'date-fns';
import { Profile, ProfileSchema, HealthStore, HealthStoreSchema } from './types';

const initialProfile: Profile = {
  personalInfo: {
    name: 'Jane Doe',
    email: 'jane@example.com',
    dateOfBirth: format(new Date(), 'yyyy-MM-dd'),
    height: 165,
    weight: 60,
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
    notifications: {
      reminders: true,
      waterReminder: true,
      exerciseReminder: true,
      sleepReminder: true,
    },
    gradient: {
      startColor: '#4F46E5',
      endColor: '#7C3AED',
    },
  },
};

const initialHealthStore: HealthStore = {
  workouts: {},
  exercises: {},
  meals: {},
  sleep: {},
  vitals: {},
  goals: {
    daily_calories: 2000,
    daily_protein: 150,
    daily_steps: 10000,
    weekly_workouts: 4,
  },
  settings: {
    units: 'metric',
    notifications_enabled: true,
    reminder_times: ['07:00', '12:00', '18:00'],
  },
};

export const profileStore = observable(
  synced<Profile>({
    initial: ProfileSchema.parse(initialProfile),
    persist: {
      name: 'profile',
      plugin: ObservablePersistMMKV,
    },
  })
);

export const healthStore = observable(
  synced<HealthStore>({
    initial: HealthStoreSchema.parse(initialHealthStore),
    persist: {
      name: 'health',
      plugin: ObservablePersistMMKV,
    },
  })
);
