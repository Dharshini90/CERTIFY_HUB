'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { 
    LogOut, 
    Download, 
    FileDown, 
    Search, 
    TrendingUp, 
    ShieldCheck,
    Filter,
    X,
    UserCircle,
    LayoutDashboard,
    FileSpreadsheet,
    Archive,
    UserPlus,
    ShieldAlert,
    Shield
} from 'lucide-react';
import api from '@/lib/api';
import { Certificate, Platform, PaginatedResponse } from '@/types';
import { formatDate, isPDF, isImage, cn } from '@/lib/utils';
import { RegisterFacultyModal } from './RegisterFacultyModal';

export default function HodDashboard() {
    const router = useRouter();
    const { user, logout } = useAuth();
    const [stats, setStats] = useState({ total: 0, accepted: 0, pending: 0, rejected: 0 });
    const [completionRate, setCompletionRate] = useState(0);
    const [ledger, setLedger] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDownloading, setIsDownloading] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    
    // Filters
    const [filterYear, setFilterYear] = useState('');
    const [filterSection, setFilterSection] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterPlatform, setFilterPlatform] = useState('');
    
    // Dropdown Data
    const [platforms, setPlatforms] = useState<Platform[]>([]);
    const [sections, setSections] = useState<{ id: number; name: string }[]>([]);
    
    // Analytics Data
    const [platformStats, setPlatformStats] = useState<any[]>([]);
    const [yearlyStats, setYearlyStats] = useState<any[]>([]);
    const [facultyActivity, setFacultyActivity] = useState<any[]>([]);
    const [monthlyTrend, setMonthlyTrend] = useState<any[]>([]);
    
    // UI States
    const [authToken, setAuthToken] = useState<string | null>(null);
    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
    const [faculty, setFaculty] = useState<any[]>([]);
    const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

    useEffect(() => {
        if (!user || user.role !== 'hod') {
            router.push('/hod/login');
            return;
        }
        setAuthToken(localStorage.getItem('token'));
        loadAllData();
        loadDropdownData();
    }, [user, router]);

    const loadAllData = async () => {
        setIsLoading(true);
        try {
            const [statsRes, completionRes, ledgerRes, platformRes, yearlyRes, facultyActivityRes, trendRes, facultyListRes] = await Promise.all([
                api.get('/hod/stats'),
                api.get('/hod/completion-rate'),
                api.get('/hod/ledger'),
                api.get('/hod/platform-adoption'),
                api.get('/hod/yearly-stats'),
                api.get('/hod/faculty-activity'),
                api.get('/hod/monthly-trend'),
                api.get('/faculty/faculty-list')
            ]);
            
            setStats(statsRes.data);
            setCompletionRate(completionRes.data.rate);
            setLedger(ledgerRes.data.certificates);
            setPlatformStats(platformRes.data);
            setYearlyStats(yearlyRes.data);
            setFacultyActivity(facultyActivityRes.data);
            setMonthlyTrend(trendRes.data);
            setFaculty(facultyListRes.data.faculty || []);

        } catch (error) {
            console.error('Failed to load HOD data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const loadDropdownData = async () => {
        try {
            const [platformsRes, sectionsRes] = await Promise.all([
                api.get('/platforms'),
                api.get('/faculty/sections')
            ]);
            setPlatforms(platformsRes.data.platforms);
            setSections(sectionsRes.data.sections);
        } catch (error) {
            console.error('Failed to load dropdown data:', error);
        }
    };

    const handleApplyFilters = async () => {
        setIsLoading(true);
        try {
            const params: any = {};
            if (filterYear) params.year = filterYear;
            if (filterSection) params.section = filterSection;
            if (filterStatus) params.status = filterStatus;
            if (filterPlatform) params.platformId = filterPlatform;

            const response = await api.get('/hod/ledger', { params });
            setLedger(response.data.certificates);
        } catch (error) {
            console.error('Failed to filter ledger:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleBulkDownload = async () => {
        setIsDownloading(true);
        try {
            const filters: any = {};
            if (filterYear) filters.year = filterYear;
            if (filterSection) filters.section = filterSection;
            if (filterStatus) filters.status = filterStatus;
            if (filterPlatform) filters.platformId = filterPlatform;

            const response = await api.post('/hod/bulk-download', filters, {
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${user?.department}_certificates.zip`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Failed to download ZIP:', error);
        } finally {
            setIsDownloading(false);
        }
    };

    const handleExportReport = async () => {
        setIsExporting(true);
        try {
            const filters: any = { format: 'excel' };
            if (filterYear) filters.year = filterYear;
            if (filterSection) filters.section = filterSection;
            if (filterStatus) filters.status = filterStatus;
            if (filterPlatform) filters.platformId = filterPlatform;

            const response = await api.post('/hod/export-report', filters, {
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${user?.department}_report.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Failed to export Excel:', error);
        } finally {
            setIsExporting(false);
        }
    };

    const handleLogout = () => {
        logout();
        router.push('/');
    };

    const handleToggleAdmin = async (f: any) => {
        const action = f.is_department_admin ? 'revoke' : 'grant';
        if (!confirm(`${action.charAt(0).toUpperCase() + action.slice(1)} admin privileges for ${f.name}?`)) return;
        
        try {
            await api.put(`/faculty/faculty-list/${f.id}`, { 
                is_department_admin: !f.is_department_admin 
            });
            await loadAllData();
            flash(`Admin privileges updated!`, true);
        } catch (e: any) {
            flash(e.response?.data?.error || 'Failed to update admin status', false);
        }
    };

    const flash = (text: string, ok: boolean) => {
        setMsg({ text, ok });
        setTimeout(() => setMsg(null), 3000);
    };

    if (isLoading && !stats.total) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Synchronizing Department Data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Navigation Header */}
            <div className="bg-white/90 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-50">
                <div className="max-w-[1600px] mx-auto px-6 py-3">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-600 rounded-[12px] flex items-center justify-center shadow-md text-white">
                                <ShieldCheck className="w-5 h-5" />
                            </div>
                            <div>
                                <h1 className="text-xl font-black text-slate-900 tracking-tight">CertifyHub</h1>
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">HOD Panel • {user?.department}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-3 border-r border-slate-200 pr-4 mr-2">
                                <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-lg border border-indigo-200">
                                    {user?.name ? user.name.charAt(0).toUpperCase() : 'H'}
                                </div>
                                <div className="hidden md:block text-left">
                                    <p className="text-sm font-bold text-slate-900">{user?.name}</p>
                                    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Head of Department</p>
                                </div>
                            </div>
                            <Button 
                                variant="secondary" 
                                onClick={() => router.push('/hod/profile')} 
                                className="!py-2 !px-4 !rounded-xl text-[14px] !font-semibold border-slate-200 shadow-sm hover:bg-slate-50"
                            >
                                <UserCircle className="w-[18px] h-[18px] mr-2 text-slate-600" />
                                Profile
                            </Button>
                            <Button 
                                onClick={() => setIsRegisterModalOpen(true)}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white !py-2 !px-4 !rounded-xl text-[14px] !font-bold shadow-md shadow-indigo-500/20 group"
                            >
                                <UserPlus className="w-[18px] h-[18px] mr-2 group-hover:scale-110 transition-transform" />
                                <span className="hidden lg:inline uppercase tracking-widest text-[10px]">Register Faculty</span>
                                <span className="lg:hidden">Register</span>
                            </Button>
                            <Button variant="secondary" onClick={handleLogout} className="!py-2 !px-3 !rounded-xl text-[14px] !font-semibold border-slate-200 shadow-sm hover:bg-slate-50">
                                <LogOut className="w-[18px] h-[18px] mr-2 text-slate-600 hover:text-red-500 transition-colors" />
                                Logout
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Flash Messages */}
            {msg && (
                <div className="fixed top-24 right-6 z-[100] animate-in fade-in slide-in-from-right-8 duration-300">
                    <div className={cn(
                        "px-6 py-4 rounded-2xl shadow-2xl border backdrop-blur-xl flex items-center gap-3",
                        msg.ok ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-700" : "bg-rose-500/10 border-rose-500/20 text-rose-700"
                    )}>
                        <div className={cn("w-2 h-2 rounded-full animate-pulse", msg.ok ? "bg-emerald-500" : "bg-rose-500")} />
                        <span className="text-sm font-black uppercase tracking-widest">{msg.text}</span>
                    </div>
                </div>
            )}

            <main className="max-w-[1600px] mx-auto px-6 py-8 space-y-10">
                {/* Unified Hero Section */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-stretch">
                    {/* Welcome & Status Card */}
                    <Card className="xl:col-span-2 p-10 border-none shadow-2xl bg-gradient-to-br from-indigo-700 via-indigo-600 to-indigo-800 text-white relative overflow-hidden flex flex-col justify-between min-h-[400px]">
                        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[70%] bg-white/10 rounded-full blur-[100px]" />
                        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[50%] bg-indigo-400/20 rounded-full blur-[80px]" />
                        
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-6">
                                <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest border border-white/20">
                                    Department Overview
                                </span>
                                <div className="h-px w-12 bg-white/20" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-200">Live Diagnostics</span>
                            </div>
                            <h2 className="text-4xl lg:text-5xl font-black tracking-tighter mb-4 leading-tight">
                                Tracking <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-indigo-200">{user?.department}</span> <br/>
                                <span className="opacity-60 italic font-serif">Verification Excellence.</span>
                            </h2>
                            <p className="text-white/70 text-lg font-medium max-w-lg leading-relaxed mb-8">
                                Monitor real-time certificate validation progress and faculty performance across your department.
                            </p>
                        </div>

                        <div className="relative z-10 flex flex-wrap gap-4 mt-auto">
                            <div className="px-6 py-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10 flex items-center gap-3 shadow-xl">
                                <TrendingUp className="w-5 h-5 text-indigo-300" />
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black uppercase tracking-widest opacity-60">System Status</span>
                                    <span className="text-xs font-black uppercase tracking-widest">Active Sync</span>
                                </div>
                            </div>
                            <div className="px-6 py-3 bg-indigo-500/30 rounded-2xl backdrop-blur-md border border-white/10 flex items-center gap-3 shadow-xl">
                                <ShieldCheck className="w-5 h-5 text-indigo-300" />
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Data Integrity</span>
                                    <span className="text-xs font-black uppercase tracking-widest">Verified Hub</span>
                                </div>
                            </div>
                        </div>

                        <div className="absolute bottom-10 right-10 hidden lg:block">
                            <div className="relative w-48 h-48">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle cx="96" cy="96" r="80" stroke="rgba(255,255,255,0.1)" strokeWidth="12" fill="transparent" />
                                    <circle
                                        cx="96" cy="96" r="80" stroke="white" strokeWidth="12" fill="transparent"
                                        strokeDasharray={2 * Math.PI * 80}
                                        strokeDashoffset={2 * Math.PI * 80 * (1 - completionRate / 100)}
                                        strokeLinecap="round"
                                        className="transition-all duration-1000 ease-out"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-4xl font-black">{Math.round(completionRate)}%</span>
                                    <span className="text-[9px] font-black uppercase tracking-widest opacity-60">Validated</span>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-2 gap-6 h-full">
                        <CompactStatCard title="Total" value={stats.total} icon={<LayoutDashboard className="w-5 h-5" />} color="indigo" />
                        <CompactStatCard title="Accepted" value={stats.accepted} icon={<TrendingUp className="w-5 h-5" />} color="green" />
                        <CompactStatCard title="Pending" value={stats.pending} icon={<Filter className="w-5 h-5" />} color="yellow" />
                        <CompactStatCard title="Rejected" value={stats.rejected} icon={<X className="w-5 h-5" />} color="red" />
                    </div>
                </div>

                {/* Analytics Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Platform Adoption */}
                    <Card className="p-8 space-y-6 border-none shadow-xl bg-white">
                        <div className="flex items-center justify-between">
                            <h3 className="font-extrabold text-slate-800 uppercase tracking-widest text-[11px] flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-indigo-500" />
                                Platform Adoption
                            </h3>
                            <Archive className="w-5 h-5 text-indigo-100 fill-indigo-500" />
                        </div>
                        <div className="space-y-5">
                            {platformStats.map((p, i) => (
                                <div key={p.name} className="space-y-2">
                                    <div className="flex justify-between text-xs font-bold">
                                        <span className="text-slate-600">{p.name}</span>
                                        <span className="text-indigo-600">{p.count} students</span>
                                    </div>
                                    <div className="h-2.5 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                                        <div 
                                            className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 rounded-full transition-all duration-1000 ease-out"
                                            style={{ width: `${Math.min((p.count / (stats.total || 1)) * 100, 100)}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                            {platformStats.length === 0 && <p className="text-center py-10 text-xs font-bold text-slate-300 uppercase tracking-widest">No data available</p>}
                        </div>
                    </Card>

                    {/* Yearly Distribution */}
                    <Card className="p-8 space-y-6 border-none shadow-xl bg-white">
                        <div className="flex items-center justify-between">
                            <h3 className="font-extrabold text-slate-800 uppercase tracking-widest text-[11px] flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                Yearly Activity
                            </h3>
                            <LayoutDashboard className="w-5 h-5 text-emerald-100 fill-emerald-500" />
                        </div>
                        <div className="space-y-4">
                            {yearlyStats.length > 0 ? yearlyStats.map((y) => (
                                <div key={y.year} className="flex items-center gap-4">
                                    <div className="w-20 text-[10px] font-black uppercase text-slate-400 text-right">{y.year}</div>
                                    <div className="flex-1 h-10 bg-slate-50 rounded-2xl border border-slate-100/50 relative overflow-hidden flex items-center px-4">
                                        <div 
                                            className="absolute left-0 top-0 bottom-0 bg-emerald-500/10 border-r-2 border-emerald-500 transition-all duration-1000 ease-out"
                                            style={{ width: `${Math.min((y.accepted / (y.total || 1)) * 100, 100)}%` }}
                                        />
                                        <span className="relative z-10 text-xs font-bold text-slate-700">{y.total} <span className="text-[10px] opacity-50">Total</span></span>
                                        <span className="relative z-10 ml-auto text-[10px] font-black text-emerald-600 uppercase tracking-widest">{y.accepted} <span className="opacity-50">Verified</span></span>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-center py-10 text-xs font-bold text-slate-300 uppercase tracking-widest">No data available</p>
                            )}
                        </div>
                    </Card>

                    {/* Faculty Activity */}
                    <Card className="p-8 space-y-6 border-none shadow-xl bg-white">
                        <div className="flex items-center justify-between">
                            <h3 className="font-extrabold text-slate-800 uppercase tracking-widest text-[11px] flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-rose-500" />
                                Top Contributors
                            </h3>
                            <UserCircle className="w-5 h-5 text-rose-100 fill-rose-500" />
                        </div>
                        <div className="space-y-3">
                            {facultyActivity.length > 0 ? facultyActivity.map((f, i) => (
                                <div key={f.faculty_name} className="flex items-center justify-between p-3.5 bg-slate-50/50 rounded-2xl border border-slate-100/50 hover:bg-slate-50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-xs font-black text-slate-400 border border-slate-200 shadow-sm group-hover:border-rose-200 transition-colors">
                                            {i + 1}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-xs font-black text-slate-700">{f.faculty_name}</span>
                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Department Faculty</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-100 shadow-sm">
                                        <span className="text-sm font-black text-rose-600 font-mono tracking-tighter">{f.verified_count}</span>
                                        <Archive className="w-3 h-3 text-rose-200" />
                                    </div>
                                </div>
                            )) : (
                                <p className="text-center py-10 text-xs font-bold text-slate-300 uppercase tracking-widest">No activity tracked</p>
                            )}
                        </div>
                    </Card>
                </div>

                {/* Department Administrators Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <Card className="p-8 space-y-6 border-none shadow-xl bg-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 opacity-50" />
                        <div className="flex items-center justify-between relative z-10">
                            <div>
                                <h3 className="font-extrabold text-slate-800 uppercase tracking-widest text-[11px] flex items-center gap-2 mb-1">
                                    <div className="w-2 h-2 rounded-full bg-indigo-600" />
                                    Department Administrators
                                </h3>
                                <p className="text-xs font-bold text-slate-400">Faculty with Super Admin privileges</p>
                            </div>
                            <ShieldCheck className="w-6 h-6 text-indigo-200" />
                        </div>

                        <div className="space-y-3 relative z-10">
                            {faculty.filter(f => f.is_department_admin).length > 0 ? (
                                faculty.filter(f => f.is_department_admin).map((f) => (
                                    <div key={f.id} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100/50 hover:bg-white hover:shadow-md transition-all group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-black border border-indigo-200 shadow-sm">
                                                {f.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-slate-700">{f.name}</span>
                                                <span className="text-[10px] font-bold text-slate-400 truncate max-w-[150px]">{f.email}</span>
                                            </div>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="secondary"
                                            onClick={() => handleToggleAdmin(f)}
                                            className="!py-2 !px-4 !rounded-xl text-[10px] !font-black uppercase tracking-widest border-rose-100 text-rose-600 hover:bg-rose-50 shadow-sm"
                                        >
                                            <ShieldAlert className="w-3.5 h-3.5 mr-2" />
                                            Revoke
                                        </Button>
                                    </div>
                                ))
                            ) : (
                                <div className="py-10 text-center space-y-2">
                                    <p className="text-xs font-black text-slate-300 uppercase tracking-widest">No active department admins</p>
                                    <p className="text-[10px] font-bold text-slate-400">Use "Register Faculty" to create one</p>
                                </div>
                            )}
                        </div>
                    </Card>

                    <Card className="p-8 space-y-6 border-none shadow-xl bg-gradient-to-br from-slate-800 to-slate-900 text-white flex flex-col justify-center relative overflow-hidden">
                        <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/5 rounded-full blur-3xl" />
                        <div className="relative z-10 space-y-4 text-center">
                            <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl border border-white/10">
                                <UserPlus className="w-8 h-8 text-indigo-300" />
                            </div>
                            <h4 className="text-xl font-black tracking-tight">Expand Your Team</h4>
                            <p className="text-sm text-slate-400 max-w-[250px] mx-auto font-medium leading-relaxed">
                                Need more help with verification? Add another faculty member and delegate administrative powers.
                            </p>
                            <Button 
                                onClick={() => setIsRegisterModalOpen(true)}
                                className="w-full bg-white text-slate-900 hover:bg-slate-50 !py-3 !rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-xl shadow-black/40"
                            >
                                Quick Provision
                            </Button>
                        </div>
                    </Card>
                </div>

                {/* Monthly Trend Section */}
                <div className="grid grid-cols-1 gap-8">
                    <Card className="p-8 space-y-8 border-none shadow-xl bg-white overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full -mr-32 -mt-32 opacity-50" />
                        
                        <div className="flex items-center justify-between relative z-10">
                            <div>
                                <h3 className="font-extrabold text-slate-800 uppercase tracking-widest text-[11px] flex items-center gap-2 mb-1">
                                    <div className="w-2 h-2 rounded-full bg-indigo-600" />
                                    Submission Trends
                                </h3>
                                <p className="text-xs font-bold text-slate-400">Monthly certificate upload activity</p>
                            </div>
                            <TrendingUp className="w-6 h-6 text-indigo-200" />
                        </div>

                        <div className="flex items-end justify-between gap-4 h-48 relative z-10 px-4">
                            {monthlyTrend.length > 0 ? monthlyTrend.map((t, i) => (
                                <div key={t.month} className="flex-1 flex flex-col items-center gap-4 group">
                                    <div className="w-full relative flex flex-col items-center">
                                        <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] font-black px-2 py-1 rounded-md mb-2 pointer-events-none whitespace-nowrap">
                                            {t.count} Certificates
                                        </div>
                                        <div 
                                            className="w-full max-w-[40px] bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-2xl shadow-lg shadow-indigo-500/20 transition-all duration-700 ease-out group-hover:scale-x-110 group-hover:from-indigo-500 group-hover:to-indigo-300"
                                            style={{ height: `${Math.max((t.count / Math.max(...monthlyTrend.map(x => x.count), 1)) * 140, 4)}px` }}
                                        />
                                    </div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter text-center h-4">{t.month}</span>
                                </div>
                            )) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">Awaiting more data to trend</p>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>

                {/* Ledger Section */}
                <Card className="overflow-hidden border-none shadow-2xl bg-white">
                    <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                                <FileDown className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Departmental Ledger</h2>
                                <p className="text-sm font-medium text-slate-500 mt-1">Full certificate history for {user?.department}</p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 bg-slate-50 p-2 rounded-2xl border border-slate-100/50">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2 hidden lg:block">Filter Pool</span>
                            <Select 
                                value={filterYear} 
                                onChange={(e) => setFilterYear(e.target.value)}
                                options={[
                                    { value: '', label: 'All Years' },
                                    { value: '1st year', label: '1st Year' },
                                    { value: '2nd year', label: '2nd Year' },
                                    { value: '3rd year', label: '3rd Year' },
                                    { value: '4th year', label: '4th Year' },
                                ]}
                                containerClassName="w-full sm:w-32"
                                className="!py-2 !h-10 text-xs font-bold"
                            />
                            <Select 
                                value={filterSection} 
                                onChange={(e) => setFilterSection(e.target.value)}
                                options={[
                                    { value: '', label: 'All Sections' },
                                    ...sections.map(s => ({ value: s.name, label: `Section ${s.name}` }))
                                ]}
                                containerClassName="w-full sm:w-32"
                                className="!py-2 !h-10 text-xs font-bold"
                            />
                            <Select 
                                value={filterPlatform} 
                                onChange={(e) => setFilterPlatform(e.target.value)}
                                options={[
                                    { value: '', label: 'All Platforms' },
                                    ...platforms.map(p => ({ value: p.id, label: p.name }))
                                ]}
                                containerClassName="w-full sm:w-40"
                                className="!py-2 !h-10 text-xs font-bold"
                            />
                            <Select 
                                value={filterStatus} 
                                onChange={(e) => setFilterStatus(e.target.value)}
                                options={[
                                    { value: '', label: 'All Status' },
                                    { value: 'accepted', label: 'Accepted' },
                                    { value: 'pending', label: 'Pending' },
                                    { value: 'rejected', label: 'Rejected' },
                                ]}
                                containerClassName="w-full sm:w-32"
                                className="!py-2 !h-10 text-xs font-bold"
                            />
                            <Button 
                                onClick={handleApplyFilters} 
                                className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 h-10 px-6"
                            >
                                <Filter className="w-4 h-4 mr-2" />
                                <span className="text-xs font-black uppercase tracking-widest">Filter</span>
                            </Button>

                            <div className="flex items-center gap-2 ml-auto border-l border-slate-200 pl-4">
                                <Button 
                                    onClick={handleBulkDownload} 
                                    disabled={isDownloading}
                                    variant="secondary" 
                                    className="bg-white hover:bg-slate-50 border-slate-200 h-10 px-4"
                                >
                                    <Archive className={cn("w-4 h-4 mr-2 text-indigo-600", isDownloading && "animate-pulse")} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">{isDownloading ? 'Zipping...' : 'ZIP Download'}</span>
                                </Button>
                                <Button 
                                    onClick={handleExportReport} 
                                    disabled={isExporting}
                                    variant="secondary" 
                                    className="bg-white hover:bg-slate-50 border-slate-200 h-10 px-4"
                                >
                                    <FileSpreadsheet className={cn("w-4 h-4 mr-2 text-emerald-600", isExporting && "animate-pulse")} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">{isExporting ? 'Exporting...' : 'Excel Report'}</span>
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
                                    <th className="px-8 py-4 text-left">Student Info</th>
                                    <th className="px-8 py-4 text-left">Certificate</th>
                                    <th className="px-8 py-4 text-left">Academic</th>
                                    <th className="px-8 py-4 text-left font-black tracking-widest text-slate-400">Status</th>
                                    <th className="px-8 py-4 text-left font-black tracking-widest text-slate-400">Verified By</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {ledger.map((cert) => (
                                    <tr key={cert.id} className="group hover:bg-indigo-50/30 transition-colors">
                                        <td className="px-8 py-5">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-900">{cert.student_name}</span>
                                                <span className="font-mono text-[10px] text-slate-400 font-bold">{cert.student_roll_number}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                                                    <FileDown className="w-4 h-4 text-slate-400" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-black text-slate-700 uppercase tracking-tight truncate max-w-[200px]">{cert.file_name}</span>
                                                    <span className="text-[10px] font-bold text-indigo-500">{cert.platform_name}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-2">
                                                <span className="px-2 py-1 bg-slate-100 rounded-md text-[10px] font-black uppercase tracking-widest text-slate-600">{cert.year}</span>
                                                <span className="w-6 h-6 bg-indigo-50 rounded-md flex items-center justify-center text-[10px] font-black text-indigo-700">{cert.section}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className={cn(
                                                "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                                                cert.verification_status === 'accepted' ? "bg-green-100 text-green-700" :
                                                cert.verification_status === 'rejected' ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"
                                            )}>
                                                <div className={cn("w-1 h-1 rounded-full", cert.verification_status === 'accepted' ? "bg-green-600" : cert.verification_status === 'rejected' ? "bg-red-600" : "bg-yellow-600")} />
                                                {cert.verification_status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-slate-900">{cert.verified_by_name || '-'}</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {ledger.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-20 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                                                    <Search className="w-8 h-8 text-slate-200" />
                                                </div>
                                                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No matching records found</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </main>

            <RegisterFacultyModal 
                isOpen={isRegisterModalOpen}
                onClose={() => setIsRegisterModalOpen(false)}
                onSuccess={loadAllData}
                department={user?.department}
            />
        </div>
    );
}

function StatCard({ title, value, icon, color }: { title: string, value: number, icon: React.ReactNode, color: 'indigo' | 'green' | 'yellow' | 'red' }) {
    const colors = {
        indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100 shadow-indigo-500/5',
        green: 'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-emerald-500/5',
        yellow: 'bg-amber-50 text-amber-600 border-amber-100 shadow-amber-500/5',
        red: 'bg-rose-50 text-rose-600 border-rose-100 shadow-rose-500/5'
    };

    return (
        <Card className={cn("p-6 border flex items-center gap-6 shadow-xl", colors[color])}>
            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner", color === 'indigo' ? 'bg-indigo-100/50' : color === 'green' ? 'bg-emerald-100/50' : color === 'yellow' ? 'bg-amber-100/50' : 'bg-rose-100/50')}>
                {icon}
            </div>
            <div>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">{title}</p>
                <p className="text-3xl font-black tracking-tight">{value}</p>
            </div>
        </Card>
    );
}

function CompactStatCard({ title, value, icon, color }: { title: string, value: number, icon: React.ReactNode, color: 'indigo' | 'green' | 'yellow' | 'red' }) {
    const colors = {
        indigo: 'bg-indigo-50 text-indigo-700 border-indigo-100',
        green: 'bg-emerald-50 text-emerald-700 border-emerald-100',
        yellow: 'bg-amber-50 text-amber-700 border-amber-100',
        red: 'bg-rose-50 text-rose-700 border-rose-100'
    };

    const iconColors = {
        indigo: 'bg-indigo-100 text-indigo-600',
        green: 'bg-emerald-100 text-emerald-600',
        yellow: 'bg-amber-100 text-amber-600',
        red: 'bg-rose-100 text-rose-600'
    };

    return (
        <Card className={cn("p-5 border flex flex-col justify-between shadow-lg hover:shadow-xl transition-all duration-300 group", colors[color])}>
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform", iconColors[color])}>
                {icon}
            </div>
            <div>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">{title}</p>
                <div className="flex items-baseline gap-1">
                    <p className="text-2xl font-black tracking-tight">{value}</p>
                    <span className="text-[10px] font-bold opacity-40 uppercase tracking-widest">Entry</span>
                </div>
            </div>
        </Card>
    );
}
