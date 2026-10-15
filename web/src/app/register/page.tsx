'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useAlert } from '@/context/AlertContext';
import { authApi } from '@/lib/api';
import {
  Camera,
  Mail,
  Lock,
  User,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ArrowRight,
  Send,
  RefreshCw,
} from 'lucide-react';

export default function RegisterPage() {
  const { register } = useAuth();
  const { toast } = useAlert();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Email confirmation state
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState('');
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร');
      return;
    }

    if (password !== confirmPassword) {
      setError('รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน');
      return;
    }

    setLoading(true);

    try {
      const res = await register(email.trim(), password, displayName.trim());
      if (res?.requires_confirmation || (res && !res.access_token)) {
        setNeedsConfirmation(true);
        setConfirmationMessage(
          res.message ||
            'เราได้ส่งลิงก์ยืนยันไปยังอีเมลของคุณแล้ว กรุณาคลิกลิงก์ในอีเมลเพื่อเปิดใช้งานบัญชีก่อนเข้าสู่ระบบ',
        );
        toast.info('กรุณาตรวจสอบอีเมลของคุณเพื่อยืนยันบัญชี', 'สมัครสมาชิกสำเร็จ');
      }
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        err.message ||
        'ลงทะเบียนไม่สำเร็จ โปรดลองใหม่อีกครั้ง';
      setError(typeof message === 'string' ? message : JSON.stringify(message));
    } finally {
      setLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    if (cooldown > 0 || resending) return;

    setResending(true);
    try {
      await authApi.resendConfirmation(email.trim());
      toast.success('ส่งอีเมลยืนยันใหม่อีกครั้งแล้ว');
      setCooldown(60);
      const timer = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'ไม่สามารถส่งอีเมลยืนยันได้');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-7 bg-white p-6 sm:p-9 rounded-3xl shadow-fastwork border border-slate-200/80">
        <div className="text-center space-y-2">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-tr from-fastwork-600 to-fastwork-400 flex items-center justify-center shadow-md shadow-fastwork-500/25">
            <Camera className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            สมัครสมาชิก Snap<span className="text-fastwork-500">book</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            สร้างบัญชีเพื่อเริ่มสแกนสลิปและจัดการบัญชีรายรับ-รายจ่าย
          </p>
        </div>

        {needsConfirmation ? (
          <div className="text-center py-4 space-y-5">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-50/50">
              <Mail className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="font-extrabold text-slate-900 text-lg">
                ตรวจสอบอีเมลของคุณ
              </h3>
              <p className="text-xs text-slate-500">
                เราได้ส่งลิงก์ยืนยันตัวตนไปยัง
              </p>
              <div className="inline-block bg-slate-100 text-slate-800 text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200">
                {email}
              </div>
              <p className="text-xs text-slate-600 leading-relaxed pt-2 max-w-sm mx-auto">
                {confirmationMessage}
              </p>
            </div>

            <div className="pt-2 space-y-3">
              <Link
                href="/login"
                className="inline-flex items-center justify-center space-x-1.5 w-full py-3 px-4 bg-fastwork-500 hover:bg-fastwork-600 text-white font-bold text-sm rounded-2xl shadow-sm hover:shadow-fastwork transition-all active:scale-95"
              >
                <span>ไปหน้าเข้าสู่ระบบ</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <button
                type="button"
                onClick={handleResendConfirmation}
                disabled={cooldown > 0 || resending}
                className="inline-flex items-center justify-center space-x-1.5 w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200/80 text-slate-700 font-semibold text-xs rounded-xl transition active:scale-95 disabled:opacity-50"
              >
                {resending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                    <span>กำลังส่งอีเมล...</span>
                  </>
                ) : cooldown > 0 ? (
                  <span>ส่งอีกครั้งได้ใน {cooldown} วินาที</span>
                ) : (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 mr-1" />
                    <span>ยังไม่ได้รับอีเมล? ส่งอีกครั้ง</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <>
            {error && (
              <div className="rounded-2xl bg-rose-50 p-4 border border-rose-200 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-rose-500 mt-0.5 flex-shrink-0" />
                <div className="text-xs sm:text-sm text-rose-800 font-medium">{error}</div>
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ชื่อผู้ใช้งาน / ชื่อแสดง *
                </label>
                <div className="relative rounded-2xl">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="สมชาย ใจดี"
                    className="block w-full pl-10 pr-3.5 py-2.5 sm:py-3 bg-slate-50/50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-fastwork-500/20 focus:border-fastwork-500 text-sm font-medium transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  อีเมล (Email) *
                </label>
                <div className="relative rounded-2xl">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="block w-full pl-10 pr-3.5 py-2.5 sm:py-3 bg-slate-50/50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-fastwork-500/20 focus:border-fastwork-500 text-sm font-medium transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  รหัสผ่าน (อย่างน้อย 8 ตัวอักษร) *
                </label>
                <div className="relative rounded-2xl">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full pl-10 pr-3.5 py-2.5 sm:py-3 bg-slate-50/50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-fastwork-500/20 focus:border-fastwork-500 text-sm font-medium transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ยืนยันรหัสผ่าน *
                </label>
                <div className="relative rounded-2xl">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full pl-10 pr-3.5 py-2.5 sm:py-3 bg-slate-50/50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-fastwork-500/20 focus:border-fastwork-500 text-sm font-medium transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 flex justify-center items-center py-3 px-4 border border-transparent rounded-2xl shadow-sm text-sm font-extrabold text-white bg-fastwork-500 hover:bg-fastwork-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-fastwork-500 shadow-fastwork hover:shadow-fastwork-hover disabled:opacity-50 transition-all active:scale-[0.98]"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    <span>กำลังสมัครสมาชิก...</span>
                  </>
                ) : (
                  <span>สมัครสมาชิก</span>
                )}
              </button>
            </form>

            <div className="text-center pt-3 border-t border-slate-100">
              <p className="text-xs sm:text-sm text-slate-500">
                มีบัญชีผู้ใช้อยู่แล้ว?{' '}
                <Link
                  href="/login"
                  className="font-bold text-fastwork-600 hover:text-fastwork-700 hover:underline inline-flex items-center gap-0.5"
                >
                  <span>เข้าสู่ระบบ</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
