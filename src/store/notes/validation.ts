import { z } from 'zod';
import { REFERENCE_TYPES } from './types';

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
  icon: z.enum(['book', 'book-open', 'book-open-page-variant', 'book-multiple', 'book-open-page-variant-outline']).optional(),
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
  content: z.string().min(1, 'Note content is required'),
  tags: z.array(z.string()).default([]).optional(),
  categoryId: z.string().optional(),
  references: z.array(ReferenceSchema).optional(),
  elements: z.array(ElementSchema).optional(),
  lastEdited: z.date().optional(),
  isBookmarked: z.boolean().default(false).optional(),
  comments:z.array(z.string()).optional()
}).strict();

export const validateNote = (note: unknown) => {
  try {
    return {
      success: true as const,
      data: NoteSchema.parse(note)
    };
  } catch (error) {
    console.log(error)
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
