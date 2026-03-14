import "reflect-metadata";
import { DataSource } from "typeorm";
import { Pool } from 'pg';
import dotenv from 'dotenv';
import { User } from "../entity/User";

dotenv.config();

// Legacy PG Pool for current models
export const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'certify_hub',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

pool.on('connect', () => {
    console.log('✅ Legacy PG Pool connected');
});

// New TypeORM DataSource
export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USER || 'postgres', // User's snippet used DB_USERNAME, but .env uses DB_USER
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'certify_hub',
    synchronize: false, // Set to false since schema is already created via SQL
    logging: false,
    entities: [User], // Only including implemented entities for now
    migrations: [],
    subscribers: [],
});

export default pool; // Keep default export as pool for legacy models
