'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { LogOut, Download, Eye, FileDown, Search, UserPlus, Users, CheckCircle, XCircle, Settings, List, UserCircle, Trash2 } from 'lucide-react';
import { MobileNav, NavItem } from '@/components/ui/MobileNav';
import api from '@/lib/api';
import { StudentListItem, Certificate, Platform, Category, PaginatedResponse } from '@/types';
import { formatDate, isPDF, isImage, cn } from '@/lib/utils';
import { RegisterFacultyModal } from '@/app/hod/dashboard/RegisterFacultyModal';


export default function FacultyDashboard() {
    const router = useRouter();
    const { user, logout } = useAuth();
    const [students, setStudents] = useState<StudentListItem[]>([]);
    const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
    const [search, setSearch] = useState('');
    const [year, setYear] = useState('');
    const [department, setDepartment] = useState('');
    const [section, setSection] = useState('');
    const [platforms, setPlatforms] = useState<Platform[]>([]);
    const [selectedStudent, setSelectedStudent] = useState<StudentListItem | null>(null);
    const [certificates, setCertificates] = useState<Certificate[]>([]);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [authToken, setAuthToken] = useState<string | null>(null);
    const [departments, setDepartments] = useState<{ id: number; name: string }[]>([]);
    const [sections, setSections] = useState<{ id: number; name: string }[]>([]);
    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

    useEffect(() => {
        if (!user || user.role !== 'faculty') {
            router.push('/faculty/login');
            return;
        }
        setAuthToken(localStorage.getItem('token'));
        loadStudents();
        loadPlatforms();
        loadDeptSec();
    }, [user, router, pagination.page]);

    const loadStudents = async () => {
        try {
            const params: any = { page: pagination.page, limit: pagination.limit };
            if (search) params.search = search;
            if (year) params.year = year;
            if (department) params.department = department;
            if (section) params.section = section;

            const response = await api.get<PaginatedResponse<StudentListItem>>('/faculty/students', { params });
            setStudents(response.data.data);
            setPagination(response.data.pagination);
        } catch (error) {
            console.error('Failed to load students:', error);
        }
    };

    const loadPlatforms = async () => {
        try {
            const response = await api.get('/platforms');
            setPlatforms(response.data.platforms);
        } catch (error) {
            console.error('Failed to load platforms:', error);
        }
    };

    const loadDeptSec = async () => {
        try {
            const [dRes, sRes] = await Promise.all([
                api.get('/faculty/departments'),
                api.get('/faculty/sections'),
            ]);
            setDepartments(dRes.data.departments || []);
            setSections(sRes.data.sections || []);
        } catch { /* silent */ }
    };

    const handleViewCertificates = async (student: StudentListItem) => {
        try {
            const response = await api.get(`/faculty/students/${student.id}/certificates`);
            setCertificates(response.data.certificates);
            setSelectedStudent(student);
            setIsViewModalOpen(true);
        } catch (error) {
            console.error('Failed to load certificates:', error);
        }
    };

    const handleVerify = async (certificateId: string, status: 'accepted' | 'rejected' | 'pending', rejectionReason?: string) => {
        // Optimistic update
        const originalCertificates = [...certificates];
        setCertificates(prev => prev.map(cert =>
            cert.id === certificateId
                ? { ...cert, verification_status: status as any, rejection_reason: status === 'pending' ? null : rejectionReason || cert.rejection_reason }
                : cert
        ));

        try {
            await api.put(`/faculty/certificates/${certificateId}/verify`, {
                status,
                rejection_reason: status === 'pending' ? null : rejectionReason
            });
            // Reload from server to ensure sync
            if (selectedStudent) {
                const response = await api.get(`/faculty/students/${selectedStudent.id}/certificates`);
                setCertificates(response.data.certificates);
            }
            loadStudents(); // Refresh student list
        } catch (error) {
            console.error('Failed to verify certificate:', error);
            // Rollback on error
            setCertificates(originalCertificates);
        }
    };

    const handleDownloadStudent = async (studentId: string, studentName: string) => {
        try {
            const response = await api.get(`/faculty/download/student/${studentId}`, {
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${studentName}_certificates.zip`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Failed to download:', error);
        }
    };

    const handleDeleteStudent = async (student: StudentListItem) => {
        if (!window.confirm(`Are you sure you want to delete ${student.name}? This will permanently remove all their profile data and certificates.`)) {
            return;
        }

        try {
            await api.delete(`/faculty/students/${student.id}`);
            loadStudents(); // Refresh the list
        } catch (error) {
            console.error('Failed to delete student:', error);
            alert('Failed to delete student. Please try again.');
        }
    };

    const handleBulkDownload = async () => {
        try {
            const filters: any = {};
            if (year) filters.year = year;
            if (department) filters.department = department;
            if (section) filters.section = section;

            const response = await api.post('/faculty/download/bulk', filters, {
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'bulk_certificates.zip');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Failed to bulk download:', error);
        }
    };

    const handleExport = async (format: 'excel') => {
        setIsExporting(true);
        try {
            const filters: any = { format };
            if (year) filters.year = year;
            if (department) filters.department = department;
            if (section) filters.section = section;
            if (search) filters.search = search;

            const response = await api.post('/faculty/export', filters, {
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `certificate_report.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Failed to export:', error);
        } finally {
            setIsExporting(false);
        }
    };

    const handleLogout = () => {
        logout();
        router.push('/');
    };

    const navItems: NavItem[] = [
        { 
            label: 'Profile', 
            icon: <UserCircle />, 
            onClick: () => router.push('/faculty/profile') 
        },
        ...(user?.is_department_admin ? [
            { 
                label: 'Create Faculty', 
                icon: <UserPlus />, 
                onClick: () => setIsRegisterModalOpen(true) 
            },
            { 
                label: 'Faculty List', 
                icon: <List />, 
                onClick: () => router.push('/faculty/faculty-list') 
            },
            { 
                label: 'Settings', 
                icon: <Settings />, 
                onClick: () => router.push('/faculty/settings') 
            },
        ] : []),
        { 
            label: 'Logout', 
            icon: <LogOut />, 
            onClick: handleLogout,
            variant: 'danger' 
        },
    ];

    const handleSearch = () => {
        setPagination({ ...pagination, page: 1 });
        loadStudents();
    };

    return (
        <div className="min-h-screen bg-slate-50 overflow-x-hidden">
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-50 w-full">

                <div className="container-custom py-3">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-600 rounded-[12px] flex items-center justify-center shadow-md text-white">
                                <Users className="w-5 h-5" />
                            </div>
                            <div>
                                <h1 className="text-xl font-black text-slate-900 tracking-tight">CertifyHub</h1>
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Faculty Portal</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-3 border-r border-slate-200 pr-4 mr-2">
                                <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-lg border border-indigo-200">
                                    {user?.name ? user.name.charAt(0).toUpperCase() : 'F'}
                                </div>
                                <div className="hidden lg:block text-left">
                                    <p className="text-sm font-bold text-slate-900">{user?.name}</p>
                                    <p className="text-xs font-medium text-slate-500 capitalize">{user?.role}</p>
                                </div>
                            </div>
                            <div className="hidden md:flex items-center gap-3">
                                <Button 
                                    variant="secondary" 
                                    onClick={() => router.push('/faculty/profile')} 
                                    className="!py-2 !px-4 !rounded-xl text-[14px] !font-semibold border-slate-200 shadow-sm hover:bg-slate-50 flex items-center"
                                >
                                    <UserCircle className="w-[18px] h-[18px] text-slate-600" />
                                    <span className="hidden md:inline ml-2">Profile</span>
                                </Button>
                                
                                {user?.is_department_admin && (
                                    <>
                                        <Button 
                                            variant="secondary" 
                                            onClick={() => setIsRegisterModalOpen(true)} 
                                            className="!py-2 !px-3 !rounded-xl text-[14px] !font-semibold border-slate-200 shadow-sm hover:bg-slate-50 hidden md:flex items-center"
                                        >
                                            <UserPlus className="w-[18px] h-[18px] text-slate-600" />
                                            <span className="hidden lg:inline ml-2">Register Faculty</span>
                                        </Button>
                                        <Button 
                                            variant="secondary" 
                                            onClick={() => router.push('/faculty/faculty-list')} 
                                            className="!py-2 !px-3 !rounded-xl text-[14px] !font-semibold border-slate-200 shadow-sm hover:bg-slate-50 hidden md:flex items-center"
                                        >
                                            <List className="w-[18px] h-[18px] text-slate-600" />
                                            <span className="hidden lg:inline ml-2">Faculty List</span>
                                        </Button>
                                        <Button 
                                            variant="secondary" 
                                            onClick={() => router.push('/faculty/settings')} 
                                            className="!py-2 !px-3 !rounded-xl text-[14px] !font-semibold border-slate-200 shadow-sm hover:bg-slate-50 hidden lg:flex items-center"
                                        >
                                            <Settings className="w-[18px] h-[18px] text-slate-600" />
                                            <span className="hidden lg:inline ml-2">Settings</span>
                                        </Button>
                                    </>
                                )}
                                <Button variant="secondary" onClick={handleLogout} className="!py-2 !px-4 !rounded-xl text-[14px] !font-semibold border-slate-200 shadow-sm hover:bg-slate-50 flex items-center">
                                    <LogOut className="w-[18px] h-[18px] text-slate-600 hover:text-red-500 transition-colors" />
                                    <span className="hidden md:inline ml-2">Logout</span>
                                </Button>
                            </div>
                            <MobileNav items={navItems} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="container-custom py-10 space-y-8">
                {/* Filters and Actions */}
                <Card className="glass-dark border-none shadow-2xl">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
                        <div className="md:col-span-2">
                            <Input
                                placeholder="Search students..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                className="bg-white/50"
                            />
                        </div>
                        <Select
                            value={year}
                            onChange={(e) => setYear(e.target.value)}
                            options={[
                                { value: '', label: 'All Years' },
                                { value: '1st year', label: '1st Year' },
                                { value: '2nd year', label: '2nd Year' },
                                { value: '3rd year', label: '3rd Year' },
                            ]}
                            className="bg-white/50"
                        />
                        <Select
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
                            options={[
                                { value: '', label: 'All Departments' },
                                ...departments.map(d => ({ value: d.name, label: d.name }))
                            ]}
                            className="bg-white/50"
                        />
                        <Select
                            value={section}
                            onChange={(e) => setSection(e.target.value)}
                            options={[
                                { value: '', label: 'All Sections' },
                                ...sections.map(s => ({ value: s.name, label: s.name }))
                            ]}
                            className="bg-white/50"
                        />
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-6">
                        <div className="flex items-center gap-3">
                            <Button onClick={handleSearch} className="px-8">
                                <Search className="w-4 h-4 mr-2" />
                                Search
                            </Button>
                            <Button variant="secondary" onClick={handleBulkDownload}>
                                <Download className="w-4 h-4 mr-2" />
                                Bulk Zip
                            </Button>
                        </div>

                        <div className="flex items-center gap-3 p-1.5 bg-slate-100/50 rounded-2xl">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4 mr-2">Export Pool</span>
                            <Button variant="secondary" size="sm" onClick={() => handleExport('excel')} isLoading={isExporting} className="bg-white border-none shadow-sm h-9">
                                <FileDown className="w-4 h-4 mr-2 text-green-600" />
                                Excel
                            </Button>
                        </div>
                    </div>
                </Card>

                {/* Student List */}
                <Card className="overflow-hidden p-0 border-none shadow-xl">
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-secondary-100 rounded-xl flex items-center justify-center text-secondary-600">
                                <Users className="w-5 h-5" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-900">Registered Students</h2>
                        </div>
                        <div className="text-xs font-black text-slate-400 capitalize uppercase tracking-widest">
                            Total: <span className="text-slate-900">{pagination.total}</span>
                        </div>
                    </div>

                    <div className="overflow-x-auto min-h-[400px]">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50/50 text-slate-500 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
                                    <th className="px-6 py-4 text-left">Roll Number</th>
                                    <th className="px-6 py-4 text-left">Name / Info</th>
                                    <th className="px-6 py-4 text-left">Year / Dept</th>
                                    <th className="px-6 py-4 text-left">Section</th>
                                    <th className="px-6 py-4 text-left">Verified By</th>
                                    <th className="px-6 py-4 text-left">Progress</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {students.map((student) => (
                                    <tr key={student.id} className="group hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-5">
                                            <span className="font-mono text-xs font-bold text-slate-400">{student.roll_number}</span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-900 group-hover:text-secondary-600 transition-colors">{student.name}</span>
                                                <span className="text-[10px] text-slate-400 font-medium">Student Account</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-slate-700 capitalize">{student.year}</span>
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{student.department}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-xs uppercase">{student.section}</span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col max-w-[150px]">
                                                {student.verified_by_names ? (
                                                    <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100 truncate shadow-sm" title={student.verified_by_names}>
                                                        {student.verified_by_names}
                                                    </span>
                                                ) : (
                                                    <span className="text-[11px] font-medium text-slate-400 italic">No verifier yet</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col gap-1.5 min-w-[120px]">
                                                <div className="flex justify-between text-[10px] font-black uppercase tracking-tighter">
                                                    <span className="text-slate-400">Verified</span>
                                                    <span className="text-secondary-600">{student.verified_certificates} / {student.total_certificates}</span>
                                                </div>
                                                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-secondary-500 rounded-full transition-all duration-500"
                                                        style={{ width: `${student.total_certificates > 0 ? (student.verified_certificates / student.total_certificates) * 100 : 0}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    onClick={() => handleViewCertificates(student)}
                                                    className="w-10 h-10 p-0 rounded-xl bg-white border-slate-100 hover:border-secondary-200 hover:text-secondary-600 transition-all shadow-sm"
                                                    title="View Certificates"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    onClick={() => handleDownloadStudent(student.id, student.name)}
                                                    className="w-10 h-10 p-0 rounded-xl bg-white border-slate-100 hover:border-primary-200 hover:text-primary-600 transition-all shadow-sm"
                                                    title="Download All"
                                                >
                                                    <Download className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    onClick={() => handleDeleteStudent(student)}
                                                    className="w-10 h-10 p-0 rounded-xl bg-white border-slate-100 hover:border-red-200 hover:text-red-600 transition-all shadow-sm"
                                                    title="Delete Student"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <div className="p-6 bg-slate-50/30 border-t border-slate-100 flex items-center justify-center gap-6">
                            <Button
                                size="sm"
                                variant="secondary"
                                disabled={pagination.page === 1}
                                onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                                className="bg-white rounded-xl"
                            >
                                Previous
                            </Button>
                            <span className="text-xs font-black uppercase tracking-widest text-slate-400">
                                Page <span className="text-slate-900">{pagination.page}</span> of <span className="text-slate-900">{pagination.totalPages}</span>
                            </span>
                            <Button
                                size="sm"
                                variant="secondary"
                                disabled={pagination.page === pagination.totalPages}
                                onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                                className="bg-white rounded-xl"
                            >
                                Next
                            </Button>
                        </div>
                    )}
                </Card>
            </div>


            {/* Certificate Viewer Modal */}
            <Modal
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                title={`Student Profile: ${selectedStudent?.name}`}
                size="xl"
            >
                <div className="space-y-12 max-h-[80vh] overflow-y-auto pr-2 custom-scrollbar p-1">
                    {certificates.length === 0 ? (
                        <div className="text-center py-24 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200">
                            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                                <FileDown className="w-10 h-10 text-slate-300" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2">No certificates found</h3>
                            <p className="text-sm text-slate-500">This student hasn't uploaded any documents yet.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-12">
                            {certificates.map((cert, index) => (
                                <div key={cert.id} className="card p-0 overflow-hidden border-slate-200 hover:border-secondary-500/30 transition-all">
                                    {/* Certificate Header Info */}
                                    <div className="bg-slate-50/50 p-6 border-b border-slate-100 flex justify-between items-start">
                                        <div className="flex gap-5">
                                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 flex-shrink-0 text-secondary-600 font-black text-lg">
                                                {index + 1}
                                            </div>
                                            <div className="space-y-1">
                                                <h4 className="font-black text-slate-900 uppercase tracking-tight text-lg leading-none">
                                                    {cert.file_name}
                                                </h4>
                                                <div className="flex flex-wrap gap-x-4 gap-y-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                    <span className="flex items-center gap-1.5">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-secondary-400" />
                                                        {cert.platform_name}
                                                    </span>
                                                    {cert.category_name && (
                                                        <span className="flex items-center gap-1.5">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-primary-400" />
                                                            {cert.category_name}
                                                        </span>
                                                    )}
                                                    <span className="flex items-center gap-1.5">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                                                        {formatDate(cert.uploaded_at)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-2 text-right">
                                            <span className={cn(
                                                "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm flex items-center gap-2",
                                                cert.verification_status === 'accepted' ? "bg-green-100 text-green-700" :
                                                    cert.verification_status === 'rejected' ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"
                                            )}>
                                                <div className={cn("w-1.5 h-1.5 rounded-full", cert.verification_status === 'accepted' ? "bg-green-600" : cert.verification_status === 'rejected' ? "bg-red-600" : "bg-yellow-600")} />
                                                {cert.verification_status}
                                            </span>
                                            {cert.verified_by_name && cert.verification_status !== 'pending' && (
                                                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-1.5">
                                                    <span className="opacity-40 italic">Verified By</span>
                                                    <span className="underline underline-offset-4 decoration-indigo-200/50">{cert.verified_by_name}</span>
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Certificate Preview */}
                                    <div className="relative bg-slate-900/5 min-h-[400px] flex items-center justify-center group/preview">
                                        {isPDF(cert.file_name) ? (
                                            <iframe
                                                src={`/api/faculty/certificates/${cert.id}/file?auth_token=${authToken}#toolbar=0&view=Fit`}
                                                className="w-full h-[600px] border-none"
                                                title={cert.file_name}
                                            />
                                        ) : isImage(cert.file_name) ? (
                                            <div className="p-6 flex items-center justify-center w-full">
                                                <img
                                                    src={`/api/faculty/certificates/${cert.id}/file?auth_token=${authToken}`}
                                                    alt={cert.file_name}
                                                    className="max-w-full max-h-[600px] object-contain rounded-xl shadow-2xl border border-white/50"
                                                    loading="lazy"
                                                />
                                            </div>
                                        ) : (
                                            <div className="p-20 text-center">
                                                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                                                    <FileDown className="w-10 h-10 text-slate-300" />
                                                </div>
                                                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Preview unavailable</p>
                                                <a
                                                    href={`/api/faculty/certificates/${cert.id}/file?auth_token=${authToken}`}
                                                    download
                                                    className="mt-4 inline-flex items-center gap-2 text-primary-600 font-black text-xs uppercase tracking-widest hover:gap-3 transition-all"
                                                >
                                                    Download Original <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                                                </a>
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="bg-white p-6 border-t border-slate-100">
                                        {cert.verification_status === 'pending' ? (
                                            <div className="flex gap-4">
                                                <Button
                                                    variant="success"
                                                    className="flex-1 h-14 text-sm tracking-widest uppercase font-black shadow-green-500/20"
                                                    onClick={() => handleVerify(cert.id, 'accepted')}
                                                >
                                                    Accept
                                                </Button>
                                                <Button
                                                    variant="danger"
                                                    className="flex-1 h-14 text-sm tracking-widest uppercase font-black shadow-red-500/20"
                                                    onClick={() => {
                                                        const reason = prompt('Specify rejection reason (Required for student feedback):');
                                                        if (reason) {
                                                            handleVerify(cert.id, 'rejected', reason);
                                                        } else if (reason === '') {
                                                            alert('Rejection reason is mandatory');
                                                        }
                                                    }}
                                                >
                                                    Reject
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                                <div className="flex items-center gap-4">
                                                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", cert.verification_status === 'accepted' ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600")}>
                                                        {cert.verification_status === 'accepted' ? <CheckCircle className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Decision Recorded</p>
                                                        <div className="flex items-center gap-2">
                                                            <span className={cn("font-black text-sm uppercase tracking-tight", cert.verification_status === 'accepted' ? "text-green-600" : "text-red-600")}>
                                                                {cert.verification_status === 'accepted' ? 'Verified & Validated' : 'Rejected'}
                                                            </span>
                                                            {cert.verification_status === 'rejected' && cert.rejection_reason && (
                                                                <span className="text-slate-500 text-xs font-bold border-l border-slate-200 pl-2">
                                                                    {cert.rejection_reason}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    className="h-9 px-4 text-[10px] font-black uppercase tracking-widest bg-white rounded-xl"
                                                    onClick={() => handleVerify(cert.id, 'pending' as any)}
                                                >
                                                    Re-evaluate
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
                    <Button variant="secondary" onClick={() => setIsViewModalOpen(false)} className="rounded-xl px-10">
                        Exit Viewer
                    </Button>
                </div>
            </Modal>

            <RegisterFacultyModal 
                isOpen={isRegisterModalOpen}
                onClose={() => setIsRegisterModalOpen(false)}
                onSuccess={loadStudents}
                department={user?.department}
            />
        </div>
    );
}
