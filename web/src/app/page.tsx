'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { summaryApi, authApi } from '@/lib/api';
import NextLink from 'next/link';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Receipt,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  PlusCircle,
  Scan,
} from 'lucide-react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
);

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [summary, setSummary] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchSummary = async (month: string) => {
    setLoading(true);
    try {
      const [summaryData, profileData] = await Promise.all([
        summaryApi.getSummary(month),
        authApi.getMe(),
      ]);
      setSummary(summaryData);
      setProfile(profileData);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchSummary(currentMonth);
    }
  }, [user, currentMonth]);

  const handlePrevMonth = () => {
    const [y, m] = currentMonth.split('-').map(Number);
    const date = new Date(y, m - 2, 1);
    setCurrentMonth(
      `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
    );
  };

  const handleNextMonth = () => {
    const [y, m] = currentMonth.split('-').map(Number);
    const date = new Date(y, m, 1);
    setCurrentMonth(
      `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
    );
  };

  if (authLoading || (!summary && loading)) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Format month to Thai label
  const [yearNum, monthNum] = currentMonth.split('-').map(Number);
  const thaiMonths = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม',
  ];
  const monthLabel = `${thaiMonths[monthNum - 1]} ${yearNum + 543}`;

  // Chart data: Categories (Expenses)
  const expenseCategories =
    summary?.by_category?.filter((c: any) => c.type === 'expense') || [];
  const doughnutData = {
    labels: expenseCategories.map((c: any) => c.name),
    datasets: [
      {
        data: expenseCategories.map((c: any) => Number(c.total)),
        backgroundColor: expenseCategories.map(
          (c: any) => c.color || '#94A3B8',
        ),
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  };

  // Chart data: Daily Cashflow
  const dailyLabels = summary?.daily?.map((d: any) => d.date.slice(8)) || [];
  const barData = {
    labels: dailyLabels,
    datasets: [
      {
        label: 'รายรับ',
        data: summary?.daily?.map((d: any) => Number(d.income)) || [],
        backgroundColor: '#10B981',
        borderRadius: 4,
      },
      {
        label: 'รายจ่าย',
        data: summary?.daily?.map((d: any) => Number(d.expense)) || [],
        backgroundColor: '#EF4444',
        borderRadius: 4,
      },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Alert banner if own accounts are missing */}
      {profile && !profile.has_registered_accounts && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start justify-between shadow-sm">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-semibold text-amber-900">
                คุณยังไม่ได้ลงทะเบียนบัญชีธนาคารของตนเอง
              </h4>
              <p className="text-xs text-amber-700 mt-0.5">
                เพื่อความแม่นยำในการระบุว่าเป็น &quot;รายรับ&quot; หรือ &quot;รายจ่าย&quot; กรุณาเพิ่มเลขบัญชีของคุณในระบบ
              </p>
            </div>
          </div>
          <NextLink
            href="/accounts"
            className="text-xs font-semibold bg-amber-600 text-white px-3 py-1.5 rounded-lg hover:bg-amber-700 transition ml-4 whitespace-nowrap"
          >
            เพิ่มบัญชี
          </NextLink>
        </div>
      )}

      {/* Header & Month Navigator */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            ภาพรวมการเงิน
          </h1>
          <p className="text-sm text-slate-500">
            สรุปข้อมูลรายรับและรายจ่ายประจำเดือน
          </p>
        </div>

        {/* Month Selector */}
        <div className="flex items-center bg-white border border-slate-200 rounded-xl shadow-sm p-1">
          <button
            onClick={handlePrevMonth}
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
            title="เดือนก่อนหน้า"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-4 text-sm font-semibold text-slate-800">
            {monthLabel}
          </span>
          <button
            onClick={handleNextMonth}
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
            title="เดือนถัดไป"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Net balance */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              คงเหลือสุทธิ
            </span>
            <span
              className={`p-2 rounded-xl ${
                summary.net >= 0 ? 'bg-indigo-50 text-indigo-600' : 'bg-rose-50 text-rose-600'
              }`}
            >
              <Wallet className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-3">
            <p
              className={`text-2xl font-bold tracking-tight ${
                summary.net >= 0 ? 'text-indigo-600' : 'text-rose-600'
              }`}
            >
              ฿{Number(summary.net || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              ทำรายการไปแล้ว {summary.count || 0} รายการ
            </p>
          </div>
        </div>

        {/* Total Income */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              รายรับรวม
            </span>
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <TrendingUp className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-emerald-600 tracking-tight">
              ฿{Number(summary.total_income || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
            </p>
            {summary.compared_to_last_month?.income_change_pct !== null && (
              <p
                className={`text-xs font-medium flex items-center mt-1 ${
                  summary.compared_to_last_month.income_change_pct >= 0
                    ? 'text-emerald-600'
                    : 'text-rose-600'
                }`}
              >
                <span>
                  {summary.compared_to_last_month.income_change_pct >= 0 ? '+' : ''}
                  {summary.compared_to_last_month.income_change_pct}%
                </span>
                <span className="text-slate-400 font-normal ml-1">เทียบเดือนก่อน</span>
              </p>
            )}
          </div>
        </div>

        {/* Total Expense */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              รายจ่ายรวม
            </span>
            <span className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <TrendingDown className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-rose-600 tracking-tight">
              ฿{Number(summary.total_expense || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
            </p>
            {summary.compared_to_last_month?.expense_change_pct !== null && (
              <p
                className={`text-xs font-medium flex items-center mt-1 ${
                  summary.compared_to_last_month.expense_change_pct <= 0
                    ? 'text-emerald-600'
                    : 'text-rose-600'
                }`}
              >
                <span>
                  {summary.compared_to_last_month.expense_change_pct >= 0 ? '+' : ''}
                  {summary.compared_to_last_month.expense_change_pct}%
                </span>
                <span className="text-slate-400 font-normal ml-1">เทียบเดือนก่อน</span>
              </p>
            )}
          </div>
        </div>

        {/* Fees */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              ค่าธรรมเนียม
            </span>
            <span className="p-2 rounded-xl bg-slate-50 text-slate-600">
              <Receipt className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-slate-800 tracking-tight">
              ฿{Number(summary.total_fee || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-slate-400 mt-1">ค่าธรรมเนียมการโอน</p>
          </div>
        </div>
      </div>

      {/* Quick Action Banner */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-3xl p-6 text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold tracking-tight">
            มีสลิปโอนเงินใหม่ใช่ไหม?
          </h3>
          <p className="text-indigo-100 text-sm mt-1">
            อัปโหลดสลิปได้สูงสุด 10 รูปพร้อมกัน AI จะอ่านข้อมูลให้โดยอัตโนมัติ
          </p>
        </div>
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <NextLink
            href="/slips"
            className="flex-1 sm:flex-initial flex items-center justify-center space-x-2 bg-white text-indigo-700 font-semibold px-5 py-2.5 rounded-xl hover:bg-indigo-50 shadow-sm transition"
          >
            <Scan className="w-4 h-4" />
            <span>สแกนสลิป</span>
          </NextLink>
          <NextLink
            href="/transactions"
            className="flex-1 sm:flex-initial flex items-center justify-center space-x-2 bg-indigo-500 text-white font-semibold px-4 py-2.5 rounded-xl hover:bg-indigo-400 transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>คีย์เอง</span>
          </NextLink>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-base font-bold text-slate-800 mb-4">
            สัดส่วนรายจ่ายตามหมวดหมู่
          </h3>
          {expenseCategories.length > 0 ? (
            <div className="space-y-6">
              <div className="h-52 relative flex items-center justify-center">
                <Doughnut
                  data={doughnutData}
                  options={{
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: false },
                    },
                    cutout: '70%',
                  }}
                />
              </div>

              {/* Category pills list */}
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {expenseCategories.map((cat: any) => (
                  <div
                    key={cat.category_id || cat.name}
                    className="flex items-center justify-between text-sm py-1 border-b border-slate-50 last:border-0"
                  >
                    <div className="flex items-center space-x-2">
                      <span
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: cat.color || '#94A3B8' }}
                      />
                      <span className="text-slate-700 font-medium truncate max-w-[140px]">
                        {cat.name}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold text-slate-800">
                        ฿{Number(cat.total).toLocaleString('th-TH')}
                      </span>
                      <span className="text-xs text-slate-400 ml-1.5">
                        ({cat.percent}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 text-sm">
              ยังไม่มีข้อมูลรายจ่ายในเดือนนี้
            </div>
          )}
        </div>

        {/* Daily Cashflow Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-bold text-slate-800">
              กระแสเงินสดรายวัน (รายรับ vs รายจ่าย)
            </h3>
            <NextLink
              href="/transactions"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center"
            >
              <span>ดูธุรกรรมทั้งหมด</span>
              <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
            </NextLink>
          </div>
          <div className="h-72">
            <Bar
              data={barData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top',
                    labels: { boxWidth: 12, font: { size: 12 } },
                  },
                },
                scales: {
                  x: { grid: { display: false } },
                  y: {
                    ticks: {
                      callback: (value) => `฿${Number(value).toLocaleString()}`,
                    },
                  },
                },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
