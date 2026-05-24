// RewardTier.js — Kickstarter-style perks for donors.
// Each campaign can have multiple tiers (e.g. ₹500 = thank-you card, ₹5000 = t-shirt).
// `claimed` is incremented when a donor picks this tier; `limit` caps how many
// can claim it (use null for unlimited).

import mongoose from 'mongoose';

const rewardTierSchema = new mongoose.Schema(
  {
    campaign: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campaign',
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    minAmount: { type: Number, required: true, min: 1 },
    limit: { type: Number, default: null },   // null = unlimited
    claimed: { type: Number, default: 0 },
    estimatedDelivery: { type: Date },
  },
  { timestamps: true }
);

const RewardTier = mongoose.model('RewardTier', rewardTierSchema);
export default RewardTier;
