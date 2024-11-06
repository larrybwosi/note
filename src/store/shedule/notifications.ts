import notifee, {
  TimestampTrigger,
  TriggerType,
  AndroidImportance,
  AndroidStyle,
  AndroidCategory,
  AndroidColor,
  AndroidVisibility,
  EventType,
  AuthorizationStatus,
  RepeatFrequency,
} from '@notifee/react-native';
import { ScheduleItem } from './types';
import { format, subMinutes, differenceInMinutes } from 'date-fns';
import { startItem, postponeItem, markCompleted } from './actions';
import { scheduleStore } from './store';

// Notification styling constants
const NOTIFICATION_COLORS = {
  primary: '#2196F3',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#00BCD4',
} as const;

const PRIORITY_COLORS = {
  Critical: NOTIFICATION_COLORS.error,
  High: NOTIFICATION_COLORS.warning,
  Medium: NOTIFICATION_COLORS.primary,
  Low: NOTIFICATION_COLORS.info,
} as const;

const TASK_ICONS = {
  Work: '💼',
  Personal: '🏠',
  Health: '❤️',
  Learning: '📚',
  Social: '👥',
  Urgent: '⚡',
} as const;

// Enhanced channel setup with custom sounds and importance
export const setupNotificationChannels = async () => {
  const channels = [
    {
      id: 'schedule_default',
      name: 'Schedule Notifications',
      importance: AndroidImportance.DEFAULT,
      sound: 'notification',
      vibration: true,
      lights: true,
      lightColor: AndroidColor.BLUE,
      vibrationPattern: [300, 500],
    },
    {
      id: 'schedule_reminders',
      name: 'Schedule Reminders',
      importance: AndroidImportance.HIGH,
      sound: 'reminder',
      vibration: true,
      lights: true,
      lightColor: AndroidColor.YELLOW,
      vibrationPattern: [300, 500],
    },
    {
      id: 'schedule_urgent',
      name: 'Urgent Tasks',
      importance: AndroidImportance.HIGH,
      sound: 'urgent',
      vibration: true,
      lights: true,
      lightColor: AndroidColor.RED,
      vibrationPattern: [250, 250, 250, 250],
      bypassDnd: true,
    },
  ];

  try {
    // Get existing channels
    const existingChannels = await notifee.getChannels();
    const existingChannelIds = new Set(existingChannels.map(channel => channel.id));

    // Only create channels that don't exist
    for (const channel of channels) {
      if (!existingChannelIds.has(channel.id)) {
        await notifee.createChannel(channel);
      }
    }
  } catch (error) {
    console.error('Error setting up notification channels:', error);
    throw error;
  }
};

export const deleteAllChannels = async () => {
  try {
    const channels = await notifee.getChannels();
    await Promise.all(channels.map(channel => notifee.deleteChannel(channel.id)));
  } catch (error) {
    console.error('Error deleting notification channels:', error);
    throw error;
  }
}

const getChannelId = (priority: ScheduleItem['priority']): string => {
  switch (priority) {
    case 'Critical':
      return 'schedule_urgent';
    case 'High':
      return 'schedule_reminders';
    default:
      return 'schedule_default';
  }
};



// Enhanced notification for scheduled items with more informative content
export const scheduleItemNotification = async (item: ScheduleItem): Promise<string> => {
  const trigger: TimestampTrigger = {
    type: TriggerType.TIMESTAMP,
    timestamp: item.startDate.getTime(),
    alarmManager: true,
  };

  const notificationId = await notifee.createTriggerNotification(
    {
      id: `item_${item.id}`,
      title: `${TASK_ICONS[item.type]} ${item.title} - ${item.priority} Priority`,
      body: `Starting in ${differenceInMinutes(item.startDate, new Date())} minutes`,
      android: {
        channelId: getChannelId(item.priority),
        importance: AndroidImportance.HIGH,
        style: {
          type: AndroidStyle.BIGTEXT,
          text: `📝 ${item.description}\n\n⏰ Start: ${format(item.startDate, 'MMM d, h:mm a')}\n⌛ Duration: ${item.estimatedDuration} minutes\n📍 ${item.location || 'No location set'}\n🏷️ ${item.tags.join(', ') || 'No tags'}\n\nTap to view details or take action.`,
        },
        color: PRIORITY_COLORS[item.priority],
        category: AndroidCategory.EVENT,
        visibility: AndroidVisibility.PUBLIC,
        pressAction: {
          id: 'default',
          launchActivity: 'default',
        },
        actions: [
          {
            title: '▶️ Start Now',
            pressAction: { id: 'start' },
          },
          {
            title: '⏭️ Postpone',
            pressAction: { id: 'postpone' },
          },
          {
            title: '✅ Complete',
            pressAction: { id: 'complete' },
          },
        ],
        smallIcon: 'ic_notification',
        largeIcon: `task_icon_${item.type.toLowerCase()}`,
      },
      data: {
        itemId: item.id.toString(),
        type: 'schedule_item',
      },
    },
    trigger,
  );

  if (item.reminder) {
    await scheduleReminder(item);
  }

  return notificationId;
};

// Enhanced reminder notification with more context
const scheduleReminder = async (item: ScheduleItem) => {
  const reminderTime = subMinutes(item.startDate, item.reminder!);
  const trigger: TimestampTrigger = {
    type: TriggerType.TIMESTAMP,
    timestamp: reminderTime.getTime(),
    alarmManager: true,
  };

  await notifee.createTriggerNotification(
    {
      id: `reminder_${item.id}`,
      title: `⏰ Reminder: ${item.title} - Starting Soon`,
      body: `Your ${item.priority} priority task begins in ${item.reminder} minutes`,
      android: {
        channelId: 'schedule_reminders',
        style: {
          type: AndroidStyle.BIGTEXT,
          text: `🔔 Upcoming ${item.type.toLowerCase()} task:\n\n📝 ${item.description}\n⏰ Starts at ${format(item.startDate, 'h:mm a')}\n⌛ Duration: ${item.estimatedDuration} minutes\n📍 ${item.location || 'No location set'}\n\nAre you ready to begin?`,
        },
        color: PRIORITY_COLORS[item.priority],
        category: AndroidCategory.REMINDER,
        visibility: AndroidVisibility.PUBLIC,
        actions: [
          {
            title: '👍 I\'m Ready',
            pressAction: { id: 'acknowledge' },
          },
          {
            title: '⏭️ Need More Time',
            pressAction: { id: 'postpone' },
          },
        ],
      },
      data: {
        itemId: item.id.toString(),
        type: 'reminder',
      },
    },
    trigger,
  );
};

const cancelItemNotifications = async (itemId: number) => {
  await notifee.cancelNotification(`item_${itemId}`);
  await notifee.cancelNotification(`reminder_${itemId}`);
};

// Enhanced completion notification with more detailed feedback
export const showCompletionNotification = async (item: ScheduleItem): Promise<void> => {
  await cancelItemNotifications(item.id);

  const duration = item.actualDuration || item.estimatedDuration;
  const efficiency = item.actualDuration
    ? Math.round((item.estimatedDuration / item.actualDuration) * 100)
    : 100;

  await notifee.displayNotification({
    title: `🎉 Task Complete: ${item.title}`,
    body: `Great job on finishing this ${item.priority} priority ${item.type.toLowerCase()} task!`,
    android: {
      channelId: 'schedule_default',
      style: {
        type: AndroidStyle.BIGTEXT,
        text: `✨ Task completed successfully!\n\n⏱️ Actual Duration: ${duration} minutes\n📊 Efficiency: ${efficiency}%\n🎯 Estimated: ${item.estimatedDuration} minutes\n\n${efficiency > 100 ? '💪 You completed the task faster than estimated!' : efficiency === 100 ? '👍 You completed the task right on time!' : `💡 The task took ${Math.round((item.actualDuration! / item.estimatedDuration) * 100 - 100)}% longer than estimated.`}\n\nTap to add notes or review your performance.`,
      },
      color: NOTIFICATION_COLORS.success,
      category: AndroidCategory.STATUS,
      visibility: AndroidVisibility.PUBLIC,
      actions: [
        {
          title: '📝 Add Notes',
          pressAction: { id: 'add_notes' },
        },
        {
          title: '📊 View Stats',
          pressAction: { id: 'view_stats' },
        },
      ],
    },
  });
};

// Enhanced overdue notification with more urgency and options
export const showOverdueNotification = async (item: ScheduleItem): Promise<void> => {
  const overdueDuration = differenceInMinutes(new Date(), item.endDate);
  
  await notifee.displayNotification({
    title: `⚠️ Overdue Alert: ${item.title}`,
    body: `Urgent: This ${item.priority} priority task is ${Math.round(overdueDuration / 60)} hours overdue`,
    android: {
      channelId: getChannelId(item.priority),
      style: {
        type: AndroidStyle.BIGTEXT,
        text: `⚠️ Immediate attention required!\n\n📝 ${item.description}\n⏰ Was due: ${format(item.endDate, 'MMM d, h:mm a')}\n⚡ Priority: ${item.priority}\n⌛ Overdue by: ${Math.round(overdueDuration / 60)} hours\n\nPlease take action now to address this overdue task.`,
      },
      color: NOTIFICATION_COLORS.error,
      category: AndroidCategory.ALARM,
      visibility: AndroidVisibility.PUBLIC,
      actions: [
        {
          title: '▶️ Start Now',
          pressAction: { id: 'start' },
        },
        {
          title: '📅 Reschedule',
          pressAction: { id: 'postpone' },
        },
        {
          title: '❌ Cancel Task',
          pressAction: { id: 'cancel' },
        },
      ],
    },
    data: {
      itemId: item.id.toString(),
      type: 'overdue',
    },
  });
};

// Enhanced start notification with more context and options
const showStartNotification = async (item: ScheduleItem) => {
  await notifee.displayNotification({
    title: `🚀 Task Starting: ${item.title}`,
    body: `Your ${item.priority} priority ${item.type.toLowerCase()} task is beginning now`,
    android: {
      channelId: getChannelId(item.priority),
      style: {
        type: AndroidStyle.BIGTEXT,
        text: `🚀 It's time to start your task!\n\n📝 ${item.description}\n⏰ Scheduled start: ${format(item.startDate, 'h:mm a')}\n⌛ Estimated duration: ${item.estimatedDuration} minutes\n📍 ${item.location || 'No location set'}\n\nAre you ready to begin? Tap to view task details or take action.`,
      },
      color: PRIORITY_COLORS[item.priority],
      category: AndroidCategory.REMINDER,
      visibility: AndroidVisibility.PUBLIC,
      actions: [
        {
          title: '👍 Start Now',
          pressAction: { id: 'start_now' },
        },
        {
          title: '⏭️ Delay 15min',
          pressAction: { id: 'delay_15' },
        },
        {
          title: '📅 Reschedule',
          pressAction: { id: 'reschedule' },
        },
      ],
    },
    data: {
      itemId: item.id.toString(),
      type: 'start',
    },
  });
};


// New function to create a recurring notification
interface CreateRecurringNotificationProps {
  title: string;
  body: string;
  frequency: 'daily' | 'weekly';
  time: Date;
  priority: "Low" | "Medium" | "High" | "Critical";
}
export const createRecurringNotification = async ({
time,
title,
body,
frequency,
priority
}:CreateRecurringNotificationProps
  ): Promise<string> => {
  let trigger: TimestampTrigger = {
    type: TriggerType.TIMESTAMP,
    timestamp: time.getTime(),
    repeatFrequency: 
      frequency === 'daily' ? RepeatFrequency.DAILY :
      frequency === 'weekly' ? RepeatFrequency.WEEKLY :
      RepeatFrequency.WEEKLY,
    alarmManager: true,
  };

  const notificationId = await notifee.createTriggerNotification(
    {
      title,
      body,
      android: {
        channelId: getChannelId(priority),
        importance: AndroidImportance.HIGH,
        pressAction: {
          id: 'default',
        },
      },
    },
    trigger
  );

  return notificationId;
};

const showTaskStartNotification = async (itemId: number) => {
  const item = scheduleStore.get().items.find(i => i.id === itemId);
  if (!item) return;
  await showStartNotification(item);
  await showOverdueNotification(item);
}
// Enhanced background handler

export const setupBackgroundHandler = () => {
   notifee.onBackgroundEvent(async ({ type, detail }) => {
    const { notification, pressAction } = detail;
    console.log('onBackgroundEvent', type, detail);
    
    if (!notification?.data?.itemId) return;
    
    const itemId = parseInt(notification.data.itemId as string, 10);
    
    switch (type) {
      case EventType.ACTION_PRESS:
        switch (pressAction?.id) {
          case 'start':
          case 'start_now':
            await startItem(itemId);
            await showTaskStartNotification(itemId);
            break;
            
          case 'postpone':
          case 'delay_15':
            const delayMinutes = pressAction?.id === 'delay_15' ? 15 : 30;
            const newDate = new Date(Date.now() + delayMinutes * 60 * 1000);
            await postponeItem(itemId, newDate, `Postponed by ${delayMinutes} minutes via notification`, 'Other', 'Low');
            break;
            
          case 'complete':
            await markCompleted(itemId);
            const item = scheduleStore.get().items.find(i => i.id === itemId);
            if (item) await showCompletionNotification(item);
            break;

          case 'reschedule':
            // Implement logic to open rescheduling interface
            console.log('Open rescheduling interface for item:', itemId);
            break;

          case 'cancel':
            // Implement logic to cancel the task
            console.log('Cancelling task:', itemId);
            break;

          case 'add_notes':
            // Implement logic to open notes interface
            console.log('Opening notes interface for item:', itemId);
            break;

          case 'view_stats':
            // Implement logic to show task statistics
            console.log('Showing statistics for item:', itemId);
            break;
        }
        break;
    }
  });
};

// Initialize notifications with permission handling
export const initializeNotifications = async () => {
  const settings = await notifee.requestPermission();

  if (settings.authorizationStatus === AuthorizationStatus.DENIED) {
    console.log('User denied notifications permission');
    return false;
  }

  await setupNotificationChannels();
  setupBackgroundHandler();
  
  return true;
};


const updatePostponedItemNotifications = async (itemId: number) => {
  await updatePostponedItemNotifications(itemId);
  const item = scheduleStore.get().items.find(i => i.id === itemId);
  await showOverdueNotification(item!);
}

export const notificationHandlers = {
  onCreateItem: scheduleItemNotification,
  onDeleteItem: cancelItemNotifications,
  onPostponeItem: updatePostponedItemNotifications,
  onCompleteItem: showCompletionNotification,
  onStartItem: showTaskStartNotification,
  onItemOverdue: showOverdueNotification,
  createRecurring: createRecurringNotification
};

// Example usage of the new recurring notification function
export const setupDailyReminder = async () => {
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