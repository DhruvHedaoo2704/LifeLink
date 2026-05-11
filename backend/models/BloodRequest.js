const mongoose = require('mongoose');

const BloodRequestSchema = new mongoose.Schema({
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  bloodType: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    required: true,
  },
  urgency: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    required: true,
  },
  unitsNeeded: {
    type: Number,
    required: true,
  },
  hospital: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  contactPerson: {
    type: String,
    required: true,
  },
  contactPhone: {
    type: String,
    required: true,
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
    },
    address: {
      type: String,
      required: true,
    }
  },
  status: {
    type: String,
    enum: ['active', 'fulfilled', 'expired'],
    default: 'active',
  },
  responses: [{
    donorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['accepted', 'rejected', 'pending'], default: 'pending' },
    message: String,
    estimatedArrival: String,
    createdAt: { type: Date, default: Date.now }
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
  }
});

// Create 2dsphere index for geospatial queries
BloodRequestSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('BloodRequest', BloodRequestSchema);
