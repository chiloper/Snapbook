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
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            รายการธุรกรรม
          </h1>
          <p className="text-sm text-slate-500">
            ตรวจสอบ ยืนยัน และจัดการรายรับรายจ่าย
          </p>
        </div>

        <button
          onClick={() => setIsManualModalOpen(true)}
          className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>เพิ่มรายการเอง</span>
        </button>
      </div>

      {/* Tabs & Search & Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
          {/* Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                activeTab === 'pending'
                  ? 'bg-white text-indigo-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              รอตรวจสอบ (Pending)
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                activeTab === 'all'
                  ? 'bg-white text-indigo-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ทั้งหมด (All)
            </button>
          </div>

          {/* Bulk confirm button when on pending tab */}
          {activeTab === 'pending' && transactions.length > 0 && (
            <button
              onClick={handleConfirmBulk}
              className="flex items-center justify-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition shadow-sm"
            >
              <CheckCheck className="w-4 h-4" />
              <span>ยืนยันทั้งหมด ({transactions.length})</span>
            </button>
          )}
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-slate-100">
          <form onSubmit={handleSearchSubmit} className="flex-1 relative">
            <input
              type="text"
              placeholder="ค้นหาชื่อคู่โอน, บันทึก, รหัสอ้างอิง..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </form>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none"
          >
            <option value="">ทุกประเภท</option>
            <option value="expense">เฉพาะรายจ่าย</option>
            <option value="income">เฉพาะรายรับ</option>
          </select>
        </div>
      </div>

      {/* Transaction List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-sm">
            <Receipt className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p>ไม่พบรายการธุรกรรม</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {transactions.map((tx) => {
              const isIncome = tx.type === 'income';
              const isPending = tx.status === 'pending_review';

              return (
                <div
                  key={tx.id}
                  className="p-4 sm:p-5 flex items-center justify-between hover:bg-slate-50/70 transition gap-4"
                >
                  {/* Left: Icon & Info */}
                  <div className="flex items-center space-x-3.5 min-w-0">
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                        isIncome ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                      }`}
                    >
                      {isIncome ? (
                        <ArrowDownLeft className="w-6 h-6" />
                      ) : (
                        <ArrowUpRight className="w-6 h-6" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-slate-900 text-sm truncate">
                          {tx.counterparty_name || (isIncome ? 'เงินโอนเข้า' : 'โอนเงิน')}
                        </span>
                        {isPending && (
                          <span className="text-[10px] bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded-full flex-shrink-0">
                            รอตรวจสอบ
                          </span>
                        )}
                      </div>

                      <div className="flex items-center space-x-2 text-xs text-slate-500 mt-0.5">
                        <span>{tx.bank_name || 'ธนาคาร'}</span>
                        <span>•</span>
                        <span>{new Date(tx.transaction_at).toLocaleDateString('th-TH')}</span>
                        {tx.category && (
                          <>
                            <span>•</span>
                            <span
                              className="font-medium px-2 py-0.5 rounded-md text-[11px]"
                              style={{
                                backgroundColor: `${tx.category.color}20`,
                                color: tx.category.color,
                              }}
                            >
                              {tx.category.name}
                            </span>
                          </>
                        )}
                      </div>

                      {tx.note && (
                        <p className="text-xs text-slate-400 mt-1 truncate max-w-sm">
                          {tx.note}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Amount & Actions */}
                  <div className="flex items-center space-x-3 flex-shrink-0">
                    <div className="text-right">
                      <p
                        className={`text-base font-bold tracking-tight ${
                          isIncome ? 'text-emerald-600' : 'text-slate-900'
                        }`}
                      >
                        {isIncome ? '+' : '-'}฿
                        {Number(tx.amount).toLocaleString('th-TH', {
                          minimumFractionDigits: 2,
                        })}
                      </p>
                      {Number(tx.fee) > 0 && (
                        <p className="text-[11px] text-slate-400">
                          ค่าธรรมเนียม: ฿{Number(tx.fee).toFixed(2)}
                        </p>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center space-x-1 pl-2 border-l border-slate-100">
                      {isPending && (
                        <button
                          onClick={() => handleConfirmSingle(tx)}
                          className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                          title="ยืนยันรายการ"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => setEditingTx(tx)}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                        title="แก้ไขข้อมูล"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(tx.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
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

      {/* Edit Modal */}
      {editingTx && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-800">
                แก้ไขรายการธุรกรรม
              </h3>
              <button
                onClick={() => setEditingTx(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-sm">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  ประเภท
                </label>
                <select
                  value={editingTx.type}
                  onChange={(e) =>
                    setEditingTx({ ...editingTx, type: e.target.value })
                  }
                  className="w-full border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="expense">รายจ่าย (Expense)</option>
                  <option value="income">รายรับ (Income)</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  จำนวนเงิน (บาท)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={editingTx.amount}
                  onChange={(e) =>
                    setEditingTx({ ...editingTx, amount: e.target.value })
                  }
                  className="w-full border border-slate-200 rounded-xl p-2.5"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  หมวดหมู่
                </label>
                <select
                  value={editingTx.category_id || ''}
                  onChange={(e) =>
                    setEditingTx({ ...editingTx, category_id: e.target.value })
                  }
                  className="w-full border border-slate-200 rounded-xl p-2.5"
                >
                  <option value="">ไม่ระบุหมวดหมู่</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.type === 'income' ? 'รายรับ' : 'รายจ่าย'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
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
                  className="w-full border border-slate-200 rounded-xl p-2.5"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  บันทึกช่วยจำ
                </label>
                <input
                  type="text"
                  value={editingTx.note || ''}
                  onChange={(e) =>
                    setEditingTx({ ...editingTx, note: e.target.value })
                  }
                  className="w-full border border-slate-200 rounded-xl p-2.5"
                />
              </div>

              <div className="flex space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingTx(null)}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-medium"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-semibold shadow-sm"
                >
                  บันทึก & ยืนยัน
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manual Entry Modal */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-800">
                เพิ่มรายการใหม่ด้วยตนเอง
              </h3>
              <button
                onClick={() => setIsManualModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateManual} className="space-y-4 text-sm">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  ประเภท
                </label>
                <select
                  value={manualForm.type}
                  onChange={(e) =>
                    setManualForm({ ...manualForm, type: e.target.value })
                  }
                  className="w-full border border-slate-200 rounded-xl p-2.5"
                >
                  <option value="expense">รายจ่าย (Expense)</option>
                  <option value="income">รายรับ (Income)</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  จำนวนเงิน (บาท) *
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
                  className="w-full border border-slate-200 rounded-xl p-2.5"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  หมวดหมู่
                </label>
                <select
                  value={manualForm.category_id}
                  onChange={(e) =>
                    setManualForm({
                      ...manualForm,
                      category_id: e.target.value,
                    })
                  }
                  className="w-full border border-slate-200 rounded-xl p-2.5"
                >
                  <option value="">ไม่ระบุหมวดหมู่</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.type === 'income' ? 'รายรับ' : 'รายจ่าย'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  ชื่อร้าน / คู่โอน
                </label>
                <input
                  type="text"
                  placeholder="เช่น เซเว่น, ค่ากาแฟ, ร้านส้มตำ"
                  value={manualForm.counterparty_name}
                  onChange={(e) =>
                    setManualForm({
                      ...manualForm,
                      counterparty_name: e.target.value,
                    })
                  }
                  className="w-full border border-slate-200 rounded-xl p-2.5"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  วันเวลาทำรายการ
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
                  className="w-full border border-slate-200 rounded-xl p-2.5"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  บันทึกเพิ่มเติม
                </label>
                <input
                  type="text"
                  placeholder="เช่น มื้อเที่ยงกับเพื่อน"
                  value={manualForm.note}
                  onChange={(e) =>
                    setManualForm({ ...manualForm, note: e.target.value })
                  }
                  className="w-full border border-slate-200 rounded-xl p-2.5"
                />
              </div>

              <div className="flex space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(false)}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-medium"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-semibold shadow-sm"
                >
                  สร้างรายการ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
