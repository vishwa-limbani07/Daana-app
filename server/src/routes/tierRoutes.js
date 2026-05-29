// tierRoutes.js
//
// Two route groups for tiers:
//   /api/campaigns/:campaignId/tiers   — list / create (campaign-scoped)
//   /api/tiers/:id                     — delete (direct, since tier id is unique)
//
// We mount BOTH from this file via two different routers exported below,
// to keep tier code together while the URL shape stays clean.

import { Router } from 'express';
import { listTiers, createTier, deleteTier } from '../controllers/tierController.js';
import { protect } from '../middleware/authMiddleware.js';

// /api/campaigns/:campaignId/tiers/*
export const tierByCampaignRouter = Router({ mergeParams: true }); // mergeParams: inherit :campaignId
tierByCampaignRouter.get('/', listTiers);
tierByCampaignRouter.post('/', protect, createTier);

// /api/tiers/*
export const tierRouter = Router();
tierRouter.delete('/:id', protect, deleteTier);
