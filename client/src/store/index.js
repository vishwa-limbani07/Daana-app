// store/index.js — root Redux store.
// configureStore wires up the reducers and adds Redux DevTools + redux-thunk
// out of the box. No need to install/configure middleware manually.

import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice.js';
import campaignReducer from './campaignSlice.js';
import toastReducer from './toastSlice.js';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    campaigns: campaignReducer,
    toast: toastReducer,
  },
});
