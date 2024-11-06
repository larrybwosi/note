import notifee, {
  TimestampTrigger,
  TriggerType,
  AndroidStyle,
  AndroidImportance,
  AndroidCategory,
  AndroidVisibility,
  AndroidGroupAlertBehavior,
} from '@notifee/react-native';
import { addMinutes, addMonths, addWeeks, addDays, format, isValid } from 'date-fns';
import { RecurrencePattern, ScheduleItem, scheduleStore } from 'src/storage/schedule';

// Enhanced ScheduleItem interface with notification tracking
interface ScheduleItemWithNotifications extends ScheduleItem {
  notificationIds?: string[];
}

// Notification configuration
const notificationConfig = {
  taskIcons: {
    work: '💼',
    meeting: '👥',
    break: '☕',
    exercise: '🏃',
    study: '📚',
    personal: '🏠',
  },
  priorityColors: {
    high: '#FF4444',
    medium: '#FFA000',
    low: '#4CAF50',
  },
  defaultIcon: '📝',
  defaultColor: '#757575',
};

// Helper function to get occurrences count
const getOccurrencesCount = (recurrence: string): number => {
  switch (recurrence) {
    case 'Daily':
      return 7; // Create notifications for a week
    case 'Weekly':
      return 4; // Create notifications for a month
    case 'Biweekly':
      return 2; // Create notifications for a month
    case 'Monthly':
      return 1; // Create notifications for one month
    default:
      return 1; // Single occurrence
  }
};

// Enhanced createScheduleNotification function
const createScheduleNotification = async (
  item: ScheduleItemWithNotifications,
  occurrence: number = 0
): Promise<string> => {
  try {
    const channelId = await notifee.createChannel({
      id: `schedule_${item.type.toLowerCase()}`,
      name: `${item.type} Notifications`,
      lights: true,
      vibration: true,
      importance: AndroidImportance.HIGH,
      sound: 'default',
    });

    const icon =
      notificationConfig.taskIcons[
        item.type.toLowerCase() as keyof typeof notificationConfig.taskIcons
      ] || notificationConfig.defaultIcon;
    const color =
      notificationConfig.priorityColors[
        item.priority.toLowerCase() as keyof typeof notificationConfig.priorityColors
      ] || notificationConfig.defaultColor;

    // Calculate notification date based on occurrence
    const getOccurrenceDate = (date: Date, occurrence: number, recurrence: string): Date => {
      switch (recurrence) {
        case 'Daily':
          return addDays(date, occurrence);
        case 'Weekly':
          return addWeeks(date, occurrence);
        case 'Biweekly':
          return addWeeks(date, occurrence * 2);
        case 'Monthly':
          return addMonths(date, occurrence);
        default:
          return date;
      }
    };

    const startDate = getOccurrenceDate(new Date(item.startDate), occurrence, item.recurrence);
    const endDate = getOccurrenceDate(new Date(item.endDate), occurrence, item.recurrence);
    const timeInfo = `${format(startDate, 'h:mm a')} - ${format(endDate, 'h:mm a')}`;

    // Create notification
    const notificationId = await notifee.displayNotification({
      id: `schedule_${item.id}_${occurrence}`,
      title: `${icon} ${item.title}`,
      body: item.description || 'No description provided',
      android: {
        channelId,
        smallIcon: 'ic_notification',
        style: {
          type: AndroidStyle.BIGTEXT,
          text: `📅 ${timeInfo}\n${item.description || 'No description provided'}\n\n${
            item.location ? `📍 ${item.location}\n` : ''
          }⏱️ Duration: ${item.duration} minutes\n${
            item.tags.length > 0 ? `🏷️ ${item.tags.join(', ')}\n` : ''
          }🔋 Energy Level: ${item.energy}`,
        },
        pressAction: {
          id: 'default',
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
        ],
        category: AndroidCategory.EVENT,
        color,
        importance: AndroidImportance.HIGH,
        timestamp: startDate.getTime(),
      },
      ios: {
        categoryId: 'schedule_item',
        threadId: `schedule_${item.type.toLowerCase()}`,
        critical: item.priority.toLowerCase() === 'high',
      },
    });

    return notificationId;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

// Enhanced handleAddItem function with notification support
export const handleAddItem = async () => {
  const currentItems = scheduleStore.get().items;
  const newId = currentItems.length > 0 ? Math.max(...currentItems.map((i) => i.id)) + 1 : 1;

  const newItemData = scheduleStore.get().newItem;
  const startDate = newItemData.startDate || new Date();
  const duration = newItemData.duration || 30;

  const newItem: ScheduleItemWithNotifications = {
    id: newId,
    title: newItemData.title || 'Untitled Task',
    description: newItemData.description || '',
    type: newItemData.type || 'Work',
    startDate,
    endDate: addMinutes(startDate, duration),
    duration: duration,
    priority: newItemData.priority || 'Medium',
    recurrence: newItemData.recurrence || 'None',
    location: newItemData.location,
    completed: false,
    inProgress: false,
    estimatedDuration: duration,
    postponements: [],
    tags: newItemData.tags || [],
    notes: newItemData.notes || '',
    energy: newItemData.energy || 'Medium',
    reminder: newItemData.reminder,
    notificationIds: [], // Initialize empty notification IDs array
  };

  try {
    // Create notifications for each occurrence
    const occurrences = getOccurrencesCount(newItem.recurrence);
    const notificationIds: string[] = [];

    // Create main notifications
    for (let i = 0; i < occurrences; i++) {
      const notificationId = await createScheduleNotification(newItem, i);
      notificationIds.push(notificationId);

      // Create reminder notification if specified
      if (newItem.reminder) {
        const reminderDate = addMinutes(newItem.startDate, -newItem.reminder);
        const reminderId = await notifee.createTriggerNotification(
          {
            title: `⏰ Reminder: ${newItem.title}`,
            body: `Starting in ${newItem.reminder} minutes`,
            android: {
              channelId: `schedule_${newItem.type.toLowerCase()}_reminder`,
              importance: AndroidImportance.HIGH,
            },
          },
          {
            type: TriggerType.TIMESTAMP,
            timestamp: reminderDate.getTime(),
          }
        );
        notificationIds.push(reminderId);
      }
    }

    // Update item with notification IDs
    newItem.notificationIds = notificationIds;

    // Add item to store
    scheduleStore.set((store) => ({
      ...store,
      items: [...store.items, newItem],
      isAddingItem: false,
      newItem: {
        title: '',
        type: 'Work',
        priority: 'Medium',
        recurrence: 'None',
        duration: 30,
        energy: 'Medium',
        tags: [],
        reminder: undefined,
        startDate: new Date(),
      },
    }));
  } catch (error) {
    console.error('Error creating schedule item with notifications:', error);
    // Handle error appropriately (e.g., show error message to user)
  }
};

// Enhanced handleDeleteItem function
export const handleDeleteItem = async (itemId: number) => {
  try {
    const item = scheduleStore
      .get()
      .items.find((i) => i.id === itemId) as ScheduleItemWithNotifications;

    if (item?.notificationIds?.length) {
      // Cancel all notifications associated with this item
      await Promise.all(item.notificationIds.map((id) => notifee.cancelNotification(id)));
    }

    // Remove item from store
    scheduleStore.set((store) => ({
      ...store,
      items: store.items.filter((i) => i.id !== itemId),
    }));
  } catch (error) {
    console.error('Error deleting schedule item:', error);
    // Handle error appropriately
  }
};

// Add utility function to update notifications for an item
export const updateItemNotifications = async (item: ScheduleItemWithNotifications) => {
  try {
    // Cancel existing notifications
    if (item.notificationIds?.length) {
      await Promise.all(item.notificationIds.map((id) => notifee.cancelNotification(id)));
    }

    // Create new notifications
    const occurrences = getOccurrencesCount(item.recurrence);
    const notificationIds: string[] = [];

    for (let i = 0; i < occurrences; i++) {
      const notificationId = await createScheduleNotification(item, i);
      notificationIds.push(notificationId);
    }

    // Update item with new notification IDs
    scheduleStore.set((store) => ({
      ...store,
      items: store.items.map((i) => (i.id === item.id ? { ...i, notificationIds } : i)),
    }));

    return notificationIds;
  } catch (error) {
    console.error('Error updating notifications:', error);
    throw error;
  }
};
