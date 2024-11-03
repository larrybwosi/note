import React, { useEffect } from 'react';
import { BudgetRuleType, RecurrenceFrequency, TransactionType, useFinanceStore } from 'src/store/test';
// Example React Component showing basic usage
const FinanceManager: React.FC = () => {
  const { store, addTransaction, updateInsights } = useFinanceStore();

  // Example: Adding a new transaction
  const handleAddExpense = () => {
    addTransaction({
      title: 'Grocery Shopping',
      amount: 150.50,
      type: TransactionType.EXPENSE,
      categoryId: 'food',
      isEssential: true,
      description: 'Weekly groceries',
      tags: ['food', 'essentials']
    });
  };

  // Example: Adding a recurring transaction
  const handleAddRecurringBill = () => {
    addTransaction({
      title: 'Netflix Subscription',
      amount: 14.99,
      type: TransactionType.EXPENSE,
      categoryId: 'entertainment',
      isEssential: false,
      recurrence: {
        frequency: RecurrenceFrequency.MONTHLY,
        reminderEnabled: true
      }
    });
  };

  // Example: Reading insights
  const renderInsights = () => {
    const { insights } = store;
    return (
      <div>
        <p>Guilt-free balance: ${insights.guiltFreeBalance}</p>
        <p>Projected savings: ${insights.projectedSavings}</p>
      </div>
    );
  };

  return (
    <div>
      <button onClick={handleAddExpense}>Add Expense</button>
      <button onClick={handleAddRecurringBill}>Add Recurring Bill</button>
      {renderInsights()}
    </div>
  );
};

// Example: Budget Management Component
const BudgetManager: React.FC = () => {
  const { store } = useFinanceStore();

  const setupDefaultBudget = () => {
    store.budgetConfig = {
      ...store.budgetConfig,
      selectedRule: BudgetRuleType.RULE_50_30_20,
      monthlyIncome: 5000,
      customRules: []
    };
  };

  const setupCustomBudget = () => {
    store.budgetConfig = {
      ...store.budgetConfig,
      selectedRule: BudgetRuleType.CUSTOM,
      monthlyIncome: 5000,
      customRules: [
        { categoryId: 'housing', percentage: 30 },
        { categoryId: 'food', percentage: 15 },
        { categoryId: 'savings', percentage: 25 },
        { categoryId: 'entertainment', percentage: 10 },
        { categoryId: 'transportation', percentage: 20 }
      ]
    };
  };

  return (
    <div>
      <button onClick={setupDefaultBudget}>Use 50/30/20 Rule</button>
      <button onClick={setupCustomBudget}>Use Custom Budget</button>
    </div>
  );
};

// Example: Savings Goals Component
const SavingsGoalsManager: React.FC = () => {
  const { store } = useFinanceStore();

  const addSavingsGoal = () => {
    const goalId = 'vacation-2024';
    store.budgetConfig.savingsGoals[goalId] = {
      id: goalId,
      name: 'Summer Vacation 2024',
      target: 3000,
      deadline: '2024-06-01',
      currentAmount: 0,
      categoryId: 'savings',
      priority: 1,
      autoContribute: {
        enabled: true,
        amount: 250,
        frequency: RecurrenceFrequency.MONTHLY
      }
    };
  };

  const trackSavingsProgress = () => {
    const { savingsProgress } = store.insights;
    return Object.entries(savingsProgress).map(([goalId, progress]) => (
      <div key={goalId}>
        <p>Goal: {store.budgetConfig.savingsGoals[goalId].name}</p>
        <p>Progress: {progress}%</p>
      </div>
    ));
  };

  return (
    <div>
      <button onClick={addSavingsGoal}>Add Vacation Savings Goal</button>
      {trackSavingsProgress()}
    </div>
  );
};

// Example: Category Management Component
const CategoryManager: React.FC = () => {
  const { store } = useFinanceStore();

  const addCustomCategory = () => {
    const categoryId = 'side-hustle';
    store.categories[categoryId] = {
      id: categoryId,
      name: 'Freelance Income',
      icon: '💻',
      color: '#4CAF50',
      type: CategoryType.CUSTOM,
      budgetPercentage: 100, // Track all income
      warningThreshold: 0.8
    };
  };

  const addSubcategory = () => {
    const categoryId = 'dining-out';
    store.categories[categoryId] = {
      id: categoryId,
      name: 'Dining Out',
      icon: '🍽️',
      color: '#FF5722',
      type: CategoryType.WANT,
      parentCategoryId: 'food',
      monthlyLimit: 300,
      warningThreshold: 0.9
    };
  };

  return (
    <div>
      <button onClick={addCustomCategory}>Add Income Category</button>
      <button onClick={addSubcategory}>Add Food Subcategory</button>
    </div>
  );
};

// Example: Analysis and Reporting Component
const FinanceAnalysis: React.FC = () => {
  const { store, updateInsights } = useFinanceStore();

  useEffect(() => {
    // Update insights when component mounts
    updateInsights();
  }, []);

  const renderUnusualSpending = () => {
    return store.insights.unusualSpending.map(({ categoryId, amount, percentageIncrease }) => (
      <div key={categoryId}>
        <p>Category: {store.categories[categoryId].name}</p>
        <p>Amount: ${amount}</p>
        <p>Increase: {(percentageIncrease * 100).toFixed(1)}%</p>
      </div>
    ));
  };

  const renderCategorySpending = () => {
    const { monthlySpendingByCategory } = store.insights;
    return Object.entries(monthlySpendingByCategory).map(([categoryId, amount]) => (
      <div key={categoryId}>
        <p>{store.categories[categoryId].name}: ${amount}</p>
      </div>
    ));
  };

  return (
    <div>
      <h3>Monthly Spending by Category</h3>
      {renderCategorySpending()}
      <h3>Unusual Spending Patterns</h3>
      {renderUnusualSpending()}
    </div>
  );
};

// Example of combining all components
const App: React.FC = () => {
  return (
    <div>
      <h1>Personal Finance Manager</h1>
      <FinanceManager />
      <hr />
      <h2>Budget Settings</h2>
      <BudgetManager />
      <hr />
      <h2>Savings Goals</h2>
      <SavingsGoalsManager />
      <hr />
      <h2>Categories</h2>
      <CategoryManager />
      <hr />
      <h2>Financial Analysis</h2>
      <FinanceAnalysis />
    </div>
  );
};

export default App;