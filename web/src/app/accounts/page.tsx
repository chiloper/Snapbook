'use client';

import React, { useEffect, useState } from 'react';
import { ownAccountsApi } from '@/lib/api';
import { Building2, Plus, Trash2, ShieldCheck, X, CreditCard, CheckCircle2 } from 'lucide-react';

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    bank_name: 'KBank (กสิกรไทย)',
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
    if (form.account_number_last4.length < 3 || form.account_number_last4.length > 15) {
      alert('กรุณาระบุเลขบัญชี 3 ถึง 15 หลัก (เลข 3-4 ตัวที่เห็นบนสลิป หรือเลขบัญชีเต็ม)');
      return;
    }

    try {
      await ownAccountsApi.create(form);
      setIsModalOpen(false);
      setForm({ bank_name: 'KBank (กสิกรไทย)', account_name: '', account_number_last4: '' });
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
    { name: 'KBank (กสิกรไทย)', color: 'from-emerald-600 to-emerald-800', badge: 'bg-emerald-50 text-emerald-700' },
    { name: 'SCB (ไทยพาณิชย์)', color: 'from-purple-600 to-indigo-800', badge: 'bg-purple-50 text-purple-700' },
    { name: 'Krungthai (กรุงไทย)', color: 'from-sky-500 to-blue-700', badge: 'bg-sky-50 text-sky-700' },
    { name: 'Bangkok Bank (กรุงเทพ)', color: 'from-blue-700 to-indigo-950', badge: 'bg-blue-50 text-blue-700' },
    { name: 'TTB (ทีทีบี)', color: 'from-blue-600 to-orange-500', badge: 'bg-orange-50 text-orange-700' },
    { name: 'Krungsri (กรุงศรี)', color: 'from-amber-500 to-amber-700', badge: 'bg-amber-50 text-amber-700' },
    { name: 'GSB (ออมสิน)', color: 'from-pink-500 to-pink-700', badge: 'bg-pink-50 text-pink-700' },
    { name: 'PromptPay (พร้อมเพย์)', color: 'from-blue-800 to-slate-900', badge: 'bg-blue-50 text-blue-800' },
    { name: 'TrueMoney Wallet', color: 'from-orange-500 to-amber-600', badge: 'bg-orange-50 text-orange-700' },
  ];

  const getBankStyle = (bankName: string) => {
    const found = thaiBanks.find((b) => bankName.toLowerCase().includes(b.name.split(' ')[0].toLowerCase()));
    return found || { name: bankName, color: 'from-slate-700 to-slate-900', badge: 'bg-slate-50 text-slate-700' };
  };

  const formatDisplayAccount = (bankName: string, accountNum: string): string => {
    if (!accountNum) return '';
    const digits = accountNum.replace(/\D/g, '');
    const bankLower = (bankName || '').toLowerCase();

    // 1. KBank / TTB format: xxx-x-x6789-x
    if (
      bankLower.includes('kbank') ||
      bankLower.includes('กสิกร') ||
      bankLower.includes('ttb') ||
      bankLower.includes('ทีทีบี')
    ) {
      if (digits.length === 10) {
        return `xxx-x-x${digits.slice(5, 9)}-x`;
      }
      const d4 = digits.length >= 4 ? digits.slice(-4) : digits.padStart(4, '0');
      return `xxx-x-x${d4}-x`;
    }

    // 2. Bangkok Bank (BBL): xxx-x-xx789-x (3 visible digits before trailing mask)
    if (
      bankLower.includes('bangkok') ||
      bankLower.includes('กรุงเทพ') ||
      bankLower.includes('bbl')
    ) {
      if (digits.length === 10) {
        return `xxx-x-xx${digits.slice(6, 9)}-x`;
      }
      const d3 = digits.length >= 3 ? digits.slice(-3) : digits.padStart(3, '0');
      return `xxx-x-xx${d3}-x`;
    }

    // 3. SCB / Krungthai / BAAC: xxx-x-xx789-0
    if (
      bankLower.includes('scb') ||
      bankLower.includes('ไทยพาณิชย์') ||
      bankLower.includes('krungthai') ||
      bankLower.includes('กรุงไทย') ||
      bankLower.includes('ktb') ||
      bankLower.includes('baac') ||
      bankLower.includes('ธ.ก.ส')
    ) {
      if (digits.length >= 4) {
        const last4 = digits.slice(-4);
        return `xxx-x-xx${last4.slice(0, 3)}-${last4.slice(3)}`;
      }
      return `xxx-x-xx${digits}`;
    }

    // 4. Krungsri (BAY): xxx-x-xx789-x
    if (bankLower.includes('krungsri') || bankLower.includes('กรุงศรี') || bankLower.includes('bay')) {
      const d3 = digits.length >= 3 ? digits.slice(-3) : digits;
      return `xxx-x-xx${d3}-x`;
    }

    // 5. GSB (ออมสิน): 020-x-xxxx78-9
    if (bankLower.includes('gsb') || bankLower.includes('ออมสิน')) {
      if (digits.length >= 3) {
        const last3 = digits.slice(-3);
        return `020-x-xxxx${last3.slice(0, 2)}-${last3.slice(2)}`;
      }
      return `020-x-xxxx${digits}`;
    }

    // 6. PromptPay (พร้อมเพย์) / TrueMoney
    if (
      bankLower.includes('promptpay') ||
      bankLower.includes('พร้อมเพย์') ||
      bankLower.includes('truemoney')
    ) {
      if (digits.length === 13) {
        return `x-xxxx-xxxxx-${digits.slice(-3, -1)}-${digits.slice(-1)}`;
      }
      const d4 = digits.length >= 4 ? digits.slice(-4) : digits;
      return `xxx-xxx-${d4}`;
    }

    // Default fallback
    if (digits.length <= 4) {
      return `xxx-x-x${digits}-x`;
    }
    return `${digits.slice(0, 3)}-xxxx-x${digits.slice(-4)}`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            บัญชีธนาคารของฉัน
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            ระบุเลขบัญชีตนเองเพื่อให้ AI ทราบว่าสลิปที่อ่านได้เป็น &quot;รายรับ&quot; หรือ &quot;รายจ่าย&quot;
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center space-x-2 bg-fastwork-500 hover:bg-fastwork-600 text-white text-sm font-bold px-4 py-2.5 rounded-2xl shadow-sm hover:shadow-fastwork transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>เพิ่มบัญชีใหม่</span>
        </button>
      </div>

      {/* Security Info Card */}
      <div className="bg-fastwork-50/70 border border-fastwork-100 rounded-3xl p-5 flex items-start space-x-3.5 shadow-2xs">
        <div className="p-2.5 bg-fastwork-100 text-fastwork-600 rounded-2xl flex-shrink-0">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-slate-900">
            ระบบตรวจจับสลิปอัจฉริยะ รองรับทุกธนาคาร
          </h4>
          <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
            Snapbook รองรับทั้ง <strong>เลข 3-4 ตัวที่เห็นบนสลิป</strong> (เช่น 6789 ของกสิกร/ทีทีบี, 789 ของกรุงเทพ/ออมสิน) หรือ <strong>เลขบัญชีเต็ม 10-12 หลัก</strong> ระบบจะจับคู่กับสลิปอัตโนมัติอย่างแม่นยำ
          </p>
        </div>
      </div>

      {/* Accounts Grid */}
      {loading ? (
        <div className="py-16 text-center space-y-2">
          <div className="w-8 h-8 rounded-full border-3 border-fastwork-100 border-t-fastwork-500 animate-spin mx-auto" />
          <p className="text-xs text-slate-400 font-medium">กำลังโหลดบัญชีธนาคาร...</p>
        </div>
      ) : accounts.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center shadow-fastwork-sm space-y-3">
          <div className="w-16 h-16 rounded-3xl bg-slate-50 flex items-center justify-center mx-auto text-slate-300">
            <Building2 className="w-8 h-8" />
          </div>
          <h3 className="font-extrabold text-slate-800 text-lg">ยังไม่มีบัญชีธนาคารที่ลงทะเบียน</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            กดปุ่ม &quot;เพิ่มบัญชีใหม่&quot; ด้านบนเพื่อเพิ่มบัญชีของคุณ แล้ว AI จะช่วยแยกรายรับรายจ่ายให้อัตโนมัติ
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center space-x-1.5 bg-fastwork-50 text-fastwork-600 hover:bg-fastwork-100 font-bold text-xs px-4 py-2 rounded-xl transition"
          >
            <Plus className="w-4 h-4" />
            <span>เพิ่มบัญชีตอนนี้</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((acc) => {
            const style = getBankStyle(acc.bank_name);
            return (
              <div
                key={acc.id}
                className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-fastwork-sm hover:shadow-fastwork transition-all relative overflow-hidden group flex flex-col justify-between"
              >
                {/* Bank Header Color Strip */}
                <div className={`h-2 absolute top-0 left-0 right-0 bg-gradient-to-r ${style.color}`}></div>

                <div>
                  <div className="flex items-start justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      {acc.bank_name}
                    </span>
                    <button
                      onClick={() => handleDelete(acc.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                      title="ลบบัญชีนี้"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="mt-4">
                    <p className="text-base font-extrabold text-slate-900 truncate">
                      {acc.account_name}
                    </p>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className="font-mono text-lg font-bold text-fastwork-600 tracking-wider">
                        {formatDisplayAccount(acc.bank_name, acc.account_number_last4)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1 text-emerald-600 font-medium text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    ตรวจจับอัตโนมัติ
                  </span>
                  <span>
                    {acc.account_number_last4.length <= 4
                      ? `${acc.account_number_last4.length} หลักบนสลิป`
                      : 'เลขบัญชีเต็ม'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-md w-full p-6 shadow-2xl relative animate-in fade-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-100">
              <h3 className="text-lg font-extrabold text-slate-900">
                เพิ่มบัญชีธนาคารของฉัน
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  เลือกธนาคาร / กระเป๋าเงิน *
                </label>
                <select
                  value={form.bank_name}
                  onChange={(e) => setForm({ ...form, bank_name: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-fastwork-500/20 focus:border-fastwork-500 font-medium"
                >
                  {thaiBanks.map((b) => (
                    <option key={b.name} value={b.name}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ชื่อบัญชี (ตามที่ปรากฏในสลิป) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น นาย สมชาย ใจดี หรือ SOMCHAI J."
                  value={form.account_name}
                  onChange={(e) => setForm({ ...form, account_name: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-fastwork-500/20 focus:border-fastwork-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  เลขบัญชี / เบอร์พร้อมเพย์ *
                </label>
                <input
                  type="text"
                  required
                  maxLength={15}
                  placeholder="เช่น 6789 หรือเลขบัญชีเต็ม 10-12 หลัก"
                  value={form.account_number_last4}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      account_number_last4: e.target.value.replace(/\D/g, ''),
                    })
                  }
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-fastwork-500/20 focus:border-fastwork-500 font-mono tracking-widest font-bold text-base"
                />
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  ระบุได้ทั้ง <strong>เลข 3-4 ตัวที่เห็นบนสลิป</strong> (เช่น กสิกร xxx-x-x<strong>6789</strong>-x หรือ กรุงเทพ xxx-x-xx<strong>789</strong>-x) หรือใส่ <strong>เลขบัญชีเต็ม 10-12 หลัก</strong>
                </p>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold bg-fastwork-500 hover:bg-fastwork-600 text-white rounded-xl shadow-sm hover:shadow-fastwork transition"
                >
                  บันทึกบัญชี
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
