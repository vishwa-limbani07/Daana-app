// LayoutInsights.jsx — single-page editorial dashboard.
//
// No tabs. Everything visible at once. A featured-campaign HERO card sits at the
// top (your most-funded), stats inline as a strip below it, and two side-by-side
// lists fill the canvas. Feels like a creator's "page" rather than a tool.

import { Link } from 'react-router-dom';
import ProgressBar from '../../campaign/ProgressBar.jsx';
import { Rocket, TrendingUp, Heart, Gift, ArrowUpRight, Users, Calendar } from '../../common/icons.jsx';
import { formatCurrency } from '../../../utils/formatCurrency.js';
import { daysLeft } from '../../../utils/formatDate.js';
import {
  DashboardHeader,
  CampaignRow,
  DonationCompactRow,
  EmptyTile,
} from '../shared.jsx';

export default function LayoutInsights({ user, campaigns, donations }) {
  const totalRaised = campaigns.reduce((s, c) => s + (c.raisedAmount || 0), 0);
  const totalDonated = donations.reduce((s, d) => s + (d.amount || 0), 0);
  const totalBackers = campaigns.reduce((s, c) => s + (c.donorCount || 0), 0);

  const featured = [...campaigns].sort((a, b) => (b.raisedAmount || 0) - (a.raisedAmount || 0))[0];
  const otherCampaigns = featured ? campaigns.filter((c) => c._id !== featured._id) : campaigns;

  return (
    <section className="space-y-8">
      <DashboardHeader name={user?.name} />

      {/* Featured campaign hero — only if user has at least one */}
      {featured ? <FeaturedCard campaign={featured} /> : (
        <EmptyTile
          preset="campaigns"
          large
          title="No campaigns yet"
          text="Launch your first campaign to start raising. It takes about 60 seconds."
          ctaText="Start a campaign"
          ctaTo="/create"
        />
      )}

      {/* Stats strip — compact horizontal */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MiniStat icon={Rocket}      tone="slate"   label="Campaigns" value={campaigns.length} />
        <MiniStat icon={TrendingUp}  tone="emerald" label="Raised"    value={formatCurrency(totalRaised)} />
        <MiniStat icon={Heart}       tone="rose"    label="Donations" value={donations.length} />
        <MiniStat icon={Gift}        tone="amber"   label="Donated"   value={formatCurrency(totalDonated)} />
      </div>

      {/* Two columns — campaigns left, donations right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Panel title={featured ? 'More campaigns' : 'My campaigns'} count={otherCampaigns.length} link={otherCampaigns.length > 4 ? '/dashboard' : null}>
          {otherCampaigns.length === 0 ? (
            featured ? <p className="text-sm text-gray-500">This is your only campaign so far.</p>
                     : <EmptyTile preset="campaigns" title="No campaigns yet" text="Launch your first." ctaText="Start a campaign" ctaTo="/create" />
          ) : (
            <div className="space-y-3">
              {otherCampaigns.slice(0, 4).map((c) => <CampaignRow key={c._id} campaign={c} />)}
            </div>
          )}
        </Panel>

        <Panel title="Recent giving" count={donations.length}>
          {donations.length === 0 ? (
            <EmptyTile preset="donations" title="You haven't donated yet" text="Find a campaign worth backing." ctaText="Browse campaigns" ctaTo="/browse" />
          ) : (
            <ul className="space-y-3">
              {donations.slice(0, 6).map((d) => <DonationCompactRow key={d._id} donation={d} />)}
            </ul>
          )}
        </Panel>
      </div>

      <p className="text-xs text-center text-gray-400 pt-2">
        {totalBackers} backer{totalBackers === 1 ? '' : 's'} have supported your work · ₹{totalDonated.toLocaleString('en-IN')} given by you
      </p>
    </section>
  );
}

// ─── Featured campaign hero card ───

function FeaturedCard({ campaign }) {
  const pct = Math.min(100, Math.round((campaign.raisedAmount / campaign.goalAmount) * 100));
  return (
    <Link
      to={`/campaigns/${campaign._id}`}
      className="block relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-emerald-900 to-teal-800 text-white p-6 md:p-8 group hover:shadow-xl transition-shadow"
    >
      <div className="absolute inset-0 opacity-30">
        <img src={campaign.coverImage} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent" />
      </div>

      <div className="relative grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.3em] text-emerald-300 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Your top campaign
          </div>
          <h2 className="font-serif text-3xl md:text-4xl tracking-tight leading-tight">{campaign.title}</h2>

          <div className="mt-6 grid grid-cols-3 gap-4 max-w-md">
            <div>
              <div className="text-xl md:text-2xl font-bold tabular-nums">{formatCurrency(campaign.raisedAmount)}</div>
              <div className="text-xs text-emerald-200/80">raised</div>
            </div>
            <div>
              <div className="text-xl md:text-2xl font-bold tabular-nums">{campaign.donorCount}</div>
              <div className="text-xs text-emerald-200/80">backers</div>
            </div>
            <div>
              <div className="text-xl md:text-2xl font-bold tabular-nums">{daysLeft(campaign.deadline)}d</div>
              <div className="text-xs text-emerald-200/80">left</div>
            </div>
          </div>
        </div>

        <div className="md:pl-6">
          <div className="bg-white/10 backdrop-blur border border-white/15 rounded-2xl p-5">
            <div className="flex justify-between text-sm">
              <span className="text-emerald-200/80">Progress to goal</span>
              <span className="font-semibold">{pct}%</span>
            </div>
            <ProgressBar percent={pct} />
            <div className="mt-3 text-xs text-emerald-200/80">
              Goal: {formatCurrency(campaign.goalAmount)}
            </div>
            <div className="mt-4 inline-flex items-center gap-1.5 text-sm text-white group-hover:text-emerald-200 transition-colors">
              Manage campaign <ArrowUpRight size={14} />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ─── Mini horizontal stat ───

function MiniStat({ icon: Icon, tone, label, value }) {
  const tones = {
    emerald: 'text-emerald-700 bg-emerald-50',
    amber:   'text-amber-700 bg-amber-50',
    rose:    'text-rose-700 bg-rose-50',
    slate:   'text-slate-700 bg-slate-100',
  };
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
      <div className={`w-9 h-9 rounded-lg ${tones[tone]} flex items-center justify-center`}>
        <Icon size={16} />
      </div>
      <div className="min-w-0">
        <div className="text-xs uppercase tracking-widest text-gray-500">{label}</div>
        <div className="text-lg font-bold tabular-nums truncate">{value}</div>
      </div>
    </div>
  );
}

function Panel({ title, count, link, children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <div className="flex items-baseline justify-between mb-4">
        <h2 className="text-lg font-semibold">
          {title} {count !== undefined && <span className="text-sm text-gray-400 font-normal ml-1">({count})</span>}
        </h2>
        {link && <Link to={link} className="text-sm text-emerald-700 hover:underline">See all →</Link>}
      </div>
      {children}
    </div>
  );
}
