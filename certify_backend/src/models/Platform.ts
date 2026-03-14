import pool from '../config/database';
import { Platform, Category } from '../types';

export class PlatformModel {
    static async findAll(): Promise<Platform[]> {
        const result = await pool.query(
            'SELECT * FROM platforms ORDER BY id'
        );
        return result.rows;
    }

    static async findById(id: number): Promise<Platform | null> {
        const result = await pool.query(
            'SELECT * FROM platforms WHERE id = $1',
            [id]
        );
        return result.rows[0] || null;
    }

    static async getCategoriesByPlatformId(platformId: number): Promise<Category[]> {
        const result = await pool.query(
            'SELECT * FROM categories WHERE platform_id = $1 ORDER BY id',
            [platformId]
        );
        return result.rows;
    }

    static async create(name: string, has_categories: boolean = false): Promise<Platform> {
        const result = await pool.query(
            'INSERT INTO platforms (name, has_categories) VALUES ($1, $2) RETURNING *',
            [name, has_categories]
        );
        return result.rows[0];
    }

    static async update(id: number, name: string, has_categories: boolean): Promise<Platform | null> {
        const result = await pool.query(
            'UPDATE platforms SET name = $1, has_categories = $2 WHERE id = $3 RETURNING *',
            [name, has_categories, id]
        );
        return result.rows[0] || null;
    }

    static async delete(id: number): Promise<boolean> {
        const result = await pool.query('DELETE FROM platforms WHERE id = $1', [id]);
        return (result.rowCount ?? 0) > 0;
    }

    static async createCategory(platform_id: number, name: string): Promise<Category> {
        const result = await pool.query(
            'INSERT INTO categories (platform_id, name) VALUES ($1, $2) RETURNING *',
            [platform_id, name]
        );
        return result.rows[0];
    }

    static async deleteCategory(id: number): Promise<boolean> {
        const result = await pool.query('DELETE FROM categories WHERE id = $1', [id]);
        return (result.rowCount ?? 0) > 0;
    }
}
