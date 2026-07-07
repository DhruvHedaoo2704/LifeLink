import mongoose from 'mongoose';

const UserActivitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  activityType: {
    type: String,
    required: true,
    enum: ['donation', 'request_created', 'badge_unlocked', 'profile_update', 'points_earned']
  },
  description: {
    type: String,
    required: true
  },
  referenceId: {
    type: mongoose.Schema.Types.ObjectId // ref to Donation or Request or Badge etc.
  },
  pointsEarned: {
    type: Number,
    default: 0
  }
}, {
  timestamps: { createdAt: 'timestamp', updatedAt: false }
});

const UserActivity = mongoose.model('UserActivity', UserActivitySchema);
export default UserActivity;
