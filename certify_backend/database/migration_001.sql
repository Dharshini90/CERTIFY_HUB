-- CertifyHub Migration 001
-- Run this on your existing PostgreSQL database

-- 1. Add password reset token columns to users
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255),
    ADD COLUMN IF NOT EXISTS reset_token_expires TIMESTAMP;

-- 2. Create departments table
CREATE TABLE IF NOT EXISTS departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create sections table
CREATE TABLE IF NOT EXISTS sections (
    id SERIAL PRIMARY KEY,
    name VARCHAR(10) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Index on users reset_token for fast lookup
CREATE INDEX IF NOT EXISTS idx_users_reset_token ON users(reset_token);

-- 5. Optional: Seed default departments (edit as needed)
INSERT INTO departments (name) VALUES
    ('Computer Science'),
    ('Electronics and Communication'),
    ('Mechanical Engineering'),
    ('Civil Engineering'),
    ('Information Technology')
ON CONFLICT (name) DO NOTHING;

-- 6. Optional: Seed default sections
INSERT INTO sections (name) VALUES ('A'), ('B'), ('C'), ('D')
ON CONFLICT (name) DO NOTHING;
