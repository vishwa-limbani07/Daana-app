// campaignRoutes.js — /api/campaigns/*
//
// Middleware order on a write route:
//   protect            -> req.user is set
//   uploadCoverImage   -> req.file is set (multer streams to Cloudinary)
//   controller
//
// IMPORTANT: protect must run BEFORE multer. Otherwise we'd be uploading
// images to Cloudinary for unauthenticated requests we're about to reject —
// wastes bandwidth and storage.

import { Router } from 'express';
import {
  listCampaigns,
  getCampaignById,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  listMyCampaigns,
} from '../controllers/campaignController.js';
import { protect } from '../middleware/authMiddleware.js';
import { uploadCoverImage } from '../middleware/upload.js';
import { tierByCampaignRouter } from './tierRoutes.js';

const router = Router();

// Nested tiers — handles GET/POST /api/campaigns/:id/tiers
router.use('/:campaignId/tiers', tierByCampaignRouter);

// Public reads
router.get('/', listCampaigns);

// Authenticated read — "my campaigns" — must come BEFORE /:id
// or Express will treat 'mine' as an id and call getCampaignById.
router.get('/mine', protect, listMyCampaigns);

router.get('/:id', getCampaignById);

// Protected writes
router.post('/', protect, uploadCoverImage, createCampaign);
router.patch('/:id', protect, updateCampaign);
router.delete('/:id', protect, deleteCampaign);

export default router;
