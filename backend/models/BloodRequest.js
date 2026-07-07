import mongoose from 'mongoose';

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

const DonorResponseSchema = new mongoose.Schema({
  donorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['yes', 'no', 'traveling', 'arrived', 'completed', 'cancelled'],
    default: 'yes'
  },
  estimatedArrival: {
    type: String // e.g., "15 mins"
  },
  message: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const StatusHistorySchema = new mongoose.Schema({
  status: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  note: String
}, { _id: false });

const BloodRequestSchema = new mongoose.Schema({
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bloodType: {
    type: String,
    required: true,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  urgency: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high', 'critical']
  },
  unitsNeeded: {
    type: Number,
    required: true,
    min: 1
  },
  unitsFulfilled: {
    type: Number,
    default: 0
  },
  location: {
    type: PointSchema,
    required: true,
    index: '2dsphere'
  },
  address: {
    type: String,
    required: true
  },
  hospital: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ['Created', 'Pending', 'Searching', 'Matched', 'Accepted', 'Donor Traveling', 'Donation Completed', 'Cancelled', 'Expired'],
    default: 'Created'
  },
  responses: [DonorResponseSchema],
  statusHistory: [StatusHistorySchema],
  expiresAt: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

// Middleware to record status history before saving
BloodRequestSchema.pre('save', function (next) {
  if (this.isModified('status')) {
    this.statusHistory.push({
      status: this.status,
      timestamp: new Date(),
      note: `Status updated to ${this.status}`
    });
  }
  next();
});

const BloodRequest = mongoose.model('BloodRequest', BloodRequestSchema);
export default BloodRequest;
