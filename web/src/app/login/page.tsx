'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Receipt, Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        <div className="text-center">
          <div className="mx-auto h-14 w-14 rounded-2xl bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-200">
            <Receipt className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-gray-900">
            เข้าสู่ระบบ Snapbook
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            บันทึกรายรับ-รายจ่ายอัจฉริยะจากสลิปโอนเงินธนาคาร
          </p>
        </div>

        {error && (
          <div className="rounded-xl bg-rose-50 p-4 border border-rose-200 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-500 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-rose-800">{error}</div>
          </div>
        )}

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              อีเมล
            </label>
            <div className="relative rounded-xl shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              รหัสผ่าน
            </label>
            <div className="relative rounded-xl shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 transition-colors"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                กำลังเข้าสู่ระบบ...
              </>
            ) : (
              'เข้าสู่ระบบ'
            )}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-gray-100">
          <p className="text-sm text-gray-600">
            ยังไม่มีบัญชีใช้งาน?{' '}
            <Link
              href="/register"
              className="font-medium text-emerald-600 hover:text-emerald-500 hover:underline"
            >
              สมัครสมาชิกใหม่
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
