import express from 'express';
import { getAllExams, getExamById, createExam, submitExam, getExamResults, getUserExamResults } from '../controllers/examController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getAllExams);
router.get('/:id', getExamById);
router.post('/', protect, authorize('instructor', 'admin'), createExam);
router.post('/:examId/submit', protect, submitExam);
router.get('/:examId/results', protect, getExamResults);
router.get('/user/results', protect, getUserExamResults);

export default router;
