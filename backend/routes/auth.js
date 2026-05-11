const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_development_only';

// @route   POST api/auth/register
// @desc    Register a new user
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, phone, bloodType, userType, location } = req.body;

    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user object
    const newUser = new User({
      email,
      googleId,
      name,
      bloodType: 'O+', 
      phone: '', 
      userType: userType || 'donor',
      location: {
        type: 'Point',
        coordinates: [0, 0],
        address: '',
      },
      privacy: {           // Add this block
        shareLocation: false,
        shareContact: true,
        receiveAlerts: true
      },
      badges: [],
      donationCount: 0,
      points: 0
    });
    // Hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    // Create JWT payload
    const payload = {
      user: {
        id: user.id
      }
    };

    jwt.sign(
      payload,
      JWT_SECRET,
      { expiresIn: 360000 }, // Expires in 100 hours for dev
      (err, token) => {
        if (err) throw err;
        
        // Return user data (excluding password)
        const userResponse = {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          bloodType: user.bloodType,
          userType: user.userType,
          location: {
            lat: user.location.coordinates[1],
            lng: user.location.coordinates[0],
            address: user.location.address
          }
        };
        
        res.json({ token, user: userResponse });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/auth/login
// @desc    Authenticate user & get token
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    // Create JWT payload
    const payload = {
      user: {
        id: user.id
      }
    };

    jwt.sign(
      payload,
      JWT_SECRET,
      { expiresIn: 360000 },
      (err, token) => {
        if (err) throw err;
        
        // Return user data (excluding password)
        const userResponse = {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          bloodType: user.bloodType,
          userType: user.userType,
          location: {
            lat: user.location.coordinates[1],
            lng: user.location.coordinates[0],
            address: user.location.address
          }
        };
        
        res.json({ token, user: userResponse });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/auth/google-login
// @desc    Authenticate user with Google OAuth token
router.post('/google-login', async (req, res) => {
  try {
    const { googleToken, userType } = req.body;

    if (!googleToken) {
      return res.status(400).json({ message: 'Google token is required' });
    }

    // Verify Google token (using google-auth-library)
    const { OAuth2Client } = require('google-auth-library');
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || 'your-google-client-id');

    let ticket;
    try {
      ticket = await client.verifyIdToken({
        idToken: googleToken,
        audience: process.env.GOOGLE_CLIENT_ID || 'your-google-client-id',
      });
    } catch (err) {
      console.error('Google token verification failed:', err);
      return res.status(401).json({ message: 'Invalid Google token' });
    }

    const payload = ticket.getPayload();
    const googleId = payload.sub;
    const email = payload.email;
    const name = payload.name;

    // Check if user exists by googleId
    let user = await User.findOne({ googleId });

    if (!user) {
      // Try to find by email
      user = await User.findOne({ email });

      if (user && !user.googleId) {
        // Link Google account to existing email
        user.googleId = googleId;
        await user.save();
      } else if (!user) {
        // Create new user with Google OAuth
        // For new Google users, we need to ask for blood type and location during registration
        // For now, we'll create a minimal user profile
        const newUser = new User({
          email,
          googleId,
          name,
          bloodType: 'O+', // Default blood type - user can update later
          phone: '', // Empty phone - user will add during onboarding
          userType: userType || 'donor',
          location: {
            type: 'Point',
            coordinates: [0, 0], // Default coordinates - user will update
            address: '', // User will add during onboarding
          }
        });

        user = await newUser.save();
      }
    }

    // Create JWT token
    const jwtPayload = {
      user: {
        id: user.id
      }
    };

    jwt.sign(
      jwtPayload,
      JWT_SECRET,
      { expiresIn: 360000 },
      (err, token) => {
        if (err) throw err;

        const userResponse = {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          bloodType: user.bloodType,
          userType: user.userType,
          location: {
            lat: user.location.coordinates[1],
            lng: user.location.coordinates[0],
            address: user.location.address
          }
        };

        res.json({ token, user: userResponse });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/auth/me
// @desc    Get current user (requires token middleware normally)
router.get('/me', async (req, res) => {
  // Normally use a middleware to verify token and get req.user.id
  // Placeholder for when middleware is added
  res.status(401).json({ message: 'No token provided' });
});

module.exports = router;
