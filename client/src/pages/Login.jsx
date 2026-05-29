// Login.jsx — email + password -> authApi.login -> dispatch setAuth -> redirect.
// Mirrors Signup.jsx; kept separate so the two flows can diverge later
// (e.g. add "forgot password" link, social login buttons, etc.).

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setAuth } from '../store/authSlice.js';
import { login } from '../api/authApi.js';
import { useToast } from '../hooks/useToast.js';
import Button from '../components/common/Button.jsx';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
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
    <div className="max-w-md mx-auto bg-white rounded-lg shadow p-6 mt-8">
      <h1 className="text-2xl font-bold mb-6">Log in</h1>

      <form onSubmit={onSubmit} className="space-y-4">
        <label className="block">
          <span className="text-sm font-medium text-gray-700">Email</span>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={onChange}
            required
            className="mt-1 w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-gray-700">Password</span>
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={onChange}
            required
            className="mt-1 w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </label>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Logging in...' : 'Log in'}
        </Button>
      </form>

      <p className="text-sm text-gray-600 mt-4 text-center">
        New here? <Link to="/signup" className="text-indigo-600 hover:underline">Create an account</Link>
      </p>
    </div>
  );
}
