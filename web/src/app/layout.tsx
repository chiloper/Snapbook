import React from 'react';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { Navbar } from '@/components/Navbar';

export const metadata = {
  title: 'Snapbook — บันทึกรายรับ-รายจ่ายจากสลิปธนาคารอัตโนมัติ',
  description: 'Smart Thai bank slip income/expense tracker with automatic template-based OCR',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col bg-[#F7F9FB] text-slate-800 font-sans antialiased selection:bg-fastwork-100 selection:text-fastwork-700">
        <AuthProvider>
          <Navbar />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 pb-24 md:pb-10">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
