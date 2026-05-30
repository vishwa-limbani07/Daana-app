// Signup.jsx — picks the active layout and renders the signup form inside it.

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setAuth } from '../store/authSlice.js';
import { signup } from '../api/authApi.js';
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
  title: 'Create your account',
  subtitle: 'Start backing ideas you love, or launch your own.',
  showcaseHeading: 'Join a community of backers.',
  showcaseSub: 'Sign up in 30 seconds. Discover campaigns across India and fund the ones that matter to you.',
};

export default function Signup() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
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
      const { data } = await signup(form);
      dispatch(setAuth(data));
      toast.success(`Welcome to Daana, ${data.user.name.split(' ')[0]}!`);
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.message || 'Signup failed';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout
      mode="signup"
      copy={COPY}
      formProps={{ form, onChange, onSubmit, loading, error }}
    />
  );
}
