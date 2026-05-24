// authSlice.js — Redux Toolkit slice for auth state.
//
// A "slice" bundles three things that vanilla Redux makes you write separately:
//   - initialState
//   - reducers   (look like simple mutations — Immer makes them immutable for you)
//   - action creators (auto-generated from each reducer name)
//
// Why RTK > vanilla Redux:
//   No action type constants, no switch statements, no separate action creators.
//   You write one function per action and RTK generates the rest.

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  token: localStorage.getItem('token'), // hydrate from storage on app load
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Looks mutative, but RTK uses Immer under the hood so it's safe.
    setAuth: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      if (token) localStorage.setItem('token', token);
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem('token');
    },
  },
});

export const { setAuth, logout } = authSlice.actions;
export default authSlice.reducer;
