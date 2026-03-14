'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card } from '@/components/ui/Card';
import { GraduationCap, User, Lock, Save, ArrowLeft, CheckCircle } from 'lucide-react';
import api from '@/lib/api';
import Link from 'next/link';

interface ProfileForm {
    name: string;
    email: string;
    roll_number: string;
    year: string;
    department: string;
    section: string;
}

interface PasswordForm {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

export default function StudentProfilePage() {
    const router = useRouter();
    const { user, setUser } = useAuth();
    const [departments, setDepartments] = useState<{ id: number; name: string }[]>([]);
    const [sections, setSections] = useState<{ id: number; name: string }[]>([]);
    const [profileSaving, setProfileSaving] = useState(false);
    const [pwdSaving, setPwdSaving] = useState(false);
    const [profileMsg, setProfileMsg] = useState<{ text: string; ok: boolean } | null>(null);
    const [pwdMsg, setPwdMsg] = useState<{ text: string; ok: boolean } | null>(null);

    const profileForm = useForm<ProfileForm>();
    const pwdForm = useForm<PasswordForm>();

    useEffect(() => {
        if (!user || user.role !== 'student') {
            router.push('/student/login');
            return;
        }
        profileForm.reset({
            name: user.name || '',
            email: user.email || '',
            roll_number: (user as any).roll_number || '',
            year: (user as any).year || '',
            department: (user as any).department || '',
            section: (user as any).section || '',
        });
        loadDropdowns();
    }, [user]);

    const loadDropdowns = async () => {
        try {
            const [dRes, sRes] = await Promise.all([
                api.get('/faculty/departments'),
                api.get('/faculty/sections'),
            ]);
            setDepartments(dRes.data.departments || []);
            setSections(sRes.data.sections || []);
        } catch {
            // fallback: empty lists
        }
    };

    const onSaveProfile = async (data: ProfileForm) => {
        setProfileSaving(true);
        setProfileMsg(null);
        try {
            const res = await api.put('/auth/profile', data);
            setUser(res.data.user);
            setProfileMsg({ text: 'Profile updated successfully!', ok: true });
        } catch (err: any) {
            setProfileMsg({ text: err.response?.data?.error || 'Failed to update profile', ok: false });
        } finally {
            setProfileSaving(false);
        }
    };

    const onChangePassword = async (data: PasswordForm) => {
        setPwdSaving(true);
        setPwdMsg(null);
        try {
            await api.put('/auth/change-password', {
                currentPassword: data.currentPassword,
                newPassword: data.newPassword,
            });
            setPwdMsg({ text: 'Password changed successfully!', ok: true });
            pwdForm.reset();
        } catch (err: any) {
            setPwdMsg({ text: err.response?.data?.error || 'Failed to change password', ok: false });
        } finally {
            setPwdSaving(false);
        }
    };

    return (
        <div className="min-h-screen">
            {/* Header */}
            <div className="glass border-b border-white/20 sticky top-0 z-50">
                <div className="container-custom py-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-tr from-primary-600 to-primary-400 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/20 text-white">
                                <GraduationCap className="w-6 h-6" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-black text-slate-900 tracking-tight">CertifyHub</h1>
                                <p className="text-sm font-medium text-slate-500">My Profile</p>
                            </div>
                        </div>
                        <Link href="/student/dashboard">
                            <Button variant="secondary" size="sm" className="rounded-xl">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Dashboard
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            <div className="container-custom py-10 space-y-8 max-w-3xl">
                {/* Profile Info Card */}
                <Card>
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center text-primary-600">
                            <User className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">Personal Information</h2>
                            <p className="text-sm text-slate-500">Update your profile details</p>
                        </div>
                    </div>

                    <form onSubmit={profileForm.handleSubmit(onSaveProfile)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                label="Full Name"
                                placeholder="John Doe"
                                error={profileForm.formState.errors.name?.message}
                                {...profileForm.register('name', { required: 'Name is required' })}
                            />
                            <Input
                                label="Email Address"
                                type="email"
                                placeholder="name@university.edu"
                                error={profileForm.formState.errors.email?.message}
                                {...profileForm.register('email', {
                                    required: 'Email is required',
                                    pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Invalid email' }
                                })}
                            />
                            <Input
                                label="Roll Number"
                                placeholder="e.g. 21CS101"
                                error={profileForm.formState.errors.roll_number?.message}
                                {...profileForm.register('roll_number', { required: 'Roll number is required' })}
                            />
                            <Select
                                label="Year"
                                options={[
                                    { value: '', label: 'Select Year' },
                                    { value: '1st year', label: '1st Year' },
                                    { value: '2nd year', label: '2nd Year' },
                                    { value: '3rd year', label: '3rd Year' },
                                    { value: '4th year', label: '4th Year' },
                                ]}
                                error={profileForm.formState.errors.year?.message}
                                {...profileForm.register('year', { required: 'Year is required' })}
                            />
                            <Select
                                label="Department"
                                options={[
                                    { value: '', label: 'Select Department' },
                                    ...departments.map(d => ({ value: d.name, label: d.name }))
                                ]}
                                error={profileForm.formState.errors.department?.message}
                                {...profileForm.register('department', { required: 'Department is required' })}
                            />
                            <Select
                                label="Section"
                                options={[
                                    { value: '', label: 'Select Section' },
                                    ...sections.map(s => ({ value: s.name, label: s.name }))
                                ]}
                                error={profileForm.formState.errors.section?.message}
                                {...profileForm.register('section', { required: 'Section is required' })}
                            />
                        </div>

                        {profileMsg && (
                            <div className={`px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-2 ${profileMsg.ok ? 'bg-green-50 border border-green-100 text-green-700' : 'bg-red-50 border border-red-100 text-red-700'}`}>
                                {profileMsg.ok ? <CheckCircle className="w-4 h-4" /> : <div className="w-1.5 h-1.5 rounded-full bg-red-600" />}
                                {profileMsg.text}
                            </div>
                        )}

                        <Button type="submit" isLoading={profileSaving} className="h-11 px-8">
                            <Save className="w-4 h-4 mr-2" />
                            Save Changes
                        </Button>
                    </form>
                </Card>

                {/* Change Password Card */}
                <Card>
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600">
                            <Lock className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">Change Password</h2>
                            <p className="text-sm text-slate-500">Update your account password</p>
                        </div>
                    </div>

                    <form onSubmit={pwdForm.handleSubmit(onChangePassword)} className="space-y-6">
                        <Input
                            label="Current Password"
                            type="password"
                            showPasswordToggle
                            placeholder="••••••••"
                            error={pwdForm.formState.errors.currentPassword?.message}
                            {...pwdForm.register('currentPassword', { required: 'Current password is required' })}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                label="New Password"
                                type="password"
                                showPasswordToggle
                                placeholder="••••••••"
                                error={pwdForm.formState.errors.newPassword?.message}
                                {...pwdForm.register('newPassword', {
                                    required: 'New password is required',
                                    minLength: { value: 6, message: 'At least 6 characters' },
                                })}
                            />
                            <Input
                                label="Confirm New Password"
                                type="password"
                                showPasswordToggle
                                placeholder="••••••••"
                                error={pwdForm.formState.errors.confirmPassword?.message}
                                {...pwdForm.register('confirmPassword', {
                                    required: 'Please confirm password',
                                    validate: v => v === pwdForm.watch('newPassword') || 'Passwords do not match',
                                })}
                            />
                        </div>

                        {pwdMsg && (
                            <div className={`px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-2 ${pwdMsg.ok ? 'bg-green-50 border border-green-100 text-green-700' : 'bg-red-50 border border-red-100 text-red-700'}`}>
                                {pwdMsg.ok ? <CheckCircle className="w-4 h-4" /> : <div className="w-1.5 h-1.5 rounded-full bg-red-600" />}
                                {pwdMsg.text}
                            </div>
                        )}

                        <Button type="submit" isLoading={pwdSaving} className="h-11 px-8" variant="secondary">
                            <Lock className="w-4 h-4 mr-2" />
                            Change Password
                        </Button>
                    </form>
                </Card>
            </div>
        </div>
    );
}
