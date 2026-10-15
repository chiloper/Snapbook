'use client';

import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getApiBaseUrl } from '@/lib/api';
import {
  LayoutDashboard,
  Receipt,
  FileSpreadsheet,
  Building2,
  Tags,
  LogOut,
  ExternalLink,
  Search,
  Sparkles,
  Camera,
  ChevronRight,
  User,
} from 'lucide-react';
import NextLink from 'next/link';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  if (!user) return null;

  const navItems = [
    { href: '/', label: 'ภาพรวมการเงิน', icon: LayoutDashboard },
    { href: '/slips', label: 'สแกนสลิป AI', icon: Receipt },
    { href: '/transactions', label: 'รายการธุรกรรม', icon: FileSpreadsheet },
    { href: '/accounts', label: 'บัญชีของฉัน', icon: Building2 },
    { href: '/categories', label: 'หมวดหมู่', icon: Tags },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/transactions?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/transactions');
    }
  };

  return (
    <>
      {/* --- DESKTOP & TABLET TOP HEADER (Fastwork Style) --- */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* 1. Left: Brand Logo */}
            <div className="flex items-center space-x-6 flex-shrink-0">
              <NextLink
                href="/"
                className="flex items-center space-x-2.5 text-fastwork-500 font-extrabold text-2xl tracking-tight group"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-fastwork-600 to-fastwork-400 flex items-center justify-center text-white shadow-md shadow-fastwork-500/20 group-hover:scale-105 transition-transform">
                  <Camera className="w-5 h-5 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="leading-tight text-slate-900 font-bold text-xl group-hover:text-fastwork-500 transition-colors">
                    Snap<span className="text-fastwork-500">book</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal tracking-wide -mt-1 hidden sm:inline">
                    Smart AI Slip Tracker
                  </span>
                </div>
              </NextLink>
            </div>

            {/* 2. Middle: Fastwork-style Pill Search Bar with AI Sparkle */}
            <div className="hidden lg:flex flex-1 max-w-xl mx-4">
              <form
                onSubmit={handleSearchSubmit}
                className="w-full flex items-center bg-slate-100 hover:bg-slate-200/60 focus-within:bg-white focus-within:ring-2 focus-within:ring-fastwork-500/20 focus-within:border-fastwork-500 border border-transparent rounded-full px-4 py-2 transition-all shadow-sm"
              >
                <Search className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ค้นหารายการ, ร้านค้า, หรือยอดเงิน..."
                  className="bg-transparent border-none outline-none w-full text-sm text-slate-800 placeholder-slate-400"
                />
                <NextLink
                  href="/slips"
                  className="ml-2 flex items-center space-x-1 bg-gradient-to-r from-fastwork-500 to-indigo-600 text-white text-[11px] font-semibold px-2.5 py-1 rounded-full shadow-sm hover:opacity-90 transition-opacity flex-shrink-0"
                  title="สแกนสลิปด้วย AI"
                >
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  <span>AI Scan</span>
                </NextLink>
              </form>
            </div>

            {/* 3. Right: Quick Actions & Profile */}
            <div className="flex items-center space-x-3">
              {/* Primary Call-to-Action (Fastwork Blue Button) */}
              <NextLink
                href="/slips"
                className="hidden sm:inline-flex items-center space-x-1.5 bg-fastwork-500 hover:bg-fastwork-600 text-white text-sm font-semibold px-4 py-2 rounded-xl shadow-sm hover:shadow-fastwork transition-all active:scale-[0.98]"
              >
                <Camera className="w-4 h-4" />
                <span>สแกนสลิป</span>
              </NextLink>

              {/* Swagger API Button */}
              <a
                href={`${getApiBaseUrl()}/docs`}
                target="_blank"
                rel="noreferrer"
                className="hidden md:flex items-center space-x-1 text-xs font-medium text-slate-600 hover:text-fastwork-500 bg-slate-100 hover:bg-slate-200/80 px-3 py-2 rounded-xl transition"
                title="API Documentation (Swagger)"
              >
                <span>Docs</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>

              {/* User Profile Pill */}
              <div className="flex items-center space-x-3 border-l border-slate-200 pl-3">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs font-bold text-slate-800 truncate max-w-[120px]">
                    {user.display_name || user.email.split('@')[0]}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-medium flex items-center justify-end gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    พร้อมใช้งาน
                  </span>
                </div>

                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-fastwork-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                  {(user.display_name || user.email).charAt(0).toUpperCase()}
                </div>

                {/* Logout Button */}
                <button
                  onClick={() => logout()}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                  title="ออกจากระบบ"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* --- FASTWORK-STYLE CATEGORY / FEATURE SUB-BAR (Horizontal Desktop Bar) --- */}
        <div className="hidden md:block bg-white border-t border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex items-center space-x-1 py-1.5 overflow-x-auto no-scrollbar">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <NextLink
                    key={item.href}
                    href={item.href}
                    className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                      isActive
                        ? 'text-fastwork-600 bg-fastwork-50 font-semibold shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-fastwork-500' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </NextLink>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* --- FASTWORK MOBILE APP BOTTOM NAVIGATION BAR (Fixed at bottom) --- */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-slate-200/80 shadow-[0_-4px_25px_rgba(0,0,0,0.08)] pb-[calc(env(safe-area-inset-bottom)+0.5rem)]">
        <div className="grid grid-cols-5 items-center h-16 px-1">
          {/* 1. Dashboard */}
          <NextLink
            href="/"
            className={`flex flex-col items-center justify-center py-1 transition-colors ${
              pathname === '/' ? 'text-fastwork-500 font-bold' : 'text-slate-500'
            }`}
          >
            <LayoutDashboard className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">หน้าแรก</span>
          </NextLink>

          {/* 2. Transactions */}
          <NextLink
            href="/transactions"
            className={`flex flex-col items-center justify-center py-1 transition-colors ${
              pathname === '/transactions' ? 'text-fastwork-500 font-bold' : 'text-slate-500'
            }`}
          >
            <FileSpreadsheet className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">ธุรกรรม</span>
          </NextLink>

          {/* 3. Center Elevated Hero Button: SCAN SLIP */}
          <div className="flex flex-col items-center justify-center -mt-6">
            <NextLink
              href="/slips"
              className="w-14 h-14 rounded-full bg-gradient-to-tr from-fastwork-600 to-fastwork-400 text-white flex items-center justify-center shadow-lg shadow-fastwork-500/40 ring-4 ring-white active:scale-95 transition-all"
              title="สแกนสลิปใหม่"
            >
              <Camera className="w-6 h-6 text-white" />
            </NextLink>
            <span className="text-[10px] font-semibold text-fastwork-600 mt-0.5">
              สแกนสลิป
            </span>
          </div>

          {/* 4. Accounts */}
          <NextLink
            href="/accounts"
            className={`flex flex-col items-center justify-center py-1 transition-colors ${
              pathname === '/accounts' ? 'text-fastwork-500 font-bold' : 'text-slate-500'
            }`}
          >
            <Building2 className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">บัญชี</span>
          </NextLink>

          {/* 5. Categories */}
          <NextLink
            href="/categories"
            className={`flex flex-col items-center justify-center py-1 transition-colors ${
              pathname === '/categories' ? 'text-fastwork-500 font-bold' : 'text-slate-500'
            }`}
          >
            <Tags className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">หมวดหมู่</span>
          </NextLink>
        </div>
      </div>
    </>
  );
};
