const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { JWT_SECRET } = require('./jwtUtils');
const User = require('../models/User');

// In-memory user map fallback for resilient operation
const memoryUsers = new Map();

async function protect(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required. Please sign in.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    let user = null;

    // 1. Try Mongoose if connected and not a memory ID
    if (mongoose.connection.readyState === 1 && !String(decoded.id).startsWith('mem_')) {
      try {
        const doc = await User.findById(decoded.id);
        if (doc) user = doc.toSafeObject ? doc.toSafeObject() : doc;
      } catch (err) {
        console.warn('[Auth Middleware] Mongo findById failed, falling back to memory store:', err.message);
      }
    }

    // 2. Try in-memory store fallback
    if (!user) {
      const memUser = memoryUsers.get(decoded.id);
      if (memUser) {
        const { passwordHash: _, ...userNoHash } = memUser;
        user = userNoHash;
      }
    }

    if (!user) {
      return res.status(401).json({ error: 'User session invalid. Please sign in again.' });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Your session has expired. Please sign in again.' });
    }
    return res.status(401).json({ error: 'Invalid authentication token.' });
  }
}

module.exports = { protect, memoryUsers };
