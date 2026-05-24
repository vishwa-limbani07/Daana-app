// Home.jsx — landing page. Lists active campaigns with category + search filters.
//
// Why a local fetch instead of going through Redux?
//   For "fetch on mount, render, done" data, local useState is simpler.
//   Redux shines for state SHARED across components or pages.
//   We'd promote this to a slice if multiple pages needed the same list.

import { useEffect, useState } from 'react';
import { listCampaigns } from '../api/campaignApi.js';
import CampaignCard from '../components/campaign/CampaignCard.jsx';
import Loader from '../components/common/Loader.jsx';

const CATEGORIES = ['all', 'education', 'medical', 'community', 'tech', 'creative', 'other'];

export default function Home() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');

  // Re-fetch whenever category or search changes.
  // Debounce search so we don't fire a request on every keystroke.
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
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [category, search]);

  return (
    <section>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Fund what matters.</h1>
        <p className="text-gray-600">Discover campaigns and back the ones you love.</p>
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-lg shadow p-4 mb-6 flex flex-col md:flex-row gap-3">
        <input
          type="text"
          placeholder="Search campaigns..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2"
        >
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {loading ? (
        <Loader />
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : items.length === 0 ? (
        <p className="text-gray-500 text-center py-10">No campaigns found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((c) => <CampaignCard key={c._id} campaign={c} />)}
        </div>
      )}
    </section>
  );
}
