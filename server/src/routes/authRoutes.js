// authRoutes.js — /api/auth/*
//
// Order of middleware on a route matters:
//   authLimiter -> controller   (rate limit runs first, then handler)
//
// /me is protected — only authenticated users can call it.

import { Router } from 'express';
import { signup, login, me } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.post('/signup', authLimiter, signup);
router.post('/login', authLimiter, login);
router.get('/me', protect, me);

export default router;
