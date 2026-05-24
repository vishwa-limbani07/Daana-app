// DonateModal.jsx — owns the full donation flow on the frontend.
//
// FLOW:
//   1. User picks amount, optional message, anonymous toggle.
//   2. On submit:
//        - Generate idempotency key (UUID). Prevents duplicate charge on retry.
//        - POST /api/donations/order  → backend returns { orderId, donationId }
//        - Open Razorpay checkout (via useRazorpay hook) with that orderId.
//   3. On Razorpay success callback:
//        - POST /api/donations/verify with { order_id, payment_id, signature }.
//        - Backend verifies HMAC, marks success, increments campaign progress.
//        - We call onSuccess() so the parent can refresh.
//
// Idempotency key: we generate ONCE per "Donate" button click. If anything
// retries (network blip, double-click), the same key reaches the server and
// it returns the existing order instead of charging twice.

import { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Modal from '../common/Modal.jsx';
import Button from '../common/Button.jsx';
import { createOrder, verifyPayment } from '../../api/donationApi.js';
import { useRazorpay } from '../../hooks/useRazorpay.js';
import { formatCurrency } from '../../utils/formatCurrency.js';

const QUICK_AMOUNTS = [500, 1000, 2500, 5000];

export default function DonateModal({ open, onClose, campaign, onSuccess }) {
  const user = useSelector((s) => s.auth.user);
  const navigate = useNavigate();
  const openCheckout = useRazorpay();

  const [amount, setAmount] = useState(1000);
  const [message, setMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Generate a fresh idempotency key each time the modal opens.
  // useMemo with [open] re-computes whenever open flips true.
  const idempotencyKey = useMemo(
    () => (open ? crypto.randomUUID() : null),
    [open]
  );

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!user) {
      // Not logged in — bounce to login. Could also remember intent + redirect back.
      onClose();
      navigate('/login');
      return;
    }

    if (!Number.isFinite(amount) || amount < 1) {
      setError('Please enter a valid amount');
      return;
    }

    setLoading(true);
    try {
      // STEP 1: create order on backend.
      const { data: order } = await createOrder({
        campaignId: campaign._id,
        amount,
        message,
        isAnonymous,
        idempotencyKey,
      });

      // STEP 2: open Razorpay checkout.
      openCheckout({
        orderId: order.orderId,
        amount: order.amount,
        name: user.name,
        email: user.email,
        onSuccess: async (resp) => {
          try {
            // STEP 3: verify the signature server-side.
            await verifyPayment({
              razorpay_order_id: resp.razorpay_order_id,
              razorpay_payment_id: resp.razorpay_payment_id,
              razorpay_signature: resp.razorpay_signature,
            });
            onSuccess?.();
            onClose();
          } catch (err) {
            setError(err.response?.data?.message || 'Payment verification failed');
          } finally {
            setLoading(false);
          }
        },
        onFailure: (err) => {
          setError(err?.description || err?.reason || 'Payment cancelled');
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
      <h2 className="text-xl font-bold mb-1">Support this campaign</h2>
      <p className="text-sm text-gray-500 mb-4 truncate">{campaign?.title}</p>

      <form onSubmit={onSubmit} className="space-y-4">
        {/* Quick-pick chips */}
        <div className="flex flex-wrap gap-2">
          {QUICK_AMOUNTS.map((amt) => (
            <button
              type="button"
              key={amt}
              onClick={() => setAmount(amt)}
              className={`px-3 py-1 rounded border text-sm ${
                amount === amt
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-400'
              }`}
            >
              {formatCurrency(amt)}
            </button>
          ))}
        </div>

        <label className="block">
          <span className="text-sm font-medium text-gray-700">Amount (₹)</span>
          <input
            type="number"
            min={1}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            required
            className="mt-1 w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-gray-700">Message (optional)</span>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={280}
            rows={2}
            className="mt-1 w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
