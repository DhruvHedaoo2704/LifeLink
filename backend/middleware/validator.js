/**
 * Input Validation Middleware for LifeLink API Endpoints
 */

const EMAIL_REGEX = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
const MOBILE_REGEX = /^\+?[1-9]\d{1,14}$/; // E.164 phone format
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const URGENCY_LEVELS = ['low', 'medium', 'high', 'critical'];

export const validateRegister = (req, res, next) => {
  const { name, email, mobile, password, bloodGroup } = req.body;
  const errors = [];

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    errors.push({ field: 'name', message: 'Name must be at least 2 characters long.' });
  }

  if (!email || !EMAIL_REGEX.test(email)) {
    errors.push({ field: 'email', message: 'Please provide a valid email address.' });
  }

  if (!mobile || !MOBILE_REGEX.test(mobile)) {
    errors.push({ field: 'mobile', message: 'Please provide a valid mobile number in international format.' });
  }

  if (!password || password.length < 6) {
    errors.push({ field: 'password', message: 'Password must be at least 6 characters long.' });
  }

  if (!bloodGroup || !BLOOD_GROUPS.includes(bloodGroup)) {
    errors.push({ field: 'bloodGroup', message: `Blood group must be one of: ${BLOOD_GROUPS.join(', ')}` });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

export const validateLogin = (req, res, next) => {
  const { email, mobile, password } = req.body;
  const errors = [];

  if (!email && !mobile) {
    errors.push({ field: 'identifier', message: 'Please provide email or mobile number.' });
  }

  if (!password) {
    errors.push({ field: 'password', message: 'Please provide password.' });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

export const validateBloodRequest = (req, res, next) => {
  const { bloodType, urgency, unitsNeeded, location, hospital } = req.body;
  const errors = [];

  if (!bloodType || !BLOOD_GROUPS.includes(bloodType)) {
    errors.push({ field: 'bloodType', message: `Blood type must be one of: ${BLOOD_GROUPS.join(', ')}` });
  }

  if (!urgency || !URGENCY_LEVELS.includes(urgency)) {
    errors.push({ field: 'urgency', message: `Urgency must be one of: ${URGENCY_LEVELS.join(', ')}` });
  }

  if (!unitsNeeded || typeof unitsNeeded !== 'number' || unitsNeeded <= 0) {
    errors.push({ field: 'unitsNeeded', message: 'Units needed must be a positive number.' });
  }

  if (!hospital || typeof hospital !== 'string' || hospital.trim().length < 3) {
    errors.push({ field: 'hospital', message: 'Hospital name must be at least 3 characters.' });
  }

  if (!location || typeof location.lat !== 'number' || typeof location.lng !== 'number') {
    errors.push({ field: 'location', message: 'Valid geolocation coordinates (lat, lng) are required.' });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};
