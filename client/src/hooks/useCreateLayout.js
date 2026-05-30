// useCreateLayout.js — persists active Create Campaign layout in localStorage.

import { useEffect, useState } from 'react';

export const CREATE_LAYOUTS = ['classic', 'wizard', 'preview', 'editorial'];
const STORAGE_KEY = 'daana:createLayout';
const DEFAULT = 'wizard';

const safeRead = () => {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return CREATE_LAYOUTS.includes(v) ? v : DEFAULT;
  } catch { return DEFAULT; }
};

export const useCreateLayout = () => {
  const [key, setKey] = useState(safeRead);
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, key); } catch {}
  }, [key]);
  return { key, setKey };
};
