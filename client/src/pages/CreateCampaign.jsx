// CreateCampaign.jsx — owns form state + submit, renders the Wizard layout.
//
// (LayoutClassic, LayoutPreview, LayoutEditorial still live under
// components/create/layouts/ if you ever want to swap. Just change the import.)

import { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { createCampaign } from '../api/campaignApi.js';
import { useToast } from '../hooks/useToast.js';
import LayoutWizard from '../components/create/layouts/LayoutWizard.jsx';

const CATEGORIES = ['education', 'medical', 'community', 'tech', 'creative', 'other'];

const tomorrow = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
};

export default function CreateCampaign() {
  const token = useSelector((s) => s.auth.token);

  const [form, setForm] = useState({
    title: '', story: '', goalAmount: '', deadline: '', category: 'community',
  });
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  // Manage preview URL lifecycle so the browser doesn't leak the File object.
  useEffect(() => {
    if (!file) { setPreviewUrl(''); return; }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  if (!token) return <Navigate to="/login" replace />;

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) {
      setError('Image must be under 5MB');
      return;
    }
    setError('');
    setFile(f);
  };

  const onSubmit = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    setError('');

    if (!file) { setError('Please add a cover image'); return; }

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    fd.append('coverImage', file);

    setLoading(true);
    try {
      const { data } = await createCampaign(fd);
      toast.success('Campaign published! Share the link with backers.');
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
    <LayoutWizard
      form={form}
      file={file}
      previewUrl={previewUrl}
      onChange={onChange}
      onFileChange={onFileChange}
      onSubmit={onSubmit}
      loading={loading}
      error={error}
      minDeadline={tomorrow()}
      categories={CATEGORIES}
    />
  );
}
