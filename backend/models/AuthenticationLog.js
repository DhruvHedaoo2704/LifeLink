import mongoose from 'mongoose';

const AuthenticationLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  email: {
    type: String,
    required: true,
    index: true
  },
  action: {
    type: String, // 'login_success', 'login_failure', 'logout', 'lockout', 'password_reset'
    required: true
  },
  status: {
    type: String,
    enum: ['success', 'failure'],
    required: true
  },
  reason: String, // e.g., 'invalid_credentials', 'account_locked'
  ipAddress: String,
  userAgent: String
}, {
  timestamps: { createdAt: 'timestamp', updatedAt: false }
});

const AuthenticationLog = mongoose.model('AuthenticationLog', AuthenticationLogSchema);
export default AuthenticationLog;
