// Dashboard.jsx — creator + donor view.
//
// Sections:
//   - Greeting header with avatar + quick stats inline
//   - 4 stat cards (campaigns / raised / donations / donated)
//   - Tab navigation: Overview · Campaigns · Donations
//     - Overview      → top campaigns + recent donations (at-a-glance)
//     - Campaigns     → full campaigns list with status badges + progress
//     - Donations     → full donation history with campaign thumbnails
//
// We fetch both data sets in parallel on mount and tab content is rendered
// from the same arrays — no extra round trips.

import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { listMyCampaigns } from '../api/campaignApi.js';
import { listMyDonations } from '../api/donationApi.js';
import ProgressBar from '../components/campaign/ProgressBar.jsx';
import Skeleton from '../components/common/Skeleton.jsx';
import Tabs from '../components/common/Tabs.jsx';
import StatCard from '../components/dashboard/StatCard.jsx';
import { formatCurrency } from '../utils/formatCurrency.js';
import { formatDate, daysLeft, timeAgo } from '../utils/formatDate.js';

export default function Dashboard() {
  const user = useSelector((s) => s.auth.user);
  const token = useSelector((s) => s.auth.token);

  const [campaigns, setCampaigns] = useState([]);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('overview');

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const [campRes, donRes] = await Promise.all([
          listMyCampaigns(),
          listMyDonations(),
        ]);
        setCampaigns(campRes.data.items);
        setDonations(donRes.data.items);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  if (!token) return <Navigate to="/login" replace />;
  if (loading) return <DashboardSkeleton />;
  if (error) return <p className="text-red-600">{error}</p>;

  const totalRaised = campaigns.reduce((sum, c) => sum + (c.raisedAmount || 0), 0);
  const totalDonated = donations.reduce((sum, d) => sum + (d.amount || 0), 0);
  const totalDonorCount = campaigns.reduce((sum, c) => sum + (c.donorCount || 0), 0);

  const firstName = user?.name?.split(' ')[0] || 'there';
  const initial = (user?.name || '?')[0].toUpperCase();

  return (
    <section className="space-y-8">
      {/* ============== HEADER ============== */}
      <header className="flex flex-wrap items-start gap-6 justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center text-lg font-semibold shadow-sm shadow-emerald-200">
            {initial}
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Hey, {firstName} 👋</h1>
            <p className="text-gray-500 mt-0.5">Manage your campaigns and donation history.</p>
          </div>
        </div>
        <Link
          to="/create"
          className="inline-flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-emerald-700 transition-colors shadow-sm shadow-emerald-200"
        >
          <IconPlus /> Start a campaign
        </Link>
      </header>

      {/* ============== STAT CARDS ============== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="My campaigns"
          value={campaigns.length}
          sublabel={campaigns.length === 0 ? 'No campaigns yet' : `${campaigns.filter((c) => c.status === 'active').length} active`}
          tone="slate"
          icon={<IconRocket />}
        />
        <StatCard
          label="Total raised"
          value={formatCurrency(totalRaised)}
          sublabel={`${totalDonorCount} ${totalDonorCount === 1 ? 'backer' : 'backers'} total`}
          tone="emerald"
          icon={<IconTrending />}
        />
        <StatCard
          label="My donations"
          value={donations.length}
          sublabel={donations.length === 0 ? 'Not donated yet' : 'Lifetime contributions'}
          tone="rose"
          icon={<IconHeart />}
        />
        <StatCard
          label="Total donated"
          value={formatCurrency(totalDonated)}
          sublabel="Thank you for giving."
          tone="amber"
          icon={<IconGift />}
        />
      </div>

      {/* ============== TABS ============== */}
      <Tabs
        value={tab}
        onChange={setTab}
        items={[
          { value: 'overview', label: 'Overview' },
          { value: 'campaigns', label: 'My campaigns', count: campaigns.length },
          { value: 'donations', label: 'My donations', count: donations.length },
        ]}
      />

      {/* ============== TAB PANELS ============== */}
      {tab === 'overview' && (
        <OverviewPanel campaigns={campaigns} donations={donations} onJumpTab={setTab} />
      )}
      {tab === 'campaigns' && (
        <CampaignsPanel campaigns={campaigns} />
      )}
      {tab === 'donations' && (
        <DonationsPanel donations={donations} />
      )}
    </section>
  );
}

// =============== TAB PANELS ===============

function OverviewPanel({ campaigns, donations, onJumpTab }) {
  const topCampaigns = [...campaigns]
    .sort((a, b) => (b.raisedAmount || 0) - (a.raisedAmount || 0))
    .slice(0, 3);
  const recentDonations = donations.slice(0, 5);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left: top campaigns */}
      <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-5">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-lg font-semibold">Top campaigns</h2>
          {campaigns.length > 3 && (
            <button onClick={() => onJumpTab('campaigns')} className="text-sm text-emerald-700 hover:underline">
              See all →
            </button>
          )}
        </div>

        {topCampaigns.length === 0 ? (
          <EmptyTile
            emoji="🚀"
            title="No campaigns yet"
            text="Launch your first campaign and start raising for what matters."
            ctaText="Start a campaign"
            ctaTo="/create"
          />
        ) : (
          <div className="space-y-3">
            {topCampaigns.map((c) => <CampaignRow key={c._id} campaign={c} />)}
          </div>
        )}
      </div>

      {/* Right: recent donations */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-lg font-semibold">Recent giving</h2>
          {donations.length > 5 && (
            <button onClick={() => onJumpTab('donations')} className="text-sm text-emerald-700 hover:underline">
              See all →
            </button>
          )}
        </div>

        {recentDonations.length === 0 ? (
          <EmptyTile
            emoji="💝"
            title="You haven't donated yet"
            text="Find a campaign worth backing."
            ctaText="Browse campaigns"
            ctaTo="/browse"
          />
        ) : (
          <ul className="space-y-3">
            {recentDonations.map((d) => <DonationCompactRow key={d._id} donation={d} />)}
          </ul>
        )}
      </div>
    </div>
  );
}

function CampaignsPanel({ campaigns }) {
  if (campaigns.length === 0) {
    return (
      <EmptyTile
        emoji="🚀"
        title="You haven't started a campaign yet"
        text="Launch your first campaign in minutes — add a story, set a goal, share the link."
        ctaText="Start your first campaign"
        ctaTo="/create"
        large
      />
    );
  }

  return (
    <div className="space-y-3">
      {campaigns.map((c) => <CampaignRow key={c._id} campaign={c} />)}
    </div>
  );
}

function DonationsPanel({ donations }) {
  if (donations.length === 0) {
    return (
      <EmptyTile
        emoji="💝"
        title="No donations yet"
        text="When you back a campaign, your receipts show up here."
        ctaText="Browse campaigns"
        ctaTo="/browse"
        large
      />
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-100">
      {donations.map((d) => <DonationFullRow key={d._id} donation={d} />)}
    </div>
  );
}

// =============== SHARED ROW SUBCOMPONENTS ===============

function CampaignRow({ campaign }) {
  const pct = Math.min(100, Math.round((campaign.raisedAmount / campaign.goalAmount) * 100));
  return (
    <Link
      to={`/campaigns/${campaign._id}`}
      className="block bg-white rounded-xl border border-gray-100 p-4 hover:border-emerald-300 hover:shadow-sm transition-all group"
    >
      <div className="flex items-start gap-4">
        <img
          src={campaign.coverImage}
          alt={campaign.title}
          className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-gray-900 truncate group-hover:text-emerald-700 transition-colors">
              {campaign.title}
            </h3>
            <StatusBadge status={campaign.status} />
          </div>
          <ProgressBar percent={pct} />
          <div className="flex flex-wrap justify-between text-xs text-gray-500 mt-2 gap-2">
            <span><span className="font-medium text-gray-900">{formatCurrency(campaign.raisedAmount)}</span> of {formatCurrency(campaign.goalAmount)}</span>
            <span>{campaign.donorCount} {campaign.donorCount === 1 ? 'backer' : 'backers'}</span>
            <span>{daysLeft(campaign.deadline)} days left</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function DonationCompactRow({ donation }) {
  const c = donation.campaign;
  return (
    <li>
      <Link
        to={c ? `/campaigns/${c._id}` : '#'}
        className="flex items-center gap-3 -mx-2 px-2 py-2 rounded-lg hover:bg-gray-50 transition-colors"
      >
        {c?.coverImage && (
          <img src={c.coverImage} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium truncate text-gray-900">{c?.title || '(deleted)'}</div>
          <div className="text-xs text-gray-500">{timeAgo(donation.createdAt)}</div>
        </div>
        <div className="text-sm font-semibold text-emerald-700 whitespace-nowrap">
          {formatCurrency(donation.amount)}
        </div>
      </Link>
    </li>
  );
}

function DonationFullRow({ donation }) {
  const c = donation.campaign;
  return (
    <Link to={c ? `/campaigns/${c._id}` : '#'} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors">
      {c?.coverImage && (
        <img src={c.coverImage} alt="" className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <h3 className="font-medium truncate text-gray-900">{c?.title || '(deleted campaign)'}</h3>
        <p className="text-xs text-gray-500">{formatDate(donation.createdAt)} · {timeAgo(donation.createdAt)}</p>
      </div>
      <div className="text-lg font-semibold text-emerald-700 tabular-nums">
        {formatCurrency(donation.amount)}
      </div>
    </Link>
  );
}

// =============== EMPTY STATE ===============

function EmptyTile({ emoji, title, text, ctaText, ctaTo, large = false }) {
  return (
    <div className={`text-center bg-stone-50 rounded-xl border border-dashed border-gray-200 ${large ? 'py-16 px-6' : 'py-10 px-4'}`}>
      <div className={`mx-auto ${large ? 'text-6xl' : 'text-4xl'} mb-3`}>{emoji}</div>
      <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 max-w-xs mx-auto">{text}</p>
      {ctaText && (
        <Link
          to={ctaTo}
          className="inline-block mt-5 text-sm text-emerald-700 hover:text-emerald-800 font-medium hover:underline"
        >
          {ctaText} →
        </Link>
      )}
    </div>
  );
}

// =============== STATUS BADGE ===============

const STATUS_STYLES = {
  active:    { bg: 'bg-emerald-50',  text: 'text-emerald-700', dot: 'bg-emerald-500' },
  pending:   { bg: 'bg-amber-50',    text: 'text-amber-700',   dot: 'bg-amber-500'   },
  completed: { bg: 'bg-blue-50',     text: 'text-blue-700',    dot: 'bg-blue-500'    },
  failed:    { bg: 'bg-red-50',      text: 'text-red-700',     dot: 'bg-red-500'     },
  banned:    { bg: 'bg-gray-100',    text: 'text-gray-700',    dot: 'bg-gray-500'    },
};

function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.banned;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot} ${status === 'active' ? 'animate-pulse' : ''}`} />
      {status}
    </span>
  );
}

// =============== SKELETON ===============

function DashboardSkeleton() {
  return (
    <section className="space-y-8">
      <div className="flex items-center gap-4">
        <Skeleton className="w-14 h-14 rounded-full" />
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-3 w-64" />
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
        ))}
      </div>
      <Skeleton className="h-12 w-full" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="w-20 h-20" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-2 w-full" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-3 items-center">
              <Skeleton className="w-10 h-10 rounded-lg" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-2 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// =============== INLINE ICONS ===============

function IconPlus() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19"/>
      <line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  );
}
function IconRocket() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/>
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>
    </svg>
  );
}
function IconTrending() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
      <polyline points="16 7 22 7 22 13"/>
    </svg>
  );
}
function IconHeart() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  );
}
function IconGift() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 12 20 22 4 22 4 12"/>
      <rect x="2" y="7" width="20" height="5"/>
      <line x1="12" y1="22" x2="12" y2="7"/>
      <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/>
      <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
    </svg>
  );
}
