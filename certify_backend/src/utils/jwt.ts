import jwt from 'jsonwebtoken';
import { User } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export interface JWTPayload {
    id: string;
    email: string;
    role: 'student' | 'faculty' | 'hod';
    name: string;
    roll_number?: string;
    department?: string;
}

export const generateToken = (user: Omit<User, 'password_hash'>): string => {
    const payload: JWTPayload = {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        roll_number: user.roll_number,
        department: user.department,
    };

    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as any);
};

export const verifyToken = (token: string): JWTPayload => {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
};
