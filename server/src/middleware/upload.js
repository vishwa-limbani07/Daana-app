// upload.js — Multer + Cloudinary storage for campaign cover images.
// Files never touch the local filesystem. They stream from the HTTP
// request straight to Cloudinary.
//
// Usage in a route:
//   router.post('/campaigns', protect, uploadCoverImage, createCampaign)
//   then inside the controller: req.file.path is the Cloudinary URL.

import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'crowdfund/campaigns',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1200, height: 630, crop: 'limit' }],
  },
});

export const uploadCoverImage = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
}).single('coverImage'); // field name in the multipart form
