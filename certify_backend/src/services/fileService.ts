import fs from 'fs';
import path from 'path';
import archiver from 'archiver';
import { CertificateModel } from '../models/Certificate';
import { CertificateFilters } from '../types';

const uploadDir = process.env.UPLOAD_DIR || 'uploads/certificates';

export class FileService {
    static async createZipForStudent(studentId: string): Promise<string> {
        const certificates = await CertificateModel.findByStudentId(studentId);

        if (certificates.length === 0) {
            throw new Error('No certificates found for this student');
        }

        const zipPath = path.join('uploads', `student_${studentId}_${Date.now()}.zip`);
        const output = fs.createWriteStream(zipPath);
        const archive = archiver('zip', { zlib: { level: 9 } });

        return new Promise((resolve, reject) => {
            output.on('close', () => resolve(zipPath));
            archive.on('error', (err) => reject(err));

            archive.pipe(output);

            certificates.forEach((cert) => {
                if (fs.existsSync(cert.file_path)) {
                    archive.file(cert.file_path, { name: cert.file_name });
                }
            });

            archive.finalize();
        });
    }

    static async createBulkZip(filters: CertificateFilters): Promise<string> {
        const certificates = await CertificateModel.findWithFilters(filters);

        if (certificates.length === 0) {
            throw new Error('No certificates found matching the filters');
        }

        // Group certificates by student
        const studentGroups: { [key: string]: any[] } = {};
        certificates.forEach((cert) => {
            const key = cert.student_id;
            if (!studentGroups[key]) {
                studentGroups[key] = [];
            }
            studentGroups[key].push(cert);
        });

        const zipPath = path.join('uploads', `bulk_download_${Date.now()}.zip`);
        const output = fs.createWriteStream(zipPath);
        const archive = archiver('zip', { zlib: { level: 9 } });

        return new Promise((resolve, reject) => {
            output.on('close', () => resolve(zipPath));
            archive.on('error', (err) => reject(err));

            archive.pipe(output);

            // Create a folder for each student
            Object.entries(studentGroups).forEach(([studentId, certs]) => {
                const studentInfo = certs[0];
                const folderName = `${studentInfo.student_roll_number}_${studentInfo.student_name}`.replace(/[^a-zA-Z0-9_-]/g, '_');

                certs.forEach((cert) => {
                    if (fs.existsSync(cert.file_path)) {
                        archive.file(cert.file_path, {
                            name: `${folderName}/${cert.file_name}`
                        });
                    }
                });
            });

            archive.finalize();
        });
    }

    static deleteFile(filePath: string): void {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    }

    static getFilePath(certificateId: string): string {
        // This would be implemented based on certificate lookup
        return '';
    }
}
