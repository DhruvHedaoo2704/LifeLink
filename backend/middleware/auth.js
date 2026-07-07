import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import config from '../config/index.js';

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this resource. No token provided.'
    });
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret);

    // Retrieve user and select password (excluded by default) or other private details if needed
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists.'
      });
    }

    if (user.accountStatus === 'locked' || user.accountStatus === 'suspended') {
      return res.status(403).json({
        success: false,
        message: `Your account is ${user.accountStatus}. Please contact support.`
      });
    }

    // Update lastActive timestamp asynchronously
    user.lastActive = new Date();
    await user.save({ validateBeforeSave: false });

    req.user = user;
    next();
  } catch (error) {
    console.error('JWT verification error:', error);
    
    // Express returns a specific status if token is expired
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        code: 'TOKEN_EXPIRED',
        message: 'Your token has expired. Please login again or refresh token.'
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Not authorized. Invalid token.'
    });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user?.role}' is not authorized to access this route.`
      });
    }
    next();
  };
};
