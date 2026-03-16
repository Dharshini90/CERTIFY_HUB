'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { register as registerUser, setAuthToken } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { ShieldCheck, ArrowRight, UserPlus, Building2 } from 'lucide-react';
import api from '@/lib/api';


export default function HodRegister() {
    const router = useRouter();
    const { setUser } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [departments, setDepartments] = useState<{ id: number; name: string }[]>([]);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        department: '',
    });

    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const response = await api.get('/faculty/departments');
                setDepartments(response.data.departments || []);
            } catch (err) {
                console.error('Failed to fetch departments:', err);
            }
        };

        fetchDepartments();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await registerUser({
                ...formData,
                role: 'hod',
            });
            setAuthToken(response.token);
            setUser(response.user);
            router.push('/hod/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Registration failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-[480px] p-8 space-y-8 border-none shadow-2xl bg-white rounded-[32px]">
                <div className="text-center space-y-2">
                    <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg text-white mb-6">
                        <ShieldCheck className="w-8 h-8" />
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">HOD Registration</h1>
                    <p className="text-slate-500 font-medium">Join CertifyHub as a Department Head</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-bold border border-red-100 flex items-center gap-3 animate-shake">
                        <div className="w-1.5 h-1.5 bg-red-600 rounded-full" />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <Input
                        label="Full Name"
                        placeholder="Dr. John Doe"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="!rounded-2xl !py-3 font-medium"
                    />
                    <Input
                        label="Email Address"
                        type="email"
                        placeholder="hod@college.edu"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="!rounded-2xl !py-3 font-medium"
                    />
                    <Select
                        label="Department"
                        required
                        options={[
                            { value: '', label: 'Select your department' },
                            ...departments.map(dept => ({ value: dept.name, label: dept.name }))
                        ]}
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        className="!rounded-2xl !h-[50px] font-medium"
                    />
                    <Input
                        label="Password"
                        type="password"
                        placeholder="••••••••"
                        required
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="!rounded-2xl !py-3 font-medium"
                    />

                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 h-14 rounded-2xl shadow-lg shadow-indigo-500/20 text-lg font-black transition-all group"
                    >
                        {isLoading ? 'Creating Account...' : (
                            <span className="flex items-center justify-center gap-2">
                                Create HOD Account
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </span>
                        )}
                    </Button>
                </form>

                <div className="text-center pt-4">
                    <p className="text-slate-500 font-bold text-sm">
                        Already have an account?{' '}
                        <Link href="/hod/login" className="text-indigo-600 hover:text-indigo-700 underline underline-offset-4">
                            Login here
                        </Link>
                    </p>
                </div>
            </Card>
        </div>
    );
}
