import { z } from 'zod';

export const validateSchema = <T extends z.ZodType>(schema: T, data: unknown): z.infer<T> => {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Validation error:', error.errors);
    } else {
      console.error('Unknown error during validation:', error);
    }
    throw error;
  }
};

export const handleAsyncError = async <T>(
  asyncFn: () => Promise<T>,
  errorMessage: string
): Promise<T> => {
  try {
    return await asyncFn();
  } catch (error) {
    console.error(`${errorMessage}:`, error);
    throw error;
  }
};

export const calculatePercentage = (value: number, total: number): number => {
  return total > 0 ? (value / total) * 100 : 0;
};

export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
};

