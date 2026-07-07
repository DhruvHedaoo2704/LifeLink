import mongoose from 'mongoose';
import config from './index.js';
import logger from './logger.js';

const connectDB = async (retryCount = 5, delayMs = 1000) => {
  const options = {
    maxPoolSize: 10, // Maintain pool size
    serverSelectionTimeoutMS: 5000, // Selection timeout
    socketTimeoutMS: 45000 // Socket timeout
  };

  for (let i = 1; i <= retryCount; i++) {
    try {
      const conn = await mongoose.connect(config.mongodbUri, options);
      logger.info(`MongoDB Connected: ${conn.connection.host}`);
      return conn;
    } catch (error) {
      logger.error(`Error connecting to MongoDB (Attempt ${i}/${retryCount}): ${error.message}`);
      if (i === retryCount) {
        logger.error('Failed to connect to database after all retries. Terminating application.');
        process.exit(1);
      }
      logger.info(`Retrying MongoDB connection in ${delayMs / 1000}s...`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
      delayMs *= 2; // Exponential backoff
    }
  }
};

export default connectDB;
