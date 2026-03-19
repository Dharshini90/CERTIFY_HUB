import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.post('/register', AuthController.register);
router.post('/register-faculty', authenticateToken, (req, res, next) => {
    const user = (req as any).user;
    if (user?.role !== 'faculty' && user?.role !== 'hod') {
        res.status(403).json({ error: 'Only HOD or faculty admins can register other faculty' });
        return;
    }
    
    // If faculty, must be department admin
    if (user?.role === 'faculty' && !user?.is_department_admin) {
        res.status(403).json({ error: 'Only department admins can register other faculty' });
        return;
    }
    
    next();
}, AuthController.registerFaculty);
router.post('/login', AuthController.login);
router.get('/me', authenticateToken, AuthController.getCurrentUser);

// Profile routes (authenticated)
router.put('/profile', authenticateToken, AuthController.updateProfile as any);
router.put('/change-password', authenticateToken, AuthController.changePassword as any);

// Password reset (public)
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/reset-password', AuthController.resetPassword);

export default router;
