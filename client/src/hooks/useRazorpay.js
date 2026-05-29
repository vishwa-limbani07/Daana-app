// useRazorpay.js — opens the Razorpay checkout modal.
// The checkout.js script is loaded once in index.html, so window.Razorpay
// is globally available.
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
      name: 'Daana',
      prefill: { name, email },
      theme: { color: '#4f46e5' },
      handler: function (response) {
        // response: { razorpay_order_id, razorpay_payment_id, razorpay_signature }
        onSuccess?.(response);
      },
      modal: {
        ondismiss: () => onFailure?.({ reason: 'dismissed' }),
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', (resp) => onFailure?.(resp.error));
    rzp.open();
  };

  return openCheckout;
};
