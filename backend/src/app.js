const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const env = require('./config/env');
const { LOCAL_UPLOAD_ROOT } = require('./services/s3.service');
const { mongoSanitizeMiddleware, apiRateLimiter } = require('./middlewares/security.middleware');
const { notFoundHandler, globalErrorHandler } = require('./middlewares/error.middleware');
const { sendSuccess } = require('./utils/apiResponse');
const { getMessage } = require('./i18n/messages');

const authRoutes = require('./routes/auth.routes');
const contentRoutes = require('./routes/content.routes');
const productRoutes = require('./routes/product.routes');
const materialRoutes = require('./routes/material.routes');
const customDesignRoutes = require('./routes/customDesign.routes');
const orderRoutes = require('./routes/order.routes');
const adminRoutes = require('./routes/admin.routes');
const mediaRoutes = require('./routes/media.routes');

const app = express();

// Security & HTTP headers
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || env.CORS_ORIGIN === '*') {
        return callback(null, true);
      }
      const allowedList = env.CORS_ORIGIN.split(',').map((s) => s.trim());
      if (allowedList.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

if (env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Body parser with payload limit suitable for JSON & base64 preview images
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// Static serving for Smart Local Fallback uploads (/uploads/landing/..., /uploads/products/..., etc.)
app.use('/uploads', express.static(LOCAL_UPLOAD_ROOT));

// NoSQL Injection sanitization & Rate limiting
app.use(mongoSanitizeMiddleware);
app.use('/api', apiRateLimiter);

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  return sendSuccess(res, {
    statusCode: 200,
    message: getMessage('HEALTH_OK', {}, req),
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
    },
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/products', productRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/custom-designs', customDesignRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/media', mediaRoutes);

// 404 & Global Error Handler
app.use(notFoundHandler);
app.use(globalErrorHandler);

module.exports = app;
