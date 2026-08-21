const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { signToken } = require('../middleware/jwtUtils');
const { protect, memoryUsers } = require('../middleware/authMiddleware');

const router = express.Router();

function isMongoConnected() {
  return mongoose.connection.readyState === 1;
}

/* ─── POST /api/auth/register ─────────────────────────────── */
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Full name is required.' });
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'A valid email address is required.' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanName = name.trim();

    // 1. Try MongoDB if connected
    if (isMongoConnected()) {
      try {
        const existing = await User.findOne({ email: cleanEmail });
        if (existing) {
          return res.status(409).json({ error: 'An account with this email already exists. Please sign in.' });
        }

        const user = await User.create({
          name: cleanName,
          email: cleanEmail,
          passwordHash: password,
        });

        const token = signToken(user._id.toString());
        return res.status(201).json({
          token,
          user: user.toSafeObject(),
        });
      } catch (dbErr) {
        console.warn('[Auth] Mongo register failed, using fallback store:', dbErr.message);
      }
    }

    // 2. Fallback memory store
    if (memoryUsers.has(cleanEmail)) {
      return res.status(409).json({ error: 'An account with this email already exists. Please sign in.' });
    }

    const hash = await bcrypt.hash(password, 12);
    const userId = 'mem_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const safeUser = {
      _id: userId,
      name: cleanName,
      email: cleanEmail,
      passwordHash: hash,
      rtiCount: 0,
      rightsCount: 0,
      citationsCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    memoryUsers.set(cleanEmail, safeUser);
    memoryUsers.set(userId, safeUser);

    const token = signToken(userId);
    const { passwordHash: _, ...userNoHash } = safeUser;
    return res.status(201).json({
      token,
      user: userNoHash,
    });
  } catch (err) {
    console.error('[Auth] Register error:', err.message);
    return res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

/* ─── POST /api/auth/login ────────────────────────────────── */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const cleanEmail = email.toLowerCase().trim();

    // 1. Try Mongo if connected
    if (isMongoConnected()) {
      try {
        const user = await User.findOne({ email: cleanEmail }).select('+passwordHash');
        if (user) {
          const isMatch = await user.comparePassword(password);
          if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password.' });
          }

          const token = signToken(user._id.toString());
          return res.status(200).json({
            token,
            user: user.toSafeObject(),
          });
        }
      } catch (dbErr) {
        console.warn('[Auth] Mongo login lookup failed, checking memory store:', dbErr.message);
      }
    }

    // 2. Check in-memory store
    const memUser = memoryUsers.get(cleanEmail);
    if (memUser) {
      const isMatch = await bcrypt.compare(password, memUser.passwordHash);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      const token = signToken(memUser._id);
      const { passwordHash: _, ...userNoHash } = memUser;
      return res.status(200).json({
        token,
        user: userNoHash,
      });
    }

    // 3. Frictionless auto-creation for demo if user attempts sign in with valid credentials
    const hash = await bcrypt.hash(password, 12);
    const userId = 'mem_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const displayName = cleanEmail.split('@')[0];
    const formattedName = displayName.charAt(0).toUpperCase() + displayName.slice(1);

    const newUser = {
      _id: userId,
      name: formattedName,
      email: cleanEmail,
      passwordHash: hash,
      rtiCount: 0,
      rightsCount: 0,
      citationsCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    memoryUsers.set(cleanEmail, newUser);
    memoryUsers.set(userId, newUser);

    const token = signToken(userId);
    const { passwordHash: _, ...userNoHash } = newUser;
    return res.status(200).json({
      token,
      user: userNoHash,
    });
  } catch (err) {
    console.error('[Auth] Login error:', err.message);
    return res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

/* ─── GET /api/auth/me ───────────────────────────────────── */
router.get('/me', protect, async (req, res) => {
  try {
    return res.status(200).json({ user: req.user });
  } catch (err) {
    return res.status(500).json({ error: 'Could not fetch user profile.' });
  }
});

/* ─── PATCH /api/auth/me ─────────────────────────────────── */
router.patch('/me', protect, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Name cannot be empty.' });
    }

    const cleanName = name.trim();

    if (isMongoConnected() && req.user._id && !String(req.user._id).startsWith('mem_')) {
      try {
        const doc = await User.findById(req.user._id);
        if (doc) {
          doc.name = cleanName;
          await doc.save();
          return res.status(200).json({ user: doc.toSafeObject() });
        }
      } catch (err) {
        console.warn('[Auth] Mongo patch name failed, updating memory user:', err.message);
      }
    }

    // Memory update
    req.user.name = cleanName;
    const memUser = memoryUsers.get(req.user.email);
    if (memUser) memUser.name = cleanName;

    return res.status(200).json({ user: req.user });
  } catch (err) {
    console.error('[Auth] Update profile error:', err.message);
    return res.status(500).json({ error: 'Could not update profile.' });
  }
});

/* ─── POST /api/auth/increment-stats ─────────────────────── */
router.post('/increment-stats', protect, async (req, res) => {
  try {
    const { field, citations } = req.body;
    const addCitations = citations && Number(citations) > 0 ? Number(citations) : 0;

    if (isMongoConnected() && req.user._id && !String(req.user._id).startsWith('mem_')) {
      try {
        const doc = await User.findById(req.user._id);
        if (doc) {
          if (field === 'rti') doc.rtiCount += 1;
          if (field === 'rights') doc.rightsCount += 1;
          doc.citationsCount += addCitations;
          await doc.save();
          return res.status(200).json({ user: doc.toSafeObject() });
        }
      } catch (err) {
        /* fallback below */
      }
    }

    if (field === 'rti') req.user.rtiCount = (req.user.rtiCount || 0) + 1;
    if (field === 'rights') req.user.rightsCount = (req.user.rightsCount || 0) + 1;
    req.user.citationsCount = (req.user.citationsCount || 0) + addCitations;

    return res.status(200).json({ user: req.user });
  } catch (err) {
    console.error('[Auth] Increment stats error:', err.message);
    return res.status(500).json({ error: 'Could not update stats.' });
  }
});

module.exports = router;
