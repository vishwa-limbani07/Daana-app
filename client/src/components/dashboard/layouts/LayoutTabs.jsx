// LayoutTabs.jsx — sectioned panels behind tab navigation.
// The "productivity" pattern. Each section gets its own canvas.

import { useState } from 'react';
import Tabs from '../../common/Tabs.jsx';
import { Rocket, TrendingUp, Heart, Gift } from '../../common/icons.jsx';
import {
  DashboardHeader,
  StatCard,
  CampaignRow,
  DonationCompactRow,
  DonationFullRow,
  EmptyTile,
} from '../shared.jsx';

export default function LayoutTabs({ user, campaigns, donations }) {
  const [tab, setTab] = useState('overview');
  const totalRaised = campaigns.reduce((s, c) => s + (c.raisedAmount || 0), 0);
  const totalDonated = donations.reduce((s, d) => s + (d.amount || 0), 0);
  const totalBackers = campaigns.reduce((s, c) => s + (c.donorCount || 0), 0);

  return (
    <section className="space-y-8">
      <DashboardHeader name={user?.name} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="My campaigns"
          value={campaigns.length}
          sublabel={campaigns.length === 0 ? 'No campaigns yet' : `${campaigns.filter((c) => c.status === 'active').length} active`}
          tone="slate" icon={Rocket}
        />
        <StatCard
          label="Total raised"
          value={`₹${totalRaised.toLocaleString('en-IN')}`}
          sublabel={`${totalBackers} ${totalBackers === 1 ? 'backer' : 'backers'} total`}
          tone="emerald" icon={TrendingUp}
        />
        <StatCard
          label="My donations"
          value={donations.length}
          sublabel={donations.length === 0 ? 'Not donated yet' : 'Lifetime contributions'}
          tone="rose" icon={Heart}
        />
        <StatCard
          label="Total donated"
          value={`₹${totalDonated.toLocaleString('en-IN')}`}
          sublabel="Thank you for giving."
          tone="amber" icon={Gift}
        />
      </div>

      <Tabs
        value={tab}
        onChange={setTab}
        items={[
          { value: 'overview', label: 'Overview' },
          { value: 'campaigns', label: 'My campaigns', count: campaigns.length },
          { value: 'donations', label: 'My donations', count: donations.length },
        ]}
      />

      {tab === 'overview' && (
        <OverviewPanel campaigns={campaigns} donations={donations} onJumpTab={setTab} />
      )}
      {tab === 'campaigns' && <CampaignsPanel campaigns={campaigns} />}
      {tab === 'donations' && <DonationsPanel donations={donations} />}
    </section>
  );
}

function OverviewPanel({ campaigns, donations, onJumpTab }) {
  const topCampaigns = [...campaigns].sort((a, b) => (b.raisedAmount || 0) - (a.raisedAmount || 0)).slice(0, 3);
  const recentDonations = donations.slice(0, 5);
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-5">
        <SectionHead title="Top campaigns" onSeeAll={campaigns.length > 3 ? () => onJumpTab('campaigns') : null} />
        {topCampaigns.length === 0 ? (
          <EmptyTile preset="campaigns" title="No campaigns yet" text="Launch your first campaign." ctaText="Start a campaign" ctaTo="/create" />
        ) : (
          <div className="space-y-3">
            {topCampaigns.map((c) => <CampaignRow key={c._id} campaign={c} />)}
          </div>
        )}
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <SectionHead title="Recent giving" onSeeAll={donations.length > 5 ? () => onJumpTab('donations') : null} />
        {recentDonations.length === 0 ? (
          <EmptyTile preset="donations" title="You haven't donated yet" text="Find a campaign worth backing." ctaText="Browse campaigns" ctaTo="/browse" />
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
  if (campaigns.length === 0) return <EmptyTile preset="campaigns" large title="You haven't started a campaign yet" text="Launch your first campaign in minutes — add a story, set a goal, share the link." ctaText="Start your first campaign" ctaTo="/create" />;
  return <div className="space-y-3">{campaigns.map((c) => <CampaignRow key={c._id} campaign={c} />)}</div>;
}

function DonationsPanel({ donations }) {
  if (donations.length === 0) return <EmptyTile preset="donations" large title="No donations yet" text="When you back a campaign, your receipts show up here." ctaText="Browse campaigns" ctaTo="/browse" />;
  return <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-100">{donations.map((d) => <DonationFullRow key={d._id} donation={d} />)}</div>;
}

function SectionHead({ title, onSeeAll }) {
  return (
    <div className="flex items-baseline justify-between mb-4">
      <h2 className="text-lg font-semibold">{title}</h2>
      {onSeeAll && <button onClick={onSeeAll} className="text-sm text-emerald-700 hover:underline">See all →</button>}
    </div>
  );
}
