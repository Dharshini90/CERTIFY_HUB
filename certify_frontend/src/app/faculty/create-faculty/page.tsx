'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { UserPlus, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';

interface CreateFacultyForm {
    name: string;
    email: string;
    password: string;
}

export default function FacultyCreatePage() {
    const router = useRouter();
    const { user } = useAuth();
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!user || user.role !== 'faculty') {
            router.push('/faculty/login');
        }
    }, [user, router]);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<CreateFacultyForm>();

    const onSubmit = async (data: CreateFacultyForm) => {
        setIsLoading(true);
        setError('');
        setSuccess('');

        try {
            await api.post('/auth/register-faculty', data);
            setSuccess('Faculty member created successfully!');
            reset();
            setIsLoading(false);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to create faculty member.');
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center p-4">
            {/* Animated Background Blobs */}
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary-400/20 rounded-full blur-[120px] animate-float" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-400/20 rounded-full blur-[120px] animate-pulse" />

            <div className="w-full max-w-md relative z-10 space-y-8">
                <Link
                    href="/faculty/dashboard"
                    className="group inline-flex items-center text-xs font-black uppercase tracking-widest text-slate-400 hover:text-secondary-600 transition-all gap-2"
                >
                    <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center border border-slate-100 group-hover:border-secondary-200 transition-all">
                        <ArrowLeft className="w-4 h-4" />
                    </div>
                    Back to System
                </Link>

                <Card className="glass border-white/20 shadow-2xl p-8 md:p-10">
                    <div className="text-center mb-10">
                        <div className="w-20 h-20 bg-gradient-to-tr from-secondary-600 to-secondary-400 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-secondary-500/20 text-white animate-float">
                            <UserPlus className="w-10 h-10" />
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Expand Team</h1>
                        <p className="text-slate-500 font-medium mt-2">Provision new faculty credentials</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-2 animate-fade-in">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-600" />
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="bg-green-50 border border-green-100 text-green-700 px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-2 animate-fade-in">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-600" />
                                {success}
                            </div>
                        )}

                        <Input
                            label="Full Legal Name"
                            placeholder="e.g. Prof. Alan Turing"
                            error={errors.name?.message}
                            {...register('name', { required: 'Name is required' })}
                        />

                        <Input
                            label="Institutional Email"
                            type="email"
                            placeholder="faculty@university.edu"
                            error={errors.email?.message}
                            {...register('email', {
                                required: 'Email is required',
                                pattern: {
                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                    message: 'Invalid email address',
                                },
                            })}
                        />

                        <Input
                            label="Initial Access Password"
                            type="password"
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

                        <Button type="submit" className="w-full h-12 shadow-secondary-500/25" variant="secondary" isLoading={isLoading}>
                            Initialize Account
                        </Button>
                    </form>
                </Card>
            </div>
        </div>
    );
}
