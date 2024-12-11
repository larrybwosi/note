import { z } from 'zod';

// Enums and Constants
export const DIFFICULTY_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Elite'] as const;
export const INTENSITY_LEVELS = ['Low', 'Moderate', 'High', 'Very High'] as const;
export const SLEEP_QUALITY = ['Deep', 'Light', 'Disrupted', 'Insomnia'] as const;
export const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Pre-workout', 'Post-workout'] as const;

// Zod Schemas
export const DifficultyLevelSchema = z.enum(DIFFICULTY_LEVELS);
export const IntensityLevelSchema = z.enum(INTENSITY_LEVELS);
export const SleepQualityTypeSchema = z.enum(SLEEP_QUALITY);
export const MealTypeSchema = z.enum(MEAL_TYPES);

export const BaseEntrySchema = z.object({
  id: z.string(),
  date: z.string(),
  time: z.string(),
  notes: z.string().optional(),
});

export const MuscleGroupSchema = z.object({
  id: z.string(),
  name: z.string(),
  icon: z.string(),
  color: z.string(),
  relatedMuscles: z.array(z.string()),
});

export const ExerciseSchema = z.object({
  id: z.string(),
  name: z.string(),
  muscleGroups: z.array(MuscleGroupSchema),
  difficulty: DifficultyLevelSchema,
  equipment: z.array(z.string()).optional(),
  instructions: z.array(z.string()),
  videoUrl: z.string().url().optional(),
  calories_per_minute: z.number().positive(),
});

export const WorkoutSetSchema = BaseEntrySchema.extend({
  exerciseId: z.string(),
  reps: z.number().int().positive(),
  weight: z.number().positive().optional(),
  duration: z.number().positive().optional(),
  intensity: IntensityLevelSchema,
  restTime: z.number().positive().optional(),
  form_rating: z.number().min(1).max(10).optional(),
});

export const WorkoutSessionSchema = BaseEntrySchema.extend({
  title: z.string(),
  type: z.string(),
  duration: z.number().positive(),
  caloriesBurned: z.number().nonnegative(),
  intensity: IntensityLevelSchema,
  sets: z.array(WorkoutSetSchema),
  progress_photos: z.array(z.string().url()).optional(),
});

export const NutrientSchema = z.object({
  name: z.string(),
  amount: z.number().nonnegative(),
  unit: z.string(),
  percentDailyValue: z.number().nonnegative().optional(),
});

export const FoodItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  serving_size: z.number().positive(),
  serving_unit: z.string(),
  calories: z.number().nonnegative(),
  nutrients: z.array(NutrientSchema),
  tags: z.array(z.string()),
});

export const MealSchema = BaseEntrySchema.extend({
  type: MealTypeSchema,
  foods: z.array(z.object({
    foodItem: FoodItemSchema,
    servings: z.number().positive(),
  })),
  totalCalories: z.number().nonnegative(),
  photos: z.array(z.string().url()).optional(),
});

export const SleepEntrySchema = BaseEntrySchema.extend({
  duration: z.number().positive(),
  quality: SleepQualityTypeSchema,
  deep_sleep_duration: z.number().nonnegative().optional(),
  rem_sleep_duration: z.number().nonnegative().optional(),
  interruptions: z.number().nonnegative().optional(),
  sleep_score: z.number().min(0).max(100).optional(),
});

export const VitalStatsSchema = BaseEntrySchema.extend({
  weight: z.number().positive().optional(),
  body_fat_percentage: z.number().min(0).max(100).optional(),
  muscle_mass: z.number().positive().optional(),
  water_percentage: z.number().min(0).max(100).optional(),
  bone_mass: z.number().positive().optional(),
  bmi: z.number().positive().optional(),
  blood_pressure: z.object({
    systolic: z.number().positive(),
    diastolic: z.number().positive(),
  }).optional(),
  resting_heart_rate: z.number().positive().optional(),
  vo2_max: z.number().positive().optional(),
});

export const PersonalInfoSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  dateOfBirth: z.string(),
  image: z.string().url().optional(),
  height: z.number().positive(),
  weight: z.number().positive(),
  phone: z.string().optional(),
  address: z.string().optional(),
  gender: z.string().optional(),
  preferredLanguage: z.string().optional(),
  emergencyContact: z.object({
    name: z.string(),
    phone: z.string(),
  }).optional(),
  bloodType: z.string().optional(),
  allergies: z.array(z.string()).optional(),
  medicalNotes: z.string().optional(),
  sleepGoal: z.number().positive().optional(),
  waterIntake: z.number().positive().optional(),
  calorieGoal: z.number().positive().optional(),
  storedToken: z.string().optional(),
});

export const HealthMetricsSchema = z.object({
  waterIntake: z.object({
    daily: z.object({
      goal: z.number().positive(),
      current: z.number().nonnegative(),
    }),
  }),
  sleep: z.object({
    averageHours: z.number().nonnegative(),
    goal: z.number().positive(),
  }),
  exercise: z.object({
    weeklyGoal: z.number().positive(),
    weeklyProgress: z.number().nonnegative(),
  }),
  bodyFatPercentage: z.number().min(0).max(100).optional(),
  calorieTracking: z.object({
    dailyIntake: z.number().nonnegative(),
    dailyBurn: z.number().nonnegative(),
  }).optional(),
  heartRate: z.object({
    resting: z.number().positive(),
    active: z.number().positive(),
  }).optional(),
  bloodPressure: z.object({
    systolic: z.number().positive(),
    diastolic: z.number().positive(),
  }).optional(),
  stressLevel: z.number().min(0).max(10).optional(),
  customGoals: z.array(z.object({
    name: z.string(),
    target: z.string(),
    progress: z.number().nonnegative(),
  })).optional(),
});

export const ProductivityMetricsSchema = z.object({
  focusTime: z.object({
    daily: z.object({
      goal: z.number().positive(),
      current: z.number().nonnegative(),
    }),
  }),
  habits: z.array(z.object({
    name: z.string(),
    frequency: z.enum(['daily', 'weekly']),
    completed: z.boolean(),
  })),
  pomodoroSessions: z.object({
    goal: z.number().positive(),
    completed: z.number().nonnegative(),
  }).optional(),
  breakTime: z.object({
    total: z.number().nonnegative(),
  }).optional(),
  taskCompletionRate: z.number().min(0).max(100).optional(),
  projects: z.array(z.object({
    name: z.string(),
    tasksCompleted: z.number().nonnegative(),
    totalTasks: z.number().positive(),
  })).optional(),
  journaling: z.object({
    lastEntryDate: z.string(),
    entries: z.array(z.object({
      date: z.string(),
      content: z.string(),
    })),
  }).optional(),
  schedule: z.object({
    workStartTime: z.date().optional(),
    workEndTime: z.date().optional(),
    breakDuration: z.number().positive().optional(),
  }),
});

export const SystemSettingsSchema = z.object({
  notifications: z.object({
    reminders: z.boolean().optional(),
    waterReminder: z.boolean().optional(),
    exerciseReminder: z.boolean().optional(),
    sleepReminder: z.boolean().optional(),
  }),
  theme: z.enum(['light', 'dark', 'system']),
  dataExport: z.object({
    lastExportDate: z.string(),
  }).optional(),
  accentColor: z.string().optional(),
  gradient: z.object({
    startColor: z.string(),
    endColor: z.string(),
  }).optional(),
});

export const ProfileSchema = z.object({
  personalInfo: PersonalInfoSchema,
  healthMetrics: HealthMetricsSchema,
  productivityMetrics: ProductivityMetricsSchema,
  systemSettings: SystemSettingsSchema,
});

export const HealthStoreSchema = z.object({
  workouts: z.record(z.string(), WorkoutSessionSchema),
  exercises: z.record(z.string(), ExerciseSchema),
  meals: z.record(z.string(), MealSchema),
  sleep: z.record(z.string(), SleepEntrySchema),
  vitals: z.record(z.string(), VitalStatsSchema),
  goals: z.object({
    daily_calories: z.number().positive().optional(),
    daily_protein: z.number().positive().optional(),
    daily_steps: z.number().positive().optional(),
    weekly_workouts: z.number().positive().optional(),
    target_weight: z.number().positive().optional(),
    target_body_fat: z.number().min(0).max(100).optional(),
  }),
  settings: z.object({
    units: z.enum(['metric', 'imperial']),
    notifications_enabled: z.boolean(),
    reminder_times: z.array(z.string()).optional(),
  }),
});

// Inferred Types
export type DifficultyLevel = z.infer<typeof DifficultyLevelSchema>;
export type IntensityLevel = z.infer<typeof IntensityLevelSchema>;
export type SleepQualityType = z.infer<typeof SleepQualityTypeSchema>;
export type MealType = z.infer<typeof MealTypeSchema>;
export type MuscleGroup = z.infer<typeof MuscleGroupSchema>;
export type Exercise = z.infer<typeof ExerciseSchema>;
export type WorkoutSet = z.infer<typeof WorkoutSetSchema>;
export type WorkoutSession = z.infer<typeof WorkoutSessionSchema>;
export type Nutrient = z.infer<typeof NutrientSchema>;
export type FoodItem = z.infer<typeof FoodItemSchema>;
export type Meal = z.infer<typeof MealSchema>;
export type SleepEntry = z.infer<typeof SleepEntrySchema>;
export type VitalStats = z.infer<typeof VitalStatsSchema>;
export type Profile = z.infer<typeof ProfileSchema>;
export type HealthStore = z.infer<typeof HealthStoreSchema>;
