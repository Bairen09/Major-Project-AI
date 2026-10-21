require('dotenv').config();

const mongoose = require('mongoose');
const app = require('./app');
const connectDB = require('./src/config/db');
const validateEnv = require('./src/config/env');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // Validate env vars before anything else
  validateEnv();

  try {
    await connectDB();
    
    // Start background jobs
    const { startJobs } = require('./src/jobs/subscriptionJobs');
    startJobs();

    const server = app.listen(PORT, () => {
      console.log(`
========================================
  LocalBoost AI — Backend
  Environment : ${process.env.NODE_ENV || 'development'}
  Port        : ${PORT}
  API Base    : ${process.env.NODE_ENV === 'production' ? '/api/v1' : `http://localhost:${PORT}/api/v1`}
  Health      : ${process.env.NODE_ENV === 'production' ? '/health' : `http://localhost:${PORT}/health`}
========================================
      `);
    });

    // Graceful shutdown
    const shutdown = async (signal) => {
      console.log(`\n${signal} received. Shutting down gracefully...`);
      server.close(async () => {
        console.log('HTTP server closed');
        await mongoose.connection.close();
        console.log('MongoDB connection closed');
        process.exit(0);
      });

      // Force shutdown after 10 seconds if graceful shutdown hangs
      setTimeout(() => {
        console.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason);
      shutdown('unhandledRejection');
    });

  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
