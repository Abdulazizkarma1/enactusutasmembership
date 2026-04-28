const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

const COOKIE_NAME = 'jwt';
const MS_PER_DAY = 24 * 60 * 60 * 1000;

function cookieOptions() {
  const isProd = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'lax' : 'lax',
    path: '/',
    maxAge: parseJwtMaxAgeMs(),
  };
}

function parseJwtMaxAgeMs() {
  const raw = process.env.JWT_EXPIRES_IN || '7d';
  const match = String(raw).match(/^(\d+)([dhms])$/i);
  if (!match) return 7 * MS_PER_DAY;
  const n = parseInt(match[1], 10);
  const u = match[2].toLowerCase();
  if (u === 'd') return n * MS_PER_DAY;
  if (u === 'h') return n * 60 * 60 * 1000;
  if (u === 'm') return n * 60 * 1000;
  if (u === 's') return n * 1000;
  return 7 * MS_PER_DAY;
}

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('JWT_SECRET is not configured');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const normalized = String(email).trim().toLowerCase();
    const admin = await Admin.findOne({ email: normalized });
    if (!admin || !(await bcrypt.compare(password, admin.passwordHash))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
    const token = jwt.sign({ adminId: admin._id.toString() }, secret, { expiresIn });

    res.cookie(COOKIE_NAME, token, cookieOptions());

    return res.json({
      success: true,
      admin: {
        id: admin._id.toString(),
        username: admin.username,
        email: admin.email,
      },
    });
  } catch (err) {
    console.error('login error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
  return res.json({ success: true });
});

router.get('/me', authMiddleware, (req, res) => {
  return res.json({
    id: req.admin._id.toString(),
    username: req.admin.username,
    email: req.admin.email,
  });
});

module.exports = router;
