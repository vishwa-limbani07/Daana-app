// Home.jsx — landing page.
//
// Sections, top to bottom:
//   1. Hero          — value prop + CTAs
//   2. Categories    — visual chips that drive the filter below
//   3. Featured      — top N campaigns (no filter applied)
//   4. All campaigns — filtered grid with search box
//   5. How it works  — 3-step explainer for first-time visitors
//
// Two fetches:
//   - featured: one-time pull of top campaigns (no filters)
//   - grid:     re-runs whenever search/category changes (debounced)
// Each has its own state so a filter change doesn't blow away the featured row.

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
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

export default function Home() {
  const user = useSelector((s) => s.auth.user);

  // --- Featured (one-time fetch, no filters)
  const [featured, setFeatured] = useState([]);
  const [featuredLoading, setFeaturedLoading] = useState(true);

  // --- Grid (re-fetches on filter change)
  const [items, setItems] = useState([]);
  const [gridLoading, setGridLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  // Featured: pull top 3 most recent campaigns.
  useEffect(() => {
    (async () => {
      try {
        const { data } = await listCampaigns({ limit: 3 });
        setFeatured(data.items);
      } catch {
        // non-fatal — page still works without featured strip
      } finally {
        setFeaturedLoading(false);
      }
    })();
  }, []);

  // Grid: debounced re-fetch when filters change.
  useEffect(() => {
    const timer = setTimeout(async () => {
      setGridLoading(true);
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
        setGridLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [category, search]);

  return (
    <div className="space-y-12">
      {/* ============= HERO ============= */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-600 text-white px-8 py-16 md:py-20 md:px-12">
        {/* Decorative blobs */}
        <div className="absolute -top-16 -right-16 w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-purple-300/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-2xl">
          <span className="inline-block bg-white/20 backdrop-blur px-3 py-1 rounded-full text-xs font-medium mb-4">
            दान · The art of giving
          </span>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight">
            Fund the ideas that matter.
          </h1>
          <p className="mt-4 text-lg text-indigo-100">
            Back projects you believe in, or launch your own campaign in minutes.
            Powered by Razorpay, secured end-to-end.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#campaigns"
              className="bg-white text-indigo-700 hover:bg-indigo-50 px-5 py-2.5 rounded-lg font-semibold transition"
            >
              Explore campaigns
            </a>
            <Link
              to={user ? '/create' : '/signup'}
              className="bg-white/10 hover:bg-white/20 backdrop-blur border border-white/30 px-5 py-2.5 rounded-lg font-semibold transition"
            >
              Start a campaign →
            </Link>
          </div>
        </div>
      </section>

      {/* ============= CATEGORY CHIPS ============= */}
      <section>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c.key}
              onClick={() => setCategory(c.key)}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition ${
                category === c.key
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-indigo-400'
              }`}
            >
              <span>{c.emoji}</span>
              <span>{c.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* ============= FEATURED ============= */}
      {featuredLoading ? null : featured.length > 0 ? (
        <section>
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="text-2xl font-bold">Featured campaigns</h2>
            <span className="text-sm text-gray-500">Fresh on Daana</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((c) => <CampaignCard key={c._id} campaign={c} />)}
          </div>
        </section>
      ) : null}

      {/* ============= GRID ============= */}
      <section id="campaigns">
        <div className="flex items-baseline justify-between mb-4 flex-wrap gap-2">
          <h2 className="text-2xl font-bold">
            {category === 'all' ? 'All campaigns' : `${CATEGORIES.find((c) => c.key === category)?.label} campaigns`}
          </h2>
          <input
            type="text"
            placeholder="Search campaigns..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-64"
          />
        </div>

        {gridLoading ? (
          <CardGridSkeleton count={6} />
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : items.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-100">
            <p className="text-gray-500">No campaigns found for these filters.</p>
            <button
              onClick={() => { setSearch(''); setCategory('all'); }}
              className="text-indigo-600 hover:underline mt-2 text-sm"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((c) => <CampaignCard key={c._id} campaign={c} />)}
          </div>
        )}
      </section>

      {/* ============= HOW IT WORKS ============= */}
      <section className="bg-white rounded-2xl border border-gray-100 p-8 md:p-12">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold">How Daana works</h2>
          <p className="text-gray-500 mt-2">Three steps from idea to funded.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Step
            number="1"
            emoji="✍️"
            title="Create your campaign"
            text="Set a goal, write your story, add a cover image. Optional reward tiers let you offer perks to backers."
          />
          <Step
            number="2"
            emoji="💸"
            title="Backers pledge"
            text="Donors pay securely via Razorpay — cards, UPI, netbanking, wallets. Receipts are emailed automatically."
          />
          <Step
            number="3"
            emoji="🚀"
            title="Watch it grow"
            text="Progress updates live as donations come in. Manage everything from your dashboard."
          />
        </div>
      </section>
    </div>
  );
}

function Step({ number, emoji, title, text }) {
  return (
    <div className="text-center md:text-left">
      <div className="flex md:block items-center gap-3 mb-3">
        <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-2xl">
          {emoji}
        </div>
        <span className="text-xs font-bold text-indigo-600">STEP {number}</span>
      </div>
      <h3 className="font-semibold text-lg mt-2">{title}</h3>
      <p className="text-sm text-gray-600 mt-1">{text}</p>
    </div>
  );
}
