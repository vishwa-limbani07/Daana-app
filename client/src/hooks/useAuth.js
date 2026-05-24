// useAuth.js — convenience wrapper over the Redux auth slice.
// Components can either use this hook OR call useSelector / useDispatch
// directly. The hook just bundles the common operations.

import { useSelector, useDispatch } from 'react-redux';
import { setAuth as setAuthAction, logout as logoutAction } from '../store/authSlice.js';

export const useAuth = () => {
  // useSelector(stateSelector) — re-renders the component when the selected
  // slice of state changes. Keep selectors narrow for performance.
  const user = useSelector((state) => state.auth.user);
  const token = useSelector((state) => state.auth.token);

  // useDispatch() — gives us the store's dispatch function so we can fire actions.
  const dispatch = useDispatch();

  return {
    user,
    isAuthenticated: Boolean(token),
    setAuth: (payload) => dispatch(setAuthAction(payload)),
    logout: () => dispatch(logoutAction()),
  };
};
