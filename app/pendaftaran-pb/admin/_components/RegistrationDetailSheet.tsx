'use client';

import React, { useState } from 'react';
import {
  User,
  MapPin,
  Phone,
  Mail,
  Calendar,
  FileText,
  Copy,
  Check,
  ExternalLink,
  MessageCircle,
  FileCheck2,
  AlertCircle,
  ShieldCheck,
  Cloud,
  Download,
  Building2,
  Award,
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { RegistrationItem } from './RegistrationStats';
import RegistrationReviewBox from './RegistrationReviewBox';

interface RegistrationDetailSheetProps {
  registration: RegistrationItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateStatus: (status: RegistrationItem['status'], note?: string) => Promise<void>;
  isUpdating: boolean;
}

export default function RegistrationDetailSheet({
  registration,
  open,
  onOpenChange,
  onUpdateStatus,
  isUpdating,
}: RegistrationDetailSheetProps) {
  const [activeTab, setActiveTab] = useState<'biodata' | 'dokumen' | 'pbsi'>('biodata');
  const [copied, setCopied] = useState(false);

  if (!registration) return null;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .slice(0, 2)
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const formatWhatsAppNumber = (raw: string) => {
    let num = raw.replace(/\D/g, '');
    if (num.startsWith('0')) {
      num = '62' + num.slice(1);
    } else if (!num.startsWith('62')) {
      num = '62' + num;
    }
    return num;
  };

  const handleWhatsAppChat = () => {
    const waNumber = formatWhatsAppNumber(registration.whatsapp);
    let message = `Halo Kak *${registration.fullName}*,\nKami dari Panitia Pendaftaran Turnamen Bulutangkis.\n\nTerkait pendaftaran Anda di klub *${registration.club}* (Kategori ${registration.category.toUpperCase()}):`;

    if (registration.status === 'revisi') {
      message += `\n\n⚠️ *Terdapat dokumen yang perlu diperbaiki/revisi:* ${registration.reviewNote || 'Mohon cek kembali pas foto atau dokumen identitas Anda.'}\n\nSilakan kirimkan perbaikan dokumen melalui pesan ini. Terima kasih!`;
    } else if (registration.status === 'valid') {
      message += `\n\n✅ *Selamat! Data pendaftaran Anda telah Disetujui (Valid).* Data Anda siap didaftarkan ke jadwal pertandingan. Terima kasih!`;
    } else if (registration.status === 'sudah_input_pbsi') {
      message += `\n\n🏸 *Informasi:* Data pendaftaran Anda telah selesai diinput ke dalam portal Sistem Informasi PBSI (SI PBSI). Semoga sukses di turnamen!`;
    } else {
      message += `\n\nSaat ini data Anda sedang dalam proses verifikasi oleh panitia sekretariat. Kami akan segera menginfokan status selanjutnya. Terima kasih!`;
    }

    const url = `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const getPbsiFormat = () => {
    const alamatLengkap = [
      registration.addressDetail,
      registration.villageName ? `Desa/Kel. ${registration.villageName}` : '',
      registration.districtName ? `Kec. ${registration.districtName}` : '',
      registration.regencyName || registration.kabupaten,
      registration.provinceName,
      registration.postalCode ? `Kode Pos: ${registration.postalCode}` : '',
    ]
      .filter(Boolean)
      .join(', ');

    return `=== FORMAT SI PBSI (SIAP SALIN) ===
NAMA LENGKAP : ${registration.fullName.toUpperCase()}
TGL LAHIR    : ${registration.dob}
JENIS KELAMIN: ${registration.gender.toUpperCase()}
KATEGORI USIA: ${registration.category.toUpperCase()}
KLUB ASAL    : ${registration.club.toUpperCase()}
KABUPATEN    : ${(registration.regencyName || registration.kabupaten).toUpperCase()}
ALAMAT       : ${alamatLengkap}
WHATSAPP     : ${registration.whatsapp}
EMAIL        : ${registration.email || '-'}
STATUS       : ${registration.status.toUpperCase()}`;
  };

  const handleCopyPbsi = async () => {
    try {
      await navigator.clipboard.writeText(getPbsiFormat());
      setCopied(true);
      toast.success('Format biodata PBSI berhasil disalin ke clipboard!');
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      toast.error('Gagal menyalin teks ke clipboard.');
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto p-0 flex flex-col bg-background text-foreground border-l border-border shadow-2xl">
        {/* Header Profile */}
        <div className="border-b border-border bg-card p-6">
          <SheetHeader className="text-left">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-secondary font-display text-lg font-black text-foreground border border-border shadow-inner">
                  {getInitials(registration.fullName)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <SheetTitle className="font-display text-lg font-bold text-foreground">
                      {registration.fullName}
                    </SheetTitle>
                    <Badge
                      className={cn(
                        'text-[10px] font-bold uppercase px-2 py-0.5',
                        registration.gender === 'putra'
                          ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30'
                          : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30'
                      )}
                    >
                      {registration.gender === 'putra' ? 'Putra' : 'Putri'}
                    </Badge>
                  </div>
                  <SheetDescription className="mt-1 flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                    <Building2 className="h-3.5 w-3.5 text-muted-foreground/80" />
                    <span>Klub: {registration.club}</span>
                    <span>•</span>
                    <Award className="h-3.5 w-3.5 text-primary" />
                    <span className="text-primary font-bold uppercase">
                      {registration.category}
                    </span>
                  </SheetDescription>
                </div>
              </div>
            </div>
          </SheetHeader>

          {/* Clean Navigation Tabs */}
          <div role="tablist" aria-label="Detail Pendaftaran" className="mt-6 flex border-b border-border -mb-6">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'biodata'}
              onClick={() => setActiveTab('biodata')}
              className={cn(
                'flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold transition-all cursor-pointer',
                activeTab === 'biodata'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              <User className="h-3.5 w-3.5" />
              <span>Biodata & Kontak</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'dokumen'}
              onClick={() => setActiveTab('dokumen')}
              className={cn(
                'flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold transition-all cursor-pointer',
                activeTab === 'dokumen'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Dokumen ({registration.files?.length || 0})</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'pbsi'}
              onClick={() => setActiveTab('pbsi')}
              className={cn(
                'flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold transition-all cursor-pointer',
                activeTab === 'pbsi'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              <Copy className="h-3.5 w-3.5" />
              <span>Format PBSI</span>
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: BIODATA & KONTAK */}
          {activeTab === 'biodata' && (
            <div role="tabpanel" className="space-y-6 animate-in fade-in-50 duration-200">
              {/* Card Kontak Cepat */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-border bg-secondary/30 p-4 shadow-2xs">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Komunikasi Langsung
                  </div>
                  <div className="text-sm font-black text-foreground mt-0.5">
                    WhatsApp: {registration.whatsapp}
                  </div>
                  {registration.email && (
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Email: {registration.email}
                    </div>
                  )}
                </div>
                <Button
                  onClick={handleWhatsAppChat}
                  className="h-10 gap-2 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 shadow-sm transition-all cursor-pointer"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>Chat WhatsApp</span>
                </Button>
              </div>

              {/* Rincian Biodata */}
              <div className="rounded-2xl border border-border bg-card p-5 shadow-2xs space-y-4 text-card-foreground">
                <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border/60 pb-2">
                  Informasi Pribadi
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-medium">
                  <div>
                    <span className="block text-muted-foreground font-semibold mb-0.5">Nama Lengkap</span>
                    <span className="text-sm font-bold text-foreground">
                      {registration.fullName}
                    </span>
                  </div>
                  <div>
                    <span className="block text-muted-foreground font-semibold mb-0.5">Tanggal Lahir</span>
                    <span className="text-sm font-bold text-foreground">
                      {registration.dob}
                    </span>
                  </div>
                  <div>
                    <span className="block text-muted-foreground font-semibold mb-0.5">Jenis Kelamin</span>
                    <span className="text-sm font-bold capitalize text-foreground">
                      {registration.gender}
                    </span>
                  </div>
                  <div>
                    <span className="block text-muted-foreground font-semibold mb-0.5">Klub Asal</span>
                    <span className="text-sm font-bold text-foreground">
                      {registration.club}
                    </span>
                  </div>
                </div>
              </div>

              {/* Rincian Alamat */}
              <div className="rounded-2xl border border-border bg-card p-5 shadow-2xs space-y-4 text-card-foreground">
                <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border/60 pb-2">
                  Alamat & Wilayah Domisili
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-medium">
                  <div>
                    <span className="block text-muted-foreground font-semibold mb-0.5">Kabupaten / Kota</span>
                    <span className="text-sm font-bold text-foreground">
                      {registration.regencyName || registration.kabupaten}
                    </span>
                  </div>
                  <div>
                    <span className="block text-muted-foreground font-semibold mb-0.5">Provinsi</span>
                    <span className="text-sm font-bold text-foreground">
                      {registration.provinceName || '-'}
                    </span>
                  </div>
                  <div>
                    <span className="block text-muted-foreground font-semibold mb-0.5">Kecamatan</span>
                    <span className="text-sm font-bold text-foreground">
                      {registration.districtName || '-'}
                    </span>
                  </div>
                  <div>
                    <span className="block text-muted-foreground font-semibold mb-0.5">Desa / Kelurahan</span>
                    <span className="text-sm font-bold text-foreground">
                      {registration.villageName || '-'} ({registration.postalCode || ''})
                    </span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="block text-muted-foreground font-semibold mb-0.5">Detail Alamat (Jalan/RT/RW)</span>
                    <span className="text-sm font-bold text-foreground leading-relaxed">
                      {registration.addressDetail || '-'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DOKUMEN & R2 STORAGE */}
          {activeTab === 'dokumen' && (
            <div role="tabpanel" className="space-y-6 animate-in fade-in-50 duration-200">
              <div className="rounded-2xl border border-border bg-secondary/30 p-4 text-xs text-foreground">
                <div className="flex items-center gap-2 font-bold mb-1">
                  <Cloud className="h-4 w-4 text-primary" />
                  <span>Integrasi Cloudflare R2 Storage</span>
                </div>
                <p className="leading-relaxed text-muted-foreground">
                  Berkas foto profil dan dokumen identitas atlet disiapkan dalam struktur objek R2 (`pb/[id]/[kategori]/[docType]`). Anda dapat meninjau dan mengunduh arsip di bawah ini.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(['foto_profil', 'dokumen_identitas'] as const).map((type) => {
                  const file = registration.files?.find((f) => f.docType === type);
                  const isPhoto = type === 'foto_profil';

                  return (
                    <div
                      key={type}
                      className="flex flex-col justify-between rounded-2xl border border-border bg-card p-4 shadow-2xs text-card-foreground"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            {isPhoto ? 'Pas Foto Atlet' : 'Dokumen Identitas (KTP/Akta)'}
                          </span>
                          <Badge
                            variant={file ? 'default' : 'secondary'}
                            className="text-[10px] font-bold"
                          >
                            {file ? 'Tersedia' : 'Belum Upload'}
                          </Badge>
                        </div>

                        {file ? (
                          <div className="mt-3 space-y-1">
                            <div className="text-sm font-bold text-foreground truncate" title={file.filename}>
                              {file.filename}
                            </div>
                            <div className="text-xs text-muted-foreground font-medium">
                              Ukuran: {(file.size / 1024).toFixed(1)} KB • {file.contentType}
                            </div>
                            <div className="text-[10px] font-mono text-muted-foreground bg-secondary/50 p-1.5 rounded-lg border border-border mt-2 truncate">
                              {file.objectKey}
                            </div>
                          </div>
                        ) : (
                          <div className="mt-4 text-xs text-muted-foreground italic">
                            Atlet belum mengunggah berkas ini.
                          </div>
                        )}
                      </div>

                      <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-end gap-2">
                        {file ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-9 gap-1.5 rounded-xl text-xs font-bold cursor-pointer hover:bg-secondary"
                            onClick={() => {
                              toast.info(`Mengunduh dari storage: ${file.filename}...`);
                            }}
                          >
                            <Download className="h-3.5 w-3.5" />
                            <span>Unduh / Lihat</span>
                          </Button>
                        ) : (
                          <span className="text-[11px] text-orange-500 font-semibold flex items-center gap-1">
                            <AlertCircle className="h-3.5 w-3.5" />
                            <span>Wajib dilengkapi</span>
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: FORMAT PBSI */}
          {activeTab === 'pbsi' && (
            <div role="tabpanel" className="space-y-6 animate-in fade-in-50 duration-200">
              <div className="rounded-2xl border border-border bg-card p-5 shadow-2xs space-y-4 text-card-foreground">
                <div className="flex items-center justify-between border-b border-border/60 pb-3">
                  <div>
                    <h4 className="text-sm font-black text-foreground">
                      Format Biodata SI PBSI
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Klik tombol salin di bawah lalu Paste langsung pada portal resmi Sistem Informasi PBSI.
                    </p>
                  </div>
                  <Button
                    onClick={handleCopyPbsi}
                    className={cn(
                      'h-10 gap-2 rounded-xl font-bold shadow-sm transition-all cursor-pointer',
                      copied
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : 'bg-primary hover:bg-primary/90 text-primary-foreground'
                    )}
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4" />
                        <span>Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        <span>Salin Format PBSI</span>
                      </>
                    )}
                  </Button>
                </div>

                {/* Kotak Teks PBSI Format */}
                <div className="relative rounded-xl bg-secondary/50 p-4 font-mono text-xs text-foreground border border-border shadow-inner overflow-x-auto">
                  <pre className="whitespace-pre-wrap leading-relaxed select-all">
                    {getPbsiFormat()}
                  </pre>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
                  <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>
                    Format ini telah disesuaikan agar rapi dan kompatibel dengan standar input pendaftaran turnamen PBSI.
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Review Aksi Status */}
        <div className="border-t border-border bg-card p-6">
          <RegistrationReviewBox
            registration={registration}
            onUpdateStatus={onUpdateStatus}
            isUpdating={isUpdating}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
