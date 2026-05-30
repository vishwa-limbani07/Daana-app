// LayoutCommand.jsx — power-user sidebar dashboard.
//
// Vertical nav on the left (collapses on mobile to a top horizontal scroll).
// Main content fills the rest. Each nav item gets its own canvas with its
// own header. Feels like GitHub / Linear / Notion's internal admin pages.

import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus, LayoutDashboard, Megaphone, Heart, Settings,
  Rocket, TrendingUp, Gift, Users, Calendar, ArrowUpRight,
} from '../../common/icons.jsx';
import { formatCurrency } from '../../../utils/formatCurrency.js';
import {
  StatCard,
  CampaignRow,
  DonationCompactRow,
  DonationFullRow,
  EmptyTile,
} from '../shared.jsx';

const NAV_ITEMS = [
  { key: 'overview',  label: 'Overview',     icon: LayoutDashboard },
  { key: 'campaigns', label: 'My campaigns', icon: Megaphone },
  { key: 'donations', label: 'My donations', icon: Heart },
  { key: 'settings',  label: 'Settings',     icon: Settings, disabled: true },
];

export default function LayoutCommand({ user, campaigns, donations }) {
  const [view, setView] = useState('overview');

  const initial = (user?.name || '?')[0].toUpperCase();
  const firstName = user?.name?.split(' ')[0] || 'there';

  return (
    <section className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6 lg:gap-8">
      {/* ─── SIDEBAR ─── */}
      <aside className="lg:sticky lg:top-24 h-fit space-y-4">
        {/* User card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center text-sm font-semibold shadow-sm shadow-emerald-200">
            {initial}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold truncate">{firstName}</div>
            <div className="text-xs text-gray-500 truncate">{user?.email}</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="bg-white rounded-2xl border border-gray-100 p-2 flex lg:flex-col gap-1 overflow-x-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = view === item.key;
            const disabled = item.disabled;
            return (
              <button
                key={item.key}
                onClick={() => !disabled && setView(item.key)}
                disabled={disabled}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors w-full whitespace-nowrap text-left
                  ${active ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}
                  ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
              >
                <Icon size={16} />
                <span className="flex-1">{item.label}</span>
                {disabled && <span className="text-[10px] uppercase tracking-widest text-gray-400">Soon</span>}
              </button>
            );
          })}
        </nav>

        {/* CTA */}
        <Link
          to="/create"
          className="hidden lg:flex items-center justify-center gap-2 w-full bg-gray-900 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          <Plus size={16} /> Start a campaign
        </Link>
      </aside>

      {/* ─── CANVAS ─── */}
      <main className="min-w-0 space-y-6">
        {view === 'overview'  && <OverviewView user={user} campaigns={campaigns} donations={donations} onJump={setView} />}
        {view === 'campaigns' && <CampaignsView campaigns={campaigns} />}
        {view === 'donations' && <DonationsView donations={donations} />}
      </main>
    </section>
  );
}

// ─── VIEWS ─────────────────────────────────────

function OverviewView({ user, campaigns, donations, onJump }) {
  const totalRaised = campaigns.reduce((s, c) => s + (c.raisedAmount || 0), 0);
  const totalDonated = donations.reduce((s, d) => s + (d.amount || 0), 0);
  const totalBackers = campaigns.reduce((s, c) => s + (c.donorCount || 0), 0);
  const topCampaigns = [...campaigns].sort((a, b) => (b.raisedAmount || 0) - (a.raisedAmount || 0)).slice(0, 3);
  const recentDonations = donations.slice(0, 5);
  const firstName = user?.name?.split(' ')[0] || 'there';

  return (
    <>
      <ViewHeader title={`Welcome back, ${firstName}.`} sub="Here's what's happening across your campaigns and giving." />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Campaigns"  value={campaigns.length}      sublabel={`${campaigns.filter((c) => c.status === 'active').length} active`} tone="slate"   icon={Rocket} />
        <StatCard label="Raised"     value={formatCurrency(totalRaised)} sublabel={`${totalBackers} backers`} tone="emerald" icon={TrendingUp} />
        <StatCard label="Donations"  value={donations.length}      sublabel="Lifetime" tone="rose"    icon={Heart} />
        <StatCard label="Donated"    value={formatCurrency(totalDonated)} sublabel="Thank you." tone="amber"   icon={Gift} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Panel className="lg:col-span-2" title="Top campaigns" onSeeAll={campaigns.length > 3 ? () => onJump('campaigns') : null}>
          {topCampaigns.length === 0 ? (
            <EmptyTile preset="campaigns" title="No campaigns yet" text="Launch your first." ctaText="Start a campaign" ctaTo="/create" />
          ) : (
            <div className="space-y-3">{topCampaigns.map((c) => <CampaignRow key={c._id} campaign={c} />)}</div>
          )}
        </Panel>
        <Panel title="Recent giving" onSeeAll={donations.length > 5 ? () => onJump('donations') : null}>
          {recentDonations.length === 0 ? (
            <EmptyTile preset="donations" title="Nothing here yet" text="Back a campaign." ctaText="Browse" ctaTo="/browse" />
          ) : (
            <ul className="space-y-3">{recentDonations.map((d) => <DonationCompactRow key={d._id} donation={d} />)}</ul>
          )}
        </Panel>
      </div>
    </>
  );
}

function CampaignsView({ campaigns }) {
  return (
    <>
      <ViewHeader
        title="My campaigns"
        sub={`${campaigns.length} campaign${campaigns.length === 1 ? '' : 's'} total`}
        cta={{ label: 'New campaign', to: '/create' }}
      />
      {campaigns.length === 0 ? (
        <EmptyTile preset="campaigns" large title="You haven't started a campaign yet" text="Launch your first campaign in minutes." ctaText="Start a campaign" ctaTo="/create" />
      ) : (
        <div className="space-y-3">{campaigns.map((c) => <CampaignRow key={c._id} campaign={c} />)}</div>
      )}
    </>
  );
}

function DonationsView({ donations }) {
  return (
    <>
      <ViewHeader title="My donations" sub={`${donations.length} donation${donations.length === 1 ? '' : 's'} total`} />
      {donations.length === 0 ? (
        <EmptyTile preset="donations" large title="No donations yet" text="When you back a campaign, your receipts show up here." ctaText="Browse campaigns" ctaTo="/browse" />
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-100">{donations.map((d) => <DonationFullRow key={d._id} donation={d} />)}</div>
      )}
    </>
  );
}

// ─── small subcomponents ───

function ViewHeader({ title, sub, cta }) {
  return (
    <header className="flex items-start justify-between flex-wrap gap-3">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{title}</h1>
        {sub && <p className="text-gray-500 mt-1">{sub}</p>}
      </div>
      {cta && (
        <Link to={cta.to} className="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors">
          <Plus size={16} /> {cta.label}
        </Link>
      )}
    </header>
  );
}

function Panel({ className = '', title, onSeeAll, children }) {
  return (
    <div className={`bg-white rounded-2xl border border-gray-100 p-5 ${className}`}>
      <div className="flex items-baseline justify-between mb-4">
        <h2 className="text-lg font-semibold">{title}</h2>
        {onSeeAll && (
          <button onClick={onSeeAll} className="inline-flex items-center gap-1 text-sm text-emerald-700 hover:underline">
            See all <ArrowUpRight size={12} />
          </button>
        )}
      </div>
      {children}
    </div>
  );
}
