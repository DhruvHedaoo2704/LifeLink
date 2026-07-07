import http from 'http';
import mongoose from 'mongoose';
import config from './config/index.js';
import connectDB from './config/db.js';
import { initSocket } from './sockets/socketManager.js';
import logger from './config/logger.js';
import app from './app.js';

// Create HTTP server
const server = http.createServer(app);

// Initialize database connection
connectDB();

// Initialize real-time Socket.io channels
initSocket(server);

// Port listener
server.listen(config.port, () => {
  logger.info(`LifeLink Full-Stack Server running on port ${config.port} in ${config.env} mode`);
  logger.info(`API Interactive Swagger documentation available at http://localhost:${config.port}/api-docs`);
});

// Graceful shutdown handler
const shutdown = (signal) => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);
  
  // Stop receiving new requests
  server.close(async () => {
    logger.info('HTTP server stopped.');
    try {
      await mongoose.connection.close();
      logger.info('MongoDB database connection closed.');
      process.exit(0);
    } catch (err) {
      logger.error('Error during database connection teardown:', err);
      process.exit(1);
    }
  });

  // Set timeout to force shutdown if grace period expires
  setTimeout(() => {
    logger.error('Forceful shutdown triggered after grace timeout.');
    process.exit(1);
  }, 10000);
};

// Handle uncaught errors and rejections gracefully
process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled Rejection Error: ${err.message}`, { stack: err.stack });
  shutdown('unhandledRejection');
});

process.on('uncaughtException', (err) => {
  logger.error(`Uncaught Exception Error: ${err.message}`, { stack: err.stack });
  shutdown('uncaughtException');
});

// Process signal listeners
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
