// CreateCampaign.jsx — multipart form for new campaigns.
//
// Key concepts in this file:
//
// 1. Mixed inputs (text + file): we build a FormData object on submit
//    instead of using JSON. FormData is the only way to send binary files
//    in an HTTP request from JS.
//
// 2. File input cannot be "controlled" the normal way — its value is
//    read-only for security. We track the selected File object in state
//    separately from the rest of the form.
//
// 3. Image preview: URL.createObjectURL(file) creates a local blob URL
//    we can use as <img src=...>. We revoke it on cleanup to avoid memory
//    leaks (browsers hold the file in memory until you revoke).

import { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { createCampaign } from '../api/campaignApi.js';
import { useToast } from '../hooks/useToast.js';
import Button from '../components/common/Button.jsx';

const CATEGORIES = ['education', 'medical', 'community', 'tech', 'creative', 'other'];

// Min date for the deadline picker = tomorrow in YYYY-MM-DD form.
const tomorrow = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
};

export default function CreateCampaign() {
  const token = useSelector((s) => s.auth.token);

  const [form, setForm] = useState({
    title: '',
    story: '',
    goalAmount: '',
    deadline: '',
    category: 'community',
  });
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  // Generate a preview URL whenever the file changes. Clean it up on unmount
  // or when the file changes again — otherwise the browser leaks memory.
  useEffect(() => {
    if (!file) {
      setPreviewUrl('');
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // Redirect unauthenticated users to login.
  if (!token) return <Navigate to="/login" replace />;

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) {
      setError('image must be under 5MB');
      return;
    }
    setError('');
    setFile(f);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!file) {
      setError('please pick a cover image');
      return;
    }

    // Build the multipart body. The field name 'coverImage' MUST match
    // the .single('coverImage') call in server/middleware/upload.js.
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    fd.append('coverImage', file);

    setLoading(true);
    try {
      const { data } = await createCampaign(fd);
      toast.success('Campaign published — share the link with backers!');
      navigate(`/campaigns/${data.campaign._id}`);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create campaign';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6 mt-4">
      <h1 className="text-2xl font-bold mb-6">Start a campaign</h1>

      <form onSubmit={onSubmit} className="space-y-4">
        <label className="block">
          <span className="text-sm font-medium text-gray-700">Title</span>
          <input
            name="title" value={form.title} onChange={onChange} required maxLength={120}
            className="mt-1 w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-gray-700">Your story</span>
          <textarea
            name="story" value={form.story} onChange={onChange} required rows={6}
            className="mt-1 w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </label>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Goal (₹)</span>
            <input
              name="goalAmount" type="number" min={1} value={form.goalAmount} onChange={onChange} required
              className="mt-1 w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-gray-700">Deadline</span>
            <input
              name="deadline" type="date" min={tomorrow()} value={form.deadline} onChange={onChange} required
              className="mt-1 w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-gray-700">Category</span>
            <select
              name="category" value={form.category} onChange={onChange}
              className="mt-1 w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
        </div>

        <label className="block">
          <span className="text-sm font-medium text-gray-700">Cover image (max 5MB)</span>
          <input
            type="file" accept="image/*" onChange={onFileChange}
            className="mt-1 block w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded file:border-0 file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
          />
        </label>

        {previewUrl && (
          <img src={previewUrl} alt="preview" className="w-full max-h-64 object-cover rounded border" />
        )}

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Uploading...' : 'Publish campaign'}
        </Button>
      </form>
    </div>
  );
}
