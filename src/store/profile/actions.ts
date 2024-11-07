import { useComputed, useSelector } from "@legendapp/state/react";
import { ObservablePrimitive } from "@legendapp/state";
import { Profile } from "./types";
import { profileStore } from "./store";

interface ProfileMetrics {
  personalInfo: Profile['personalInfo'];
  healthMetrics: Profile['healthMetrics'];
  productivityMetrics: Profile['productivityMetrics'];
  bmi: number;
}

interface ProfileActions {
  updatePersonalInfo: (key: keyof Profile['personalInfo'], value: string | number) => void;
  updateSchedule: (key: keyof Profile['productivityMetrics']['schedule'], value: string | number) => void
  addWaterIntake: (amount: number) => void;
  updateSleep: (averageHours: number) => void;
  updateExercise: (minutes: number) => void;
  updateFocusTime: (minutes: number) => void;
  toggleHabit: (index: number) => void;
  resetDailyMetrics: () => void;
  resetWeeklyMetrics: () => void;
}

export function useProfile(): ProfileMetrics & ProfileActions {
  // Memoized selectors for better performance
  const personalInfo = useSelector(() => profileStore.personalInfo.get());
  const healthMetrics = useSelector(() => profileStore.healthMetrics.get());
  const productivityMetrics = useSelector(() => profileStore.productivityMetrics.get());

  // Computed values with memoization
  const bmi = useComputed(() => {
    const height = profileStore.personalInfo.height.get() / 100;
    const weight = profileStore.personalInfo.weight.get();
    return height > 0 ? Number((weight / (height * height)).toFixed(1)) : 0;
  });

  // Type-safe utility functions
  const updatePersonalInfo = (key: keyof Profile['personalInfo'], value: string | number) => {
    if (typeof value === 'string' && (key === 'name' || key === 'email' || key === 'dateOfBirth')) {
      (profileStore.personalInfo[key] as ObservablePrimitive<string>).set(value);
    } else if (typeof value === 'number' && (key === 'height' || key === 'weight')) {
      (profileStore.personalInfo[key] as ObservablePrimitive<number>).set(value);
    }
  };

  const addWaterIntake = (amount: number) => {
    if (amount > 0) {
      profileStore.healthMetrics.waterIntake.daily.current.set(
        current => Math.min(current + amount, profileStore.healthMetrics.waterIntake.daily.goal.get())
      );
    }
  };

  const updateSchedule = (key: keyof Profile['productivityMetrics']['schedule'], value: string | number) => {

  }

  const updateSystem = (key: keyof Profile['systemSettings'], value: string | boolean) => {
  if (typeof value === 'string' && (key === 'theme' || key === 'accentColor')) {
    (profileStore.systemSettings[key] as ObservablePrimitive<string>).set(value);
  } else if (typeof value === 'boolean' && (key === 'reminders' || key === 'waterReminder' || key === 'exerciseReminder' || key === 'sleepReminder')) {
    (profileStore.systemSettings.notifications[key] as ObservablePrimitive<boolean>).set(value);
  } else if (typeof value === 'string' && key === 'lastExportDate') {
    (profileStore.systemSettings.dataExport[key] as ObservablePrimitive<string>).set(value);
  } else if (typeof value === 'string' && (key === 'startColor' || key === 'endColor')) {
    (profileStore.systemSettings.gradient[key] as ObservablePrimitive<string>).set(value);
  }
  }

  const updateSleep = (averageHours: number) => {
    if (averageHours >= 0 && averageHours <= 24) {
      profileStore.healthMetrics.sleep.averageHours.set(averageHours);
    }
  };

  const updateExercise = (minutes: number) => {
    if (minutes > 0) {
      profileStore.healthMetrics.exercise.weeklyProgress.set(
        progress => progress + minutes
      );
    }
  };

  const updateFocusTime = (minutes: number) => {
    if (minutes > 0) {
      profileStore.productivityMetrics.focusTime.daily.current.set(
        current => Math.min(current + minutes, profileStore.productivityMetrics.focusTime.daily.goal.get())
      );
    }
  };

  const toggleHabit = (index: number) => {
    const habits = profileStore.productivityMetrics.habits;
    if (index >= 0 && index < habits.length) {
      habits[index].completed.toggle();
    }
  };

  const resetDailyMetrics = () => {
    profileStore.healthMetrics.waterIntake.daily.current.set(0);
    profileStore.productivityMetrics.focusTime.daily.current.set(0);
    profileStore.productivityMetrics.habits.forEach((habit, index) => {
      if (habit.frequency.get() === 'daily') {
        profileStore.productivityMetrics.habits[index].completed.set(false);
      }
    });
  };

  const resetWeeklyMetrics = () => {
    profileStore.healthMetrics.exercise.weeklyProgress.set(0);
    profileStore.productivityMetrics.habits.forEach((habit, index) => {
      if (habit.frequency.get() === 'weekly') {
        profileStore.productivityMetrics.habits[index].completed.set(false);
      }
    });
  };

  return {
    personalInfo,
    healthMetrics,
    productivityMetrics,
    bmi: bmi.get(),
    updatePersonalInfo,
    addWaterIntake,
    updateSchedule,
    updateSleep,
    updateExercise,
    updateFocusTime,
    toggleHabit,
    resetDailyMetrics,
    resetWeeklyMetrics,
  };
}

// utils/validators.ts
export const validators = {
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  isValidHeight: (height: number): boolean => {
    return height > 0 && height < 300; // Max height in cm
  },

  isValidWeight: (weight: number): boolean => {
    return weight > 0 && weight < 500; // Max weight in kg
  },

  isValidWaterIntake: (amount: number): boolean => {
    return amount > 0 && amount <= 5000; // Max 5L per addition
  },

  isValidSleepHours: (hours: number): boolean => {
    return hours >= 0 && hours <= 24;
  },

  isValidExerciseMinutes: (minutes: number): boolean => {
    return minutes > 0 && minutes <= 480; // Max 8 hours per session
  },

  isValidFocusMinutes: (minutes: number): boolean => {
    return minutes > 0 && minutes <= 480; // Max 8 hours per session
  },
};