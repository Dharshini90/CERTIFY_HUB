import pool from '../src/config/database';
import { hashPassword } from '../src/utils/password';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

async function addFaculty() {
    const args = process.argv.slice(2);
    if (args.length < 3) {
        console.log('Usage: npx ts-node scripts/add-faculty.ts <name> <email> <password>');
        process.exit(1);
    }

    const [name, email, password] = args;

    try {
        const hashedPassword = await hashPassword(password);

        const query = `
      INSERT INTO users (name, email, password_hash, role)
      VALUES ($1, $2, $3, 'faculty')
      RETURNING id, name, email;
    `;

        const result = await pool.query(query, [name, email, hashedPassword]);
        console.log('✅ Faculty created successfully:');
        console.table(result.rows[0]);

        process.exit(0);
    } catch (error: any) {
        console.error('❌ Error creating faculty:', error.message);
        process.exit(1);
    }
}

addFaculty();
