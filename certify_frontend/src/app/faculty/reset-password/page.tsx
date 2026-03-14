'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Users, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';

interface ResetForm {
    newPassword: string;
    confirmPassword: string;
}

export default function FacultyResetPasswordPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token');
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const { register, handleSubmit, watch, formState: { errors } } = useForm<ResetForm>();

    useEffect(() => {
        if (!token) setError('Invalid or missing reset token. Please request a new reset link.');
    }, [token]);

    const onSubmit = async (data: ResetForm) => {
        if (!token) return;
        setIsLoading(true);
        setError('');
        try {
            await api.post('/auth/reset-password', { token, newPassword: data.newPassword });
            setSuccess(true);
            setTimeout(() => router.push('/faculty/login'), 3000);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to reset password. The link may have expired.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary-400/20 rounded-full blur-[120px] animate-float" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-400/20 rounded-full blur-[120px] animate-pulse" />

            <Card className="w-full max-w-md relative z-10 glass border-white/20 shadow-2xl p-8">
                <div className="text-center mb-10">
                    <div className="w-20 h-20 bg-gradient-to-tr from-secondary-600 to-secondary-400 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-secondary-500/20 text-white animate-float">
                        <Users className="w-10 h-10" />
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Reset Password</h1>
                    <p className="text-slate-500 font-medium mt-2">Set your new faculty password below</p>
                </div>

                {success ? (
                    <div className="text-center py-8">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                        <h2 className="text-xl font-black text-slate-900 mb-2">Password Reset!</h2>
                        <p className="text-slate-500 text-sm mb-2">Your password has been reset. Redirecting to login…</p>
                        <Link href="/faculty/login" className="text-secondary-600 font-bold hover:text-secondary-700 transition-colors text-sm">
                            Go to Login
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-2 animate-fade-in">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-600" />
                                {error}
                            </div>
                        )}

                        <Input
                            label="New Password"
                            type="password"
                            showPasswordToggle
                            placeholder="••••••••"
                            error={errors.newPassword?.message}
                            {...register('newPassword', {
                                required: 'New password is required',
                                minLength: { value: 6, message: 'Password must be at least 6 characters' },
                            })}
                        />

                        <Input
                            label="Confirm New Password"
                            type="password"
                            showPasswordToggle
                            placeholder="••••••••"
                            error={errors.confirmPassword?.message}
                            {...register('confirmPassword', {
                                required: 'Please confirm your password',
                                validate: v => v === watch('newPassword') || 'Passwords do not match',
                            })}
                        />

                        <Button type="submit" className="w-full h-12 shadow-secondary-500/25" variant="secondary" isLoading={isLoading} disabled={!token}>
                            Reset Password
                        </Button>

                        <div className="text-center">
                            <Link href="/faculty/login" className="text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors">
                                ← Back to Login
                            </Link>
                        </div>
                    </form>
                )}
            </Card>
        </div>
    );
}
