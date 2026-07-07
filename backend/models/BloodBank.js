import mongoose from 'mongoose';

const BloodInventorySchema = new mongoose.Schema({
  'A+': { type: Number, default: 0 },
  'A-': { type: Number, default: 0 },
  'B+': { type: Number, default: 0 },
  'B-': { type: Number, default: 0 },
  'AB+': { type: Number, default: 0 },
  'AB-': { type: Number, default: 0 },
  'O+': { type: Number, default: 0 },
  'O-': { type: Number, default: 0 }
}, { _id: false });

const BloodBankSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  bloodInventory: {
    type: BloodInventorySchema,
    default: () => ({})
  },
  isVerified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const BloodBank = mongoose.model('BloodBank', BloodBankSchema);
export default BloodBank;
