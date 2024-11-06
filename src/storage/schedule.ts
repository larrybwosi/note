import { observable } from "@legendapp/state"
import { ObservablePersistMMKV } from "@legendapp/state/persist-plugins/mmkv"
import { synced } from "@legendapp/state/sync"
import { addMinutes, addDays, format, isAfter, isBefore } from "date-fns"

// ========== Schedule Types ==========
export const TASK_TYPES = [
  'Work',
  'Personal',
  'Health',
  'Learning',
  'Social',
  'Urgent'
] as const
export type TaskType = typeof TASK_TYPES[number]

export const PRIORITY_LEVELS = ['Low', 'Medium', 'High', 'Critical'] as const
export type PriorityLevel = typeof PRIORITY_LEVELS[number]

export const RECURRENCE_PATTERNS = [
  'None',
  'Daily',
  'Weekly',
  'Biweekly',
  'Monthly'
] as const
export type RecurrencePattern = typeof RECURRENCE_PATTERNS[number]

export interface PostponementRecord {
  id: number
  originalDate: Date
  newDate: Date
  reason: string
  reasonCategory: 'Unavailable' | 'Conflict' | 'Emergency' | 'Other'
  impact: 'Low' | 'Medium' | 'High'
}

export interface PerformanceMetrics {
  completionRate: number // Percentage of tasks completed on time
  postponementRate: number // Percentage of tasks postponed
  averageDelay: number // Average minutes of delay
  streakDays: number // Current streak of completing high-priority tasks
  focusTime: number // Minutes spent on focused work
  productiveHours: string[] // Most productive hours of the day
}

export interface ScheduleItem {
  id: number
  title: string
  description: string
  type: TaskType
  startDate: Date
  endDate: Date
  duration: number // in minutes
  priority: PriorityLevel
  recurrence: RecurrencePattern
  location?: string
  
  // Status tracking
  completed: boolean
  completedAt?: Date
  inProgress: boolean
  startedAt?: Date
  
  // Performance tracking
  estimatedDuration: number
  actualDuration?: number
  
  // Dependencies and blocking
  blockedBy?: number[] // IDs of items that must be completed first
  blocking?: number[] // IDs of items this is blocking
  
  // Postponement tracking
  postponements: PostponementRecord[]
  maxPostponements?: number
  
  // Additional metadata
  tags: string[]
  notes: string
  reminder?: number // minutes before start
  scheduleType?: 'task' | 'event'
  countdown?: number
  deletedAt?: Date
}

interface ScheduleStore {
  // Current state
  currentDate: Date
  currentTime: string
  
  // Items and filters
  items: ScheduleItem[]
  filteredItems: ScheduleItem[]
  selectedItem: ScheduleItem | null
  
  // Form states
  isAddingItem: boolean
  isPostponing: boolean
  editingItem: ScheduleItem | null
  
  // New item template
  newItem: Partial<ScheduleItem>
  
  // Postponement data
  postponeData: {
    itemId: number | null
    reason: string
    reasonCategory: PostponementRecord['reasonCategory']
    newDate: Date
    impact: PostponementRecord['impact']
  }
  
  // Performance tracking
  performance: PerformanceMetrics
  
  // Settings
  settings: {
    workingHours: {
      start: string
      end: string
    }
    breakDuration: number
    focusSessionDuration: number
    theme: 'light' | 'dark'
    notifications: boolean
    autoScheduleBreaks: boolean
  }
  
  // View preferences
  view: 'day' | 'week' | 'month'
  showCompleted: boolean
  filterPriority?: PriorityLevel
  filterType?: TaskType
}

// ========== Store Implementation ==========
const initialScheduleState:ScheduleItem[] = [
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
    reminder: 15
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
    postponements: [
      {
        id: 1,
        originalDate: addDays(new Date(), -1),
        newDate: new Date(),
        reason: 'Emergency client meeting',
        reasonCategory: 'Conflict',
        impact: 'Medium'
      }
    ],
    tags: ['exercise', 'health', 'routine'],
    notes: 'Remember to bring workout gear',
    reminder: 15,
    scheduleType: 'task'
  }
]
/**
 * Schedule Store
 * Advanced schedule management with performance tracking and postponement handling
 */
export const scheduleStore = observable(
  synced<ScheduleStore>({
    initial: {
      currentDate: new Date(),
      currentTime: format(new Date(), 'HH:mm'),
      
      items: initialScheduleState,
      
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
        impact: 'Low'
      },
      
      performance: {
        completionRate: 85,
        postponementRate: 15,
        averageDelay: 12,
        streakDays: 5,
        focusTime: 240,
        productiveHours: ['09:00', '10:00', '14:00', '15:00']
      },
      
      settings: {
        workingHours: {
          start: '09:00',
          end: '17:00'
        },
        breakDuration: 15,
        focusSessionDuration: 45,
        theme: 'light',
        notifications: true,
        autoScheduleBreaks: true
      },
      
      view: 'day',
      showCompleted: false
    },
    
    persist: {
      name: 'schedule',
      plugin: ObservablePersistMMKV
    }
  })
)

// ========== Helper Functions ==========

/**
 * Calculates performance metrics based on schedule history
 */
export const calculatePerformanceMetrics = (items: ScheduleItem[]): PerformanceMetrics => {
  const completed = items.filter(item => item.completed)
  const postponed = items.filter(item => item.postponements.length > 0)
  
  const completionRate = (completed.length / items.length) * 100
  const postponementRate = (postponed.length / items.length) * 100
  
  // Calculate average delay
  const delays = postponed.map(item => {
    const lastPostponement = item.postponements[item.postponements.length - 1]
    return (lastPostponement.newDate.getTime() - lastPostponement.originalDate.getTime()) / (1000 * 60)
  })
  const averageDelay = delays.reduce((acc, curr) => acc + curr, 0) / delays.length
  
  return {
    completionRate,
    postponementRate,
    averageDelay,
    streakDays: scheduleStore.get().performance.streakDays, 
    focusTime: completed.reduce((acc, item) => acc + (item.actualDuration || 0), 0),
    productiveHours: scheduleStore.get().performance.productiveHours
  }
}

/**
 * Checks if an item can be postponed based on rules
 */
export const canPostpone = (item: ScheduleItem): boolean => {
  const maxPostponements = item.maxPostponements ?? 3
  return (
    !item.completed &&
    item.postponements.length < maxPostponements &&
    !item.blockedBy?.some(id => !scheduleStore.get().items.find(i => i.id === id)?.completed)
  )
}