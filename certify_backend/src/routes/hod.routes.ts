import { Router } from 'express';
import { HodController } from '../controllers/hodController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

// All HOD routes require authentication and HOD role
router.use(authenticateToken);
router.use(requireRole('hod'));

router.get('/stats', HodController.getDashboardStats);
router.get('/platform-adoption', HodController.getPlatformAdoption);
router.get('/completion-rate', HodController.getCompletionRate);
router.get('/ledger', HodController.getDepartmentLedger);
router.post('/bulk-download', HodController.downloadBulkCertificates);
router.post('/export-report', HodController.exportReport);

export default router;
