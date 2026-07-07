import express from 'express';
import * as userController from '../controllers/userController.js';
import { protect, authorize } from '../middleware/auth.js';
import { apiLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.use(apiLimiter);

router.route('/profile')
  .get(protect, userController.getProfile)
  .put(protect, userController.updateProfile);

router.get('/donations', protect, userController.getDonations);
router.get('/activities', protect, userController.getActivities);
router.get('/search-donors', protect, userController.searchDonors);

// Admin-only endpoints
router.get('/audit-logs', protect, authorize('admin'), userController.getAuditLogs);
router.get('/all-users', protect, authorize('admin'), userController.getAllUsers);
router.patch('/:userId/verify', protect, authorize('admin'), userController.verifyUserProfile);

export default router;
