// useDashboardLayout.js — same persistence pattern as useAuthLayout.
// Three layouts: tabs / insights / command. Stored in localStorage so
// it survives reloads while you decide which one to keep.

import { useEffect, useState } from 'react';

export const DASHBOARD_LAYOUTS = ['tabs', 'insights', 'command'];
const STORAGE_KEY = 'daana:dashboardLayout';
const DEFAULT = 'insights';

const safeRead = () => {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return DASHBOARD_LAYOUTS.includes(v) ? v : DEFAULT;
  } catch { return DEFAULT; }
};

export const useDashboardLayout = () => {
  const [key, setKey] = useState(safeRead);
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, key); } catch {}
  }, [key]);
  return { key, setKey };
};
