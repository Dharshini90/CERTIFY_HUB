// User Types
export interface User {
    id: string;
    email: string;
    role: 'student' | 'faculty';
    roll_number?: string;
    name: string;
    year?: string;
    department?: string;
    section?: string;
    created_at: string;
    updated_at: string;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    email: string;
    password: string;
    role: 'student' | 'faculty';
    roll_number?: string;
    name: string;
    year?: string;
    department?: string;
    section?: string;
}

export interface AuthResponse {
    token: string;
    user: User;
    message: string;
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
export type VerificationStatus = 'pending' | 'accepted' | 'rejected';

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
    verified_at?: string;
    uploaded_at: string;
    rejection_reason?: string | null;
    platform_name?: string;
    category_name?: string;
    verified_by_name?: string;
    student_name?: string;
    student_roll_number?: string;
}

export interface UploadCertificateData {
    platform_id: number;
    category_id?: number;
    certificate: File;
}

// Student Types
export interface StudentListItem {
    id: string;
    roll_number: string;
    name: string;
    year: string;
    department: string;
    section: string;
    total_certificates: number;
    verified_certificates: number;
    rejected_certificates: number;
}

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

export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

// Dashboard Types
export interface StudentDashboard {
    stats: {
        total_certificates: number;
        verified_certificates: number;
        rejected_certificates: number;
        pending_certificates: number;
    };
    recent_certificates: Certificate[];
}

// Export Types
export type ExportFormat = 'csv' | 'excel' | 'pdf';

export interface ExportFilters {
    format: ExportFormat;
    year?: string;
    department?: string;
    section?: string;
    platform_id?: number;
    category_id?: number;
}
