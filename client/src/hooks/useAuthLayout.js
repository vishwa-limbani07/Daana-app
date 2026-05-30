// useAuthLayout.js — persists the active auth layout in localStorage.
// Mirrors useAuthTheme; kept separate so layout + theme are independent dimensions.

import { useEffect, useState } from 'react';

export const LAYOUT_KEYS = ['split', 'spotlight', 'editorial'];
const STORAGE_KEY = 'daana:authLayout';
const DEFAULT_LAYOUT = 'editorial';

const safeRead = () => {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return LAYOUT_KEYS.includes(v) ? v : DEFAULT_LAYOUT;
  } catch {
    return DEFAULT_LAYOUT;
  }
};

export const useAuthLayout = () => {
  const [key, setKey] = useState(safeRead);
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, key); } catch {}
  }, [key]);
  return { key, setKey };
};
