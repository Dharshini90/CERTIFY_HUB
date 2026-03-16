// User Types
export interface User {
    id: string;
    email: string;
    password_hash: string;
    role: 'student' | 'faculty' | 'hod';
    roll_number?: string;
    name: string;
    year?: string;
    department?: string;
    section?: string;
    created_at: Date;
    updated_at: Date;
}

export interface CreateUserDTO {
    email: string;
    password: string;
    role: 'student' | 'faculty' | 'hod';
    roll_number?: string;
    name: string;
    year?: string;
    department?: string;
    section?: string;
}

export interface LoginDTO {
    email: string;
    password: string;
}

export interface AuthResponse {
    token: string;
    user: Omit<User, 'password_hash'>;
}

// Platform Types
export interface Platform {
    id: number;
    name: string;
    has_categories: boolean;
}

export interface Category {
    id: number;
    platform_id: number;
    name: string;
}

// Certificate Types
export enum VerificationStatus {
    PENDING = 'pending',
    ACCEPTED = 'accepted',
    REJECTED = 'rejected'
}

export interface Certificate {
    id: string;
    student_id: string;
    platform_id: number;
    category_id?: number;
    file_path: string;
    file_name: string;
    file_type: string;
    file_size: number;
    verification_status: VerificationStatus;
    verified_by?: string;
    verified_at?: Date;
    uploaded_at: Date;
    rejection_reason?: string | null;
}

export interface CreateCertificateDTO {
    student_id: string;
    platform_id: number;
    category_id?: number;
    file_path: string;
    file_name: string;
    file_type: string;
    file_size: number;
}

export interface CertificateWithDetails extends Certificate {
    student_name?: string;
    student_roll_number?: string;
    platform_name?: string;
    category_name?: string;
    verified_by_name?: string;
    rejection_reason?: string | null;
}

// Filter Types
export interface StudentFilters {
    year?: string;
    department?: string;
    section?: string;
    search?: string;
    page?: number;
    limit?: number;
}

export interface CertificateFilters {
    student_id?: string;
    platform_id?: number;
    category_id?: number;
    year?: string;
    department?: string;
    section?: string;
    verification_status?: VerificationStatus;
}

export interface StatsFilters {
    year?: string;
    department?: string;
    section?: string;
    platform_id?: number;
    category_id?: number;
}

// Statistics Types
export interface StudentCertificateStats {
    student_id: string;
    roll_number: string;
    name: string;
    year: string;
    department: string;
    section: string;
    total_certificates: number;
    verified_certificates: number;
    rejected_certificates: number;
    pending_certificates: number;
    platform_counts: { [platform: string]: number };
}

export interface ExportData {
    roll_number: string;
    name: string;
    year: string;
    department: string;
    section: string;
    total_certificates: number;
    verified_certificates: number;
    rejected_certificates: number;
    platform_counts?: { [platform: string]: number } | null;
    [key: string]: any;
}

export enum ExportFormat {
    EXCEL = 'excel'
}

// Request Extensions
export interface AuthRequest extends Request {
    user?: Omit<User, 'password_hash'>;
}

// Pagination
export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
