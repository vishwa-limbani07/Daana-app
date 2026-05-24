// rateLimiter.js — throttles abusive clients.
// Donation endpoints are the most sensitive (they create Razorpay orders).
// We allow ~10 per minute per IP, which is plenty for legit users.

import rateLimit from 'express-rate-limit';

export const donationLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many donation attempts — please wait a minute.' },
});

// Looser limit for auth endpoints (signup/login)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
});
