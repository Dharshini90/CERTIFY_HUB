import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import pool from '../config/database';
import { CertificateModel } from '../models/Certificate';
import { AppError } from '../middleware/errorHandler';
import { FileService } from '../services/fileService';
import { ExportService } from '../services/exportService';
import { ExportFormat } from '../types';

export class HodController {
    static async getDashboardStats(req: AuthRequest, res: Response): Promise<void> {
        try {
            const department = req.user?.department;
            if (!department) {
                throw new AppError('Department not found in user profile', 400);
            }

            const query = `
                SELECT 
                    COUNT(*) as total,
                    COUNT(*) FILTER (WHERE verification_status = 'accepted') as accepted,
                    COUNT(*) FILTER (WHERE verification_status = 'pending') as pending,
                    COUNT(*) FILTER (WHERE verification_status = 'rejected') as rejected
                FROM certificates c
                JOIN users u ON c.student_id = u.id
                WHERE u.department = $1
            `;

            const result = await pool.query(query, [department]);
            res.json(result.rows[0]);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch dashboard stats' });
        }
    }

    static async getPlatformAdoption(req: AuthRequest, res: Response): Promise<void> {
        try {
            const department = req.user?.department;
            if (!department) {
                throw new AppError('Department not found in user profile', 400);
            }

            const query = `
                SELECT p.name, COUNT(DISTINCT c.student_id) as count
                FROM certificates c
                JOIN platforms p ON c.platform_id = p.id
                JOIN users u ON c.student_id = u.id
                WHERE u.department = $1
                GROUP BY p.name
                ORDER BY count DESC
            `;

            const result = await pool.query(query, [department]);
            res.json(result.rows);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch platform adoption' });
        }
    }

    static async getCompletionRate(req: AuthRequest, res: Response): Promise<void> {
        try {
            const department = req.user?.department;
            if (!department) {
                throw new AppError('Department not found in user profile', 400);
            }

            const query = `
                WITH dept_stats AS (
                    SELECT 
                        COUNT(*) as total,
                        COUNT(*) FILTER (WHERE verification_status IN ('accepted', 'rejected')) as processed
                    FROM certificates c
                    JOIN users u ON c.student_id = u.id
                    WHERE u.department = $1
                )
                SELECT 
                    CASE 
                        WHEN total = 0 THEN 0 
                        ELSE (processed::float / total::float) * 100 
                    END as rate
                FROM dept_stats
            `;

            const result = await pool.query(query, [department]);
            res.json(result.rows[0]);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch completion rate' });
        }
    }

    static async getDepartmentLedger(req: AuthRequest, res: Response): Promise<void> {
        try {
            const department = req.user?.department;
            if (!department) {
                throw new AppError('Department not found in user profile', 400);
            }

            const { year, section, status, platformId } = req.query;

            const certificates = await CertificateModel.findWithFilters({
                department,
                year: year as string,
                section: section as string,
                verification_status: status as any,
                platform_id: platformId ? parseInt(platformId as string) : undefined
            });

            res.json({ certificates });
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch department ledger' });
        }
    }

    static async downloadBulkCertificates(req: AuthRequest, res: Response): Promise<void> {
        try {
            const department = req.user?.department;
            if (!department) {
                throw new AppError('Department not found in user profile', 400);
            }

            const filters = { ...req.body, department };

            const zipPath = await FileService.createBulkZip(filters);

            res.download(zipPath, `${department}_certificates.zip`, (err) => {
                if (err) {
                    console.error('Download error:', err);
                }
                FileService.deleteFile(zipPath);
            });
        } catch (error) {
            console.error('Bulk download error:', error);
            res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to create bulk download' });
        }
    }

    static async exportReport(req: AuthRequest, res: Response): Promise<void> {
        try {
            const department = req.user?.department;
            if (!department) {
                throw new AppError('Department not found in user profile', 400);
            }

            const { format, ...filters } = req.body;

            if (!format || format !== ExportFormat.EXCEL) {
                throw new AppError('Invalid export format. Only Excel is supported.', 400);
            }

            const filePath = await ExportService.generateExport(format, { ...filters, department });

            res.download(filePath, `${department}_report.xlsx`, (err) => {
                if (err) {
                    console.error('Export download error:', err);
                }
                FileService.deleteFile(filePath);
            });
        } catch (error) {
            console.error('Export error:', error);
            res.status(500).json({ error: 'Failed to generate export' });
        }
    }
}
