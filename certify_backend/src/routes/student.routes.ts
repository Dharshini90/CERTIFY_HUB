import { Router } from 'express';
import { StudentController } from '../controllers/studentController';
import { authenticateToken, requireRole } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

// All routes require student authentication
router.use(authenticateToken);
router.use(requireRole('student'));

router.post('/certificates/upload', upload.single('certificate'), StudentController.uploadCertificate);
router.get('/certificates', StudentController.getMyCertificates);
router.delete('/certificates/:id', StudentController.deleteCertificate);
router.get('/dashboard', StudentController.getDashboard);

export default router;
