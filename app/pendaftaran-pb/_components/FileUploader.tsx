'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Upload, CheckCircle, FileText, Trash2, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface FileUploaderProps {
  label: string;
  accept: string;
  file: File | null;
  kind: 'photo' | 'identity';
  onFileSelect: (file: File | null) => void;
  hint?: string;
}

export default function FileUploader({
  label,
  accept,
  file,
  kind,
  onFileSelect,
  hint,
}: FileUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  useEffect(() => {
    if (file && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setPreviewUrl(null);
    }
  }, [file]);

  const validateAndSelect = (selectedFile: File) => {
    setError(null);
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('Ukuran file melebihi batas maksimal 5 MB.');
      return;
    }
    onFileSelect(selectedFile);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSelect(e.dataTransfer.files[0]);
    }
  };

  const isImage = file?.type.startsWith('image/');
  const isPdf = file?.type === 'application/pdf';

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1">
          <span>{label}</span>
          <span className="text-destructive font-bold">*</span>
        </label>
        {file && (
          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <CheckCircle size={12} aria-hidden="true" /> Siap diunggah
          </span>
        )}
      </div>

      {!file ? (
        <div
          role="button"
          tabIndex={0}
          aria-label={`Pilih atau tarik file ${label}`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              inputRef.current?.click();
            }
          }}
          className={`group relative flex min-h-[140px] w-full cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed p-6 text-center transition-all duration-200 outline-none focus:ring-4 focus:ring-emerald-500/15 ${
            dragOver
              ? 'border-emerald-600 bg-emerald-50/20 scale-[1.01]'
              : 'border-slate-300 bg-slate-50/60 hover:border-emerald-600 hover:bg-emerald-50/10 dark:border-slate-700 dark:bg-slate-900/40 dark:hover:border-slate-500'
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                validateAndSelect(e.target.files[0]);
              }
            }}
            className="hidden"
          />

          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition-all duration-200 group-hover:border-emerald-600 group-hover:text-emerald-600 group-hover:scale-105 shadow-2xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
            <Upload size={20} aria-hidden="true" />
          </div>

          <p className="text-xs font-semibold text-slate-900 dark:text-white">
            Klik untuk memilih atau tarik file ke area ini
          </p>
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 font-normal">
            {hint || 'Format JPG / PNG / WEBP / PDF (Maks. 2 MB)'}
          </p>
        </div>
      ) : (
        <div className="relative flex items-center justify-between gap-4 rounded-2xl border border-emerald-500/80 bg-emerald-50/20 p-4 transition-all shadow-2xs dark:border-emerald-500/60 dark:bg-emerald-950/20">
          <div className="flex items-center gap-3.5 min-w-0">
            {isImage && previewUrl ? (
              <button
                type="button"
                onClick={() => setShowPreviewModal(true)}
                className="group/thumb relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-emerald-500/40 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                aria-label="Lihat perbesaran foto"
              >
                <img
                  src={previewUrl}
                  alt="Pratinjau foto yang diunggah"
                  className="h-full w-full object-cover transition-transform duration-200 group-hover/thumb:scale-110"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover/thumb:opacity-100">
                  <Eye size={16} className="text-white" aria-hidden="true" />
                </div>
              </button>
            ) : (
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-emerald-600 bg-emerald-600 text-white shadow-2xs">
                <FileText size={22} aria-hidden="true" />
              </div>
            )}

            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-slate-900 dark:text-white leading-tight">
                {file.name}
              </p>
              <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-300 font-mono font-medium">
                <span>{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
                <span>•</span>
                <span className="uppercase font-sans font-bold text-emerald-600 dark:text-emerald-400">Siap</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {isImage && (
              <button
                type="button"
                onClick={() => setShowPreviewModal(true)}
                aria-label="Pratinjau foto"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 transition-colors dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              >
                <Eye size={16} aria-hidden="true" />
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                onFileSelect(null);
                if (inputRef.current) inputRef.current.value = '';
              }}
              aria-label={`Hapus file ${label}`}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-destructive/20 bg-destructive/10 text-destructive hover:bg-destructive hover:text-white transition-all font-bold"
            >
              <Trash2 size={16} aria-hidden="true" />
            </button>
          </div>
        </div>
      )}

      {error && (
        <p className="text-[11px] font-bold text-destructive animate-in fade-in duration-150" role="alert">
          {error}
        </p>
      )}

      {/* PREVIEW MODAL */}
      <AnimatePresence>
        {showPreviewModal && previewUrl && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPreviewModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-xs"
              aria-hidden="true"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="relative max-h-[85vh] max-w-2xl overflow-hidden rounded-2xl border border-slate-700 bg-card p-2 shadow-2xl"
              role="dialog"
              aria-label="Pratinjau Foto"
            >
              <img
                src={previewUrl}
                alt="Pratinjau dokumen"
                className="max-h-[75vh] w-auto rounded-xl object-contain"
              />
              <div className="mt-3 flex items-center justify-between px-2 pb-1 text-xs font-semibold text-foreground">
                <span className="truncate max-w-[300px] font-bold">{file?.name}</span>
                <button
                  type="button"
                  onClick={() => setShowPreviewModal(false)}
                  className="rounded-lg bg-secondary px-3 py-1.5 text-xs font-bold text-foreground hover:bg-secondary/80"
                >
                  Tutup Pratinjau
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
