// campaignSlice.js — global cache of campaigns shown on Home / browse pages.
// Optional: small projects often skip this and use page-level useState.
// Kept here as the convention so other slices have a sibling to follow.

import { createSlice } from '@reduxjs/toolkit';

const campaignSlice = createSlice({
  name: 'campaigns',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {
    setCampaigns: (state, action) => {
      state.items = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { setCampaigns, setLoading, setError } = campaignSlice.actions;
export default campaignSlice.reducer;
