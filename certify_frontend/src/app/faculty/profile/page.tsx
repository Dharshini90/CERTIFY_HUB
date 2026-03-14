'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Users, User, Lock, Save, ArrowLeft, CheckCircle } from 'lucide-react';
import api from '@/lib/api';
import Link from 'next/link';

interface ProfileForm {
    name: string;
    email: string;
}

interface PasswordForm {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

export default function FacultyProfilePage() {
    const router = useRouter();
    const { user, setUser } = useAuth();
    const [profileSaving, setProfileSaving] = useState(false);
    const [pwdSaving, setPwdSaving] = useState(false);
    const [profileMsg, setProfileMsg] = useState<{ text: string; ok: boolean } | null>(null);
    const [pwdMsg, setPwdMsg] = useState<{ text: string; ok: boolean } | null>(null);

    const profileForm = useForm<ProfileForm>();
    const pwdForm = useForm<PasswordForm>();

    useEffect(() => {
        if (!user || user.role !== 'faculty') {
            router.push('/faculty/login');
            return;
        }
        profileForm.reset({
            name: user.name || '',
            email: user.email || '',
        });
    }, [user, profileForm, router]);

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
            <div className="bg-white/90 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-50">
                <div className="container-custom py-3">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-600 rounded-[12px] flex items-center justify-center shadow-md text-white">
                                <Users className="w-5 h-5" />
                            </div>
                            <div>
                                <h1 className="text-xl font-black text-slate-900 tracking-tight">CertifyHub</h1>
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">My Profile</p>
                            </div>
                        </div>
                        <Link href="/faculty/dashboard">
                            <Button variant="secondary" className="!py-2 !px-4 !rounded-xl text-[14px] !font-semibold border-slate-200 shadow-sm hover:bg-slate-50">
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
                        <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
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
