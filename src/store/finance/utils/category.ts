import { 
  CategoryId, 
  CategoryType, 
  ExpenseGroup, 
  FinanceStore, 
  IncomeCategory,
  Category,
  DEFAULT_EXPENSE_CATEGORIES,
  DEFAULT_INCOME_CATEGORIES,
  IncomeCategoryId,
  ExpenseCategoryId
} from "../types";

export const createCategory = (partial: Omit<Category, 'id' | 'isDefault' | 'isArchived'>): Category => {
  const id = partial.type === CategoryType.INCOME 
    ? `income_${Math.floor(Math.random() * 1000000)}`
    : `expense_${Math.floor(Math.random() * 1000000)}`;

  return {
    id,
    isDefault: false,
    isArchived: false,
    name: partial.name,
    icon: partial.icon,
    type: partial.type,
    subgroup: partial.subgroup,
    color: partial.color,
    budgetPercentage: partial.budgetPercentage,
    monthlyLimit: partial.monthlyLimit,
    warningThreshold: partial.warningThreshold,
    metadata: partial.metadata
  };
};

export const isCategoryValid = (categoryId: CategoryId, store: FinanceStore): boolean => 
  categoryId in store.categories;

export const getCategoriesByType = (
  store: FinanceStore,
  type: CategoryType
): Category[] => 
  Object.values(store.categories).filter(cat => cat.type === type);

export const getCategoriesBySubgroup = (
  store: FinanceStore,
  type: CategoryType,
  subgroup: ExpenseGroup | IncomeCategory
): Category[] => 
  Object.values(store.categories).filter(
    cat => cat.type === type && cat.subgroup === subgroup
  );

// Helper function to get all categories in a subgroup
export const getSubgroupCategories = (
  store: Map<CategoryId, Category>,
  type: CategoryType,
  subgroup: ExpenseGroup | IncomeCategory
): Category[] => {
  return Array.from(store.values()).filter(
    category => category.type === type && category.subgroup === subgroup
  );
};


// Custom categories storage (for user-defined categories)
let customCategories: Record<string, Category> = {};

/**
 * Gets a category by its ID
 * @param categoryId The ID of the category to retrieve
 * @returns The category object or undefined if not found
 */
export function getCategory(categoryId: CategoryId): Category {
  // Check expense categories
  if (categoryId in ExpenseCategoryId) {
    return DEFAULT_EXPENSE_CATEGORIES[categoryId as ExpenseCategoryId];
  }
  
  // Check income categories
  if (categoryId in IncomeCategoryId) {
    return DEFAULT_INCOME_CATEGORIES[categoryId as IncomeCategoryId];
  }
  
  // Check custom categories
  return customCategories[categoryId];
}

/**
 * Adds or updates a custom category
 * @param category The category to add or update
 */
export function setCustomCategory(category: Category): void {
  customCategories[category.id] = category;
}

/**
 * Gets all categories of a specific type
 * @param type The type of categories to retrieve
 * @returns An array of categories
 */
export function useGetCategoriesByType(type: CategoryType): Category[] {
  const categories: Category[] = [];
  
  if (type === CategoryType.EXPENSE) {
    categories.push(...Object.values(DEFAULT_EXPENSE_CATEGORIES));
  } else {
    categories.push(...Object.values(DEFAULT_INCOME_CATEGORIES));
  }
  
  // Add custom categories of the specified type
  categories.push(
    ...Object.values(customCategories).filter(cat => cat.type === type)
  );
  
  return categories;
}

/**
 * Gets all available categories
 * @returns An array of all categories
 */
export function getAllCategories(): Category[] {
  return [
    ...Object.values(DEFAULT_EXPENSE_CATEGORIES),
    ...Object.values(DEFAULT_INCOME_CATEGORIES),
    ...Object.values(customCategories)
  ];
}
