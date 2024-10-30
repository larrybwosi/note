import { observable } from '@legendapp/state';
import { persistObservable } from '@legendapp/state/persist';
import { ObservablePersistMMKV } from '@legendapp/state/persist-plugins/mmkv';

// Define the root state structure
export const store = observable({
  notes: {} as Record<string, Note>,
  folders: {} as Record<string, Folder>,
  ui: {
    theme: 'light',
    sidebarOpen: true,
    selectedNoteId: null as string | null,
    selectedFolderId: null as string | null,
  },
  user: {
    id: null as string | null,
    preferences: {
      defaultLayout: 'single' as 'single' | 'dual' | 'grid',
      fontSize: 16,
      theme: 'light',
    },
  },
  offline: {
    pendingChanges: [] as Array<{
      type: 'update' | 'delete' | 'create';
      entity: 'note' | 'folder';
      data: any;
      timestamp: number;
    }>,
  },
});

// Configure persistence with MMKV
persistObservable(store, {
  local: ObservablePersistMMKV,
  persistLocal: true,
  saveDebounce: 1000,
});
