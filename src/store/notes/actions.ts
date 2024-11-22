import { NoteWithoutId, UpdateableNoteFields, Note, Category, NoteStatistics, NoteSummary, NoteQueryOptions } from './types';
import { validateNote } from './validation';
import { notesStore } from './store';

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
  addNote: (note: NoteWithoutId) => Promise<Result<string, NoteActionError>>;
  updateNote: (id: string, updates: UpdateableNoteFields) => Promise<Result<void, NoteActionError>>;
  deleteNote: (id: string) => Promise<Result<void, NoteActionError>>;
  toggleBookmark: (id: string) => Promise<Result<void, NoteActionError>>;
  addCategory: (category: Category) => Promise<Result<void, NoteActionError>>;
  deleteAllNotes: () => Promise<Result<void, NoteActionError>>;

  getNote: (id: string) => Note;
  getNotes: (options?: NoteQueryOptions) => Note[];
  getNoteSummaries: (options?: NoteQueryOptions) => Promise<Result<NoteSummary[], NoteActionError>>;
  searchNotes: (query: string) => Promise<Result<Note[], NoteActionError>>;
  getRecentNotes: (limit?: number) =>Note[];
  getRelatedNotes: (noteId: string) => Promise<Result<Note[], NoteActionError>>;
  getNotesByTag: (tag: string) => Promise<Result<Note[], NoteActionError>>;
  getNotesByCategory: (categoryId: string) => Promise<Result<Note[], NoteActionError>>;
  // Tag management
  addTag: (noteId: string, tag: string) => Promise<Result<void, NoteActionError>>;
  removeTag: (noteId: string, tag: string) => Promise<Result<void, NoteActionError>>;

  getNoteStatistics: () => Promise<Result<NoteStatistics, NoteActionError>>;
  // Bulk operations
  bulkDeleteNotes: (noteIds: string[]) => Promise<Result<void, NoteActionError>>;
  bulkAddTags: (noteIds: string[], tags: string[]) => Promise<Result<void, NoteActionError>>;
  
  // Utility actions
  archiveNote: (noteId: string) => Promise<Result<void, NoteActionError>>;
  restoreNote: (noteId: string) => Promise<Result<void, NoteActionError>>;
  pinNote: (noteId: string) => Promise<Result<void, NoteActionError>>;
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
  const addNote = async (noteData: NoteWithoutId): Promise<Result<string, NoteActionError>> => {
    try {
      const newNote: Note = {
        ...noteData,
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
        lastEdited: new Date(),
      };

      console.log({newNote})
      const validation = validateNote(newNote);
      console.log({validation})
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

  const updateNote = async (
    id: string,
    updates: UpdateableNoteFields
  ): Promise<Result<void, NoteActionError>> => {
    try {
      const index = findNoteIndex(id);
      const currentNote = notesStore.notes[index].peek();
      
      const updatedNote = {
        ...currentNote,
        ...updates,
        lastEdited: new Date(),
      };
      
      const validation = validateNote(updatedNote);
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

  const deleteNote = async (id: string): Promise<Result<void, NoteActionError>> => {
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

  const deleteAllNotes = async (): Promise<Result<void, NoteActionError>> => {
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

  const toggleBookmark = async (id: string): Promise<Result<void, NoteActionError>> => {
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

  const addCategory = async (category: Category): Promise<Result<void, NoteActionError>> => {
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

  const getNotes = (
    options: NoteQueryOptions = {}
  ) => {
      let filteredNotes = notesStore.notes.peek();

      // Apply filters
      if (options.categoryIds?.length) {
        filteredNotes = filteredNotes.filter(note => 
          options.categoryIds!.includes(note.category.id)
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

      return filteredNotes ;
  };

  const getNoteSummaries = async (
    options?: NoteQueryOptions
  ): Promise<Result<NoteSummary[], NoteActionError>> => {
    const notesResult = getNotes(options);

    const summaries: NoteSummary[] = notesResult?.map(note => ({
      id: note.id,
      title: note.title,
      preview: note.content.substring(0, 150) + '...',
      category: note.category,
      tags: note.tags,
      lastEdited: note.lastEdited,
      isBookmarked: note.isBookmarked
    }));

    return { success: true, data: summaries };
  };

  const getRecentNotes = (
    limit = 10
  ) => {
    return getNotes({
      limit,
      sortBy: 'lastEdited',
      sortOrder: 'desc'
    });
  };

  const getRelatedNotes = async (
    noteId: string
  ): Promise<Result<Note[], NoteActionError>> => {
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
    if (sourceNote.category.id === targetNote.category.id) score += 3;
    
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

  const getNoteStatistics = async (): Promise<Result<NoteStatistics, NoteActionError>> => {
    try {
      const notes = notesStore.notes.peek();
      const categories = notesStore.categories.peek();
      
      // Calculate various statistics
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

      // Calculate notes per category
      categories.forEach(category => {
        stats.notesPerCategory[category.id] = notes.filter(
          n => n.category.id === category.id
        ).length;
      });

      // Calculate tag usage
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

      // Calculate average references
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

  const bulkUpdateNotes = async (
    noteIds: string[],
    updates: UpdateableNoteFields
  ): Promise<Result<void, NoteActionError>> => {
    try {
      const updatePromises = noteIds.map(id => updateNote(id, updates));
      await Promise.all(updatePromises);
      return { success: true, data: undefined };
    } catch (error) {
      return {
        success: false,
        error: new NoteActionError(
          'Failed to bulk update notes',
          'BULK_UPDATE_ERROR',
          error instanceof Error ? error : undefined
        )
      };
    }
  };

  const exportNotes = async (
    format: 'json' | 'markdown' | 'pdf'
  ): Promise<Result<Blob, NoteActionError>> => {
    try {
      const notes = notesStore.notes.peek();
      let content: string | Blob;

      switch (format) {
        case 'json':
          content = JSON.stringify(notes, null, 2);
          return {
            success: true,
            data: new Blob([content], { type: 'application/json' })
          };

        case 'markdown':
          content = notes.map(note => `
          # ${note.title}

          ${note.content}

          Tags: ${note.tags.join(', ')}
          Category: ${note.category.name}
          Last Edited: ${note.lastEdited.toISOString()}
          `).join('\n---\n');
          return {
            success: true,
            data: new Blob([content], { type: 'text/markdown' })
          };

        case 'pdf':
          // Implement PDF generation logic here
          throw new Error('PDF export not implemented');

        default:
          throw new Error(`Unsupported export format: ${format}`);
      }
    } catch (error) {
      return {
        success: false,
        error: new NoteActionError(
          'Failed to export notes',
          'EXPORT_ERROR',
          error instanceof Error ? error : undefined
        )
      };
    }
  };

  const archiveNote = async (noteId: string): Promise<Result<void, NoteActionError>> => {
    try {
      // Implement note archiving logic here
      throw new Error('Note archiving not implemented');
    } catch (error) {
      return {
        success: false,
        error: new NoteActionError(
          'Failed to archive note',
          'ARCHIVE_ERROR',
          error instanceof Error ? error : undefined
        )
      };
    }
  }
  return {
    addNote,
    updateNote,
    deleteNote,
    toggleBookmark,
    addCategory,
    deleteAllNotes,
    getNotes,
    getNoteStatistics,
    getNoteSummaries,
    archiveNote,
    getNote: (id) => getNotes({ ids: [id] }),
    searchNotes: (query) => getNotes({ searchTerm: query }),
    getRecentNotes,
    getRelatedNotes,
    getNotesByTag: (tag) => getNotes({ tags: [tag] }),
    getNotesByCategory: (categoryId) => getNotes({ categoryIds: [categoryId] }),
    addTag: async () => ({ success: true, data: undefined }), // Implement as needed
    removeTag: async () => ({ success: true, data: undefined }), // Implement as needed
    mergeTags: async () => ({ success: true, data: undefined }), // Implement as needed
    bulkUpdateNotes,
    bulkDeleteNotes: async () => ({ success: true, data: undefined }), // Implement as needed
    exportNotes,
  };
}