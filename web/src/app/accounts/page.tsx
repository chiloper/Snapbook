'use client';

import React, { useEffect, useState } from 'react';
import { ownAccountsApi } from '@/lib/api';
import { Building2, Plus, Trash2, ShieldCheck, X } from 'lucide-react';

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    bank_name: 'KBank',
    account_name: '',
    account_number_last4: '',
  });

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const data = await ownAccountsApi.getAll();
      setAccounts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.account_number_last4.length !== 4) {
      alert('กรุณาระบุเลขบัญชี 4 หลักสุดท้าย');
      return;
    }

    try {
      await ownAccountsApi.create(form);
      setIsModalOpen(false);
      setForm({ bank_name: 'KBank', account_name: '', account_number_last4: '' });
      fetchAccounts();
    } catch (err: any) {
      alert(err.response?.data?.message || 'ไม่สามารถเพิ่มบัญชีได้');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('ต้องการลบบัญชีนี้ใช่หรือไม่?')) return;
    try {
      await ownAccountsApi.delete(id);
      setAccounts((prev) => prev.filter((a) => a.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.message || 'ไม่สามารถลบบัญชีได้');
    }
  };

  const thaiBanks = [
    'KBank (กสิกรไทย)',
    'SCB (ไทยพาณิชย์)',
    'Krungthai (กรุงไทย)',
    'Bangkok Bank (กรุงเทพ)',
    'TTB (ทีทีบี)',
    'Krungsri (กรุงศรี)',
    'GSB (ออมสิน)',
    'PromptPay (พร้อมเพย์)',
    'TrueMoney Wallet',
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            บัญชีธนาคารของฉัน
          </h1>
          <p className="text-sm text-slate-500">
            ระบบใช้ข้อมูลนี้ในการระบุว่าสลิปที่อ่านได้เป็น &quot;รายรับ&quot; หรือ &quot;รายจ่าย&quot;
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>เพิ่มบัญชีใหม่</span>
        </button>
      </div>

      {/* Info Callout */}
      <div className="bg-indigo-50/60 border border-indigo-100 rounded-2xl p-4 flex items-start space-x-3 text-sm text-indigo-900">
        <ShieldCheck className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
        <p>
          ระบบจัดเก็บเฉพาะ <strong>4 หลักสุดท้าย</strong> ของเลขบัญชีเท่านั้น
          (เช่น xxx-x-x1234) เพื่อความปลอดภัยสูงสุดของคุณ
        </p>
      </div>

      {/* Account List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
        {loading ? (
          <div className="py-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto" />
          </div>
        ) : accounts.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-sm">
            <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p>ยังไม่มีบัญชีที่ลงทะเบียนไว้</p>
          </div>
        ) : (
          accounts.map((acc) => (
            <div
              key={acc.id}
              className="p-5 flex items-center justify-between hover:bg-slate-50/70 transition"
            >
              <div className="flex items-center space-x-4">
                <div className="w-11 h-11 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-700 font-bold">
                  <Building2 className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 text-base">
                    {acc.bank_name}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    ชื่อบัญชี: {acc.account_name} | เลขท้าย: ••••{' '}
                    {acc.account_number_last4}
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleDelete(acc.id)}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                title="ลบบัญชี"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Add Account Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-800">
                เพิ่มบัญชีธนาคาร
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-sm">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  ธนาคาร / ผู้ให้บริการ
                </label>
                <select
                  value={form.bank_name}
                  onChange={(e) =>
                    setForm({ ...form, bank_name: e.target.value })
                  }
                  className="w-full border border-slate-200 rounded-xl p-2.5"
                >
                  {thaiBanks.map((b) => (
                    <option key={b} value={b.split(' ')[0]}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  ชื่อเจ้าของบัญชี (ภาษาไทยหรืออังกฤษตามสลิป) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น สมชาย ใจดี หรือ Somchai Jaidee"
                  value={form.account_name}
                  onChange={(e) =>
                    setForm({ ...form, account_name: e.target.value })
                  }
                  className="w-full border border-slate-200 rounded-xl p-2.5"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  เลขบัญชี 4 หลักสุดท้าย *
                </label>
                <input
                  type="text"
                  maxLength={4}
                  required
                  placeholder="1234"
                  value={form.account_number_last4}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      account_number_last4: e.target.value.replace(/\D/g, ''),
                    })
                  }
                  className="w-full border border-slate-200 rounded-xl p-2.5"
                />
              </div>

              <div className="flex space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-medium"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-semibold shadow-sm"
                >
                  เพิ่มบัญชี
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
