import { profileData$ } from "src/store/useProfile";

export interface Currency {
	code: string;
	name: string;
	symbol: string;
}

export const currencies: Record<string, Currency> = {
	USD: { code: 'USD', name: 'US Dollar', symbol: '$' },
	EUR: { code: 'EUR', name: 'Euro', symbol: '€' },
	GBP: { code: 'GBP', name: 'British Pound', symbol: '£' },
	JPY: { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
	CAD: { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
	AUD: { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
	CHF: { code: 'CHF', name: 'Swiss Franc', symbol: 'Fr' },
	KES: { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh' },
};

const currencyConversionRates: Record<CurrencyCode, number> = {
	USD: 1,
	EUR: 0.9263,
	GBP: 1.1935,
	JPY: 0.0063,
	CAD: 0.7761,
	AUD: 0.6961,
	CHF: 1.1287,
	KES: 0.0077,
};

export const CurrencyOptions = Object.keys(currencies);
export type CurrencyCode = keyof typeof currencies;


export const formatCurrency = (amount: number,) => {
  const targetCurrencyCode = profileData$.currency.get();
 const baseCurrencyCode = 'USD';
  const targetCurrency = currencies[targetCurrencyCode];
  const baseCurrency = currencies['USD'];

if (!targetCurrency) {
	console.warn(`Target currency code "${targetCurrencyCode}" not found. Defaulting to USD.`);
}

if (!baseCurrency) {
	console.warn(`Base currency code "${baseCurrencyCode}" not found. Defaulting to USD.`);
}

const conversionRate =
	currencyConversionRates[targetCurrencyCode] / currencyConversionRates[baseCurrencyCode];
const convertedAmount = amount * conversionRate;

// Uncomment the following lines for currency formatting

// const res = convertedAmount.toLocaleString('en-US', {
// 	style: 'currency',
// 	currency: targetCurrencyCode,
// 	minimumFractionDigits: 2,
// 	maximumFractionDigits: 2,
// });
const res = amount?.toLocaleString('en-US', {
	style: 'currency',
	currency: targetCurrencyCode,
	minimumFractionDigits: 2,
	maximumFractionDigits: 2,
});

return `${res}`;
};