require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');

const requestId = require('./src/middleware/requestId');
const errorHandler = require('./src/middleware/errorHandler');
const { globalLimiter } = require('./src/middleware/rateLimiter');
const v1Routes = require('./src/routes/v1/index');

const app = express();

// Trust proxy — required for rate limiting to work correctly on Render
app.set('trust proxy', 1);

// Request ID — first so every subsequent middleware has access to it
app.use(requestId);

// Security headers
app.use(helmet());

// CORS
const allowedOrigins = process.env.CLIENT_URL 
  ? process.env.CLIENT_URL.split(',').map(url => url.trim())
  : ['http://localhost:5173'];

app.use(
  cors({
    origin: function(origin, callback) {
      // allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
        return callback(null, true);
      }
      return callback(new Error('The CORS policy for this site does not allow access from the specified Origin.'), false);
    },
    credentials: true,
  })
);

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan(':method :url :status :response-time ms - requestId: :req[x-request-id]'));
} else if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined'));
}

// Compression
app.use(compression());

// Body parsing
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));


// Global rate limiter
app.use(globalLimiter);

// API routes
app.use('/api/v1', v1Routes);

// Render Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl,
    method: req.method,
    requestId: req.requestId,
  });
});

// Central error handler — must be last
app.use(errorHandler);

module.exports = app;