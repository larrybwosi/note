import { addMinutes, addDays, format } from 'date-fns';

export const TASK_TYPES = ['Work', 'Personal', 'Health', 'Learning', 'Social', 'Urgent'] as const;
export type TaskType = (typeof TASK_TYPES)[number];

export const PRIORITY_LEVELS = ['Low', 'Medium', 'High', 'Critical'] as const;
export type PriorityLevel = (typeof PRIORITY_LEVELS)[number];

export const RECURRENCE_PATTERNS = ['None', 'Daily', 'Weekly', 'Biweekly', 'Monthly'] as const;
export type RecurrencePattern = (typeof RECURRENCE_PATTERNS)[number];

export type PostponementReasonCategory = 'Unavailable' | 'Conflict' | 'Emergency' | 'Other';
export type ImpactLevel = 'Low' | 'Medium' | 'High';

export interface PostponementRecord {
  id: number;
  originalDate: Date;
  newDate: Date;
  reason: string;
  reasonCategory: PostponementReasonCategory;
  impact: ImpactLevel;
}

export interface PerformanceMetrics {
  completionRate: number;
  postponementRate: number;
  averageDelay: number;
  streakDays: number;
  focusTime: number;
  productiveHours: string[];
}

export interface ScheduleItem {
  id: number;
  title: string;
  description: string;
  type: TaskType;
  startDate: Date;
  endDate: Date;
  duration: number;
  priority: PriorityLevel;
  recurrence: RecurrencePattern;
  location?: string;
  completed: boolean;
  completedAt?: Date;
  inProgress: boolean;
  startedAt?: Date;
  estimatedDuration: number;
  actualDuration?: number;
  blockedBy?: number[];
  blocking?: number[];
  postponements: PostponementRecord[];
  maxPostponements?: number;
  tags: string[];
  notes: string;
  reminder?: number;
  scheduleType?: 'task' | 'event';
  deletedAt?: Date;
}

export interface ScheduleStore {
  currentDate: Date;
  currentTime: string;
  items: ScheduleItem[];
  filteredItems: ScheduleItem[];
  selectedItem: ScheduleItem | null;
  deletedItems?: ScheduleItem[];
  postponedItems?: ScheduleItem[];
  completedItems?: ScheduleItem[];
  isAddingItem: boolean;
  isPostponing: boolean;
  editingItem: ScheduleItem | null;
  newItem: Partial<ScheduleItem>;
  postponeData: {
    itemId: number | null;
    reason: string;
    reasonCategory: PostponementReasonCategory;
    newDate: Date;
    impact: ImpactLevel;
  };
  performance: PerformanceMetrics;
  settings: {
    workingHours: {
      start: string;
      end: string;
    };
    breakDuration: number;
    focusSessionDuration: number;
    theme: 'light' | 'dark';
    notifications: boolean;
    autoScheduleBreaks: boolean;
  };
  view: 'day' | 'week' | 'month';
  showCompleted: boolean;
  filterPriority?: PriorityLevel;
  filterType?: TaskType;
}
