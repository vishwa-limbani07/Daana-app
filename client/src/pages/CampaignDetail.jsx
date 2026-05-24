// CampaignDetail.jsx — single campaign view with LIVE donation updates.
//
// How the live update works:
//   1. On mount, useSocket joins room `campaign:<id>` on the shared socket.
//   2. When any donor pays, the server emits 'donation:new' to that room.
//   3. Our callback updates raisedAmount/donorCount in local state.
//   4. The ProgressBar + numbers re-render — no refresh, no extra HTTP call.
//
// We also briefly flash the donation card to make the update visible.

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { getCampaign } from '../api/campaignApi.js';
import DonateModal from '../components/campaign/DonateModal.jsx';
import ProgressBar from '../components/campaign/ProgressBar.jsx';
import Button from '../components/common/Button.jsx';
import Loader from '../components/common/Loader.jsx';
import { useSocket } from '../hooks/useSocket.js';
import { formatCurrency } from '../utils/formatCurrency.js';
import { formatDate, daysLeft } from '../utils/formatDate.js';

export default function CampaignDetail() {
  const { id } = useParams();
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [donateOpen, setDonateOpen] = useState(false);
  const [flash, setFlash] = useState(false);

  // Initial fetch
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

  // Live update handler. useCallback gives it a stable identity so the
  // socket subscription doesn't tear down + re-mount on every render.
  const onDonationLive = useCallback((payload) => {
    setCampaign((prev) =>
      prev ? { ...prev, raisedAmount: payload.raisedAmount, donorCount: payload.donorCount } : prev
    );
    // Brief visual pulse so the user notices the update.
    setFlash(true);
    setTimeout(() => setFlash(false), 1500);
  }, []);

  useSocket(id, onDonationLive);

  if (loading) return <Loader />;
  if (error) return <p className="text-red-600">{error}</p>;
  if (!campaign) return null;

  const pct = Math.min(100, Math.round((campaign.raisedAmount / campaign.goalAmount) * 100));
  const isExpired = new Date(campaign.deadline) < new Date();
  const canDonate = campaign.status === 'active' && !isExpired;

  return (
    <>
      <article className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <img src={campaign.coverImage} alt={campaign.title} className="w-full rounded-lg" />
          <h1 className="text-3xl font-bold mt-6">{campaign.title}</h1>
          <p className="text-sm text-gray-500 mt-1">
            by {campaign.creator?.name} · {campaign.category} · ends {formatDate(campaign.deadline)}
          </p>
          <div className="prose mt-6 whitespace-pre-wrap text-gray-800">{campaign.story}</div>
        </div>

        <aside
          className={`bg-white rounded-lg shadow p-6 h-fit lg:sticky lg:top-4 transition-shadow ${
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
            onClick={() => setDonateOpen(true)}
            disabled={!canDonate}
          >
            {canDonate ? 'Donate now' : isExpired ? 'Campaign ended' : 'Not accepting'}
          </Button>
        </aside>
      </article>

      <DonateModal
        open={donateOpen}
        onClose={() => setDonateOpen(false)}
        campaign={campaign}
        // No explicit refresh — the socket event handles the UI update.
        onSuccess={() => {}}
      />
    </>
  );
}
