
export const ICONS = ['school', 'assignment', 'business', 'science', 'book'] as const;
export const REFERENCE_TYPES = ['book', 'website', 'article', 'video'] as const;

export type IconName = typeof ICONS[number];
export type ReferenceType = typeof REFERENCE_TYPES[number];

export interface ColorScheme {
  gradient: readonly [string, string];
  accent: string;
}

export interface Category {
  id: string;
  name: string;
  icon: IconName;
  color: string;
  colorScheme?: ColorScheme;
}

export interface Reference {
  type: ReferenceType;
  title: string;
  author?: string;
  url?: string;
  page?: string | number;
}

export interface Element {
  id: string;
  type: 'text' | 'image' | 'code' | 'quote';
  content: string;
  metadata?: Record<string, unknown>;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  category: Category;
  references: Reference[];
  elements: Element[];
  lastEdited: Date;
  isBookmarked: boolean;
}

export interface NoteQueryOptions {
  limit?: number;
  offset?: number;
  sortBy?: 'lastEdited' | 'title' | 'bookmarked';
  sortOrder?: 'asc' | 'desc';
  categoryIds?: string[];
  tags?: string[];
  searchTerm?: string;
  bookmarkedOnly?: boolean;
  fromDate?: Date;
  toDate?: Date;
}

export interface NoteSummary {
  id: string;
  title: string;
  preview: string;
  category: Category;
  tags: string[];
  lastEdited: Date;
  isBookmarked: boolean;
}

export interface NoteStatistics {
  totalNotes: number;
  bookmarkedNotes: number;
  notesPerCategory: Record<string, number>;
  notesPerTag: Record<string, number>;
  averageReferencesPerNote: number;
  mostUsedTags: { tag: string; count: number }[];
  recentActivity: {
    created: number;
    updated: number;
    deleted: number;
  };
}
export type NoteWithoutId = Omit<Note, 'id'>;
export type CategoryWithoutId = Omit<Category, 'id'>;
export type UpdateableNoteFields = Partial<Omit<Note, 'id' | 'category'>>;
