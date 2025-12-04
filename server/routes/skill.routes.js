import express from 'express';
import { getAllSkills, getSkillById, createSkill, updateSkill, deleteSkill } from '../controllers/skillController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getAllSkills);
router.get('/:id', getSkillById);
router.post('/', protect, authorize('instructor', 'admin'), createSkill);
router.put('/:id', protect, authorize('instructor', 'admin'), updateSkill);
router.delete('/:id', protect, authorize('instructor', 'admin'), deleteSkill);

export default router;
