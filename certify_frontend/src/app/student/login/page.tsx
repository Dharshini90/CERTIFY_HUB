'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/contexts/AuthContext';
import { login, setAuthToken } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { GraduationCap } from 'lucide-react';
import Link from 'next/link';

interface LoginForm {
    email: string;
    password: string;
}

export default function StudentLoginPage() {
    const router = useRouter();
    const { setUser } = useAuth();
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginForm>();

    const onSubmit = async (data: LoginForm) => {
        setIsLoading(true);
        setError('');

        try {
            const response = await login(data);

            if (response.user.role !== 'student') {
                setError('Invalid credentials for student login');
                setIsLoading(false);
                return;
            }

            setAuthToken(response.token);
            setUser(response.user);
            router.push('/student/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Login failed. Please try again.');
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
            {/* Animated Background Blobs */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-400/20 rounded-full blur-[120px] animate-float" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary-400/20 rounded-full blur-[120px] animate-pulse" />

            <Card className="w-full max-w-md relative z-10 glass border-white/20 shadow-2xl p-8">
                <div className="text-center mb-10">
                    <div className="w-20 h-20 bg-gradient-to-tr from-primary-600 to-primary-400 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary-500/20 text-white animate-float">
                        <GraduationCap className="w-10 h-10" />
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Student Login</h1>
                    <p className="text-slate-500 font-medium mt-2">Access your certificate portal</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {error && (
                        <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-2 animate-fade-in">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-600" />
                            {error}
                        </div>
                    )}

                    <Input
                        label="Email Address"
                        type="email"
                        placeholder="e.g. name@university.edu"
                        error={errors.email?.message}
                        {...register('email', {
                            required: 'Email is required',
                            pattern: {
                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                message: 'Invalid email address',
                            },
                        })}
                    />

                    <div className="space-y-1.5">
                        <Input
                            label="Portal Password"
                            type="password"
                            showPasswordToggle
                            placeholder="••••••••"
                            error={errors.password?.message}
                            {...register('password', {
                                required: 'Password is required',
                                minLength: {
                                    value: 6,
                                    message: 'Password must be at least 6 characters',
                                },
                            })}
                        />
                        <div className="flex justify-end">
                            <Link href="/student/forgot-password" className="text-xs font-bold text-primary-600 hover:text-primary-700 transition-colors">
                                Forgot Password?
                            </Link>
                        </div>
                    </div>

                    <Button type="submit" className="w-full h-12 shadow-primary-500/25" isLoading={isLoading}>
                        Login to Dashboard
                    </Button>
                </form>

                <div className="mt-10 text-center">
                    <p className="text-sm font-medium text-slate-500">
                        New to CertifyHub?{' '}
                        <Link href="/student/register" className="text-primary-600 font-bold hover:text-primary-700 transition-colors">
                            Create an account
                        </Link>
                    </p>
                </div>

                <div className="mt-8 pt-8 border-t border-slate-100 text-center">
                    <Link href="/" className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors flex items-center justify-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        Back to Home
                    </Link>
                </div>
            </Card>
        </div>
    );
}
