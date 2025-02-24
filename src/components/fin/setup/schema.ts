import { z } from 'zod';

const BudgetRuleTypeSchema = z.enum(['50/30/20', '70/20/10', '15/65/20', 'CUSTOM']);
export const financeSetupSchema = z.object({
  currentBalance: z.string().min(1, 'Current balance is required').regex(/^\d+(\.\d{1,2})?$/, 'Invalid currency format'),
  monthlyIncome: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid currency format'),
  selectedRule: z.nativeEnum(BudgetRuleTypeSchema.enum),
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

