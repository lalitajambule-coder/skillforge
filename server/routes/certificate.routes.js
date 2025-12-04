import express from 'express';
import { getUserCertificates, getCertificateById, createCertificate, verifyCertificate, getAllCertificates } from '../controllers/certificateController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getUserCertificates);
router.get('/all', getAllCertificates);
router.get('/:id', getCertificateById);
router.post('/', protect, authorize('instructor', 'admin'), createCertificate);
router.get('/verify/:credentialId', verifyCertificate);

export default router;
