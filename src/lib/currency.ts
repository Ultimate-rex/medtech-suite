// Currency formatting for Indian Rupees
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatPhone = (phone: string): string => {
  // If phone doesn't start with +91, add it
  if (!phone.startsWith('+91')) {
    return `+91-${phone.replace(/^\+?/, '')}`;
  }
  return phone;
};

export const CURRENCY_SYMBOL = '₹';
