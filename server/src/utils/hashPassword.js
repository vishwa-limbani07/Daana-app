// hashPassword.js — the ONLY file that imports bcrypt.
// Centralizing this means we can change the cost factor or swap to argon2
// later by editing one file.
//
// 10 salt rounds = ~100ms per hash on modern hardware. Strong enough.
// Going higher (12+) hurts login latency without meaningful security gain
// for a portfolio project. Production apps sometimes go 12.

import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

export const hashPassword = (plain) => bcrypt.hash(plain, SALT_ROUNDS);

export const comparePassword = (plain, hash) => bcrypt.compare(plain, hash);
