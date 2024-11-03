import notifee, {
  TimestampTrigger,
  TriggerType,
  AndroidStyle,
  AndroidImportance,
  AndroidCategory,
  AndroidVisibility,
  AndroidGroupAlertBehavior,
  DisplayedNotification,
} from '@notifee/react-native';
import { addMonths, addWeeks, addDays, format, isValid } from 'date-fns';
import { RecurrencePattern, ScheduleItem } from 'src/storage/schedule';

// Enhanced error handling with custom error class
class NotificationError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'NotificationError';
  }
}

// Notification configuration types
interface NotificationTheme {
  taskIcons: Record<string, string>;
  priorityColors: Record<string, string>;
  defaultIcon: string;
  defaultColor: string;
}

const notificationTheme: NotificationTheme = {
  taskIcons: {
    work: '💼',
    meeting: '👥',
    break: '☕',
    exercise: '🏃',
    study: '📚',
    personal: '🏠',
    health: '🏥',
    social: '🎭',
    shopping: '🛒',
    travel: '✈️',
  },
  priorityColors: {
    high: '#FF4444',
    medium: '#FFA000',
    low: '#4CAF50',
    default: '#757575',
  },
  defaultIcon: '📝',
  defaultColor: '#757575',
};

// Utility functions
const validateScheduleItem = (item: ScheduleItem): boolean => {
  if (!item.title || !item.startDate || !item.endDate) return false;
  if (!isValid(new Date(item.startDate)) || !isValid(new Date(item.endDate))) return false;
  if (new Date(item.startDate) >= new Date(item.endDate)) return false;
  return true;
};

const formatTimeRange = (start: Date, end: Date): string => {
  return `${format(new Date(start), 'h:mm a')} - ${format(new Date(end), 'h:mm a')}`;
};

const getNotificationStyle = (item: ScheduleItem) => {
  const timeInfo = formatTimeRange(item.startDate, item.endDate);
  const icon = notificationTheme.taskIcons[item.type.toLowerCase()] || notificationTheme.defaultIcon;
  const color = notificationTheme.priorityColors[item.priority.toLowerCase()] || notificationTheme.defaultColor;
  
  return { icon, color, timeInfo };
};

// Main notification creation function with enhanced error handling
export const createScheduleNotification = async (scheduleItem: ScheduleItem): Promise<string> => {
  try {
    if (!validateScheduleItem(scheduleItem)) {
      throw new NotificationError('Invalid schedule item data', 'INVALID_DATA');
    }

    const channelId = await notifee.createChannel({
      id: `schedule_${scheduleItem.type.toLowerCase()}`,
      name: `${scheduleItem.type} Notifications`,
      lights: true,
      vibration: true,
      importance: AndroidImportance.HIGH,
      sound: 'default',
    });

    const { icon, color, timeInfo } = getNotificationStyle(scheduleItem);

    const notificationId = await notifee.displayNotification({
      id: `schedule_${scheduleItem.id}`,
      title: `${icon} ${scheduleItem.title}`,
      body: scheduleItem.description || 'No description provided',
      android: {
        channelId,
        // smallIcon: 'ic_notification',
        largeIcon: scheduleItem.type.toLowerCase(),
        style: {
          type: AndroidStyle.BIGTEXT,
          text: `📅 ${timeInfo}\n${scheduleItem.description || 'No description provided'}\n\n${
            scheduleItem.location ? `📍 ${scheduleItem.location}\n` : ''
          }⏱️ Duration: ${scheduleItem.duration} minutes\n${
            scheduleItem.tags.length > 0 ? `🏷️ ${scheduleItem.tags.join(', ')}\n` : ''
          }🔋 Energy Level: ${scheduleItem.energy}${
            scheduleItem.notes ? `\n📝 Notes: ${scheduleItem.notes}` : ''
          }`,
        },
        pressAction: {
          id: 'default',
          launchActivity: 'default',
        },
        actions: [
          {
            title: '✅ Complete',
            pressAction: { id: 'mark_complete' },
          },
          {
            title: '⏰ Snooze',
            pressAction: { id: 'snooze' },
          },
          {
            title: '✏️ Edit',
            pressAction: { id: 'edit' },
          },
        ],
        progress: scheduleItem.inProgress ? {
          max: scheduleItem.estimatedDuration,
          current: scheduleItem.actualDuration || 0,
        } : undefined,
        category: AndroidCategory.EVENT,
        visibility: AndroidVisibility.PUBLIC,
        color,
        importance: AndroidImportance.HIGH,
        timestamp: new Date(scheduleItem.startDate).getTime(),
        showTimestamp: true,
        lightUpScreen: scheduleItem.priority.toLowerCase() === 'high',
        groupAlertBehavior: AndroidGroupAlertBehavior.CHILDREN,
      },
      ios: {
        categoryId: 'schedule_item',
        threadId: `schedule_${scheduleItem.type.toLowerCase()}`,
        attachments: [],
        sound: 'default',
        critical: scheduleItem.priority.toLowerCase() === 'high',
        interruptionLevel: scheduleItem.priority.toLowerCase() === 'high' ? 'critical' : 'active',
        // relevanceScore: scheduleItem.priority.toLowerCase() === 'high' ? 1 : 0.7,
      },
    });

    return notificationId;
  } catch (error) {
    if (error instanceof NotificationError) throw error;
    throw new NotificationError(
      error instanceof Error ? error.message : 'Failed to create notification',
      'NOTIFICATION_CREATE_ERROR'
    );
  }
};

// Testing utility for notifications
export const testNotifications = async (): Promise<void> => {
  const testCases: ScheduleItem[] = [
    {
      id: 1,
      title: "High Priority Work Meeting",
      description: "Quarterly review with the team",
      type: "Social",
      startDate: addMinutes(new Date(), 5),
      endDate: addMinutes(new Date(), 65),
      duration: 60,
      priority: "High",
      recurrence: "Weekly",
      location: "Conference Room A",
      completed: false,
      inProgress: false,
      estimatedDuration: 60,
      postponements: [],
      tags: ["quarterly-review", "important"],
      notes: "Prepare presentation",
      energy: "High",
      reminder: 15
    },
    {
      id: 2,
      title: "Exercise Session",
      description: "Morning workout routine",
      type: "Work",
      startDate: addHours(new Date(), 1),
      endDate: addHours(new Date(), 2),
      duration: 60,
      priority: "Medium",
      recurrence: "Daily",
      location: "Gym",
      completed: false,
      inProgress: false,
      estimatedDuration: 60,
      postponements: [],
      tags: ["health", "routine"],
      notes: "Remember workout gear",
      energy: "High",
      reminder: 30
    },
    // Add more test cases as needed
  ];

  console.log('🧪 Starting notification tests...');
  
  for (const testCase of testCases) {
    try {
      const notificationId = await createScheduleNotification(testCase);
      console.log(`✅ Successfully created notification for: ${testCase.title}`);
      console.log(`   ID: ${notificationId}`);
      
      // Get displayed notifications to verify
      const displayedNotifications = await notifee.getDisplayedNotifications();
      const found = displayedNotifications.find(n => n.id === notificationId);
      
      if (found) {
        console.log(`   Verification: Notification is displayed correctly`);
      } else {
        console.log(`   ⚠️ Warning: Notification created but not found in displayed notifications`);
      }
    } catch (error) {
      console.error(`❌ Failed to create notification for: ${testCase.title}`);
      console.error(`   Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  console.log('🏁 Notification tests completed');
};

// Utility functions
const addMinutes = (date: Date, minutes: number): Date => {
  return new Date(date.getTime() + minutes * 60000);
};

const addHours = (date: Date, hours: number): Date => {
  return addMinutes(date, hours * 60);
};

// Export utility functions for external use
export const NotificationUtils = {
  validateScheduleItem,
  formatTimeRange,
  getNotificationStyle,
  addMinutes,
  addHours,
};