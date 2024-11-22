import { observable } from '@legendapp/state';
import { ObservablePersistMMKV } from '@legendapp/state/persist-plugins/mmkv';
import { synced } from '@legendapp/state/sync';
import { Note, Category, NoteStatistics } from './types';


export interface NoteStore {
  notes: Note[];
  categories: Category[];
  referenceTypes: string[];
  recentActivity?: {
    created: string[];  // note IDs
    updated: string[];
    deleted: string[];
    timestamp: number;
  };
  stats?: {
    lastCalculated: number;
    data: NoteStatistics;
  };
}

const initialState: NoteStore = {
  notes: [],
  categories: [],
  referenceTypes: ['book', 'website', 'article', 'video'],
};

export const notesStore = observable(
  synced<NoteStore>({
    initial: initialState,
    persist: { 
      name: 'notes-store', 
      plugin: ObservablePersistMMKV 
    },
  })
);