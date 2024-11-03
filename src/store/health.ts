import { observable } from "@legendapp/state";
import { ObservablePersistMMKV } from "@legendapp/state/persist-plugins/mmkv";
import { synced } from "@legendapp/state/sync";
import { format } from "date-fns";
import { v4 as uuidv4 } from "uuid";

// Enums and Constants
export const DIFFICULTY_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Elite'] as const;
export const INTENSITY_LEVELS = ['Low', 'Moderate', 'High', 'Very High'] as const;
export const MOOD_LEVELS = ['Excellent', 'Good', 'Neutral', 'Poor', 'Terrible'] as const;
export const SLEEP_QUALITY = ['Deep', 'Light', 'Disrupted', 'Insomnia'] as const;
export const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Pre-workout', 'Post-workout'] as const;

export type DifficultyLevel = typeof DIFFICULTY_LEVELS[number];
export type IntensityLevel = typeof INTENSITY_LEVELS[number];
export type MoodLevel = typeof MOOD_LEVELS[number];
export type SleepQualityType = typeof SLEEP_QUALITY[number];
export type MealType = typeof MEAL_TYPES[number];

// Basic Interfaces
interface BaseEntry {
  id: string;
  date: string;
  time: string;
  notes?: string;
}

export interface MuscleGroup {
  id: string;
  name: string;
  icon: string;
  color: string;
  relatedMuscles: string[];
}

export interface Exercise {
  id: string;
  name: string;
  muscleGroups: MuscleGroup[];
  difficulty: DifficultyLevel;
  equipment?: string[];
  instructions: string[];
  videoUrl?: string;
  calories_per_minute: number;
}

// Workout Related Interfaces
export interface WorkoutSet extends BaseEntry {
  exerciseId: string;
  reps: number;
  weight?: number;
  duration?: number;
  intensity: IntensityLevel;
  restTime?: number;
  form_rating?: number;
}

export interface WorkoutSession extends BaseEntry {
  title: string;
  type: string;
  duration: number;
  caloriesBurned: number;
  intensity: IntensityLevel;
  sets: WorkoutSet[];
  feeling?: MoodLevel;
  progress_photos?: string[];
}

// Nutrition Related Interfaces
export interface Nutrient {
  name: string;
  amount: number;
  unit: string;
  percentDailyValue?: number;
}

export interface FoodItem {
  id: string;
  name: string;
  serving_size: number;
  serving_unit: string;
  calories: number;
  nutrients: Nutrient[];
  tags: string[];
}

export interface Meal extends BaseEntry {
  type: MealType;
  foods: Array<{
    foodItem: FoodItem;
    servings: number;
  }>;
  totalCalories: number;
  photos?: string[];
}

// Wellness Related Interfaces
export interface SleepEntry extends BaseEntry {
  duration: number;
  quality: SleepQualityType;
  deep_sleep_duration?: number;
  rem_sleep_duration?: number;
  interruptions?: number;
  sleep_score?: number;
}

export interface VitalStats extends BaseEntry {
  weight?: number;
  body_fat_percentage?: number;
  muscle_mass?: number;
  water_percentage?: number;
  bone_mass?: number;
  bmi?: number;
  blood_pressure?: {
    systolic: number;
    diastolic: number;
  };
  resting_heart_rate?: number;
  vo2_max?: number;
}

// Store Interfaces
interface HealthStore {
  workouts: Record<string, WorkoutSession>;
  exercises: Record<string, Exercise>;
  meals: Record<string, Meal>;
  sleep: Record<string, SleepEntry>;
  vitals: Record<string, VitalStats>;
  goals: {
    daily_calories?: number;
    daily_protein?: number;
    daily_steps?: number;
    weekly_workouts?: number;
    target_weight?: number;
    target_body_fat?: number;
  };
  settings: {
    units: 'metric' | 'imperial';
    notifications_enabled: boolean;
    reminder_times?: string[];
  };
}

// Utility Functions
export const healthUtils = {
  generateId: () => uuidv4(),

  calculateBMI: (weight: number, height: number): number => {
    return +(weight / (height * height)).toFixed(1);
  },

  calculateCaloriesBurned: (
    exercise: Exercise,
    duration: number,
    weight: number
  ): number => {
    return Math.round(exercise.calories_per_minute * duration * (weight / 70));
  },

  calculateDailyNutrients: (meals: Meal[]): Record<string, number> => {
    return meals.reduce((acc, meal) => {
      meal.foods.forEach(({ foodItem, servings }) => {
        foodItem.nutrients.forEach((nutrient) => {
          acc[nutrient.name] = (acc[nutrient.name] || 0) + 
            (nutrient.amount * servings);
        });
      });
      return acc;
    }, {} as Record<string, number>);
  },

  createWorkoutSession: (partial: Partial<WorkoutSession> = {}): WorkoutSession => {
    const now = new Date();
    return {
      id: partial.id || healthUtils.generateId(),
      date: partial.date || format(now, 'yyyy-MM-dd'),
      time: partial.time || format(now, 'HH:mm'),
      title: partial.title || 'New Workout',
      type: partial.type || 'General',
      duration: partial.duration || 0,
      caloriesBurned: partial.caloriesBurned || 0,
      intensity: partial.intensity || 'Moderate',
      sets: partial.sets || [],
      notes: partial.notes || '',
      ...partial
    };
  },

  createMeal: (partial: Partial<Meal> = {}): Meal => {
    const now = new Date();
    return {
      id: partial.id || healthUtils.generateId(),
      date: partial.date || format(now, 'yyyy-MM-dd'),
      time: partial.time || format(now, 'HH:mm'),
      type: partial.type || 'Snack',
      foods: partial.foods || [],
      totalCalories: partial.totalCalories || 0,
      notes: partial.notes || '',
      ...partial
    };
  }
};

// Default Data
const defaultExercises: Exercise[] = [
  {
    id: '1',
    name: 'Barbell Squat',
    muscleGroups: [
      { id: 'quads', name: 'Quadriceps', icon: '🦵', color: '#FF5722', relatedMuscles: ['glutes', 'hamstrings'] }
    ],
    difficulty: 'Intermediate',
    equipment: ['Barbell', 'Squat Rack'],
    instructions: [
      'Position bar on upper back',
      'Feet shoulder-width apart',
      'Squat down until thighs parallel',
      'Drive up through heels'
    ],
    calories_per_minute: 8
  },
  // Add more default exercises as needed
];

// Health Store
export const healthStore = observable(
  synced<HealthStore>({
    initial: {
      workouts: {},
      exercises: defaultExercises.reduce((acc, exercise) => {
        acc[exercise.id] = exercise;
        return acc;
      }, {} as Record<string, Exercise>),
      meals: {},
      sleep: {},
      vitals: {},
      goals: {
        daily_calories: 2000,
        daily_protein: 150,
        daily_steps: 10000,
        weekly_workouts: 4
      },
      settings: {
        units: 'metric',
        notifications_enabled: true,
        reminder_times: ['07:00', '12:00', '18:00']
      }
    },
    persist: {
      name: 'health',
      plugin: ObservablePersistMMKV
    }
  })
);