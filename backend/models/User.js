import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { encrypt, decrypt } from '../utils/crypto.js';

// GeoJSON Point Schema
const PointSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Point'],
    required: true,
    default: 'Point'
  },
  coordinates: {
    type: [Number], // [longitude, latitude]
    required: true
  }
}, { _id: false });

const BadgeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String, required: true },
  rarity: { type: String, enum: ['common', 'rare', 'epic', 'legendary'], required: true },
  unlockedAt: { type: Date, default: Date.now }
}, { _id: false });

const PrivacySchema = new mongoose.Schema({
  shareLocation: { type: Boolean, default: true },
  shareContact: { type: Boolean, default: true },
  receiveAlerts: { type: Boolean, default: true }
}, { _id: false });

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    trim: true,
    lowercase: true
  },
  mobile: {
    type: String,
    required: [true, 'Please provide a mobile number'],
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
    select: false
  },
  dob: {
    type: Date
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other', 'Prefer Not to Say']
  },
  bloodGroup: {
    type: String,
    required: [true, 'Please provide a blood group'],
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  role: {
    type: String,
    enum: ['donor', 'recipient', 'hospital', 'blood_bank', 'admin'],
    default: 'donor'
  },
  
  // Authentication states
  refreshTokens: [String],
  loginAttempts: {
    type: Number,
    required: true,
    default: 0
  },
  lockUntil: {
    type: Date
  },
  lastLogin: {
    type: Date
  },
  accountStatus: {
    type: String,
    enum: ['active', 'locked', 'suspended'],
    default: 'active'
  },
  passwordUpdatedAt: {
    type: Date,
    default: Date.now
  },

  // Verification
  aadhaarNumberEncrypted: {
    type: String,
    select: false
  },
  governmentId: {
    type: String
  },
  profileVerificationStatus: {
    type: String,
    enum: ['unverified', 'pending', 'verified'],
    default: 'unverified'
  },
  mobileVerificationStatus: {
    type: String,
    enum: ['unverified', 'verified'],
    default: 'unverified'
  },
  emailVerificationStatus: {
    type: String,
    enum: ['unverified', 'verified'],
    default: 'unverified'
  },
  otpCode: {
    type: String,
    select: false
  },
  otpExpires: {
    type: Date,
    select: false
  },
  otpAttempts: {
    type: Number,
    default: 0,
    select: false
  },

  // Geolocation locations
  currentLocation: {
    type: PointSchema,
    index: '2dsphere'
  },
  homeLocation: {
    type: PointSchema,
    index: '2dsphere'
  },
  city: String,
  state: String,
  country: String,
  address: String,

  // Donor Statistics
  weight: Number,
  lastDonationDate: Date,
  donationCount: {
    type: Number,
    default: 0
  },
  points: {
    type: Number,
    default: 0
  },
  availabilityStatus: {
    type: Boolean,
    default: true
  },
  medicalEligibility: {
    type: Boolean,
    default: true
  },

  // Achievements
  badges: [BadgeSchema],

  // Emergency Contacts
  emergencyContacts: {
    primaryContact: {
      name: String,
      phone: String,
      relation: String
    },
    secondaryContact: {
      name: String,
      phone: String,
      relation: String
    }
  },

  // Privacy Config
  privacy: {
    type: PrivacySchema,
    default: () => ({})
  },

  lastActive: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for phone (alias for mobile)
UserSchema.virtual('phone').get(function () {
  return this.mobile;
});

// Virtual for isAvailable (alias for availabilityStatus)
UserSchema.virtual('isAvailable').get(function () {
  return this.availabilityStatus;
});

// Virtual for isDonor
UserSchema.virtual('isDonor').get(function () {
  return this.role === 'donor';
});

// Virtual for isRecipient
UserSchema.virtual('isRecipient').get(function () {
  return this.role === 'recipient';
});

// Virtual for location matching frontend format: { lat, lng, address }
UserSchema.virtual('location').get(function () {
  if (this.currentLocation && this.currentLocation.coordinates) {
    return {
      lat: this.currentLocation.coordinates[1],
      lng: this.currentLocation.coordinates[0],
      address: this.address || ''
    };
  }
  return { lat: 0, lng: 0, address: this.address || '' };
});


// Middleware: Encrypt password before save
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    this.passwordUpdatedAt = Date.now();
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Aadhaar Virtual field for easy get/set
UserSchema.virtual('aadhaarNumber')
  .get(function () {
    return decrypt(this.aadhaarNumberEncrypted);
  })
  .set(function (value) {
    this.aadhaarNumberEncrypted = encrypt(value);
  });

// Check if locked
UserSchema.methods.isLocked = function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

const User = mongoose.model('User', UserSchema);
export default User;
