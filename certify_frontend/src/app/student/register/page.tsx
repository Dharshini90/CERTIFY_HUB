'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/contexts/AuthContext';
import { register as registerUser, setAuthToken } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card } from '@/components/ui/Card';
import { GraduationCap } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';

interface RegisterForm {
    name: string;
    email: string;
    password: string;
    roll_number: string;
    department: string;
    year: string;
    section: string;
}

export default function StudentRegisterPage() {
    const router = useRouter();
    const { setUser } = useAuth();
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [departments, setDepartments] = useState<{ id: number; name: string }[]>([]);
    const [sections, setSections] = useState<{ id: number; name: string }[]>([]);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterForm>();

    useEffect(() => {
        const loadDropdowns = async () => {
            try {
                const [dRes, sRes] = await Promise.all([
                    api.get('/faculty/departments'),
                    api.get('/faculty/sections'),
                ]);
                setDepartments(dRes.data.departments || []);
                setSections(sRes.data.sections || []);
            } catch {
                // silent fail – dropdowns will be empty
            }
        };
        loadDropdowns();
    }, []);

    const onSubmit = async (data: RegisterForm) => {
        setIsLoading(true);
        setError('');

        try {
            const response = await registerUser({
                ...data,
                role: 'student',
            });

            setAuthToken(response.token);
            setUser(response.user);
            router.push('/student/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Registration failed. Please try again.');
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative overflow-hidden flex items-center justify-center py-12 px-4">
            {/* Animated Background Blobs */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-400/20 rounded-full blur-[120px] animate-float" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary-400/20 rounded-full blur-[120px] animate-pulse" />

            <Card className="w-full max-w-2xl relative z-10 glass border-white/20 shadow-2xl p-8 md:p-12">
                <div className="text-center mb-10">
                    <div className="w-20 h-20 bg-gradient-to-tr from-primary-600 to-primary-400 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary-500/20 text-white animate-float">
                        <GraduationCap className="w-10 h-10" />
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Join CertifyHub</h1>
                    <p className="text-slate-500 font-medium mt-2">Create your student profile today</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                    {error && (
                        <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-2 animate-fade-in">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-600" />
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-6">
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Account Security</h3>
                            <Input
                                label="Full Legal Name"
                                placeholder="John Doe"
                                error={errors.name?.message}
                                {...register('name', { required: 'Name is required' })}
                            />

                            <Input
                                label="University Email"
                                type="email"
                                placeholder="name@university.edu"
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
                                label="Set Password"
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
                        </div>

                        <div className="space-y-6">
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Academic Details</h3>
                            <Input
                                label="Roll Number"
                                placeholder="e.g. 21CS101"
                                error={errors.roll_number?.message}
                                {...register('roll_number', { required: 'Roll number is required' })}
                            />

                            <Select
                                label="Department"
                                options={[
                                    { value: '', label: 'Select Department' },
                                    ...departments.map(d => ({ value: d.name, label: d.name }))
                                ]}
                                error={errors.department?.message}
                                {...register('department', { required: 'Department is required' })}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <Select
                                    label="Year"
                                    options={[
                                        { value: '', label: 'Select Year' },
                                        { value: '1st year', label: '1st Year' },
                                        { value: '2nd year', label: '2nd Year' },
                                        { value: '3rd year', label: '3rd Year' },
                                        { value: '4th year', label: '4th Year' },
                                    ]}
                                    error={errors.year?.message}
                                    {...register('year', { required: 'Year' })}
                                />
                                <Select
                                    label="Section"
                                    options={[
                                        { value: '', label: 'Select' },
                                        ...sections.map(s => ({ value: s.name, label: s.name }))
                                    ]}
                                    error={errors.section?.message}
                                    {...register('section', { required: 'Sec' })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4">
                        <Button type="submit" className="w-full h-12 shadow-primary-500/25" isLoading={isLoading}>
                            Complete Registration
                        </Button>
                    </div>
                </form>

                <div className="mt-10 text-center">
                    <p className="text-sm font-medium text-slate-500">
                        Already have an account?{' '}
                        <Link href="/student/login" className="text-primary-600 font-bold hover:text-primary-700 transition-colors">
                            Sign in instead
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
