'use client';

import React, { useState } from 'react';
import {
  ChevronRight,
  User,
  MapPin,
  Calendar,
  Inbox,
  CheckCircle2,
  AlertCircle,
  Clock,
  FileCheck2,
  MessageCircle,
  Copy,
  Check
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { genderLabel } from '@/lib/gender';
import { GenderIcon } from '@/lib/gender-icon';
import type { RegistrationItem } from './RegistrationStats';
import { toast } from 'sonner';

interface RegistrationTableProps {
  data: RegistrationItem[];
  onSelectRow: (item: RegistrationItem) => void;
  selectedId?: string;
  isLoading?: boolean;
}

export default function RegistrationTable({
  data,
  onSelectRow,
  selectedId,
  isLoading,
}: RegistrationTableProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyQuick = (e: React.MouseEvent, text: string, id: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success(`Disalin: ${text}`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getStatusBadge = (status: RegistrationItem['status']) => {
    switch (status) {
      case 'valid':
        return (
          <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20 gap-1.5 px-2.5 py-1 font-bold">
            <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Valid (Diterima)</span>
          </Badge>
        );
      case 'sudah_input_pbsi':
        return (
          <Badge className="bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30 hover:bg-blue-500/20 gap-1.5 px-2.5 py-1 font-bold">
            <span className="h-2 w-2 rounded-full bg-blue-500 shrink-0" />
            <FileCheck2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Masuk SI PBSI</span>
          </Badge>
        );
      case 'baru':
      default:
        return (
          <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 hover:bg-amber-500/20 gap-1.5 px-2.5 py-1 font-bold">
            <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
            <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Menunggu Review</span>
          </Badge>
        );
    }
  };


  const formatDate = (timestamp: number) => {
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(timestamp));
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-border bg-card p-12 text-center text-muted-foreground shadow-2xs">
        <div className="mx-auto flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
          <span className="text-sm font-semibold">Memuat data pendaftar...</span>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-12 text-center text-muted-foreground shadow-2xs">
        <div className="mx-auto flex max-w-sm flex-col items-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-muted-foreground">
            <Inbox className="h-6 w-6" />
          </div>
          <h3 className="font-display text-sm font-bold text-foreground">Tidak ada data pendaftar</h3>
          <p className="text-xs text-muted-foreground text-pretty">
            Data atlet pendaftar akan muncul di sini sesuai dengan filter yang Anda pilih.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-2xs">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/50 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              <th scope="col" className="px-5 py-3.5">Atlet & Kontak</th>
              <th scope="col" className="px-5 py-3.5">Profil Atlet</th>
              <th scope="col" className="px-5 py-3.5">Klub & Asal Wilayah</th>
              <th scope="col" className="px-5 py-3.5">Waktu Daftar</th>
              <th scope="col" className="px-5 py-3.5">Status Verifikasi</th>
              <th scope="col" className="px-5 py-3.5 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {data.map((item) => {
              const isSelected = selectedId === item._id;
              const waClean = item.whatsapp.replace(/[^0-9]/g, '');
              return (
                <tr
                  key={item._id}
                  role="button"
                  tabIndex={0}
                  onClick={() => onSelectRow(item)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelectRow(item);
                    }
                  }}
                  className={cn(
                    'group cursor-pointer transition-all hover:bg-secondary/60 focus:bg-secondary/60 focus:outline-none',
                    isSelected ? 'bg-primary/5 hover:bg-primary/10' : ''
                  )}
                >
                  {/* Atlet & Kontak */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
                        <GenderIcon gender={item.gender} className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-foreground truncate group-hover:text-primary transition-colors flex items-center gap-1.5">
                          <span>{item.fullName}</span>
                        </div>
                        <div className="text-xs font-medium text-muted-foreground truncate flex items-center gap-2 mt-0.5">
                          <span className="font-mono">{item.whatsapp}</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Profil */}
                  <td className="px-5 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span className="capitalize">{genderLabel(item.gender)}</span>
                        <span>•</span>
                        <span>{item.dob || '-'}</span>
                      </div>
                    </div>
                  </td>

                  {/* Klub & Asal Wilayah */}
                  <td className="px-5 py-4">
                    <div className="min-w-0 max-w-[200px]">
                      <div className="font-bold text-foreground truncate">
                        {item.club}
                      </div>
                      <div className="text-xs font-medium text-muted-foreground truncate flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3 w-3 shrink-0 text-muted-foreground/80" />
                        <span className="truncate">{item.regencyName || '-'}</span>
                      </div>
                    </div>
                  </td>

                  {/* Waktu Daftar */}
                  <td className="px-5 py-4 whitespace-nowrap text-xs font-medium text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground/80" />
                      <span>{formatDate(item.createdAt)}</span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-5 py-4 whitespace-nowrap">
                    {getStatusBadge(item.status)}
                  </td>

                  {/* Quick Actions */}
                  <td className="px-5 py-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                      {/* WA Quick Link */}
                      <a
                        href={`https://wa.me/${waClean}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                        title="Chat WhatsApp"
                      >
                        <MessageCircle className="h-4 w-4" />
                      </a>

                      {/* Quick Copy Name */}
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-lg border-border hover:bg-secondary"
                        onClick={(e) => handleCopyQuick(e, item.fullName, item._id)}
                        title="Salin Nama Atlet"
                      >
                        {copiedId === item._id ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                      </Button>

                      {/* Detail Arrow */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-all"
                        onClick={() => onSelectRow(item)}
                        title="Lihat Detail Pendaftar"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
