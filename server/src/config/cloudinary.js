// cloudinary.js — image hosting for campaign cover images.
// We use multer-storage-cloudinary so uploaded files go straight from the
// HTTP request to Cloudinary, never touching local disk.

import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;
