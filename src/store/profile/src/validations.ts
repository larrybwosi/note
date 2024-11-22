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
  videoUrl: z.string().optional(),
  calories_per_minute: z.number(),
});

export const WorkoutSetSchema = BaseEntrySchema.extend({
  exerciseId: z.string(),
  reps: z.number(),
  weight: z.number().optional(),
  duration: z.number().optional(),
  intensity: IntensityLevelSchema,
  restTime: z.number().optional(),
  form_rating: z.number().optional(),
});

export const WorkoutSessionSchema = BaseEntrySchema.extend({
  title: z.string(),
  type: z.string(),
  duration: z.number(),
  caloriesBurned: z.number(),
  intensity: IntensityLevelSchema,
  sets: z.array(WorkoutSetSchema),
  progress_photos: z.array(z.string()).optional(),
});

export const NutrientSchema = z.object({
  name: z.string(),
  amount: z.number(),
  unit: z.string(),
  percentDailyValue: z.number().optional(),
});

export const FoodItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  serving_size: z.number(),
  serving_unit: z.string(),
  calories: z.number(),
  nutrients: z.array(NutrientSchema),
  tags: z.array(z.string()),
});

export const MealSchema = BaseEntrySchema.extend({
  type: MealTypeSchema,
  foods: z.array(z.object({
    foodItem: FoodItemSchema,
    servings: z.number(),
  })),
  totalCalories: z.number(),
  photos: z.array(z.string()).optional(),
});

export const SleepEntrySchema = BaseEntrySchema.extend({
  duration: z.number(),
  quality: SleepQualityTypeSchema,
  deep_sleep_duration: z.number().optional(),
  rem_sleep_duration: z.number().optional(),
  interruptions: z.number().optional(),
  sleep_score: z.number().optional(),
});

export const VitalStatsSchema = BaseEntrySchema.extend({
  weight: z.number().optional(),
  body_fat_percentage: z.number().optional(),
  muscle_mass: z.number().optional(),
  water_percentage: z.number().optional(),
  bone_mass: z.number().optional(),
  bmi: z.number().optional(),
  blood_pressure: z.object({
    systolic: z.number(),
    diastolic: z.number(),
  }).optional(),
  resting_heart_rate: z.number().optional(),
  vo2_max: z.number().optional(),
});

export const ProfileSchema = z.object({
  personalInfo: z.object({
    name: z.string(),
    email: z.string().email(),
    dateOfBirth: z.string(),
    image: z.string().optional(),
    height: z.number(),
    weight: z.number(),
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
    sleepGoal: z.number().optional(),
    waterIntake: z.number().optional(),
    calorieGoal: z.number().optional(),
    storedToken: z.string().optional(),
  }),
  healthMetrics: z.object({
    waterIntake: z.object({
      daily: z.object({
        goal: z.number(),
        current: z.number(),
      }),
    }),
    sleep: z.object({
      averageHours: z.number(),
      goal: z.number(),
    }),
    exercise: z.object({
      weeklyGoal: z.number(),
      weeklyProgress: z.number(),
    }),
    bodyFatPercentage: z.number().optional(),
    calorieTracking: z.object({
      dailyIntake: z.number(),
      dailyBurn: z.number(),
    }).optional(),
    heartRate: z.object({
      resting: z.number(),
      active: z.number(),
    }).optional(),
    bloodPressure: z.object({
      systolic: z.number(),
      diastolic: z.number(),
    }).optional(),
    stressLevel: z.number().optional(),
    customGoals: z.array(z.object({
      name: z.string(),
      target: z.string(),
      progress: z.number(),
    })).optional(),
  }),
  productivityMetrics: z.object({
    focusTime: z.object({
      daily: z.object({
        goal: z.number(),
        current: z.number(),
      }),
    }),
    habits: z.array(z.object({
      name: z.string(),
      frequency: z.enum(['daily', 'weekly']),
      completed: z.boolean(),
    })),
    pomodoroSessions: z.object({
      goal: z.number(),
      completed: z.number(),
    }).optional(),
    breakTime: z.object({
      total: z.number(),
    }).optional(),
    taskCompletionRate: z.number().optional(),
    projects: z.array(z.object({
      name: z.string(),
      tasksCompleted: z.number(),
      totalTasks: z.number(),
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
      breakDuration: z.number().optional(),
    }),
  }),
  socialMetrics: z.object({
    friends: z.array(z.object({
      name: z.string(),
      progress: z.number(),
    })).optional(),
    leaderboard: z.object({
      rank: z.number(),
      score: z.number(),
    }).optional(),
  }).optional(),
  achievements: z.object({
    badges: z.array(z.object({
      name: z.string(),
      earnedDate: z.string(),
    })),
    streaks: z.object({
      metric: z.string(),
      count: z.number(),
    }),
  }).optional(),
  systemSettings: z.object({
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
  }).optional(),
});

export const HealthStoreSchema = z.object({
  workouts: z.record(z.string(), WorkoutSessionSchema),
  exercises: z.record(z.string(), ExerciseSchema),
  meals: z.record(z.string(), MealSchema),
  sleep: z.record(z.string(), SleepEntrySchema),
  vitals: z.record(z.string(), VitalStatsSchema),
  goals: z.object({
    daily_calories: z.number().optional(),
    daily_protein: z.number().optional(),
    daily_steps: z.number().optional(),
    weekly_workouts: z.number().optional(),
    target_weight: z.number().optional(),
    target_body_fat: z.number().optional(),
  }),
  settings: z.object({
    units: z.enum(['metric', 'imperial']),
    notifications_enabled: z.boolean(),
    reminder_times: z.array(z.string()).optional(),
  }),
});

// Type Exports
export type DifficultyLevel = z.infer<typeof DifficultyLevelSchema>;
export type IntensityLevel = z.infer<typeof IntensityLevelSchema>;
export type SleepQualityType = z.infer<typeof SleepQualityTypeSchema>;
export type MealType = z.infer<typeof MealTypeSchema>;
export type BaseEntry = z.infer<typeof BaseEntrySchema>;
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
