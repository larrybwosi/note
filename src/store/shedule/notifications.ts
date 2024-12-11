import notifee, {
  TimestampTrigger,
  TriggerType,
  AndroidImportance,
  AndroidStyle,
  AndroidCategory,
  AndroidVisibility,
  RepeatFrequency,
  AndroidAction,
  Notification
} from '@notifee/react-native';
import { format, subMinutes, differenceInMinutes } from 'date-fns';
import { scheduleStore } from './store';
import {
  ScheduleItem,
  CreateRecurringNotificationProps,
  PriorityLevel,
  TaskType,
} from './types';

// Type-safe notification colors
const NOTIFICATION_COLORS = {
  primary: '#2196F3',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#00BCD4',
} as const;

type NotificationColor = typeof NOTIFICATION_COLORS[keyof typeof NOTIFICATION_COLORS];

const PRIORITY_COLORS: Record<PriorityLevel, NotificationColor> = {
  Critical: NOTIFICATION_COLORS.error,
  High: NOTIFICATION_COLORS.warning,
  Medium: NOTIFICATION_COLORS.primary,
  Low: NOTIFICATION_COLORS.info,
};

const TASK_ICONS: Record<TaskType, string> = {
  Work: '💼',
  Personal: '🏠',
  Health: '❤️',
  Learning: '📚',
  Social: '👥',
  Urgent: '⚡',
};

interface NotificationContent {
  title: string;
  body: string;
  style: {
    text: string;
  };
  actions?: AndroidAction[];
}

// Type-safe notification content configurations
const NOTIFICATION_CONTENT: {
  scheduleItem: (item: ScheduleItem) => NotificationContent;
  reminder: (item: ScheduleItem) => NotificationContent;
  completion: (item: ScheduleItem) => NotificationContent;
  overdue: (item: ScheduleItem) => NotificationContent;
  startTask: (item: ScheduleItem) => NotificationContent;
} = {
  scheduleItem: (item: ScheduleItem): NotificationContent => ({
    title: `${TASK_ICONS[item.type]} ${item.title} - ${item.priority} Priority`,
    body: `Starting in ${differenceInMinutes(item.startDate, new Date())} minutes`,
    style: {
      text: `📝 ${item.description}\n⏰ Start: ${format(item.startDate, 'MMM d, h:mm a')}\n⌛ Duration: ${item.duration} minutes\n📍 ${item.location || 'No location'}\n🏷️ ${item?.tags?.join(', ') || 'No tags'}\n\nTap for details or actions.`,
    },
    actions: [
      { title: '▶️ Start', pressAction: { id: 'start' } },
      { title: '⏭️ Postpone', pressAction: { id: 'postpone' } },
      { title: '✅ Complete', pressAction: { id: 'complete' } },
    ],
  }),

  reminder: (item: ScheduleItem): NotificationContent => ({
    title: `⏰ Reminder: ${item.title}`,
    body: `${item.priority} priority task in ${item.reminder} minutes`,
    style: {
      text: `🔔 ${item.type} task:\n📝 ${item.description}\n⏰ Starts: ${format(item.startDate, 'h:mm a')}\n⌛ Duration: ${item.duration} min\n📍 ${item.location || 'No location'}\n\nReady to start?`,
    },
    actions: [
      { title: "👍 Ready", pressAction: { id: 'acknowledge' } },
      { title: '⏭️ Postpone', pressAction: { id: 'postpone' } },
    ],
  }),

  completion: (item: ScheduleItem): NotificationContent => ({
    title: `🎉 Completed: ${item.title}`,
    body: `Great job on this ${item.priority} priority task!`,
    style: {
      text: `✨ Task completed!\n⏱️ Duration: ${item.actualDuration || item.estimatedDuration} min\n📊 Efficiency: ${Math.round(((item.estimatedDuration / (item.actualDuration || item.estimatedDuration)) * 100))}%\n\nTap to add notes or review.`,
    },
    actions: [
      { title: '📝 Add Notes', pressAction: { id: 'add_notes' } },
      { title: '📊 View Stats', pressAction: { id: 'view_stats' } },
    ],
  }),

  overdue: (item: ScheduleItem): NotificationContent => ({
    title: `⚠️ Overdue: ${item.title}`,
    body: `${item.priority} priority task is ${Math.round(differenceInMinutes(new Date(), item.endDate) / 60)} hours overdue`,
    style: {
      text: `⚠️ Attention needed!\n📝 ${item.description}\n⏰ Due: ${format(item.endDate, 'MMM d, h:mm a')}\n⚡ Priority: ${item.priority}\n⌛ Overdue: ${Math.round(differenceInMinutes(new Date(), item.endDate) / 60)} hours\n\nPlease take action now.`,
    },
    actions: [
      { title: '▶️ Start', pressAction: { id: 'start' } },
      { title: '📅 Reschedule', pressAction: { id: 'postpone' } },
      { title: '❌ Cancel', pressAction: { id: 'cancel' } },
    ],
  }),

  startTask: (item: ScheduleItem): NotificationContent => ({
    title: `🚀 Starting: ${item.title}`,
    body: `${item.priority} priority ${item.type.toLowerCase()} task begins now`,
    style: {
      text: `🚀 Time to start!\n📝 ${item.description}\n⏰ Start: ${format(item.startDate, 'h:mm a')}\n⌛ Duration: ${item.duration} min\n📍 ${item.location || 'No location'}\n\nReady to begin?`,
    },
    actions: [
      { title: '👍 Start', pressAction: { id: 'start_now' } },
      { title: '⏭️ Delay 15min', pressAction: { id: 'delay_15' } },
      { title: '📅 Reschedule', pressAction: { id: 'reschedule' } },
    ],
  }),
};
interface CreateNotificationProps {
  id: string;
  content: NotificationContent;
  channelId: string;
  priority: PriorityLevel;
  trigger?: TimestampTrigger;
  type?: AndroidStyle;
  category?: AndroidCategory;
  importance?: AndroidImportance;
  visibility?: AndroidVisibility;
  data?: Record<string, string>;
}

// Utility functions
const getChannelId = (priority: PriorityLevel): string => {
  switch (priority) {
    case 'Critical':
      return 'schedule_urgent';
    case 'High':
      return 'schedule_reminders';
    default:
      return 'schedule_default';
  }
};

// Core notification creation function
const createNotification = async ({
  id,
  content,
  channelId,
  priority,
  trigger,
  type = AndroidStyle.BIGTEXT,
  category = AndroidCategory.EVENT,
  importance = AndroidImportance.HIGH,
  visibility = AndroidVisibility.PUBLIC,
  data = {},
}: CreateNotificationProps): Promise<string> => {
  const notification: Notification = {
    id,
    title: content.title,
    body: content.body,
    android: {
      channelId,
      importance,
      style: {
        type: AndroidStyle.BIGTEXT,
        text: content.style.text,
      },
      color: PRIORITY_COLORS[priority],
      category,
      visibility,
      pressAction: {
        id: 'default',
        launchActivity: 'default',
      },
      actions: content.actions,
      smallIcon: 'ic_notification',
    },
    data,
  };

  return trigger
    ? await notifee.createTriggerNotification(notification, trigger)
    : await notifee.displayNotification(notification);
};

// Notification handler functions
export const scheduleItemNotification = async (item: ScheduleItem): Promise<string> => {
  if (!item || !item.startDate) {
    console.error('Invalid item or start date');
    return '';
  }

  const now = new Date().getTime();
  const startTime = item.startDate.getTime();

  if (startTime <= now) {
    console.warn('Cannot schedule notification for past or current time');
    return '';
  }

  const trigger: TimestampTrigger = {
    type: TriggerType.TIMESTAMP,
    timestamp: startTime,
    alarmManager: {
      allowWhileIdle: true,
    },
  };

  try {
    const notificationId = await createNotification({
      id: `item_${item.id}`,
      content: NOTIFICATION_CONTENT.scheduleItem(item),
      channelId: getChannelId(item.priority),
      priority: item.priority,
      trigger,
      data: {
        itemId: item.id.toString(),
        type: 'schedule_item',
      },
    });

    if (item.reminder && typeof item.reminder === 'number') {
      await scheduleReminder(item);
    }

    return notificationId;
  } catch (error) {
    console.error('Failed to schedule item notification:', error);
    return '';
  }
};

const scheduleReminder = async (item: ScheduleItem): Promise<void> => {
  if (!item.reminder) return;

  const reminderTime = subMinutes(item.startDate, item.reminder);
  const trigger: TimestampTrigger = {
    type: TriggerType.TIMESTAMP,
    timestamp: reminderTime.getTime(),
    alarmManager: true,
  };

  await createNotification({
    id: `reminder_${item.id}`,
    content: NOTIFICATION_CONTENT.reminder(item),
    channelId: 'schedule_reminders',
    priority: item.priority,
    trigger,
    category: AndroidCategory.REMINDER,
    data: {
      itemId: item.id.toString(),
      type: 'reminder',
    },
  });
};

export const showCompletionNotification = async (item: ScheduleItem): Promise<void> => {
  await cancelItemNotifications(item.id);
  await createNotification({
    id: `completion_${item.id}`,
    content: NOTIFICATION_CONTENT.completion(item),
    channelId: 'schedule_default',
    priority: item.priority,
    category: AndroidCategory.STATUS,
  });
};

export const showOverdueNotification = async (item: ScheduleItem): Promise<void> => {
  await createNotification({
    id: `overdue_${item.id}`,
    content: NOTIFICATION_CONTENT.overdue(item),
    channelId: getChannelId(item.priority),
    priority: item.priority,
    category: AndroidCategory.ALARM,
    data: {
      itemId: item.id.toString(),
      type: 'overdue',
    },
  });
};

const showStartNotification = async (item: ScheduleItem): Promise<void> => {
  await createNotification({
    id: `start_${item.id}`,
    content: NOTIFICATION_CONTENT.startTask(item),
    channelId: getChannelId(item.priority),
    priority: item.priority,
    category: AndroidCategory.REMINDER,
    data: {
      itemId: item.id.toString(),
      type: 'start',
    },
  });
};

const cancelItemNotifications = async (itemId: number): Promise<void> => {
  await notifee.cancelNotification(`item_${itemId}`);
  await notifee.cancelNotification(`reminder_${itemId}`);
};

const showTaskStartNotification = async (itemId: number): Promise<void> => {
  const item = scheduleStore.get().items.find((i) => i.id === itemId);
  if (!item) return;
  await showStartNotification(item);
  await showOverdueNotification(item);
};

const updatePostponedItemNotifications = async (itemId: number): Promise<void> => {
  const item = scheduleStore.get().items.find((i) => i.id === itemId);
  if (!item) return;
  await scheduleItemNotification(item);
};

export const createRecurringNotification = async ({
  time,
  title,
  body,
  frequency,
  priority,
}: CreateRecurringNotificationProps): Promise<string> => {
  const trigger: TimestampTrigger = {
    type: TriggerType.TIMESTAMP,
    timestamp: time.getTime(),
    repeatFrequency: frequency === 'daily' ? RepeatFrequency.DAILY : RepeatFrequency.WEEKLY,
    alarmManager: true,
  };

  return await createNotification({
    id: `recurring_${Date.now()}`,
    content: {
      title,
      body,
      style: { text: body },
    },
    channelId: getChannelId(priority),
    priority,
    trigger,
  });
};

export const notificationHandlers = {
  onCreateItem: scheduleItemNotification,
  onDeleteItem: cancelItemNotifications,
  onPostponeItem: updatePostponedItemNotifications,
  onCompleteItem: showCompletionNotification,
  onStartItem: showTaskStartNotification,
  onItemOverdue: showOverdueNotification,
  createRecurring: createRecurringNotification,
};

export const setupDailyReminder = async (): Promise<void> => {
  const reminderTime = new Date();
  reminderTime.setHours(9, 0, 0, 0); // Set to 9:00 AM

  await createRecurringNotification({
    time: reminderTime,
    title: '📅 Daily Reminder',
    body: 'Remember to complete your daily tasks!',
    frequency: 'daily',
    priority: 'Low',
  });
};