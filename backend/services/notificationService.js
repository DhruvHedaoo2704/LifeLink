import nodemailer from 'nodemailer';
import twilio from 'twilio';
import Notification from '../models/Notification.js';
import { emitToUser } from '../sockets/socketManager.js';
import logger from '../config/logger.js';
import config from '../config/index.js';

// Lazy initialized transporter
let transporter = null;
const getTransporter = () => {
  if (!transporter) {
    if (config.emailProvider === 'smtp' && config.smtpHost) {
      transporter = nodemailer.createTransport({
        host: config.smtpHost,
        port: config.smtpPort,
        secure: config.smtpPort === 465, // true for port 465, false for others
        auth: {
          user: config.smtpUser,
          pass: config.smtpPass
        }
      });
      logger.info('SMTP Mail Transporter initialized.');
    }
  }
  return transporter;
};

// Lazy initialized Twilio client
let twilioClient = null;
const getTwilioClient = () => {
  if (!twilioClient) {
    if (config.twilioEnabled) {
      twilioClient = twilio(config.twilioAccountSid, config.twilioAuthToken);
      logger.info('Twilio SMS Client initialized.');
    }
  }
  return twilioClient;
};

// Central notification engine dispatcher
export const sendNotification = async (userId, data) => {
  const { title, message, type = 'info' } = data;

  try {
    // 1. Persist to MongoDB
    const notification = await Notification.create({
      userId,
      title,
      message,
      type,
      status: 'sent'
    });

    // 2. Dispatch real-time Socket.io packet to user if online
    emitToUser(userId, 'notification-created', {
      id: notification._id,
      title,
      message,
      type,
      createdAt: notification.createdAt
    });

    logger.info(`Notification sent to user ${userId}: "${title}"`);
    return notification;
  } catch (err) {
    logger.error(`Failed to dispatch notification to user ${userId}: ${err.message}`);
    return null;
  }
};

// Dispatch email alerts (supports SMTP)
export const sendEmailNotification = async (email, subject, text, htmlContent = '') => {
  logger.info(`[Email Dispatch] Attempting to send email to ${email}...`);
  
  const client = getTransporter();
  if (client) {
    try {
      const info = await client.sendMail({
        from: config.emailFrom,
        to: email,
        subject,
        text,
        html: htmlContent
      });
      logger.info(`[Email Dispatch Success] Email sent: ${info.messageId}`);
      return true;
    } catch (err) {
      logger.error(`[Email Dispatch Error] Failed to send email via SMTP: ${err.message}`);
      if (config.env !== 'production') {
        logger.info(`[SMTP Fallback Log] To: ${email} | Subject: ${subject}\nBody: ${text}`);
      }
      return false;
    }
  } else {
    logger.warn(`[SMTP Transporter Mock] SMTP is not configured or disabled (EMAIL_PROVIDER=${config.emailProvider}). Logging content:`);
    logger.info(`[Mock SMTP Log] To: ${email} | Subject: ${subject}`);
    logger.info(`Body: ${text}`);
    return true;
  }
};

// Dispatch SMS alerts (supports Twilio)
export const sendSMSNotification = async (phone, message) => {
  logger.info(`[SMS Dispatch] Attempting to send SMS to ${phone}...`);
  
  const client = getTwilioClient();
  if (client) {
    try {
      const res = await client.messages.create({
        body: message,
        from: config.twilioPhoneNumber,
        to: phone
      });
      logger.info(`[SMS Dispatch Success] SMS sent via Twilio, SID: ${res.sid}`);
      return true;
    } catch (err) {
      logger.error(`[SMS Dispatch Error] Failed to send SMS via Twilio: ${err.message}`);
      if (config.env !== 'production') {
        logger.info(`[Twilio Fallback Log] Phone: ${phone} | Message: ${message}`);
      }
      return false;
    }
  } else {
    logger.warn(`[Twilio SMS Mock] Twilio credentials not fully set. Logging content:`);
    logger.info(`[Mock SMS Log] To: ${phone} | Message: ${message}`);
    return true;
  }
};

// Custom: Send Email Verification Link
export const sendEmailVerification = async (email, token) => {
  const verifyUrl = `${config.frontendUrl}/verify-email?token=${token}`;
  const text = `Please verify your LifeLink account by opening the following link: ${verifyUrl}`;
  const html = `<h3>Welcome to LifeLink!</h3><p>Click <a href="${verifyUrl}">here</a> to verify your email address.</p>`;
  
  return await sendEmailNotification(email, 'Verify your LifeLink Account', text, html);
};

// Custom: Send Password Reset Link
export const sendPasswordResetEmail = async (email, token) => {
  const resetUrl = `${config.frontendUrl}/reset-password?token=${token}`;
  const text = `You are receiving this email because you requested a password reset. Reset link: ${resetUrl}`;
  const html = `<p>Please click the following link to reset your password within 10 minutes: <a href="${resetUrl}">Reset Password</a></p>`;
  
  return await sendEmailNotification(email, 'LifeLink Password Reset Request', text, html);
};

// Custom: Send OTP to Mobile
export const sendMobileOTP = async (phone, otp) => {
  const message = `Your LifeLink mobile verification code is: ${otp}. Do not share this code.`;
  return await sendSMSNotification(phone, message);
};
