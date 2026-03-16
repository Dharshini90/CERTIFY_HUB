'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { login, setAuthToken } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { ShieldCheck, ArrowRight, LogIn } from 'lucide-react';

export default function HodLogin() {
    const router = useRouter();
    const { setUser } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await login(formData);
            setAuthToken(response.token);
            setUser(response.user);
            router.push('/hod/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Invalid email or password');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-[440px] p-10 space-y-8 border-none shadow-2xl bg-white rounded-[40px]">
                <div className="text-center space-y-4">
                    <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center mx-auto shadow-xl text-white transform rotate-3 hover:rotate-0 transition-transform duration-300">
                        <ShieldCheck className="w-10 h-10" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">HOD Login</h1>
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-2">Administrative Access Portal</p>
                    </div>
                </div>

                {error && (
                    <div className="bg-rose-50 text-rose-600 p-4 rounded-2xl text-sm font-bold border border-rose-100 flex items-center gap-3 animate-shake">
                        <div className="w-1.5 h-1.5 bg-rose-600 rounded-full" />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Input
                        label="Email Address"
                        type="email"
                        placeholder="hod@college.edu"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="!rounded-2xl !py-4 font-semibold border-slate-100 focus:border-indigo-500"
                    />
                    <div className="space-y-1">
                        <Input
                            label="Password"
                            type="password"
                            placeholder="••••••••"
                            required
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="!rounded-2xl !py-4 font-semibold border-slate-100 focus:border-indigo-500"
                        />
                        <div className="flex justify-end pr-2">
                            <Link href="/forgot-password" title="Forgot Password" className="text-xs font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors">
                                Forgot Password?
                            </Link>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-indigo-600 hover:bg-slate-900 h-16 rounded-[20px] shadow-xl shadow-indigo-500/10 text-xl font-black transition-all group"
                    >
                        {isLoading ? 'Accessing...' : (
                            <span className="flex items-center justify-center gap-3">
                                Enter Dashboard
                                <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" />
                            </span>
                        )}
                    </Button>
                </form>

                <div className="text-center space-y-4">
                    <p className="text-slate-400 font-bold text-sm tracking-tight">
                        New HOD?{' '}
                        <Link href="/hod/register" className="text-indigo-600 hover:text-indigo-800 font-black decoration-indigo-200 decoration-2 underline underline-offset-4">
                            Establish Account
                        </Link>
                    </p>
                    <div className="h-px bg-slate-100 w-1/2 mx-auto" />
                    <Link href="/" className="inline-block text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 hover:text-indigo-400 transition-colors">
                        ← Back to Gate
                    </Link>
                </div>
            </Card>
        </div>
    );
}
