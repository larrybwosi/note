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

