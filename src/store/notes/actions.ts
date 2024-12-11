import { NoteWithoutId, UpdateableNoteFields, Note, Category, NoteStatistics, NoteSummary, NoteQueryOptions } from './types';
import { notesStore } from './store';
import { validateNote } from './validation';

export class NoteActionError extends Error {
  constructor(
    message: string,
    public code: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'NoteActionError';
  }
}

export interface NoteActions {
  addNote: (note: NoteWithoutId) => Result<string, NoteActionError>;
  updateNote: (id: string, updates: UpdateableNoteFields) => Result<void, NoteActionError>;
  deleteNote: (id: string) => Result<void, NoteActionError>;
  toggleBookmark: (id: string) => Result<void, NoteActionError>;
  addCategory: (category: Category) => Result<void, NoteActionError>;
  deleteAllNotes: () => Result<void, NoteActionError>;

  getNote: (id: string) => Note | undefined;
  getNotes: (options?: NoteQueryOptions) => Note[];
  getNoteSummaries: (options?: NoteQueryOptions) => Result<NoteSummary[], NoteActionError>;
  searchNotes: (query: string) => Note[];
  getRecentNotes: (limit?: number) => Note[];
  getRelatedNotes: (noteId: string) => Result<Note[], NoteActionError>;
  getNotesByTag: (tag: string) => Note[];
  getNotesByCategory: (categoryId: string) => Note[];
  
  addTag: (noteId: string, tag: string) => Result<void, NoteActionError>;
  removeTag: (noteId: string, tag: string) => Result<void, NoteActionError>;

  getNoteStatistics: () => Result<NoteStatistics, NoteActionError>;
  bulkDeleteNotes: (noteIds: string[]) => Result<void, NoteActionError>;
  bulkAddTags: (noteIds: string[], tags: string[]) => Result<void, NoteActionError>;
  
  archiveNote: (noteId: string) => Result<void, NoteActionError>;
  restoreNote: (noteId: string) => Result<void, NoteActionError>;
  pinNote: (noteId: string) => Result<void, NoteActionError>;
}

type Result<T, E> = 
  | { success: true; data: T }
  | { success: false; error: E };

const findNoteIndex = (id: string): number => {
  const index = notesStore.notes.findIndex((note) => note.id.get() === id);
  if (index === -1) {
    throw new NoteActionError(
      `Note with ID ${id} not found`,
      'NOTE_NOT_FOUND'
    );
  }
  return index;
};

export function useNotes(): NoteActions {
  const getNote = (id: string): Note | undefined => notesStore.notes.peek().find((note) => note.id === id);
  const addNote = (noteData: NoteWithoutId): Result<string, NoteActionError> => {
    try {
      const newNote: Note = {
        ...noteData,
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
        lastEdited: new Date(),
      };
      console.log('newNote added', newNote);

      const validation = validateNote(newNote);
      console.log(validation)
      if (!validation.success) {
        return {
          success: false,
          error: new NoteActionError(
            'Note validation failed',
            'VALIDATION_ERROR',
            validation.error
          )
        };
      }

      notesStore.notes.push(newNote);
      console.log('newNote pushed', notesStore.notes.peek());
      return { success: true, data: newNote.id };
    } catch (error) {
      return {
        success: false,
        error: new NoteActionError(
          'Failed to add note',
          'ADD_ERROR',
          error instanceof Error ? error : undefined
        )
      };
    }
  };

  const updateNote = (
    id: string,
    updates: UpdateableNoteFields
  ): Result<void, NoteActionError> => {
    try {
      const index = findNoteIndex(id);
      const currentNote = notesStore.notes[index].peek();
      
      const updatedNote = {
        ...currentNote,
        ...updates,
        lastEdited: new Date(),
      };
      
      const validation = validateNote(updatedNote);
      console.log(validation)
      if (!validation.success) {
        return {
          success: false,
          error: new NoteActionError(
            'Invalid note update',
            'VALIDATION_ERROR',
            validation.error
          )
        };
      }
      
      notesStore.notes[index].set(updatedNote);
      return { success: true, data: undefined };
    } catch (error) {
      return {
        success: false,
        error: new NoteActionError(
          'Failed to update note',
          'UPDATE_ERROR',
          error instanceof Error ? error : undefined
        )
      };
    }
  };

  const deleteNote = (id: string): Result<void, NoteActionError> => {
    try {
      findNoteIndex(id); // Validate note exists
      notesStore.notes.set((notes) => notes.filter((note) => note.id !== id));
      return { success: true, data: undefined };
    } catch (error) {
      return {
        success: false,
        error: new NoteActionError(
          'Failed to delete note',
          'DELETE_ERROR',
          error instanceof Error ? error : undefined
        )
      };
    }
  };

  const deleteAllNotes = (): Result<void, NoteActionError> => {
    try {
      notesStore.notes.set([]);
      return { success: true, data: undefined };
    } catch (error) {
      return {
        success: false,
        error: new NoteActionError(
          'Failed to delete all notes',
          'DELETE_ALL_ERROR',
          error instanceof Error ? error : undefined
        )
      };
    }
  };

  const toggleBookmark = (id: string): Result<void, NoteActionError> => {
    try {
      const index = findNoteIndex(id);
      notesStore.notes[index].isBookmarked.set((prev) => !prev);
      return { success: true, data: undefined };
    } catch (error) {
      return {
        success: false,
        error: new NoteActionError(
          'Failed to toggle bookmark',
          'BOOKMARK_ERROR',
          error instanceof Error ? error : undefined
        )
      };
    }
  };

  const addCategory = (category: Category): Result<void, NoteActionError> => {
    try {
      if (!notesStore.categories.peek().some(c => c.id === category.id)) {
        notesStore.categories.push(category);
      }
      return { success: true, data: undefined };
    } catch (error) {
      return {
        success: false,
        error: new NoteActionError(
          'Failed to add category',
          'CATEGORY_ERROR',
          error instanceof Error ? error : undefined
        )
      };
    }
  };

  const getNotes = (options: NoteQueryOptions = {}): Note[] => {
    let filteredNotes = notesStore.notes.peek();

    // Apply filters
    if (options.categoryIds?.length) {
      filteredNotes = filteredNotes.filter(note => 
        options.categoryIds!.includes(note.categoryId)
      );
    }

    if (options.tags?.length) {
      filteredNotes = filteredNotes.filter(note =>
        options.tags!.some(tag => note.tags.includes(tag))
      );
    }

    if (options.bookmarkedOnly) {
      filteredNotes = filteredNotes.filter(note => note.isBookmarked);
    }

    if (options.fromDate) {
      filteredNotes = filteredNotes.filter(note => 
        note.lastEdited >= options.fromDate!
      );
    }

    if (options.toDate) {
      filteredNotes = filteredNotes.filter(note => 
        note.lastEdited <= options.toDate!
      );
    }

    if (options.searchTerm) {
      const searchLower = options.searchTerm.toLowerCase();
      filteredNotes = filteredNotes.filter(note =>
        note.title.toLowerCase().includes(searchLower) ||
        note.content.toLowerCase().includes(searchLower) ||
        note.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // Apply sorting
    if (options.sortBy) {
      filteredNotes.sort((a, b) => {
        const aValue = a[options.sortBy === 'bookmarked' ? 'isBookmarked' : options.sortBy!];
        const bValue = b[options.sortBy === 'bookmarked' ? 'isBookmarked' : options.sortBy!];
        const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        return options.sortOrder === 'desc' ? -comparison : comparison;
      });
    }

    // Apply pagination
    if (options.offset || options.limit) {
      const start = options.offset || 0;
      const end = options.limit ? start + options.limit : undefined;
      filteredNotes = filteredNotes.slice(start, end);
    }

    return filteredNotes;
  };

  const getNoteSummaries = (
    options?: NoteQueryOptions
  ): Result<NoteSummary[], NoteActionError> => {
    try {
      const notesResult = getNotes(options);

      const summaries: NoteSummary[] = notesResult.map(note => ({
        id: note.id,
        title: note.title,
        preview: note.content.substring(0, 150) + '...',
        categoryId: note.categoryId,
        tags: note.tags,
        lastEdited: note.lastEdited,
        isBookmarked: note.isBookmarked
      }));

      return { success: true, data: summaries };
    } catch (error) {
      return {
        success: false,
        error: new NoteActionError(
          'Failed to get note summaries',
          'QUERY_ERROR',
          error instanceof Error ? error : undefined
        )
      };
    }
  };

  const getRecentNotes = (limit = 10): Note[] => {
    return getNotes({
      limit,
      sortBy: 'lastEdited',
      sortOrder: 'desc'
    });
  };

  const getRelatedNotes = (noteId: string): Result<Note[], NoteActionError> => {
    try {
      const note = notesStore.notes.peek().find(n => n.id === noteId);
      if (!note) {
        throw new NoteActionError(`Note with ID ${noteId} not found`, 'NOTE_NOT_FOUND');
      }

      const relatedNotes = notesStore.notes.peek()
        .filter(n => n.id !== noteId)
        .map(n => ({
          note: n,
          relevanceScore: calculateRelevanceScore(note, n)
        }))
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, 5)
        .map(item => item.note);

      return { success: true, data: relatedNotes };
    } catch (error) {
      return {
        success: false,
        error: new NoteActionError(
          'Failed to get related notes',
          'QUERY_ERROR',
          error instanceof Error ? error : undefined
        )
      };
    }
  };

  const calculateRelevanceScore = (sourceNote: Note, targetNote: Note): number => {
    let score = 0;
    
    // Same category
    if (sourceNote.categoryId === targetNote.categoryId) score += 3;
    
    // Shared tags
    const sharedTags = sourceNote.tags.filter(tag => 
      targetNote.tags.includes(tag)
    ).length;
    score += sharedTags;
    
    // Content similarity (basic implementation)
    const sourceWords = new Set(sourceNote.content.toLowerCase().split(/\s+/));
    const targetWords = new Set(targetNote.content.toLowerCase().split(/\s+/));
    const sharedWords = [...sourceWords].filter(word => targetWords.has(word)).length;
    score += sharedWords * 0.1;
    
    return score;
  };

  const getNoteStatistics = (): Result<NoteStatistics, NoteActionError> => {
    try {
      const notes = notesStore.notes.peek();
      const categories = notesStore.categories.peek();
      
      const stats: NoteStatistics = {
        totalNotes: notes.length,
        bookmarkedNotes: notes.filter(n => n.isBookmarked).length,
        notesPerCategory: {},
        notesPerTag: {},
        averageReferencesPerNote: 0,
        mostUsedTags: [],
        recentActivity: {
          created: 0,
          updated: 0,
          deleted: 0
        }
      };

      categories.forEach(category => {
        stats.notesPerCategory[category.id] = notes.filter(
          n => n.categoryId === category.id
        ).length;
      });

      const tagCounts: Record<string, number> = {};
      notes.forEach(note => {
        note.tags.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      });

      stats.mostUsedTags = Object.entries(tagCounts)
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      const totalReferences = notes.reduce(
        (sum, note) => sum + note.references.length, 
        0
      );
      stats.averageReferencesPerNote = totalReferences / notes.length;

      return { success: true, data: stats };
    } catch (error) {
      return {
        success: false,
        error: new NoteActionError(
          'Failed to calculate statistics',
          'STATS_ERROR',
          error instanceof Error ? error : undefined
        )
      };
    }
  };

  const bulkDeleteNotes = (noteIds: string[]): Result<void, NoteActionError> => {
    try {
      notesStore.notes.set(notes => notes.filter(note => !noteIds.includes(note.id)));
      return { success: true, data: undefined };
    } catch (error) {
      return {
        success: false,
        error: new NoteActionError(
          'Failed to bulk delete notes',
          'BULK_DELETE_ERROR',
          error instanceof Error ? error : undefined
        )
      };
    }
  };

  const bulkAddTags = (noteIds: string[], tags: string[]): Result<void, NoteActionError> => {
    try {
      notesStore.notes.set(notes => 
        notes.map(note => 
          noteIds.includes(note.id) 
            ? { ...note, tags: [...new Set([...note.tags, ...tags])] }
            : note
        )
      );
      return { success: true, data: undefined };
    } catch (error) {
      return {
        success: false,
        error: new NoteActionError(
          'Failed to bulk add tags',
          'BULK_TAG_ERROR',
          error instanceof Error ? error : undefined
        )
      };
    }
  };

  const archiveNote = (noteId: string): Result<void, NoteActionError> => {
    try {
      const index = findNoteIndex(noteId);
      notesStore.notes[index].set(note => ({ ...note, isArchived: true }));
      return { success: true, data: undefined };
    } catch (error ) {
      return {
        success: false,
        error: new NoteActionError(
          'Failed to archive note',
          'ARCHIVE_ERROR',
          error instanceof Error ? error : undefined
        )
      };
    }
  };

  const restoreNote = (noteId: string): Result<void, NoteActionError> => {
    try {
      const index = findNoteIndex(noteId);
      notesStore.notes[index].set(note => ({ ...note, isArchived: false }));
      return { success: true, data: undefined };
    } catch (error ) {
      return {
        success: false,
        error: new NoteActionError(
          'Failed to restore note',
          'RESTORE_ERROR',
          error instanceof Error ? error : undefined
        )
      };
    }
  };

  const pinNote = (noteId: string): Result<void, NoteActionError> => {
    try {
      const index = findNoteIndex(noteId);
      notesStore.notes[index].set(note => ({ ...note, isPinned: true }));
      return { success: true, data: undefined };
    } catch (error ) {
      return {
        success: false,
        error: new NoteActionError(
          'Failed to pin note',
          'PIN_ERROR',
          error instanceof Error ? error : undefined
        )
      };
    }
  };

  const removeTag = (noteId: string, tag: string): Result<void, NoteActionError> => {
    try {
      const index = findNoteIndex(noteId);
      notesStore.notes[index].set(note => ({ ...note, tags: note.tags.filter(t => t !== tag) }));
      return { success: true, data: undefined };
    } catch (error ) {
      return {
        success: false,
        error: new NoteActionError(
          'Failed to remove tag',
          'REMOVE_TAG_ERROR',
          error instanceof Error ? error : undefined
        )
      };
    }
  };

  const addTag = (noteId: string, tag: string): Result<void, NoteActionError> => {
    try {
      const index = findNoteIndex(noteId);
      notesStore.notes[index].set(note => ({ ...note, tags: [...note.tags, tag] }));
      return { success: true, data: undefined };
    } catch (error ) {
      return {
        success: false,
        error: new NoteActionError(
          'Failed to add tag',
          'ADD_TAG_ERROR',
          error instanceof Error ? error : undefined
        )
      };
    }
  };

  const searchNotes = (query: string): Note[] => {
    return notesStore.notes.peek().filter(note => 
      note.title.toLowerCase().includes(query.toLowerCase()) ||
      note.content.toLowerCase().includes(query.toLowerCase())
    );
  };

  const getNotesByTag = (tag: string): Note[] => {
    return notesStore.notes.peek().filter(note => note.tags.includes(tag));
  };

  const getNotesByCategory = (categoryId: string): Note[] => {
    return notesStore.notes.peek().filter(note => note.categoryId === categoryId);
  };

  return { 
    addNote, 
    updateNote, 
    deleteNote, 
    deleteAllNotes, 
    archiveNote, 
    toggleBookmark, 
    addCategory, 
    getNote,
    getNotes, 
    getNoteSummaries, 
    searchNotes, 
    getRecentNotes, 
    getRelatedNotes, 
    getNotesByTag, 
    getNotesByCategory, 
    addTag, 
    removeTag, 
    getNoteStatistics, 
    bulkDeleteNotes, 
    bulkAddTags, 
    restoreNote, 
    pinNote 
  };
};
