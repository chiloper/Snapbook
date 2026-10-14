import React from 'react';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { Navbar } from '@/components/Navbar';

export const metadata = {
  title: 'Snapbook — บันทึกรายรับ-รายจ่ายจากสลิปธนาคารด้วย AI',
  description: 'Smart Thai bank slip income/expense tracker powered by Google Gemini AI',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
        <AuthProvider>
          <Navbar />
          <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
