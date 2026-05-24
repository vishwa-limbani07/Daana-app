// formatCurrency.js — single place to format ₹ amounts.
// Indian numbering (₹1,00,000) is built-in via 'en-IN' locale.

export const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
