// Campaign.js — a fundraising campaign created by a user.
// `raisedAmount` and `donorCount` are denormalized (updated when a donation succeeds)
// so we don't have to aggregate the Donation collection on every page load.

import mongoose from 'mongoose';

const campaignSchema = new mongoose.Schema(
  {
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    title: { type: String, required: true, trim: true, maxlength: 120 },
    story: { type: String, required: true }, // long-form description
    coverImage: { type: String, required: true }, // Cloudinary URL

    goalAmount: { type: Number, required: true, min: 1 },     // in INR (paise? — we'll use rupees in DB, paise only when talking to Razorpay)
    raisedAmount: { type: Number, default: 0 },
    donorCount: { type: Number, default: 0 },

    deadline: { type: Date, required: true },

    category: {
      type: String,
      required: true,
      enum: ['education', 'medical', 'community', 'tech', 'creative', 'other'],
      index: true,
    },

    status: {
      type: String,
      enum: ['pending', 'active', 'completed', 'failed', 'banned'],
      default: 'active', // MVP: auto-approve. For admin moderation, flip to 'pending'.
      index: true,
    },
  },
  { timestamps: true }
);

// Compound index for "list active campaigns sorted by newest"
campaignSchema.index({ status: 1, createdAt: -1 });

const Campaign = mongoose.model('Campaign', campaignSchema);
export default Campaign;
