// useRazorpay.js — opens the Razorpay checkout modal.
//
// The Razorpay modal is rendered by their SDK (checkout.js loaded in index.html),
// so the layout / fonts / illustrations are not ours to design. What IS ours:
//
//   - theme.color  → accent color (currently emerald to match the app)
//   - name         → merchant name shown top
//   - description  → tagline shown below the name
//   - image        → logo image (must be hosted at a public HTTPS URL)
//   - modal.confirm_close → "Are you sure?" prompt before closing
//   - modal.escape → allow ESC to close (default true)
//   - prefill      → pre-fill user info
//   - retry        → enable retry on payment failure
//
// Usage:
//   const openCheckout = useRazorpay();
//   openCheckout({ orderId, amount, name, email, onSuccess, onFailure });

export const useRazorpay = () => {
  const openCheckout = ({
    orderId,
    amount,           // in rupees
    name,
    email,
    onSuccess,
    onFailure,
  }) => {
    if (!window.Razorpay) {
      console.error('Razorpay script not loaded');
      return;
    }

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: Math.round(amount * 100), // paise
      currency: 'INR',
      order_id: orderId,

      // ── Branding ──
      name: 'Daana',
      description: 'Crowdfunding for ideas that matter',
      // image: 'https://daana-app.vercel.app/favicon.svg',
      // ↑ Razorpay needs a publicly reachable HTTPS URL.
      // Uncomment once deployed to Vercel.

      // ── Pre-filled info ──
      prefill: {
        name: name || '',
        email: email || '',
      },

      // ── Theme ──
      theme: {
        color: '#059669',          // emerald-600 — matches the rest of the app
        backdrop_color: '#0f172a', // slate-900 backdrop (subtle, focuses the modal)
      },

      // ── Modal behavior ──
      modal: {
        // Show a confirm dialog if the user tries to close mid-payment
        confirm_close: true,
        escape: true,
        animation: true,
        ondismiss: () => onFailure?.({ reason: 'dismissed' }),
      },

      // ── Allow Razorpay to retry failed payments inline ──
      retry: { enabled: true, max_count: 3 },

      // ── Success ──
      handler: function (response) {
        // response: { razorpay_order_id, razorpay_payment_id, razorpay_signature }
        onSuccess?.(response);
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', (resp) => onFailure?.(resp.error));
    rzp.open();
  };

  return openCheckout;
};
