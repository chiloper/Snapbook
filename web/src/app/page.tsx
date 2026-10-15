'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { summaryApi, authApi, transactionsApi } from '@/lib/api';
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
  Camera,
  Sparkles,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
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
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async (month: string) => {
    setLoading(true);
    try {
      const [summaryData, profileData, txData] = await Promise.all([
        summaryApi.getSummary(month),
        authApi.getMe(),
        transactionsApi.getAll({ limit: 5 }),
      ]);
      setSummary(summaryData);
      setProfile(profileData);
      setRecentTransactions(txData?.data || txData || []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDashboardData(currentMonth);
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
      <div className="flex flex-col items-center justify-center min-h-[55vh] space-y-3">
        <div className="w-12 h-12 rounded-full border-4 border-fastwork-100 border-t-fastwork-500 animate-spin"></div>
        <p className="text-sm font-medium text-slate-500 animate-pulse">
          กำลังเตรียมข้อมูลแดชบอร์ด...
        </p>
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
        borderWidth: 3,
        borderColor: '#ffffff',
        hoverOffset: 4,
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
        borderRadius: 6,
      },
      {
        label: 'รายจ่าย',
        data: summary?.daily?.map((d: any) => Number(d.expense)) || [],
        backgroundColor: '#EF4444',
        borderRadius: 6,
      },
    ],
  };

  return (
    <div className="space-y-6">
      {/* 1. FASTWORK-STYLE HERO BANNER */}
      <div className="relative overflow-hidden bg-gradient-to-r from-fastwork-600 via-fastwork-500 to-indigo-600 rounded-3xl p-6 sm:p-8 text-white shadow-fastwork">
        {/* Subtle background graphics */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 -mb-12 w-48 h-48 bg-fastwork-400/20 rounded-full blur-xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center space-x-1.5 bg-white/15 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-emerald-200">
              <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
              <span>ระบบตรวจจับสลิปอัตโนมัติ ⚡</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-snug">
              บันทึกสลิปโอนเงินอัจฉริยะ ⚡
            </h1>
            <p className="text-fastwork-50 text-sm sm:text-base leading-relaxed">
              เพียงอัปโหลดรูปภาพสลิปธนาคาร ระบบจะอ่านยอดเงิน วันที่ และจัดหมวดหมู่อัตโนมัติใน 3 วินาที
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <NextLink
              href="/slips"
              className="flex-1 sm:flex-initial inline-flex items-center justify-center space-x-2 bg-white text-fastwork-600 font-bold px-5 py-3 rounded-2xl hover:bg-fastwork-50 shadow-md hover:shadow-lg transition-all active:scale-[0.98] whitespace-nowrap"
            >
              <Camera className="w-5 h-5 text-fastwork-600 shrink-0" />
              <span>สแกนสลิป</span>
            </NextLink>
            <NextLink
              href="/transactions"
              className="flex-1 sm:flex-initial inline-flex items-center justify-center space-x-2 bg-white/15 hover:bg-white/25 text-white font-semibold px-4 py-3 rounded-2xl backdrop-blur-md transition-all active:scale-[0.98] whitespace-nowrap"
            >
              <PlusCircle className="w-5 h-5 shrink-0" />
              <span>บันทึกเอง</span>
            </NextLink>
          </div>
        </div>
      </div>

      {/* 2. ALERT BANNER (If user hasn't added own bank accounts) */}
      {profile && !profile.has_registered_accounts && (
        <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-start space-x-3">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-700 flex-shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-950">
                ยังไม่ได้ลงทะเบียนบัญชีธนาคารตนเอง
              </h4>
              <p className="text-xs text-amber-800 mt-0.5">
                กรุณาเพิ่มเลข 4 ตัวท้ายของบัญชี เพื่อให้ระบบสามารถจำแนก &quot;รายรับ&quot; หรือ &quot;รายจ่าย&quot; ได้แม่นยำ 100%
              </p>
            </div>
          </div>
          <NextLink
            href="/accounts"
            className="inline-flex items-center justify-center text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-xl transition shadow-sm self-start sm:self-center whitespace-nowrap"
          >
            เพิ่มบัญชีของฉัน
          </NextLink>
        </div>
      )}

      {/* 3. SECTION HEADER & MONTH PICKER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>สรุปการเงินประจำเดือน</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-fastwork-50 text-fastwork-600 border border-fastwork-100">
              {summary.count || 0} รายการ
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            ข้อมูลกระแสเงินสดและสัดส่วนค่าใช้จ่ายแบบเรียลไทม์
          </p>
        </div>

        {/* Fastwork Pill Month Selector */}
        <div className="inline-flex items-center bg-white border border-slate-200/80 rounded-2xl shadow-sm p-1">
          <button
            onClick={handlePrevMonth}
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition active:scale-90"
            title="เดือนก่อนหน้า"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center space-x-1.5 px-3 py-1 text-sm font-bold text-slate-800">
            <Calendar className="w-4 h-4 text-fastwork-500" />
            <span>{monthLabel}</span>
          </div>
          <button
            onClick={handleNextMonth}
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition active:scale-90"
            title="เดือนถัดไป"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 4. FASTWORK KPI STAT CARDS (Responsive: 2-col on Mobile, 4-col on Desktop) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Net Balance */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-fastwork-sm hover:shadow-fastwork transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">คงเหลือสุทธิ</span>
            <div
              className={`p-2 rounded-xl ${
                summary.net >= 0
                  ? 'bg-fastwork-50 text-fastwork-600'
                  : 'bg-rose-50 text-rose-600'
              }`}
            >
              <Wallet className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p
              className={`text-lg sm:text-2xl font-extrabold tracking-tight ${
                summary.net >= 0 ? 'text-fastwork-600' : 'text-rose-600'
              }`}
            >
              ฿{Number(summary.net || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              เงินคงเหลือในเดือนนี้
            </p>
          </div>
        </div>

        {/* Total Income */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-fastwork-sm hover:shadow-fastwork transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">รายรับรวม</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-lg sm:text-2xl font-extrabold text-emerald-600 tracking-tight">
              ฿{Number(summary.total_income || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
            </p>
            {summary.compared_to_last_month?.income_change_pct !== null ? (
              <p
                className={`text-[11px] font-semibold flex items-center mt-1 ${
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
            ) : (
              <p className="text-[11px] text-slate-400 mt-1">เงินเข้าทั้งหมด</p>
            )}
          </div>
        </div>

        {/* Total Expense */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-fastwork-sm hover:shadow-fastwork transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">รายจ่ายรวม</span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-lg sm:text-2xl font-extrabold text-rose-600 tracking-tight">
              ฿{Number(summary.total_expense || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
            </p>
            {summary.compared_to_last_month?.expense_change_pct !== null ? (
              <p
                className={`text-[11px] font-semibold flex items-center mt-1 ${
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
            ) : (
              <p className="text-[11px] text-slate-400 mt-1">เงินออกทั้งหมด</p>
            )}
          </div>
        </div>

        {/* Transfer Fees */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-fastwork-sm hover:shadow-fastwork transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">ค่าธรรมเนียม</span>
            <div className="p-2 rounded-xl bg-slate-100 text-slate-600">
              <Receipt className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-lg sm:text-2xl font-extrabold text-slate-800 tracking-tight">
              ฿{Number(summary.total_fee || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">ค่าธรรมเนียมการโอน</p>
          </div>
        </div>
      </div>

      {/* 5. CHARTS SECTION (Responsive Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Breakdown (Donut) */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-fastwork-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-bold text-slate-900">
              สัดส่วนค่าใช้จ่าย
            </h3>
            <span className="text-xs text-slate-400">
              {expenseCategories.length} หมวดหมู่
            </span>
          </div>

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
                    cutout: '72%',
                  }}
                />
              </div>

              {/* Category pills list */}
              <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                {expenseCategories.map((cat: any) => (
                  <div
                    key={cat.category_id || cat.name}
                    className="flex items-center justify-between text-sm py-1 border-b border-slate-100 last:border-0"
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <span
                        className="w-3 h-3 rounded-full flex-shrink-0 shadow-sm"
                        style={{ backgroundColor: cat.color || '#94A3B8' }}
                      />
                      <span className="text-slate-700 font-medium truncate text-xs sm:text-sm">
                        {cat.name}
                      </span>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <span className="font-bold text-slate-800 text-xs sm:text-sm">
                        ฿{Number(cat.total).toLocaleString('th-TH')}
                      </span>
                      <span className="text-[11px] text-slate-400 ml-1.5 font-medium">
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
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-fastwork-sm lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                กระแสเงินสดรายวัน
              </h3>
              <p className="text-xs text-slate-400">เปรียบเทียบรายรับและรายจ่ายในแต่ละวัน</p>
            </div>
            <NextLink
              href="/transactions"
              className="text-xs font-bold text-fastwork-600 hover:text-fastwork-700 flex items-center bg-fastwork-50 px-3 py-1.5 rounded-xl transition"
            >
              <span>ดูทั้งหมด</span>
              <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
            </NextLink>
          </div>
          <div className="h-64 sm:h-72">
            <Bar
              data={barData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top',
                    labels: { boxWidth: 12, font: { size: 12, family: 'Noto Sans Thai' } },
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

      {/* 6. RECENT TRANSACTIONS PREVIEW (Fastwork style list) */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-fastwork-sm">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              รายการธุรกรรมล่าสุด
            </h3>
            <p className="text-xs text-slate-400">รายการที่ตรวจจับจากสลิปและคีย์ข้อมูล</p>
          </div>
          <NextLink
            href="/transactions"
            className="text-xs font-bold text-fastwork-600 hover:text-fastwork-700 flex items-center bg-fastwork-50 px-3 py-1.5 rounded-xl transition"
          >
            <span>จัดการธุรกรรม</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </NextLink>
        </div>

        {recentTransactions.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {recentTransactions.map((tx: any) => (
              <div
                key={tx.id}
                className="py-3 sm:py-4 flex items-center justify-between gap-3 hover:bg-slate-50/60 -mx-2 px-2 rounded-2xl transition"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                      tx.type === 'income'
                        ? 'bg-emerald-50 text-emerald-600'
                        : 'bg-rose-50 text-rose-600'
                    }`}
                  >
                    {tx.type === 'income' ? (
                      <TrendingUp className="w-5 h-5" />
                    ) : (
                      <TrendingDown className="w-5 h-5" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">
                      {tx.sender_name || tx.receiver_name || 'รายการโอนเงิน'}
                    </p>
                    <div className="flex items-center space-x-2 text-xs text-slate-400 mt-0.5">
                      <span>{new Date(tx.transaction_time || tx.created_at).toLocaleDateString('th-TH')}</span>
                      <span>•</span>
                      <span className="text-fastwork-600 bg-fastwork-50 px-2 py-0.5 rounded-md font-medium text-[11px]">
                        {tx.category?.name || 'ทั่วไป'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <p
                    className={`text-sm sm:text-base font-extrabold ${
                      tx.type === 'income' ? 'text-emerald-600' : 'text-slate-900'
                    }`}
                  >
                    {tx.type === 'income' ? '+' : '-'}฿
                    {Number(tx.amount || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                  </p>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full inline-block mt-0.5 ${
                      tx.status === 'confirmed'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    {tx.status === 'confirmed' ? 'ยืนยันแล้ว' : 'รอตรวจสอบ'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-400 text-sm">
            ยังไม่มีรายการธุรกรรมในระบบ
          </div>
        )}
      </div>
    </div>
  );
}
