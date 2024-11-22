import { notificationHandlers } from '../notifications';
import { scheduleStore } from '../store';
import { ScheduleItem,PostponementRecord, RecurrencePattern, PriorityLevel, ScheduleItemSchema, PostponementRecordSchema } from './types';
import { addDays, isAfter, isBefore, addWeeks, addMonths, format } from 'date-fns';
import { z } from 'zod';

class ScheduleError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ScheduleError';
  }
}

const CreateItemInputSchema = ScheduleItemSchema.omit({
  id: true,
  postponements: true,
  completed: true,
  inProgress: true,
  completedAt: true,
  startedAt: true,
  actualDuration: true,
  deletedAt: true,
});

type CreateItemInput = z.infer<typeof CreateItemInputSchema>;

const validateScheduleItem = (item: CreateItemInput): boolean => {
  try {
    CreateItemInputSchema.parse(item);
    return true;
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ScheduleError(error.errors.map(e => e.message).join(', '));
    }
    throw error;
  }
};

const generateId = (): number => {
  const timestamp = new Date().getTime();
  const randomPart = Math.floor(Math.random() * 10000);
  return parseInt(`${timestamp}${randomPart}`.slice(-9), 10);
};

const getNextRecurringDate = (date: Date, pattern: RecurrencePattern): Date => {
  switch (pattern) {
    case 'Daily': return addDays(date, 1);
    case 'Weekly': return addWeeks(date, 1);
    case 'Biweekly': return addWeeks(date, 2);
    case 'Monthly': return addMonths(date, 1);
    default: return date;
  }
};

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
  const completedItems = scheduleStore.items.get().filter((item) => item.completed && item.completedAt);

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
  const items = scheduleStore.items.get();
  const completed = items.filter((item) => item.completed);
  const postponed = items.filter((item) => item.postponements.length > 0);

  const completionRate = items.length ? (completed.length / items.length) * 100 : 0;
  const postponementRate = items.length ? (postponed.length / items.length) * 100 : 0;

  const delays = postponed.flatMap((item) =>
    item.postponements.map((p) => (p.newDate.getTime() - p.originalDate.getTime()) / (1000 * 60))
  );
  const averageDelay = delays.length
    ? delays.reduce((acc, curr) => acc + curr, 0) / delays.length
    : 0;

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

export const createItem = async (item: CreateItemInput) => {
  if (!validateScheduleItem(item)) return;

  const newItem: ScheduleItem = ScheduleItemSchema.parse({
    ...item,
    id: generateId(),
    postponements: [],
    completed: false,
    inProgress: false,
    countdown: Math.floor((item.startDate.getTime() - new Date().getTime()) / 60000),
  });

  if (newItem.recurrence !== 'None') {
    await notificationHandlers.createRecurring({
      title: newItem.title,
      body: newItem.description,
      time: new Date(newItem.startDate),
      frequency: newItem.recurrence === 'Daily' ? 'daily' : 'weekly',
      priority: newItem.priority,
    });
  } else {
    await notificationHandlers.onCreateItem(newItem);
  }

  scheduleStore.items.push(newItem);
  updatePerformanceMetrics();
};

export const deleteItem = async (id: number): Promise<void> => {
  const item = scheduleStore.items.get().find((item) => item.id === id);
  if (item) {
    const deletedItem = ScheduleItemSchema.parse({ ...item, deletedAt: new Date() });
    scheduleStore.deletedItems.push(deletedItem);
    scheduleStore.items.set(scheduleStore.items.get().filter((item) => item.id !== id));
  }
  await notificationHandlers.onDeleteItem(id);
  updatePerformanceMetrics();
};

export const markCompleted = async (id: number) => {
  const item = scheduleStore.items.get().find((item) => item.id === id);
  if (!item || item.completed) return;

  const updatedItem = ScheduleItemSchema.parse({
    ...item,
    completed: true,
    completedAt: new Date(),
    inProgress: false,
    actualDuration: item.startedAt
      ? Math.round((new Date().getTime() - item.startedAt.getTime()) / 60000)
      : item.estimatedDuration,
  });

  scheduleStore.items.set((prev) =>
    prev.map((item) => (item.id === id ? updatedItem : item))
  );

  if (item.recurrence !== 'None') {
    createRecurringInstance(item);
  }

  await notificationHandlers.onCompleteItem(item);
  updatePerformanceMetrics();
};

export const startItem = (id: number): void => {
  scheduleStore.items.set((prev) =>
    prev.map((item) =>
      item.id === id
        ? ScheduleItemSchema.parse({
            ...item,
            inProgress: true,
            startedAt: new Date(),
          })
        : item
    )
  );
};

interface PostponeOptions {
  reason: string;
  reasonCategory: PostponementRecord['reasonCategory'];
  impact: PostponementRecord['impact'];
}

export const postponeItem = async (
  id: number, 
  newDate: Date, 
  options: PostponeOptions
): Promise<void> => {
  const item = scheduleStore.items.get().find((item) => item.id === id);
  
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

  const isBlocked = item.blockedBy?.some(
    (blockId) => !scheduleStore.items.get().find((i) => i.id === blockId)?.completed
  );

  if (isBlocked) {
    throw new ScheduleError('Item is blocked by unfinished tasks');
  }

  const postponement: PostponementRecord = PostponementRecordSchema.parse({
    id: item.postponements.length + 1,
    originalDate: item.startDate,
    newDate,
    ...options
  });

  const duration = item.endDate.getTime() - item.startDate.getTime();
  const newEndDate = new Date(newDate.getTime() + duration);

  const updatedItem = ScheduleItemSchema.parse({
    ...item,
    startDate: newDate,
    endDate: newEndDate,
    postponements: [...item.postponements, postponement],
  });

  scheduleStore.items.set((prev) =>
    prev.map((item) => (item.id === id ? updatedItem : item))
  );

  await notificationHandlers.onPostponeItem(item.id);
};

export const updateItem = (id: number, updates: Partial<ScheduleItem>): void => {
  scheduleStore.items.set((prev) =>
    prev.map((item) => (item.id === id ? ScheduleItemSchema.parse({ ...item, ...updates }) : item))
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
    // completedAt: undefined,
    // startedAt: undefined,
    // actualDuration: undefined,
  });
};

export const getOverdueTasks = (): ScheduleItem[] => {
  const now = new Date();
  return scheduleStore.items.get().filter((item) => !item.completed && isBefore(item.endDate, now));
};

export const getUpcomingTasks = (days: number = 7): ScheduleItem[] => {
  const now = new Date();
  const futureDate = addDays(now, days);
  return scheduleStore.items.get().filter(
    (item) =>
      !item.completed && isAfter(item.startDate, now) && isBefore(item.startDate, futureDate)
  );
};

export const getTasksByPriority = (priority: PriorityLevel): ScheduleItem[] => {
  return scheduleStore.items.get().filter((item) => !item.completed && item.priority === priority);
};

export const getBlockedTasks = (): ScheduleItem[] => {
  return scheduleStore.items.get().filter(
    (item) =>
      !item.completed &&
      item.blockedBy?.some((id) => !scheduleStore.items.get().find((i) => i.id === id)?.completed)
  );
};

export const resetForm = () => {
  scheduleStore.newItem.set({
    title: '',
    description: '',
    type: 'Work',
    priority: 'Medium',
    scheduleType: 'task',
    duration: 30,
    location: '',
    tags: [],
    notes: '',
    reminder: 15,
    recurrence: 'None',
  });
  scheduleStore.isAddingItem.set(false);
};

export const handleAddItem = async () => {
  const item = scheduleStore.newItem.get();
  if (!item) return;
  await createItem(item as CreateItemInput);
};

export const restoreDeletedItem = (id: number) => {
  const item = scheduleStore.deletedItems.get()?.find((item) => item.id === id);
  if (item) {
    const restoredItem = ScheduleItemSchema.parse({ ...item, deletedAt: undefined });
    scheduleStore.items.push(restoredItem);
    scheduleStore.deletedItems.set(
      scheduleStore.deletedItems.get()?.filter((item) => item.id !== id) || []
    );
  }
};

export const restoreCompletedItem = (id: number) => {
  const item = scheduleStore.completedItems.get()?.find((item) => item.id === id);
  if (item) {
    const restoredItem = ScheduleItemSchema.parse({ ...item, completed: false });
    scheduleStore.items.push(restoredItem);
    scheduleStore.completedItems.set(
      scheduleStore.completedItems.get()?.filter((item) => item.id !== id) || []
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

