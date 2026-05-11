const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const BloodRequest = require('../models/BloodRequest');

// @route   POST api/requests
// @desc    Create a new blood request
// @access  Private
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { bloodType, urgency, unitsNeeded, hospital, description, contactPerson, contactPhone, location } = req.body;

    const newRequest = new BloodRequest({
      recipientId: req.user.id,
      bloodType,
      urgency,
      unitsNeeded,
      hospital,
      description,
      contactPerson,
      contactPhone,
      location: {
        type: 'Point',
        coordinates: [location.lng, location.lat], // [longitude, latitude]
        address: location.address
      }
    });

    const request = await newRequest.save();
    res.json(request);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/requests
// @desc    Get all active requests (or requests created by user)
// @access  Private
router.get('/', authMiddleware, async (req, res) => {
  try {
    // Basic get all active requests. We can filter by query later
    const requests = await BloodRequest.find({ status: 'active' }).sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
