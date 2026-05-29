// donationController.js — the heart of the project.
//
// Endpoints:
//   POST /api/donations/order   — create Razorpay order, return order_id
//   POST /api/donations/verify  — verify HMAC, mark donation success
//   GET  /api/donations/mine    — donor's history
//
// AMOUNTS:
//   - Our DB stores rupees (Number).
//   - Razorpay's API speaks paise (rupees * 100). Conversion lives in paymentService.

import crypto from 'crypto';
import Campaign from '../models/Campaign.js';
import Donation from '../models/Donation.js';
import RewardTier from '../models/RewardTier.js';
import * as paymentService from '../services/paymentService.js';
import { emitDonation } from '../services/socketService.js';
import { sendDonationReceipt } from '../services/emailService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// POST /api/donations/order
export const createOrder = asyncHandler(async (req, res) => {
  const { campaignId, amount, message = '', isAnonymous = false, rewardTierId, idempotencyKey } = req.body;

  if (!campaignId || !amount) {
    return res.status(400).json({ message: 'campaignId and amount are required' });
  }
  const amountNum = Number(amount);
  if (!Number.isFinite(amountNum) || amountNum < 1) {
    return res.status(400).json({ message: 'amount must be at least ₹1' });
  }

  // --- Idempotency: if the client retried with the same key, return the
  // existing order instead of creating a duplicate. Prevents double-charge
  // when a user double-clicks "Donate".
  if (idempotencyKey) {
    const existing = await Donation.findOne({ idempotencyKey });
    if (existing) {
      return res.json({
        orderId: existing.razorpayOrderId,
        amount: existing.amount,
        donationId: existing._id,
        razorpayKeyId: process.env.RAZORPAY_KEY_ID,
      });
    }
  }

  // --- Campaign must exist, be active, and not past deadline.
  const campaign = await Campaign.findById(campaignId);
  if (!campaign) {
    return res.status(404).json({ message: 'campaign not found' });
  }
  if (campaign.status !== 'active') {
    return res.status(400).json({ message: 'campaign is not accepting donations' });
  }
  if (new Date(campaign.deadline) < new Date()) {
    return res.status(400).json({ message: 'campaign deadline has passed' });
  }

  // --- Tier validation (optional — donations can be tier-less)
  let tier = null;
  if (rewardTierId) {
    tier = await RewardTier.findOne({ _id: rewardTierId, campaign: campaignId });
    if (!tier) {
      return res.status(404).json({ message: 'reward tier not found' });
    }
    if (amountNum < tier.minAmount) {
      return res.status(400).json({
        message: `This tier requires a minimum donation of ₹${tier.minAmount}`,
      });
    }
    // Optimistic stock check — final guard is the atomic $inc at verify time.
    if (tier.limit !== null && tier.claimed >= tier.limit) {
      return res.status(409).json({ message: 'This reward tier is sold out' });
    }
  }

  // --- Create Razorpay order. The receipt is a short reference echoed back.
  // We use a UUID — it's unique and reveals nothing about our DB.
  const receipt = crypto.randomUUID();
  const order = await paymentService.createOrder(amountNum, receipt);

  // --- Save the donation in 'pending' state. We'll flip it to 'success'
  // once the verify call comes back with a valid HMAC.
  const donation = await Donation.create({
    campaign: campaignId,
    donor: req.user._id,
    amount: amountNum,
    message,
    isAnonymous: Boolean(isAnonymous),
    rewardTier: rewardTierId,
    razorpayOrderId: order.id,
    status: 'pending',
    idempotencyKey: idempotencyKey || undefined,
  });

  res.status(201).json({
    orderId: order.id,
    amount: donation.amount,
    donationId: donation._id,
    razorpayKeyId: process.env.RAZORPAY_KEY_ID,
  });
});

// POST /api/donations/verify
//
// THE CRITICAL ENDPOINT. Walk through it carefully — recruiters will ask.
//
// We use findOneAndUpdate with status:'pending' in the filter so that the
// status transition is atomic. If two things race to mark the donation
// successful (the verify call AND the webhook), only ONE of them changes
// the row from 'pending' to 'success'. That one is responsible for incrementing
// the campaign's raisedAmount. The other gets null back and does nothing.
//
// Without this, a double-process would inflate raisedAmount.
export const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ message: 'missing payment details' });
  }

  // 1. NEVER trust the frontend. Verify cryptographically that Razorpay
  //    signed this combination of order+payment.
  const valid = paymentService.verifySignature({
    orderId: razorpay_order_id,
    paymentId: razorpay_payment_id,
    signature: razorpay_signature,
  });
  if (!valid) {
    return res.status(400).json({ message: 'invalid signature — payment rejected' });
  }

  // 2. Atomic transition: pending -> success.
  // Populate the campaign so we have its title for the receipt email.
  const donation = await Donation.findOneAndUpdate(
    { razorpayOrderId: razorpay_order_id, status: 'pending' },
    {
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      status: 'success',
    },
    { new: true }
  ).populate('campaign', 'title');

  if (!donation) {
    // Already processed (by an earlier verify or by the webhook). Look it up
    // so we can return the current state. This makes the endpoint idempotent.
    const existing = await Donation.findOne({ razorpayOrderId: razorpay_order_id });
    if (!existing) return res.status(404).json({ message: 'donation not found' });
    return res.json({ donation: existing, alreadyProcessed: true });
  }

  // 3. We made the transition. Now we own the increment.
  //    $inc is atomic at the document level — concurrent donations are safe.
  //    Use { new: true } so we get back the post-increment totals to emit.
  // donation.campaign is now a populated doc — use its _id for further lookups.
  const campaignId = donation.campaign._id;
  const campaign = await Campaign.findByIdAndUpdate(
    campaignId,
    { $inc: { raisedAmount: donation.amount, donorCount: 1 } },
    { new: true }
  );

  // 3b. THE ATOMIC TIER CLAIM.
  //
  // Filter requires "(limit is null) OR (claimed < limit)" — checked atomically
  // in the same MongoDB operation that does the $inc. If two donations race
  // for the last spot, exactly ONE matches the filter; the other gets `null`
  // and the tier counter stays correct.
  //
  // $expr lets us compare two FIELDS of the same document inside the filter.
  // Plain MongoDB queries can only compare a field to a value, not two fields.
  if (donation.rewardTier) {
    const claimed = await RewardTier.findOneAndUpdate(
      {
        _id: donation.rewardTier,
        $or: [
          { limit: null },
          { $expr: { $lt: ['$claimed', '$limit'] } },
        ],
      },
      { $inc: { claimed: 1 } },
      { new: true }
    );
    if (!claimed) {
      // Lost the race for the last spot. The donation still went through —
      // we already charged the user. Log it so the creator can resolve manually.
      console.warn(
        `[tier] over-claim avoided on tier ${donation.rewardTier} — ` +
        `donation ${donation._id} processed without tier assignment`
      );
    }
  }

  // 4. Push the new totals to everyone viewing the campaign page.
  //    Only fires here OR in the webhook handler — never both, thanks to
  //    the atomic findOneAndUpdate above.
  //    Strip donor info if anonymous — same rule as the public list endpoint.
  emitDonation(String(campaignId), {
    raisedAmount: campaign.raisedAmount,
    donorCount: campaign.donorCount,
    donation: {
      _id: donation._id,
      amount: donation.amount,
      message: donation.message,
      createdAt: donation.createdAt,
      isAnonymous: donation.isAnonymous,
      donor: donation.isAnonymous
        ? null
        : { name: req.user.name, avatar: req.user.avatar },
    },
  });

  // 5. Fire-and-forget receipt. Never await — the user already has their
  //    payment confirmation. A failed email is logged and forgotten.
  sendDonationReceipt({
    to: req.user.email,
    donorName: req.user.name,
    amount: donation.amount,
    campaignTitle: donation.campaign.title,
    campaignId,
  }).catch((err) => console.error('[email] receipt failed:', err.message));

  res.json({ donation });
});

// GET /api/donations/mine
export const listMyDonations = asyncHandler(async (req, res) => {
  const items = await Donation.find({ donor: req.user._id, status: 'success' })
    .sort({ createdAt: -1 })
    .populate('campaign', 'title coverImage');
  res.json({ items });
});

// GET /api/donations/campaign/:id
// Public endpoint — returns the most recent N successful donations for a campaign.
// IMPORTANT: anonymous donations have their donor info stripped on the server.
// Never trust the frontend to "respect" an anonymous flag — strip the data
// before it ever leaves the API.
export const listCampaignDonations = asyncHandler(async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 20, 50);

  const raw = await Donation.find({ campaign: req.params.id, status: 'success' })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('donor', 'name avatar');

  const items = raw.map((d) => ({
    _id: d._id,
    amount: d.amount,
    message: d.message,
    createdAt: d.createdAt,
    isAnonymous: d.isAnonymous,
    // Strip donor PII for anonymous donations
    donor: d.isAnonymous
      ? null
      : d.donor
        ? { name: d.donor.name, avatar: d.donor.avatar }
        : null,
  }));

  res.json({ items });
});
