'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Users, Settings, Building2, Layers, Monitor, Plus, Pencil, Trash2, ArrowLeft, X, CheckCircle } from 'lucide-react';
import api from '@/lib/api';
import Link from 'next/link';
import { cn } from '@/lib/utils';

type Tab = 'departments' | 'sections' | 'platforms';

interface Dept { id: number; name: string; }
interface Sec { id: number; name: string; }
interface Cat { id: number; platform_id: number; name: string; }
interface Plat { id: number; name: string; has_categories: boolean; categories?: Cat[]; }

export default function FacultySettingsPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [tab, setTab] = useState<Tab>('departments');
    const [departments, setDepartments] = useState<Dept[]>([]);
    const [sections, setSections] = useState<Sec[]>([]);
    const [platforms, setPlatforms] = useState<Plat[]>([]);
    const [editModal, setEditModal] = useState<{ type: Tab | 'category'; item: any; platformId?: number } | null>(null);
    const [addModal, setAddModal] = useState<{ type: Tab | 'category'; platformId?: number } | null>(null);
    const [formName, setFormName] = useState('');
    const [hasCategories, setHasCategories] = useState(false);
    const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!user || user.role !== 'faculty' || !user.is_department_admin) { 
            router.push('/faculty/dashboard'); 
            return; 
        }
        loadAll();
    }, [user]);

    const loadAll = async () => {
        const [dRes, sRes, pRes] = await Promise.all([
            api.get('/faculty/departments'),
            api.get('/faculty/sections'),
            api.get('/platforms'),
        ]);
        setDepartments(dRes.data.departments || []);
        setSections(sRes.data.sections || []);
        // Load categories for each platform
        const plats: Plat[] = pRes.data.platforms || [];
        const platsWithCats = await Promise.all(plats.map(async (p) => {
            if (p.has_categories) {
                const cRes = await api.get(`/platforms/${p.id}/categories`);
                return { ...p, categories: cRes.data.categories || [] };
            }
            return { ...p, categories: [] };
        }));
        setPlatforms(platsWithCats);
    };

    const flash = (text: string, ok: boolean) => {
        setMsg({ text, ok });
        setTimeout(() => setMsg(null), 3000);
    };

    const openAdd = (type: Tab | 'category', platformId?: number) => {
        setFormName('');
        setHasCategories(false);
        setAddModal({ type, platformId });
    };

    const openEdit = (type: Tab | 'category', item: any, platformId?: number) => {
        setFormName(item.name);
        setHasCategories(item.has_categories || false);
        setEditModal({ type, item, platformId });
    };

    const handleSaveAdd = async () => {
        if (!formName.trim() || !addModal) return;
        setSaving(true);
        try {
            if (addModal.type === 'departments') {
                await api.post('/faculty/departments', { name: formName });
            } else if (addModal.type === 'sections') {
                await api.post('/faculty/sections', { name: formName });
            } else if (addModal.type === 'platforms') {
                await api.post('/faculty/platforms', { name: formName, has_categories: hasCategories });
            } else if (addModal.type === 'category' && addModal.platformId) {
                await api.post(`/faculty/platforms/${addModal.platformId}/categories`, { name: formName });
            }
            setAddModal(null);
            await loadAll();
            flash('Created successfully!', true);
        } catch (e: any) {
            flash(e.response?.data?.error || 'Failed to create', false);
        } finally { setSaving(false); }
    };

    const handleSaveEdit = async () => {
        if (!formName.trim() || !editModal) return;
        setSaving(true);
        try {
            if (editModal.type === 'departments') {
                await api.put(`/faculty/departments/${editModal.item.id}`, { name: formName });
            } else if (editModal.type === 'sections') {
                await api.put(`/faculty/sections/${editModal.item.id}`, { name: formName });
            } else if (editModal.type === 'platforms') {
                await api.put(`/faculty/platforms/${editModal.item.id}`, { name: formName, has_categories: hasCategories });
            }
            setEditModal(null);
            await loadAll();
            flash('Updated successfully!', true);
        } catch (e: any) {
            flash(e.response?.data?.error || 'Failed to update', false);
        } finally { setSaving(false); }
    };

    const handleDelete = async (type: Tab | 'category', id: number) => {
        if (!confirm('Are you sure you want to delete this?')) return;
        try {
            if (type === 'departments') await api.delete(`/faculty/departments/${id}`);
            else if (type === 'sections') await api.delete(`/faculty/sections/${id}`);
            else if (type === 'platforms') await api.delete(`/faculty/platforms/${id}`);
            else if (type === 'category') await api.delete(`/faculty/platforms/categories/${id}`);
            await loadAll();
            flash('Deleted successfully!', true);
        } catch (e: any) {
            flash(e.response?.data?.error || 'Failed to delete', false);
        }
    };

    const tabs = [
        { key: 'departments' as Tab, label: 'Departments', icon: Building2 },
        { key: 'sections' as Tab, label: 'Sections', icon: Layers },
        { key: 'platforms' as Tab, label: 'Platforms', icon: Monitor },
    ];

    return (
        <div className="min-h-screen">
            {/* Header */}
            <div className="glass border-b border-white/20 sticky top-0 z-50">
                <div className="container-custom py-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-tr from-secondary-600 to-secondary-400 rounded-2xl flex items-center justify-center shadow-lg shadow-secondary-500/20 text-white">
                                <Settings className="w-6 h-6" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Settings</h1>
                                <p className="text-sm font-medium text-slate-500">Manage Departments, Sections & Platforms</p>
                            </div>
                        </div>
                        <Link href="/faculty/dashboard">
                            <Button variant="secondary" size="sm" className="rounded-xl">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Dashboard
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            <div className="container-custom py-10 max-w-4xl space-y-6">
                {msg && (
                    <div className={cn('px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-2 animate-fade-in', msg.ok ? 'bg-green-50 border border-green-100 text-green-700' : 'bg-red-50 border border-red-100 text-red-700')}>
                        {msg.ok ? <CheckCircle className="w-4 h-4" /> : <X className="w-4 h-4" />}
                        {msg.text}
                    </div>
                )}

                {/* Tabs */}
                <div className="flex gap-2 p-1.5 bg-slate-100/80 rounded-2xl w-fit">
                    {tabs.map(t => (
                        <button
                            key={t.key}
                            onClick={() => setTab(t.key)}
                            className={cn(
                                'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all',
                                tab === t.key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                            )}
                        >
                            <t.icon className="w-4 h-4" />
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* Departments Tab */}
                {tab === 'departments' && (
                    <Card>
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center text-primary-600">
                                    <Building2 className="w-5 h-5" />
                                </div>
                                <h2 className="text-xl font-bold text-slate-900">Departments</h2>
                            </div>
                            <Button size="sm" onClick={() => openAdd('departments')} className="rounded-xl">
                                <Plus className="w-4 h-4 mr-1" /> Add Department
                            </Button>
                        </div>
                        <div className="space-y-2">
                            {departments.length === 0 && <p className="text-slate-400 text-sm text-center py-8">No departments yet. Add one to get started.</p>}
                            {departments.map(d => (
                                <div key={d.id} className="flex items-center justify-between px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors">
                                    <span className="font-semibold text-slate-700">{d.name}</span>
                                    <div className="flex gap-2">
                                        <button onClick={() => openEdit('departments', d)} className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-primary-600 hover:border-primary-200 transition-all">
                                            <Pencil className="w-3.5 h-3.5" />
                                        </button>
                                        <button onClick={() => handleDelete('departments', d.id)} className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-red-600 hover:border-red-200 transition-all">
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                )}

                {/* Sections Tab */}
                {tab === 'sections' && (
                    <Card>
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-secondary-100 rounded-xl flex items-center justify-center text-secondary-600">
                                    <Layers className="w-5 h-5" />
                                </div>
                                <h2 className="text-xl font-bold text-slate-900">Sections</h2>
                            </div>
                            <Button size="sm" onClick={() => openAdd('sections')} className="rounded-xl">
                                <Plus className="w-4 h-4 mr-1" /> Add Section
                            </Button>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            {sections.length === 0 && <p className="text-slate-400 text-sm text-center py-8 w-full">No sections yet.</p>}
                            {sections.map(s => (
                                <div key={s.id} className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors">
                                    <span className="font-black text-slate-700 text-sm uppercase tracking-widest">{s.name}</span>
                                    <div className="flex gap-1 ml-2">
                                        <button onClick={() => openEdit('sections', s)} className="w-6 h-6 rounded-md bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-primary-600 hover:border-primary-200 transition-all">
                                            <Pencil className="w-3 h-3" />
                                        </button>
                                        <button onClick={() => handleDelete('sections', s.id)} className="w-6 h-6 rounded-md bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-red-600 hover:border-red-200 transition-all">
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                )}

                {/* Platforms Tab */}
                {tab === 'platforms' && (
                    <div className="space-y-4">
                        <div className="flex justify-end">
                            <Button size="sm" onClick={() => openAdd('platforms')} className="rounded-xl">
                                <Plus className="w-4 h-4 mr-1" /> Add Platform
                            </Button>
                        </div>
                        {platforms.length === 0 && <Card><p className="text-slate-400 text-sm text-center py-8">No platforms yet.</p></Card>}
                        {platforms.map(p => (
                            <Card key={p.id} className="p-0 overflow-hidden">
                                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600">
                                            <Monitor className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <span className="font-bold text-slate-900">{p.name}</span>
                                            {p.has_categories && <span className="ml-2 px-2 py-0.5 bg-primary-100 text-primary-700 text-[10px] font-black rounded uppercase tracking-wider">Has Categories</span>}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        {p.has_categories && (
                                            <Button size="sm" variant="secondary" onClick={() => openAdd('category', p.id)} className="h-8 px-3 text-xs rounded-lg">
                                                <Plus className="w-3 h-3 mr-1" /> Category
                                            </Button>
                                        )}
                                        <button onClick={() => openEdit('platforms', p)} className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-primary-600 hover:border-primary-200 transition-all">
                                            <Pencil className="w-3.5 h-3.5" />
                                        </button>
                                        <button onClick={() => handleDelete('platforms', p.id)} className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-red-600 hover:border-red-200 transition-all">
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                                {p.has_categories && (
                                    <div className="px-5 py-4">
                                        <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Categories</p>
                                        <div className="flex flex-wrap gap-2">
                                            {(p.categories || []).length === 0 && <span className="text-xs text-slate-400">No categories yet.</span>}
                                            {(p.categories || []).map(c => (
                                                <div key={c.id} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-lg text-sm font-semibold text-slate-700">
                                                    {c.name}
                                                    <button onClick={() => handleDelete('category', c.id)} className="w-4 h-4 rounded flex items-center justify-center text-slate-400 hover:text-red-600 transition-colors ml-1">
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Add Modal */}
            <Modal isOpen={!!addModal} onClose={() => setAddModal(null)} title={`Add ${addModal?.type === 'category' ? 'Category' : addModal?.type?.slice(0, -1)}`} size="sm">
                <div className="space-y-4">
                    <Input
                        label="Name"
                        placeholder={`Enter ${addModal?.type === 'category' ? 'category' : addModal?.type?.slice(0, -1)} name`}
                        value={formName}
                        onChange={e => setFormName(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSaveAdd()}
                    />
                    {addModal?.type === 'platforms' && (
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" checked={hasCategories} onChange={e => setHasCategories(e.target.checked)} className="w-4 h-4 rounded" />
                            <span className="text-sm font-semibold text-slate-700">Has sub-categories</span>
                        </label>
                    )}
                    <div className="flex gap-3 pt-2">
                        <Button onClick={handleSaveAdd} isLoading={saving} className="flex-1">Create</Button>
                        <Button variant="secondary" onClick={() => setAddModal(null)} className="flex-1">Cancel</Button>
                    </div>
                </div>
            </Modal>

            {/* Edit Modal */}
            <Modal isOpen={!!editModal} onClose={() => setEditModal(null)} title={`Edit ${editModal?.type?.slice(0, -1)}`} size="sm">
                <div className="space-y-4">
                    <Input
                        label="Name"
                        value={formName}
                        onChange={e => setFormName(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSaveEdit()}
                    />
                    {editModal?.type === 'platforms' && (
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" checked={hasCategories} onChange={e => setHasCategories(e.target.checked)} className="w-4 h-4 rounded" />
                            <span className="text-sm font-semibold text-slate-700">Has sub-categories</span>
                        </label>
                    )}
                    <div className="flex gap-3 pt-2">
                        <Button onClick={handleSaveEdit} isLoading={saving} className="flex-1">Save Changes</Button>
                        <Button variant="secondary" onClick={() => setEditModal(null)} className="flex-1">Cancel</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
