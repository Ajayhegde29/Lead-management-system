const jwt = require('jsonwebtoken');
const env = require('../config/env');
const User = require('../models/User');

function createToken(user) {
  if (!env.jwtSecret || env.jwtSecret.startsWith('replace-with-')) {
    const error = new Error('JWT_SECRET must be set to a secure value');
    error.statusCode = 500;
    throw error;
  }

  return jwt.sign(
    { sub: user.id, username: user.username, role: user.role },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  );
}

async function login(req, res, next) {
  try {
    const username = typeof req.body.username === 'string' ? req.body.username.trim().toLowerCase() : '';
    const { password } = req.body;

    if (!username || typeof password !== 'string' || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required',
      });
    }

    const user = await User.findOne({ username }).select('+password');
    const passwordMatches = user && (await user.comparePassword(password));

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password',
      });
    }

    const token = createToken(user);

    return res.status(200).json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
        },
      },
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = { login };
