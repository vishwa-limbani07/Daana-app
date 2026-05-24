// razorpay.js — initializes the Razorpay SDK lazily.
//
// We use a Proxy so the module ALWAYS exports something — even if env vars
// are missing. The actual `new Razorpay(...)` call is deferred until a
// payment endpoint actually runs. That way the server can boot for
// development without Razorpay keys; only the donation endpoints fail.

import Razorpay from 'razorpay';

let instance = null;

const getInstance = () => {
  if (instance) return instance;
  const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } = process.env;
  if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
    throw new Error(
      'Razorpay keys are not configured. Add RAZORPAY_KEY_ID and ' +
      'RAZORPAY_KEY_SECRET to server/.env. ' +
      'Get test keys at https://dashboard.razorpay.com/app/keys'
    );
  }
  instance = new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET,
  });
  return instance;
};

// Proxy forwards every property access to the real Razorpay instance,
// constructing it on first use. Callers can do `razorpay.orders.create(...)`
// as if it were a real instance.
const razorpay = new Proxy({}, {
  get(_target, prop) {
    return getInstance()[prop];
  },
});

export default razorpay;
