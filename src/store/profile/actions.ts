import { useComputed } from "@legendapp/state/react";
import { ObservablePrimitive } from "@legendapp/state";
import { Profile } from "./types";
import { profileStore } from "./store";

const validators = {
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


interface ProfileMetrics {
  personalInfo: Profile['personalInfo'];
  healthMetrics: Profile['healthMetrics'];
  productivityMetrics: Profile['productivityMetrics'];
  bmi: number;
}

interface ProfileActions {
  updatePersonalInfo: (key: keyof Profile['personalInfo'], value: string | number) => void;
  updateSchedule: (key: keyof Profile['productivityMetrics']['schedule'], value: Date | number) => void;
  addWaterIntake: (amount: number) => void;
  updateSleep: (averageHours: number) => void;
  updateExercise: (minutes: number) => void;
  updateFocusTime: (minutes: number) => void;
  toggleHabit: (index: number) => void;
}

export function useProfile(): ProfileMetrics & ProfileActions {
  const personalInfo = profileStore.personalInfo.get();
  const healthMetrics = profileStore.healthMetrics.get();
  const productivityMetrics = profileStore.productivityMetrics.get();

  const bmi = useComputed(() => {
    const height = profileStore.personalInfo.height.get() / 100;
    const weight = profileStore.personalInfo.weight.get();
    return height > 0 ? Number((weight / (height * height)).toFixed(1)) : 0;
  });

  const updatePersonalInfo = (key: keyof Profile['personalInfo'], value: string | number) => {
    if (typeof value === 'string' && (key === 'name' || key === 'email' || key === 'dateOfBirth')) {
      if (key === 'email' && !validators.isValidEmail(value)) return;
      (profileStore.personalInfo[key] as ObservablePrimitive<string>).set(value);
    } else if (typeof value === 'number' && (key === 'height' || key === 'weight')) {
      if (key === 'height' && !validators.isValidHeight(value)) return;
      if (key === 'weight' && !validators.isValidWeight(value)) return;
      (profileStore.personalInfo[key] as ObservablePrimitive<number>).set(value);
    }
  };

  const updateSchedule = (key: keyof Profile['productivityMetrics']['schedule'], value: Date | number) => {
    if (value instanceof Date && (key === 'workStartTime' || key === 'workEndTime')) {
      (profileStore.productivityMetrics.schedule[key] as ObservablePrimitive<Date>).set(value);
    } else if (typeof value === 'number' && key === 'breakDuration') {
      profileStore.productivityMetrics.schedule.breakDuration.set(value);
    }
  };

  const addWaterIntake = (amount: number) => {
    if (validators.isValidWaterIntake(amount)) {
      profileStore.healthMetrics.waterIntake.daily.current.set(
        current => Math.min(current + amount, profileStore.healthMetrics.waterIntake.daily.goal.get())
      );
    }
  };

  const updateSleep = (averageHours: number) => {
    if (validators.isValidSleepHours(averageHours)) {
      profileStore.healthMetrics.sleep.averageHours.set(averageHours);
    }
  };

  const updateExercise = (minutes: number) => {
    if (validators.isValidExerciseMinutes(minutes)) {
      profileStore.healthMetrics.exercise.weeklyProgress.set(
        progress => progress + minutes
      );
    }
  };

  const updateFocusTime = (minutes: number) => {
    if (validators.isValidFocusMinutes(minutes)) {
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

  return {
    personalInfo,
    healthMetrics,
    productivityMetrics,
    bmi: bmi.get(),
    updatePersonalInfo,
    updateSleep,
    updateSchedule,
    addWaterIntake,
    updateExercise,
    updateFocusTime,
    toggleHabit,
  };
}

