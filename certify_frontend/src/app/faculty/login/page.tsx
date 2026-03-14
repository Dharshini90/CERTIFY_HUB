'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/contexts/AuthContext';
import { login, setAuthToken } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Users } from 'lucide-react';
import Link from 'next/link';

interface LoginForm {
    email: string;
    password: string;
}

export default function FacultyLoginPage() {
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

            if (response.user.role !== 'faculty') {
                setError('Invalid credentials for faculty login');
                setIsLoading(false);
                return;
            }

            setAuthToken(response.token);
            setUser(response.user);
            router.push('/faculty/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Login failed. Please try again.');
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
            {/* Animated Background Blobs */}
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary-400/20 rounded-full blur-[120px] animate-float" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-400/20 rounded-full blur-[120px] animate-pulse" />

            <Card className="w-full max-w-md relative z-10 glass border-white/20 shadow-2xl p-8">
                <div className="text-center mb-10">
                    <div className="w-20 h-20 bg-gradient-to-tr from-secondary-600 to-secondary-400 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-secondary-500/20 text-white animate-float">
                        <Users className="w-10 h-10" />
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Faculty Login</h1>
                    <p className="text-slate-500 font-medium mt-2">Access management dashboard</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {error && (
                        <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-2 animate-fade-in">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-600" />
                            {error}
                        </div>
                    )}

                    <Input
                        label="Work Email"
                        type="email"
                        placeholder="e.g. faculty@university.edu"
                        error={errors.email?.message}
                        {...register('email', {
                            required: 'Work email is required',
                            pattern: {
                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                message: 'Invalid email address',
                            },
                        })}
                    />

                    <div className="space-y-1.5">
                        <Input
                            label="Security Password"
                            type="password"
                            showPasswordToggle
                            placeholder="••••••••"
                            error={errors.password?.message}
                            {...register('password', {
                                required: 'Password is required',
                            })}
                        />
                        <div className="flex justify-end">
                            <Link href="/faculty/forgot-password" className="text-xs font-bold text-secondary-600 hover:text-secondary-700 transition-colors">
                                Forgot Password?
                            </Link>
                        </div>
                    </div>

                    <Button type="submit" className="w-full h-12 shadow-secondary-500/25" variant="secondary" isLoading={isLoading}>
                        Login to Portal
                    </Button>
                </form>

                <div className="mt-10 pt-8 border-t border-slate-100 text-center">
                    <Link href="/" className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors flex items-center justify-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        Back to Home
                    </Link>
                </div>
            </Card>
        </div>
    );
}
