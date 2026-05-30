// useAuthTheme.js — small hook that persists the picked theme in localStorage
// so it survives page refreshes and route changes.
//
// We only persist while the user is on auth pages — once they're inside the
// app the theme reverts to default. This keeps the experiment scoped while
// they decide which palette they like.

import { useEffect, useState } from 'react';
import { THEMES, DEFAULT_THEME, THEME_KEYS } from '../utils/themes.js';

const STORAGE_KEY = 'daana:authTheme';

const safeRead = () => {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return THEME_KEYS.includes(v) ? v : DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
};

export const useAuthTheme = () => {
  const [key, setKey] = useState(safeRead);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, key); } catch {}
  }, [key]);

  return { key, theme: THEMES[key], setKey, all: THEMES, keys: THEME_KEYS };
};
