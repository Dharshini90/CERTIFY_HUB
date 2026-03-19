'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Users, ArrowLeft, Pencil, Trash2, CheckCircle, X, ShieldCheck, ShieldAlert, Shield } from 'lucide-react';
import api from '@/lib/api';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { RegisterFacultyModal } from '@/app/hod/dashboard/RegisterFacultyModal';
import { UserPlus } from 'lucide-react';

interface Faculty { id: string; name: string; email: string; department?: string; is_department_admin: boolean; created_at: string; }

export default function FacultyListPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [faculty, setFaculty] = useState<Faculty[]>([]);
    const [editItem, setEditItem] = useState<Faculty | null>(null);
    const [editName, setEditName] = useState('');
    const [editEmail, setEditEmail] = useState('');
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

    useEffect(() => {
        if (!user) { router.push('/'); return; }
        if (user.role !== 'faculty' && user.role !== 'hod') { router.push('/'); return; }
        
        // If faculty, must be a department admin to view this page
        if (user.role === 'faculty' && !user.is_department_admin) {
            router.push('/faculty/dashboard');
            return;
        }
        
        loadFaculty();
    }, [user]);

    const loadFaculty = async () => {
        try {
            const res = await api.get('/faculty/faculty-list');
            setFaculty(res.data.faculty || []);
        } catch { flash('Failed to load faculty list', false); }
    };

    const flash = (text: string, ok: boolean) => {
        setMsg({ text, ok });
        setTimeout(() => setMsg(null), 3000);
    };

    const openEdit = (f: Faculty) => {
        setEditItem(f);
        setEditName(f.name);
        setEditEmail(f.email);
    };

    const handleSaveEdit = async () => {
        if (!editItem) return;
        setSaving(true);
        try {
            await api.put(`/faculty/faculty-list/${editItem.id}`, { name: editName, email: editEmail });
            setEditItem(null);
            await loadFaculty();
            flash('Faculty updated successfully!', true);
        } catch (e: any) {
            flash(e.response?.data?.error || 'Failed to update', false);
        } finally { setSaving(false); }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Delete "${name}"? This action cannot be undone.`)) return;
        try {
            await api.delete(`/faculty/faculty-list/${id}`);
            await loadFaculty();
            flash('Faculty deleted.', true);
        } catch (e: any) {
            flash(e.response?.data?.error || 'Failed to delete', false);
        }
    };

    const handleToggleAdmin = async (f: Faculty) => {
        const action = f.is_department_admin ? 'revoke' : 'grant';
        if (!confirm(`${action.charAt(0).toUpperCase() + action.slice(1)} admin privileges for ${f.name}?`)) return;
        
        try {
            await api.put(`/faculty/faculty-list/${f.id}`, { 
                is_department_admin: !f.is_department_admin 
            });
            await loadFaculty();
            flash(`Admin privileges ${f.is_department_admin ? 'revoked' : 'granted'} successfully!`, true);
        } catch (e: any) {
            flash(e.response?.data?.error || 'Failed to update admin status', false);
        }
    };

    return (
        <div className="min-h-screen">
            {/* Header */}
            <div className="glass border-b border-white/20 sticky top-0 z-50">
                <div className="container-custom py-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-tr from-secondary-600 to-secondary-400 rounded-2xl flex items-center justify-center shadow-lg shadow-secondary-500/20 text-white">
                                <Users className="w-6 h-6" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Faculty List</h1>
                                <p className="text-sm font-medium text-slate-500">Manage faculty accounts</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button 
                                variant="secondary" 
                                size="sm" 
                                onClick={() => setIsRegisterModalOpen(true)}
                                className="rounded-xl border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                            >
                                <UserPlus className="w-4 h-4 mr-2" />
                                Register Faculty
                            </Button>
                            <Link href="/faculty/dashboard">
                                <Button variant="secondary" size="sm" className="rounded-xl">
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Back to Dashboard
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container-custom py-10 max-w-5xl space-y-6">
                {msg && (
                    <div className={cn('px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-2 animate-fade-in', msg.ok ? 'bg-green-50 border border-green-100 text-green-700' : 'bg-red-50 border border-red-100 text-red-700')}>
                        {msg.ok ? <CheckCircle className="w-4 h-4" /> : <X className="w-4 h-4" />}
                        {msg.text}
                    </div>
                )}

                <Card className="overflow-hidden p-0 border-none shadow-xl">
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-secondary-100 rounded-xl flex items-center justify-center text-secondary-600">
                                <Users className="w-5 h-5" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-900">All Faculty Members</h2>
                        </div>
                        <div className="text-xs font-black text-slate-400 uppercase tracking-widest">
                            Total: <span className="text-slate-900">{faculty.length}</span>
                        </div>
                    </div>

                    <div className="overflow-x-auto min-h-[200px]">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50/50 text-slate-500 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
                                    <th className="px-6 py-4 text-left">#</th>
                                    <th className="px-6 py-4 text-left">Name</th>
                                    <th className="px-6 py-4 text-left">Email</th>
                                    <th className="px-6 py-4 text-left">Department</th>
                                    <th className="px-6 py-4 text-left">Joined</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {faculty.length === 0 && (
                                <td colSpan={6} className="px-6 py-16 text-center text-slate-400 font-medium text-sm">No faculty members found.</td>
                                )}
                                {faculty.map((f, i) => (
                                    <tr key={f.id} className="group hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-5">
                                            <span className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center font-black text-slate-500 text-xs">{i + 1}</span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-slate-900 group-hover:text-secondary-600 transition-all duration-300">{f.name}</span>
                                                    {f.is_department_admin && (
                                                        <span className="flex items-center gap-1 px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-md text-[9px] font-black uppercase tracking-widest border border-indigo-100 shadow-sm animate-fade-in">
                                                            <ShieldCheck className="w-3 h-3" />
                                                            Admin
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    {f.id === user?.id && <span className="text-[10px] font-black text-secondary-500 uppercase tracking-widest">You</span>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="text-sm text-slate-600 font-medium">{f.email}</span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="text-sm text-slate-600">{f.department || <span className="text-slate-400 italic">Not Assigned</span>}</span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="text-xs font-bold text-slate-400">{formatDate(f.created_at)}</span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex justify-end gap-2">
                                                {(user?.role === 'hod' || user?.is_department_admin) && f.id !== user?.id && (
                                                    <Button
                                                        size="sm"
                                                        variant="secondary"
                                                        onClick={() => handleToggleAdmin(f)}
                                                        className={cn(
                                                            "w-9 h-9 p-0 rounded-xl transition-all shadow-sm",
                                                            f.is_department_admin 
                                                                ? "text-red-500 hover:bg-red-50 border-red-100" 
                                                                : "text-indigo-600 hover:bg-indigo-50 border-indigo-100"
                                                        )}
                                                        title={f.is_department_admin ? "Remove Admin Role" : "Make Department Admin"}
                                                    >
                                                        {f.is_department_admin ? <ShieldAlert className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                                                    </Button>
                                                )}
                                                {(user?.role === 'hod' || user?.is_department_admin) && f.id !== user?.id && (
                                                    <Button
                                                        size="sm"
                                                        variant="danger"
                                                        onClick={() => handleDelete(f.id, f.name)}
                                                        className="w-9 h-9 p-0 rounded-xl transition-all shadow-sm"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>

            {/* Edit Modal */}
            <Modal isOpen={!!editItem} onClose={() => setEditItem(null)} title="Edit Faculty" size="sm">
                <div className="space-y-4">
                    <Input label="Full Name" value={editName} onChange={e => setEditName(e.target.value)} placeholder="Faculty name" />
                    <Input label="Email" type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)} placeholder="faculty@university.edu" />
                    <div className="flex gap-3 pt-2">
                        <Button onClick={handleSaveEdit} isLoading={saving} className="flex-1">Save Changes</Button>
                        <Button variant="secondary" onClick={() => setEditItem(null)} className="flex-1">Cancel</Button>
                    </div>
                </div>
            </Modal>

            <RegisterFacultyModal 
                isOpen={isRegisterModalOpen}
                onClose={() => setIsRegisterModalOpen(false)}
                onSuccess={loadFaculty}
                department={user?.department}
            />
        </div>
    );
}
