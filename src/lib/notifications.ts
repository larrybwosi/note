import notifee, {
  AndroidColor,
  AndroidImportance,
  AndroidStyle,
  TimestampTrigger,
  TriggerType,
  AuthorizationStatus,
} from '@notifee/react-native';
import { Platform } from 'react-native';

// Notification channel IDs
const CHANNELS = {
  ALERTS: 'finance_alerts',
  BUDGETS: 'budget_updates',
  GOALS: 'savings_goals',
  INSIGHTS: 'financial_insights',
  TRANSACTIONS: 'transactions',
} as const;

// Color schemes for different notification types
const COLORS = {
  success: '#4CAF50',
  warning: '#FFC107',
  danger: '#F44336',
  info: '#2196F3',
  neutral: '#9E9E9E',
} as const;

interface NotificationConfig {
  id?: string;
  title: string;
  body: string;
  type: keyof typeof CHANNELS;
  priority?: 'high' | 'default' | 'low';
  color?: keyof typeof COLORS;
  data?: Record<string, any>;
  timestamp?: Date;
  actions?: Array<{
    title: string;
    pressAction: { id: string };
  }>;
}

class FinanceNotificationService {
  private static instance: FinanceNotificationService;

  private constructor() {
    this.initialize();
  }

  static getInstance(): FinanceNotificationService {
    if (!FinanceNotificationService.instance) {
      FinanceNotificationService.instance = new FinanceNotificationService();
    }
    return FinanceNotificationService.instance;
  }

  private async initialize(): Promise<void> {
    // Request permissions
    const settings = await notifee.requestPermission();

    if (settings.authorizationStatus === AuthorizationStatus.DENIED) {
      console.warn('User denied notification permissions');
      return;
    }

    // Create notification channels for Android
    if (Platform.OS === 'android') {
      await this.createChannels();
    }
  }

  private async createChannels(): Promise<void> {
    await notifee.createChannel({
      id: CHANNELS.ALERTS,
      name: 'Financial Alerts',
      description: 'Important alerts about your financial activity',
      importance: AndroidImportance.HIGH,
      sound: 'default',
      vibration: true,
      lights: true,
    });

    await notifee.createChannel({
      id: CHANNELS.BUDGETS,
      name: 'Budget Updates',
      description: 'Updates about your budget status and spending',
      importance: AndroidImportance.DEFAULT,
      sound: 'default',
    });

    await notifee.createChannel({
      id: CHANNELS.GOALS,
      name: 'Savings Goals',
      description: 'Progress updates for your savings goals',
      importance: AndroidImportance.DEFAULT,
      sound: 'default',
    });

    await notifee.createChannel({
      id: CHANNELS.INSIGHTS,
      name: 'Financial Insights',
      description: 'Smart insights about your financial habits',
      importance: AndroidImportance.LOW,
    });

    await notifee.createChannel({
      id: CHANNELS.TRANSACTIONS,
      name: 'Transactions',
      description: 'Updates about your transactions',
      importance: AndroidImportance.DEFAULT,
      sound: 'default',
    });
  }

  async showNotification(config: NotificationConfig): Promise<string> {
    const { id = Date.now().toString(), title, body, type, priority = 'default', color = 'neutral', data, actions, timestamp } = config;

    const androidConfig = {
      channelId: CHANNELS[type],
      pressAction: {
        id: 'default',
      },
      style: {
        type: AndroidStyle.BIGTEXT,
        text: body,
      },
      smallIcon: 'ic_notification',
      color: COLORS[color],
      importance: this.getPriorityLevel(priority),
      ...(actions && {
        actions: actions.map(action => ({
          ...action,
          pressAction: {
            ...action.pressAction,
            launchActivity: 'default',
          },
        })),
      }),
    };

    const iosConfig = {
      sound: 'default',
      critical: priority === 'high',
      importance: this.getPriorityLevel(priority),
      ...(actions && {
        categoryId: type,
        actions: actions.map(action => ({
          ...action,
          foreground: true,
        })),
      }),
    };

    // Schedule notification if timestamp is provided
    if (timestamp && timestamp > new Date()) {
      const trigger: TimestampTrigger = {
        type: TriggerType.TIMESTAMP,
        timestamp: timestamp.getTime(),
      };

      return await notifee.createTriggerNotification(
        {
          id,
          title,
          body,
          data,
          ios: iosConfig,
        },
        trigger
      );
    }

    // Show immediate notification
    return await notifee.displayNotification({
      id,
      title,
      body,
      data,
      ios: iosConfig,
    });
  }

  private getPriorityLevel(priority: 'high' | 'default' | 'low'): AndroidImportance {
    switch (priority) {
      case 'high':
        return AndroidImportance.HIGH;
      case 'low':
        return AndroidImportance.LOW;
      default:
        return AndroidImportance.DEFAULT;
    }
  }

  // Preset notification templates
  async showBudgetAlert(categoryName: string, percentage: number, remaining: number): Promise<string> {
    const priority = percentage >= 90 ? 'high' : percentage >= 75 ? 'default' : 'low';
    const color = percentage >= 90 ? 'danger' : percentage >= 75 ? 'warning' : 'info';

    return this.showNotification({
      title: `Budget Alert: ${categoryName}`,
      body: `You've used ${percentage}% of your ${categoryName} budget. $${remaining} remaining.`,
      type: 'BUDGETS',
      priority,
      color,
      actions: [
        {
          title: 'View Details',
          pressAction: { id: 'view_budget' },
        },
        {
          title: 'Adjust Budget',
          pressAction: { id: 'adjust_budget' },
        },
      ],
    });
  }

  async showSavingsGoalReached(goalName: string, amount: number): Promise<string> {
    return this.showNotification({
      title: '🎉 Savings Goal Reached!',
      body: `Congratulations! You've reached your savings goal of $${amount} for "${goalName}"`,
      type: 'GOALS',
      priority: 'high',
      color: 'success',
      actions: [
        {
          title: 'View Goal',
          pressAction: { id: 'view_goal' },
        },
        {
          title: 'Set New Goal',
          pressAction: { id: 'new_goal' },
        },
      ],
    });
  }

  async showLargeTransactionAlert(amount: number, categoryName: string): Promise<string> {
    return this.showNotification({
      title: '💰 Large Transaction Detected',
      body: `A transaction of $${amount} was made in ${categoryName}. Is this correct?`,
      type: 'ALERTS',
      priority: 'high',
      color: 'warning',
      actions: [
        {
          title: 'Confirm',
          pressAction: { id: 'confirm_transaction' },
        },
        {
          title: 'Review',
          pressAction: { id: 'review_transaction' },
        },
      ],
    });
  }

  async showMonthlyInsight(savedAmount: number, bestCategory: string): Promise<string> {
    return this.showNotification({
      title: '📊 Monthly Financial Insight',
      body: `Great job! You saved $${savedAmount} this month. Your best performing category was ${bestCategory}!`,
      type: 'INSIGHTS',
      priority: 'default',
      color: 'info',
      actions: [
        {
          title: 'View Report',
          pressAction: { id: 'view_report' },
        },
      ],
    });
  }

  async showBillReminder(billName: string, amount: number, dueDate: Date): Promise<string> {
    const daysUntilDue = Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    
    return this.showNotification({
      title: '📅 Upcoming Bill Reminder',
      body: `Your ${billName} bill of $${amount} is due in ${daysUntilDue} days.`,
      type: 'ALERTS',
      priority: 'default',
      color: 'info',
      timestamp: dueDate,
      actions: [
        {
          title: 'Pay Now',
          pressAction: { id: 'pay_bill' },
        },
        {
          title: 'Remind Later',
          pressAction: { id: 'remind_later' },
        },
      ],
    });
  }
}

export const notificationService = FinanceNotificationService.getInstance();