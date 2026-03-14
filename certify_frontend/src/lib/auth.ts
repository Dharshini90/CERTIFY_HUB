import api from './api';
import { LoginCredentials, RegisterData, AuthResponse, User } from '@/types';

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    return response.data;
};

export const register = async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
};

export const getCurrentUser = async (): Promise<User> => {
    const response = await api.get<{ user: User }>('/auth/me');
    return response.data.user;
};

export const setAuthToken = (token: string): void => {
    localStorage.setItem('token', token);
};

export const getAuthToken = (): string | null => {
    return localStorage.getItem('token');
};

export const removeAuthToken = (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
};

export const setUser = (user: User): void => {
    localStorage.setItem('user', JSON.stringify(user));
};

export const getUser = (): User | null => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
};

export const logout = (): void => {
    removeAuthToken();
};
