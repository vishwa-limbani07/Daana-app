// DonateModal.jsx — donation flow with optional reward tier.
//
// Design changes (this revision):
//   - Removed quick-pick chips. Any amount allowed (minimum ₹1, or tier min).
//   - Amount input is now the visual centerpiece — large serif numeral,
//     ₹ prefix, generous padding. Feels like a check, not a form field.
//
// FLOW:
//   1. User picks amount, optional message, anonymous toggle.
//      If a tier is preselected, amount defaults to tier.minAmount and can't
//      go below.
//   2. Backend validates tier (exists, has stock, amount >= minAmount).
//   3. Razorpay checkout → verify → atomic tier claim on success.

import { useState, useMemo, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Modal from '../common/Modal.jsx';
import Button from '../common/Button.jsx';
import { createOrder, verifyPayment } from '../../api/donationApi.js';
import { useRazorpay } from '../../hooks/useRazorpay.js';
import { useToast } from '../../hooks/useToast.js';
import { formatCurrency } from '../../utils/formatCurrency.js';

export default function DonateModal({ open, onClose, campaign, tier, onSuccess }) {
  const user = useSelector((s) => s.auth.user);
  const navigate = useNavigate();
  const openCheckout = useRazorpay();
  const toast = useToast();

  const minAmount = tier?.minAmount || 1;
  // No default — let the field show the placeholder so users type their own.
  const [amount, setAmount] = useState(tier?.minAmount || '');
  const [message, setMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Reset amount when modal opens or the selected tier changes.
  useEffect(() => {
    if (open) setAmount(tier?.minAmount || '');
  }, [open, tier?._id]);

  // Fresh idempotency key each time the modal opens.
  const idempotencyKey = useMemo(
    () => (open ? crypto.randomUUID() : null),
    [open]
  );

  const amountNum = Number(amount);
  const amountValid = Number.isFinite(amountNum) && amountNum >= minAmount;

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!user) {
      onClose();
      navigate('/login');
      return;
    }
    if (!amountValid) {
      setError(
        tier
          ? `Minimum donation for this tier is ${formatCurrency(minAmount)}`
          : `Please enter an amount of at least ${formatCurrency(minAmount)}`
      );
      return;
    }

    setLoading(true);
    try {
      const { data: order } = await createOrder({
        campaignId: campaign._id,
        amount: amountNum,
        message,
        isAnonymous,
        rewardTierId: tier?._id,
        idempotencyKey,
      });

      openCheckout({
        orderId: order.orderId,
        amount: order.amount,
        name: user.name,
        email: user.email,
        onSuccess: async (resp) => {
          try {
            await verifyPayment({
              razorpay_order_id: resp.razorpay_order_id,
              razorpay_payment_id: resp.razorpay_payment_id,
              razorpay_signature: resp.razorpay_signature,
            });
            toast.success(`Thank you! Your donation of ${formatCurrency(amountNum)} was successful. 🎉`);
            onSuccess?.();
            onClose();
          } catch (err) {
            const msg = err.response?.data?.message || 'Payment verification failed';
            setError(msg);
            toast.error(msg);
          } finally {
            setLoading(false);
          }
        },
        onFailure: (err) => {
          const msg = err?.description || err?.reason || 'Payment cancelled';
          setError(msg);
          if (err?.reason !== 'dismissed') toast.error(msg);
          setLoading(false);
        },
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create order');
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={loading ? () => {} : onClose}>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold tracking-tight">
          {tier ? `Back the "${tier.title}" tier` : 'Support this campaign'}
        </h2>
        <p className="text-sm text-gray-500 mt-1 truncate">{campaign?.title}</p>
      </div>

      {/* Tier summary if one is selected */}
      {tier && (
        <div className="mb-5 p-3 rounded-xl border border-emerald-200 bg-emerald-50">
          <div className="flex justify-between items-baseline">
            <span className="font-semibold">{tier.title}</span>
            <span className="text-emerald-700 font-medium">
              {formatCurrency(tier.minAmount)}+
            </span>
          </div>
          <p className="text-sm text-gray-700 mt-1">{tier.description}</p>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-5">
        {/* Amount — the centerpiece */}
        <div>
          <label htmlFor="donateAmount" className="block text-xs uppercase tracking-widest text-gray-500 mb-2">
            Amount
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base font-serif text-gray-500 pointer-events-none">
              ₹
            </span>
            <input
              id="donateAmount"
              type="number"
              min={minAmount}
              step="any"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              required
              autoFocus
              className="w-full bg-white border border-gray-300 rounded-lg pl-8 pr-3 py-2.5 text-lg font-semibold tabular-nums text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent
                [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1.5">
            {tier
              ? `Minimum for this tier: ${formatCurrency(minAmount)}`
              : 'Any amount helps. Even ₹10 counts.'}
          </p>
        </div>

        {/* Message */}
        <div>
          <label htmlFor="donateMessage" className="block text-xs uppercase tracking-widest text-gray-500 mb-2">
            Message <span className="normal-case text-gray-400">(optional)</span>
          </label>
          <textarea
            id="donateMessage"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={280}
            rows={2}
            placeholder="Add a note for the creator..."
            className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>

        {/* Anonymous toggle */}
        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input
            type="checkbox"
            checked={isAnonymous}
            onChange={(e) => setIsAnonymous(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
          />
          Donate anonymously
        </label>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex gap-2 pt-1">
          <Button type="button" variant="secondary" onClick={onClose} disabled={loading} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" disabled={loading || !amountValid} className="flex-1">
            {loading
              ? 'Processing...'
              : amountValid
                ? `Donate ${formatCurrency(amountNum)}`
                : 'Enter an amount'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
