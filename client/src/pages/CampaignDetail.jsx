// CampaignDetail.jsx — fetches data, picks the active layout, renders.
//
// The three layouts (Cover / Magazine / Product) live under
// components/campaign/detail/. Switch via the floating pill at the top.
// Once a winner is picked, set DEFAULT in useCampaignLayout.js and remove
// the switcher import.

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getCampaign } from '../api/campaignApi.js';
import DonateModal from '../components/campaign/DonateModal.jsx';
import MoreCampaigns from '../components/campaign/MoreCampaigns.jsx';
import LayoutCover    from '../components/campaign/detail/LayoutCover.jsx';
import LayoutMagazine from '../components/campaign/detail/LayoutMagazine.jsx';
import LayoutProduct  from '../components/campaign/detail/LayoutProduct.jsx';
import { CampaignDetailSkeleton } from '../components/common/Skeleton.jsx';
import { useSocket } from '../hooks/useSocket.js';
import { useCampaignLayout } from '../hooks/useCampaignLayout.js';

const LAYOUTS = {
  cover:    LayoutCover,
  magazine: LayoutMagazine,
  product:  LayoutProduct,
};

export default function CampaignDetail() {
  const { id } = useParams();
  const currentUser = useSelector((s) => s.auth.user);
  const { key } = useCampaignLayout();

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

  if (loading) return <CampaignDetailSkeleton />;
  if (error) return <p className="text-red-600">{error}</p>;
  if (!campaign) return null;

  const pct = Math.min(100, Math.round((campaign.raisedAmount / campaign.goalAmount) * 100));
  const isExpired = new Date(campaign.deadline) < new Date();
  const canDonate = campaign.status === 'active' && !isExpired;
  const isCreator = Boolean(
    currentUser && campaign.creator
      && (campaign.creator._id === currentUser._id || campaign.creator === currentUser._id)
  );
  const creator = campaign.creator || {};

  const onDonateForTier = (tier) => { setSelectedTier(tier); setDonateOpen(true); };
  const onDonateFreeAmount = () => { setSelectedTier(null); setDonateOpen(true); };

  const Layout = LAYOUTS[key];
  const layoutProps = {
    campaign, creator, pct, flash, canDonate, isExpired, isCreator,
    latestDonation, onDonateFreeAmount, onDonateForTier,
  };

  return (
    <>
      <Layout {...layoutProps} />
      <MoreCampaigns category={campaign.category} excludeId={campaign._id} />

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
