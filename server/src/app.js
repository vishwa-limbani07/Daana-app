// app.js — Express application setup.
// This file ONLY configures the app (middleware + routes).
// It does NOT start the server (that's server.js's job).
//
// CRITICAL middleware ordering:
//   1. cors
//   2. webhook routes (with express.raw() inside)   ← BEFORE json parsing
//   3. express.json()
//   4. feature routes
//   5. 404
//   6. errorHandler (always last)
//
// Why webhooks come before json: Razorpay's HMAC is computed over the RAW
// request bytes. If express.json() runs first, the body is replaced with a
// parsed object and we can no longer recompute the HMAC. We'd reject every
// valid webhook.

import express from 'express';
import cors from 'cors';

import authRoutes from './routes/authRoutes.js';
import campaignRoutes from './routes/campaignRoutes.js';
import donationRoutes from './routes/donationRoutes.js';
import webhookRoutes from './routes/webhookRoutes.js';
import { tierRouter } from './routes/tierRoutes.js';

import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// --- Global middleware ---
// CLIENT_URL can be a single URL or a comma-separated list, so you can
// allow both a local dev URL and a custom production domain without code changes.
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

// Any *.vercel.app subdomain is also allowed automatically — covers our
// production Vercel deployment AND any preview deployments (PRs etc.)
// without having to update CLIENT_URL each time.
const VERCEL_PATTERN = /^https:\/\/[a-z0-9-]+\.vercel\.app$/i;

const isAllowedOrigin = (origin) =>
  allowedOrigins.includes(origin) || VERCEL_PATTERN.test(origin);

app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no Origin header (curl, server-to-server, mobile).
    if (!origin) return cb(null, true);
    if (isAllowedOrigin(origin)) return cb(null, true);
    cb(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));

// Webhook FIRST (raw body inside).
app.use('/api/webhooks', webhookRoutes);

// Now JSON parsing for everything else.
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// --- Health check ---
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// --- Feature routes ---
app.use('/api/auth', authRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/tiers', tierRouter);

// --- 404 fallback ---
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// --- Global error handler (must be last) ---
app.use(errorHandler);

export default app;
