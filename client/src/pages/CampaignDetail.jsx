// CampaignDetail.jsx — single campaign view with live updates + reward tiers.
//
// Two new pieces of state:
//   selectedTier — set when a donor clicks a tier card; cleared on modal close.
//   isCreator    — derived from req.user vs campaign.creator. Controls whether
//                  the TiersPanel shows the add-tier form.

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getCampaign } from '../api/campaignApi.js';
import DonateModal from '../components/campaign/DonateModal.jsx';
import DonationsFeed from '../components/campaign/DonationsFeed.jsx';
import ProgressBar from '../components/campaign/ProgressBar.jsx';
import TiersPanel from '../components/campaign/TiersPanel.jsx';
import Button from '../components/common/Button.jsx';
import { CampaignDetailSkeleton } from '../components/common/Skeleton.jsx';
import { useSocket } from '../hooks/useSocket.js';
import { formatCurrency } from '../utils/formatCurrency.js';
import { formatDate, daysLeft } from '../utils/formatDate.js';

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

  // Donor clicked a tier card → open modal pre-set to that tier.
  const openDonateForTier = (tier) => {
    setSelectedTier(tier);
    setDonateOpen(true);
  };

  // "Donate now" button (no tier) → open modal as before.
  const openDonateFreeAmount = () => {
    setSelectedTier(null);
    setDonateOpen(true);
  };

  if (loading) return <CampaignDetailSkeleton />;
  if (error) return <p className="text-red-600">{error}</p>;
  if (!campaign) return null;

  const pct = Math.min(100, Math.round((campaign.raisedAmount / campaign.goalAmount) * 100));
  const isExpired = new Date(campaign.deadline) < new Date();
  const canDonate = campaign.status === 'active' && !isExpired;
  const isCreator = Boolean(
    currentUser && campaign.creator && (campaign.creator._id === currentUser._id || campaign.creator === currentUser._id)
  );

  return (
    <>
      <article className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <img src={campaign.coverImage} alt={campaign.title} className="w-full rounded-lg" />

          <div>
            <h1 className="text-3xl font-bold">{campaign.title}</h1>
            <p className="text-sm text-gray-500 mt-1">
              by {campaign.creator?.name} · {campaign.category} · ends {formatDate(campaign.deadline)}
            </p>
            <div className="prose mt-6 whitespace-pre-wrap text-gray-800">{campaign.story}</div>
          </div>

          <section>
            <h2 className="text-xl font-semibold mb-3">Recent backers</h2>
            <DonationsFeed campaignId={id} newDonation={latestDonation} />
          </section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-4 h-fit">
          {/* Progress card */}
          <div
            className={`bg-white rounded-lg shadow p-6 transition-shadow ${
              flash ? 'ring-4 ring-indigo-400 shadow-lg' : ''
            }`}
          >
            <div className="text-2xl font-bold">{formatCurrency(campaign.raisedAmount)}</div>
            <div className="text-sm text-gray-500">raised of {formatCurrency(campaign.goalAmount)} goal</div>
            <ProgressBar percent={pct} />

            <div className="grid grid-cols-2 gap-4 mt-4 text-center">
              <div>
                <div className="font-bold">{campaign.donorCount}</div>
                <div className="text-xs text-gray-500">donors</div>
              </div>
              <div>
                <div className="font-bold">{daysLeft(campaign.deadline)}</div>
                <div className="text-xs text-gray-500">days left</div>
              </div>
            </div>

            <Button
              className="w-full mt-6"
              onClick={openDonateFreeAmount}
              disabled={!canDonate}
            >
              {canDonate ? 'Donate now' : isExpired ? 'Campaign ended' : 'Not accepting'}
            </Button>
          </div>

          {/* Tiers */}
          <div className="bg-white rounded-lg shadow p-6">
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
