const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  settings: {
    shareLocation: {
      type: Boolean,
      default: true,
    },
    emailNotifications: {
      type: Boolean,
      default: true,
    }
  },
  privacy: {
    shareLocation: {
      type: Boolean,
      default: false,
    },
    showPhone: {
      type: Boolean,
      default: true,
    },
    shareContact: {
      type: Boolean,
      default: true,
    },
    receiveAlerts: {
      type: Boolean,
      default: true,
    }
  },
  password: {
    type: String,
    required: false, // Optional for OAuth users
  },
  googleId: {
    type: String,
    required: false,
    unique: true,
    sparse: true, // Allow multiple null values
  },
  name: {
    type: String,
    required: true,
  },
  bloodType: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  userType: {
    type: String,
    enum: ['donor', 'recipient'],
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
  isAvailable: {
    type: Boolean,
    default: true,
  },
  donationCount: {
    type: Number,
    default: 0,
  },
  points: {
    type: Number,
    default: 0,
  },
  badges: {         
    type: [String],
    default: [],
  },
  joinDate: {
    type: Date,
    default: Date.now,
  }
});

// Create 2dsphere index for geospatial queries
UserSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('User', UserSchema);
