import { Budget, BudgetPeriodType } from "src/types/transaction";

// Helper functions for date handling and ID generation
export const createUniqueId = (): string => {
	return Date.now().toString() + Math.random().toString(36).substring(2, 9);
};

export const getDateRangeForPeriod = (
	periodType: BudgetPeriodType,
	startDate: Date
): { startDate: Date; endDate: Date } => {
	const endDate = new Date(startDate);

	switch (periodType) {
		case 'week':
			endDate.setDate(endDate.getDate() + 7);
			break;
		case 'month':
			endDate.setMonth(endDate.getMonth() + 1);
			break;
		case 'year':
			endDate.setFullYear(endDate.getFullYear() + 1);
			break;
	}

	return { startDate, endDate };
};

export const getCurrentMonthDateRange = () => {
	const now = new Date();
	const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
	const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
	return { startOfMonth, endOfMonth };
};

// Helper functions
export const calcTotalDaysInPeriod = (periodType: BudgetPeriodType, startDate: Date): number => {
	switch (periodType) {
		case 'week':
			return 7;
		case 'month': {
			// Calculate days in the month
			const year = startDate.getFullYear();
			const month = startDate.getMonth();
			return new Date(year, month + 1, 0).getDate();
		}
		case 'year':
			// Check for leap year
			const year = startDate.getFullYear();
			return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0 ? 366 : 365;
		default:
			return 30;
	}
};

export const calculateTotalPeriodMs = (budget: Budget): number => {
	const startDate = new Date(budget.startDate);
	const endDate = new Date(budget.endDate);
	return endDate.getTime() - startDate.getTime();
};

export const formatPeriodLabel = (start: Date, end: Date, periodType: string): string => {
	switch (periodType) {
		case 'week':
			return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
		case 'month':
			return start.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
		case 'year':
			return start.getFullYear().toString();
		default:
			return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
	}
};
