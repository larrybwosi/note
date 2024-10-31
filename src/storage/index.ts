import { observable } from "@legendapp/state"
import { ObservablePersistMMKV } from "@legendapp/state/persist-plugins/mmkv"
import { synced } from "@legendapp/state/sync"
import { addMinutes, format } from "date-fns"

// ========== Shared Types ==========
export type Status = 'Pending' | 'Completed' | 'Failed' | 'Cancelled'
type TrendDirection = '+' | '-'

interface BaseEntry {
  id: number
  date: string
  time: string
  title: string
  description: string
  amount: number
  isUp: boolean
  trend: string
  status: Status
}

export const TRANSACTION_STATUS = ['Pending', 'Completed', 'Failed', 'Cancelled'] as const
export type TransactionStatus = typeof TRANSACTION_STATUS[number]

// ========== Income Types ==========
export const INCOME_CATEGORIES = ['Salary', 'Side Hustle', 'Investments', 'Gifts', 'Other'] as const
export type IncomeCategory = typeof INCOME_CATEGORIES[number]

export interface IncomeEntry extends BaseEntry {
  category: IncomeCategory
}

// ========== Expense Types ==========
export const EXPENSE_CATEGORIES = [
  'Food',
  'Rent',
  'Entertainment',
  'Transport',
  'Utilities',
  'Healthcare',
  'Education',
  'Shopping'
] as const
export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number]

export interface ExpenseEntry extends BaseEntry {
  category: ExpenseCategory
  isRecurring: boolean
  dueDate?: string
}

// ========== Health and Wellness Types ==========
export const WORKOUT_TYPES = ['Strength', 'Cardio', 'Flexibility', 'HIIT', 'Sport'] as const
export type WorkoutType = typeof WORKOUT_TYPES[number]

export const INTENSITY_LEVELS = ['Low', 'Medium', 'High'] as const
export type IntensityLevel = typeof INTENSITY_LEVELS[number]

export const WELLNESS_ACTIVITIES = [
  'Meditation',
  'Journaling',
  'Hydration',
  'Sleep',
  'Reading',
  'Stretching'
] as const
export type WellnessActivity = typeof WELLNESS_ACTIVITIES[number]

export interface WorkoutItem {
  id: number
  date: string
  type: WorkoutType
  duration: number // in minutes
  intensity: IntensityLevel
  caloriesBurned: number
  completed: boolean
  notes: string
}

export interface WellnessItem {
  id: number
  date: string
  activity: WellnessActivity
  duration: number // in minutes
  goal: number // e.g., 8 hours sleep, 2L water
  progress: number
  completed: boolean
  streak: number
  notes: string
}

// ========== Store Interfaces ==========
interface IncomeStore {
  incomeData: IncomeEntry[]
  showNewIncomeForm: boolean
  newIncome: Partial<IncomeEntry>
  isDarkMode: boolean
}

interface ExpenseStore {
  expenseData: ExpenseEntry[]
  showNewExpenseForm: boolean
  newExpense: Partial<ExpenseEntry>
  monthlyBudget: number
  categoryBudgets: Record<ExpenseCategory, number>
}

interface HealthStore {
  workouts: WorkoutItem[]
  wellness: WellnessItem[]
  showNewWorkoutForm: boolean
  showNewWellnessForm: boolean
  newWorkout: Partial<WorkoutItem>
  newWellness: Partial<WellnessItem>
  weeklyGoals: {
    workoutMinutes: number
    meditationMinutes: number
    sleepHours: number
    waterIntake: number // in liters
  }
}

// ========== Store Implementations ==========

/**
 * Income Store
 * Manages income tracking with categorization and trend analysis
 */
export const incomeStore = observable(
  synced<IncomeStore>({
    initial: {
      incomeData: [
        {
          id: 1,
          date: format(new Date(), 'yyyy-MM-dd'),
          time: '09:00',
          title: 'Monthly Salary',
          description: 'Regular monthly salary payment',
          category: 'Salary',
          amount: 5000,
          isUp: true,
          trend: '+2.5%',
          status: 'Completed'
        },
        {
          id: 2,
          date: format(new Date(), 'yyyy-MM-dd'),
          time: '14:30',
          title: 'Freelance Project',
          description: 'Website development contract',
          category: 'Side Hustle',
          amount: 1500,
          isUp: true,
          trend: '+5.0%',
          status: 'Pending'
        }
      ],
      showNewIncomeForm: false,
      newIncome: {
        date: format(new Date(), 'yyyy-MM-dd'),
        time: format(new Date(), 'HH:mm'),
        category: 'Salary',
        status: 'Pending'
      },
      isDarkMode: false
    },
    persist: {
      name: 'income',
      plugin: ObservablePersistMMKV
    }
  })
)

/**
 * Expense Store
 * Tracks expenses with budgeting and category management
 */
export const expenseStore = observable(
  synced<ExpenseStore>({
    initial: {
      expenseData: [
        {
          id: 1,
          date: format(new Date(), 'yyyy-MM-dd'),
          time: '12:30',
          title: 'Monthly Rent',
          description: 'Apartment rent payment',
          category: 'Rent',
          amount: 2000,
          isUp: false,
          trend: '+0.0%',
          status: 'Completed',
          isRecurring: true,
          dueDate: format(addMinutes(new Date(), 24 * 60), 'yyyy-MM-dd')
        },
        {
          id: 2,
          date: format(new Date(), 'yyyy-MM-dd'),
          time: '18:45',
          title: 'Grocery Shopping',
          description: 'Weekly groceries',
          category: 'Food',
          amount: 150,
          isUp: true,
          trend: '+2.8%',
          status: 'Completed',
          isRecurring: false
        }
      ],
      showNewExpenseForm: false,
      newExpense: {
        date: format(new Date(), 'yyyy-MM-dd'),
        time: format(new Date(), 'HH:mm'),
        category: 'Food',
        status: 'Pending',
        isRecurring: false
      },
      monthlyBudget: 4000,
      categoryBudgets: {
        Food: 600,
        Rent: 2000,
        Entertainment: 200,
        Transport: 300,
        Utilities: 400,
        Healthcare: 200,
        Education: 150,
        Shopping: 150
      }
    },
    persist: {
      name: 'expenses',
      plugin: ObservablePersistMMKV
    }
  })
)

/**
 * Health Store
 * Manages health and wellness tracking with goals and progress monitoring
 */
export const healthStore = observable(
  synced<HealthStore>({
    initial: {
      workouts: [
        {
          id: 1,
          date: format(new Date(), 'yyyy-MM-dd'),
          type: 'Strength',
          duration: 45,
          intensity: 'High',
          caloriesBurned: 320,
          completed: true,
          notes: 'Full body workout - increased weights'
        },
        {
          id: 2,
          date: format(new Date(), 'yyyy-MM-dd'),
          type: 'Cardio',
          duration: 30,
          intensity: 'Medium',
          caloriesBurned: 250,
          completed: true,
          notes: 'Morning run'
        }
      ],
      wellness: [
        {
          id: 1,
          date: format(new Date(), 'yyyy-MM-dd'),
          activity: 'Meditation',
          duration: 15,
          goal: 15,
          progress: 15,
          completed: true,
          streak: 5,
          notes: 'Morning meditation session'
        },
        {
          id: 2,
          date: format(new Date(), 'yyyy-MM-dd'),
          activity: 'Hydration',
          duration: 0,
          goal: 2000, // ml
          progress: 1500,
          completed: false,
          streak: 3,
          notes: 'Daily water intake tracking'
        }
      ],
      showNewWorkoutForm: false,
      showNewWellnessForm: false,
      newWorkout: {
        date: format(new Date(), 'yyyy-MM-dd'),
        type: 'Strength',
        intensity: 'Medium',
        duration: 45
      },
      newWellness: {
        date: format(new Date(), 'yyyy-MM-dd'),
        activity: 'Meditation',
        duration: 15,
        goal: 15
      },
      weeklyGoals: {
        workoutMinutes: 180,
        meditationMinutes: 70,
        sleepHours: 56, // 8 hours * 7 days
        waterIntake: 14 // 2L * 7 days
      }
    },
    persist: {
      name: 'health',
      plugin: ObservablePersistMMKV
    }
  })
)