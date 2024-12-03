import { LucideIcon } from "lucide-react-native";

export const REFERENCE_TYPES = ['book', 'website', 'article', 'video'] as const;

export type ReferenceType = typeof REFERENCE_TYPES[number];

export interface ColorScheme {
  gradient: [string, string];
  accent: string;
}

export interface Category {
  id: string;
  name: string;
  icon: LucideIcon;
  color: string;
  colorScheme?: ColorScheme;
}

export type CategoryReference = Pick<Category, 'id'>;

export interface Reference {
  id:string
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
  categoryId: CategoryReference['id'];
  references: Reference[];
  elements: Element[];
  lastEdited: Date;
  isBookmarked: boolean;
  comments: Comment[];
}

export interface Comment {
  id: string;
  content: string;
  author: string;
  createdAt: Date;
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
  categoryId: CategoryReference['id'];
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
export type UpdateableNoteFields = Partial<Omit<Note, 'id' | 'categoryId'>>;
