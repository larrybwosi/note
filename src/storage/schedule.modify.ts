import { addMinutes, format, isBefore, isAfter } from "date-fns"
import { calculatePerformanceMetrics, PostponementRecord, ScheduleItem, scheduleStore } from "./schedule"

/**
 * Confirms the postponement of a schedule item
 * Updates the item with new date and adds postponement record
 */
const confirmPostpone = (
  selectedItemId: number | null,
  setShowPostponeModal: (show: boolean) => void,
  setSelectedItemId: (id: number | null) => void
) => {
  if (!selectedItemId) return

  scheduleStore.items.set(items => items.map(item => {
    if (item.id === selectedItemId) {
      const newDate = scheduleStore.get().postponeData.newDate
      const duration = item.duration
      
      const postponementRecord: PostponementRecord = {
        id: Math.max(...item.postponements.map(p => p.id), 0) + 1,
        originalDate: item.startDate,
        newDate: newDate,
        reason: scheduleStore.get().postponeData.reason,
        reasonCategory: scheduleStore.get().postponeData.reasonCategory,
        impact: scheduleStore.get().postponeData.impact
      }

      return {
        ...item,
        startDate: newDate,
        endDate: addMinutes(newDate, duration),
        postponements: [...item.postponements, postponementRecord]
      }
    }
    return item
  }))

  // Reset the postponement form
  scheduleStore.postponeData.set({
    itemId: null,
    reason: '',
    reasonCategory: 'Other',
    newDate: addMinutes(new Date(), 60),
    impact: 'Low'
  })

  // Close modal and clean up
  setShowPostponeModal(false)
  setSelectedItemId(null)

  // Recalculate performance metrics
  const newMetrics = calculatePerformanceMetrics(scheduleStore.get().items)
  scheduleStore.performance.set(newMetrics)
}

/**
 * Adds a new schedule item
 * Generates new ID and initializes with default values
 */
const handleAddItem = async() => {
  const currentItems = scheduleStore.get().items;
  const newId = currentItems.length > 0 
    ? Math.max(...currentItems.map(i => i.id)) + 1 
    : 1;

  const newItemData = scheduleStore.get().newItem;
  const startDate = newItemData.startDate || new Date();
  const duration = newItemData.duration || 30;

  const newItem: ScheduleItem = {
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
    
    // Status tracking
    completed: false,
    inProgress: false,
    
    // Performance tracking
    estimatedDuration: duration,
    
    // Initialize empty arrays and defaults
    postponements: [],
    tags: newItemData.tags || [],
    notes: newItemData.notes || '',
    reminder: newItemData.reminder
  };

  try {

    // Reset the form
    scheduleStore.set(store => ({
      ...store,
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
        startDate: new Date()
      }
    }));

    // Check for scheduling conflicts
    checkSchedulingConflicts(newItem);

  } catch (error) {
    console.error('Error creating notifications:', error);
  }
};

export const handleDeleteItem = async (itemId: number) => {
  const item = scheduleStore.get().items.find(i => i.id === itemId);
  
  if (item && 'notificationIds' in item) {
    // Cancel all notifications associated with this item
    //@ts-ignore
    await cancelScheduleNotifications(item?.notificationIds!);
  }
  
  // Remove item from store
  scheduleStore.set(store => ({
    ...store,
    items: store.items.filter(i => i.id !== itemId)
  }));
};

/**
 * Checks for scheduling conflicts with existing items
 */
const checkSchedulingConflicts = (item: ScheduleItem) => {
  const conflicts = scheduleStore.get().items.filter(existingItem => 
    existingItem.id !== item.id &&
    !existingItem.completed &&
    ((isAfter(item.startDate, existingItem.startDate) && 
      isBefore(item.startDate, existingItem.endDate)) ||
     (isAfter(item.endDate, existingItem.startDate) && 
      isBefore(item.endDate, existingItem.endDate)))
  )

  if (conflicts.length > 0) {
    // Handle conflicts (you can implement your own conflict resolution strategy)
    console.warn('Scheduling conflicts detected:', conflicts)
    // Optionally show a notification or modal to the user
  }
}

/**
 * Helper function to validate new item data
 */
const validateItemData = (item: Partial<ScheduleItem>): boolean => {
  return !!(
    item.title &&
    item.startDate &&
    item.duration &&
    item.duration > 0 &&
    item.type &&
    item.priority
  )
}

export {
  confirmPostpone,
  handleAddItem,
  checkSchedulingConflicts,
  validateItemData
}