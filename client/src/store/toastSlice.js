// toastSlice.js — global toast queue.
//
// Toasts are stateless from the caller's perspective: dispatch addToast,
// the slice generates an id, the ToastContainer renders the list, and a
// setTimeout in the container auto-dispatches removeToast(id) after `duration`.
//
// Why Redux for toasts (instead of context or a singleton):
//   - The store is already wired up.
//   - Any component anywhere can fire a toast without prop drilling.
//   - DevTools show every toast as a discrete action — easy to debug.

import { createSlice } from '@reduxjs/toolkit';

const toastSlice = createSlice({
  name: 'toast',
  initialState: { items: [] },
  reducers: {
    addToast: {
      // `prepare` lets us auto-generate the id so callers don't have to.
      reducer(state, action) {
        state.items.push(action.payload);
      },
      prepare({ type = 'info', message, duration = 4000 }) {
        return {
          payload: {
            id: crypto.randomUUID(),
            type,
            message,
            duration,
          },
        };
      },
    },
    removeToast(state, action) {
      state.items = state.items.filter((t) => t.id !== action.payload);
    },
  },
});

export const { addToast, removeToast } = toastSlice.actions;
export default toastSlice.reducer;
