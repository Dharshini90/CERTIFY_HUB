import pool from '../config/database';

export class SectionModel {
    static async findAll(): Promise<{ id: number; name: string }[]> {
        const result = await pool.query('SELECT * FROM sections ORDER BY name');
        return result.rows;
    }

    static async create(name: string): Promise<{ id: number; name: string }> {
        const result = await pool.query(
            'INSERT INTO sections (name) VALUES ($1) RETURNING *',
            [name]
        );
        return result.rows[0];
    }

    static async update(id: number, name: string): Promise<{ id: number; name: string } | null> {
        const result = await pool.query(
            'UPDATE sections SET name = $1 WHERE id = $2 RETURNING *',
            [name, id]
        );
        return result.rows[0] || null;
    }

    static async delete(id: number): Promise<boolean> {
        const result = await pool.query('DELETE FROM sections WHERE id = $1', [id]);
        return (result.rowCount ?? 0) > 0;
    }
}
