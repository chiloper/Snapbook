'use client';

import React, { useEffect, useState } from 'react';
import { categoriesApi } from '@/lib/api';
import { Plus, Tag, Trash2, ShieldCheck, UserCheck, Loader2, AlertCircle } from 'lucide-react';

interface Category {
  id: string;
  user_id: string | null;
  name: string;
  type: 'income' | 'expense';
  icon: string | null;
  color: string | null;
}

const PRESET_COLORS = [
  '#EF4444', '#F97316', '#F59E0B', '#10B981', '#06B6D4',
  '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899', '#64748B'
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState<'income' | 'expense'>('expense');
  const [formColor, setFormColor] = useState(PRESET_COLORS[0]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await categoriesApi.getAll();
      setCategories(data);
    } catch (err: any) {
      console.error(err);
      setError('ไม่สามารถดึงข้อมูลหมวดหมู่ได้');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    setSubmitting(true);
    setError(null);
    try {
      await categoriesApi.create({
        name: formName.trim(),
        type: formType,
        color: formColor,
      });
      setIsModalOpen(false);
      setFormName('');
      await loadCategories();
    } catch (err: any) {
      setError(err.response?.data?.message || 'ไม่สามารถสร้างหมวดหมู่ได้');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`คุณต้องการลบหมวดหมู่ "${name}" ใช่หรือไม่?`)) return;

    try {
      await categoriesApi.delete(id);
      setCategories(categories.filter((c) => c.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.message || 'ไม่สามารถลบหมวดหมู่ได้');
    }
  };

  const filteredCategories = categories.filter((c) => {
    if (filterType === 'all') return true;
    return c.type === filterType;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">จัดการหมวดหมู่ (Categories)</h1>
          <p className="text-sm text-gray-500 mt-1">
            หมวดหมู่เริ่มต้นจากระบบ และหมวดหมู่เพิ่มเติมที่คุณกำหนดขึ้นเอง
          </p>
        </div>
        <button
          onClick={() => {
            setError(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white text-sm font-medium rounded-xl hover:bg-emerald-700 shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          เพิ่มหมวดหมู่ใหม่
        </button>
      </div>

      {error && (
        <div className="rounded-xl bg-rose-50 p-4 border border-rose-200 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-500 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-rose-800">{error}</div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setFilterType('all')}
          className={`pb-3 px-3 text-sm font-medium border-b-2 transition-colors ${
            filterType === 'all'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          ทั้งหมด ({categories.length})
        </button>
        <button
          onClick={() => setFilterType('expense')}
          className={`pb-3 px-3 text-sm font-medium border-b-2 transition-colors ${
            filterType === 'expense'
              ? 'border-rose-600 text-rose-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          รายจ่าย ({categories.filter((c) => c.type === 'expense').length})
        </button>
        <button
          onClick={() => setFilterType('income')}
          className={`pb-3 px-3 text-sm font-medium border-b-2 transition-colors ${
            filterType === 'income'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          รายรับ ({categories.filter((c) => c.type === 'income').length})
        </button>
      </div>

      {/* Categories Grid */}
      {loading ? (
        <div className="p-12 text-center text-gray-400">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-600 mb-2" />
          กำลังโหลดหมวดหมู่...
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="p-12 text-center text-gray-400 bg-white rounded-2xl border border-gray-100">
          <Tag className="w-12 h-12 mx-auto text-gray-300 mb-2" />
          ไม่พบหมวดหมู่ในประเภทนี้
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredCategories.map((category) => {
            const isSystem = !category.user_id;
            return (
              <div
                key={category.id}
                className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm"
                    style={{ backgroundColor: category.color || '#64748B' }}
                  >
                    {category.name.substring(0, 1)}
                  </span>
                  <div>
                    <h3 className="font-semibold text-gray-800 text-sm">{category.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                          category.type === 'income'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {category.type === 'income' ? 'รายรับ' : 'รายจ่าย'}
                      </span>
                      {isSystem ? (
                        <span className="text-[10px] inline-flex items-center gap-0.5 text-gray-400">
                          <ShieldCheck className="w-3 h-3 text-blue-500" /> ระบบ
                        </span>
                      ) : (
                        <span className="text-[10px] inline-flex items-center gap-0.5 text-emerald-600">
                          <UserCheck className="w-3 h-3" /> ผู้ใช้
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {!isSystem && (
                  <button
                    onClick={() => handleDelete(category.id, category.name)}
                    className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="ลบหมวดหมู่นี้"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Create Category */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-5 animate-in fade-in duration-200">
            <h2 className="text-lg font-bold text-gray-900">เพิ่มหมวดหมู่ใหม่</h2>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ชื่อหมวดหมู่
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="เช่น ช้อปปิ้งออนไลน์, เบี้ยเลี้ยง"
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ประเภท
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormType('expense')}
                    className={`py-2 px-3 text-sm font-medium rounded-xl border text-center transition-colors ${
                      formType === 'expense'
                        ? 'bg-rose-50 border-rose-500 text-rose-700 font-semibold'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    รายจ่าย (Expense)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormType('income')}
                    className={`py-2 px-3 text-sm font-medium rounded-xl border text-center transition-colors ${
                      formType === 'income'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-700 font-semibold'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    รายรับ (Income)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  เลือกสีสัญลักษณ์
                </label>
                <div className="flex flex-wrap gap-2">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setFormColor(c)}
                      className={`w-7 h-7 rounded-full border-2 transition-transform ${
                        formColor === c ? 'scale-110 border-gray-900' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm disabled:opacity-50 transition-colors flex items-center gap-2"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  บันทึกหมวดหมู่
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
