// Login.jsx — picks the active layout based on user's choice and renders the
// login form inside it. All form state stays here so layouts are pure presentation.

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setAuth } from '../store/authSlice.js';
import { login } from '../api/authApi.js';
import { useToast } from '../hooks/useToast.js';
import { useAuthLayout } from '../hooks/useAuthLayout.js';

import LayoutSplit from '../components/auth/layouts/LayoutSplit.jsx';
import LayoutSpotlight from '../components/auth/layouts/LayoutSpotlight.jsx';
import LayoutEditorial from '../components/auth/layouts/LayoutEditorial.jsx';

const LAYOUTS = {
  split: LayoutSplit,
  spotlight: LayoutSpotlight,
  editorial: LayoutEditorial,
};

const COPY = {
  title: 'Welcome back',
  subtitle: 'Log in to back campaigns and manage your own.',
  showcaseHeading: 'Fund the ideas that matter.',
  showcaseSub: 'A modern crowdfunding platform built on the MERN stack with Razorpay payments and real-time updates.',
};

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();
  const { key } = useAuthLayout();
  const Layout = LAYOUTS[key];

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await login(form);
      dispatch(setAuth(data));
      toast.success(`Welcome back, ${data.user.name.split(' ')[0]}!`);
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout
      mode="login"
      copy={COPY}
      formProps={{ form, onChange, onSubmit, loading, error }}
    />
  );
}
