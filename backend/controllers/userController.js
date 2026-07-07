import User from '../models/User.js';
import Donation from '../models/Donation.js';
import UserActivity from '../models/UserActivity.js';
import AuditLog from '../models/AuditLog.js';
import Hospital from '../models/Hospital.js';
import BloodBank from '../models/BloodBank.js';

// Get Current Profile
export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const userObj = user.toObject({ virtuals: true });
    if (user.role === 'hospital') {
      let hospital = await Hospital.findOne({ userId: user._id });
      if (!hospital) {
        hospital = await Hospital.create({ userId: user._id, name: user.name });
      }
      userObj.bloodInventory = hospital.bloodInventory;
      userObj.hospitalBeds = hospital.bedsAvailable;
    } else if (user.role === 'blood_bank') {
      let bloodBank = await BloodBank.findOne({ userId: user._id });
      if (!bloodBank) {
        bloodBank = await BloodBank.create({ userId: user._id, name: user.name });
      }
      userObj.bloodInventory = bloodBank.bloodInventory;
    }

    res.status(200).json({
      success: true,
      data: userObj
    });
  } catch (error) {
    next(error);
  }
};

// Update Profile
export const updateProfile = async (req, res, next) => {
  try {
    const { name, email, mobile, dob, gender, bloodGroup, address, location, privacy, isAvailable, bloodInventory, bedsAvailable, emergencyContacts } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name;
    if (email) user.email = email;
    const phoneInput = mobile || req.body.phone;
    if (phoneInput) user.mobile = phoneInput;
    if (dob) user.dob = dob;
    if (gender) user.gender = gender;
    if (bloodGroup) user.bloodGroup = bloodGroup;
    if (address) user.address = address;
    if (privacy) user.privacy = { ...user.privacy.toObject(), ...privacy };
    if (isAvailable !== undefined) user.availabilityStatus = isAvailable;
    if (emergencyContacts) user.emergencyContacts = emergencyContacts;

    if (location?.lat && location?.lng) {
      user.currentLocation = {
        type: 'Point',
        coordinates: [location.lng, location.lat]
      };
      user.homeLocation = {
        type: 'Point',
        coordinates: [location.lng, location.lat]
      };
    }

    await user.save();

    if (user.role === 'hospital') {
      await Hospital.findOneAndUpdate(
        { userId: user._id },
        { 
          name: user.name,
          ...(bloodInventory ? { bloodInventory } : {}),
          ...(bedsAvailable !== undefined ? { bedsAvailable } : {})
        },
        { new: true, upsert: true }
      );
    } else if (user.role === 'blood_bank') {
      await BloodBank.findOneAndUpdate(
        { userId: user._id },
        { 
          name: user.name,
          ...(bloodInventory ? { bloodInventory } : {})
        },
        { new: true, upsert: true }
      );
    }

    const updatedUserObj = await User.findById(user._id);
    const userObj = updatedUserObj.toObject({ virtuals: true });
    
    if (user.role === 'hospital') {
      const hospital = await Hospital.findOne({ userId: user._id });
      if (hospital) {
        userObj.bloodInventory = hospital.bloodInventory;
        userObj.hospitalBeds = hospital.bedsAvailable;
      }
    } else if (user.role === 'blood_bank') {
      const bloodBank = await BloodBank.findOne({ userId: user._id });
      if (bloodBank) {
        userObj.bloodInventory = bloodBank.bloodInventory;
      }
    }

    // Log update
    await AuditLog.create({
      userId: user._id,
      action: 'UPDATE_PROFILE',
      details: { email: user.email },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: userObj
    });
  } catch (error) {
    next(error);
  }
};

// Get User Donation History
export const getDonations = async (req, res, next) => {
  try {
    const donations = await Donation.find({ donorId: req.user.id })
      .populate('recipientId', 'name email bloodGroup')
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      data: donations
    });
  } catch (error) {
    next(error);
  }
};

// Get User Activities Feed
export const getActivities = async (req, res, next) => {
  try {
    const activities = await UserActivity.find({ userId: req.user.id })
      .sort({ timestamp: -1 });

    res.status(200).json({
      success: true,
      data: activities
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Get Audit Logs
export const getAuditLogs = async (req, res, next) => {
  try {
    const logs = await AuditLog.find()
      .populate('userId', 'name email role')
      .sort({ timestamp: -1 })
      .limit(100);

    res.status(200).json({
      success: true,
      data: logs
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Get All Users (for dashboard table)
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Update User Verification Status
export const verifyUserProfile = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { status } = req.body; // 'pending' | 'verified' | 'unverified'

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.profileVerificationStatus = status;
    await user.save();

    res.status(200).json({
      success: true,
      message: `Profile verification status updated to ${status}`,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// Search active donors using 2dsphere indexing
export const searchDonors = async (req, res, next) => {
  try {
    const { bloodGroup, lat, lng, maxDistanceKm = 10 } = req.query;
    const query = {
      role: 'donor',
      availabilityStatus: true
    };

    if (bloodGroup && bloodGroup !== 'all') {
      query.bloodGroup = bloodGroup;
    }

    if (lat && lng) {
      const radiusMeters = parseFloat(maxDistanceKm) * 1000;
      const radiusRadians = radiusMeters / 6378100;
      query.currentLocation = {
        $geoWithin: {
          $centerSphere: [[parseFloat(lng), parseFloat(lat)], radiusRadians]
        }
      };
    }

    const donors = await User.find(query).select('name bloodGroup gender availabilityStatus profileVerificationStatus mobile currentLocation address lastActive totalDonations donationCount weight lastDonationDate');
    
    res.status(200).json({
      success: true,
      data: donors
    });
  } catch (error) {
    next(error);
  }
};
