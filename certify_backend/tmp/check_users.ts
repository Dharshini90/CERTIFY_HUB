import { Client } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function run() {
    const client = new Client({
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '5432'),
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
    });

    try {
        await client.connect();
        const res = await client.query(`
            SELECT u.email, u.role, u.name, COUNT(c.id) as cert_count 
            FROM users u 
            LEFT JOIN certificates c ON u.id = c.student_id 
            WHERE u.role = 'student' 
            GROUP BY u.id, u.email, u.role, u.name 
            HAVING COUNT(c.id) > 0;
        `);
        console.log(JSON.stringify(res.rows, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

run();
