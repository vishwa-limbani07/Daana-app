// authApi.js — all auth endpoint calls live here.
// Components import { login } from this file — they never touch axios directly.

import axiosClient from './axiosClient.js';

export const signup = (data) => axiosClient.post('/auth/signup', data);
export const login = (data) => axiosClient.post('/auth/login', data);
export const me = () => axiosClient.get('/auth/me');
