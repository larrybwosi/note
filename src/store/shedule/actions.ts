// actions.ts
import { scheduleStore } from './store';
import { ScheduleItem, PostponementRecord } from './types';
import { addDays, isAfter, isBefore, addWeeks, addMonths, format, add, isValid } from 'date-fns';
import { notificationHandlers } from './notifications';

// Helper Functions
const generateId = (): number => {
  return Math.floor(Math.random() * 1000000);
};

const canPostpone = (item: ScheduleItem): boolean => {
  const maxPostponements = item.maxPostponements ?? 3;
  return (
    !item.completed &&
    item.postponements.length < maxPostponements &&
    !item.blockedBy?.some((id) => !scheduleStore.get().items.find((i) => i.id === id)?.completed)
  );
};

const getNextRecurringDate = (date: Date, pattern: string): Date => {
  switch (pattern) {
    case 'Daily':
      return addDays(date, 1);
    case 'Weekly':
      return addWeeks(date, 1);
    case 'Biweekly':
      return addWeeks(date, 2);
    case 'Monthly':
      return addMonths(date, 1);
    default:
      return date;
  }
};

// Performance Metric Calculations
const calculateStreakDays = (): number => {
  const items = scheduleStore.get().items;
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

const validateScheduleItem = (item: ScheduleItem): boolean => {
  if (!item.title || !item.startDate || !item.endDate) return false;
  if (!isValid(new Date(item.startDate)) || !isValid(new Date(item.endDate))) return false;
  if (new Date(item.startDate) >= new Date(item.endDate)) return false;
  return true;
};
// Main Action Functions
export const createItem = (
  item: Omit<ScheduleItem, 'id' | 'postponements' | 'completed' | 'inProgress'>
): void => {
  const newItem: ScheduleItem = {
    ...item,
    id: generateId(),
    postponements: [],
    completed: false,
    inProgress: false,
  };

  if (!validateScheduleItem(newItem)) return;
  if (newItem.recurrence !== 'None') {
    notificationHandlers.createRecurring({
      ...newItem,
      time: new Date(newItem.startDate),
      body: newItem.description,
      frequency: newItem.recurrence === 'Daily' ? 'daily' : 'weekly',
    });
  }

  notificationHandlers.onCreateItem(newItem);
  scheduleStore.items.set((prev) => [...prev, newItem]);

  updatePerformanceMetrics();
};

export const deleteItem = async (id: number): Promise<void> => {
  const item = scheduleStore.items.get().find((item) => item.id === id);
  if (item) {
    const deletedItem = { ...item, deletedAt: new Date() };
    scheduleStore.deletedItems.push(deletedItem);
    scheduleStore.items.set(scheduleStore.items.get().filter((item) => item.id !== id));
  }
  notificationHandlers.onDeleteItem(id);

  updatePerformanceMetrics();
};

export const markCompleted = async (id: number) => {
  const item = scheduleStore.get().items.find((item) => item.id === id);
  if (!item) return;

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
  id: number | string,
  newDate: Date,
  reason: string,
  reasonCategory: PostponementRecord['reasonCategory'],
  impact: PostponementRecord['impact']
) => {
  const item = scheduleStore.get().items.find((item) => item.id === id);
  if (!item || !canPostpone(item)) return;

  const postponement: PostponementRecord = {
    id: item.postponements.length + 1,
    originalDate: item.startDate,
    newDate,
    reason,
    reasonCategory,
    impact,
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
  updatePerformanceMetrics();
};

export const updateItem = (id: number, updates: Partial<ScheduleItem>): void => {
  scheduleStore.items.set((prev) =>
    prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
  );
  updatePerformanceMetrics();
};

const createRecurringInstance = (item: ScheduleItem): void => {
  const nextStartDate = getNextRecurringDate(item.startDate, item.recurrence);
  const duration = item.endDate.getTime() - item.startDate.getTime();
  const nextEndDate = new Date(nextStartDate.getTime() + duration);

  createItem({
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

export const handleAddItem = (): void => {
  const item = scheduleStore.newItem.get() as ScheduleItem;
  if (!item) return;
  createItem(item);
  resetForm();
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
