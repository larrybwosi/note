import { store } from "../store";
import { incomeExpenseService } from "./incomeExpense";
import { insightService } from "./insight";
import { trendAnalysisService } from "./trend";
import { BudgetConfigSchema, BudgetRuleTypeSchema, CategoryTypeSchema, SavingsGoalSchema } from "./types";
import { z } from 'zod';


const calculateGuiltFreeBalance = (budgetConfig: z.infer<typeof BudgetConfigSchema>): number => {
  const monthlyIncome = incomeExpenseService.getTotalIncome();
  const expenses =  incomeExpenseService.getTotalExpenses();

  let budgetedAmount: number;
  if (budgetConfig.rule === BudgetRuleTypeSchema.enum.RULE_15_65_20) {
    budgetedAmount = monthlyIncome * 0.3; // 30% for wants
  } else if (budgetConfig.rule === BudgetRuleTypeSchema.enum.CUSTOM) {
    budgetedAmount = monthlyIncome * 0.2; // 20% for savings
  } else if (budgetConfig.rule === BudgetRuleTypeSchema.enum.RULE_50_30_20) {
    budgetedAmount = monthlyIncome * 0.5; // 50% for needs
  } else if (budgetConfig.rule === BudgetRuleTypeSchema.enum.RULE_70_20_10) {
    budgetedAmount = monthlyIncome * 0.7; // 70% for savings
  } 
  else {
    budgetedAmount = monthlyIncome * 0.3; // Default to 30%
  }

  return Math.max(0, budgetedAmount - expenses);
};

export const budgetService = {
  updateMonthlyIncome: (amount: number): void => {
    store.budgetConfig.monthlyIncome.set(amount);
    budgetService.recalculateBudgets();
  },

  addSavingsGoal: (goal: z.infer<typeof SavingsGoalSchema>): void => {
    const validatedGoal = SavingsGoalSchema.parse(goal);
    store.budgetConfig.savingsGoals[validatedGoal.id].set(validatedGoal);
  },

  getSavingsProgress: () => {
    // Implementation needed
  },

  updateSavingsProgress: (goalId: string, amount: number): void => {
    if (store.budgetConfig.savingsGoals[goalId].get()) {
      store.budgetConfig.savingsGoals[goalId].currentAmount.set(amount);
      insightService.updateSavingsInsights();
    }
  },

  checkBudgetAlerts: async (): Promise<void> => {
    const categories = Object.keys(store.categories.get());
    
    for (const categoryId of categories) {
      const compliance = await trendAnalysisService.calculateBudgetCompliance(categoryId);
      
      if (compliance.spendingPercentage >= 90) {
        store.alerts.categoryOverspend.push({
          categoryId,
          currentSpending: compliance.currentSpending,
          budgetLimit: compliance.budgetLimit,
          date: new Date().toISOString(),
          type: 'categoryOverspend',
          message: `You are spending more than 90% of your budget on ${store.categories.get()[categoryId].name}. Consider adjusting your spending habits or increasing your budget.`,
          severity: 'high',
          read: false
        });
      }
    }
  },

  checkAlerts: async (): Promise<void> => {
    await budgetService.checkBudgetAlerts();
  },

  calculateCategoryBudget: (categoryType: z.infer<typeof CategoryTypeSchema>, monthlyIncome: number, budgetRule: z.infer<typeof BudgetRuleTypeSchema>): number => {
    switch (budgetRule) {
      case BudgetRuleTypeSchema.enum.RULE_50_30_20:
        if (categoryType === CategoryTypeSchema.enum.needs) return monthlyIncome * 0.5;
        if (categoryType === CategoryTypeSchema.enum.wants) return monthlyIncome * 0.3;
        if (categoryType === CategoryTypeSchema.enum.savings) return monthlyIncome * 0.2;
        break;
      case BudgetRuleTypeSchema.enum.RULE_70_20_10:
        if (categoryType === CategoryTypeSchema.enum.needs) return monthlyIncome * 0.7;
        if (categoryType === CategoryTypeSchema.enum.wants) return monthlyIncome * 0.2;
        if (categoryType === CategoryTypeSchema.enum.savings) return monthlyIncome * 0.1;
        break;
      case BudgetRuleTypeSchema.enum.RULE_15_65_20:
        if (categoryType === CategoryTypeSchema.enum.needs) return monthlyIncome * 0.15;
        if (categoryType === CategoryTypeSchema.enum.wants) return monthlyIncome * 0.65;
        if (categoryType === CategoryTypeSchema.enum.savings) return monthlyIncome * 0.2;
        break;
      case BudgetRuleTypeSchema.enum.CUSTOM:
        if (categoryType === CategoryTypeSchema.enum.needs) return monthlyIncome * 0.3;
        if (categoryType === CategoryTypeSchema.enum.wants) return monthlyIncome * 0.2;
        if (categoryType === CategoryTypeSchema.enum.savings) return monthlyIncome * 0.5;
        break;
    }
    return 0;
  },

  guiltFreeBalance: (): number => {
    return calculateGuiltFreeBalance(BudgetConfigSchema.parse(store.budgetConfig.get()));
  },

  recalculateBudgets: (): void => {
    const categories = Object.values(store.categories.get());
    const monthlyIncome = store.budgetConfig.monthlyIncome.get();
    const rule = store.budgetConfig.rule.get();

    for (const category of categories) {
      const budget = budgetService.calculateCategoryBudget(category.type, monthlyIncome, rule);
      store.categories[category.name].budget.set(budget);
    }
  },
};

