'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery, useMutation, useAction } from 'convex/react';
import { api } from '@/convex/_generated/api';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { loadValidAdminSession } from '@/lib/admin-session';
import { genderLabel } from '@/lib/gender';
import { Id } from '@/convex/_generated/dataModel';
import {
  ArrowLeft,
  Check,
  Copy,
  Download,
  ExternalLink,
  FileCheck2,
  FileText,
  MessageCircle,
  User,
  Clock,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const PB_TOKEN_KEY = 'pb_admin_token';

export default function AdminRegistrationDetail() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as Id<'pb_registrations'>;

  const [token, setToken] = useState<string>('');
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // Initial Session Check
  useEffect(() => {
    const pbToken = localStorage.getItem(PB_TOKEN_KEY);
    if (pbToken) {
      setToken(pbToken);
    } else {
      const masterSession = loadValidAdminSession();
      if (masterSession?.token && !masterSession.isTemporary) {
        setToken(masterSession.token);
      }
    }
    setIsAuthChecking(false);
  }, []);

  // Convex Queries
  const registrationDetail = useQuery(
    api.pbRegistration.getRegistrationDetail,
    token ? { adminSessionToken: token, registrationId: id } : 'skip'
  );

  const updateStatusMutation = useMutation(api.pbRegistration.updateStatus);
  const getDownloadUrl = useAction(api.pbRegistration.downloadUrl);
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);
  const [openingFileDocType, setOpeningFileDocType] = useState<string | null>(null);
  const [downloadingFileDocType, setDownloadingFileDocType] = useState<string | null>(null);
  const updateDataMutation = useMutation(api.pbRegistration.adminUpdateData);

  // States for Inline Editing
  const [isEditing, setIsEditing] = useState(false);
  
  const [editForm, setEditForm] = useState<{
    fullName: string;
    dob: string;
    gender: 'pria' | 'wanita' | 'putra' | 'putri';
    club: string;
    whatsapp: string;
    email: string;
  }>({
    fullName: '',
    dob: '',
    gender: 'putra',
    club: '',
    whatsapp: '',
    email: ''
  });

  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    if (registrationDetail && !isEditing) {
      setEditForm({
        fullName: registrationDetail.fullName,
        email: registrationDetail.email || '',
        whatsapp: registrationDetail.whatsapp,
        gender: registrationDetail.gender,
        dob: registrationDetail.dob || '',
        club: registrationDetail.club,
      });
    }
  }, [registrationDetail, isEditing]);

  const handleCopy = (text: string, fieldLabel: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldLabel);
    toast.success(`${fieldLabel} berhasil disalin!`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleUpdateStatus = async (status: 'baru' | 'valid' | 'sudah_input_pbsi') => {
    if (!registrationDetail || !token) return;
    setIsUpdatingStatus(true);
    try {
      await updateStatusMutation({
        registrationId: registrationDetail._id,
        status,
        adminSessionToken: token,
      });
      toast.success(`Status berhasil diperbarui menjadi "${status.toUpperCase().replace(/_/g, ' ')}".`);
    } catch (err) {
      toast.error(`Gagal memperbarui status: ${(err as Error).message}`);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleSaveData = async () => {
    if (!registrationDetail || !token) return;
    try {
      await updateDataMutation({
        registrationId: registrationDetail._id,
        adminSessionToken: token,
        fullName: editForm.fullName,
        dob: editForm.dob,
        gender: editForm.gender,
        club: editForm.club,
        whatsapp: editForm.whatsapp,
        email: editForm.email || undefined,
      });
      toast.success('Data pendaftar berhasil diperbarui.');
      setIsEditing(false);
    } catch (err) {
      toast.error(`Gagal menyimpan data: ${(err as Error).message}`);
    }
  };

  const handleDownloadZip = async () => {
    if (!registrationDetail || !registrationDetail.files || registrationDetail.files.length === 0 || !token) return;
    setIsDownloadingZip(true);
    try {
      const zip = new JSZip();
      toast.info('Menyiapkan file untuk diunduh...');
      
      for (const file of registrationDetail.files) {
        const url = await getDownloadUrl({
          registrationId: registrationDetail._id,
          docType: file.docType,
          adminSessionToken: token,
        });
        if (url) {
          const response = await fetch(url);
          const blob = await response.blob();
          zip.file(file.filename, blob);
        }
      }
      
      const content = await zip.generateAsync({ type: 'blob' });
      const sanitizedName = registrationDetail.fullName.replace(/[^a-zA-Z0-9]/g, '_');
      saveAs(content, `Berkas_${sanitizedName}.zip`);
      toast.success('File ZIP berhasil diunduh!');
    } catch (err) {
      toast.error(`Gagal mengunduh ZIP: ${(err as Error).message}`);
    } finally {
      setIsDownloadingZip(false);
    }
  };

  const handleOpenFile = async (docType: string) => {
    if (!registrationDetail || !token) return;
    setOpeningFileDocType(docType);
    try {
      const url = await getDownloadUrl({
        registrationId: registrationDetail._id,
        docType,
        adminSessionToken: token,
      });
      if (url) {
        window.open(url, '_blank', 'noopener,noreferrer');
      } else {
        toast.error('Gagal mendapatkan link file.');
      }
    } catch (err) {
      toast.error(`Gagal membuka file: ${(err as Error).message}`);
    } finally {
      setOpeningFileDocType(null);
    }
  };

  const handleDownloadSingleFile = async (docType: string, filename: string) => {
    if (!registrationDetail || !token) return;
    setDownloadingFileDocType(docType);
    try {
      const url = await getDownloadUrl({
        registrationId: registrationDetail._id,
        docType,
        adminSessionToken: token,
      });
      if (url) {
        const response = await fetch(url);
        const blob = await response.blob();
        saveAs(blob, filename);
        toast.success(`Dokumen ${filename} berhasil diunduh!`);
      } else {
        toast.error('Gagal mendapatkan link file.');
      }
    } catch (err) {
      toast.error(`Gagal mengunduh file: ${(err as Error).message}`);
    } finally {
      setDownloadingFileDocType(null);
    }
  };

  if (isAuthChecking) return <div className="p-8 text-center text-muted-foreground font-semibold">Memuat sesi...</div>;
  if (!token) {
    router.push('/pendaftaran-pb/admin');
    return null;
  }
  if (registrationDetail === undefined) {
    return (
      <div className="flex min-h-dvh items-center justify-center p-8 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
          <span className="text-sm font-semibold text-muted-foreground">Memuat data pendaftar...</span>
        </div>
      </div>
    );
  }
  if (registrationDetail === null) return <div className="p-8 text-center text-destructive font-bold">Data pendaftar tidak ditemukan.</div>;

  return (
    <div className="min-h-dvh bg-background text-foreground pb-20">
      {/* Header Bar */}
      <header className="sticky top-0 z-30 border-b border-border/80 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl border-border shrink-0" onClick={() => router.push('/pendaftaran-pb/admin')}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-base sm:text-lg font-bold">Detail Pendaftar</h1>
                <span className="rounded-md bg-secondary px-2 py-0.5 text-[11px] font-mono font-semibold text-muted-foreground border border-border">
                  {registrationDetail._id.slice(-6)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">Verifikasi data atlet & kelengkapan dokumen</p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: Main Biodata & Form Edit */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Header Athlete Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card border border-border shadow-2xs rounded-2xl p-5">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 font-display text-xl font-black text-primary border border-primary/20 shrink-0">
                  {registrationDetail.fullName.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h2 className="font-bold text-xl text-foreground tracking-tight">{registrationDetail.fullName}</h2>
                  <div className="flex flex-wrap items-center gap-2 mt-1.5">
                    <span className="bg-secondary text-foreground px-2.5 py-0.5 rounded-full text-xs font-bold border border-border">
                      {registrationDetail.club}
                    </span>
                    <span className="text-xs text-muted-foreground font-medium">
                      ({genderLabel(registrationDetail.gender)})
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="shrink-0 flex gap-2">
                {!isEditing ? (
                  <Button variant="outline" className="rounded-xl font-bold border-border shadow-2xs" onClick={() => setIsEditing(true)}>
                    Edit Data Atlet
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button variant="ghost" className="rounded-xl font-semibold" onClick={() => setIsEditing(false)}>Batal</Button>
                    <Button className="rounded-xl font-bold bg-primary text-primary-foreground shadow-sm" onClick={handleSaveData}>Simpan Perubahan</Button>
                  </div>
                )}
              </div>
            </div>

            {/* Biodata Section */}
            <div className="bg-card border border-border shadow-2xs rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6 pb-3 border-b border-border/60">
                <h3 className="font-bold text-base flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" /> Biodata & Kontak Pendaftar
                </h3>
                <span className="text-xs font-medium text-muted-foreground">
                  {!isEditing ? 'Klik tombol salin di samping data' : 'Mode Pengeditan Aktif'}
                </span>
              </div>
              
              {!isEditing ? (
                // VIEW MODE - CLEAR READABLE CARDS WITH VISIBLE COPY BUTTONS
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Field: Nama */}
                  <div className="rounded-xl border border-border/80 bg-secondary/30 p-3.5 flex flex-col justify-between gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Nama Lengkap</span>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-sm text-foreground truncate">{registrationDetail.fullName}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 px-2 text-xs font-semibold gap-1 border-border shrink-0 hover:bg-background"
                        onClick={() => handleCopy(registrationDetail.fullName, 'Nama')}
                      >
                        {copiedField === 'Nama' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                        <span>Salin</span>
                      </Button>
                    </div>
                  </div>

                  {/* Field: WhatsApp */}
                  <div className="rounded-xl border border-border/80 bg-secondary/30 p-3.5 flex flex-col justify-between gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Nomor WhatsApp</span>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="font-mono font-bold text-sm text-foreground truncate">{registrationDetail.whatsapp}</span>
                        <a
                          href={`https://wa.me/${registrationDetail.whatsapp.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors shrink-0"
                          title="Buka WhatsApp Chat"
                        >
                          <MessageCircle className="w-3 h-3" />
                          <span>Chat WA</span>
                        </a>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 px-2 text-xs font-semibold gap-1 border-border shrink-0 hover:bg-background"
                        onClick={() => handleCopy(registrationDetail.whatsapp, 'No WA')}
                      >
                        {copiedField === 'No WA' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                        <span>Salin</span>
                      </Button>
                    </div>
                  </div>

                  {/* Field: Tanggal Lahir */}
                  <div className="rounded-xl border border-border/80 bg-secondary/30 p-3.5 flex flex-col justify-between gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Tanggal Lahir (YYYY-MM-DD)</span>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono font-bold text-sm text-foreground">{registrationDetail.dob || '-'}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 px-2 text-xs font-semibold gap-1 border-border shrink-0 hover:bg-background"
                        onClick={() => handleCopy(registrationDetail.dob || '', 'Tanggal Lahir')}
                      >
                        {copiedField === 'Tanggal Lahir' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                        <span>Salin</span>
                      </Button>
                    </div>
                  </div>

                  {/* Field: Gender */}
                  <div className="rounded-xl border border-border/80 bg-secondary/30 p-3.5 flex flex-col justify-between gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Gender</span>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-sm text-foreground capitalize">
                        {genderLabel(registrationDetail.gender)}
                      </span>
                    </div>
                  </div>

                  {/* Field: Klub / Sekolah */}
                  <div className="rounded-xl border border-border/80 bg-secondary/30 p-3.5 flex flex-col justify-between gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Klub / Sekolah</span>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-sm text-foreground truncate">{registrationDetail.club}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 px-2 text-xs font-semibold gap-1 border-border shrink-0 hover:bg-background"
                        onClick={() => handleCopy(registrationDetail.club, 'Klub')}
                      >
                        {copiedField === 'Klub' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                        <span>Salin</span>
                      </Button>
                    </div>
                  </div>

                  {/* Field: Kabupaten / Kota */}
                  <div className="rounded-xl border border-border/80 bg-secondary/30 p-3.5 flex flex-col justify-between gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Kabupaten / Kota</span>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-sm text-foreground truncate">{registrationDetail.regencyName || '-'}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 px-2 text-xs font-semibold gap-1 border-border shrink-0 hover:bg-background"
                        onClick={() => handleCopy(registrationDetail.regencyName || '', 'Kabupaten')}
                      >
                        {copiedField === 'Kabupaten' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                        <span>Salin</span>
                      </Button>
                    </div>
                  </div>

                  {/* Field: NIK */}
                  <div className="rounded-xl border border-border/80 bg-secondary/30 p-3.5 flex flex-col justify-between gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">NIK</span>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono font-bold text-sm text-foreground truncate">{registrationDetail.nik || '-'}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 px-2 text-xs font-semibold gap-1 border-border shrink-0 hover:bg-background"
                        onClick={() => handleCopy(registrationDetail.nik || '', 'NIK')}
                      >
                        {copiedField === 'NIK' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                        <span>Salin</span>
                      </Button>
                    </div>
                  </div>

                  {/* Field: ID BWF */}
                  <div className="rounded-xl border border-border/80 bg-secondary/30 p-3.5 flex flex-col justify-between gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">ID BWF</span>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono font-bold text-sm text-foreground truncate">{registrationDetail.bwfId || '-'}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 px-2 text-xs font-semibold gap-1 border-border shrink-0 hover:bg-background"
                        onClick={() => handleCopy(registrationDetail.bwfId || '', 'ID BWF')}
                      >
                        {copiedField === 'ID BWF' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                        <span>Salin</span>
                      </Button>
                    </div>
                  </div>

                  {/* Field: Ibu Kandung */}
                  <div className="rounded-xl border border-border/80 bg-secondary/30 p-3.5 flex flex-col justify-between gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Ibu Kandung</span>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-sm text-foreground truncate">{registrationDetail.motherName || '-'}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 px-2 text-xs font-semibold gap-1 border-border shrink-0 hover:bg-background"
                        onClick={() => handleCopy(registrationDetail.motherName || '', 'Ibu Kandung')}
                      >
                        {copiedField === 'Ibu Kandung' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                        <span>Salin</span>
                      </Button>
                    </div>
                  </div>

                  {/* Field: Tempat Lahir */}
                  <div className="rounded-xl border border-border/80 bg-secondary/30 p-3.5 flex flex-col justify-between gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Tempat Lahir</span>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-sm text-foreground truncate">{registrationDetail.birthPlace || '-'}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 px-2 text-xs font-semibold gap-1 border-border shrink-0 hover:bg-background"
                        onClick={() => handleCopy(registrationDetail.birthPlace || '', 'Tempat Lahir')}
                      >
                        {copiedField === 'Tempat Lahir' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                        <span>Salin</span>
                      </Button>
                    </div>
                  </div>

                  {/* Field: Email */}
                  <div className="rounded-xl border border-border/80 bg-secondary/30 p-3.5 flex flex-col justify-between gap-2 sm:col-span-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Email Pendaftar</span>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-sm text-foreground truncate">{registrationDetail.email || 'Tidak dicantumkan'}</span>
                      {registrationDetail.email && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 px-2 text-xs font-semibold gap-1 border-border shrink-0 hover:bg-background"
                          onClick={() => handleCopy(registrationDetail.email || '', 'Email')}
                        >
                          {copiedField === 'Email' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                          <span>Salin</span>
                        </Button>
                      )}
                    </div>
                  </div>

                </div>
              ) : (
                // EDIT MODE FORM
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Nama Lengkap</Label>
                    <Input className="h-10 rounded-xl bg-background" value={editForm.fullName} onChange={(e) => setEditForm({...editForm, fullName: e.target.value})} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Nomor WhatsApp</Label>
                    <Input className="h-10 rounded-xl bg-background" value={editForm.whatsapp} onChange={(e) => setEditForm({...editForm, whatsapp: e.target.value})} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email</Label>
                    <Input className="h-10 rounded-xl bg-background" value={editForm.email} onChange={(e) => setEditForm({...editForm, email: e.target.value})} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Klub / Sekolah</Label>
                    <Input className="h-10 rounded-xl bg-background" value={editForm.club} onChange={(e) => setEditForm({...editForm, club: e.target.value})} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Tanggal Lahir (YYYY-MM-DD)</Label>
                    <Input type="date" className="h-10 rounded-xl bg-background" value={editForm.dob} onChange={(e) => setEditForm({...editForm, dob: e.target.value})} />
                    <p className="text-[11px] font-medium text-muted-foreground">Kategori umur akan terhitung otomatis.</p>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Gender</Label>
                    <select
                      className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm font-semibold text-foreground focus:ring-2 focus:ring-primary"
                      value={editForm.gender}
                      onChange={(e) => setEditForm({...editForm, gender: e.target.value as 'putra' | 'putri' | 'pria' | 'wanita'})}
                    >
                      <option value="putra">Laki-laki</option>
                      <option value="pria">Laki-laki</option>
                      <option value="putri">Perempuan</option>
                      <option value="wanita">Perempuan</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Interactive Status Picker & Document Inspector */}
          <div className="space-y-6">
            
            {/* INTERACTIVE STATUS CARD SELECTOR */}
            <div className="bg-card border border-border shadow-2xs rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-base flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-primary" /> Status Verifikasi
                </h3>
                <span className="text-xs font-bold text-muted-foreground">Klik untuk ubah</span>
              </div>
              
              <div className="space-y-3">
                
                {/* Option 1: Baru */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => handleUpdateStatus('baru')}
                  className={cn(
                    'flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer select-none',
                    registrationDetail.status === 'baru'
                      ? 'border-amber-500/80 bg-amber-500/10 shadow-2xs ring-1 ring-amber-500/50'
                      : 'border-border/80 bg-secondary/20 hover:border-amber-500/40 hover:bg-secondary/40'
                  )}
                >
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-amber-500 bg-amber-500/20 text-amber-600">
                    {registrationDetail.status === 'baru' ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Clock className="w-3 h-3" />}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-foreground flex items-center gap-1.5">
                      <span>Menunggu Review</span>
                      {registrationDetail.status === 'baru' && (
                        <span className="text-[10px] bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold px-2 py-0.2 rounded-full">Aktif</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">Pendaftaran baru masuk, belum diverifikasi admin.</p>
                  </div>
                </div>

                {/* Option 2: Valid */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => handleUpdateStatus('valid')}
                  className={cn(
                    'flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer select-none',
                    registrationDetail.status === 'valid'
                      ? 'border-emerald-500/80 bg-emerald-500/10 shadow-2xs ring-1 ring-emerald-500/50'
                      : 'border-border/80 bg-secondary/20 hover:border-emerald-500/40 hover:bg-secondary/40'
                  )}
                >
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-emerald-500 bg-emerald-500/20 text-emerald-600">
                    {registrationDetail.status === 'valid' ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <CheckCircle2 className="w-3 h-3" />}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-foreground flex items-center gap-1.5">
                      <span>Valid (Disetujui)</span>
                      {registrationDetail.status === 'valid' && (
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold px-2 py-0.2 rounded-full">Aktif</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">Biodata & berkas sah, disetujui untuk mengikuti kejuaraan.</p>
                  </div>
                </div>

                {/* Option 3: Sudah Input PBSI */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => handleUpdateStatus('sudah_input_pbsi')}
                  className={cn(
                    'flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer select-none',
                    registrationDetail.status === 'sudah_input_pbsi'
                      ? 'border-blue-500/80 bg-blue-500/10 shadow-2xs ring-1 ring-blue-500/50'
                      : 'border-border/80 bg-secondary/20 hover:border-blue-500/40 hover:bg-secondary/40'
                  )}
                >
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-blue-500 bg-blue-500/20 text-blue-600">
                    {registrationDetail.status === 'sudah_input_pbsi' ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <FileCheck2 className="w-3 h-3" />}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-foreground flex items-center gap-1.5">
                      <span>Masuk SI PBSI</span>
                      {registrationDetail.status === 'sudah_input_pbsi' && (
                        <span className="text-[10px] bg-blue-500/20 text-blue-700 dark:text-blue-300 font-bold px-2 py-0.2 rounded-full">Aktif</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">Data atlet sudah di-input ke Sistem Informasi PBSI Pusat.</p>
                  </div>
                </div>

              </div>
            </div>

            {/* DOCUMENT INSPECTOR */}
            <div className="bg-card border border-border shadow-2xs rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-base flex items-center gap-2">
                  <FileCheck2 className="w-5 h-5 text-primary" /> Dokumen Pendukung
                </h3>
                {registrationDetail.files && registrationDetail.files.length > 0 && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="h-8 rounded-lg text-xs font-bold gap-1.5 border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 shrink-0"
                    onClick={handleDownloadZip}
                    disabled={isDownloadingZip}
                  >
                    {isDownloadingZip ? (
                      <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Download className="w-3.5 h-3.5" />
                    )}
                    <span>{isDownloadingZip ? 'Memproses...' : 'Download .zip'}</span>
                  </Button>
                )}
              </div>
              
              <div className="space-y-3">
                {registrationDetail.files && registrationDetail.files.length > 0 ? (
                  registrationDetail.files.map((file) => (
                    <div key={file._id} className="p-3 rounded-xl border border-border bg-secondary/20 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <span className="text-[10px] uppercase font-bold text-primary tracking-wider block">
                          {file.docType.replace(/_/g, ' ')}
                        </span>
                        <span className="font-medium text-xs text-foreground truncate block mt-0.5">
                          {file.filename}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 rounded-lg font-bold text-xs gap-1"
                          onClick={() => handleOpenFile(file.docType)}
                          disabled={openingFileDocType === file.docType}
                          title="Buka/Pratinjau File"
                        >
                          {openingFileDocType === file.docType ? (
                            <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <>
                              <span>Buka</span>
                              <ExternalLink className="w-3 h-3" />
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 rounded-lg font-bold text-xs gap-1 border-primary/20 bg-primary/5 text-primary hover:bg-primary/10"
                          onClick={() => handleDownloadSingleFile(file.docType, file.filename)}
                          disabled={downloadingFileDocType === file.docType}
                          title="Download Berkas Direct"
                        >
                          {downloadingFileDocType === file.docType ? (
                            <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <>
                              <span>Download</span>
                              <Download className="w-3 h-3" />
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-xl border border-dashed border-border p-4 text-center">
                    <p className="text-xs font-semibold text-muted-foreground">Belum ada dokumen yang diunggah.</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
