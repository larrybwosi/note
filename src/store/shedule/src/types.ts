import { z } from 'zod';

export const TASK_TYPES = ['Work', 'Personal', 'Health', 'Learning', 'Social', 'Urgent'] as const;
export const PRIORITY_LEVELS = ['Low', 'Medium', 'High', 'Critical'] as const;
export const RECURRENCE_PATTERNS = ['None', 'Daily', 'Weekly', 'Biweekly', 'Monthly'] as const;

export const TaskTypeSchema = z.enum(TASK_TYPES);
export const PriorityLevelSchema = z.enum(PRIORITY_LEVELS);
export const RecurrencePatternSchema = z.enum(RECURRENCE_PATTERNS);

export const PostponementReasonCategorySchema = z.enum(['Unavailable', 'Conflict', 'Emergency', 'Other']);
export const ImpactLevelSchema = z.enum(['Low', 'Medium', 'High']);

export const PostponementRecordSchema = z.object({
  id: z.number(),
  originalDate: z.date(),
  newDate: z.date(),
  reason: z.string(),
  reasonCategory: PostponementReasonCategorySchema,
  impact: ImpactLevelSchema,
});

export const PerformanceMetricsSchema = z.object({
  completionRate: z.number(),
  postponementRate: z.number(),
  averageDelay: z.number(),
  streakDays: z.number(),
  focusTime: z.number(),
  productiveHours: z.array(z.string()),
});

export const ScheduleItemSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  type: TaskTypeSchema,
  startDate: z.date(),
  endDate: z.date(),
  duration: z.number(),
  priority: PriorityLevelSchema,
  recurrence: RecurrencePatternSchema,
  location: z.string().optional(),
  completed: z.boolean(),
  completedAt: z.date().optional(),
  inProgress: z.boolean(),
  startedAt: z.date().optional(),
  estimatedDuration: z.number(),
  actualDuration: z.number().optional(),
  blockedBy: z.array(z.number()).optional(),
  blocking: z.array(z.number()).optional(),
  postponements: z.array(PostponementRecordSchema),
  maxPostponements: z.number().optional(),
  tags: z.array(z.string()),
  notes: z.string(),
  reminder: z.number().optional(),
  scheduleType: z.enum(['task', 'event']).optional(),
  deletedAt: z.date().optional(),
  countdown: z.number().optional(),
});

export const CreateRecurringNotificationPropsSchema = z.object({
  title: z.string(),
  body: z.string(),
  frequency: z.enum(['daily', 'weekly']),
  time: z.date(),
  priority: PriorityLevelSchema,
});

export const ScheduleStoreSchema = z.object({
  currentDate: z.date(),
  currentTime: z.string(),
  items: z.array(ScheduleItemSchema),
  filteredItems: z.array(ScheduleItemSchema),
  selectedItem: ScheduleItemSchema.nullable(),
  deletedItems: z.array(ScheduleItemSchema).optional(),
  postponedItems: z.array(ScheduleItemSchema).optional(),
  completedItems: z.array(ScheduleItemSchema).optional(),
  isAddingItem: z.boolean(),
  isPostponing: z.boolean(),
  editingItem: ScheduleItemSchema.nullable(),
  newItem: ScheduleItemSchema.partial(),
  postponeData: z.object({
    itemId: z.number().nullable(),
    reason: z.string(),
    reasonCategory: PostponementReasonCategorySchema,
    newDate: z.date(),
    impact: ImpactLevelSchema,
  }),
  performance: PerformanceMetricsSchema,
  settings: z.object({
    workingHours: z.object({
      start: z.string(),
      end: z.string(),
    }),
    breakDuration: z.number(),
    focusSessionDuration: z.number(),
    theme: z.enum(['light', 'dark']),
    notifications: z.boolean(),
    autoScheduleBreaks: z.boolean(),
  }),
  view: z.enum(['day', 'week', 'month']),
  showCompleted: z.boolean(),
  filterPriority: PriorityLevelSchema.optional(),
  filterType: TaskTypeSchema.optional(),
});

export type TaskType = z.infer<typeof TaskTypeSchema>;
export type PriorityLevel = z.infer<typeof PriorityLevelSchema>;
export type RecurrencePattern = z.infer<typeof RecurrencePatternSchema>;
export type PostponementReasonCategory = z.infer<typeof PostponementReasonCategorySchema>;
export type ImpactLevel = z.infer<typeof ImpactLevelSchema>;
export type PostponementRecord = z.infer<typeof PostponementRecordSchema>;
export type PerformanceMetrics = z.infer<typeof PerformanceMetricsSchema>;
export type ScheduleItem = z.infer<typeof ScheduleItemSchema>;
export type CreateRecurringNotificationProps = z.infer<typeof CreateRecurringNotificationPropsSchema>;
export type ScheduleStore = z.infer<typeof ScheduleStoreSchema>;
