'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAlert } from '@/context/AlertContext';
import { authApi } from '@/lib/api';
import {
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useAlert();

  const [accessToken, setAccessToken] = useState<string>('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tokenMissing, setTokenMissing] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // 1. Try URL search params first (?access_token=... or ?token=...)
    let token = searchParams.get('access_token') || searchParams.get('token');

    // 2. Try URL hash fragment (#access_token=...&type=recovery)
    if (!token && typeof window !== 'undefined' && window.location.hash) {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      token = hashParams.get('access_token');
    }

    if (token) {
      setAccessToken(token);
      setTokenMissing(false);
    } else {
      setTokenMissing(true);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!accessToken) {
      toast.error('ไม่พบโทเคนสำหรับการรีเซ็ตรหัสผ่าน กรุณากดลิงก์จากอีเมลอีกครั้ง');
      return;
    }

    if (newPassword.length < 8) {
      toast.warning('รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 8 ตัวอักษร');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.warning('รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน');
      return;
    }

    setLoading(true);
    try {
      await authApi.resetPassword(accessToken, newPassword);
      setSuccess(true);
      toast.success('รีเซ็ตรหัสผ่านสำเร็จเรียบร้อยแล้ว');
      setTimeout(() => {
        router.push('/login');
      }, 2500);
    } catch (err: any) {
      toast.error(
        err.response?.data?.message ||
          'โทเคนรีเซ็ตรหัสผ่านหมดอายุหรือไม่ถูกต้อง กรุณาขอลิงก์ใหม่อีกครั้ง',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-7 bg-white p-6 sm:p-9 rounded-3xl shadow-fastwork border border-slate-200/80">
        <div className="text-center space-y-2">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-tr from-fastwork-600 to-indigo-600 flex items-center justify-center shadow-md shadow-fastwork-500/25 text-white">
            <KeyRound className="w-7 h-7" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            ตั้งรหัสผ่านใหม่
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            กำหนดรหัสผ่านใหม่สำหรับเข้าใช้งาน Snapbook
          </p>
        </div>

        {tokenMissing && !accessToken && (
          <div className="rounded-2xl bg-amber-50 p-4 border border-amber-200 space-y-3">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-amber-900 leading-relaxed">
                ไม่พบโทเคนใน URL (หากกดลิงก์จากอีเมลแล้วเปิดผิดหน้า เช่น เด้งไปหน้า login หรือ localhost:3000 ให้คัดลอกลิงก์นั้นมาวางที่ช่องด้านล่างนี้ได้เลยครับ)
              </div>
            </div>
            <div>
              <input
                type="text"
                placeholder="วางลิงก์จากอีเมล หรือ Access Token ที่นี่..."
                onChange={(e) => {
                  const val = e.target.value.trim();
                  if (!val) return;
                  let extracted = val;
                  if (val.includes('#')) {
                    const hash = val.split('#')[1];
                    const params = new URLSearchParams(hash);
                    extracted = params.get('access_token') || extracted;
                  } else if (val.includes('?')) {
                    const query = val.split('?')[1];
                    const params = new URLSearchParams(query);
                    extracted = params.get('access_token') || params.get('token') || extracted;
                  }
                  if (extracted && extracted.length > 20) {
                    setAccessToken(extracted);
                    setTokenMissing(false);
                    toast.success('ตรวจพบโทเคนเรียบร้อยแล้ว กำหนดรหัสผ่านใหม่ได้ทันที');
                  }
                }}
                className="w-full text-xs px-3 py-2 bg-white border border-amber-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 text-slate-800 font-mono"
              />
            </div>
          </div>
        )}

        {success ? (
          <div className="text-center py-4 space-y-4">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-lg">รีเซ็ตรหัสผ่านสำเร็จ!</h4>
              <p className="text-xs text-slate-600 mt-1">
                กำลังนำคุณไปยังหน้าเข้าสู่ระบบอัตโนมัติ...
              </p>
            </div>
            <Link
              href="/login"
              className="inline-flex items-center justify-center space-x-1.5 w-full py-2.5 px-4 bg-fastwork-500 hover:bg-fastwork-600 text-white font-bold text-xs sm:text-sm rounded-xl shadow-sm transition"
            >
              <span>ไปหน้าเข้าสู่ระบบทันที</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                รหัสผ่านใหม่ *
              </label>
              <div className="relative rounded-2xl">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="ความยาวอย่างน้อย 8 ตัวอักษร"
                  className="block w-full pl-10 pr-10 py-2.5 sm:py-3 bg-slate-50/50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-fastwork-500/20 focus:border-fastwork-500 text-sm font-medium transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

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
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="พิมพ์รหัสผ่านใหม่อีกครั้ง"
                  className="block w-full pl-10 pr-10 py-2.5 sm:py-3 bg-slate-50/50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-fastwork-500/20 focus:border-fastwork-500 text-sm font-medium transition"
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

            <button
              type="submit"
              disabled={loading || !accessToken}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-2xl shadow-sm text-sm font-extrabold text-white bg-fastwork-500 hover:bg-fastwork-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-fastwork-500 shadow-fastwork hover:shadow-fastwork-hover disabled:opacity-50 transition-all active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  <span>กำลังบันทึกรหัสผ่าน...</span>
                </>
              ) : (
                <span>บันทึกรหัสผ่านใหม่</span>
              )}
            </button>

            <div className="text-center pt-3 border-t border-slate-100">
              <Link
                href="/login"
                className="text-xs font-semibold text-slate-600 hover:text-fastwork-600 transition"
              >
                กลับไปหน้าเข้าสู่ระบบ
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[80vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-fastwork-500" />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
