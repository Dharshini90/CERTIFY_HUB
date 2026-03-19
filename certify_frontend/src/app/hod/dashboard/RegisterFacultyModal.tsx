'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ShieldCheck, UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react';
import api from '@/lib/api';

interface RegisterFacultyModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    department?: string;
}

export const RegisterFacultyModal: React.FC<RegisterFacultyModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
    department
}) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        is_department_admin: false
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            await api.post('/auth/register-faculty', {
                ...formData,
                department // Automatically use the HOD's department
            });
            setSuccess(true);
            setTimeout(() => {
                onSuccess();
                handleClose();
            }, 2000);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to register faculty member');
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({ name: '', email: '', password: '', is_department_admin: false });
        setError(null);
        setSuccess(false);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Register New Faculty" size="md">
            {success ? (
                <div className="flex flex-col items-center justify-center py-10 text-center animate-fade-in">
                    <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4 text-green-600">
                        <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 mb-2">Registration Successful!</h3>
                    <p className="text-slate-500 font-medium">Faculty member has been added to {department}.</p>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 mb-6 transition-all duration-300">
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100 flex-shrink-0">
                                <ShieldCheck className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-700 leading-none mb-1">Administrative Action</p>
                                <p className="text-xs font-bold text-indigo-600/80 leading-relaxed">
                                    You are registering a faculty member for the <strong>{department}</strong> department. 
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1 ml-1 block" htmlFor="name">Full Name</label>
                            <Input
                                id="name"
                                placeholder="e.g. Dr. Anitha Lakshmi"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                                className="!py-3"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1 ml-1 block" htmlFor="email">Email Address</label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="faculty@college.edu"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                                className="!py-3"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1 ml-1 block" htmlFor="password">Temporary Password</label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                                className="!py-3"
                            />
                        </div>

                        <div className="pt-2">
                            <div 
                                className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer ${formData.is_department_admin ? 'border-indigo-500 bg-indigo-50' : 'border-slate-100 bg-slate-50'}`}
                                onClick={() => setFormData({ ...formData, is_department_admin: !formData.is_department_admin })}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white transition-colors ${formData.is_department_admin ? 'bg-indigo-600' : 'bg-slate-300'}`}>
                                        <ShieldCheck className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-slate-900 leading-none mb-1">Grant Department Admin Privileges</p>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Delegated Authority</p>
                                    </div>
                                </div>
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${formData.is_department_admin ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300'}`}>
                                    {formData.is_department_admin && <div className="w-2 h-2 bg-white rounded-full" />}
                                </div>
                            </div>
                            <p className="text-[10px] text-slate-400 font-bold mt-2 ml-1 leading-relaxed border-l-2 border-slate-200 pl-3">
                                Admin Privileges allow the faculty member to register other faculty members and manage departmental access.
                            </p>
                        </div>
                    </div>

                    {error && (
                        <div className="p-4 bg-red-50 text-red-700 text-xs font-bold rounded-xl flex items-center gap-3 border border-red-100 animate-shake">
                            <AlertCircle className="w-4 h-4" />
                            {error}
                        </div>
                    )}

                    <div className="flex gap-3 pt-6">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={handleClose}
                            className="flex-1 !py-3"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            isLoading={isLoading}
                            className="flex-1 !py-3 bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-500/20"
                        >
                            <UserPlus className="w-4 h-4 mr-2" />
                            Register Faculty
                        </Button>
                    </div>
                </form>
            )}
        </Modal>
    );
};
