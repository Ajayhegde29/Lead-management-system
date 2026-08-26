const cors = require('cors');
const express = require('express');
const helmet = require('helmet');
const env = require('./config/env');
const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const followUpRoutes = require('./routes/followUpRoutes');
const leadRoutes = require('./routes/leadRoutes');

const app = express();

app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || env.clientUrls.includes(origin)) return callback(null, true);
      const error = new Error('Origin is not allowed by CORS');
      error.statusCode = 403;
      return callback(error);
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '100kb' }));

app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/leads/:id/follow-ups', followUpRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'ok',
      service: 'lead-management-api',
      timestamp: new Date().toISOString(),
    },
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

app.use((err, _req, res, _next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      message: 'Request body must contain valid JSON',
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: `${err.path || 'Resource'} is invalid`,
    });
  }
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || 'field';
    return res.status(409).json({
      success: false,
      message: `A lead with this ${field} already exists`,
      errors: [{ field, message: `This ${field} is already in use` }],
    });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: Object.values(err.errors).map((item) => ({ field: item.path, message: item.message })),
    });
  }

  const status = err.statusCode || 500;
  const message =
    env.nodeEnv === 'production' && status === 500
      ? 'Internal server error'
      : err.message || 'Internal server error';

  res.status(status).json({
    success: false,
    message,
  });
});

module.exports = app;
