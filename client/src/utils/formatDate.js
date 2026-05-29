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

// timeAgo — "just now", "5m ago", "2h ago", "3d ago".
// For older items we fall back to a real date so the feed doesn't
// say "47d ago" for things that are weeks old.
export const timeAgo = (date) => {
  const diffSec = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (diffSec < 10) return 'just now';
  if (diffSec < 60) return `${diffSec}s ago`;
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  if (diffSec < 86400 * 7) return `${Math.floor(diffSec / 86400)}d ago`;
  return formatDate(date);
};
