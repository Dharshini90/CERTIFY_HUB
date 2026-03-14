import pool from '../config/database';
import { User, CreateUserDTO, StudentFilters, PaginatedResponse } from '../types';

export class UserModel {
    static async findByEmail(email: string): Promise<User | null> {
        const result = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );
        return result.rows[0] || null;
    }

    static async findById(id: string): Promise<User | null> {
        const result = await pool.query(
            'SELECT * FROM users WHERE id = $1',
            [id]
        );
        return result.rows[0] || null;
    }

    static async create(userData: CreateUserDTO): Promise<User> {
        const {
            email,
            password,
            role,
            roll_number,
            name,
            year,
            department,
            section,
        } = userData;

        const result = await pool.query(
            `INSERT INTO users (email, password_hash, role, roll_number, name, year, department, section)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
            [email, password, role, roll_number, name, year, department, section]
        );

        return result.rows[0];
    }

    static async updateProfile(id: string, data: {
        name?: string;
        email?: string;
        roll_number?: string;
        year?: string;
        department?: string;
        section?: string;
    }): Promise<User | null> {
        const fields: string[] = [];
        const values: any[] = [];
        let paramIndex = 1;

        if (data.name !== undefined) { fields.push(`name = $${paramIndex++}`); values.push(data.name); }
        if (data.email !== undefined) { fields.push(`email = $${paramIndex++}`); values.push(data.email); }
        if (data.roll_number !== undefined) { fields.push(`roll_number = $${paramIndex++}`); values.push(data.roll_number); }
        if (data.year !== undefined) { fields.push(`year = $${paramIndex++}`); values.push(data.year); }
        if (data.department !== undefined) { fields.push(`department = $${paramIndex++}`); values.push(data.department); }
        if (data.section !== undefined) { fields.push(`section = $${paramIndex++}`); values.push(data.section); }

        if (fields.length === 0) return null;

        values.push(id);
        const result = await pool.query(
            `UPDATE users SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${paramIndex} RETURNING *`,
            values
        );
        return result.rows[0] || null;
    }

    static async updatePassword(id: string, hashedPassword: string): Promise<boolean> {
        const result = await pool.query(
            'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
            [hashedPassword, id]
        );
        return (result.rowCount ?? 0) > 0;
    }

    static async setResetToken(email: string, token: string, expires: Date): Promise<boolean> {
        const result = await pool.query(
            'UPDATE users SET reset_token = $1, reset_token_expires = $2 WHERE email = $3',
            [token, expires, email]
        );
        return (result.rowCount ?? 0) > 0;
    }

    static async findByResetToken(token: string): Promise<User | null> {
        const result = await pool.query(
            'SELECT * FROM users WHERE reset_token = $1 AND reset_token_expires > NOW()',
            [token]
        );
        return result.rows[0] || null;
    }

    static async clearResetToken(id: string): Promise<void> {
        await pool.query(
            'UPDATE users SET reset_token = NULL, reset_token_expires = NULL WHERE id = $1',
            [id]
        );
    }

    static async findAllFaculty(): Promise<Omit<User, 'password_hash'>[]> {
        const result = await pool.query(
            `SELECT id, email, role, name, created_at, updated_at FROM users WHERE role = 'faculty' ORDER BY name`
        );
        return result.rows;
    }

    static async updateFaculty(id: string, data: { name?: string; email?: string }): Promise<User | null> {
        const fields: string[] = [];
        const values: any[] = [];
        let paramIndex = 1;

        if (data.name !== undefined) { fields.push(`name = $${paramIndex++}`); values.push(data.name); }
        if (data.email !== undefined) { fields.push(`email = $${paramIndex++}`); values.push(data.email); }

        if (fields.length === 0) return null;

        values.push(id);
        const result = await pool.query(
            `UPDATE users SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${paramIndex} AND role = 'faculty' RETURNING *`,
            values
        );
        return result.rows[0] || null;
    }

    static async deleteFaculty(id: string): Promise<boolean> {
        const result = await pool.query(
            `DELETE FROM users WHERE id = $1 AND role = 'faculty'`,
            [id]
        );
        return (result.rowCount ?? 0) > 0;
    }

    static async findStudents(
        filters: StudentFilters
    ): Promise<PaginatedResponse<any>> {
        const {
            year,
            department,
            section,
            search,
            page = 1,
            limit = 20,
        } = filters;

        const offset = (page - 1) * limit;
        const conditions: string[] = ["role = 'student'"];
        const params: any[] = [];
        let paramIndex = 1;

        if (year) {
            conditions.push(`year = $${paramIndex++}`);
            params.push(year);
        }

        if (department) {
            conditions.push(`department = $${paramIndex++}`);
            params.push(department);
        }

        if (section) {
            conditions.push(`section = $${paramIndex++}`);
            params.push(section);
        }

        if (search) {
            conditions.push(
                `(name ILIKE $${paramIndex} OR roll_number ILIKE $${paramIndex})`
            );
            params.push(`%${search}%`);
            paramIndex++;
        }

        const whereClause = conditions.join(' AND ');

        // Get total count
        const countResult = await pool.query(
            `SELECT COUNT(*) FROM users WHERE ${whereClause}`,
            params
        );
        const total = parseInt(countResult.rows[0].count);

        // Get paginated data with certificate counts
        const dataResult = await pool.query(
            `SELECT 
        u.id,
        u.roll_number,
        u.name,
        u.email,
        u.year,
        u.department,
        u.section,
        COUNT(c.id) as total_certificates,
        COUNT(CASE WHEN c.verification_status = 'accepted' THEN 1 END) as verified_certificates,
        COUNT(CASE WHEN c.verification_status = 'rejected' THEN 1 END) as rejected_certificates
       FROM users u
       LEFT JOIN certificates c ON u.id = c.student_id
       WHERE ${whereClause}
       GROUP BY u.id, u.roll_number, u.name, u.email, u.year, u.department, u.section
       ORDER BY u.roll_number
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
            [...params, limit, offset]
        );

        return {
            data: dataResult.rows,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
}
