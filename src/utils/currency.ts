
export interface Currency {
	code: string;
	name: string;
	symbol: string;
}

export const currencies: Record<string, Currency> = {
  'USD':{ code: 'USD', name: 'US Dollar', symbol: '$' },
  'EUR':{ code: 'EUR', name: 'Euro', symbol: '€' },
  'GBP':{ code: 'GBP', name: 'British Pound', symbol: '£' },
  'JPY':{ code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  'CNY':{ code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  'INR':{ code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  'CAD':{ code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  'AUD':{ code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  'CHF':{ code: 'CHF', name: 'Swiss Franc', symbol: 'Fr' },
  'SGD':{ code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
};

export const CurrencyOptions = Object.keys(currencies)
export type CurrencyCode = keyof typeof currencies


export const formatCurrency = (amount: number) => {
  const res= amount.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${res}`
};