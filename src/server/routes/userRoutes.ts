import express from 'express';
import {
  updateUserProfile,
  getUserPreferences,
  updateUserPreferences
} from '../controllers/userController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.put('/profile', authenticate, updateUserProfile);

router.get('/preferences', authenticate, getUserPreferences);
router.put('/preferences', authenticate, updateUserPreferences);

export default router; 