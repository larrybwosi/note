import { observable } from '@legendapp/state';
import { ObservablePersistMMKV } from '@legendapp/state/persist-plugins/mmkv';
import { synced } from '@legendapp/state/sync';
import { z } from 'zod';

// Validation schemas
const referenceSchema = z.object({
  type: z.string(),
  title: z.string().min(1, 'Title is required'),
  author: z.string().optional(),
  url: z.string().url().optional(),
  page: z.union([z.string(), z.number()]).optional(),
});

const noteSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Title is required'),
  content: z.string(),
  tags: z.array(z.string()),
  category: z.string(),
  references: z.array(referenceSchema),
  lastEdited: z.date(),
  isBookmarked: z.boolean(),
});

const storeSchema = z.object({
  notes: z.array(noteSchema),
  categories: z.array(z.string()),
  referenceTypes: z.array(z.string()),
});

// Type definitions with better constraints
export type DefaultNoteCategory = 'personal' | 'work' | 'study' | 'other';
export type DefaultReferenceType = 'book' | 'website' | 'article' | 'video';

export interface BaseReference<T extends string = DefaultReferenceType> {
  type: T;
  title: string;
  author?: string;
  url?: string;
  page?: string | number;
}

export type CustomReference<T extends string> = BaseReference<T> & Record<string, unknown>;

export interface BaseNote<
  C extends string = DefaultNoteCategory,
  R extends string = DefaultReferenceType
> {
  id: string;
  title: string;
  content: string;
  tags: string[];
  category: C;
  references: BaseReference<R>[];
  lastEdited: Date;
  isBookmarked: boolean;
}

export type CustomNote<
  C extends string = DefaultNoteCategory,
  R extends string = DefaultReferenceType,
  CustomFields extends Record<string, unknown> = {}
> = BaseNote<C, R> & CustomFields;

export type NoteStore<
  C extends string = DefaultNoteCategory,
  R extends string = DefaultReferenceType,
  CustomFields extends Record<string, unknown> = {}
> = {
  notes: CustomNote<C, R, CustomFields>[];
  categories: C[];
  referenceTypes: R[];
};

// Error handling
export class NoteError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'NoteError';
  }
}

// Initial state
const initialState: NoteStore = {
  notes: [],
  categories: ['personal', 'work', 'study', 'other'],
  referenceTypes: ['book', 'website', 'article', 'video'],
};

// Store creation with persistence
export const notesStore = observable(
  synced<NoteStore>({
    initial: initialState,
    persist: { name: 'notes', plugin: ObservablePersistMMKV },
  })
);

// Action types with better type safety
export interface NoteActions {
  addNote: (note: Omit<CustomNote, 'id' | 'lastEdited'>) => Promise<string>;
  updateNote: (id: string, updates: Partial<CustomNote>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  toggleBookmark: (id: string) => Promise<void>;
  addCategory: (category: DefaultNoteCategory) => Promise<void>;
  addReferenceType: (referenceType: DefaultReferenceType) => Promise<void>;
}

// Utility functions
const validateNote = (note: unknown) => {
  const result = noteSchema.safeParse(note);
  if (!result.success) {
    throw new NoteError(
      `Invalid note data: ${result.error.errors.map(e => e.message).join(', ')}`,
      'VALIDATION_ERROR'
    );
  }
  return result.data;
};

const findNoteIndex = (id: string): number => {
  const index = notesStore.notes.findIndex((note) => note.id.get() === id);
  if (index === -1) {
    throw new NoteError(`Note with id ${id} not found`, 'NOT_FOUND');
  }
  return index;
};

// Enhanced hook with better error handling and performance
export function useNotes(): [typeof notesStore, NoteActions] {
  const addNote: NoteActions['addNote'] = async (note) => {
    try {
      const newNote: CustomNote = {
        ...note,
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
        lastEdited: new Date(),
      };
      
      // validateNote(newNote);
      
      notesStore.notes.push(newNote);
      return newNote.id;
    } catch (error) {
      if (error instanceof NoteError) throw error;
      throw new NoteError('Failed to add note', 'ADD_ERROR');
    }
  };

  const updateNote: NoteActions['updateNote'] = async (id, updates) => {
    try {
      const index = findNoteIndex(id);
      const currentNote = notesStore.notes[index].peek();
      
      const updatedNote = {
        ...currentNote,
        ...updates,
        lastEdited: new Date(),
      };
      
      validateNote(updatedNote);
      
      notesStore.notes[index].set(updatedNote);
    } catch (error) {
      if (error instanceof NoteError) throw error;
      throw new NoteError('Failed to update note', 'UPDATE_ERROR');
    }
  };

  const deleteNote: NoteActions['deleteNote'] = async (id) => {
    try {
      findNoteIndex(id); // Validate note exists
      notesStore.notes.set((notes) => notes.filter((note) => note.id !== id));
    } catch (error) {
      if (error instanceof NoteError) throw error;
      throw new NoteError('Failed to delete note', 'DELETE_ERROR');
    }
  };

  const toggleBookmark: NoteActions['toggleBookmark'] = async (id) => {
    try {
      const index = findNoteIndex(id);
      notesStore.notes[index].isBookmarked.set((prev) => !prev);
    } catch (error) {
      if (error instanceof NoteError) throw error;
      throw new NoteError('Failed to toggle bookmark', 'BOOKMARK_ERROR');
    }
  };

  const addCategory: NoteActions['addCategory'] = async (category) => {
    try {
      if (!notesStore.categories.peek().includes(category)) {
        notesStore.categories.push(category);
      }
    } catch (error) {
      throw new NoteError('Failed to add category', 'CATEGORY_ERROR');
    }
  };

  const addReferenceType: NoteActions['addReferenceType'] = async (referenceType) => {
    try {
      if (!notesStore.referenceTypes.peek().includes(referenceType)) {
        notesStore.referenceTypes.push(referenceType);
      }
    } catch (error) {
      throw new NoteError('Failed to add reference type', 'REFERENCE_TYPE_ERROR');
    }
  };

  return [
    notesStore,
    { addNote, updateNote, deleteNote, toggleBookmark, addCategory, addReferenceType },
  ];
}

// Export type utilities for better DX
export type NoteId = CustomNote['id'];
export type NoteCategory = CustomNote['category'];
export type NoteReference = CustomNote['references'][number];