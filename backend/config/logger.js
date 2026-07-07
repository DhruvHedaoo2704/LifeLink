import winston from 'winston';
import config from './index.js';

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

const logger = winston.createLogger({
  level: config.logLevel,
  format: logFormat,
  defaultMeta: { service: 'lifelink-backend' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

// Configure Console transport: readable & colorized for dev; JSON for production stdout
if (config.env !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, service, ...rest }) => {
          const restString = Object.keys(rest).length ? ` ${JSON.stringify(rest)}` : '';
          return `[${timestamp}] ${level}: ${message}${restString}`;
        })
      )
    })
  );
} else {
  logger.add(
    new winston.transports.Console({
      format: logFormat
    })
  );
}

export default logger;
