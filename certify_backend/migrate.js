const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'certify_hub',
  password: process.env.DB_PASSWORD || 'dharshini18',
  port: process.env.DB_PORT || 5432,
});

async function migrate() {
  try {
    console.log('Starting migration: Adding is_department_admin to users table...');
    await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS is_department_admin BOOLEAN DEFAULT false;');
    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();
