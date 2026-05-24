// generateToken.js — wraps jsonwebtoken.sign for consistency.
//
// A JWT has 3 parts joined by dots: header.payload.signature
//   - header:    { alg: 'HS256', typ: 'JWT' }                    (base64)
//   - payload:   our data — e.g. { userId, iat, exp }            (base64)
//   - signature: HMAC-SHA256(header + '.' + payload, JWT_SECRET) (base64)
//
// The signature is what makes the token tamper-proof. Anyone CAN read the
// payload (base64 is not encryption), but they can't forge a new one
// without the JWT_SECRET. So: never put sensitive data in the payload.

import jwt from 'jsonwebtoken';

export const generateToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

// Used by the auth middleware. Throws if invalid/expired.
export const verifyToken = (token) =>
  jwt.verify(token, process.env.JWT_SECRET);
