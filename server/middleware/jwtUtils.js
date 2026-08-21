const jwt = require('jsonwebtoken');
const User = require('../models/User');

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required for authentication');
  }
  return secret;
}

function signToken(userId) {
  return jwt.sign({ id: userId }, getJwtSecret(), {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

module.exports = { signToken, getJwtSecret };
