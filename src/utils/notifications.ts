import notifee, { AndroidColor, AndroidImportance, AuthorizationStatus, EventType } from "@notifee/react-native";
import { markCompleted, postponeItem, startItem } from "src/store/shedule/actions";
import { notificationHandlers, showCompletionNotification } from "src/store/shedule/notifications";
import { scheduleStore } from "src/store/shedule/store";

export const setupNotificationChannels = async () => {
  const channels = [
    {
      id: 'schedule_default',
      name: 'Schedule Notifications',
      importance: AndroidImportance.DEFAULT,
      sound: 'not1',
      vibration: true,
      lights: true,
      lightColor: AndroidColor.BLUE,
      vibrationPattern: [300, 500],
    },
    {
      id: 'schedule_reminders',
      name: 'Schedule Reminders',
      importance: AndroidImportance.HIGH,
      sound: 'not2',
      vibration: true,
      lights: true,
      lightColor: AndroidColor.YELLOW,
      vibrationPattern: [300, 500],
    },
    {
      id: 'schedule_urgent',
      name: 'Urgent Tasks',
      importance: AndroidImportance.HIGH,
      sound: 'not3',
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
    const existingChannelIds = new Set(existingChannels.map((channel) => channel.id));

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
            await notificationHandlers.onStartItem(itemId);
            break;

          case 'postpone':
          case 'delay_15':
            const delayMinutes = pressAction?.id === 'delay_15' ? 15 : 30;
            const newDate = new Date(Date.now() + delayMinutes * 60 * 1000);
            await postponeItem(
              itemId,
              newDate,
              `Postponed by ${delayMinutes} minutes via notification`,
              'Other',
              'Low'
            );
            break;

          case 'complete':
            await markCompleted(itemId);
            const item = scheduleStore.get().items.find((i) => i.id === itemId);
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


export const deleteAllChannels = async () => {
  try {
    const channels = await notifee.getChannels();
    await Promise.all(channels.map((channel) => notifee.deleteChannel(channel.id)));
  } catch (error) {
    console.error('Error deleting notification channels:', error);
    throw error;
  }
};