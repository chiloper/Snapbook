'use client';

import React, { useState } from 'react';
import { slipsApi } from '@/lib/api';
import NextLink from 'next/link';
import {
  UploadCloud,
  CheckCircle2,
  XCircle,
  Copy,
  AlertCircle,
  Eye,
  X,
  FileImage,
  ArrowRight,
} from 'lucide-react';

export default function SlipsPage() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState<any[] | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    if (files.length > 10) {
      alert('สามารถเลือกได้สูงสุดไม่เกิน 10 รูปต่อครั้งครับ');
      return;
    }

    setSelectedFiles(files);
    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviews(urls);
    setResults(null);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    setUploading(true);
    try {
      const data = await slipsApi.uploadSlips(selectedFiles);
      setResults(data);
    } catch (err: any) {
      alert(err.response?.data?.message || 'เกิดข้อผิดพลาดในการอัปโหลดสลิป');
    } finally {
      setUploading(false);
    }
  };

  const handleViewSlipImage = async (slipId: string) => {
    setModalLoading(true);
    try {
      const res = await slipsApi.getImageUrl(slipId);
      setPreviewImageUrl(res.signed_url);
    } catch (err: any) {
      alert(err.response?.data?.message || 'ไม่สามารถเปิดดูรูปภาพได้');
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          สแกนสลิปธนาคารด้วย AI 📸
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          รองรับสลิปธนาคารไทย (KBank, SCB, Krungthai, Bangkok Bank, TTB, GSB, พร้อมเพย์ ฯลฯ) สูงสุด 10 รูปพร้อมกัน
        </p>
      </div>

      {/* Upload Box */}
      <div className="bg-white border-2 border-dashed border-slate-300 rounded-3xl p-8 text-center hover:border-indigo-500 transition shadow-sm">
        <input
          type="file"
          id="slip-upload"
          multiple
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          className="hidden"
          disabled={uploading}
        />
        <label
          htmlFor="slip-upload"
          className="cursor-pointer flex flex-col items-center"
        >
          <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl mb-4">
            <UploadCloud className="w-8 h-8" />
          </div>
          <h3 className="text-base font-semibold text-slate-800">
            คลิกเพื่อเลือกรูปภาพสลิป หรือลากไฟล์มาวาง
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            รองรับ JPG, PNG, WEBP (สูงสุด 10 รูป, ไม่เกิน 5MB ต่อรูป)
          </p>
        </label>

        {/* Selected files preview strip */}
        {selectedFiles.length > 0 && (
          <div className="mt-6 pt-6 border-t border-slate-100">
            <div className="flex items-center justify-between mb-3 text-sm">
              <span className="font-semibold text-slate-700">
                เลือกแล้ว {selectedFiles.length} รูป
              </span>
              <button
                onClick={() => {
                  setSelectedFiles([]);
                  setPreviews([]);
                  setResults(null);
                }}
                className="text-xs text-rose-500 hover:text-rose-700 font-medium"
              >
                ล้างทั้งหมด
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {previews.map((url, idx) => (
                <div
                  key={idx}
                  className="relative aspect-[3/4] rounded-xl overflow-hidden border border-slate-200 bg-slate-100"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt="preview"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">
                    #{idx + 1}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={handleUpload}
              disabled={uploading}
              className="mt-6 w-full sm:w-auto px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-sm transition disabled:opacity-50 flex items-center justify-center space-x-2 mx-auto"
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  <span>AI กำลังประมวลผลสลิป...</span>
                </>
              ) : (
                <span>เริ่มอ่านข้อมูลด้วย Gemini AI</span>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Results List */}
      {results && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-800 text-lg">
              ผลการประมวลผล ({results.length} ไฟล์)
            </h3>
            <NextLink
              href="/transactions"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center"
            >
              <span>ไปที่หน้ารายการธุรกรรม</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </NextLink>
          </div>

          <div className="space-y-3">
            {results.map((item, idx) => {
              const isCreated = item.result === 'created';
              const isDuplicate = item.result === 'duplicate';
              const isFailed = item.result === 'failed';

              return (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                    isCreated
                      ? 'bg-emerald-50/50 border-emerald-200'
                      : isDuplicate
                      ? 'bg-amber-50/50 border-amber-200'
                      : 'bg-rose-50/50 border-rose-200'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    {isCreated && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    )}
                    {isDuplicate && (
                      <Copy className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    )}
                    {isFailed && (
                      <XCircle className="w-5 h-5 text-rose-600 mt-0.5 flex-shrink-0" />
                    )}

                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-slate-800 text-sm">
                          {item.file_name}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            isCreated
                              ? 'bg-emerald-100 text-emerald-800'
                              : isDuplicate
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {isCreated
                            ? 'บันทึกสำเร็จ'
                            : isDuplicate
                            ? 'สลิปซ้ำ'
                            : 'ไม่ผ่าน'}
                        </span>
                        {item.needs_type_review && (
                          <span className="text-[11px] bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full font-medium flex items-center">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            ควรตรวจเช็ครายรับ/รายจ่าย
                          </span>
                        )}
                      </div>

                      {isCreated && item.transaction && (
                        <p className="text-xs text-slate-600 mt-1">
                          {item.transaction.bank_name || 'ธนาคาร'} | ยอดเงิน: ฿
                          {Number(item.transaction.amount).toLocaleString('th-TH', {
                            minimumFractionDigits: 2,
                          })}{' '}
                          | คู่โอน: {item.transaction.counterparty_name || '-'}
                        </p>
                      )}

                      {!isCreated && item.message && (
                        <p className="text-xs text-slate-500 mt-0.5">
                          {item.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {item.slip_id && (
                    <button
                      onClick={() => handleViewSlipImage(item.slip_id)}
                      className="text-xs font-medium text-slate-600 hover:text-indigo-600 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-2xs hover:bg-slate-50 flex items-center space-x-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>ดูรูปสลิป</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Slip Image Preview Modal */}
      {previewImageUrl && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl relative">
            <div className="p-4 border-b flex justify-between items-center">
              <h4 className="font-semibold text-slate-800 text-sm">
                รูปสลิปต้นฉบับ
              </h4>
              <button
                onClick={() => setPreviewImageUrl(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 flex items-center justify-center max-h-[75vh] overflow-y-auto">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewImageUrl}
                alt="Slip Preview"
                className="max-w-full max-h-[70vh] rounded-lg shadow-sm object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
