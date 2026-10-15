'use client';

import React, { useEffect, useState } from 'react';
import { transactionsApi, categoriesApi } from '@/lib/api';
import {
  Check,
  CheckCheck,
  Trash2,
  Edit2,
  Plus,
  Search,
  Filter,
  ArrowDownLeft,
  ArrowUpRight,
  Receipt,
  X,
  Calendar,
  AlertCircle,
  Tag,
  CreditCard,
  Building2,
  ChevronRight,
} from 'lucide-react';

export default function TransactionsPage() {
  const [activeTab, setActiveTab] = useState<'pending' | 'all'>('pending');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('');

  // Modals
  const [editingTx, setEditingTx] = useState<any | null>(null);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [manualForm, setManualForm] = useState({
    type: 'expense',
    amount: '',
    fee: '0',
    transaction_at: new Date().toISOString().slice(0, 16),
    counterparty_name: '',
    category_id: '',
    note: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = {
        limit: 50,
      };
      if (activeTab === 'pending') {
        params.status = 'pending_review';
      }
      if (filterType) {
        params.type = filterType;
      }
      if (search) {
        params.search = search;
      }

      const [txRes, catRes] = await Promise.all([
        transactionsApi.getAll(params),
        categoriesApi.getAll(),
      ]);

      setTransactions(txRes.data || []);
      setCategories(catRes || []);
    } catch (err) {
      console.error('Failed to load transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab, filterType]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData();
  };

  const handleConfirmBulk = async () => {
    const pendingIds = transactions
      .filter((t) => t.status === 'pending_review')
      .map((t) => t.id);

    if (pendingIds.length === 0) return;

    if (!confirm(`ต้องการยืนยันรายการทั้งหมด ${pendingIds.length} รายการใช่หรือไม่?`)) {
      return;
    }

    try {
      await transactionsApi.confirmBulk(pendingIds);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'เกิดข้อผิดพลาดในการยืนยันรายการ');
    }
  };

  const handleConfirmSingle = async (tx: any) => {
    try {
      await transactionsApi.update(tx.id, { status: 'confirmed' });
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'ไม่สามารถยืนยันรายการได้');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('ต้องการลบรายการนี้ใช่หรือไม่? (หากมาจากสลิป รูปสลิปจะถูกลบไปด้วย)')) {
      return;
    }
    try {
      await transactionsApi.delete(id);
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.message || 'ไม่สามารถลบรายการได้');
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTx) return;

    try {
      await transactionsApi.update(editingTx.id, {
        type: editingTx.type,
        amount: Number(editingTx.amount),
        category_id: editingTx.category_id || null,
        counterparty_name: editingTx.counterparty_name,
        note: editingTx.note,
        status: 'confirmed',
      });
      setEditingTx(null);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'เกิดข้อผิดพลาดในการแก้ไขรายการ');
    }
  };

  const handleCreateManual = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await transactionsApi.create({
        type: manualForm.type,
        amount: Number(manualForm.amount),
        fee: Number(manualForm.fee) || 0,
        transaction_at: new Date(manualForm.transaction_at).toISOString(),
        counterparty_name: manualForm.counterparty_name,
        category_id: manualForm.category_id || null,
        note: manualForm.note,
      });
      setIsManualModalOpen(false);
      setManualForm({
        type: 'expense',
        amount: '',
        fee: '0',
        transaction_at: new Date().toISOString().slice(0, 16),
        counterparty_name: '',
        category_id: '',
        note: '',
      });
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'ไม่สามารถสร้างรายการได้');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            รายการธุรกรรม
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            ตรวจสอบ ยืนยันรายการ และจัดการรายรับ-รายจ่าย
          </p>
        </div>

        <button
          onClick={() => setIsManualModalOpen(true)}
          className="inline-flex items-center space-x-2 bg-fastwork-500 hover:bg-fastwork-600 text-white text-sm font-bold px-4 py-2.5 rounded-2xl shadow-sm hover:shadow-fastwork transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>+ บันทึกรายการเอง</span>
        </button>
      </div>

      {/* Tabs, Search & Filters Box (Fastwork Style) */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-fastwork-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
          {/* Fastwork Pill Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-2xl w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('pending')}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'pending'
                  ? 'bg-white text-fastwork-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              รอตรวจสอบ (Pending)
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'all'
                  ? 'bg-white text-fastwork-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              ทั้งหมด (All)
            </button>
          </div>

          {/* Bulk Confirm Button */}
          {activeTab === 'pending' && transactions.length > 0 && (
            <button
              onClick={handleConfirmBulk}
              className="inline-flex items-center justify-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-2xl transition-all shadow-sm active:scale-95"
            >
              <CheckCheck className="w-4 h-4" />
              <span>ยืนยันทั้งหมด ({transactions.length})</span>
            </button>
          )}
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-slate-100">
          <form onSubmit={handleSearchSubmit} className="flex-1 relative">
            <input
              type="text"
              placeholder="ค้นหาชื่อคู่โอน, บันทึก, รหัสอ้างอิง..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-fastwork-500/20 focus:border-fastwork-500 transition"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          </form>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-slate-700 font-medium focus:outline-none focus:border-fastwork-500"
          >
            <option value="">ทุกประเภท</option>
            <option value="expense">เฉพาะรายจ่าย (Expense)</option>
            <option value="income">เฉพาะรายรับ (Income)</option>
          </select>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-fastwork-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center space-y-2">
            <div className="w-8 h-8 rounded-full border-3 border-fastwork-100 border-t-fastwork-500 animate-spin mx-auto" />
            <p className="text-xs text-slate-400 font-medium">กำลังโหลดข้อมูลรายการ...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-sm space-y-2">
            <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto text-slate-300">
              <Receipt className="w-8 h-8" />
            </div>
            <p className="font-semibold text-slate-600">ไม่พบรายการธุรกรรม</p>
            <p className="text-xs text-slate-400">อัปโหลดสลิปธนาคารหรือบันทึกรายการเพื่อเริ่มต้น</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {transactions.map((tx) => {
              const isIncome = tx.type === 'income';
              const isPending = tx.status === 'pending_review';

              return (
                <div
                  key={tx.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-slate-50/70 transition gap-3"
                >
                  {/* Left: Icon & Info */}
                  <div className="flex items-start sm:items-center space-x-3.5 min-w-0">
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 mt-0.5 sm:mt-0 ${
                        isIncome ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                      }`}
                    >
                      {isIncome ? (
                        <ArrowDownLeft className="w-5 h-5" />
                      ) : (
                        <ArrowUpRight className="w-5 h-5" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                        <span className="font-bold text-slate-900 text-sm truncate">
                          {tx.counterparty_name || (isIncome ? 'เงินโอนเข้า' : 'โอนเงิน')}
                        </span>
                        {isPending && (
                          <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 font-bold px-2 py-0.5 rounded-full flex-shrink-0">
                            รอตรวจสอบ
                          </span>
                        )}
                        {tx.category && (
                          <span
                            className="font-medium px-2 py-0.5 rounded-md text-[11px] truncate max-w-[120px]"
                            style={{
                              backgroundColor: `${tx.category.color}15`,
                              color: tx.category.color,
                            }}
                          >
                            {tx.category.name}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-2 text-xs text-slate-400 mt-1">
                        <span className="font-medium text-slate-600">{tx.bank_name || 'ธนาคาร'}</span>
                        <span>•</span>
                        <span>{new Date(tx.transaction_at).toLocaleDateString('th-TH')}</span>
                        {Number(tx.fee) > 0 && (
                          <>
                            <span>•</span>
                            <span className="text-slate-400">ค่าธรรมเนียม ฿{Number(tx.fee).toFixed(2)}</span>
                          </>
                        )}
                      </div>

                      {tx.note && (
                        <p className="text-xs text-slate-500 mt-1 truncate max-w-sm">
                          {tx.note}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Amount & Actions */}
                  <div className="flex items-center justify-between sm:justify-end space-x-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 flex-shrink-0">
                    <div className="text-left sm:text-right">
                      <p
                        className={`text-base sm:text-lg font-extrabold tracking-tight ${
                          isIncome ? 'text-emerald-600' : 'text-slate-900'
                        }`}
                      >
                        {isIncome ? '+' : '-'}฿
                        {Number(tx.amount).toLocaleString('th-TH', {
                          minimumFractionDigits: 2,
                        })}
                      </p>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center space-x-1 pl-2 sm:border-l border-slate-200">
                      {isPending && (
                        <button
                          onClick={() => handleConfirmSingle(tx)}
                          className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition"
                          title="ยืนยันรายการ"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => setEditingTx(tx)}
                        className="p-2 text-slate-400 hover:text-fastwork-600 hover:bg-fastwork-50 rounded-xl transition"
                        title="แก้ไขข้อมูล"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(tx.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                        title="ลบรายการ"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Modal (Fastwork Style) */}
      {editingTx && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-md w-full p-6 shadow-2xl relative animate-in fade-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-100">
              <h3 className="text-lg font-extrabold text-slate-900">
                แก้ไขรายการธุรกรรม
              </h3>
              <button
                onClick={() => setEditingTx(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ประเภท
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingTx({ ...editingTx, type: 'expense' })}
                    className={`py-2 rounded-xl font-bold text-xs border transition-all ${
                      editingTx.type === 'expense'
                        ? 'bg-rose-50 border-rose-300 text-rose-700'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    รายจ่าย (Expense)
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingTx({ ...editingTx, type: 'income' })}
                    className={`py-2 rounded-xl font-bold text-xs border transition-all ${
                      editingTx.type === 'income'
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    รายรับ (Income)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ยอดเงิน (บาท)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={editingTx.amount}
                  onChange={(e) =>
                    setEditingTx({ ...editingTx, amount: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-fastwork-500/20 focus:border-fastwork-500 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  หมวดหมู่
                </label>
                <select
                  value={editingTx.category_id || ''}
                  onChange={(e) =>
                    setEditingTx({ ...editingTx, category_id: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-fastwork-500/20 focus:border-fastwork-500 font-medium"
                >
                  <option value="">(ไม่ระบุหมวดหมู่)</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.type === 'income' ? 'รายรับ' : 'รายจ่าย'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ชื่อคู่โอน / ร้านค้า
                </label>
                <input
                  type="text"
                  value={editingTx.counterparty_name || ''}
                  onChange={(e) =>
                    setEditingTx({
                      ...editingTx,
                      counterparty_name: e.target.value,
                    })
                  }
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-fastwork-500/20 focus:border-fastwork-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  บันทึกช่วยจำ
                </label>
                <input
                  type="text"
                  value={editingTx.note || ''}
                  onChange={(e) =>
                    setEditingTx({ ...editingTx, note: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-fastwork-500/20 focus:border-fastwork-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingTx(null)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold bg-fastwork-500 hover:bg-fastwork-600 text-white rounded-xl shadow-sm hover:shadow-fastwork transition"
                >
                  บันทึกการแก้ไข
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manual Entry Modal (Fastwork Style) */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-md w-full p-6 shadow-2xl relative animate-in fade-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-100">
              <h3 className="text-lg font-extrabold text-slate-900">
                บันทึกรายการด้วยตนเอง
              </h3>
              <button
                onClick={() => setIsManualModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateManual} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ประเภท
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setManualForm({ ...manualForm, type: 'expense' })}
                    className={`py-2 rounded-xl font-bold text-xs border transition-all ${
                      manualForm.type === 'expense'
                        ? 'bg-rose-50 border-rose-300 text-rose-700'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    รายจ่าย (Expense)
                  </button>
                  <button
                    type="button"
                    onClick={() => setManualForm({ ...manualForm, type: 'income' })}
                    className={`py-2 rounded-xl font-bold text-xs border transition-all ${
                      manualForm.type === 'income'
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    รายรับ (Income)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ยอดเงิน (บาท) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={manualForm.amount}
                    onChange={(e) =>
                      setManualForm({ ...manualForm, amount: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-fastwork-500/20 focus:border-fastwork-500 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ค่าธรรมเนียม
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={manualForm.fee}
                    onChange={(e) =>
                      setManualForm({ ...manualForm, fee: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-fastwork-500/20 focus:border-fastwork-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  วัน-เวลาที่ทำรายการ
                </label>
                <input
                  type="datetime-local"
                  required
                  value={manualForm.transaction_at}
                  onChange={(e) =>
                    setManualForm({
                      ...manualForm,
                      transaction_at: e.target.value,
                    })
                  }
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-fastwork-500/20 focus:border-fastwork-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  หมวดหมู่
                </label>
                <select
                  value={manualForm.category_id}
                  onChange={(e) =>
                    setManualForm({ ...manualForm, category_id: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-fastwork-500/20 focus:border-fastwork-500 font-medium"
                >
                  <option value="">(ไม่ระบุหมวดหมู่)</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.type === 'income' ? 'รายรับ' : 'รายจ่าย'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ชื่อคู่โอน / ร้านค้า / บัญชีปลายทาง
                </label>
                <input
                  type="text"
                  placeholder="เช่น 7-Eleven, นายสมชาย, Grab"
                  value={manualForm.counterparty_name}
                  onChange={(e) =>
                    setManualForm({
                      ...manualForm,
                      counterparty_name: e.target.value,
                    })
                  }
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-fastwork-500/20 focus:border-fastwork-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  บันทึกช่วยจำ
                </label>
                <input
                  type="text"
                  placeholder="หมายเหตุเพิ่มเติม"
                  value={manualForm.note}
                  onChange={(e) =>
                    setManualForm({ ...manualForm, note: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-fastwork-500/20 focus:border-fastwork-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold bg-fastwork-500 hover:bg-fastwork-600 text-white rounded-xl shadow-sm hover:shadow-fastwork transition"
                >
                  บันทึกรายการ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
