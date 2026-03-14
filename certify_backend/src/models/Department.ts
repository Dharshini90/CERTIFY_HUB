import pool from '../config/database';

export class DepartmentModel {
    static async findAll(): Promise<{ id: number; name: string }[]> {
        const result = await pool.query('SELECT * FROM departments ORDER BY name');
        return result.rows;
    }

    static async create(name: string): Promise<{ id: number; name: string }> {
        const result = await pool.query(
            'INSERT INTO departments (name) VALUES ($1) RETURNING *',
            [name]
        );
        return result.rows[0];
    }

    static async update(id: number, name: string): Promise<{ id: number; name: string } | null> {
        const result = await pool.query(
            'UPDATE departments SET name = $1 WHERE id = $2 RETURNING *',
            [name, id]
        );
        return result.rows[0] || null;
    }

    static async delete(id: number): Promise<boolean> {
        const result = await pool.query('DELETE FROM departments WHERE id = $1', [id]);
        return (result.rowCount ?? 0) > 0;
    }
}
