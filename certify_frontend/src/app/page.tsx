'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { GraduationCap, Users, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
    const router = useRouter();
    const { user } = useAuth();

    useEffect(() => {
        if (user) {
            if (user.role === 'student') {
                router.push('/student/dashboard');
            } else if (user.role === 'faculty') {
                router.push('/faculty/dashboard');
            } else if (user.role === 'hod') {
                router.push('/hod/dashboard');
            }
        }
    }, [user, router]);

    return (
        <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
            {/* Animated Background Blobs */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-400/20 rounded-full blur-[120px] animate-float" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary-400/20 rounded-full blur-[120px] animate-pulse" />

            <div className="container-custom relative z-10">
                <div className="text-center mb-20 animate-fade-in">
                    <div className="inline-block px-4 py-1.5 bg-primary-50 rounded-full text-primary-600 text-xs font-black uppercase tracking-widest mb-6 border border-primary-100">
                        Modern Certificate Management
                    </div>
                    <h1 className="text-6xl md:text-8xl font-black text-slate-900 mb-6 tracking-tighter leading-none">
                        Certify<span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-400">Hub</span>
                    </h1>
                    <p className="text-xl text-slate-500 max-w-2xl mx-auto font-medium">
                        A centralized platform for students to aggregate their achievements and for faculty to verify excellence with precision.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10 max-w-7xl mx-auto animate-slide-up content-stretch">
                    {/* Student Login Card */}
                    <Link href="/student/login" className="h-full">
                        <div className="card card-hover group cursor-pointer border-2 border-transparent hover:border-primary-500/20 h-full flex flex-col">
                            <div className="flex flex-col items-center text-center p-6 flex-1">
                                <div className="w-20 h-20 bg-gradient-to-br from-primary-600 to-primary-400 rounded-2xl flex items-center justify-center mb-8 shadow-xl shadow-primary-500/20 group-hover:scale-105 transition-transform">
                                    <GraduationCap className="w-10 h-10 text-white" />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900 mb-4 tracking-tight">Student Portal</h2>
                                <p className="text-slate-500 font-medium leading-relaxed">
                                    Securely upload your academic and professional certificates to build your verified digital portfolio.
                                </p>
                            </div>
                            <div className="p-6 pt-0 mt-auto flex justify-center">
                                <div className="text-primary-600 font-bold text-sm uppercase tracking-widest flex items-center gap-2 group-hover:gap-4 transition-all">
                                    Enter Portal <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                                </div>
                            </div>
                        </div>
                    </Link>

                    {/* Faculty Login Card */}
                    <Link href="/faculty/login" className="h-full">
                        <div className="card card-hover group cursor-pointer border-2 border-transparent hover:border-secondary-500/20 h-full flex flex-col">
                            <div className="flex flex-col items-center text-center p-6 flex-1">
                                <div className="w-20 h-20 bg-gradient-to-br from-secondary-600 to-secondary-400 rounded-2xl flex items-center justify-center mb-8 shadow-xl shadow-secondary-500/20 group-hover:scale-105 transition-transform">
                                    <Users className="w-10 h-10 text-white" />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900 mb-4 tracking-tight">Faculty Portal</h2>
                                <p className="text-slate-500 font-medium leading-relaxed">
                                    Streamline certificate verification with bulk management and advanced departmental reporting.
                                </p>
                            </div>
                            <div className="p-6 pt-0 mt-auto flex justify-center">
                                <div className="text-secondary-600 font-bold text-sm uppercase tracking-widest flex items-center gap-2 group-hover:gap-4 transition-all">
                                    Admin Access <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                                </div>
                            </div>
                        </div>
                    </Link>

                    {/* HOD Login Card */}
                    <Link href="/hod/login" className="h-full md:col-span-2 lg:col-span-1">
                        <div className="card card-hover group cursor-pointer border-2 border-transparent hover:border-indigo-500/20 h-full flex flex-col md:max-w-md md:mx-auto lg:max-w-none">
                            <div className="flex flex-col items-center text-center p-6 flex-1">
                                <div className="w-20 h-20 bg-gradient-to-br from-indigo-600 to-indigo-400 rounded-2xl flex items-center justify-center mb-8 shadow-xl shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                                    <ShieldCheck className="w-10 h-10 text-white" />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900 mb-4 tracking-tight">HOD Portal</h2>
                                <p className="text-slate-500 font-medium leading-relaxed">
                                    Heads of Departments can oversee departmental analytics, faculty activity, and export reports.
                                </p>
                            </div>
                            <div className="p-6 pt-0 mt-auto flex justify-center">
                                <div className="text-indigo-600 font-bold text-sm uppercase tracking-widest flex items-center gap-2 group-hover:gap-4 transition-all">
                                    Manage Department <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                                </div>
                            </div>
                        </div>
                    </Link>
                </div>

                <div className="mt-24 text-center animate-fade-in delay-500">
                    <div className="inline-flex flex-wrap justify-center items-center gap-x-12 gap-y-6 text-xs font-black text-slate-400 uppercase tracking-widest">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 font-bold">1</div>
                            Structured Organization
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 font-bold">2</div>
                            Bulk Downloads
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 font-bold">3</div>
                            Export Reports
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
