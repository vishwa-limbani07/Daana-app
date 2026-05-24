// paymentService.js — pure functions for Razorpay operations.
// No req/res here. Callable from controllers, webhooks, jobs, tests.
//
// THE TWO BIG SECURITY MECHANICS LIVE HERE:
//
//   1. verifySignature (for checkout callback):
//        HMAC_SHA256(order_id + '|' + payment_id, RAZORPAY_KEY_SECRET)
//
//   2. verifyWebhookSignature (for Razorpay-pushed events):
//        HMAC_SHA256(raw_request_body, RAZORPAY_WEBHOOK_SECRET)
//
// Both use timingSafeEqual to prevent timing attacks. A naive `===` comparison
// returns as soon as bytes differ — an attacker measuring the response time
// could brute-force the signature one byte at a time. timingSafeEqual always
// compares the full length.

import crypto from 'crypto';
import razorpay from '../config/razorpay.js';

/**
 * Create a Razorpay order. Razorpay charges money against this order id later.
 * @param {number} amountInRupees
 * @param {string} receipt  - your internal reference (echoed back by Razorpay).
 */
export const createOrder = async (amountInRupees, receipt) => {
  return razorpay.orders.create({
    amount: Math.round(amountInRupees * 100), // Razorpay deals in paise
    currency: 'INR',
    receipt,
    payment_capture: 1, // auto-capture funds (don't hold them in authorized state)
  });
};

/**
 * Verify the signature returned by the Razorpay checkout success handler.
 * Returns true ONLY if Razorpay genuinely signed this payment.
 */
export const verifySignature = ({ orderId, paymentId, signature }) => {
  const body = `${orderId}|${paymentId}`;
  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');

  return safeEqualHex(expected, signature);
};

/**
 * Verify a webhook signature. Different secret, different body, same algorithm.
 * @param {Buffer} rawBody - raw request body (express.raw() gives this).
 * @param {string} signatureHeader - value of the x-razorpay-signature header.
 */
export const verifyWebhookSignature = (rawBody, signatureHeader) => {
  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest('hex');

  return safeEqualHex(expected, signatureHeader);
};

/**
 * Issue a refund. paymentId comes from the successful payment, NOT the order id.
 */
export const refundPayment = async (paymentId, amountInRupees) => {
  return razorpay.payments.refund(paymentId, {
    amount: Math.round(amountInRupees * 100),
  });
};

// --- internal ---

// timingSafeEqual throws if the buffers are different lengths, so we
// length-check first. Then compare in constant time.
const safeEqualHex = (expectedHex, providedHex) => {
  if (typeof providedHex !== 'string') return false;
  const expectedBuf = Buffer.from(expectedHex, 'hex');
  const providedBuf = Buffer.from(providedHex, 'hex');
  if (expectedBuf.length !== providedBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, providedBuf);
};
