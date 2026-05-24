// authController.js — handles signup, login, "who am I" endpoints.
// Pattern in every controller:
//   1. Validate input
//   2. Talk to the model
//   3. Send a consistent JSON response
//
// asyncHandler wraps each function so thrown errors flow into errorHandler middleware
// instead of crashing the process.

import User from '../models/User.js';
import { generateToken } from '../utils/generateToken.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// Returns the safe-to-expose shape of a user (no password hash, no __v).
const publicUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  avatar: user.avatar,
  role: user.role,
  createdAt: user.createdAt,
});

// POST /api/auth/signup
export const signup = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // 1. Basic validation — keep it simple, full schemas can come later.
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'name, email, and password are required' });
  }
  if (password.length < 8) {
    return res.status(400).json({ message: 'password must be at least 8 characters' });
  }

  // 2. Reject duplicates explicitly so we return a friendly 409 instead of
  //    a Mongo E11000 error bubbling up.
  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(409).json({ message: 'email already in use' });
  }

  // 3. Create. The pre-save hook hashes the password automatically.
  const user = await User.create({ name, email, password });

  // 4. Issue token + return.
  const token = generateToken(user._id);
  res.status(201).json({ user: publicUser(user), token });
});

// POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'email and password are required' });
  }

  // Need .select('+password') because the field is hidden by default in the schema.
  const user = await User.findOne({ email }).select('+password');

  // IMPORTANT: return the SAME error message whether the email is wrong or the
  // password is wrong. Different messages let attackers enumerate valid emails.
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: 'invalid credentials' });
  }

  const token = generateToken(user._id);
  res.json({ user: publicUser(user), token });
});

// GET /api/auth/me — requires `protect` middleware to have set req.user.
export const me = asyncHandler(async (req, res) => {
  res.json({ user: publicUser(req.user) });
});
