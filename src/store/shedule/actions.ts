import { scheduleStore } from './store';
import { ScheduleItem, PostponementRecord, TaskType, TASK_TYPES, RecurrencePattern, PRIORITY_LEVELS, RECURRENCE_PATTERNS, PriorityLevel } from './types';
import { addDays, isAfter, isBefore, addWeeks, addMonths, format, isValid } from 'date-fns';
import { notificationHandlers } from './notifications';
import { z } from 'zod';


interface PostponeOptions {
  reason: string;
  reasonCategory: PostponementRecord['reasonCategory'];
  impact: PostponementRecord['impact'];
}
const TaskTypeSchema = z.enum(['Work', 'Personal', 'Meeting', 'Break', 'Other']);
const PriorityLevelSchema = z.enum(['Low', 'Medium', 'High', 'Urgent']);
const RecurrencePatternSchema = z.enum(['None', 'Daily', 'Weekly', 'Biweekly', 'Monthly']);


const PostponementRecordSchema = z.object({
  id: z.number(),
  originalDate: z.date(),
  newDate: z.date(),
  reason: z.string().min(1),
  reasonCategory: z.enum(['Time Conflict', 'Not Ready', 'External Dependency', 'Other']),
  impact: z.enum(['Low', 'Medium', 'High'])
});

class ScheduleError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ScheduleError';
  }
}

// Comprehensive Validation and Error Handling
type CreateItemInput = Omit<ScheduleItem, 
  'id' | 
  'postponements' | 
  'completed' | 
  'inProgress' | 
  'completedAt' | 
  'startedAt' | 
  'actualDuration' | 
  'deletedAt'
>;
const validateScheduleItem = (item: CreateItemInput) => {
  // Title validation
  if (!item.title || item.title.trim().length === 0) {
    throw new ScheduleError('Title is required and cannot be empty');
  }

  // Date validation
  if (!isValid(item.startDate)) {
    throw new ScheduleError('Invalid date provided');
  }

  if (item.startDate >= item?.endDate) {
    throw new ScheduleError('Start date must be before end date');
  }

  // Type validations
  if (!TASK_TYPES.includes(item.type as TaskType)) {
    throw new ScheduleError(`Invalid task type. Must be one of: ${TASK_TYPES.join(', ')}`);
  }

  if (!PRIORITY_LEVELS.includes(item.priority as PriorityLevel)) {
    throw new ScheduleError(`Invalid priority level. Must be one of: ${PRIORITY_LEVELS.join(', ')}`);
  }

  if (!RECURRENCE_PATTERNS.includes(item.recurrence as RecurrencePattern)) {
    throw new ScheduleError(`Invalid recurrence pattern. Must be one of: ${RECURRENCE_PATTERNS.join(', ')}`);
  }

  // Duration validation
  if (item.duration <= 0) {
    throw new ScheduleError('Duration must be a positive number');
  }
  return true
};

// Enhanced ID Generation with Timestamp and Randomness
const generateId = (): number => {
  const timestamp = new Date().getTime();
  const randomPart = Math.floor(Math.random() * 10000);
  return parseInt(`${timestamp}${randomPart}`.slice(-9), 10);
};

// More Robust Date Handling for Recurring Items
const getNextRecurringDate = (date: Date, pattern: string): Date => {
  switch (pattern) {
    case 'Daily': return addDays(date, 1);
    case 'Weekly': return addWeeks(date, 1);
    case 'Biweekly': return addWeeks(date, 2);
    case 'Monthly': return addMonths(date, 1);
    default: return date;
  }
};


// Performance Metric Calculations
const calculateStreakDays = (): number => {
  const items = scheduleStore.items.get();
  let streak = 0;
  const today = new Date();

  for (let i = 0; i < 30; i++) {
    const date = addDays(today, -i);
    const dayItems = items.filter(
      (item) =>
        item.priority === 'High' &&
        item.completed &&
        item.completedAt &&
        format(item.completedAt, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );

    if (dayItems.length === 0) break;
    streak++;
  }

  return streak;
};

const calculateProductiveHours = (): string[] => {
  const completedItems = scheduleStore
    .get()
    .items.filter((item) => item.completed && item.completedAt);

  const hourCounts = new Map<string, number>();

  completedItems.forEach((item) => {
    if (item.completedAt) {
      const hour = format(item.completedAt, 'HH:00');
      hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
    }
  });

  return Array.from(hourCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([hour]) => hour);
};

const updatePerformanceMetrics = (): void => {
  const items = scheduleStore.get().items;
  const completed = items.filter((item) => item.completed);
  const postponed = items.filter((item) => item.postponements.length > 0);

  const completionRate = items.length ? (completed.length / items.length) * 100 : 0;
  const postponementRate = items.length ? (postponed.length / items.length) * 100 : 0;

  // Calculate average delay from postponements
  const delays = postponed.flatMap((item) =>
    item.postponements.map((p) => (p.newDate.getTime() - p.originalDate.getTime()) / (1000 * 60))
  );
  const averageDelay = delays.length
    ? delays.reduce((acc, curr) => acc + curr, 0) / delays.length
    : 0;

  // Calculate focus time
  const focusTime = completed.reduce((acc, item) => acc + (item.actualDuration || 0), 0);

  scheduleStore.performance.set({
    completionRate,
    postponementRate,
    averageDelay,
    streakDays: calculateStreakDays(),
    focusTime,
    productiveHours: calculateProductiveHours(),
  });
};

// Main Action Functions
export const createItem = async(
  item: Omit<ScheduleItem, 'id' | 'postponements' | 'completed' | 'inProgress'>
) => {
  const newItem: ScheduleItem = {
    ...item,
    id: generateId(),
    postponements: [],
    completed: false,
    inProgress: false,
    countdown: Math.floor((item.startDate.getTime() - new Date().getTime()) / 60000),
  };

  if (!validateScheduleItem(newItem)) return;
  if (newItem.recurrence !== 'None') {
    await notificationHandlers.createRecurring({
      ...newItem,
      time: new Date(newItem.startDate),
      body: newItem.description,
      frequency: newItem.recurrence === 'Daily' ? 'daily' : 'weekly',
    });
  }else {
    await notificationHandlers.onCreateItem(newItem)
  }
  scheduleStore.items.push(newItem);

  updatePerformanceMetrics();
};

export const deleteItem = async (id: number): Promise<void> => {
  const item = scheduleStore.items.get().find((item) => item.id === id);
  if (item) {
    const deletedItem = { ...item, deletedAt: new Date() };
    scheduleStore.deletedItems.push(deletedItem);
    scheduleStore.items.find((item) => item.id.get() === id)?.delete()
    scheduleStore.items.set(scheduleStore.items.get().filter((item) => item.id !== id));
  }
  await notificationHandlers.onDeleteItem(id);

  updatePerformanceMetrics();
};

export const markCompleted = async (id: number) => {
  const item = scheduleStore.get().items.find((item) => item.id === id);
  if (!item || item.completed) return;

  // Update completion status
  scheduleStore.items.set((prev) =>
    prev.map((item) =>
      item.id === id
        ? {
            ...item,
            completed: true,
            completedAt: new Date(),
            inProgress: false,
            actualDuration: item.startedAt
              ? Math.round((new Date().getTime() - item.startedAt.getTime()) / 60000)
              : item.estimatedDuration,
          }
        : item
    )
  );

  // Handle recurrence
  if (item.recurrence !== 'None') {
    createRecurringInstance(item);
  }

  // Handle notifications
  await notificationHandlers.onCompleteItem(item);

  updatePerformanceMetrics();
};

export const startItem = (id: number): void => {
  scheduleStore.items.set((prev) =>
    prev.map((item) =>
      item.id === id
        ? {
            ...item,
            inProgress: true,
            startedAt: new Date(),
          }
        : item
    )
  );
};

export const postponeItem = async (
  id: number, 
  newDate: Date, 
  options: PostponeOptions
): Promise<void> => {
  const item = scheduleStore.get().items.find((item) => item.id === id);
  
  if (!item) {
    throw new ScheduleError('Item not found');
  }

  const maxPostponements = item.maxPostponements ?? 3;
  if (item.completed) {
    throw new ScheduleError('Cannot postpone completed item');
  }

  if (item.postponements.length >= maxPostponements) {
    throw new ScheduleError(`Maximum postponements (${maxPostponements}) reached`);
  }

  // Check for blocking dependencies
  const isBlocked = item.blockedBy?.some(
    (blockId) => !scheduleStore.get().items.find((i) => i.id === blockId)?.completed
  );

  if (isBlocked) {
    throw new ScheduleError('Item is blocked by unfinished tasks');
  }

  const postponement: PostponementRecord = {
    id: item.postponements.length + 1,
    originalDate: item.startDate,
    newDate,
    ...options
  };

  const duration = item.endDate.getTime() - item.startDate.getTime();
  const newEndDate = new Date(newDate.getTime() + duration);

  scheduleStore.items.set((prev) =>
    prev.map((item) =>
      item.id === id
        ? {
            ...item,
            startDate: newDate,
            endDate: newEndDate,
            postponements: [...item.postponements, postponement],
          }
        : item
    )
  );

  await notificationHandlers.onPostponeItem(item.id);
};



export const updateItem = (id: number, updates: Partial<ScheduleItem>): void => {
  scheduleStore.items.set((prev) =>
    prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
  );
  updatePerformanceMetrics();
};

const createRecurringInstance = async (item: ScheduleItem) => {
  const nextStartDate = getNextRecurringDate(item.startDate, item.recurrence);
  const duration = item.endDate.getTime() - item.startDate.getTime();
  const nextEndDate = new Date(nextStartDate.getTime() + duration);

  await createItem({
    ...item,
    startDate: nextStartDate,
    endDate: nextEndDate,
    completedAt: undefined,
    startedAt: undefined,
    actualDuration: undefined,
  });
};

// Additional Helper Functions
export const getOverdueTasks = (): ScheduleItem[] => {
  const now = new Date();
  return scheduleStore.get().items.filter((item) => !item.completed && isBefore(item.endDate, now));
};

export const getUpcomingTasks = (days: number = 7): ScheduleItem[] => {
  const now = new Date();
  const futureDate = addDays(now, days);
  return scheduleStore
    .get()
    .items.filter(
      (item) =>
        !item.completed && isAfter(item.startDate, now) && isBefore(item.startDate, futureDate)
    );
};

export const getTasksByPriority = (priority: ScheduleItem['priority']): ScheduleItem[] => {
  return scheduleStore.get().items.filter((item) => !item.completed && item.priority === priority);
};

export const getBlockedTasks = (): ScheduleItem[] => {
  return scheduleStore
    .get()
    .items.filter(
      (item) =>
        !item.completed &&
        item.blockedBy?.some((id) => !scheduleStore.get().items.find((i) => i.id === id)?.completed)
    );
};

export const resetForm = () => {
  scheduleStore.newItem.title.set('');
  scheduleStore.newItem.description.set('');
  scheduleStore.newItem.type.set('Work');
  scheduleStore.newItem.priority.set('Medium');
  scheduleStore.newItem.scheduleType.set('task');
  scheduleStore.newItem.duration.set(30);
  scheduleStore.newItem.location?.set('');
  scheduleStore.newItem.tags.set([]);
  scheduleStore.newItem.notes.set('');
  scheduleStore.newItem.reminder.set(15);
  scheduleStore.newItem.recurrence.set('None');
  scheduleStore.isAddingItem.set(false);
};

export const handleAddItem = async() => {
  const item = scheduleStore.newItem.get() as ScheduleItem;
  if (!item) return;
  await createItem(item);
  // resetForm();
};

export const restoreDeletedItem = (id: number) => {
  const item = scheduleStore?.deletedItems?.get()?.find((item) => item.id === id);
  if (item) {
    const restoredItem = { ...item };
    delete restoredItem?.deletedAt;
    scheduleStore?.items?.push(restoredItem);
    scheduleStore?.deletedItems?.set(
      scheduleStore?.deletedItems?.get()?.filter((item) => item.id !== id)
    );
  }
};

export const restoreCompletedItem = (id: number) => {
  const item = scheduleStore?.completedItems?.get()?.find((item) => item.id === id);
  if (item) {
    const restoredItem = { ...item, completed: false };
    scheduleStore?.items?.push(restoredItem);
    scheduleStore?.completedItems?.set(
      scheduleStore?.completedItems?.get()?.filter((item) => item.id !== id)
    );
  }
};

const useScheduleStore = () => {
  return {
    addTask: handleAddItem,
    addRecurringInstance: createRecurringInstance,
    addItem: handleAddItem,
    deleteTask: deleteItem,
    postponeTask: postponeItem,
    startTask: startItem,
    completeTask: markCompleted,
    streak: calculateStreakDays,
    restoreDeletedItem,
    restoreCompletedItem,
    updateItem,
    getOverdueTasks,
    getUpcomingTasks,
    getTasksByPriority,
    getBlockedTasks,
    resetForm,
  };
};
export default useScheduleStore;
