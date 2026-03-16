import { Router } from 'express';
import { FacultyController } from '../controllers/facultyController';
import { AdminController } from '../controllers/adminController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

// Departments & Sections — public reads (students need these for dropdowns)
router.get('/departments', AdminController.getDepartments as any);
router.get('/sections', AdminController.getSections as any);

// All remaining routes require faculty authentication
router.use(authenticateToken);
router.use(requireRole('faculty'));

// Student management
router.get('/students', FacultyController.getStudents);
router.delete('/students/:studentId', FacultyController.deleteStudent);
router.get('/students/:studentId/certificates', FacultyController.getStudentCertificates);
router.get('/certificates/:certificateId/file', FacultyController.getCertificateFile);
router.put('/certificates/:certificateId/verify', FacultyController.verifyCertificate);
router.get('/download/student/:studentId', FacultyController.downloadStudentCertificates);
router.post('/download/bulk', FacultyController.downloadBulkCertificates);
router.post('/export', FacultyController.exportReport);

// Department management
router.post('/departments', AdminController.createDepartment as any);
router.put('/departments/:id', AdminController.updateDepartment as any);
router.delete('/departments/:id', AdminController.deleteDepartment as any);

// Section management
router.post('/sections', AdminController.createSection as any);
router.put('/sections/:id', AdminController.updateSection as any);
router.delete('/sections/:id', AdminController.deleteSection as any);

// Platform management
router.post('/platforms', AdminController.createPlatform as any);
router.put('/platforms/:id', AdminController.updatePlatform as any);
router.delete('/platforms/:id', AdminController.deletePlatform as any);
router.post('/platforms/:platformId/categories', AdminController.createCategory as any);
router.delete('/platforms/categories/:categoryId', AdminController.deleteCategory as any);

// Faculty management
router.get('/faculty-list', AdminController.getFacultyList as any);
router.put('/faculty-list/:id', AdminController.updateFaculty as any);
router.delete('/faculty-list/:id', AdminController.deleteFaculty as any);

export default router;
