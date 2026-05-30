// Browse.jsx — discovery page.
//
// Layout intent:
//   - Editorial header (serif), confident not chatty
//   - Trending highlight card up top when conditions are right
//   - STICKY filter bar so users can refine without scrolling back up
//   - Active filter chips so users can see + clear what's applied
//   - Result-count helper so they know how many matched
//   - Sort dropdown (client-side — quick win without an API change)
//   - Illustrated empty state with reset CTA

import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { listCampaigns } from '../api/campaignApi.js';
import CampaignCard from '../components/campaign/CampaignCard.jsx';
import ProgressBar from '../components/campaign/ProgressBar.jsx';
import { CardGridSkeleton } from '../components/common/Skeleton.jsx';
import {
  Globe, BookOpen, Stethoscope, Users, Code, Palette, Sparkles,
  Search, SortAsc, ArrowUpRight, X,
} from '../components/common/icons.jsx';
import { formatCurrency } from '../utils/formatCurrency.js';
import { daysLeft } from '../utils/formatDate.js';

const CATEGORIES = [
  { key: 'all',       label: 'All',       icon: Globe },
  { key: 'education', label: 'Education', icon: BookOpen },
  { key: 'medical',   label: 'Medical',   icon: Stethoscope },
  { key: 'community', label: 'Community', icon: Users },
  { key: 'tech',      label: 'Tech',      icon: Code },
  { key: 'creative',  label: 'Creative',  icon: Palette },
  { key: 'other',     label: 'Other',     icon: Sparkles },
];

const SORTS = [
  { key: 'newest',   label: 'Newest',         compare: (a, b) => new Date(b.createdAt) - new Date(a.createdAt) },
  { key: 'funded',   label: 'Most funded',    compare: (a, b) => (b.raisedAmount || 0) - (a.raisedAmount || 0) },
  { key: 'backers',  label: 'Most backers',   compare: (a, b) => (b.donorCount || 0) - (a.donorCount || 0) },
  { key: 'ending',   label: 'Ending soon',    compare: (a, b) => new Date(a.deadline) - new Date(b.deadline) },
];

export default function Browse() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');

  // Debounced fetch when category/search changes
  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const params = { limit: 50 };
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

  // Client-side sort — no API change needed
  const sortedItems = useMemo(() => {
    const fn = SORTS.find((s) => s.key === sort)?.compare;
    return fn ? [...items].sort(fn) : items;
  }, [items, sort]);

  // Trending card only when not filtering (else it's confusing)
  const showTrending = !search.trim() && category === 'all' && items.length >= 3;
  const trending = showTrending
    ? [...items].sort((a, b) => (b.raisedAmount || 0) - (a.raisedAmount || 0))[0]
    : null;
  const gridItems = trending ? sortedItems.filter((c) => c._id !== trending._id) : sortedItems;

  const activeCategory = CATEGORIES.find((c) => c.key === category);
  const hasFilters = category !== 'all' || search.trim();
  const clearAll = () => { setCategory('all'); setSearch(''); };

  return (
    <div className="space-y-8">
      {/* ─── HEADER ─── */}
      <header>
        <h1 className="font-serif text-4xl md:text-5xl text-gray-900 tracking-tight">Discover campaigns.</h1>
        <p className="text-gray-500 mt-2 max-w-2xl">
          Browse projects across India worth backing. Filter by what you care about, sort by what matters to you.
        </p>
      </header>

      {/* ─── TRENDING (conditional) ─── */}
      {trending && <TrendingCard campaign={trending} />}

      {/* ─── STICKY FILTER BAR ─── */}
      <div className="sticky top-16 z-30 -mx-4 px-4 py-3 bg-stone-50/90 backdrop-blur border-b border-gray-200">
        <div className="space-y-3">
          {/* Category chips */}
          <div className="flex gap-2 overflow-x-auto pb-1 -mb-1">
            {CATEGORIES.map((c) => {
              const Icon = c.icon;
              const active = c.key === category;
              return (
                <button
                  key={c.key}
                  onClick={() => setCategory(c.key)}
                  className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-sm font-medium whitespace-nowrap border transition-colors
                    ${active
                      ? 'bg-gray-900 text-white border-gray-900'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-emerald-400 hover:text-emerald-700'}`}
                >
                  <Icon size={14} />
                  {c.label}
                </button>
              );
            })}
          </div>

          {/* Sort + Search */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Search size={16} />
              </span>
              <input
                type="text"
                placeholder="Search campaigns..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-white
                  focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 p-1"
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                <SortAsc size={14} />
              </span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="pl-9 pr-8 py-2 text-sm border border-gray-200 rounded-lg bg-white
                  focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent
                  appearance-none cursor-pointer"
              >
                {SORTS.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
              </select>
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xs">▾</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── ACTIVE FILTER CHIPS + RESULT COUNT ─── */}
      <div className="flex flex-wrap items-center gap-3 -mt-2">
        <span className="text-sm text-gray-600">
          {loading ? 'Loading…' : (
            <>
              <span className="font-semibold text-gray-900">{gridItems.length}</span>{' '}
              {gridItems.length === 1 ? 'campaign' : 'campaigns'}
              {hasFilters && ' match your filters'}
            </>
          )}
        </span>

        {hasFilters && (
          <>
            {category !== 'all' && (
              <ActiveChip
                label={activeCategory?.label}
                onClear={() => setCategory('all')}
              />
            )}
            {search.trim() && (
              <ActiveChip
                label={`"${search.trim()}"`}
                onClear={() => setSearch('')}
              />
            )}
            <button
              onClick={clearAll}
              className="text-sm text-gray-500 hover:text-emerald-700 underline-offset-2 hover:underline"
            >
              Clear all
            </button>
          </>
        )}
      </div>

      {/* ─── RESULTS ─── */}
      {loading ? (
        <CardGridSkeleton count={6} />
      ) : error ? (
        <ErrorTile error={error} />
      ) : gridItems.length === 0 ? (
        <EmptyState onReset={clearAll} hasFilters={hasFilters} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {gridItems.map((c) => <CampaignCard key={c._id} campaign={c} />)}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────── TRENDING CARD ───────────────────────────

function TrendingCard({ campaign }) {
  const pct = Math.min(100, Math.round((campaign.raisedAmount / campaign.goalAmount) * 100));
  return (
    <Link
      to={`/campaigns/${campaign._id}`}
      className="group block relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-700 via-teal-800 to-slate-900 text-white"
    >
      <div className="absolute inset-0 opacity-30">
        <img src={campaign.coverImage} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/70 to-transparent" />
      </div>

      <div className="relative grid grid-cols-1 md:grid-cols-2 gap-6 p-6 md:p-8 items-center">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.3em] text-emerald-300 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Trending now
          </div>
          <h2 className="font-serif text-2xl md:text-3xl tracking-tight leading-tight">{campaign.title}</h2>
          <p className="text-sm text-emerald-100/80 mt-3 line-clamp-2 max-w-md">{campaign.story}</p>

          <div className="mt-5 flex flex-wrap items-center gap-5 text-sm">
            <Stat value={formatCurrency(campaign.raisedAmount)} label="raised" />
            <Stat value={campaign.donorCount} label={campaign.donorCount === 1 ? 'backer' : 'backers'} />
            <Stat value={`${daysLeft(campaign.deadline)}d`} label="left" />
          </div>
        </div>

        <div className="md:pl-6">
          <div className="bg-white/10 backdrop-blur border border-white/15 rounded-2xl p-5">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-emerald-100/80">Progress</span>
              <span className="font-semibold">{pct}%</span>
            </div>
            <ProgressBar percent={pct} />
            <div className="mt-3 text-xs text-emerald-100/80">
              Goal: {formatCurrency(campaign.goalAmount)}
            </div>
            <div className="mt-4 inline-flex items-center gap-1.5 text-sm group-hover:text-emerald-200 transition-colors">
              View campaign <ArrowUpRight size={14} />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

function Stat({ value, label }) {
  return (
    <div>
      <div className="text-xl md:text-2xl font-bold tabular-nums">{value}</div>
      <div className="text-xs text-emerald-100/80">{label}</div>
    </div>
  );
}

// ─────────────────────────── ACTIVE CHIP ───────────────────────────

function ActiveChip({ label, onClear }) {
  return (
    <span className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-200 text-emerald-700 px-2.5 py-1 rounded-full text-xs">
      {label}
      <button onClick={onClear} className="hover:text-emerald-900" aria-label="Remove filter">
        <X size={12} />
      </button>
    </span>
  );
}

// ─────────────────────────── EMPTY + ERROR ───────────────────────────

function EmptyState({ onReset, hasFilters }) {
  return (
    <div className="text-center bg-stone-50 rounded-2xl border border-dashed border-gray-200 py-16 px-6">
      <div className="mx-auto w-14 h-14 rounded-2xl bg-gray-100 text-gray-500 flex items-center justify-center mb-4">
        <Search size={26} />
      </div>
      <h3 className="font-semibold text-gray-900 mb-1">No campaigns match these filters</h3>
      <p className="text-sm text-gray-500 max-w-sm mx-auto">
        {hasFilters
          ? 'Try a different category or clear the search to see everything.'
          : 'No campaigns exist yet. Once campaigns are created, they\'ll appear here.'}
      </p>
      {hasFilters && (
        <button
          onClick={onReset}
          className="inline-flex items-center gap-1.5 mt-5 text-sm font-medium text-emerald-700 hover:text-emerald-800 hover:underline"
        >
          <X size={14} /> Clear filters
        </button>
      )}
    </div>
  );
}

function ErrorTile({ error }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
      {error}
    </div>
  );
}
