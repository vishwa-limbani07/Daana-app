// Browse.jsx — the in-app campaign discovery page (formerly Home).
//
// Renders inside the App's max-w-6xl wrapper, so it stays compact and
// content-focused. The marketing copy lives on /Landing now.

import { useEffect, useState } from 'react';
import { listCampaigns } from '../api/campaignApi.js';
import CampaignCard from '../components/campaign/CampaignCard.jsx';
import { CardGridSkeleton } from '../components/common/Skeleton.jsx';

const CATEGORIES = [
  { key: 'all',       label: 'All',       emoji: '🌐' },
  { key: 'education', label: 'Education', emoji: '📚' },
  { key: 'medical',   label: 'Medical',   emoji: '🏥' },
  { key: 'community', label: 'Community', emoji: '🏘️' },
  { key: 'tech',      label: 'Tech',      emoji: '💻' },
  { key: 'creative',  label: 'Creative',  emoji: '🎨' },
  { key: 'other',     label: 'Other',     emoji: '✨' },
];

export default function Browse() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const params = {};
        if (category !== 'all') params.category = category;
        if (search.trim()) params.search = search.trim();
        const { data } = await listCampaigns(params);
        setItems(data.items);
        setError('');
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load campaigns');
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [category, search]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Browse campaigns</h1>
        <p className="text-gray-600 mt-1">Discover projects across India worth backing.</p>
      </div>

      {/* Category chips */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c.key}
            onClick={() => setCategory(c.key)}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition ${
              category === c.key
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
                : 'bg-white text-gray-700 border border-gray-200 hover:border-emerald-400'
            }`}
          >
            <span>{c.emoji}</span>
            <span>{c.label}</span>
          </button>
        ))}
      </div>

      {/* Search bar */}
      <div className="flex items-baseline justify-between flex-wrap gap-2">
        <h2 className="text-xl font-semibold">
          {category === 'all' ? 'All campaigns' : `${CATEGORIES.find((c) => c.key === category)?.label} campaigns`}
        </h2>
        <input
          type="text"
          placeholder="Search campaigns..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full sm:w-64"
        />
      </div>

      {loading ? (
        <CardGridSkeleton count={6} />
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : items.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-100">
          <p className="text-gray-500">No campaigns found for these filters.</p>
          <button
            onClick={() => { setSearch(''); setCategory('all'); }}
            className="text-emerald-700 hover:underline mt-2 text-sm"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((c) => <CampaignCard key={c._id} campaign={c} />)}
        </div>
      )}
    </div>
  );
}
