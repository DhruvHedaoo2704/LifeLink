import express from 'express';
import * as notificationController from '../controllers/notificationController.js';
import { protect } from '../middleware/auth.js';
import { apiLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.use(apiLimiter);

router.route('/')
  .get(protect, notificationController.getNotifications);

router.patch('/:notificationId', protect, notificationController.markAsRead);
router.post('/mark-all-read', protect, notificationController.markAllAsRead);

export default router;
