'use client';

import React, { useState } from 'react';
import { CheckCircle2, AlertCircle, FileCheck2, Clock, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import type { RegistrationItem } from './RegistrationStats';

interface RegistrationReviewBoxProps {
  registration: RegistrationItem;
  onUpdateStatus: (status: RegistrationItem['status'], note?: string) => Promise<void>;
  isUpdating: boolean;
}

export default function RegistrationReviewBox({
  registration,
  onUpdateStatus,
  isUpdating,
}: RegistrationReviewBoxProps) {
  const [note, setNote] = useState(registration.reviewNote || '');
  const [selectedAction, setSelectedAction] = useState<RegistrationItem['status'] | null>(null);

  const handleAction = async (targetStatus: RegistrationItem['status']) => {
    setSelectedAction(targetStatus);
    try {
      await onUpdateStatus(targetStatus, note.trim() || undefined);
    } finally {
      setSelectedAction(null);
    }
  };

  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-border bg-secondary/30 p-5 shadow-inner text-card-foreground">
      {/* Catatan Review */}
      <div>
        <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-foreground mb-2">
          <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
          <span>Catatan Review untuk Atlet / Klub</span>
        </label>
        <Textarea
          placeholder="Tulis alasan jika minta revisi (contoh: Pas foto buram, atau dokumen identitas salah upload)..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          className="rounded-xl border-border bg-background text-xs text-foreground focus:ring-primary focus:border-primary"
        />
        <p className="mt-1.5 text-[11px] text-muted-foreground">
          Catatan ini akan tersimpan dan dapat disampaikan via pesan WhatsApp saat Anda mengontak atlet.
        </p>
      </div>

      {/* Aksi Cepat */}
      <div>
        <div className="text-xs font-bold uppercase tracking-wider text-foreground mb-2.5">
          Ubah Status Verifikasi
        </div>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
          {/* Tombol Setujui Valid */}
          <Button
            type="button"
            disabled={isUpdating || registration.status === 'valid'}
            onClick={() => handleAction('valid')}
            className="h-11 justify-start gap-2 rounded-xl bg-emerald-600 px-4 text-xs font-bold text-white shadow hover:bg-emerald-700 disabled:opacity-50 cursor-pointer transition-all"
          >
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span className="truncate">Setujui (Valid)</span>
          </Button>

          {/* Tombol Minta Revisi */}
          <Button
            type="button"
            disabled={isUpdating || registration.status === 'revisi'}
            onClick={() => handleAction('revisi')}
            variant="outline"
            className="h-11 justify-start gap-2 rounded-xl border-orange-500/30 bg-orange-500/10 px-4 text-xs font-bold text-orange-600 dark:text-orange-400 shadow-2xs hover:bg-orange-500/20 disabled:opacity-50 cursor-pointer transition-all"
          >
            <AlertCircle className="h-4 w-4 shrink-0 text-orange-500" />
            <span className="truncate">Minta Revisi</span>
          </Button>

          {/* Tombol Masuk SI PBSI */}
          <Button
            type="button"
            disabled={isUpdating || registration.status === 'sudah_input_pbsi'}
            onClick={() => handleAction('sudah_input_pbsi')}
            variant="outline"
            className="h-11 justify-start gap-2 rounded-xl border-blue-500/30 bg-blue-500/10 px-4 text-xs font-bold text-blue-600 dark:text-blue-400 shadow-2xs hover:bg-blue-500/20 disabled:opacity-50 cursor-pointer transition-all"
          >
            <FileCheck2 className="h-4 w-4 shrink-0 text-blue-500" />
            <span className="truncate">Masuk SI PBSI</span>
          </Button>
        </div>
      </div>

      {/* Audit Trail Timeline */}
      {registration.history && registration.history.length > 0 && (
        <div className="border-t border-border/60 pt-4 mt-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground mb-3">
            <Clock className="h-3.5 w-3.5" />
            <span>Riwayat Log Status</span>
          </div>
          <div className="space-y-2.5 max-h-[140px] overflow-y-auto pr-1">
            {registration.history.slice().reverse().map((h) => {
              const dateStr = new Intl.DateTimeFormat('id-ID', {
                day: '2-digit',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              }).format(new Date(h.createdAt));

              return (
                <div
                  key={h._id}
                  className="flex flex-col gap-1 rounded-xl bg-background/60 p-2.5 text-[11px] border border-border/60"
                >
                  <div className="flex items-center justify-between font-bold">
                    <span className="uppercase tracking-wider text-primary">
                      {h.status}
                    </span>
                    <span className="text-muted-foreground font-normal">{dateStr}</span>
                  </div>
                  {h.note && (
                    <div className="text-muted-foreground/90 italic bg-secondary/50 p-1.5 rounded-lg border border-border/40">
                      &quot;{h.note}&quot;
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
