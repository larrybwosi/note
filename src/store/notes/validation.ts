import { z } from 'zod';
import { ICONS, REFERENCE_TYPES } from './types';

export class ValidationError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: z.ZodError
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export const ColorSchemeSchema = z.object({
  gradient: z.tuple([z.string(), z.string()]),
  accent: z.string(),
}).strict();

export const CategorySchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Category name is required'),
  icon: z.enum(ICONS),
  color: z.string(),
  colorScheme: ColorSchemeSchema,
}).strict();

export const ReferenceSchema = z.object({
  type: z.enum(REFERENCE_TYPES),
  title: z.string().min(1, 'Reference title is required'),
  author: z.string().optional(),
  url: z.string().url('Invalid URL format').optional(),
  page: z.union([z.string(), z.number()]).optional(),
}).strict();

export const ElementSchema = z.object({
  id: z.string(),
  type: z.enum(['text', 'image', 'code', 'quote']),
  content: z.string().min(1, 'Element content is required'),
  metadata: z.record(z.unknown()).optional(),
}).strict();

export const NoteSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Note title is required'),
  content: z.string(),
  tags: z.array(z.string()),
  category: CategorySchema,
  references: z.array(ReferenceSchema),
  elements: z.array(ElementSchema),
  lastEdited: z.date(),
  isBookmarked: z.boolean(),
}).strict();

export const validateNote = (note: unknown) => {
  try {
    return {
      success: true as const,
      data: NoteSchema.parse(note)
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false as const,
        error: new ValidationError(
          'Note validation failed',
          'VALIDATION_ERROR',
          error
        )
      };
    }
    return {
      success: false as const,
      error: new ValidationError(
        'Unexpected validation error',
        'UNKNOWN_ERROR'
      )
    };
  }
};
