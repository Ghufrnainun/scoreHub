'use client';

import React from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ShieldCheck, X, Check, Loader } from 'lucide-react';
import { type Region } from './CustomSelect';

export interface RegistrationSummaryModalProps {
  isOpen: boolean;
  saving: boolean;
  form: {
    fullName: string;
    club: string;
    gender: string;
    addressDetail: string;
    postalCode: string;
  };
  calculatedAge: number | null;
  selectedProvince?: Region;
  selectedRegency?: Region;
  onClose: () => void;
  onSubmit: () => void;
}

export default function RegistrationSummaryModal({
  isOpen,
  saving,
  form,

  calculatedAge,
  selectedProvince,
  selectedRegency,
  onClose,
  onSubmit,
}: RegistrationSummaryModalProps) {
  const shouldReduceMotion = useReducedMotion();

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const modalVariants = {
    hidden: shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 8 },
    visible: shouldReduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={() => !saving && onClose()}
            className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            aria-hidden="true"
          />

          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="relative w-full max-w-lg rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-2xl space-y-6 text-card-foreground"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <div className="flex items-center justify-between border-b border-border/80 pb-4">
              <div className="flex items-center gap-2.5">
                <ShieldCheck size={22} className="text-amber-600 dark:text-amber-500" aria-hidden="true" />
                <h3 id="modal-title" className="font-display text-lg font-bold tracking-tight text-foreground">
                  Konfirmasi Pendaftaran
                </h3>
              </div>
              {!saving && (
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Tutup dialog konfirmasi"
                  className="rounded-xl bg-secondary p-2 text-muted-foreground hover:bg-secondary/80 hover:text-foreground transition-colors"
                >
                  <X size={16} aria-hidden="true" />
                </button>
              )}
            </div>

            <div className="space-y-4 text-xs font-medium">
              <div className="rounded-xl border border-border/80 bg-secondary/30 p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground font-semibold text-[11px]">Nama Atlet</span>
                  <span className="font-bold text-foreground text-sm">{form.fullName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground font-semibold text-[11px]">Jenis Kelamin</span>
                  <span className="font-bold text-foreground capitalize">{form.gender}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground font-semibold text-[11px]">Asal Klub / PB</span>
                  <span className="font-bold text-foreground">{form.club}</span>
                </div>
                <div className="flex justify-between border-t border-border/60 pt-3 gap-4">
                  <span className="text-muted-foreground font-semibold text-[11px] shrink-0">Alamat Rumah</span>
                  <span className="font-semibold text-foreground text-right max-w-[260px] leading-relaxed">
                    {form.addressDetail}, {selectedRegency?.name}, {selectedProvince?.name}{' '}
                    {form.postalCode && `(${form.postalCode})`}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Kelengkapan Berkas:
                </p>
                <div className="flex items-center gap-3 text-xs font-bold text-foreground">
                  <span className="flex items-center gap-1.5 bg-emerald-500/5 px-3 py-1.5 rounded-xl border border-emerald-500/30 text-foreground">
                    <Check size={14} className="text-emerald-600 dark:text-emerald-400 font-bold" aria-hidden="true" /> Foto Profil Ada
                  </span>
                  <span className="flex items-center gap-1.5 bg-emerald-500/5 px-3 py-1.5 rounded-xl border border-emerald-500/30 text-foreground">
                    <Check size={14} className="text-emerald-600 dark:text-emerald-400 font-bold" aria-hidden="true" /> Bukti Usia Ada
                  </span>
                </div>
              </div>
            </div>

            {/* BUTTONS WITH DIPONEGORO SLATE/NAVY AUTHORITY */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={saving}
                onClick={onClose}
                className="min-h-[44px] rounded-xl border border-border bg-secondary px-5 py-2.5 text-xs font-bold text-secondary-foreground hover:bg-secondary/80 hover:text-foreground active:scale-95 transition-all disabled:opacity-40"
              >
                Periksa Kembali
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={onSubmit}
                className="flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-slate-900 bg-slate-900 dark:border-slate-100 dark:bg-slate-100 px-6 py-2.5 text-xs font-bold text-white dark:text-slate-900 hover:opacity-90 active:scale-95 transition-all disabled:opacity-40 shadow-sm"
              >
                {saving ? (
                  <span className="flex items-center gap-2">
                    <Loader size={16} className="animate-spin" aria-hidden="true" /> Mengirim…
                  </span>
                ) : (
                  <span>Konfirmasi & Kirim</span>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
