import { Request, Response } from 'express';
import crypto from 'crypto';
import { UserModel } from '../models/User';
import { hashPassword, comparePassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import { sendEmail } from '../utils/email';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

export class AuthController {
    static async register(req: Request, res: Response): Promise<void> {
        try {
            const { email, password, role, roll_number, name, year, department, section } = req.body;

            // Validate required fields
            if (!email || !password || !role || !name) {
                throw new AppError('Missing required fields', 400);
            }

            // Check if user already exists
            const existingUser = await UserModel.findByEmail(email);
            if (existingUser) {
                throw new AppError('User with this email already exists', 409);
            }

            // For students, roll_number is required
            if (role === 'student' && !roll_number) {
                throw new AppError('Roll number is required for students', 400);
            }

            // Hash password
            const password_hash = await hashPassword(password);

            // Create user
            const user = await UserModel.create({
                email,
                password: password_hash,
                role,
                roll_number: roll_number ? roll_number.toUpperCase() : undefined,
                name,
                year,
                department,
                section,
            });

            // Generate token
            const { password_hash: _, ...userWithoutPassword } = user;
            const token = generateToken(userWithoutPassword);

            res.status(201).json({
                message: 'User registered successfully',
                token,
                user: userWithoutPassword,
            });
        } catch (error) {
            if (error instanceof AppError) {
                res.status(error.statusCode).json({ error: error.message });
            } else {
                res.status(500).json({ error: 'Registration failed' });
            }
        }
    }

    static async login(req: Request, res: Response): Promise<void> {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                throw new AppError('Email and password are required', 400);
            }

            // Find user
            const user = await UserModel.findByEmail(email);
            if (!user) {
                throw new AppError('Invalid credentials', 401);
            }

            // Verify password
            const isValidPassword = await comparePassword(password, user.password_hash);
            if (!isValidPassword) {
                throw new AppError('Invalid credentials', 401);
            }

            // Generate token
            const { password_hash: _, ...userWithoutPassword } = user;
            const token = generateToken(userWithoutPassword);

            res.json({
                message: 'Login successful',
                token,
                user: userWithoutPassword,
            });
        } catch (error) {
            if (error instanceof AppError) {
                res.status(error.statusCode).json({ error: error.message });
            } else {
                res.status(500).json({ error: 'Login failed' });
            }
        }
    }

    static async registerFaculty(req: Request, res: Response): Promise<void> {
        try {
            const { email, password, name, department } = req.body;

            if (!email || !password || !name || !department) {
                throw new AppError('Missing required fields', 400);
            }

            // Check if user already exists
            const existingUser = await UserModel.findByEmail(email);
            if (existingUser) {
                throw new AppError('User with this email already exists', 409);
            }

            // Hash password
            const password_hash = await hashPassword(password);

            // Create faculty user
            const user = await UserModel.create({
                email,
                password: password_hash,
                role: 'faculty',
                name,
                department,
            });

            const { password_hash: _, ...userWithoutPassword } = user;

            res.status(201).json({
                message: 'Faculty registered successfully',
                user: userWithoutPassword,
            });
        } catch (error) {
            if (error instanceof AppError) {
                res.status(error.statusCode).json({ error: error.message });
            } else {
                res.status(500).json({ error: 'Faculty registration failed' });
            }
        }
    }

    static async getCurrentUser(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user?.id;
            if (!userId) {
                throw new AppError('User not authenticated', 401);
            }

            const user = await UserModel.findById(userId);
            if (!user) {
                throw new AppError('User not found', 404);
            }

            const { password_hash: _, ...userWithoutPassword } = user;
            res.json({ user: userWithoutPassword });
        } catch (error) {
            if (error instanceof AppError) {
                res.status(error.statusCode).json({ error: error.message });
            } else {
                res.status(500).json({ error: 'Failed to get user info' });
            }
        }
    }

    static async updateProfile(req: AuthRequest, res: Response): Promise<void> {
        try {
            const userId = req.user?.id;
            if (!userId) throw new AppError('User not authenticated', 401);

            const { name, email, roll_number, year, department, section } = req.body;

            const updated = await UserModel.updateProfile(userId, {
                name, email, roll_number: roll_number ? roll_number.toUpperCase() : undefined, year, department, section
            });

            if (!updated) throw new AppError('Failed to update profile', 500);

            const { password_hash: _, ...userWithoutPassword } = updated;
            res.json({ message: 'Profile updated successfully', user: userWithoutPassword });
        } catch (error) {
            if (error instanceof AppError) {
                res.status(error.statusCode).json({ error: error.message });
            } else {
                res.status(500).json({ error: 'Failed to update profile' });
            }
        }
    }

    static async changePassword(req: AuthRequest, res: Response): Promise<void> {
        try {
            const userId = req.user?.id;
            if (!userId) throw new AppError('User not authenticated', 401);

            const { currentPassword, newPassword } = req.body;
            if (!currentPassword || !newPassword) {
                throw new AppError('Current and new passwords are required', 400);
            }

            const user = await UserModel.findById(userId);
            if (!user) throw new AppError('User not found', 404);

            const isValid = await comparePassword(currentPassword, user.password_hash);
            if (!isValid) throw new AppError('Current password is incorrect', 400);

            if (newPassword.length < 6) {
                throw new AppError('New password must be at least 6 characters', 400);
            }

            const hashed = await hashPassword(newPassword);
            await UserModel.updatePassword(userId, hashed);

            res.json({ message: 'Password changed successfully' });
        } catch (error) {
            if (error instanceof AppError) {
                res.status(error.statusCode).json({ error: error.message });
            } else {
                res.status(500).json({ error: 'Failed to change password' });
            }
        }
    }

    static async forgotPassword(req: Request, res: Response): Promise<void> {
        try {
            const { email } = req.body;
            if (!email) throw new AppError('Email is required', 400);

            const user = await UserModel.findByEmail(email);
            // Always respond OK to prevent enumeration attacks
            if (!user) {
                res.json({ message: 'If that email exists, a reset link has been sent.' });
                return;
            }

            const token = crypto.randomBytes(32).toString('hex');
            const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

            await UserModel.setResetToken(email, token, expires);

            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
            const role = user.role;
            const resetUrl = `${frontendUrl}/${role}/reset-password?token=${token}`;

            await sendEmail(
                email,
                'CertifyHub — Reset Your Password',
                `
                <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; background: #f8fafc; border-radius: 12px;">
                    <h2 style="color: #1e293b; margin-bottom: 8px;">Password Reset Request</h2>
                    <p style="color: #64748b; margin-bottom: 20px;">Hello ${user.name},</p>
                    <p style="color: #64748b;">You requested a password reset for your CertifyHub account. Click the button below to reset your password. This link expires in 1 hour.</p>
                    <div style="text-align: center; margin: 32px 0;">
                        <a href="${resetUrl}" style="background: #6366f1; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">Reset My Password</a>
                    </div>
                    <p style="color: #94a3b8; font-size: 12px;">If you didn't request this, you can safely ignore this email.</p>
                    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
                    <p style="color: #94a3b8; font-size: 11px;">CertifyHub — Certificate Management Platform</p>
                </div>
                `
            );

            res.json({ message: 'If that email exists, a reset link has been sent.' });
        } catch (error) {
            if (error instanceof AppError) {
                res.status(error.statusCode).json({ error: error.message });
            } else {
                console.error('Forgot password error:', error);
                res.status(500).json({ error: 'Failed to process password reset' });
            }
        }
    }

    static async resetPassword(req: Request, res: Response): Promise<void> {
        try {
            const { token, newPassword } = req.body;
            if (!token || !newPassword) throw new AppError('Token and new password are required', 400);
            if (newPassword.length < 6) throw new AppError('Password must be at least 6 characters', 400);

            const user = await UserModel.findByResetToken(token);
            if (!user) throw new AppError('Invalid or expired reset token', 400);

            const hashed = await hashPassword(newPassword);
            await UserModel.updatePassword(user.id, hashed);
            await UserModel.clearResetToken(user.id);

            res.json({ message: 'Password reset successfully. Please login with your new password.' });
        } catch (error) {
            if (error instanceof AppError) {
                res.status(error.statusCode).json({ error: error.message });
            } else {
                res.status(500).json({ error: 'Failed to reset password' });
            }
        }
    }
}
