'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { LogOut, Upload, FileText, CheckCircle, XCircle, Clock, UserCircle, Trash2 } from 'lucide-react';
import api from '@/lib/api';
import { Platform, Category, Certificate, StudentDashboard as DashboardData } from '@/types';
import { formatDate, formatFileSize, cn } from '@/lib/utils';

export default function StudentDashboard() {
    const router = useRouter();
    const { user, logout } = useAuth();
    const [platforms, setPlatforms] = useState<Platform[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedPlatform, setSelectedPlatform] = useState<number | ''>('');
    const [selectedCategory, setSelectedCategory] = useState<number | ''>('');
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadMessage, setUploadMessage] = useState('');
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);

    useEffect(() => {
        if (!user || user.role !== 'student') {
            router.push('/student/login');
            return;
        }
        loadPlatforms();
        loadDashboard();
    }, [user, router]);

    const loadPlatforms = async () => {
        try {
            const response = await api.get('/platforms');
            setPlatforms(response.data.platforms);
        } catch (error) {
            console.error('Failed to load platforms:', error);
        }
    };

    const loadDashboard = async () => {
        try {
            const response = await api.get('/student/dashboard');
            setDashboardData(response.data);
        } catch (error) {
            console.error('Failed to load dashboard:', error);
        }
    };

    const handlePlatformChange = async (platformId: string) => {
        setSelectedPlatform(platformId ? parseInt(platformId) : '');
        setSelectedCategory('');
        setCategories([]);

        if (platformId) {
            try {
                const response = await api.get(`/platforms/${platformId}/categories`);
                setCategories(response.data.categories);
            } catch (error) {
                console.error('Failed to load categories:', error);
            }
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file || !selectedPlatform) {
            setUploadMessage('Please select a platform and file');
            return;
        }

        setIsUploading(true);
        setUploadMessage('');

        const formData = new FormData();
        formData.append('certificate', file);
        formData.append('platform_id', selectedPlatform.toString());
        if (selectedCategory) {
            formData.append('category_id', selectedCategory.toString());
        }

        try {
            await api.post('/student/certificates/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setUploadMessage('Certificate uploaded successfully!');
            setFile(null);
            setSelectedPlatform('');
            setSelectedCategory('');
            loadDashboard();
        } catch (error: any) {
            setUploadMessage(error.response?.data?.error || 'Upload failed');
        } finally {
            setIsUploading(false);
        }
    };

    const handleLogout = () => {
        logout();
        router.push('/');
    };

    const handleDelete = async (id: string | number) => {
        if (!confirm('Are you sure you want to delete this certificate?')) return;
        try {
            await api.delete(`/student/certificates/${id}`);
            loadDashboard();
        } catch (error: any) {
            alert(error.response?.data?.error || 'Failed to delete certificate');
        }
    };

    const showCategories = selectedPlatform && platforms.find(p => p.id === selectedPlatform)?.has_categories;

    return (
        <div className="min-h-screen">
            {/* Header */}
            <div className="glass border-b border-white/20 sticky top-0 z-50">
                <div className="container-custom py-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-tr from-primary-600 to-primary-400 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/20 text-white">
                                <FileText className="w-6 h-6" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-black text-slate-900 tracking-tight">CertifyHub</h1>
                                <p className="text-sm font-medium text-slate-500">Student Portal</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-3 border-r border-slate-200 pr-4 mr-2">
                                <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-black text-lg border border-primary-200">
                                    {user?.name ? user.name.charAt(0).toUpperCase() : 'S'}
                                </div>
                                <div className="hidden md:block text-left">
                                    <p className="text-sm font-bold text-slate-900">{user?.name}</p>
                                    <p className="text-xs font-medium text-slate-500 capitalize">{user?.role}</p>
                                </div>
                            </div>
                            <Button variant="secondary" size="sm" onClick={() => router.push('/student/profile')} className="rounded-xl">
                                <UserCircle className="w-4 h-4 mr-2" />
                                Profile
                            </Button>
                            <Button variant="secondary" size="sm" onClick={handleLogout} className="rounded-xl">
                                <LogOut className="w-4 h-4 mr-2" />
                                Logout
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container-custom py-10 space-y-10">
                {/* Stats Cards */}
                {dashboardData && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {[
                            { label: 'Total', value: dashboardData.stats.total_certificates, icon: FileText, color: 'text-primary-600', bg: 'bg-primary-50' },
                            { label: 'Verified', value: dashboardData.stats.verified_certificates, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
                            { label: 'Pending', value: dashboardData.stats.pending_certificates, icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50' },
                            { label: 'Rejected', value: dashboardData.stats.rejected_certificates, icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
                        ].map((stat, i) => (
                            <Card key={i} className="card-hover group">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">{stat.label}</p>
                                        <p className="text-4xl font-black text-slate-900">{stat.value}</p>
                                    </div>
                                    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-6", stat.bg)}>
                                        <stat.icon className={cn("w-8 h-8", stat.color)} />
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Upload Form */}
                    <Card className="lg:col-span-1 h-fit sticky top-28">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center text-primary-600">
                                <Upload className="w-5 h-5" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-900">Upload Certificate</h2>
                        </div>

                        <form onSubmit={handleUpload} className="space-y-6">
                            <Select
                                label="Platform *"
                                value={selectedPlatform}
                                onChange={(e) => handlePlatformChange(e.target.value)}
                                options={[
                                    { value: '', label: 'Select Platform' },
                                    ...platforms.map(p => ({ value: p.id, label: p.name }))
                                ]}
                            />

                            {showCategories && categories.length > 0 && (
                                <Select
                                    label="Category *"
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value ? parseInt(e.target.value) : '')}
                                    options={[
                                        { value: '', label: 'Select Category' },
                                        ...categories.map(c => ({ value: c.id, label: c.name }))
                                    ]}
                                />
                            )}

                            <div className="space-y-2">
                                <label className="label">Certificate File *</label>
                                <div className="relative group/file">
                                    <input
                                        type="file"
                                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                    />
                                    <div className={cn(
                                        "w-full px-4 py-8 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all",
                                        file
                                            ? "border-primary-500 bg-primary-50/50"
                                            : "border-slate-200 bg-slate-50 group-hover/file:border-primary-300 group-hover/file:bg-white"
                                    )}>
                                        <div className={cn(
                                            "w-12 h-12 rounded-full flex items-center justify-center mb-3",
                                            file ? "bg-primary-100 text-primary-600" : "bg-white text-slate-400"
                                        )}>
                                            <Upload className="w-6 h-6" />
                                        </div>
                                        {file ? (
                                            <div className="text-center">
                                                <p className="text-sm font-bold text-slate-900 truncate max-w-[200px]">{file.name}</p>
                                                <p className="text-xs font-medium text-slate-500 mt-1">{formatFileSize(file.size)}</p>
                                            </div>
                                        ) : (
                                            <div className="text-center">
                                                <p className="text-sm font-bold text-slate-900">Drop file or click to browse</p>
                                                <p className="text-xs font-medium text-slate-500 mt-1">PDF, JPG, PNG (Max 5MB)</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {uploadMessage && (
                                <div className={cn(
                                    "px-4 py-3 rounded-xl text-sm font-bold animate-fade-in flex items-center gap-2",
                                    uploadMessage.includes('success')
                                        ? "bg-green-50 text-green-700 border border-green-100"
                                        : "bg-red-50 text-red-700 border border-red-100"
                                )}>
                                    <div className={cn("w-1.5 h-1.5 rounded-full", uploadMessage.includes('success') ? "bg-green-600" : "bg-red-600")} />
                                    {uploadMessage}
                                </div>
                            )}

                            <Button type="submit" className="w-full" isLoading={isUploading} disabled={!file || !selectedPlatform}>
                                <Upload className="w-4 h-4 mr-2" />
                                Upload Certificate
                            </Button>
                        </form>
                    </Card>

                    {/* Recent Certificates */}
                    <Card className="lg:col-span-2">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center text-primary-600">
                                    <FileText className="w-5 h-5" />
                                </div>
                                <h2 className="text-xl font-bold text-slate-900">Recent Certificates</h2>
                            </div>
                        </div>

                        {dashboardData && dashboardData.recent_certificates.length > 0 ? (
                            <div className="overflow-x-auto -mx-6">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-slate-100 text-slate-500 text-xs font-black uppercase tracking-widest">
                                            <th className="px-6 py-4 text-left">Certificate Info</th>
                                            <th className="px-6 py-4 text-left">Status</th>
                                            <th className="px-6 py-4 text-left">Verified By</th>
                                            <th className="px-6 py-4 text-left">Detail</th>
                                            <th className="px-6 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {dashboardData.recent_certificates.map((cert) => (
                                            <tr key={cert.id} className="group hover:bg-slate-50/50 transition-colors">
                                                <td className="px-6 py-5">
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-slate-900 group-hover:text-primary-600 transition-colors uppercase text-sm tracking-tight">{cert.file_name}</span>
                                                        <div className="flex items-center gap-2 mt-1.5">
                                                            <span className="px-2 py-0.5 bg-slate-100 text-[10px] font-black text-slate-500 rounded uppercase tracking-tighter">{cert.platform_name}</span>
                                                            <span className="text-[10px] font-bold text-slate-400">{formatDate(cert.uploaded_at)}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <span className={cn(
                                                        "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1.5 shadow-sm",
                                                        cert.verification_status === 'accepted' ? "bg-green-100 text-green-700 shadow-green-200/20" :
                                                            cert.verification_status === 'rejected' ? "bg-red-100 text-red-700 shadow-red-200/20" :
                                                                "bg-yellow-100 text-yellow-700 shadow-yellow-200/20"
                                                    )}>
                                                        <div className={cn("w-1 h-1 rounded-full", cert.verification_status === 'accepted' ? "bg-green-600" : cert.verification_status === 'rejected' ? "bg-red-600" : "bg-yellow-600")} />
                                                        {cert.verification_status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <span className="text-sm font-bold text-slate-600">
                                                        {cert.verification_status !== 'pending' ? cert.verified_by_name || '-' : '-'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5">
                                                    {cert.verification_status === 'rejected' && cert.rejection_reason ? (
                                                        <div className="max-w-[200px]">
                                                            <p className="text-xs font-bold text-red-600 line-clamp-2">
                                                                {cert.rejection_reason}
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs font-bold text-slate-400 italic">No details</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-5 text-right">
                                                    <Button
                                                        size="sm"
                                                        variant="danger"
                                                        onClick={() => handleDelete(cert.id)}
                                                        className="w-9 h-9 p-0 rounded-xl transition-all shadow-sm"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-20 px-6">
                                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <FileText className="w-10 h-10 text-slate-300" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-2">No certificates yet</h3>
                                <p className="text-sm text-slate-500 max-w-[280px] mx-auto">Upload your first certificate to get started with the verification process.</p>
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
}
