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
    Archive
} from 'lucide-react';
import api from '@/lib/api';
import { Certificate, Platform, PaginatedResponse } from '@/types';
import { formatDate, isPDF, isImage, cn } from '@/lib/utils';

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
    
    // UI States
    const [authToken, setAuthToken] = useState<string | null>(null);

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
            const [statsRes, completionRes, ledgerRes] = await Promise.all([
                api.get('/hod/stats'),
                api.get('/hod/completion-rate'),
                api.get('/hod/ledger')
            ]);
            
            setStats(statsRes.data);
            setCompletionRate(completionRes.data.rate);
            setLedger(ledgerRes.data.certificates);
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
                            <Button variant="secondary" onClick={handleLogout} className="!py-2 !px-3 !rounded-xl text-[14px] !font-semibold border-slate-200 shadow-sm hover:bg-slate-50">
                                <LogOut className="w-[18px] h-[18px] mr-2 text-slate-600 hover:text-red-500 transition-colors" />
                                Logout
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-[1600px] mx-auto px-6 py-8 space-y-8">
                {/* Statistics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard title="Total Certificates" value={stats.total} icon={<LayoutDashboard className="w-6 h-6" />} color="indigo" />
                    <StatCard title="Accepted" value={stats.accepted} icon={<TrendingUp className="w-6 h-6" />} color="green" />
                    <StatCard title="Pending Review" value={stats.pending} icon={<Filter className="w-6 h-6" />} color="yellow" />
                    <StatCard title="Rejected" value={stats.rejected} icon={<X className="w-6 h-6" />} color="red" />
                </div>

                {/* Verification Status Card */}
                <div className="grid grid-cols-1 gap-6">
                    <Card className="p-12 border-none shadow-xl bg-indigo-600 text-white relative overflow-hidden">
                        <div className="absolute top-[-20%] right-[-20%] w-[60%] h-[60%] bg-white/10 rounded-full blur-[80px]" />
                        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-400/20 rounded-full blur-[60px]" />
                        
                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-around gap-12 h-full text-center md:text-left">
                            <div className="max-w-md">
                                <h2 className="text-3xl font-black tracking-tight mb-4">Departmental Verification Status</h2>
                                <p className="text-white/80 text-lg font-medium mb-8 leading-relaxed">
                                    Track the real-time progress of certificate validation across <span className="text-white font-bold underline decoration-indigo-300 underline-offset-4">{user?.department}</span>.
                                </p>
                                <div className="flex flex-wrap justify-center md:justify-start gap-4">
                                    <div className="px-5 py-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10 flex items-center gap-3">
                                        <TrendingUp className="w-5 h-5 text-indigo-200" />
                                        <span className="text-sm font-black uppercase tracking-widest text-white">Live Sync Active</span>
                                    </div>
                                    <div className="px-5 py-3 bg-indigo-500/30 rounded-2xl backdrop-blur-md border border-white/10 flex items-center gap-3">
                                        <ShieldCheck className="w-5 h-5 text-indigo-200" />
                                        <span className="text-sm font-black uppercase tracking-widest text-white">Verified Data</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="relative w-64 h-64">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle
                                        cx="128"
                                        cy="128"
                                        r="110"
                                        stroke="rgba(255,255,255,0.1)"
                                        strokeWidth="16"
                                        fill="transparent"
                                    />
                                    <circle
                                        cx="128"
                                        cy="128"
                                        r="110"
                                        stroke="white"
                                        strokeWidth="16"
                                        fill="transparent"
                                        strokeDasharray={2 * Math.PI * 110}
                                        strokeDashoffset={2 * Math.PI * 110 * (1 - completionRate / 100)}
                                        strokeLinecap="round"
                                        className="transition-all duration-1000 ease-out"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-6xl font-black">{Math.round(completionRate)}%</span>
                                    <span className="text-[10px] font-black uppercase tracking-widest opacity-60 mt-1">Validated</span>
                                </div>
                            </div>
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
                                    </tr>
                                ))}
                                {ledger.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-8 py-20 text-center">
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
