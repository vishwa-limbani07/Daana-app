// DonateModal.jsx — donation flow with optional reward tier.
//
// FLOW (unchanged from before, with one addition):
//   1. User picks amount, optional message, anonymous toggle.
//      If a tier is preselected (passed via the `tier` prop), the amount
//      defaults to the tier's minAmount and can't go below it.
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

const QUICK_AMOUNTS = [500, 1000, 2500, 5000];

export default function DonateModal({ open, onClose, campaign, tier, onSuccess }) {
  const user = useSelector((s) => s.auth.user);
  const navigate = useNavigate();
  const openCheckout = useRazorpay();
  const toast = useToast();

  // If a tier is supplied, start at its minAmount; otherwise default to 1000.
  const minAmount = tier?.minAmount || 1;
  const [amount, setAmount] = useState(tier?.minAmount || 1000);
  const [message, setMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Reset amount when tier changes (open → reopen with different tier).
  useEffect(() => {
    if (open) setAmount(tier?.minAmount || 1000);
  }, [open, tier?._id]);

  // Fresh idempotency key each time the modal opens.
  const idempotencyKey = useMemo(
    () => (open ? crypto.randomUUID() : null),
    [open]
  );

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!user) {
      onClose();
      navigate('/login');
      return;
    }
    if (!Number.isFinite(amount) || amount < minAmount) {
      setError(`Minimum donation for this tier is ${formatCurrency(minAmount)}`);
      return;
    }

    setLoading(true);
    try {
      const { data: order } = await createOrder({
        campaignId: campaign._id,
        amount,
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
            toast.success(`Thank you! Your donation of ${formatCurrency(amount)} was successful. 🎉`);
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
          if (err?.reason !== 'dismissed') toast.error(msg); // don't toast a manual cancel
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
      <h2 className="text-xl font-bold mb-1">
        {tier ? `Back the "${tier.title}" tier` : 'Support this campaign'}
      </h2>
      <p className="text-sm text-gray-500 mb-4 truncate">{campaign?.title}</p>

      {/* Tier summary if one is selected */}
      {tier && (
        <div className="mb-4 p-3 rounded-lg border border-emerald-200 bg-emerald-50">
          <div className="flex justify-between items-baseline">
            <span className="font-semibold">{tier.title}</span>
            <span className="text-emerald-600 font-medium">
              {formatCurrency(tier.minAmount)}+
            </span>
          </div>
          <p className="text-sm text-gray-700 mt-1">{tier.description}</p>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        {/* Quick chips only when no tier (tier locks the minimum) */}
        {!tier && (
          <div className="flex flex-wrap gap-2">
            {QUICK_AMOUNTS.map((amt) => (
              <button
                type="button"
                key={amt}
                onClick={() => setAmount(amt)}
                className={`px-3 py-1 rounded border text-sm ${
                  amount === amt
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-emerald-400'
                }`}
              >
                {formatCurrency(amt)}
              </button>
            ))}
          </div>
        )}

        <label className="block">
          <span className="text-sm font-medium text-gray-700">
            Amount (₹){tier && ` — minimum ${formatCurrency(minAmount)}`}
          </span>
          <input
            type="number"
            min={minAmount}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            required
            className="mt-1 w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-gray-700">Message (optional)</span>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={280}
            rows={2}
            className="mt-1 w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={isAnonymous}
            onChange={(e) => setIsAnonymous(e.target.checked)}
          />
          Donate anonymously
        </label>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <div className="flex gap-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={loading} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" disabled={loading} className="flex-1">
            {loading ? 'Processing...' : `Donate ${formatCurrency(amount || 0)}`}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
