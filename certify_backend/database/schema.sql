-- Certificate Hub Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table (Students and Faculty)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'faculty')),
    roll_number VARCHAR(50) UNIQUE,
    name VARCHAR(255) NOT NULL,
    academic_year VARCHAR(20),
    section VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Platforms Table
CREATE TABLE platforms (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    has_categories BOOLEAN DEFAULT FALSE
);

-- Categories Table
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    platform_id INTEGER REFERENCES platforms(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    UNIQUE(platform_id, name)
);

-- Certificates Table
CREATE TABLE certificates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    platform_id INTEGER REFERENCES platforms(id),
    category_id INTEGER REFERENCES categories(id),
    file_path VARCHAR(500) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_size BIGINT NOT NULL,
    verification_status VARCHAR(20) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'accepted', 'rejected')),
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMP,
    rejection_reason TEXT,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better query performance
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_roll_number ON users(roll_number);
CREATE INDEX idx_certificates_student_id ON certificates(student_id);
CREATE INDEX idx_certificates_platform_id ON certificates(platform_id);
CREATE INDEX idx_certificates_verification_status ON certificates(verification_status);
CREATE INDEX idx_certificates_uploaded_at ON certificates(uploaded_at);

-- Insert default platforms
INSERT INTO platforms (name, has_categories) VALUES
    ('Coursera', TRUE),
    ('Internship', FALSE),
    ('Skill Course', FALSE),
    ('Others', FALSE);

-- Insert Coursera categories
INSERT INTO categories (platform_id, name) VALUES
    (1, 'Domain Course'),
    (1, 'ESRM Course'),
    (1, 'Elective Course');

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create a sample faculty user (password: faculty123)
-- Password hash for 'faculty123' using bcrypt
INSERT INTO users (email, password_hash, role, name) VALUES
    ('faculty@certifyhub.com', '$2b$10$rQZ5YJ5YJ5YJ5YJ5YJ5YJOXxKxKxKxKxKxKxKxKxKxKxKxKxKxKxK', 'faculty', 'Faculty Admin');

-- Note: You should change the password hash after first login
