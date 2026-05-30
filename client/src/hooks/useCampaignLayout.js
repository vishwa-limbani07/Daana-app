// useCampaignLayout.js — persists active campaign-detail layout in localStorage.
// Same pattern as useAuthLayout / useDashboardLayout.

import { useEffect, useState } from 'react';

export const CAMPAIGN_LAYOUTS = ['cover', 'magazine', 'product'];
const STORAGE_KEY = 'daana:campaignLayout';
const DEFAULT = 'product';

const safeRead = () => {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return CAMPAIGN_LAYOUTS.includes(v) ? v : DEFAULT;
  } catch { return DEFAULT; }
};

export const useCampaignLayout = () => {
  const [key, setKey] = useState(safeRead);
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, key); } catch {}
  }, [key]);
  return { key, setKey };
};
