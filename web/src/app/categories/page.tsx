'use client';

import React, { useEffect, useState } from 'react';
import { categoriesApi } from '@/lib/api';
import { useAlert } from '@/context/AlertContext';
import { Plus, Tag, Trash2, ShieldCheck, UserCheck, Loader2, AlertCircle, X, Sparkles } from 'lucide-react';
import {
  CategoryAvatar,
  CategoryIconPicker,
  suggestCategoryIcon,
} from '@/components/CategoryIcon';

interface Category {
  id: string;
  user_id: string | null;
  name: string;
  type: 'income' | 'expense';
  icon: string | null;
  color: string | null;
}

const PRESET_COLORS = [
  '#0066FF', '#10B981', '#EF4444', '#F59E0B', '#8B5CF6',
  '#EC4899', '#06B6D4', '#F97316', '#6366F1', '#64748B'
];

export default function CategoriesPage() {
  const { toast, confirm } = useAlert();
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
  const [formIcon, setFormIcon] = useState('shopping-bag');
  const [hasManuallyPickedIcon, setHasManuallyPickedIcon] = useState(false);

  const openCreateModal = () => {
    setError(null);
    setFormName('');
    setFormType('expense');
    setFormColor(PRESET_COLORS[0]);
    setFormIcon('shopping-bag');
    setHasManuallyPickedIcon(false);
    setIsModalOpen(true);
  };

  const handleNameChange = (val: string) => {
    setFormName(val);
    if (!hasManuallyPickedIcon) {
      const suggested = suggestCategoryIcon(val, formType);
      setFormIcon(suggested);
    }
  };

  const handleTypeChange = (newType: 'income' | 'expense') => {
    setFormType(newType);
    if (!hasManuallyPickedIcon) {
      const suggested = suggestCategoryIcon(formName, newType);
      setFormIcon(suggested);
    }
  };

  const handleIconSelect = (iconKey: string) => {
    setFormIcon(iconKey);
    setHasManuallyPickedIcon(true);
  };

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
        icon: formIcon,
      });
      setIsModalOpen(false);
      setFormName('');
      toast.success('สร้างหมวดหมู่ใหม่เรียบร้อยแล้ว');
      await loadCategories();
    } catch (err: any) {
      setError(err.response?.data?.message || 'ไม่สามารถสร้างหมวดหมู่ได้');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    const ok = await confirm({
      title: 'ลบหมวดหมู่',
      message: `คุณต้องการลบหมวดหมู่ "${name}" ใช่หรือไม่?`,
      confirmText: 'ลบหมวดหมู่',
      type: 'danger',
    });
    if (!ok) return;

    try {
      await categoriesApi.delete(id);
      setCategories(categories.filter((c) => c.id !== id));
      toast.success('ลบหมวดหมู่เรียบร้อยแล้ว');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'ไม่สามารถลบหมวดหมู่ได้');
    }
  };

  const filteredCategories = categories.filter((c) => {
    if (filterType === 'all') return true;
    return c.type === filterType;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            จัดการหมวดหมู่
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            หมวดหมู่เริ่มต้นจากระบบ และหมวดหมู่เพิ่มเติมที่คุณกำหนดขึ้นเอง
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center space-x-2 bg-fastwork-500 hover:bg-fastwork-600 text-white text-sm font-bold px-4 py-2.5 rounded-2xl shadow-sm hover:shadow-fastwork transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>เพิ่มหมวดหมู่ใหม่</span>
        </button>
      </div>

      {error && (
        <div className="rounded-2xl bg-rose-50 p-4 border border-rose-200 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-500 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-rose-800 font-medium">{error}</div>
        </div>
      )}

      {/* Tabs (Fastwork Style) */}
      <div className="flex bg-slate-100 p-1 rounded-2xl w-full sm:w-auto self-start">
        <button
          onClick={() => setFilterType('all')}
          className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            filterType === 'all'
              ? 'bg-white text-fastwork-600 shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          ทั้งหมด ({categories.length})
        </button>
        <button
          onClick={() => setFilterType('expense')}
          className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            filterType === 'expense'
              ? 'bg-white text-rose-600 shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          รายจ่าย ({categories.filter((c) => c.type === 'expense').length})
        </button>
        <button
          onClick={() => setFilterType('income')}
          className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            filterType === 'income'
              ? 'bg-white text-emerald-600 shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          รายรับ ({categories.filter((c) => c.type === 'income').length})
        </button>
      </div>

      {/* Categories Grid */}
      {loading ? (
        <div className="py-16 text-center space-y-2">
          <div className="w-8 h-8 rounded-full border-3 border-fastwork-100 border-t-fastwork-500 animate-spin mx-auto" />
          <p className="text-xs text-slate-400 font-medium">กำลังโหลดหมวดหมู่...</p>
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="p-12 text-center text-slate-400 bg-white rounded-3xl border border-slate-200/80 shadow-fastwork-sm space-y-2">
          <Tag className="w-12 h-12 mx-auto text-slate-300" />
          <p className="font-semibold text-slate-600">ไม่พบหมวดหมู่ในประเภทนี้</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {filteredCategories.map((category) => {
            const isSystem = !category.user_id;
            return (
              <div
                key={category.id}
                className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-fastwork-sm hover:shadow-fastwork transition-all flex flex-col justify-between group"
              >
                <div className="flex items-start justify-between">
                  <CategoryAvatar
                    icon={category.icon}
                    categoryName={category.name}
                    type={category.type}
                    color={category.color}
                    size="md"
                  />

                  {!isSystem && (
                    <button
                      onClick={() => handleDelete(category.id, category.name)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                      title="ลบหมวดหมู่นี้"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="mt-3">
                  <h3 className="font-extrabold text-slate-900 text-sm truncate">
                    {category.name}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        category.type === 'income'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-rose-50 text-rose-700'
                      }`}
                    >
                      {category.type === 'income' ? 'รายรับ' : 'รายจ่าย'}
                    </span>
                    {isSystem ? (
                      <span className="text-[10px] inline-flex items-center gap-0.5 text-slate-400">
                        <ShieldCheck className="w-3 h-3 text-fastwork-500" /> ระบบ
                      </span>
                    ) : (
                      <span className="text-[10px] inline-flex items-center gap-0.5 text-fastwork-600 font-medium">
                        <UserCheck className="w-3 h-3" /> ผู้ใช้
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Create Category */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-lg w-full p-6 shadow-2xl relative animate-in fade-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">
                  เพิ่มหมวดหมู่ใหม่
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  กำหนดชื่อ สี และเลือกไอคอนที่ระบบคัดสรรไว้
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ชื่อหมวดหมู่ *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="เช่น ค่าเน็ต, ช้อปปิ้ง, กาแฟ, บิลค่าน้ำไฟ"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-fastwork-500/20 focus:border-fastwork-500 text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ประเภท
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleTypeChange('expense')}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                      formType === 'expense'
                        ? 'bg-rose-50 border-rose-300 text-rose-700'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    รายจ่าย (Expense)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTypeChange('income')}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                      formType === 'income'
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    รายรับ (Income)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  เลือกสีสัญลักษณ์
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setFormColor(c)}
                      className={`w-8 h-8 rounded-full border-2 transition-transform shadow-2xs ${
                        formColor === c ? 'scale-115 border-slate-900 ring-2 ring-slate-400' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              {/* Icon Selection by System & User */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  เลือกไอคอนประจำหมวดหมู่
                </label>
                <CategoryIconPicker
                  selectedIcon={formIcon}
                  onSelectIcon={handleIconSelect}
                  categoryName={formName}
                  type={formType}
                  color={formColor}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-fastwork-500 hover:bg-fastwork-600 rounded-xl shadow-sm hover:shadow-fastwork disabled:opacity-50 transition-all flex items-center gap-2"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>บันทึกหมวดหมู่</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
