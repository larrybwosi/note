import { observable } from '@legendapp/state';
import { ObservablePersistMMKV } from '@legendapp/state/persist-plugins/mmkv';
import { synced } from '@legendapp/state/sync';

// Define types
export interface ShoppingItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  categoryId: string;
  completed: boolean;
  dateAdded: Date;
}

export interface ShoppingList {
  id: string;
  name: string;
  items: ShoppingItem[];
  createdAt: Date;
  updatedAt: Date;
  isFrequent?: boolean;
  tags?: string[];
  lastRenewed?: Date;
  renewalInterval?: number; // in days
  notes?: string;
  budget?: number;
}

// Create the observable store with initial state
export const shoppingStore = observable(
  synced({
    initial: {
      activeListId: null as string | null, // Keep track of the currently active list
      shoppingLists: [] as ShoppingList[],
      archivedLists: [] as ShoppingList[], // Store for archived lists
      favorites: [] as string[], // Array of favorite list IDs
      recentlyUsed: [] as string[], // Array of recently used list IDs (most recent first)
    },
    persist: {
      name: 'financeshoppingStore',
      plugin: ObservablePersistMMKV,
    },
  })
);

const useShoppingStore = () => {
  // Helper methods
  const findListById = (listId: string): number => {
    return shoppingStore.shoppingLists.get().findIndex((list) => list.id === listId);
  };

  const findItemById = (itemId: string, listId?: string): { listIndex: number; itemIndex: number } | null => {
    let result = null;

    shoppingStore.shoppingLists.get().forEach((list, listIndex) => {
      // If listId is provided, only check that specific list
      if (listId && list.id !== listId) return;

      const itemIndex = list.items.findIndex((item) => item.id === itemId);
      if (itemIndex !== -1) {
        result = { listIndex, itemIndex };
      }
    });

    return result;
  };

    const updateListTimestamp = (listIndex: number) => {
    shoppingStore.shoppingLists[listIndex].updatedAt.set(new Date());
  };
  
  const trackRecentlyUsed = (listId: string) => {
    const recent = shoppingStore.recentlyUsed.get();
    // Remove if already in the list
    const filtered = recent.filter(id => id !== listId);
    // Add to the beginning (most recent)
    shoppingStore.recentlyUsed.set([listId, ...filtered.slice(0, 9)]); // Keep only 10 most recent
  };

  return {
    // Getters
    getAllShoppingLists: () => shoppingStore.shoppingLists.get(),
    
    getArchivedLists: () => shoppingStore.archivedLists.get(),
    
    getActiveListId: () => shoppingStore.activeListId.get(),
    
    getActiveList: () => {
      const activeId = shoppingStore.activeListId.get();
      if (!activeId) return null;
      
      return shoppingStore.shoppingLists.get().find((list) => list.id === activeId) || null;
    },
    
    getShoppingListById: (listId: string, includeArchived = false) => {
      // Check active lists first
      const list = shoppingStore.shoppingLists.get().find((list) => list.id === listId);
      if (list) return list;
      
      // Check archived lists if requested
      if (includeArchived) {
        return shoppingStore.archivedLists.get().find((list) => list.id === listId) || null;
      }
      
      return null;
    },
    
    getFavorites: () => {
      const favoriteIds = shoppingStore.favorites.get();
      return shoppingStore.shoppingLists.get().filter(list => favoriteIds.includes(list.id));
    },
    
    getRecentlyUsed: (limit = 5) => {
      const recentIds = shoppingStore.recentlyUsed.get().slice(0, limit);
      const lists: ShoppingList[] = [];
      
      // Preserve the order of recently used
      recentIds.forEach(id => {
        const list = shoppingStore.shoppingLists.get().find(list => list.id === id);
        if (list) lists.push(list);
      });
      
      return lists;
    },
    
    getFrequentLists: () => {
      return shoppingStore.shoppingLists.get().filter(list => list.isFrequent);
    },
    
    getListsByTag: (tag: string) => {
      return shoppingStore.shoppingLists.get().filter(list => list.tags?.includes(tag));
    },
    
    getDueForRenewal: () => {
      const today = new Date();
      return shoppingStore.shoppingLists.get().filter(list => {
        if (!list.renewalInterval || !list.lastRenewed) return false;
        
        const renewalDate = new Date(list.lastRenewed);
        renewalDate.setDate(renewalDate.getDate() + list.renewalInterval);
        return today >= renewalDate;
      });
    },

    // Shopping list actions
    setActiveList: (listId: string | null) => {
      shoppingStore.activeListId.set(listId);
      if (listId) {
        trackRecentlyUsed(listId);
      }
    },
    
    createShoppingList: (name: string, options?: Partial<Omit<ShoppingList, 'id' | 'items' | 'createdAt' | 'updatedAt'>>) => {
      const now = new Date();
      const newList: ShoppingList = {
        id: `list_${Date.now()}`,
        name,
        items: [],
        createdAt: now,
        updatedAt: now,
        ...options,
        lastRenewed: options?.lastRenewed || now,
      };
      
      shoppingStore.shoppingLists.push(newList);
      trackRecentlyUsed(newList.id);
      return newList.id;
    },
    
    archiveList: (listId: string) => {
      const listIndex = findListById(listId);
      
      if (listIndex !== -1) {
        const list = shoppingStore.shoppingLists[listIndex].get();
        shoppingStore.archivedLists.push(list);
        
        // Remove from active lists
        const filtered = shoppingStore.shoppingLists.get().filter((l) => l.id !== listId);
        shoppingStore.shoppingLists.set(filtered);
        
        // If we archived the active list, clear the active list ID
        if (shoppingStore.activeListId.get() === listId) {
          shoppingStore.activeListId.set(null);
        }
        
        // Remove from favorites if present
        const favs = shoppingStore.favorites.get();
        if (favs.includes(listId)) {
          shoppingStore.favorites.set(favs.filter(id => id !== listId));
        }
        
        return true;
      }
      
      return false;
    },
    
    unarchiveList: (listId: string) => {
      const archivedList = shoppingStore.archivedLists.get().find(list => list.id === listId);
      
      if (archivedList) {
        // Add to active lists
        shoppingStore.shoppingLists.push(archivedList);
        
        // Remove from archived lists
        const filtered = shoppingStore.archivedLists.get().filter((l) => l.id !== listId);
        shoppingStore.archivedLists.set(filtered);
        
        return true;
      }
      
      return false;
    },
    
    renewList: (listId: string) => {
      const listIndex = findListById(listId);
      
      if (listIndex !== -1) {
        // Update the renewal timestamp
        const now = new Date();
        shoppingStore.shoppingLists[listIndex].lastRenewed.set(now);
        shoppingStore.shoppingLists[listIndex].updatedAt.set(now);
        return true;
      }
      
      return false;
    },
    
    toggleFavorite: (listId: string) => {
      const favs = shoppingStore.favorites.get();
      
      if (favs.includes(listId)) {
        // Remove from favorites
        shoppingStore.favorites.set(favs.filter(id => id !== listId));
        return false; // Not a favorite anymore
      } else {
        // Add to favorites
        shoppingStore.favorites.set([...favs, listId]);
        return true; // Now a favorite
      }
    },
    
    isFavorite: (listId: string) => {
      return shoppingStore.favorites.get().includes(listId);
    },

    updateShoppingList: (listId: string, updates: Partial<Omit<ShoppingList, 'id' | 'items' | 'createdAt'>>) => {
      const listIndex = findListById(listId);
      
      if (listIndex !== -1) {
        // Update provided fields
        Object.entries(updates).forEach(([key, value]) => {
          // @ts-ignore - Dynamic assignment
          shoppingStore.shoppingLists[listIndex][key].set(value);
        });
        
        // Always update the timestamp
        updateListTimestamp(listIndex);
        return true;
      }
      
      return false;
    },

    deleteShoppingList: (listId: string) => {
      const filtered = shoppingStore.shoppingLists.get().filter((list) => list.id !== listId);
      shoppingStore.shoppingLists.set(filtered);
      
      // If we deleted the active list, clear the active list ID
      if (shoppingStore.activeListId.get() === listId) {
        shoppingStore.activeListId.set(null);
      }
    },

    // ShoppingItem actions
    addItemToList: (listId: string, item: Omit<ShoppingItem, 'id' | 'dateAdded'>) => {
      const listIndex = findListById(listId);
      
      if (listIndex !== -1) {
        const newItem: ShoppingItem = {
          ...item,
          id: `item_${Date.now()}`,
          dateAdded: new Date(),
        };
        
        shoppingStore.shoppingLists[listIndex].items.push(newItem);
        updateListTimestamp(listIndex);
        return newItem.id;
      }
      
      return null;
    },

    updateItemInList: (itemId: string, updates: Partial<Omit<ShoppingItem, 'id' | 'dateAdded'>>, listId?: string) => {
      const location = findItemById(itemId, listId);
      
      if (location) {
        const { listIndex, itemIndex } = location;
        
        // Update provided fields
        Object.entries(updates).forEach(([key, value]) => {
          // @ts-ignore - Dynamic assignment
          shoppingStore.shoppingLists[listIndex].items[itemIndex][key].set(value);
        });
        
        updateListTimestamp(listIndex);
        return true;
      }
      
      return false;
    },

    removeItemFromList: (itemId: string, listId?: string) => {
      if (listId) {
        // Remove from specific list
        const listIndex = findListById(listId);
        
        if (listIndex !== -1) {
          const items = shoppingStore.shoppingLists[listIndex].items.get().filter((item) => item.id !== itemId);
          shoppingStore.shoppingLists[listIndex].items.set(items);
          updateListTimestamp(listIndex);
        }
      } else {
        // Remove from all lists
        shoppingStore.shoppingLists.get().forEach((list, listIndex) => {
          const hasItem = list.items.some((item) => item.id === itemId);
          
          if (hasItem) {
            const items = list.items.filter((item) => item.id !== itemId);
            shoppingStore.shoppingLists[listIndex].items.set(items);
            updateListTimestamp(listIndex);
          }
        });
      }
    },

    toggleItemCompletion: (itemId: string, listId?: string) => {
      const location = findItemById(itemId, listId);
      
      if (location) {
        const { listIndex, itemIndex } = location;
        const currentValue = !!shoppingStore.shoppingLists[listIndex].items[itemIndex].completed.get();
        
        shoppingStore.shoppingLists[listIndex].items[itemIndex].completed.set(!currentValue);
        updateListTimestamp(listIndex);
        return true;
      }
      
      return false;
    },

    clearCompletedItems: (listId?: string) => {
      if (listId) {
        // Clear from specific list
        const listIndex = findListById(listId);
        
        if (listIndex !== -1) {
          const items = shoppingStore.shoppingLists[listIndex].items.get().filter((item) => !item.completed);
          shoppingStore.shoppingLists[listIndex].items.set(items);
          updateListTimestamp(listIndex);
        }
      } else {
        // Clear from all lists
        shoppingStore.shoppingLists.get().forEach((list, listIndex) => {
          const hasCompletedItems = list.items.some((item) => item.completed);
          
          if (hasCompletedItems) {
            const items = list.items.filter((item) => !item.completed);
            shoppingStore.shoppingLists[listIndex].items.set(items);
            updateListTimestamp(listIndex);
          }
        });
      }
    },

    clearAllItems: (listId?: string) => {
      if (listId) {
        // Clear specific list
        const listIndex = findListById(listId);
        
        if (listIndex !== -1) {
          shoppingStore.shoppingLists[listIndex].items.set([]);
          updateListTimestamp(listIndex);
        }
      } else {
        // Clear all lists
        shoppingStore.shoppingLists.get().forEach((_, listIndex) => {
          shoppingStore.shoppingLists[listIndex].items.set([]);
          updateListTimestamp(listIndex);
        });
      }
    },
    
    duplicateList: (listId: string, newName?: string) => {
      const originalList = shoppingStore.shoppingLists.get().find(list => list.id === listId);
      
      if (originalList) {
        const now = new Date();
        const newList: ShoppingList = {
          ...originalList,
          id: `list_${Date.now()}`,
          name: newName || `${originalList.name} (Copy)`,
          items: [...originalList.items],
          createdAt: now,
          updatedAt: now,
          lastRenewed: now,
        };
        
        shoppingStore.shoppingLists.push(newList);
        trackRecentlyUsed(newList.id);
        return newList.id;
      }
      
      return null;
    },
    
    addTag: (listId: string, tag: string) => {
      const listIndex = findListById(listId);
      
      if (listIndex !== -1) {
        const currentTags = shoppingStore.shoppingLists[listIndex].tags.get() || [];
        if (!currentTags.includes(tag)) {
          shoppingStore.shoppingLists[listIndex].tags.set([...currentTags, tag]);
          updateListTimestamp(listIndex);
          return true;
        }
      }
      
      return false;
    },
    
    removeTag: (listId: string, tag: string) => {
      const listIndex = findListById(listId);
      
      if (listIndex !== -1) {
        const currentTags = shoppingStore.shoppingLists[listIndex].tags.get() || [];
        if (currentTags.includes(tag)) {
          shoppingStore.shoppingLists[listIndex].tags.set(currentTags.filter(t => t !== tag));
          updateListTimestamp(listIndex);
          return true;
        }
      }
      
      return false;
    },
    
    setRenewalInterval: (listId: string, days: number) => {
      const listIndex = findListById(listId);
      
      if (listIndex !== -1) {
        shoppingStore.shoppingLists[listIndex].renewalInterval.set(days);
        updateListTimestamp(listIndex);
        return true;
      }
      
      return false;
    },

    getItemsByCategory: (categoryId: string, listId?: string) => {
      let items: ShoppingItem[] = [];

      if (listId) {
        // Get items from specific list
        const list = shoppingStore.shoppingLists.get().find((l) => l.id === listId);
        
        if (list) {
          items = list.items.filter((item) => item.categoryId === categoryId);
        }
      } else {
        // Get items from all lists
        shoppingStore.shoppingLists.get().forEach((list) => {
          items = [...items, ...list.items.filter((item) => item.categoryId === categoryId)];
        });
      }

      const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      return { items, total };
    },

    getShoppingListStats: (listId: string) => {
      const listIndex = findListById(listId);
      
      if (listIndex !== -1) {
        const list = shoppingStore.shoppingLists[listIndex].get();
        const totalItems = list.items.length;
        const completedItems = list.items.filter(item => item.completed).length;
        const totalCost = list.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const underBudget = list.budget ? totalCost <= list.budget : null;
        
        return {
          totalItems,
          completedItems,
          pendingItems: totalItems - completedItems,
          progress: totalItems > 0 ? (completedItems / totalItems) * 100 : 0,
          totalCost,
          budget: list.budget,
          underBudget,
          budgetRemaining: list.budget ? list.budget - totalCost : null,
          daysUntilRenewal: list.renewalInterval && list.lastRenewed ? 
            Math.max(0, list.renewalInterval - Math.floor((new Date().getTime() - list.lastRenewed.getTime()) / (1000 * 60 * 60 * 24))) : 
            null,
        };
      }
      
      return null;
    },
    
    setListBudget: (listId: string, budget: number) => {
      const listIndex = findListById(listId);
      
      if (listIndex !== -1) {
        shoppingStore.shoppingLists[listIndex].budget.set(budget);
        updateListTimestamp(listIndex);
        return true;
      }
      
      return false;
    },
    
    setListNotes: (listId: string, notes: string) => {
      const listIndex = findListById(listId);
      
      if (listIndex !== -1) {
        shoppingStore.shoppingLists[listIndex].notes.set(notes);
        updateListTimestamp(listIndex);
        return true;
      }
      
      return false;
    },
    
    toggleFrequentList: (listId: string) => {
      const listIndex = findListById(listId);
      
      if (listIndex !== -1) {
        const currentValue = !!shoppingStore.shoppingLists[listIndex].isFrequent.get();
        shoppingStore.shoppingLists[listIndex].isFrequent.set(!currentValue);
        updateListTimestamp(listIndex);
        return !currentValue;
      }
      
      return false;
    },
    
    resetStore: () => {
      shoppingStore.shoppingLists.set([]);
      shoppingStore.archivedLists.set([]);
      shoppingStore.activeListId.set(null);
      shoppingStore.favorites.set([]);
      shoppingStore.recentlyUsed.set([]);
    },
    
    exportList: (listId: string) => {
      const list = shoppingStore.shoppingLists.get().find(list => list.id === listId);
      if (!list) return null;
      
      return JSON.stringify(list);
    },
    
    importList: (jsonString: string) => {
      try {
        const list = JSON.parse(jsonString) as ShoppingList;
        // Generate a new ID to avoid collisions
        list.id = `list_${Date.now()}`;
        list.updatedAt = new Date();
        
        shoppingStore.shoppingLists.push(list);
        trackRecentlyUsed(list.id);
        return list.id;
      } catch (e) {
        console.error('Failed to import list:', e);
        return null;
      }
    }
  }
};

export default useShoppingStore;