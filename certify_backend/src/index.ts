import "reflect-metadata";
import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';

// Import routes
import authRoutes from './routes/auth.routes';
import studentRoutes from './routes/student.routes';
import facultyRoutes from './routes/faculty.routes';
import platformRoutes from './routes/platform.routes';

// Import middleware
import { errorHandler } from './middleware/errorHandler';

// Import database
import pool, { AppDataSource } from './config/database';

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

console.log("DB ENV CHECK", {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

// Middleware
app.use(helmet({
    crossOriginResourcePolicy: false,
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
        directives: {
            ...helmet.contentSecurityPolicy.getDefaultDirectives(),
            "frame-ancestors": ["'self'", "http://localhost:3000"],
            "img-src": ["'self'", "data:", "blob:", "http://localhost:5000"],
            "script-src": ["'self'", "'unsafe-inline'"],
        },
    },
}));
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files (for serving uploaded files if needed)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/platforms', platformRoutes);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Certificate Hub API is running' });
});

// Error handler (must be last)
app.use(errorHandler);

// Start server
const startServer = async () => {
    try {
        // Initialize TypeORM
        await AppDataSource.initialize();
        console.log('✅ TypeORM DataSource initialized');

        // Test database connection (Legacy)
        await pool.query('SELECT NOW()');
        console.log('✅ Legacy database connection verified');

        app.listen(PORT, () => {
            console.log(`🚀 Server is running on port ${PORT}`);
            console.log(`📍 API URL: http://localhost:${PORT}`);
            console.log(`🏥 Health check: http://localhost:${PORT}/health`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

startServer();

export default app;
