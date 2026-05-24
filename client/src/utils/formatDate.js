// formatDate.js — pretty dates and "X days left" countdown for deadlines.

export const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

export const daysLeft = (deadline) => {
  const ms = new Date(deadline) - Date.now();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
};
