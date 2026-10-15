'use client';

import React, { createContext, useContext, useState, useCallback, useId } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  X,
  Trash2,
  HelpCircle,
} from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
}

export interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

export interface AlertModalOptions {
  title?: string;
  message: string;
  type?: ToastType;
  buttonText?: string;
}

interface AlertContextType {
  toast: {
    success: (message: string, title?: string) => void;
    error: (message: string, title?: string) => void;
    warning: (message: string, title?: string) => void;
    info: (message: string, title?: string) => void;
  };
  confirm: (options: ConfirmOptions | string) => Promise<boolean>;
  alert: (message: string, title?: string, type?: ToastType) => Promise<void>;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function AlertProvider({ children }: { children: React.ReactNode }) {
  // 1. Toast notifications state
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // 2. Confirm modal state
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText: string;
    cancelText: string;
    type: 'danger' | 'warning' | 'info';
    resolve?: (value: boolean) => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'ยืนยัน',
    cancelText: 'ยกเลิก',
    type: 'danger',
  });

  // 3. Alert modal state
  const [alertModalState, setAlertModalState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: ToastType;
    buttonText: string;
    resolve?: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    buttonText: 'ตกลง',
  });

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (type: ToastType, message: string, title?: string) => {
      const id = `${Date.now()}-${Math.random()}`;
      setToasts((prev) => [...prev, { id, type, title, message }]);

      // Auto dismiss after 4 seconds
      setTimeout(() => {
        removeToast(id);
      }, 4000);
    },
    [removeToast],
  );

  const toast = {
    success: (message: string, title?: string) => addToast('success', message, title),
    error: (message: string, title?: string) => addToast('error', message, title),
    warning: (message: string, title?: string) => addToast('warning', message, title),
    info: (message: string, title?: string) => addToast('info', message, title),
  };

  const confirm = useCallback((options: ConfirmOptions | string): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof options === 'string') {
        setConfirmState({
          isOpen: true,
          title: 'ยืนยันการทำรายการ',
          message: options,
          confirmText: 'ยืนยัน',
          cancelText: 'ยกเลิก',
          type: 'danger',
          resolve,
        });
      } else {
        setConfirmState({
          isOpen: true,
          title: options.title || 'ยืนยันการทำรายการ',
          message: options.message,
          confirmText: options.confirmText || 'ยืนยัน',
          cancelText: options.cancelText || 'ยกเลิก',
          type: options.type || 'danger',
          resolve,
        });
      }
    });
  }, []);

  const handleConfirmClose = (result: boolean) => {
    if (confirmState.resolve) {
      confirmState.resolve(result);
    }
    setConfirmState((prev) => ({ ...prev, isOpen: false, resolve: undefined }));
  };

  const alert = useCallback(
    (message: string, title?: string, type: ToastType = 'info'): Promise<void> => {
      return new Promise((resolve) => {
        setAlertModalState({
          isOpen: true,
          title: title || (type === 'error' ? 'เกิดข้อผิดพลาด' : type === 'warning' ? 'แจ้งเตือน' : 'ข้อมูล'),
          message,
          type,
          buttonText: 'ตกลง',
          resolve,
        });
      });
    },
    [],
  );

  const handleAlertModalClose = () => {
    if (alertModalState.resolve) {
      alertModalState.resolve();
    }
    setAlertModalState((prev) => ({ ...prev, isOpen: false, resolve: undefined }));
  };

  return (
    <AlertContext.Provider value={{ toast, confirm, alert }}>
      {children}

      {/* Floating Toast Container */}
      <div className="fixed top-4 right-4 z-50 flex flex-col space-y-2 pointer-events-none max-w-sm w-full px-3 sm:px-0">
        {toasts.map((t) => {
          const isSuccess = t.type === 'success';
          const isError = t.type === 'error';
          const isWarning = t.type === 'warning';

          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-start space-x-3 p-4 rounded-2xl border shadow-lg backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-top-4 ${
                isSuccess
                  ? 'bg-white/95 border-emerald-200 text-emerald-950 shadow-emerald-500/10'
                  : isError
                  ? 'bg-white/95 border-rose-200 text-rose-950 shadow-rose-500/10'
                  : isWarning
                  ? 'bg-white/95 border-amber-200 text-amber-950 shadow-amber-500/10'
                  : 'bg-white/95 border-fastwork-200 text-slate-900 shadow-fastwork-500/10'
              }`}
            >
              <div className="flex-shrink-0 mt-0.5">
                {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                {isError && <AlertCircle className="w-5 h-5 text-rose-500" />}
                {isWarning && <AlertTriangle className="w-5 h-5 text-amber-500" />}
                {!isSuccess && !isError && !isWarning && (
                  <Info className="w-5 h-5 text-fastwork-500" />
                )}
              </div>
              <div className="flex-1 min-w-0 pr-1">
                {t.title && <h5 className="text-xs font-bold leading-tight mb-0.5">{t.title}</h5>}
                <p className="text-xs text-slate-700 leading-relaxed break-words">{t.message}</p>
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="flex-shrink-0 p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Confirm Dialog Modal */}
      {confirmState.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200 space-y-4">
            <div className="flex items-start space-x-3.5">
              <div
                className={`p-3 rounded-2xl flex-shrink-0 ${
                  confirmState.type === 'danger'
                    ? 'bg-rose-100 text-rose-600'
                    : confirmState.type === 'warning'
                    ? 'bg-amber-100 text-amber-600'
                    : 'bg-fastwork-100 text-fastwork-600'
                }`}
              >
                {confirmState.type === 'danger' ? (
                  <Trash2 className="w-6 h-6" />
                ) : confirmState.type === 'warning' ? (
                  <AlertTriangle className="w-6 h-6" />
                ) : (
                  <HelpCircle className="w-6 h-6" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-base font-bold text-slate-900">{confirmState.title}</h4>
                <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                  {confirmState.message}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => handleConfirmClose(false)}
                className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition active:scale-95"
              >
                {confirmState.cancelText}
              </button>
              <button
                onClick={() => handleConfirmClose(true)}
                className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white shadow-sm transition active:scale-95 ${
                  confirmState.type === 'danger'
                    ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
                    : 'bg-fastwork-500 hover:bg-fastwork-600 shadow-fastwork-500/20'
                }`}
              >
                {confirmState.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Alert Dialog Modal */}
      {alertModalState.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200 space-y-4 text-center">
            <div
              className={`w-12 h-12 rounded-2xl mx-auto flex items-center justify-center ${
                alertModalState.type === 'success'
                  ? 'bg-emerald-100 text-emerald-600'
                  : alertModalState.type === 'error'
                  ? 'bg-rose-100 text-rose-600'
                  : alertModalState.type === 'warning'
                  ? 'bg-amber-100 text-amber-600'
                  : 'bg-fastwork-100 text-fastwork-600'
              }`}
            >
              {alertModalState.type === 'success' && <CheckCircle2 className="w-6 h-6" />}
              {alertModalState.type === 'error' && <AlertCircle className="w-6 h-6" />}
              {alertModalState.type === 'warning' && <AlertTriangle className="w-6 h-6" />}
              {alertModalState.type === 'info' && <Info className="w-6 h-6" />}
            </div>

            <div>
              <h4 className="text-base font-bold text-slate-900">{alertModalState.title}</h4>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                {alertModalState.message}
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={handleAlertModalClose}
                className="w-full py-2.5 px-4 bg-fastwork-500 hover:bg-fastwork-600 text-white font-bold text-xs sm:text-sm rounded-xl shadow-sm transition active:scale-95"
              >
                {alertModalState.buttonText}
              </button>
            </div>
          </div>
        </div>
      )}
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
}
