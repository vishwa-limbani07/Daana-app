// webhookController.js — receives async payment events from Razorpay.
//
// Why webhooks if verifyPayment already does the job?
//   The user might close their browser between paying and our /verify call.
//   The webhook ensures we still hear about successful payments via a
//   server-to-server channel.
//
// The atomic findOneAndUpdate pattern (same as verifyPayment) makes it safe
// for both paths to run for the same payment — only one will actually mutate.

import Campaign from '../models/Campaign.js';
import Donation from '../models/Donation.js';
import RewardTier from '../models/RewardTier.js';
import * as paymentService from '../services/paymentService.js';
import { emitDonation } from '../services/socketService.js';
import { sendDonationReceipt } from '../services/emailService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const handleRazorpayWebhook = asyncHandler(async (req, res) => {
  const signature = req.headers['x-razorpay-signature'];
  if (!signature) {
    return res.status(400).json({ message: 'missing signature' });
  }

  // req.body is a Buffer here (express.raw() in the route).
  // The HMAC must be computed over the EXACT bytes Razorpay sent.
  // If you JSON.parse then re-stringify, you can lose key ordering or
  // whitespace and the signature will fail.
  if (!paymentService.verifyWebhookSignature(req.body, signature)) {
    return res.status(400).json({ message: 'invalid signature' });
  }

  let event;
  try {
    event = JSON.parse(req.body.toString('utf8'));
  } catch {
    return res.status(400).json({ message: 'invalid json' });
  }

  switch (event.event) {
    case 'payment.captured': {
      const entity = event.payload.payment.entity;
      // Populate donor + campaign so we can send a receipt without a 2nd lookup.
      const donation = await Donation.findOneAndUpdate(
        { razorpayOrderId: entity.order_id, status: 'pending' },
        { razorpayPaymentId: entity.id, status: 'success' },
        { new: true }
      )
        .populate('donor', 'name email')
        .populate('campaign', 'title');

      if (donation) {
        const campaignId = donation.campaign._id;
        const campaign = await Campaign.findByIdAndUpdate(
          campaignId,
          { $inc: { raisedAmount: donation.amount, donorCount: 1 } },
          { new: true }
        );

        // Atomic tier claim — same pattern as verifyPayment, see comments there.
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
            console.warn(
              `[tier] over-claim via webhook on tier ${donation.rewardTier}`
            );
          }
        }
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
              : donation.donor
                ? { name: donation.donor.name, avatar: donation.donor.avatar }
                : null,
          },
        });

        // Fire-and-forget receipt.
        if (donation.donor?.email) {
          sendDonationReceipt({
            to: donation.donor.email,
            donorName: donation.donor.name,
            amount: donation.amount,
            campaignTitle: donation.campaign.title,
            campaignId,
          }).catch((err) => console.error('[email] receipt failed:', err.message));
        }
      }
      break;
    }

    case 'payment.failed': {
      const entity = event.payload.payment.entity;
      await Donation.findOneAndUpdate(
        { razorpayOrderId: entity.order_id, status: 'pending' },
        { razorpayPaymentId: entity.id, status: 'failed' }
      );
      break;
    }

    case 'refund.processed': {
      const entity = event.payload.refund.entity;
      // The refund event references a payment_id; find donation by that.
      await Donation.findOneAndUpdate(
        { razorpayPaymentId: entity.payment_id },
        { status: 'refunded' }
      );
      // Note: we don't decrement raisedAmount here to keep an honest audit
      // trail. Adjust if your accounting needs differ.
      break;
    }

    default:
      console.log(`[webhook] unhandled event: ${event.event}`);
  }

  // Always 200 quickly. Razorpay retries on non-2xx, and slow responses
  // can cause duplicate deliveries.
  res.status(200).json({ received: true });
});
