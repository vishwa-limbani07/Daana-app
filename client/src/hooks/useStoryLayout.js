// useStoryLayout.js — persists active below-the-fold layout for Campaign Detail.

import { useEffect, useState } from 'react';

export const STORY_LAYOUTS = ['stacked', 'tabbed', 'split', 'bento'];
const STORAGE_KEY = 'daana:storyLayout';
const DEFAULT = 'bento';

const safeRead = () => {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return STORY_LAYOUTS.includes(v) ? v : DEFAULT;
  } catch { return DEFAULT; }
};

export const useStoryLayout = () => {
  const [key, setKey] = useState(safeRead);
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, key); } catch {}
  }, [key]);
  return { key, setKey };
};
