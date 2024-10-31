import notifee, {
  TimestampTrigger,
  TriggerType,
  AndroidStyle,
  AndroidImportance,
  AndroidCategory,
  AndroidVisibility,
  AndroidGroupAlertBehavior
} from '@notifee/react-native';
import { addMonths, addWeeks, addDays, format } from 'date-fns';
import { RecurrencePattern, ScheduleItem } from 'src/storage/schedule';

export const createScheduleNotification = async (scheduleItem : ScheduleItem) => {
  // Create a notification channel for schedule items
  const channelId = await notifee.createChannel({
    id: 'schedule_items',
    name: 'Schedule Notifications',
    lights: true,
    vibration: true,
    importance: AndroidImportance.HIGH,
    sound: 'default',
  });

  // Create a trigger for the reminder time if set
  let trigger;
  if (scheduleItem.reminder) {
    trigger = {
      type: TriggerType.TIMESTAMP,
      timestamp: scheduleItem.reminder.toString(),
    };
  }

  // Create the notification icon based on task type
  const getTaskIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'work': return '💼';
      case 'meeting': return '👥';
      case 'break': return '☕';
      case 'exercise': return '🏃';
      default: return '📝';
    }
  };

  // Format the time information
  const timeInfo = `${format(scheduleItem.startDate, 'h:mm a')} - ${format(scheduleItem.endDate, 'h:mm a')}`;
  
  // Create priority styling
  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return '#FF4444';
      case 'medium': return '#FFA000';
      case 'low': return '#4CAF50';
      default: return '#757575';
    }
  };

  // Create the main notification
  await notifee.displayNotification({
    title: `${getTaskIcon(scheduleItem.type)} ${scheduleItem.title}`,
    body: scheduleItem.description || 'No description provided',
    android: {
      channelId,
      smallIcon: 'ic_notification',
      largeIcon: scheduleItem.type.toLowerCase(),
      style: {
        type: AndroidStyle.BIGTEXT,
        text: `📅 ${timeInfo}\n${scheduleItem.description || 'No description provided'}\n\n${
          scheduleItem.location ? `📍 ${scheduleItem.location}\n` : ''
        }⏱️ Duration: ${scheduleItem.duration} minutes\n${
          scheduleItem.tags.length > 0 ? `🏷️ ${scheduleItem.tags.join(', ')}\n` : ''
        }🔋 Energy Level: ${scheduleItem.energy}`,
      },
      pressAction: {
        id: 'default',
      },
      actions: [
        {
          title: 'Mark Complete',
          pressAction: {
            id: 'mark_complete',
          },
        },
        {
          title: 'Snooze',
          pressAction: {
            id: 'snooze',
          },
        },
      ],
      progress: {
        max: 100,
        current: 0,
      },
      category: AndroidCategory.EVENT,
      visibility: AndroidVisibility.PUBLIC,
      color: getPriorityColor(scheduleItem.priority),
      importance: AndroidImportance.HIGH,
      timestamp: scheduleItem.startDate.getTime(),
      lightUpScreen: true,
      groupAlertBehavior: AndroidGroupAlertBehavior.CHILDREN,
    },
    ios: {
      categoryId: 'schedule_item',
      threadId: 'schedule_items',
      attachments: [],
      sound: 'default',
      critical: scheduleItem.priority.toLowerCase() === 'high',
    },
  });
};


interface NotificationScheduleResult {
  success: boolean;
  notificationIds: string[];
  error?: string;
}

export const createRecurringNotification = async (
  scheduleItem: ScheduleItem,
  recurrencePattern: RecurrencePattern,
  numberOfOccurrences: number = 1
): Promise<NotificationScheduleResult> => {
  try {
    const notificationIds: string[] = [];

    // Create a notification channel for schedule items
    const channelId = await notifee.createChannel({
      id: 'schedule_items',
      name: 'Schedule Notifications',
      lights: true,
      vibration: true,
      importance: AndroidImportance.HIGH,
      sound: 'default',
    });

    // Helper function to get next occurrence date based on recurrence pattern
    const getNextOccurrence = (currentDate: Date, pattern: RecurrencePattern): Date => {
      switch (pattern) {
        case 'Daily':
          return addDays(currentDate, 1);
        case 'Weekly':
          return addWeeks(currentDate, 1);
        case 'Biweekly':
          return addWeeks(currentDate, 2);
        case 'Monthly':
          return addMonths(currentDate, 1);
        default:
          return currentDate;
      }
    };

    // Calculate reminder time offset in milliseconds
    const reminderOffset = scheduleItem.reminder ? scheduleItem.reminder * 60 * 1000 : 0;

    // Create notifications for each occurrence
    let currentDate = new Date(scheduleItem.startDate);
    let currentEndDate = new Date(scheduleItem.endDate);

    for (let i = 0; i < numberOfOccurrences; i++) {
      // Create triggers for both the main event and reminder
      if (reminderOffset > 0) {
        const reminderTrigger: TimestampTrigger = {
          type: TriggerType.TIMESTAMP,
          timestamp: currentDate.getTime() - reminderOffset,
        };

        // Schedule reminder notification
        const reminderId = await notifee.createTriggerNotification(
          {
            title: `⏰ Reminder: ${scheduleItem.title}`,
            body: `Starting in ${scheduleItem.reminder} minutes`,
            android: {
              channelId,
              smallIcon: 'ic_notification',
              importance: AndroidImportance.HIGH,
              sound: 'default',
            },
          },
          reminderTrigger
        );
        notificationIds.push(reminderId);
      }

      // Create the main event notification
      const timeInfo = `${format(currentDate, 'h:mm a')} - ${format(currentEndDate, 'h:mm a')}`;
      
      const getPriorityColor = (priority: string) => {
        switch (priority.toLowerCase()) {
          case 'high': return '#FF4444';
          case 'medium': return '#FFA000';
          case 'low': return '#4CAF50';
          default: return '#757575';
        }
      };

      const getTaskIcon = (type: string) => {
        switch (type.toLowerCase()) {
          case 'work': return '💼';
          case 'meeting': return '👥';
          case 'break': return '☕';
          case 'exercise': return '🏃';
          default: return '📝';
        }
      };

      const mainNotificationId = await notifee.createTriggerNotification(
        {
          title: `${getTaskIcon(scheduleItem.type)} ${scheduleItem.title}`,
          body: scheduleItem.description || 'No description provided',
          android: {
            channelId,
            smallIcon: 'ic_notification',
            largeIcon: scheduleItem.type.toLowerCase(),
            style: {
              type: AndroidStyle.BIGTEXT,
              text: `📅 ${timeInfo}\n${scheduleItem.description || 'No description provided'}\n\n${
                scheduleItem.location ? `📍 ${scheduleItem.location}\n` : ''
              }⏱️ Duration: ${scheduleItem.duration} minutes\n${
                scheduleItem.tags.length > 0 ? `🏷️ ${scheduleItem.tags.join(', ')}\n` : ''
              }🔋 Energy Level: ${scheduleItem.energy}`,
            },
            pressAction: {
              id: 'default',
            },
            actions: [
              {
                title: 'Mark Complete',
                pressAction: {
                  id: 'mark_complete',
                },
              },
              {
                title: 'Snooze',
                pressAction: {
                  id: 'snooze',
                },
              },
            ],
            category: AndroidCategory.EVENT,
            visibility: AndroidVisibility.PUBLIC,
            color: getPriorityColor(scheduleItem.priority),
            importance: AndroidImportance.HIGH,
            timestamp: currentDate.getTime(),
            lightUpScreen: true,
            groupAlertBehavior: AndroidGroupAlertBehavior.CHILDREN,
          },
          ios: {
            categoryId: 'schedule_item',
            threadId: 'schedule_items',
            attachments: [],
            sound: 'default',
            critical: scheduleItem.priority.toLowerCase() === 'high',
          },
        },
        {
          type: TriggerType.TIMESTAMP,
          timestamp: currentDate.getTime(),
        }
      );
      notificationIds.push(mainNotificationId);

      // Calculate next occurrence dates
      currentDate = getNextOccurrence(currentDate, recurrencePattern);
      currentEndDate = getNextOccurrence(currentEndDate, recurrencePattern);
    }

    return {
      success: true,
      notificationIds,
    };
  } catch (error) {
    return {
      success: false,
      notificationIds: [],
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
};

// Helper function to cancel all notifications for a schedule item
export const cancelScheduleNotifications = async (notificationIds: string[]) => {
  try {
    await Promise.all(notificationIds.map(id => notifee.cancelNotification(id)));
    return true;
  } catch (error) {
    console.error('Error canceling notifications:', error);
    return false;
  }
};