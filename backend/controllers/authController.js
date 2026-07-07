import * as authService from '../services/authService.js';
import User from '../models/User.js';
import { sendEmailVerification, sendPasswordResetEmail, sendMobileOTP } from '../services/notificationService.js';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import config from '../config/index.js';

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: config.isProduction,
  sameSite: config.isProduction ? 'none' : 'lax', // Required for cross-domain cookie sending in production
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
};

// Register
export const register = async (req, res, next) => {
  try {
    const ip = req.ip;
    const ua = req.headers['user-agent'];
    const result = await authService.registerUser(req.body, ip, ua);

    // Set refresh token in cookie
    res.cookie('refreshToken', result.refreshToken, REFRESH_COOKIE_OPTIONS);

    // Send email verification link in background
    const verificationToken = jwt.sign(
      { id: result.user._id, type: 'email-verification' },
      config.jwtSecret,
      { expiresIn: '24h' }
    );
    sendEmailVerification(result.user.email, verificationToken).catch(console.error);

    res.status(201).json({
      success: true,
      message: 'Registration successful! Verification email sent.',
      data: {
        user: result.user,
        accessToken: result.accessToken
      }
    });
  } catch (error) {
    next(error);
  }
};

// Login
export const login = async (req, res, next) => {
  try {
    const { email, mobile, password } = req.body;
    const identifier = email || mobile;

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email/mobile and password'
      });
    }

    const ip = req.ip;
    const ua = req.headers['user-agent'];
    const result = await authService.loginUser(identifier, password, ip, ua);

    // Set refresh token in cookie
    res.cookie('refreshToken', result.refreshToken, REFRESH_COOKIE_OPTIONS);

    res.status(200).json({
      success: true,
      message: 'Login successful!',
      data: {
        user: result.user,
        accessToken: result.accessToken
      }
    });
  } catch (error) {
    next(error);
  }
};

// Logout
export const logout = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
    await authService.logoutUser(refreshToken);

    // Clear cookie
    res.clearCookie('refreshToken', REFRESH_COOKIE_OPTIONS);

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Refresh Token
export const refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken || req.body.refreshToken;
    const result = await authService.refreshUserToken(token);

    // Set new refresh token in cookie
    res.cookie('refreshToken', result.refreshToken, REFRESH_COOKIE_OPTIONS);

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        accessToken: result.accessToken
      }
    });
  } catch (error) {
    next(error);
  }
};

// Forgot Password
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No user found with this email'
      });
    }

    // Generate 10-minute token via signed JWT
    const resetToken = jwt.sign(
      { id: user._id, type: 'password-reset' },
      config.jwtSecret,
      { expiresIn: '10m' }
    );

    // Send email in background
    sendPasswordResetEmail(user.email, resetToken).catch(console.error);

    res.status(200).json({
      success: true,
      message: 'Password reset link sent to your email.'
    });
  } catch (error) {
    next(error);
  }
};

// Reset Password
export const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({
        success: false,
        message: 'Token and new password are required'
      });
    }

    const decoded = jwt.verify(token, config.jwtSecret);
    if (decoded.type !== 'password-reset') {
      return res.status(400).json({
        success: false,
        message: 'Invalid reset token type'
      });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Save new password
    user.password = password;
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successful. Please login.'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Reset token is invalid or has expired'
    });
  }
};

// Verify Email
export const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.query;
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Verification token is required'
      });
    }

    const decoded = jwt.verify(token, config.jwtSecret);
    if (decoded.type !== 'email-verification') {
      return res.status(400).json({
        success: false,
        message: 'Invalid token type'
      });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.emailVerificationStatus = 'verified';
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Email verified successfully!'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Verification token is invalid or has expired'
    });
  }
};

// Send Mobile Verification OTP
export const sendMobileVerificationOTP = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Generate secure random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Save to user object
    user.otpCode = otp;
    user.otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiration
    user.otpAttempts = 0;
    await user.save({ validateBeforeSave: false });

    // Send SMS
    await sendMobileOTP(user.mobile, otp);

    res.status(200).json({
      success: true,
      message: 'Verification code sent successfully!'
    });
  } catch (error) {
    next(error);
  }
};

// Verify Mobile
export const verifyMobile = async (req, res, next) => {
  try {
    const { otp } = req.body;
    if (!otp) {
      return res.status(400).json({
        success: false,
        message: 'Verification code is required'
      });
    }

    // Retrieve user including OTP fields
    const user = await User.findById(req.user.id).select('+otpCode +otpExpires +otpAttempts');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if code exists & is not expired
    if (!user.otpCode || !user.otpExpires || user.otpExpires < Date.now()) {
      return res.status(400).json({
        success: false,
        message: 'Verification code has expired or is invalid. Please request a new one.'
      });
    }

    // Check limit of attempts
    if (user.otpAttempts >= 3) {
      return res.status(400).json({
        success: false,
        message: 'Too many failed verification attempts. Please request a new code.'
      });
    }

    // Match OTP
    if (user.otpCode !== otp) {
      user.otpAttempts += 1;
      await user.save({ validateBeforeSave: false });
      
      const attemptsRemaining = Math.max(0, 3 - user.otpAttempts);
      return res.status(400).json({
        success: false,
        message: `Invalid verification code. ${attemptsRemaining} attempts remaining.`
      });
    }

    // Verification Success
    user.mobileVerificationStatus = 'verified';
    user.otpCode = undefined;
    user.otpExpires = undefined;
    user.otpAttempts = undefined;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: 'Mobile number verified successfully!'
    });
  } catch (error) {
    next(error);
  }
};

// Google Login Controller
export const googleLogin = async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Google ID token is required'
      });
    }

    const ip = req.ip;
    const ua = req.headers['user-agent'];
    const result = await authService.googleLogin(token, ip, ua);

    // Set refresh token in cookie
    res.cookie('refreshToken', result.refreshToken, REFRESH_COOKIE_OPTIONS);

    res.status(200).json({
      success: true,
      message: 'Google login successful!',
      data: {
        user: result.user,
        accessToken: result.accessToken
      }
    });
  } catch (error) {
    next(error);
  }
};
