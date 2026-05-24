// Dashboard.jsx — creator's view.
//
// Two data sources, both fetched in parallel on mount:
//   GET /api/campaigns/mine   — campaigns I created
//   GET /api/donations/mine   — successful donations I made
//
// We compute summary stats on the client from those two arrays — no extra
// endpoint needed. For larger datasets you'd add a /stats endpoint that
// aggregates server-side (using Mongo's $group), but for a portfolio
// project with tens of records, client-side is fine and keeps the API smaller.

import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { listMyCampaigns } from '../api/campaignApi.js';
import { listMyDonations } from '../api/donationApi.js';
import ProgressBar from '../components/campaign/ProgressBar.jsx';
import Loader from '../components/common/Loader.jsx';
import { formatCurrency } from '../utils/formatCurrency.js';
import { formatDate, daysLeft } from '../utils/formatDate.js';

export default function Dashboard() {
  const user = useSelector((s) => s.auth.user);
  const token = useSelector((s) => s.auth.token);

  const [campaigns, setCampaigns] = useState([]);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        // Promise.all — both requests fire in parallel; wait time = slower one.
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
  if (loading) return <Loader />;
  if (error) return <p className="text-red-600">{error}</p>;

  // Computed stats — reduce over the arrays once.
  const totalRaised = campaigns.reduce((sum, c) => sum + (c.raisedAmount || 0), 0);
  const totalDonated = donations.reduce((sum, d) => sum + (d.amount || 0), 0);

  return (
    <section className="space-y-8">
      <div className="flex justify-between items-end flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">Hey, {user?.name?.split(' ')[0] || 'there'}</h1>
          <p className="text-gray-600">Manage your campaigns and donation history.</p>
        </div>
        <Link
          to="/create"
          className="bg-indigo-600 text-white px-4 py-2 rounded font-medium hover:bg-indigo-700"
        >
          + Start a campaign
        </Link>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="My campaigns" value={campaigns.length} />
        <StatCard label="Total raised" value={formatCurrency(totalRaised)} />
        <StatCard label="My donations" value={donations.length} />
        <StatCard label="Total donated" value={formatCurrency(totalDonated)} />
      </div>

      {/* My campaigns */}
      <section>
        <h2 className="text-xl font-semibold mb-3">My campaigns</h2>
        {campaigns.length === 0 ? (
          <EmptyState
            text="You haven't started a campaign yet."
            ctaText="Start your first campaign"
            ctaTo="/create"
          />
        ) : (
          <div className="space-y-3">
            {campaigns.map((c) => <CampaignRow key={c._id} campaign={c} />)}
          </div>
        )}
      </section>

      {/* My donations */}
      <section>
        <h2 className="text-xl font-semibold mb-3">My donations</h2>
        {donations.length === 0 ? (
          <EmptyState
            text="You haven't donated yet."
            ctaText="Browse campaigns"
            ctaTo="/"
          />
        ) : (
          <div className="space-y-3">
            {donations.map((d) => <DonationRow key={d._id} donation={d} />)}
          </div>
        )}
      </section>
    </section>
  );
}

// --- subcomponents ---

function StatCard({ label, value }) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-2xl font-bold mt-1">{value}</div>
    </div>
  );
}

function CampaignRow({ campaign }) {
  const pct = Math.min(100, Math.round((campaign.raisedAmount / campaign.goalAmount) * 100));
  return (
    <Link
      to={`/campaigns/${campaign._id}`}
      className="block bg-white rounded-lg shadow p-4 hover:shadow-md transition"
    >
      <div className="flex items-start gap-4">
        <img
          src={campaign.coverImage}
          alt={campaign.title}
          className="w-20 h-20 object-cover rounded flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold truncate">{campaign.title}</h3>
            <StatusBadge status={campaign.status} />
          </div>
          <ProgressBar percent={pct} />
          <div className="flex flex-wrap justify-between text-xs text-gray-500 mt-2 gap-2">
            <span>{formatCurrency(campaign.raisedAmount)} of {formatCurrency(campaign.goalAmount)}</span>
            <span>{campaign.donorCount} donors</span>
            <span>{daysLeft(campaign.deadline)} days left</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function DonationRow({ donation }) {
  // Campaign was populated server-side with title + coverImage.
  const c = donation.campaign;
  return (
    <Link
      to={c ? `/campaigns/${c._id}` : '#'}
      className="block bg-white rounded-lg shadow p-4 hover:shadow-md transition"
    >
      <div className="flex items-center gap-4">
        {c?.coverImage && (
          <img src={c.coverImage} alt="" className="w-14 h-14 object-cover rounded flex-shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium truncate">{c?.title || '(deleted campaign)'}</h3>
          <p className="text-xs text-gray-500">{formatDate(donation.createdAt)}</p>
        </div>
        <div className="text-lg font-semibold text-indigo-600">
          {formatCurrency(donation.amount)}
        </div>
      </div>
    </Link>
  );
}

const STATUS_STYLES = {
  active:    'bg-green-100 text-green-700',
  pending:   'bg-yellow-100 text-yellow-700',
  completed: 'bg-blue-100 text-blue-700',
  failed:    'bg-red-100 text-red-700',
  banned:    'bg-gray-200 text-gray-700',
};

function StatusBadge({ status }) {
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_STYLES[status] || 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  );
}

function EmptyState({ text, ctaText, ctaTo }) {
  return (
    <div className="bg-white rounded-lg shadow p-8 text-center">
      <p className="text-gray-500 mb-4">{text}</p>
      <Link to={ctaTo} className="text-indigo-600 hover:underline">{ctaText}</Link>
    </div>
  );
}
