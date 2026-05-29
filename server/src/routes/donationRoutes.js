// donationRoutes.js — /api/donations/*
// Rate-limited because these endpoints create real money flows.

import { Router } from 'express';
import {
  createOrder,
  verifyPayment,
  listMyDonations,
  listCampaignDonations,
} from '../controllers/donationController.js';
import { protect } from '../middleware/authMiddleware.js';
import { donationLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.post('/order', protect, donationLimiter, createOrder);
router.post('/verify', protect, donationLimiter, verifyPayment);
router.get('/mine', protect, listMyDonations);
router.get('/campaign/:id', listCampaignDonations);

export default router;
