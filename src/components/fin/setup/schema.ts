import { z } from 'zod';
import { BudgetRuleType, CategoryType } from 'src/store/finance/types';

export const financeSetupSchema = z.object({
  currentBalance: z.string().min(1, 'Current balance is required').regex(/^\d+(\.\d{1,2})?$/, 'Invalid currency format'),
  monthlyIncome: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid currency format'),
  selectedRule: z.nativeEnum(BudgetRuleType),
  categories: z.array(z.object({
    id: z.string(),
    name: z.string(),
    icon: z.string(),
    description: z.string(),
    type: z.string(),
    isSelected: z.boolean()
  })).refine((categories) => categories.some(cat => cat.isSelected), {
    message: "At least one category must be selected"
  })
});

export type FinanceSetupFormData = z.infer<typeof financeSetupSchema>;

