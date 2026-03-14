import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { CertificateModel } from '../models/Certificate';
import { AppError } from '../middleware/errorHandler';
import path from 'path';
import fs from 'fs';

export class StudentController {
    static async uploadCertificate(req: AuthRequest, res: Response): Promise<void> {
        try {
            const studentId = req.user?.id;
            if (!studentId) {
                throw new AppError('User not authenticated', 401);
            }

            const { platform_id, category_id } = req.body;
            const file = req.file;

            if (!file) {
                throw new AppError('No file uploaded', 400);
            }

            if (!platform_id) {
                throw new AppError('Platform is required', 400);
            }

            // Create certificate record
            const certificate = await CertificateModel.create({
                student_id: studentId,
                platform_id: parseInt(platform_id),
                category_id: category_id ? parseInt(category_id) : undefined,
                file_path: file.path,
                file_name: file.originalname,
                file_type: file.mimetype,
                file_size: file.size,
            });

            res.status(201).json({
                message: 'Certificate uploaded successfully',
                certificate,
            });
        } catch (error) {
            if (error instanceof AppError) {
                res.status(error.statusCode).json({ error: error.message });
            } else {
                console.error('Upload error:', error);
                res.status(500).json({ error: 'Failed to upload certificate' });
            }
        }
    }

    static async getMyCertificates(req: AuthRequest, res: Response): Promise<void> {
        try {
            const studentId = req.user?.id;
            if (!studentId) {
                throw new AppError('User not authenticated', 401);
            }

            const certificates = await CertificateModel.findByStudentId(studentId);

            res.json({ certificates });
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch certificates' });
        }
    }

    static async getDashboard(req: AuthRequest, res: Response): Promise<void> {
        try {
            const studentId = req.user?.id;
            if (!studentId) {
                throw new AppError('User not authenticated', 401);
            }

            const stats = await CertificateModel.getStudentCertificateStats(studentId);
            const certificates = await CertificateModel.findByStudentId(studentId);

            res.json({
                stats,
                recent_certificates: certificates.slice(0, 5),
            });
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch dashboard data' });
        }
    }

    static async deleteCertificate(req: AuthRequest, res: Response): Promise<void> {
        try {
            const studentId = req.user?.id;
            if (!studentId) throw new AppError('User not authenticated', 401);

            const certificateId = req.params.id;
            if (!certificateId) throw new AppError('Certificate ID required', 400);

            // Find and delete the record
            const deletedCert = await CertificateModel.deleteByIdAndStudentId(certificateId, studentId);
            if (!deletedCert) {
                throw new AppError('Certificate not found or you do not have permission to delete it.', 404);
            }

            // Also delete the physical file
            try {
                if (deletedCert.file_path && fs.existsSync(deletedCert.file_path)) {
                    fs.unlinkSync(deletedCert.file_path);
                }
            } catch (err) {
                console.error("Failed to delete physical file:", err);
                // We still deleted the db record, so we continue
            }

            res.json({ message: 'Certificate deleted successfully' });
        } catch (error) {
            if (error instanceof AppError) {
                res.status(error.statusCode).json({ error: error.message });
            } else {
                res.status(500).json({ error: 'Failed to delete certificate' });
            }
        }
    }
}
