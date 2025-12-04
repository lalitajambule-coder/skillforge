import express from 'express';
import { getAllAchievements, getUserAchievements, getAchievementById, createAchievement, unlockAchievement, updateProgress } from '../controllers/achievementController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getAllAchievements);
router.get('/user', protect, getUserAchievements);
router.get('/:id', getAchievementById);
router.post('/', protect, authorize('admin'), createAchievement);
router.post('/:achievementId/unlock', protect, unlockAchievement);
router.put('/:achievementId/progress', protect, updateProgress);

export default router;
