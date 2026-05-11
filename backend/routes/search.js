const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const User = require('../models/User');

// @route   GET api/search/donors
// @desc    Search for donors based on location, blood type, etc.
// @access  Private
router.get('/donors', authMiddleware, async (req, res) => {
  try {
    const { lat, lng, distance = 50, bloodType } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ message: 'Latitude and longitude are required' });
    }

    // Build query
    const query = {
      userType: 'donor',
      isAvailable: true,
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)] // [longitude, latitude]
          },
          $maxDistance: parseInt(distance) * 1000 // Convert km to meters
        }
      }
    };

    if (bloodType) {
      query.bloodType = bloodType;
    }

    // Find donors
    const donors = await User.find(query).select('-password'); // Exclude password from results

    res.json(donors);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
