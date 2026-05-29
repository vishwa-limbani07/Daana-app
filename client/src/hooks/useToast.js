// useToast.js — ergonomic wrapper over the toast slice.
// Usage:
//   const toast = useToast();
//   toast.success('Donation successful!');
//   toast.error('Payment failed');
//   toast.info('Webhook received');

import { useDispatch } from 'react-redux';
import { addToast } from '../store/toastSlice.js';

export const useToast = () => {
  const dispatch = useDispatch();
  return {
    success: (message, duration) => dispatch(addToast({ type: 'success', message, duration })),
    error:   (message, duration) => dispatch(addToast({ type: 'error', message, duration })),
    info:    (message, duration) => dispatch(addToast({ type: 'info', message, duration })),
  };
};
