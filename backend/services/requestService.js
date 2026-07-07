import BloodRequest from '../models/BloodRequest.js';
import User from '../models/User.js';
import Donation from '../models/Donation.js';
import UserActivity from '../models/UserActivity.js';
import { emitToUser, broadcast } from '../sockets/socketManager.js';
import logger from '../config/logger.js';

// Blood compatibility mapping: Who can donate to a specific blood group recipient
const DONOR_COMPATIBILITY = {
  'A+': ['A+', 'A-', 'O+', 'O-'],
  'A-': ['A-', 'O-'],
  'B+': ['B+', 'B-', 'O+', 'O-'],
  'B-': ['B-', 'O-'],
  'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
  'AB-': ['A-', 'B-', 'AB-', 'O-'],
  'O+': ['O+', 'O-'],
  'O-': ['O-']
};

// Create a new request
export const createBloodRequest = async (recipientId, data) => {
  const { bloodType, urgency, unitsNeeded, hospital, address, description, location } = data;

  // Set expiration times based on urgency
  let lifespanHours = 24; // Default low
  if (urgency === 'medium') lifespanHours = 12;
  if (urgency === 'high') lifespanHours = 6;
  if (urgency === 'critical') lifespanHours = 2;

  const expiresAt = new Date(Date.now() + lifespanHours * 60 * 60 * 1000);

  // Format geolocation point: [longitude, latitude]
  const geoPoint = location?.lat && location?.lng
    ? { type: 'Point', coordinates: [location.lng, location.lat] }
    : undefined;

  if (!geoPoint) {
    const error = new Error('Valid geolocation (lat, lng) is required for emergency requests.');
    error.statusCode = 400;
    throw error;
  }

  const bloodRequest = await BloodRequest.create({
    recipientId,
    bloodType,
    urgency,
    unitsNeeded,
    location: geoPoint,
    address,
    hospital,
    description,
    status: 'Created',
    expiresAt
  });

  logger.info(`Blood Request created: ${bloodRequest._id} for ${bloodType}`);

  // Find compatible donors within 10km (10000 meters)
  const compatibleDonors = DONOR_COMPATIBILITY[bloodType] || [];
  const nearbyDonors = await User.find({
    role: 'donor',
    availabilityStatus: true,
    bloodGroup: { $in: compatibleDonors },
    currentLocation: {
      $nearSphere: {
        $geometry: {
          type: 'Point',
          coordinates: geoPoint.coordinates
        },
        $maxDistance: 10000 // 10km in meters
      }
    }
  });

  // Notify each nearby donor in real time
  nearbyDonors.forEach((donor) => {
    emitToUser(donor._id, 'notification-created', {
      type: 'emergency',
      title: 'Emergency Blood Request Nearby!',
      message: `A compatible ${bloodType} blood request has been created at ${hospital} (${urgency} urgency).`,
      data: { requestId: bloodRequest._id }
    });
  });

  // Broadcast globally for live map/dashboard synch
  broadcast('request-created', {
    requestId: bloodRequest._id,
    bloodType,
    urgency,
    hospital,
    location: {
      lat: location.lat,
      lng: location.lng
    }
  });

  // Log user activity
  await UserActivity.create({
    userId: recipientId,
    activityType: 'request_created',
    description: `Created emergency request for ${unitsNeeded} units of ${bloodType} blood at ${hospital}`,
    referenceId: bloodRequest._id
  });

  return bloodRequest;
};

// Retrieve a single blood request by ID
export const getBloodRequestById = async (requestId) => {
  const request = await BloodRequest.findById(requestId)
    .populate('recipientId', 'name email mobile bloodGroup')
    .populate('responses.donorId', 'name email mobile bloodGroup currentLocation');
  return request;
};

// Fetch requests (with pagination & filters)
export const getBloodRequests = async (filters, pagination) => {
  const { bloodType, urgency, status, lat, lng, maxDistanceKm, recipientId } = filters;
  const { page = 1, limit = 10 } = pagination;

  const query = {};

  if (recipientId) query.recipientId = recipientId;
  if (bloodType && bloodType !== 'all') query.bloodType = bloodType;
  if (urgency) query.urgency = urgency;
  if (status) query.status = status;

  // Handle geospatial proximity filtering
  if (lat && lng) {
    const radiusMeters = (maxDistanceKm || 10) * 1000; // default 10km in meters
    const radiusRadians = radiusMeters / 6378100; // Earth's radius in meters is approx 6,378,100m
    query.location = {
      $geoWithin: {
        $centerSphere: [[parseFloat(lng), parseFloat(lat)], radiusRadians]
      }
    };
  }

  const skip = (page - 1) * limit;
  const requests = await BloodRequest.find(query)
    .populate('recipientId', 'name email mobile bloodGroup')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await BloodRequest.countDocuments(query);

  return { requests, total, page, pages: Math.ceil(total / limit) };
};

// Accept a blood request (Donor response)
export const respondToRequest = async (requestId, donorId, actionData) => {
  const { response, estimatedArrival, message } = actionData; // response: 'yes' | 'no'

  const request = await BloodRequest.findById(requestId);
  if (!request) {
    const error = new Error('Blood request not found');
    error.statusCode = 404;
    throw error;
  }

  if (request.status === 'Cancelled' || request.status === 'Expired' || request.status === 'Donation Completed') {
    const error = new Error(`Cannot respond. Request status is ${request.status}`);
    error.statusCode = 400;
    throw error;
  }

  // Remove previous response from this donor if it exists
  request.responses = request.responses.filter(r => r.donorId.toString() !== donorId.toString());

  if (response === 'yes') {
    request.responses.push({
      donorId,
      status: 'yes',
      estimatedArrival,
      message
    });

    // Move request status to 'Accepted' or 'Donor Traveling'
    if (request.status === 'Created' || request.status === 'Searching' || request.status === 'Pending') {
      request.status = 'Accepted';
    }

    // Trigger notification to Recipient
    emitToUser(request.recipientId, 'donor-accepted', {
      requestId,
      donorId,
      estimatedArrival,
      message
    });

    logger.info(`Donor ${donorId} accepted blood request ${requestId}`);
  } else {
    request.responses.push({
      donorId,
      status: 'no',
      message
    });
  }

  await request.save();

  // Broadcast update for dashboards
  broadcast('request-updated', {
    requestId: request._id,
    status: request.status,
    responsesCount: request.responses.filter(r => r.status === 'yes').length
  });

  return request;
};

// Update request status (e.g. traveling, completed, cancelled)
export const updateRequestStatus = async (requestId, userId, status, note = '') => {
  const request = await BloodRequest.findById(requestId);
  if (!request) {
    const error = new Error('Blood request not found');
    error.statusCode = 404;
    throw error;
  }

  // Check permissions: recipient or responding donor or admin
  const isRecipient = request.recipientId.toString() === userId.toString();
  const isDonor = request.responses.some(r => r.donorId.toString() === userId.toString() && r.status === 'yes');
  
  // Fetch user role
  const user = await User.findById(userId);
  const isAdmin = user && user.role === 'admin';

  if (!isRecipient && !isDonor && !isAdmin) {
    const error = new Error('Unauthorized to modify this request status');
    error.statusCode = 403;
    throw error;
  }

  request.status = status;
  await request.save();

  // If status is completed, create a Donation entry and award points to donor
  if (status === 'Donation Completed') {
    const acceptedResponse = request.responses.find(r => r.status === 'yes' || r.status === 'traveling');
    if (acceptedResponse) {
      const donor = await User.findById(acceptedResponse.donorId);
      if (donor) {
        // Log donation
        await Donation.create({
          donorId: donor._id,
          recipientId: request.recipientId,
          requestId: request._id,
          bloodType: request.bloodType,
          units: request.unitsNeeded,
          location: request.hospital,
          points: request.unitsNeeded * 100
        });

        // Award points and increment count
        donor.points += request.unitsNeeded * 100;
        donor.donationCount += 1;
        donor.lastDonationDate = new Date();
        
        // Check achievements: unlock badges
        if (donor.donationCount === 1 && !donor.badges.some(b => b.name === 'First Drop')) {
          donor.badges.push({ name: 'First Drop', description: 'Made your first donation', icon: 'droplet', rarity: 'common' });
        }
        if (donor.donationCount === 5 && !donor.badges.some(b => b.name === 'Life Saver')) {
          donor.badges.push({ name: 'Life Saver', description: 'Saved 5 lives through donations', icon: 'heart', rarity: 'rare' });
        }
        if (donor.donationCount === 10 && !donor.badges.some(b => b.name === 'Guardian Angel')) {
          donor.badges.push({ name: 'Guardian Angel', description: 'Made 10 emergency donations', icon: 'star', rarity: 'epic' });
        }
        await donor.save();

        // Log points activity
        await UserActivity.create({
          userId: donor._id,
          activityType: 'donation',
          description: `Completed donation of ${request.unitsNeeded} units of ${request.bloodType} blood. Unlocked points!`,
          referenceId: request._id,
          pointsEarned: request.unitsNeeded * 100
        });
      }
    }
  }

  // Notify recipient and donor
  emitToUser(request.recipientId, 'request-completed', { requestId, status });
  request.responses.forEach(r => {
    if (r.status === 'yes') {
      emitToUser(r.donorId, 'request-completed', { requestId, status });
    }
  });

  // Broadcast update
  broadcast('request-updated', {
    requestId: request._id,
    status
  });

  return request;
};
