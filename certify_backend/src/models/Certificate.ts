import pool from '../config/database';
import {
    Certificate,
    CreateCertificateDTO,
    CertificateFilters,
    CertificateWithDetails,
    VerificationStatus,
    StudentCertificateStats,
    StatsFilters,
    ExportData,
} from '../types';

export class CertificateModel {
    static async create(data: CreateCertificateDTO): Promise<Certificate> {
        const {
            student_id,
            platform_id,
            category_id,
            file_path,
            file_name,
            file_type,
            file_size,
        } = data;

        const result = await pool.query(
            `INSERT INTO certificates 
       (student_id, platform_id, category_id, file_path, file_name, file_type, file_size)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
            [student_id, platform_id, category_id, file_path, file_name, file_type, file_size]
        );

        return result.rows[0];
    }

    static async findByStudentId(studentId: string): Promise<CertificateWithDetails[]> {
        const result = await pool.query(
            `SELECT 
        c.*,
        p.name as platform_name,
        cat.name as category_name,
        u.name as verified_by_name
       FROM certificates c
       LEFT JOIN platforms p ON c.platform_id = p.id
       LEFT JOIN categories cat ON c.category_id = cat.id
       LEFT JOIN users u ON c.verified_by = u.id
       WHERE c.student_id = $1
       ORDER BY c.uploaded_at DESC`,
            [studentId]
        );

        return result.rows;
    }

    static async findById(id: string): Promise<CertificateWithDetails | null> {
        const result = await pool.query(
            `SELECT 
        c.*,
        p.name as platform_name,
        cat.name as category_name,
        u.name as verified_by_name
       FROM certificates c
       LEFT JOIN platforms p ON c.platform_id = p.id
       LEFT JOIN categories cat ON c.category_id = cat.id
       LEFT JOIN users u ON c.verified_by = u.id
       WHERE c.id = $1`,
            [id]
        );

        return result.rows[0] || null;
    }

    static async findWithFilters(filters: CertificateFilters): Promise<CertificateWithDetails[]> {
        const conditions: string[] = ['1=1'];
        const params: any[] = [];
        let paramIndex = 1;

        if (filters.student_id) {
            conditions.push(`c.student_id = $${paramIndex++}`);
            params.push(filters.student_id);
        }

        if (filters.platform_id) {
            conditions.push(`c.platform_id = $${paramIndex++}`);
            params.push(filters.platform_id);
        }

        if (filters.category_id) {
            conditions.push(`c.category_id = $${paramIndex++}`);
            params.push(filters.category_id);
        }

        if (filters.verification_status) {
            conditions.push(`c.verification_status = $${paramIndex++}`);
            params.push(filters.verification_status);
        }

        if (filters.year) {
            conditions.push(`s.year = $${paramIndex++}`);
            params.push(filters.year);
        }

        if (filters.department) {
            conditions.push(`s.department = $${paramIndex++}`);
            params.push(filters.department);
        }

        if (filters.section) {
            conditions.push(`s.section = $${paramIndex++}`);
            params.push(filters.section);
        }

        const whereClause = conditions.join(' AND ');

        const result = await pool.query(
            `SELECT 
        c.*,
        s.roll_number as student_roll_number,
        s.name as student_name,
        s.year,
        s.department,
        s.section,
        p.name as platform_name,
        cat.name as category_name,
        v.name as verified_by_name
       FROM certificates c
       JOIN users s ON c.student_id = s.id
       LEFT JOIN platforms p ON c.platform_id = p.id
       LEFT JOIN categories cat ON c.category_id = cat.id
       LEFT JOIN users v ON c.verified_by = v.id
       WHERE ${whereClause}
       ORDER BY s.roll_number, c.uploaded_at DESC`,
            params
        );

        return result.rows;
    }

    static async updateVerificationStatus(
        id: string,
        status: VerificationStatus,
        facultyId: string,
        rejectionReason?: string | null
    ): Promise<Certificate> {
        const isPending = status === 'pending';
        const result = await pool.query(
            `UPDATE certificates 
       SET verification_status = $1, 
           verified_by = $2, 
           verified_at = $3, 
           rejection_reason = $4
       WHERE id = $5
       RETURNING *`,
            [
                status,
                isPending ? null : facultyId,
                isPending ? null : new Date(),
                isPending ? null : (rejectionReason || null),
                id
            ]
        );

        return result.rows[0];
    }

    static async getStudentCertificateStats(studentId: string): Promise<any> {
        const result = await pool.query(
            `SELECT 
        COUNT(*) as total_certificates,
        COUNT(CASE WHEN verification_status = 'accepted' THEN 1 END) as verified_certificates,
        COUNT(CASE WHEN verification_status = 'rejected' THEN 1 END) as rejected_certificates,
        COUNT(CASE WHEN verification_status = 'pending' THEN 1 END) as pending_certificates
       FROM certificates
       WHERE student_id = $1`,
            [studentId]
        );

        return result.rows[0];
    }

    static async getAggregatedStats(filters: StatsFilters): Promise<ExportData[]> {
        const conditions: string[] = ["u.role = 'student'"];
        const params: any[] = [];
        let paramIndex = 1;

        if (filters.year) {
            conditions.push(`u.year = $${paramIndex++}`);
            params.push(filters.year);
        }

        if (filters.department) {
            conditions.push(`u.department = $${paramIndex++}`);
            params.push(filters.department);
        }

        if (filters.section) {
            conditions.push(`u.section = $${paramIndex++}`);
            params.push(filters.section);
        }

        if (filters.platform_id) {
            conditions.push(`c.platform_id = $${paramIndex++}`);
            params.push(filters.platform_id);
        }

        if (filters.category_id) {
            conditions.push(`c.category_id = $${paramIndex++}`);
            params.push(filters.category_id);
        }

        const whereClause = conditions.join(' AND ');

        const result = await pool.query(
            `SELECT 
        u.roll_number,
        u.name,
        u.year,
        u.department,
        u.section,
        COUNT(c.id) as total_certificates,
        COUNT(CASE WHEN c.verification_status = 'accepted' THEN 1 END) as verified_certificates,
        COUNT(CASE WHEN c.verification_status = 'rejected' THEN 1 END) as rejected_certificates,
        (
          SELECT json_object_agg(p_name, p_count)
          FROM (
            SELECT p.name as p_name, COUNT(*) as p_count
            FROM certificates c2
            JOIN platforms p ON c2.platform_id = p.id
            WHERE c2.student_id = u.id
            GROUP BY p.name
          ) p_counts
        ) as platform_counts
       FROM users u
       LEFT JOIN certificates c ON u.id = c.student_id
       WHERE ${whereClause}
       GROUP BY u.id, u.roll_number, u.name, u.year, u.department, u.section
       ORDER BY u.roll_number`,
            params
        );

        return result.rows;
    }

    static async deleteByIdAndStudentId(id: string, studentId: string): Promise<Certificate | null> {
        const result = await pool.query(
            `DELETE FROM certificates WHERE id = $1 AND student_id = $2 RETURNING *`,
            [id, studentId]
        );
        return result.rows[0] || null;
    }
}
