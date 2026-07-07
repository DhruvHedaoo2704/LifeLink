import jwt from 'jsonwebtoken';
import axios from 'axios';
import crypto from 'crypto';
import User from '../models/User.js';
import AuthenticationLog from '../models/AuthenticationLog.js';
import AuditLog from '../models/AuditLog.js';
import logger from '../config/logger.js';
import config from '../config/index.js';

// Helper to generate access & refresh tokens
export const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user._id, role: user.role },
    config.jwtSecret,
    { expiresIn: config.jwtExpire }
  );

  const refreshToken = jwt.sign(
    { id: user._id },
    config.jwtRefreshSecret,
    { expiresIn: config.jwtRefreshExpire }
  );

  return { accessToken, refreshToken };
};

// Register user
export const registerUser = async (userData, ip, ua) => {
  const { email, mobile, password, name, bloodGroup, role, dob, gender, location } = userData;

  // Check unique constraints
  const existingUser = await User.findOne({ $or: [{ email }, { mobile }] });
  if (existingUser) {
    const error = new Error('User with this email or mobile number already exists');
    error.statusCode = 400;
    throw error;
  }

  // Format GeoJSON location Point: [longitude, latitude]
  const geoPoint = location?.lat && location?.lng 
    ? { type: 'Point', coordinates: [location.lng, location.lat] } 
    : undefined;

  const user = await User.create({
    name,
    email,
    mobile,
    password,
    bloodGroup,
    role: role || 'donor',
    dob,
    gender,
    address: location?.address,
    currentLocation: geoPoint,
    homeLocation: geoPoint,
    joinDate: new Date(),
    badges: [
      {
        name: 'First Drop',
        description: 'Made your first donation',
        icon: 'droplet',
        rarity: 'common'
      }
    ]
  });

  // Log registration
  await AuditLog.create({
    userId: user._id,
    action: 'USER_REGISTRATION',
    details: { email: user.email, role: user.role },
    ipAddress: ip,
    userAgent: ua
  });

  logger.info(`User registered successfully: ${user.email} [${user._id}]`);

  // Generate tokens
  const tokens = generateTokens(user);
  user.refreshTokens.push(tokens.refreshToken);
  await user.save();

  // Exclude password from return
  user.password = undefined;
  return { user, ...tokens };
};

// Login user
export const loginUser = async (identifier, password, ip, ua) => {
  // Find by email OR mobile
  const user = await User.findOne({
    $or: [{ email: identifier.toLowerCase() }, { mobile: identifier }]
  }).select('+password');

  if (!user) {
    await AuthenticationLog.create({
      email: identifier,
      action: 'login_failure',
      status: 'failure',
      reason: 'user_not_found',
      ipAddress: ip,
      userAgent: ua
    });
    const error = new Error('Invalid credentials');
    error.statusCode = 400;
    throw error;
  }

  // Check lockout
  if (user.isLocked()) {
    await AuthenticationLog.create({
      userId: user._id,
      email: user.email,
      action: 'login_failure',
      status: 'failure',
      reason: 'account_locked',
      ipAddress: ip,
      userAgent: ua
    });
    const error = new Error(`Your account is locked until ${user.lockUntil.toLocaleTimeString()}. Too many failed attempts.`);
    error.statusCode = 400;
    throw error;
  }

  // Check password
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    // Increment login attempts
    user.loginAttempts += 1;
    if (user.loginAttempts >= 5) {
      // Lock for 1 hour
      user.lockUntil = Date.now() + 60 * 60 * 1000;
      user.accountStatus = 'locked';
      logger.warn(`Account locked: ${user.email} due to 5 consecutive failures.`);
    }
    await user.save();

    await AuthenticationLog.create({
      userId: user._id,
      email: user.email,
      action: 'login_failure',
      status: 'failure',
      reason: 'invalid_password',
      ipAddress: ip,
      userAgent: ua
    });

    const error = new Error('Invalid credentials');
    error.statusCode = 400;
    throw error;
  }

  // Reset login attempts on success
  user.loginAttempts = 0;
  user.lockUntil = undefined;
  user.accountStatus = 'active';
  user.lastLogin = Date.now();

  const tokens = generateTokens(user);
  user.refreshTokens.push(tokens.refreshToken);
  await user.save();

  // Log successful login
  await AuthenticationLog.create({
    userId: user._id,
    email: user.email,
    action: 'login_success',
    status: 'success',
    ipAddress: ip,
    userAgent: ua
  });

  logger.info(`User logged in: ${user.email}`);

  // Exclude password
  user.password = undefined;
  return { user, ...tokens };
};

// Refresh token
export const refreshUserToken = async (refreshToken) => {
  if (!refreshToken) {
    const error = new Error('Refresh token is required');
    error.statusCode = 400;
    throw error;
  }

  try {
    const decoded = jwt.verify(refreshToken, config.jwtRefreshSecret);
    const user = await User.findById(decoded.id);

    if (!user || !user.refreshTokens.includes(refreshToken)) {
      const error = new Error('Invalid refresh token');
      error.statusCode = 400;
      throw error;
    }

    // Generate new tokens
    const tokens = generateTokens(user);

    // Swap old refresh token for new one
    user.refreshTokens = user.refreshTokens.filter(t => t !== refreshToken);
    user.refreshTokens.push(tokens.refreshToken);
    await user.save();

    return tokens;
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
};

// Logout user
export const logoutUser = async (refreshToken) => {
  if (refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, config.jwtRefreshSecret);
      const user = await User.findById(decoded.id);
      if (user) {
        user.refreshTokens = user.refreshTokens.filter(t => t !== refreshToken);
        await user.save();
      }
    } catch (err) {
      // Token decoding failed, just ignore
    }
  }
  return true;
};

// Google Login Verification & User Mapping
export const googleLogin = async (idToken, ip, ua) => {
  if (!idToken) {
    const error = new Error('Google ID token is required');
    error.statusCode = 400;
    throw error;
  }

  // 1. Verify token with Google's endpoint
  let googlePayload;
  try {
    const response = await axios.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
    googlePayload = response.data;
  } catch (err) {
    const error = new Error('Invalid Google ID token');
    error.statusCode = 400;
    throw error;
  }

  // Verify audience if client id is configured
  if (config.googleClientId && googlePayload.aud !== config.googleClientId) {
    const error = new Error('Google token audience mismatch');
    error.statusCode = 400;
    throw error;
  }

  const { email, name, sub: googleId, email_verified } = googlePayload;

  if (!email) {
    const error = new Error('No email found in Google profile');
    error.statusCode = 400;
    throw error;
  }

  // 2. Find or create user
  let user = await User.findOne({ email: email.toLowerCase() });

  if (!user) {
    // Register new user
    // Generate placeholder unique mobile
    const placeholderMobile = `google_${googleId}`;
    
    // Generate secure random password
    const placeholderPassword = crypto.randomBytes(16).toString('hex');

    user = await User.create({
      name: name || 'Google User',
      email: email.toLowerCase(),
      mobile: placeholderMobile,
      password: placeholderPassword,
      bloodGroup: 'O+', // default placeholder
      role: 'donor',
      emailVerificationStatus: email_verified ? 'verified' : 'unverified',
      joinDate: new Date(),
      badges: [
        {
          name: 'First Drop',
          description: 'Made your first donation',
          icon: 'droplet',
          rarity: 'common'
        }
      ]
    });

    // Log registration
    await AuditLog.create({
      userId: user._id,
      action: 'USER_REGISTRATION',
      details: { email: user.email, role: user.role, provider: 'google' },
      ipAddress: ip,
      userAgent: ua
    });

    logger.info(`User registered via Google: ${user.email} [${user._id}]`);
  } else {
    // User exists. Update verification status if Google says it's verified
    if (email_verified && user.emailVerificationStatus !== 'verified') {
      user.emailVerificationStatus = 'verified';
      await user.save();
    }
  }

  // Check lockout or suspend status
  if (user.accountStatus === 'suspended') {
    const error = new Error('Your account has been suspended.');
    error.statusCode = 403;
    throw error;
  }

  // Reset login attempts
  user.loginAttempts = 0;
  user.lockUntil = undefined;
  user.lastLogin = Date.now();

  const tokens = generateTokens(user);
  user.refreshTokens.push(tokens.refreshToken);
  await user.save();

  // Log successful login
  await AuthenticationLog.create({
    userId: user._id,
    email: user.email,
    action: 'login_success_google',
    status: 'success',
    ipAddress: ip,
    userAgent: ua
  });

  logger.info(`User logged in via Google: ${user.email}`);

  user.password = undefined;
  return { user, ...tokens };
};
