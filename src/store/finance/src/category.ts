import { CategorySchema, Category, CategoryTypeSchema } from './types';
import { store } from '../store';
import { z } from 'zod';
import { budgetService } from './budget';

export const categoryService = {
  addCategory: (category: Category): void => {
    const validatedCategory = CategorySchema.parse(category);
    store.categories[validatedCategory.name].set(validatedCategory);
  },

  getCategories: (): Category[] => {
    return Object.values(store.categories).map((cat) => CategorySchema.parse(cat.get()));
  },

  getCategoriesByType: (type: z.infer<typeof CategoryTypeSchema>): Category[] => {
    const categories: Category[] = Object.values(store.categories.get());
    return categories.filter(cat => cat.type === type).map(cat => CategorySchema.parse(cat));
  },

  updateCategory: (id: string, updates: Partial<Category>): void => {
    if (store.categories[id].get()) {
      const updatedCategory = { ...store.categories[id].get(), ...updates };
      const validatedCategory = CategorySchema.parse(updatedCategory);
      store.categories[id].set(validatedCategory);
    }
  },

  getCategoryBudget: (name: string): number => {
    const category = CategorySchema.parse(store.categories[name].get());
    const monthlyIncome = store.budgetConfig.monthlyIncome.get();
    const rule = store.budgetConfig.rule.get();
    
    if (category && monthlyIncome) {
      return budgetService.calculateCategoryBudget(category.type, monthlyIncome, rule);
    }
    return 0;
  },
};
