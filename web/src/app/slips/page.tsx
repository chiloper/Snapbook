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
  Camera,
  Sparkles,
  Trash2,
  ShieldCheck,
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
    if (files.length + selectedFiles.length > 30) {
      alert('สามารถอัปโหลดได้สูงสุด 30 รูปต่อรอบครับ');
      return;
    }

    const newFiles = [...selectedFiles, ...files];
    setSelectedFiles(newFiles);
    const urls = newFiles.map((file) => URL.createObjectURL(file));
    setPreviews(urls);
    setResults(null);
  };

  const handleRemoveFile = (index: number) => {
    const updatedFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(updatedFiles);
    const updatedUrls = updatedFiles.map((file) => URL.createObjectURL(file));
    setPreviews(updatedUrls);
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

  const handleViewSlipImage = (idx?: number) => {
    if (typeof idx === 'number' && previews[idx]) {
      setPreviewImageUrl(previews[idx]);
      return;
    }
    alert('ระบบไม่ได้จัดเก็บไฟล์รูปภาพไว้บนเซิร์ฟเวอร์ เพื่อความปลอดภัยของข้อมูลและลดภาระระบบ (บันทึกเฉพาะข้อมูลธุรกรรม)');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>สแกนสลิปธนาคาร</span>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-500" />
              Template OCR
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            รองรับสลิปธนาคารไทยทุกแห่ง (กสิกร, ไทยพาณิชย์, กรุงไทย, กรุงเทพ, ทีทีบี, ออมสิน, พร้อมเพย์) สูงสุด 30 รูปพร้อมกัน
          </p>
        </div>
      </div>

      {/* Security & In-Memory Extraction Card */}
      <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-2xl px-4 py-3 flex items-center space-x-3 text-xs text-emerald-900 shadow-2xs">
        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
        <span>
          <strong>ประมวลผลในหน่วยความจำโดยตรง:</strong> ระบบดึงข้อมูลจากสลิปและบันทึกเฉพาะข้อมูลธุรกรรม (Raw Extraction) โดย<strong>ไม่เก็บไฟล์ภาพสลิปบนคลาวด์</strong> ลดภาระระบบ รวดเร็ว และปลอดภัยสูงสุด
        </span>
      </div>

      {/* FASTWORK-STYLE UPLOAD ZONE */}
      <div className="bg-white border-2 border-dashed border-fastwork-200 hover:border-fastwork-400 rounded-3xl p-6 sm:p-10 text-center transition-all shadow-fastwork-sm group">
        <input
          type="file"
          id="slip-upload"
          multiple
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          className="hidden"
          disabled={uploading}
        />

        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg-fastwork-50 text-fastwork-500 rounded-3xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-fastwork-100 transition-all shadow-sm">
            <UploadCloud className="w-8 h-8" />
          </div>

          <h3 className="text-base sm:text-lg font-bold text-slate-800">
            ลากสลิปมาวาง หรือคลิกเพื่อเลือกไฟล์
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">
            รองรับ JPG, PNG, WEBP (สูงสุด 30 รูปต่อรอบ • ไม่เก็บไฟล์รูป ประมวลผลเร็ว)
          </p>

          {/* Action buttons (Camera on Mobile / File Picker) */}
          <div className="flex items-center gap-3 mt-5">
            <label
              htmlFor="slip-upload"
              className="cursor-pointer inline-flex items-center justify-center space-x-2 bg-fastwork-500 hover:bg-fastwork-600 text-white font-bold text-sm px-5 py-2.5 rounded-xl shadow-sm hover:shadow-fastwork transition-all active:scale-95"
            >
              <FileImage className="w-4 h-4" />
              <span>เลือกจากคลังภาพ</span>
            </label>

            {/* Mobile Camera Option */}
            <label
              htmlFor="slip-camera"
              className="sm:hidden cursor-pointer inline-flex items-center justify-center space-x-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm px-4 py-2.5 rounded-xl transition-all active:scale-95"
            >
              <Camera className="w-4 h-4" />
              <span>ถ่ายรูป</span>
            </label>
            <input
              type="file"
              id="slip-camera"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
              disabled={uploading}
            />
          </div>
        </div>

        {/* Selected files preview strip */}
        {selectedFiles.length > 0 && (
          <div className="mt-8 pt-6 border-t border-slate-100 text-left">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-bold text-slate-800">
                สลิปที่เลือก ({selectedFiles.length}/30)
              </span>
              <button
                onClick={() => {
                  setSelectedFiles([]);
                  setPreviews([]);
                  setResults(null);
                }}
                className="text-xs text-rose-500 hover:text-rose-700 font-medium px-2 py-1 rounded-lg hover:bg-rose-50 transition"
              >
                ล้างทั้งหมด
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {previews.map((url, idx) => (
                <div
                  key={idx}
                  className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 group/item shadow-sm"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt="preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 opacity-90 group-hover/item:opacity-100 transition-opacity">
                    <span className="absolute top-1.5 left-1.5 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded-md font-semibold">
                      #{idx + 1}
                    </span>
                    <button
                      onClick={() => handleRemoveFile(idx)}
                      className="absolute top-1.5 right-1.5 p-1 bg-rose-600/90 hover:bg-rose-600 text-white rounded-lg shadow-sm transition"
                      title="ลบสลิปนี้"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <span className="absolute bottom-1.5 left-1.5 right-1.5 text-white text-[10px] truncate px-1">
                      {selectedFiles[idx]?.name}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="w-full sm:w-auto px-8 py-3 bg-fastwork-500 hover:bg-fastwork-600 text-white font-extrabold text-sm sm:text-base rounded-2xl shadow-md hover:shadow-fastwork transition-all disabled:opacity-50 flex items-center justify-center space-x-2 active:scale-95"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    <span>กำลังสแกนและประมวลผลสลิป...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>เริ่มสแกนและบันทึกสลิป ({selectedFiles.length} สลิป)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* RESULTS LIST SECTION */}
      {results && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-7 shadow-fastwork-sm space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg">
                ผลการประมวลผลสลิป ({results.length} รายการ)
              </h3>
              <p className="text-xs text-slate-400">ตรวจสอบความถูกต้องและดูรูปสลิปต้นฉบับ</p>
            </div>
            <NextLink
              href="/transactions"
              className="text-xs font-bold text-fastwork-600 hover:text-fastwork-700 bg-fastwork-50 px-3 py-1.5 rounded-xl flex items-center transition"
            >
              <span>ไปที่หน้ารายการธุรกรรม</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
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
                  className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-all ${
                    isCreated
                      ? 'bg-emerald-50/40 border-emerald-200'
                      : isDuplicate
                      ? 'bg-amber-50/40 border-amber-200'
                      : 'bg-rose-50/40 border-rose-200'
                  }`}
                >
                  <div className="flex items-start space-x-3 min-w-0">
                    <div className="mt-0.5 flex-shrink-0">
                      {isCreated && (
                        <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                      )}
                      {isDuplicate && (
                        <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                          <Copy className="w-5 h-5" />
                        </div>
                      )}
                      {isFailed && (
                        <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                          <XCircle className="w-5 h-5" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm truncate max-w-[200px] sm:max-w-none">
                          {item.file_name}
                        </span>
                        <span
                          className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
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
                            ? 'สลิปซ้ำในระบบ'
                            : 'ประมวลผลไม่สำเร็จ'}
                        </span>
                        {item.needs_type_review && (
                          <span className="text-[11px] bg-fastwork-100 text-fastwork-800 px-2 py-0.5 rounded-full font-semibold flex items-center">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            ควรตรวจสอบประเภท
                          </span>
                        )}
                      </div>

                      {isCreated && item.transaction && (
                        <p className="text-xs text-slate-600 mt-1 font-medium">
                          {item.transaction.bank_name || 'ธนาคาร'} | ยอดเงิน: <span className="font-bold text-slate-900">฿{Number(item.transaction.amount).toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span> | คู่โอน: {item.transaction.counterparty_name || '-'}
                        </p>
                      )}

                      {!isCreated && item.message && (
                        <p className="text-xs text-slate-500 mt-0.5">
                          {item.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {previews[idx] && (
                    <button
                      onClick={() => handleViewSlipImage(idx)}
                      className="text-xs font-semibold text-slate-700 hover:text-fastwork-600 bg-white border border-slate-200 px-3.5 py-2 rounded-xl shadow-2xs hover:bg-slate-50 flex items-center space-x-1.5 self-end sm:self-center transition"
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
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <FileImage className="w-4 h-4 text-fastwork-500" />
                <span>รูปภาพสลิปต้นฉบับ</span>
              </h4>
              <button
                onClick={() => setPreviewImageUrl(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 flex items-center justify-center max-h-[75vh] overflow-y-auto bg-slate-900/5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewImageUrl}
                alt="Slip Preview"
                className="max-w-full max-h-[70vh] rounded-2xl shadow-md object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
