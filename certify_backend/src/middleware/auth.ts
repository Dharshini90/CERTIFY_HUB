import { Request, Response, NextFunction } from 'express';
import { verifyToken, JWTPayload } from '../utils/jwt';

export interface AuthRequest extends Request {
    user?: JWTPayload;
}

export const authenticateToken = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): void => {
    const authHeader = req.headers['authorization'];
    let token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    // Also check for token in query parameters (useful for <img> and <iframe> tags)
    if (!token) {
        token = (req.query.token || req.query.auth_token) as string;
    }

    if (!token || token === 'undefined' || token === 'null') {
        console.log(`[Auth] 401 Unauthorized - Missing or invalid token for ${req.method} ${req.path}`);
        res.status(401).json({ error: 'Access token required' });
        return;
    }

    try {
        const user = verifyToken(token);
        req.user = user;
        next();
    } catch (error) {
        res.status(403).json({ error: 'Invalid or expired token' });
    }
};

export const requireRole = (role: 'student' | 'faculty' | 'hod') => {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }

        if (req.user.role !== role) {
            res.status(403).json({ error: `Access denied. ${role} role required` });
            return;
        }

        next();
    };
};
