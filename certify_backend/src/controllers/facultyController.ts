import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { UserModel } from '../models/User';
import { CertificateModel } from '../models/Certificate';
import { FileService } from '../services/fileService';
import { ExportService } from '../services/exportService';
import { AppError } from '../middleware/errorHandler';
import { VerificationStatus, ExportFormat } from '../types';
import fs from 'fs';
import path from 'path';

export class FacultyController {
    static async getStudents(req: AuthRequest, res: Response): Promise<void> {
        try {
            const { year, department, section, search, page, limit } = req.query;

            const filters = {
                year: year as string,
                department: department as string,
                section: section as string,
                search: search as string,
                page: page ? parseInt(page as string) : 1,
                limit: limit ? parseInt(limit as string) : 20,
            };

            const result = await UserModel.findStudents(filters);

            res.json(result);
        } catch (error) {
            console.error('Get students error:', error);
            res.status(500).json({ error: 'Failed to fetch students' });
        }
    }

    static async getStudentCertificates(req: AuthRequest, res: Response): Promise<void> {
        try {
            const { studentId } = req.params;

            const certificates = await CertificateModel.findByStudentId(studentId);

            res.json({ certificates });
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch certificates' });
        }
    }

    static async getCertificateFile(req: AuthRequest, res: Response): Promise<void> {
        try {
            const { certificateId } = req.params;

            const certificate = await CertificateModel.findById(certificateId);
            if (!certificate) {
                throw new AppError('Certificate not found', 404);
            }

            const absolutePath = path.resolve(certificate.file_path);
            if (!fs.existsSync(absolutePath)) {
                throw new AppError('File not found', 404);
            }

            res.sendFile(absolutePath);
        } catch (error) {
            if (error instanceof AppError) {
                res.status(error.statusCode).json({ error: error.message });
            } else {
                res.status(500).json({ error: 'Failed to fetch file' });
            }
        }
    }

    static async verifyCertificate(req: AuthRequest, res: Response): Promise<void> {
        try {
            const { certificateId } = req.params;
            const { status, rejection_reason } = req.body;
            const facultyId = req.user?.id;

            if (!facultyId) {
                throw new AppError('User not authenticated', 401);
            }

            if (!status || !['accepted', 'rejected', 'pending'].includes(status)) {
                throw new AppError('Invalid verification status', 400);
            }

            const certificate = await CertificateModel.updateVerificationStatus(
                certificateId,
                status as VerificationStatus,
                facultyId,
                rejection_reason
            );

            res.json({
                message: 'Certificate verification updated',
                certificate,
            });
        } catch (error) {
            if (error instanceof AppError) {
                res.status(error.statusCode).json({ error: error.message });
            } else {
                res.status(500).json({ error: 'Failed to verify certificate' });
            }
        }
    }

    static async downloadStudentCertificates(req: AuthRequest, res: Response): Promise<void> {
        try {
            const { studentId } = req.params;

            const zipPath = await FileService.createZipForStudent(studentId);

            res.download(zipPath, `student_certificates.zip`, (err) => {
                if (err) {
                    console.error('Download error:', err);
                }
                // Clean up the zip file after download
                FileService.deleteFile(zipPath);
            });
        } catch (error) {
            if (error instanceof Error) {
                res.status(500).json({ error: error.message });
            } else {
                res.status(500).json({ error: 'Failed to create download' });
            }
        }
    }

    static async downloadBulkCertificates(req: AuthRequest, res: Response): Promise<void> {
        try {
            const filters = req.body;

            const zipPath = await FileService.createBulkZip(filters);

            res.download(zipPath, `bulk_certificates.zip`, (err) => {
                if (err) {
                    console.error('Download error:', err);
                }
                // Clean up the zip file after download
                FileService.deleteFile(zipPath);
            });
        } catch (error) {
            if (error instanceof Error) {
                res.status(500).json({ error: error.message });
            } else {
                res.status(500).json({ error: 'Failed to create bulk download' });
            }
        }
    }

    static async exportReport(req: AuthRequest, res: Response): Promise<void> {
        try {
            const { format, ...filters } = req.body;

            if (!format || format !== ExportFormat.EXCEL) {
                throw new AppError('Invalid export format. Only Excel is supported.', 400);
            }

            const filePath = await ExportService.generateExport(format, filters);

            res.download(filePath, `certificate_report.xlsx`, (err) => {
                if (err) {
                    console.error('Export download error:', err);
                }
                // Clean up the file after download
                FileService.deleteFile(filePath);
            });
        } catch (error) {
            if (error instanceof AppError) {
                res.status(error.statusCode).json({ error: error.message });
            } else {
                console.error('Export error:', error);
                res.status(500).json({ error: 'Failed to generate export' });
            }
        }
    }

    static async deleteStudent(req: AuthRequest, res: Response): Promise<void> {
        try {
            const { studentId } = req.params;
            
            // Delete certificates first (to clean up physical files)
            const certificates = await CertificateModel.findByStudentId(studentId);
            for (const cert of certificates) {
                if (cert.file_path) {
                    FileService.deleteFile(cert.file_path);
                }
            }

            const deleted = await UserModel.deleteStudent(studentId);
            if (!deleted) {
                throw new AppError('Student not found or could not be deleted', 404);
            }

            res.json({ message: 'Student and all associated records deleted successfully' });
        } catch (error) {
            if (error instanceof AppError) {
                res.status(error.statusCode).json({ error: error.message });
            } else {
                console.error('Delete student error:', error);
                res.status(500).json({ error: 'Failed to delete student' });
            }
        }
    }
}
