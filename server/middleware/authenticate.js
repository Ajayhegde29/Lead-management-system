const jwt = require('jsonwebtoken');
const env = require('../config/env');
const User = require('../models/User');

async function authenticate(req, res, next) {
  try {
    const authorization = req.headers.authorization || '';
    const [scheme, token] = authorization.split(' ');

    if (scheme !== 'Bearer' || !token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication token is required',
      });
    }

    if (!env.jwtSecret || env.jwtSecret.startsWith('replace-with-')) {
      const error = new Error('JWT_SECRET must be set to a secure value');
      error.statusCode = 500;
      throw error;
    }

    const payload = jwt.verify(token, env.jwtSecret);
    const user = await User.findById(payload.sub);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication token is no longer valid',
      });
    }

    req.user = user;
    return next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Authentication token is invalid or expired',
      });
    }

    return next(error);
  }
}

module.exports = { authenticate };
