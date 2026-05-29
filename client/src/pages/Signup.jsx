// Signup.jsx — controlled form -> authApi.signup -> store user+token in Redux -> redirect.
//
// "Controlled form" means React state (via useState) is the source of truth
// for the input values, not the DOM. Every keystroke updates state, and the
// input's `value` is bound back to state.

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setAuth } from '../store/authSlice.js';
import { signup } from '../api/authApi.js';
import { useToast } from '../hooks/useToast.js';
import Button from '../components/common/Button.jsx';

export default function Signup() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await signup(form);
      dispatch(setAuth(data));   // stores user + token, persists token to localStorage
      toast.success(`Welcome to CrowdFund, ${data.user.name.split(' ')[0]}!`);
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
    <div className="max-w-md mx-auto bg-white rounded-lg shadow p-6 mt-8">
      <h1 className="text-2xl font-bold mb-6">Create your account</h1>

      <form onSubmit={onSubmit} className="space-y-4">
        <Field label="Name" name="name" value={form.name} onChange={onChange} />
        <Field label="Email" name="email" type="email" value={form.email} onChange={onChange} />
        <Field label="Password" name="password" type="password" value={form.password} onChange={onChange} hint="At least 8 characters" />

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Creating account...' : 'Sign up'}
        </Button>
      </form>

      <p className="text-sm text-gray-600 mt-4 text-center">
        Already have an account? <Link to="/login" className="text-indigo-600 hover:underline">Log in</Link>
      </p>
    </div>
  );
}

// Tiny inline field component — saves repeating the same JSX for each input.
function Field({ label, hint, ...props }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <input
        {...props}
        required
        className="mt-1 w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      {hint && <span className="text-xs text-gray-500">{hint}</span>}
    </label>
  );
}
