// webhookRoutes.js — /api/webhooks/*
// CRITICAL: this router uses express.raw() — NOT express.json().
// We need the raw request body to verify Razorpay's HMAC signature.
// If you JSON-parse the body first, the recomputed signature won't match.

import { Router } from 'express';
import express from 'express';
import { handleRazorpayWebhook } from '../controllers/webhookController.js';

const router = Router();

router.post(
  '/razorpay',
  express.raw({ type: 'application/json' }), // gives req.body as a Buffer
  handleRazorpayWebhook
);

export default router;
