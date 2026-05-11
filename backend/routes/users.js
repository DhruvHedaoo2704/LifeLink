const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const User = require('../models/User');

// @route   GET api/users/profile
// @desc    Get current user profile (Dashboard / Profile view)
// @access  Private
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', authMiddleware, async (req, res) => {
  const { name, phone, bloodType, location, isAvailable } = req.body;

  // Build profile object
  const profileFields = {};
  if (name) profileFields.name = name;
  if (phone) profileFields.phone = phone;
  if (bloodType) profileFields.bloodType = bloodType;
  if (isAvailable !== undefined) profileFields.isAvailable = isAvailable;
  
  if (location && location.lat && location.lng) {
    profileFields.location = {
      type: 'Point',
      coordinates: [location.lng, location.lat],
      address: location.address || ''
    };
  }

  try {
    let user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: profileFields },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
