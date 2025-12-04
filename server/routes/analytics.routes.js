import express from 'express';
import { getUserAnalytics, getPlatformStats, getProgressChart } from '../controllers/analyticsController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/user', protect, getUserAnalytics);
router.get('/progress', protect, getProgressChart);
router.get('/platform', protect, authorize('admin'), getPlatformStats);

export default router;
