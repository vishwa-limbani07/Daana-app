// User.js — Mongoose schema for app users.
// A user can be either a donor, a creator (runs campaigns), or both.
//
// IMPORTANT mechanics:
//   1. `password` has select:false — it's hidden from queries by default.
//      To fetch it (for login compare), call .select('+password').
//   2. The pre-save hook hashes the password BEFORE it ever hits MongoDB.
//      This means you can never accidentally store a plaintext password,
//      no matter where in the codebase User.save() is called.
//   3. comparePassword is an instance method, so in controllers you can do:
//          const user = await User.findOne({ email }).select('+password');
//          const ok = await user.comparePassword(plain);

import mongoose from 'mongoose';
import { hashPassword, comparePassword } from '../utils/hashPassword.js';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, minlength: 8, select: false },
    avatar: { type: String, default: '' },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
  },
  { timestamps: true }
);

// Pre-save hook: runs BEFORE every .save() call.
// `this.isModified('password')` ensures we only hash when password changed
// (so updating other fields like `name` doesn't re-hash the existing hash).
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await hashPassword(this.password);
  next();
});

// Instance method — bound to the document, so `this.password` is the hash.
userSchema.methods.comparePassword = function (plain) {
  return comparePassword(plain, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
