'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { GraduationCap, Mail, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';

interface ForgotForm {
    email: string;
}

export default function StudentForgotPasswordPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const { register, handleSubmit, formState: { errors } } = useForm<ForgotForm>();

    const onSubmit = async (data: ForgotForm) => {
        setIsLoading(true);
        setError('');
        try {
            await api.post('/auth/forgot-password', { email: data.email });
            setSuccess(true);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-400/20 rounded-full blur-[120px] animate-float" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary-400/20 rounded-full blur-[120px] animate-pulse" />

            <Card className="w-full max-w-md relative z-10 glass border-white/20 shadow-2xl p-8">
                <div className="text-center mb-10">
                    <div className="w-20 h-20 bg-gradient-to-tr from-primary-600 to-primary-400 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary-500/20 text-white animate-float">
                        <GraduationCap className="w-10 h-10" />
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Forgot Password</h1>
                    <p className="text-slate-500 font-medium mt-2">Enter your email to receive a reset link</p>
                </div>

                {success ? (
                    <div className="text-center py-8">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                        <h2 className="text-xl font-black text-slate-900 mb-2">Check Your Email</h2>
                        <p className="text-slate-500 text-sm mb-6">If that email is registered, we've sent a password reset link. It expires in 1 hour.</p>
                        <Link href="/student/login" className="text-primary-600 font-bold hover:text-primary-700 transition-colors text-sm">
                            ← Back to Login
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

                        <Button type="submit" className="w-full h-12 shadow-primary-500/25" isLoading={isLoading}>
                            <Mail className="w-4 h-4 mr-2" />
                            Send Reset Link
                        </Button>

                        <div className="text-center">
                            <Link href="/student/login" className="text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors">
                                ← Back to Login
                            </Link>
                        </div>
                    </form>
                )}
            </Card>
        </div>
    );
}
