// tierController.js — reward tier CRUD nested under campaigns.
//
// Routes:
//   GET    /api/campaigns/:campaignId/tiers   (public)
//   POST   /api/campaigns/:campaignId/tiers   (creator only)
//   DELETE /api/tiers/:id                     (creator only)
//
// Creators add tiers AFTER a campaign exists, so we can attach
// `campaign` from the URL param.

import Campaign from '../models/Campaign.js';
import RewardTier from '../models/RewardTier.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listTiers = asyncHandler(async (req, res) => {
  const items = await RewardTier.find({ campaign: req.params.campaignId })
    .sort({ minAmount: 1 });
  res.json({ items });
});

export const createTier = asyncHandler(async (req, res) => {
  const campaign = await Campaign.findById(req.params.campaignId);
  if (!campaign) return res.status(404).json({ message: 'campaign not found' });

  // Only the creator can add tiers.
  if (!campaign.creator.equals(req.user._id)) {
    return res.status(403).json({ message: 'not allowed' });
  }

  const { title, description, minAmount, limit, estimatedDelivery } = req.body;
  if (!title || !description || !minAmount) {
    return res.status(400).json({ message: 'title, description, and minAmount are required' });
  }
  if (Number(minAmount) < 1) {
    return res.status(400).json({ message: 'minAmount must be at least ₹1' });
  }

  const tier = await RewardTier.create({
    campaign: campaign._id,
    title,
    description,
    minAmount: Number(minAmount),
    limit: limit === '' || limit === null || limit === undefined ? null : Number(limit),
    estimatedDelivery: estimatedDelivery || undefined,
  });

  res.status(201).json({ tier });
});

export const deleteTier = asyncHandler(async (req, res) => {
  const tier = await RewardTier.findById(req.params.id).populate('campaign', 'creator');
  if (!tier) return res.status(404).json({ message: 'tier not found' });
  if (!tier.campaign.creator.equals(req.user._id)) {
    return res.status(403).json({ message: 'not allowed' });
  }
  // Don't allow deleting if anyone has claimed it — would orphan donations.
  if (tier.claimed > 0) {
    return res.status(400).json({ message: 'tier already has backers and cannot be deleted' });
  }
  await tier.deleteOne();
  res.json({ message: 'tier deleted' });
});
