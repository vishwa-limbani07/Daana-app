// authMiddleware.js — gates protected routes.
//
// Pipeline on a protected request:
//   request -> express.json() -> protect -> rateLimiter (optional) -> controller
//
// `protect` does four things:
//   1. Pull the JWT from the "Authorization: Bearer <token>" header.
//   2. Verify the signature (throws if tampered or expired).
//   3. Look up the user in MongoDB so we have the LATEST data (role, etc.).
//      Important: don't trust the token's payload alone — the user might
//      have been banned since the token was issued.
//   4. Attach the user document to req.user so controllers can read it.

import User from '../models/User.js';
import { verifyToken } from '../utils/generateToken.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'not authenticated' });
  }

  const token = header.slice(7); // strip "Bearer "
  let decoded;
  try {
    decoded = verifyToken(token);
  } catch {
    return res.status(401).json({ message: 'invalid or expired token' });
  }

  const user = await User.findById(decoded.userId);
  if (!user) {
    return res.status(401).json({ message: 'user no longer exists' });
  }

  req.user = user;
  next();
});

// Use AFTER protect:  router.delete('/foo', protect, requireAdmin, handler)
export const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'admin access required' });
  }
  next();
};
