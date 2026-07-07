import express from 'express';
import * as requestController from '../controllers/requestController.js';
import { protect, authorize } from '../middleware/auth.js';
import { apiLimiter } from '../middleware/rateLimiter.js';
import { validateBloodRequest } from '../middleware/validator.js';

const router = express.Router();

// Apply standard API rate limit
router.use(apiLimiter);

router.route('/')
  .post(protect, authorize('recipient', 'hospital', 'admin', 'donor', 'blood_bank'), validateBloodRequest, requestController.createRequest)
  .get(protect, requestController.getRequests);

router.route('/:requestId')
  .get(protect, requestController.getRequest);

router.post('/:requestId/respond', protect, authorize('donor', 'admin'), requestController.respondToRequest);
router.patch('/:requestId/status', protect, requestController.updateStatus);

export default router;
