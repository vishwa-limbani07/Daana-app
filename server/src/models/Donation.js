// Donation.js — one record per donation attempt.
// Lifecycle: created (status 'pending') -> Razorpay order created ->
// user pays -> we verify signature -> status 'success' OR 'failed'.
//
// We keep failed/pending rows too — useful for analytics and debugging.

import mongoose from 'mongoose';

const donationSchema = new mongoose.Schema(
  {
    campaign: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campaign',
      required: true,
      index: true,
    },
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      // optional: anonymous donors don't have to be logged in (depending on your rules)
    },

    amount: { type: Number, required: true, min: 1 }, // in INR rupees
    message: { type: String, maxlength: 280, default: '' },
    isAnonymous: { type: Boolean, default: false },

    rewardTier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RewardTier',
    },

    // --- Razorpay payment trail ---
    razorpayOrderId: { type: String, required: true, unique: true, index: true },
    razorpayPaymentId: { type: String }, // set after payment succeeds
    razorpaySignature: { type: String }, // proof from Razorpay we verify

    status: {
      type: String,
      enum: ['pending', 'success', 'failed', 'refunded'],
      default: 'pending',
      index: true,
    },

    // Idempotency: client sends a UUID with every donation request.
    // If we see the same key twice, we return the existing order instead
    // of creating a new one. Prevents duplicate charges on double-clicks.
    idempotencyKey: { type: String, unique: true, sparse: true, index: true },
  },
  { timestamps: true }
);

const Donation = mongoose.model('Donation', donationSchema);
export default Donation;
