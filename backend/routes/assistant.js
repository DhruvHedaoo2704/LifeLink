import express from 'express';
import * as assistantController from '../controllers/assistantController.js';
import { protect } from '../middleware/auth.js';
import { apiLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.use(apiLimiter);

router.route('/')
  .get(protect, assistantController.getChatHistory)
  .post(protect, assistantController.sendChatMessage);

export default router;
