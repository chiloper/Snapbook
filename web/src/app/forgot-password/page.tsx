'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAlert } from '@/context/AlertContext';
import { authApi } from '@/lib/api';
import { Camera, Mail, KeyRound, Loader2, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const { toast } = useAlert();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    try {
      const res = await authApi.forgotPassword(email.trim());
      setSubmitted(true);
      setMessage(
        res.message ||
          'หากอีเมลนี้มีอยู่ในระบบ เราได้ส่งลิงก์สำหรับรีเซ็ตรหัสผ่านไปยังอีเมลของคุณแล้ว',
      );
      toast.success('ส่งลิงก์รีเซ็ตรหัสผ่านเรียบร้อยแล้ว');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'เกิดข้อผิดพลาดในการส่งลิงก์รีเซ็ต');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-7 bg-white p-6 sm:p-9 rounded-3xl shadow-fastwork border border-slate-200/80">
        <div className="text-center space-y-2">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center shadow-md shadow-amber-500/25 text-white">
            <KeyRound className="w-7 h-7" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            ลืมรหัสผ่าน
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            ระบุอีเมลของคุณเพื่อรับลิงก์สำหรับตั้งรหัสผ่านใหม่
          </p>
        </div>

        {submitted ? (
          <div className="text-center py-4 space-y-5">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-lg">ตรวจสอบอีเมลของคุณ</h4>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                {message}
              </p>
            </div>
            <Link
              href="/login"
              className="inline-flex items-center justify-center space-x-2 w-full py-3 px-4 bg-fastwork-500 hover:bg-fastwork-600 text-white font-bold text-sm rounded-2xl shadow-sm transition active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>กลับไปหน้าเข้าสู่ระบบ</span>
            </Link>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                อีเมลที่ใช้ลงทะเบียน *
              </label>
              <div className="relative rounded-2xl">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
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

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-2xl shadow-sm text-sm font-extrabold text-white bg-fastwork-500 hover:bg-fastwork-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-fastwork-500 shadow-fastwork hover:shadow-fastwork-hover disabled:opacity-50 transition-all active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  <span>กำลังส่งข้อมูล...</span>
                </>
              ) : (
                <span>ส่งลิงก์รีเซ็ตรหัสผ่าน</span>
              )}
            </button>

            <div className="text-center pt-3 border-t border-slate-100">
              <Link
                href="/login"
                className="text-xs font-semibold text-slate-600 hover:text-fastwork-600 inline-flex items-center gap-1 transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>กลับไปหน้าเข้าสู่ระบบ</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
