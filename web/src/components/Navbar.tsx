'use client';

import React from 'react';
import Link from 'next/navigation';
import { usePathname } from 'next/navigation';
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
} from 'lucide-react';
import NextLink from 'next/link';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  const navItems = [
    { href: '/', label: 'แดชบอร์ด', icon: LayoutDashboard },
    { href: '/slips', label: 'สแกนสลิป', icon: Receipt },
    { href: '/transactions', label: 'รายการธุรกรรม', icon: FileSpreadsheet },
    { href: '/accounts', label: 'บัญชีของฉัน', icon: Building2 },
    { href: '/categories', label: 'หมวดหมู่', icon: Tags },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-8">
            <NextLink href="/" className="flex items-center space-x-2 text-indigo-600 font-bold text-xl tracking-tight">
              <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">📸</span>
              <span>Snapbook</span>
            </NextLink>

            {/* Nav Links */}
            <nav className="hidden md:flex space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <NextLink
                    key={item.href}
                    href={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </NextLink>
                );
              })}
            </nav>
          </div>

          {/* User profile & actions */}
          <div className="flex items-center space-x-4">
            <a
              href={`${getApiBaseUrl()}/docs`}
              target="_blank"
              rel="noreferrer"
              className="hidden sm:flex items-center space-x-1 text-xs text-slate-500 hover:text-indigo-600 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-md transition"
              title="Open Swagger REST API Docs"
            >
              <span>Swagger Docs</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            <div className="flex items-center space-x-3 border-l border-slate-200 pl-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-800 leading-tight">
                  {user.display_name || user.email.split('@')[0]}
                </p>
                <p className="text-xs text-slate-500">{user.email}</p>
              </div>

              <button
                onClick={() => logout()}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                title="ออกจากระบบ"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile nav bottom bar */}
      <div className="md:hidden flex justify-around border-t border-slate-200 py-2 bg-white">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <NextLink
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center py-1 px-3 text-xs font-medium rounded-lg ${
                isActive ? 'text-indigo-600' : 'text-slate-500'
              }`}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span>{item.label}</span>
            </NextLink>
          );
        })}
      </div>
    </header>
  );
};
