'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle,
  ShieldCheck,
  User,
  Location,
  FileText,
  HelpCircle,
} from 'reicon-react';
import { type AgeCategory, documentRule } from '@/lib/pb-registration-validation';

export interface RegistrationSidebarProps {
  form: {
    fullName: string;
    club: string;
    whatsapp: string;
    addressDetail: string;
    gender: string;
    email?: string;
  };
  dob: string;
  provinceCode: string;
  regencyCode: string;
  districtCode: string;
  villageCode: string;
  profile: File | null;
  identity: File | null;
  category: AgeCategory | null;
  categoryLabel: string;
  calculatedAge: number | null;
}

export default function RegistrationSidebar({
  form,
  dob,
  provinceCode,
  regencyCode,
  districtCode,
  villageCode,
  profile,
  identity,
  category,
  categoryLabel,
  calculatedAge,
}: RegistrationSidebarProps) {
  const isStep1Done = Boolean(
    form.fullName.trim().length >= 3 && form.club.trim().length >= 2 && dob && category
  );

  const isStep2Done = Boolean(
    provinceCode &&
      regencyCode &&
      districtCode &&
      villageCode &&
      form.addressDetail.trim().length >= 5 &&
      form.whatsapp.trim().length >= 9
  );

  const isStep3Done = Boolean(profile && identity);

  const steps = [
    {
      id: 1,
      title: 'Data Diri Atlet',
      desc: 'Nama, Tanggal Lahir, Klub & Gender',
      isDone: isStep1Done,
      icon: User,
    },
    {
      id: 2,
      title: 'Domisili & Kontak',
      desc: 'Alamat lengkap & No. WhatsApp aktif',
      isDone: isStep2Done,
      icon: Location,
    },
    {
      id: 3,
      title: 'Berkas & Identitas',
      desc: 'Pas Foto & Bukti Usia (KK/Akta/KTP)',
      isDone: isStep3Done,
      icon: FileText,
    },
  ];

  return (
    <div className="space-y-6 lg:sticky lg:top-8">
      {/* DOUBLE-BEZEL CLEAN CARD */}
      <div className="rounded-[2rem] border border-border/80 bg-secondary/30 p-1.5 shadow-2xs transition-all duration-300 hover:border-border">
        <div className="rounded-[calc(2rem-0.375rem)] border border-border bg-card p-6 sm:p-7 space-y-6 text-card-foreground shadow-2xs">
          
          {/* HEADER WITH OFFICIAL LOGO */}
          <div className="flex items-center gap-3 border-b border-border/60 pb-5">
            <img src="/logo-pb.png" alt="PB Undip" className="h-9 w-auto object-contain shrink-0" />
            <div>
              <h3 className="font-display text-sm font-bold tracking-tight text-foreground leading-none">
                PB Undip
              </h3>
              <span className="text-[11px] text-muted-foreground font-medium mt-0.5 block">
                Pendaftaran Atlet
              </span>
            </div>
          </div>

          {/* DESCRIPTION */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Progres Pengisian
            </h4>
            <p className="text-xs leading-relaxed text-muted-foreground text-pretty">
              Lengkapi 3 tahapan secara berurutan untuk mendaftar sebagai atlet di PB Undip.
            </p>
          </div>

          {/* STEP TRACKER LIST WITH COURT EMERALD GREEN SUCCESS WAYFINDING */}
          <div className="space-y-2.5 pt-1" role="list" aria-label="Progres pendaftaran">
            <div className="flex items-center justify-between pb-1">
              <span className="text-[11px] font-medium text-muted-foreground">
                Status Kelengkapan
              </span>
              <span className="font-mono text-[11px] font-bold text-foreground tabular-nums">
                {[isStep1Done, isStep2Done, isStep3Done].filter(Boolean).length} / 3 Selesai
              </span>
            </div>

            <div className="space-y-2">
              {steps.map((step, idx) => {
                const stepNum = String(idx + 1).padStart(2, '0');
                return (
                  <div
                    key={step.id}
                    role="listitem"
                    className={`flex items-start justify-between gap-3 rounded-2xl border p-3.5 transition-all duration-200 ${
                      step.isDone
                        ? 'border-emerald-500/40 bg-emerald-500/5 text-foreground shadow-2xs'
                        : 'border-border/60 bg-secondary/40 text-muted-foreground hover:bg-secondary/70 hover:border-border'
                    }`}
                  >
                    <div className="flex items-start gap-3 pl-0.5">
                      <div
                        className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border font-mono text-xs font-bold tabular-nums transition-all ${
                          step.isDone
                            ? 'border-emerald-600 bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-600/20'
                            : 'border-border bg-card text-muted-foreground'
                        }`}
                      >
                        {step.isDone ? (
                          <CheckCircle size={15} aria-hidden="true" />
                        ) : (
                          <span>{stepNum}</span>
                        )}
                      </div>
                      <div>
                        <p className={`text-xs font-bold leading-tight ${step.isDone ? 'text-foreground font-extrabold' : 'text-foreground/90'}`}>
                          {step.title}
                        </p>
                        <p className="mt-0.5 text-[11px] leading-normal text-muted-foreground font-normal">
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* DYNAMIC ELIGIBILITY BOX WITH CHAMPIONSHIP AMBER GOLD HIGHLIGHTS */}
      <AnimatePresence>
        {category && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="rounded-[2rem] border border-border/80 bg-secondary/30 p-1.5 shadow-2xs"
          >
            <div className="rounded-[calc(2rem-0.375rem)] border border-border bg-card p-6 sm:p-7 space-y-4 text-card-foreground">
              <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-3.5">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-amber-600 dark:text-amber-500 shrink-0" aria-hidden="true" />
                  <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                    Kelayakan Usia
                  </span>
                </div>
                {/* Championship Amber Gold Category Badge */}
                <span className="font-mono text-xs font-extrabold text-amber-700 dark:text-amber-400 tabular-nums">
                  {category} ({calculatedAge}&nbsp;Thn)
                </span>
              </div>

              <div>
                <p className="font-display text-base font-extrabold text-foreground leading-snug">
                  {categoryLabel}
                </p>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed text-pretty">
                  Atlet usia di bawah 18 tahun wajib melampirkan bukti usia yang sah.
                </p>
              </div>

              <div className="rounded-2xl border border-border/60 bg-secondary/30 p-3.5 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                  Dokumen Wajib:
                </span>
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-2.5 py-1 text-xs font-medium text-foreground shadow-2xs">
                    <FileText size={13} className="text-muted-foreground shrink-0" aria-hidden="true" /> Pas Foto (Maks 2 MB)
                  </span>
                  {documentRule(category).labels.map((docLabel) => (
                    <span
                      key={docLabel}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-2.5 py-1 text-xs font-medium text-foreground shadow-2xs"
                    >
                      <FileText size={13} className="text-muted-foreground shrink-0" aria-hidden="true" /> {docLabel}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HELPDESK INFO */}
      <div className="rounded-[2rem] border border-border/80 bg-secondary/30 p-1.5 shadow-2xs">
        <div className="rounded-[calc(2rem-0.375rem)] border border-border bg-card p-6 space-y-3 text-xs text-card-foreground">
          <div className="flex items-center gap-2 font-bold text-foreground">
            <HelpCircle size={16} className="text-muted-foreground shrink-0" aria-hidden="true" />
            <span>Bantuan Pendaftaran</span>
          </div>
          <p className="text-muted-foreground leading-relaxed text-pretty">
            Jika ada kesulitan atau pertanyaan saat mengisi formulir, silakan hubungi pengurus PB Undip.
          </p>
          <div className="pt-1">
            <a
              href="https://wa.me/6281234567890"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card hover:bg-emerald-600 hover:text-white hover:border-emerald-600 px-3.5 py-2 text-xs font-bold text-foreground transition-all duration-200 shadow-2xs"
            >
              <span>Chat WhatsApp Admin</span>
              <span aria-hidden="true" className="font-mono">↗</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
