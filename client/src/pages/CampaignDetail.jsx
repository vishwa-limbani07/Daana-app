// CampaignDetail.jsx — redesigned with editorial title + vibrant in-app shell.
//
// One serif moment (the campaign title) ties this page to the Landing/Auth
// editorial voice. Everything else stays vibrant emerald — this is an
// in-app surface where energy + clarity matter more than restraint.
//
// Live updates: Socket.io pushes new donations → progress card flashes,
// donations feed prepends, raised + donor counts tick up.

import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getCampaign } from '../api/campaignApi.js';
import DonateModal from '../components/campaign/DonateModal.jsx';
import DonationsFeed from '../components/campaign/DonationsFeed.jsx';
import ProgressBar from '../components/campaign/ProgressBar.jsx';
import TiersPanel from '../components/campaign/TiersPanel.jsx';
import ShareRow from '../components/campaign/ShareRow.jsx';
import Button from '../components/common/Button.jsx';
import { CampaignDetailSkeleton } from '../components/common/Skeleton.jsx';
import { useSocket } from '../hooks/useSocket.js';
import { formatCurrency } from '../utils/formatCurrency.js';
import { formatDate, daysLeft } from '../utils/formatDate.js';

const CATEGORY_EMOJI = {
  education: '📚',
  medical: '🏥',
  community: '🏘️',
  tech: '💻',
  creative: '🎨',
  other: '✨',
};

export default function CampaignDetail() {
  const { id } = useParams();
  const currentUser = useSelector((s) => s.auth.user);
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [donateOpen, setDonateOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState(null);
  const [flash, setFlash] = useState(false);
  const [latestDonation, setLatestDonation] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await getCampaign(id);
        setCampaign(data.campaign);
      } catch (err) {
        setError(err.response?.data?.message || 'Campaign not found');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const onDonationLive = useCallback((payload) => {
    setCampaign((prev) =>
      prev ? { ...prev, raisedAmount: payload.raisedAmount, donorCount: payload.donorCount } : prev
    );
    if (payload.donation) setLatestDonation(payload.donation);
    setFlash(true);
    setTimeout(() => setFlash(false), 1500);
  }, []);

  useSocket(id, onDonationLive);

  const openDonateForTier = (tier) => { setSelectedTier(tier); setDonateOpen(true); };
  const openDonateFreeAmount = () => { setSelectedTier(null); setDonateOpen(true); };

  if (loading) return <CampaignDetailSkeleton />;
  if (error) return <p className="text-red-600">{error}</p>;
  if (!campaign) return null;

  const pct = Math.min(100, Math.round((campaign.raisedAmount / campaign.goalAmount) * 100));
  const isExpired = new Date(campaign.deadline) < new Date();
  const canDonate = campaign.status === 'active' && !isExpired;
  const isCreator = Boolean(
    currentUser && campaign.creator && (campaign.creator._id === currentUser._id || campaign.creator === currentUser._id)
  );
  const creator = campaign.creator || {};
  const initial = (creator.name || '?')[0].toUpperCase();
  const categoryEmoji = CATEGORY_EMOJI[campaign.category] || CATEGORY_EMOJI.other;

  return (
    <>
      {/* ============== HERO IMAGE ============== */}
      <div className="relative rounded-2xl overflow-hidden mb-8 shadow-sm">
        <img
          src={campaign.coverImage}
          alt={campaign.title}
          className="w-full aspect-[16/7] object-cover"
        />
        {/* Soft gradient overlay so the category chip stays readable */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
        <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 bg-white/95 backdrop-blur px-3 py-1.5 rounded-full text-xs font-medium text-gray-800">
          <span>{categoryEmoji}</span>
          <span className="capitalize">{campaign.category}</span>
        </span>
      </div>

      <article className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ============== LEFT — MAIN CONTENT ============== */}
        <div className="lg:col-span-2 space-y-10">
          {/* Title block — the one editorial moment in this page */}
          <header>
            <h1 className="font-serif text-4xl md:text-5xl text-gray-900 tracking-tight leading-[1.1]">
              {campaign.title}
            </h1>

            <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-600">
              <CreatorChip creator={creator} initial={initial} />
              <span className="text-gray-300">·</span>
              <span>Ends {formatDate(campaign.deadline)}</span>
            </div>

            <div className="mt-5">
              <ShareRow campaign={campaign} />
            </div>
          </header>

          {/* Story */}
          <div>
            <h2 className="text-xs uppercase tracking-widest text-gray-500 mb-3">The story</h2>
            <div className="prose prose-gray max-w-none whitespace-pre-wrap text-gray-800 leading-relaxed">
              {campaign.story}
            </div>
          </div>

          {/* Recent backers */}
          <section>
            <h2 className="text-xs uppercase tracking-widest text-gray-500 mb-3">Recent backers</h2>
            <DonationsFeed campaignId={id} newDonation={latestDonation} />
          </section>
        </div>

        {/* ============== RIGHT — STICKY SIDEBAR ============== */}
        <aside className="space-y-4 lg:sticky lg:top-20 h-fit">
          {/* Progress + Donate card */}
          <div
            className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-6 transition-all ${
              flash ? 'ring-4 ring-emerald-300 shadow-lg' : ''
            }`}
          >
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-gray-900">
                {formatCurrency(campaign.raisedAmount)}
              </span>
              <span className="text-sm text-gray-500">raised</span>
            </div>
            <div className="text-sm text-gray-500">
              of {formatCurrency(campaign.goalAmount)} goal · <span className="text-emerald-700 font-medium">{pct}%</span>
            </div>

            <ProgressBar percent={pct} showMilestones />

            <div className="grid grid-cols-2 gap-3 mt-6 pt-5 border-t border-gray-100">
              <Stat value={campaign.donorCount} label={campaign.donorCount === 1 ? 'backer' : 'backers'} />
              <Stat value={daysLeft(campaign.deadline)} label={daysLeft(campaign.deadline) === 1 ? 'day left' : 'days left'} />
            </div>

            <Button
              className="w-full mt-6 !py-3"
              onClick={openDonateFreeAmount}
              disabled={!canDonate}
            >
              {canDonate ? 'Back this campaign →' : isExpired ? 'Campaign ended' : 'Not accepting'}
            </Button>

            {!canDonate && isExpired && (
              <p className="text-xs text-center text-gray-500 mt-2">
                The deadline has passed.
              </p>
            )}
          </div>

          {/* Tiers */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <TiersPanel
              campaignId={id}
              isCreator={isCreator}
              onSelect={canDonate ? openDonateForTier : undefined}
            />
          </div>
        </aside>
      </article>

      <DonateModal
        open={donateOpen}
        onClose={() => { setDonateOpen(false); setSelectedTier(null); }}
        campaign={campaign}
        tier={selectedTier}
        onSuccess={() => {}}
      />
    </>
  );
}

// --- small subcomponents ---

function CreatorChip({ creator, initial }) {
  const hashColor = ['bg-indigo-500','bg-rose-500','bg-emerald-500','bg-amber-500','bg-sky-500','bg-purple-500'];
  const idx = [...(creator.name || '?')].reduce((a, c) => a + c.charCodeAt(0), 0) % hashColor.length;
  return (
    <span className="inline-flex items-center gap-2">
      {creator.avatar ? (
        <img src={creator.avatar} alt={creator.name} className="w-7 h-7 rounded-full object-cover" />
      ) : (
        <span className={`w-7 h-7 rounded-full ${hashColor[idx]} text-white flex items-center justify-center text-xs font-semibold`}>
          {initial}
        </span>
      )}
      <span>
        by <span className="font-medium text-gray-900">{creator.name || 'Unknown'}</span>
      </span>
    </span>
  );
}

function Stat({ value, label }) {
  return (
    <div className="text-center">
      <div className="text-xl font-bold text-gray-900">{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );
}
