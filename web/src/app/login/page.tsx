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
  AlertCircle,
  Loader2,
  ArrowRight,
  KeyRound,
  X,
  CheckCircle2,
} from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const { toast } = useAlert();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Forgot password modal state
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [forgotMessage, setForgotMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        err.message ||
        'เข้าสู่ระบบไม่สำเร็จ โปรดตรวจสอบอีเมลและรหัสผ่าน';
      setError(typeof message === 'string' ? message : JSON.stringify(message));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      toast.warning('กรุณากรอกอีเมลของคุณ');
      return;
    }

    setForgotLoading(true);
    setForgotSuccess(false);

    try {
      const res = await authApi.forgotPassword(forgotEmail.trim());
      setForgotSuccess(true);
      setForgotMessage(
        res.message ||
          'หากอีเมลนี้มีอยู่ในระบบ เราได้ส่งลิงก์สำหรับรีเซ็ตรหัสผ่านไปยังอีเมลของคุณแล้ว',
      );
      toast.success('ส่งลิงก์รีเซ็ตรหัสผ่านเรียบร้อยแล้ว');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'เกิดข้อผิดพลาดในการส่งลิงก์รีเซ็ตรหัสผ่าน');
    } finally {
      setForgotLoading(false);
    }
  };

  const openForgotModal = () => {
    setForgotEmail(email);
    setForgotSuccess(false);
    setForgotMessage('');
    setIsForgotModalOpen(true);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-7 bg-white p-6 sm:p-9 rounded-3xl shadow-fastwork border border-slate-200/80">
        <div className="text-center space-y-2">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-tr from-fastwork-600 to-fastwork-400 flex items-center justify-center shadow-md shadow-fastwork-500/25">
            <Camera className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            เข้าสู่ระบบ Snap<span className="text-fastwork-500">book</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            บันทึกรายรับ-รายจ่ายอัจฉริยะจากสลิปโอนเงินธนาคาร
          </p>
        </div>

        {error && (
          <div className="rounded-2xl bg-rose-50 p-4 border border-rose-200 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-500 mt-0.5 flex-shrink-0" />
            <div className="text-xs sm:text-sm text-rose-800 font-medium">{error}</div>
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              อีเมล (Email)
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
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700">
                รหัสผ่าน (Password)
              </label>
              <button
                type="button"
                onClick={openForgotModal}
                className="text-xs font-semibold text-fastwork-600 hover:text-fastwork-700 hover:underline"
              >
                ลืมรหัสผ่าน?
              </button>
            </div>
            <div className="relative rounded-2xl">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="block w-full pl-10 pr-3.5 py-2.5 sm:py-3 bg-slate-50/50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-fastwork-500/20 focus:border-fastwork-500 text-sm font-medium transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-2xl shadow-sm text-sm font-extrabold text-white bg-fastwork-500 hover:bg-fastwork-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-fastwork-500 shadow-fastwork hover:shadow-fastwork-hover disabled:opacity-50 transition-all active:scale-[0.98]"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                <span>กำลังเข้าสู่ระบบ...</span>
              </>
            ) : (
              <span>เข้าสู่ระบบ</span>
            )}
          </button>
        </form>

        <div className="text-center pt-3 border-t border-slate-100">
          <p className="text-xs sm:text-sm text-slate-500">
            ยังไม่มีบัญชีใช้งาน?{' '}
            <Link
              href="/register"
              className="font-bold text-fastwork-600 hover:text-fastwork-700 hover:underline inline-flex items-center gap-0.5"
            >
              <span>สมัครสมาชิกใหม่</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div className="p-2.5 bg-amber-50 text-amber-600 rounded-2xl">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-base">ลืมรหัสผ่าน</h4>
                  <p className="text-xs text-slate-400">ขอรับลิงก์รีเซ็ตรหัสผ่านใหม่</p>
                </div>
              </div>
              <button
                onClick={() => setIsForgotModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {forgotSuccess ? (
              <div className="text-center py-4 space-y-4">
                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h5 className="font-bold text-slate-900 text-base">ส่งลิงก์เรียบร้อยแล้ว</h5>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed max-w-sm mx-auto">
                    {forgotMessage}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsForgotModalOpen(false)}
                  className="w-full py-2.5 px-4 bg-fastwork-500 hover:bg-fastwork-600 text-white font-bold text-xs sm:text-sm rounded-xl shadow-sm transition active:scale-95"
                >
                  เข้าใจแล้ว ปิดหน้าต่างนี้
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                <p className="text-xs text-slate-600 leading-relaxed">
                  กรุณากรอกอีเมลที่คุณใช้ลงทะเบียน Snapbook เราจะส่งลิงก์สำหรับตั้งรหัสผ่านใหม่ไปให้คุณทางอีเมล
                </p>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    อีเมล (Email) *
                  </label>
                  <div className="relative rounded-2xl">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="h-4 w-4" />
                    </div>
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="block w-full pl-10 pr-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-fastwork-500/20 focus:border-fastwork-500 text-xs sm:text-sm font-medium transition"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsForgotModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 transition"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="inline-flex items-center space-x-1.5 bg-fastwork-500 hover:bg-fastwork-600 text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-sm hover:shadow-fastwork transition-all active:scale-95 disabled:opacity-50"
                  >
                    {forgotLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>กำลังส่ง...</span>
                      </>
                    ) : (
                      <span>ส่งลิงก์รีเซ็ตรหัสผ่าน</span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
