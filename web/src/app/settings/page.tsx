'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useAlert } from '@/context/AlertContext';
import { authApi } from '@/lib/api';
import {
  User,
  Mail,
  Lock,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
  LogOut,
  Save,
  Copy,
  Check,
} from 'lucide-react';

export default function SettingsPage() {
  const { user, refreshUser, logout } = useAuth();
  const { toast, confirm } = useAlert();

  // Profile Form State
  const [displayName, setDisplayName] = useState(user?.display_name || '');
  const [profileSaving, setProfileSaving] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);

  useEffect(() => {
    if (user?.display_name) {
      setDisplayName(user.display_name);
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      toast.warning('กรุณาระบุชื่อที่แสดง');
      return;
    }

    setProfileSaving(true);
    try {
      await authApi.updateProfile(displayName.trim());
      await refreshUser();
      toast.success('อัปเดตข้อมูลโปรไฟล์เรียบร้อยแล้ว');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'ไม่สามารถอัปเดตโปรไฟล์ได้');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword) {
      toast.warning('กรุณากรอกรหัสผ่านปัจจุบัน');
      return;
    }

    if (newPassword.length < 8) {
      toast.warning('รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 8 ตัวอักษร');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      toast.warning('รหัสผ่านใหม่และการยืนยันรหัสผ่านไม่ตรงกัน');
      return;
    }

    if (currentPassword === newPassword) {
      toast.warning('รหัสผ่านใหม่ต้องไม่ซ้ำกับรหัสผ่านปัจจุบัน');
      return;
    }

    setPasswordSaving(true);
    try {
      await authApi.changePassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      toast.success('เปลี่ยนรหัสผ่านเรียบร้อยแล้ว');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'ไม่สามารถเปลี่ยนรหัสผ่านได้ โปรดตรวจสอบรหัสผ่านเดิม');
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleCopyUserId = () => {
    if (!user?.id) return;
    navigator.clipboard.writeText(user.id);
    setCopiedId(true);
    toast.info('คัดลอก User ID เรียบร้อยแล้ว');
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleLogout = async () => {
    const ok = await confirm({
      title: 'ออกจากระบบ',
      message: 'คุณต้องการออกจากระบบ Snapbook ใช่หรือไม่?',
      confirmText: 'ออกจากระบบ',
      type: 'danger',
    });
    if (ok) {
      await logout();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <span>ตั้งค่าบัญชีผู้ใช้</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          จัดการข้อมูลโปรไฟล์ ความปลอดภัย และการเปลี่ยนรหัสผ่านของคุณ
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Account Summary Card */}
        <div className="md:col-span-1 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-fastwork-sm text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-fastwork-600 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-md shadow-fastwork-500/20 mx-auto">
              {(user?.display_name || user?.email || 'U').charAt(0).toUpperCase()}
            </div>

            <div>
              <h3 className="font-extrabold text-slate-900 text-lg">
                {user?.display_name || 'ผู้ใช้งาน'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 truncate">{user?.email}</p>
            </div>

            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>อีเมลยืนยันแล้ว</span>
            </div>

            <div className="pt-4 border-t border-slate-100 text-left space-y-2">
              <div className="text-[11px] text-slate-400 font-medium">User ID</div>
              <div className="flex items-center justify-between bg-slate-50 border border-slate-200/60 rounded-xl px-2.5 py-1.5 text-xs font-mono text-slate-600">
                <span className="truncate pr-1">{user?.id || '-'}</span>
                <button
                  onClick={handleCopyUserId}
                  className="p-1 hover:text-fastwork-600 transition flex-shrink-0"
                  title="คัดลอก ID"
                >
                  {copiedId ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition active:scale-95 mt-4"
            >
              <LogOut className="w-4 h-4" />
              <span>ออกจากระบบ</span>
            </button>
          </div>
        </div>

        {/* Right Column: Settings Forms */}
        <div className="md:col-span-2 space-y-6">
          {/* 1. Profile Information Form */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-fastwork-sm space-y-5">
            <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
              <div className="p-2.5 bg-fastwork-50 text-fastwork-600 rounded-2xl">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">ข้อมูลส่วนตัว</h3>
                <p className="text-xs text-slate-400">แก้ไขชื่อและข้อมูลพื้นฐานของบัญชี</p>
              </div>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  อีเมล (Email)
                </label>
                <div className="relative rounded-2xl">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    type="email"
                    disabled
                    value={user?.email || ''}
                    className="block w-full pl-10 pr-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-500 font-medium cursor-not-allowed select-none"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">อีเมลหลักไม่สามารถแก้ไขได้</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ชื่อที่แสดง (Display Name) *
                </label>
                <div className="relative rounded-2xl">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="ระบุชื่อของคุณ"
                    className="block w-full pl-10 pr-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-fastwork-500/20 focus:border-fastwork-500 text-xs sm:text-sm font-medium transition"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={profileSaving}
                  className="inline-flex items-center space-x-1.5 bg-fastwork-500 hover:bg-fastwork-600 text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-sm hover:shadow-fastwork transition-all active:scale-95 disabled:opacity-50"
                >
                  {profileSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>กำลังบันทึก...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>บันทึกชื่อ</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* 2. Change Password Form */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-fastwork-sm space-y-5">
            <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
              <div className="p-2.5 bg-amber-50 text-amber-600 rounded-2xl">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">เปลี่ยนรหัสผ่าน</h3>
                <p className="text-xs text-slate-400">
                  อัปเดตรหัสผ่านใหม่เพื่อความปลอดภัยของบัญชี
                </p>
              </div>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              {/* Current Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  รหัสผ่านปัจจุบัน *
                </label>
                <div className="relative rounded-2xl">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type={showCurrent ? 'text' : 'password'}
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full pl-10 pr-10 py-2.5 bg-slate-50/50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-fastwork-500/20 focus:border-fastwork-500 text-xs sm:text-sm font-medium transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  รหัสผ่านใหม่ *
                </label>
                <div className="relative rounded-2xl">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type={showNew ? 'text' : 'password'}
                    required
                    minLength={8}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="ความยาวอย่างน้อย 8 ตัวอักษร"
                    className="block w-full pl-10 pr-10 py-2.5 bg-slate-50/50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-fastwork-500/20 focus:border-fastwork-500 text-xs sm:text-sm font-medium transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ยืนยันรหัสผ่านใหม่ *
                </label>
                <div className="relative rounded-2xl">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    required
                    minLength={8}
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="พิมพ์รหัสผ่านใหม่อีกครั้ง"
                    className="block w-full pl-10 pr-10 py-2.5 bg-slate-50/50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-fastwork-500/20 focus:border-fastwork-500 text-xs sm:text-sm font-medium transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={passwordSaving}
                  className="inline-flex items-center space-x-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-sm hover:shadow-amber-500/20 transition-all active:scale-95 disabled:opacity-50"
                >
                  {passwordSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>กำลังเปลี่ยนรหัสผ่าน...</span>
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4" />
                      <span>เปลี่ยนรหัสผ่าน</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
