'use client';

import React, { useState, useMemo } from 'react';
import { useAction, useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import {
  normalizeWhatsApp,
  todayIso,
} from '@/lib/pb-registration-validation';

export const IDENTITY_DOC_TYPES = [
  'Akta Lahir', 'Kartu Keluarga', 'KTP', 'Mutasi', 'NISN Data Kemdikbud Online', 
  'Rapor SD', 'SIM', 'STTB SD', 'STTB SMP', 'STTB TK', 
  'Surat Ket Pembuatan Akta Lebih Dari Dua Tahun', 'Surat Keterangan Lahir', 
  'Surat Keterangan Lain', 'Surat Pernyataan Kebenaran Usia'
];
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  MapPin,
  FileText,
  AlertCircle,
  CheckCircle,
  PlusCircle,
  Award,
} from 'lucide-react';
import { toast } from 'sonner';

// Modular Components
import RegistrationSidebar from './_components/RegistrationSidebar';
import CustomSelect, { type Region } from './_components/CustomSelect';
import CustomDatePicker from './_components/CustomDatePicker';
import FileUploader from './_components/FileUploader';
import RegistrationSummaryModal from './_components/RegistrationSummaryModal';

// Shadcn UI Components
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';

export default function PendaftaranPBPage() {
  const [dob, setDob] = useState('');
  const [form, setForm] = useState({
    nik: '',
    fullName: '',
    bwfId: '',
    gender: 'pria',
    motherName: '',
    birthPlace: '',
    playingHand: 'kanan',
    club: '',
    nationality: 'WNI',
    phone: '',
    whatsapp: '',
    email: '',
    addressDetail: '',
    postalCode: '',
  });
  const [provinceCode, setProvince] = useState('');
  const [regencyCode, setRegency] = useState('');
  const [districtCode, setDistrict] = useState('');
  
  const [kkFile, setKkFile] = useState<File | null>(null);
  const [aktaFile, setAktaFile] = useState<File | null>(null);
  
  const [extraDocs, setExtraDocs] = useState<{ id: string; type: string; file: File | null }[]>([]);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [successInfo, setSuccessInfo] = useState<{ id: string; code?: string } | null>(null);

  const provinces = useQuery(api.regions.children, {});
  const regencies = useQuery(
    api.regions.children,
    provinceCode ? { parentCode: provinceCode } : 'skip'
  );
  const districts = useQuery(
    api.regions.children,
    regencyCode ? { parentCode: regencyCode } : 'skip'
  );

  const create = useMutation(api.pbRegistration.create);
  const record = useMutation(api.pbRegistration.recordFile);
  const finalize = useMutation(api.pbRegistration.finalize);
  const uploadUrl = useAction(api.pbRegistration.uploadUrl);

  const { calculatedAge, dobError } = useMemo(() => {
    let calculatedAge: number | null = null;
    let dobError = '';

    if (!dob) return { calculatedAge, dobError };

    try {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dob)) throw new Error('Tanggal lahir tidak valid.');
      const born = new Date(`${dob}T00:00:00Z`);
      if (Number.isNaN(+born) || born.toISOString().slice(0, 10) !== dob) throw new Error('Tanggal lahir tidak valid.');
      const now = new Date();
      if (dob > todayIso(now)) throw new Error('Tanggal lahir tidak boleh masa depan.');
      
      let age = now.getUTCFullYear() - born.getUTCFullYear();
      if (now.getUTCMonth() < born.getUTCMonth() || (now.getUTCMonth() === born.getUTCMonth() && now.getUTCDate() < born.getUTCDate())) age--;
      calculatedAge = age;
    } catch (err) {
      dobError = (err as Error).message;
    }
    
    return { calculatedAge, dobError };
  }, [dob]);

  const selectedProvince = provinces?.find((p: Region) => p.code === provinceCode);
  const selectedRegency = regencies?.find((r: Region) => r.code === regencyCode);

  const set = (name: keyof typeof form, value: string) =>
    setForm((current) => ({ ...current, [name]: value }));

  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (dobError || !dob) return setMessage('Harap isi tanggal lahir atlet dengan benar.');

    try {
      const normalizedWa = normalizeWhatsApp(form.whatsapp);
      set('whatsapp', normalizedWa);
    } catch {
      return setMessage('Nomor WhatsApp harus nomor Indonesia yang aktif (contoh: 081234567890).');
    }

    if (!kkFile || !aktaFile)
      return setMessage('Dokumen Kartu Keluarga dan Akta Kelahiran wajib diunggah.');

    setMessage('');
    setShowConfirmModal(true);
  };

  const confirmAndSubmit = async () => {
    if (!kkFile || !aktaFile || dobError || !dob) return;
    if (saving) return;

    try {
      setSaving(true);
      setMessage('Sedang memproses pendaftaran atlet…');

      const registration = await create({
        nik: form.nik,
        fullName: form.fullName,
        bwfId: form.bwfId || undefined,
        gender: form.gender as 'pria' | 'wanita' | 'putra' | 'putri',
        motherName: form.motherName,
        birthPlace: form.birthPlace,
        dob,
        playingHand: form.playingHand as 'kiri' | 'kanan',
        club: form.club,  nationality: form.nationality || undefined,
        phone: form.phone || undefined,
        email: form.email || undefined,
        whatsapp: form.whatsapp,
        addressDetail: form.addressDetail,
        postalCode: form.postalCode || undefined,
        provinceCode,
        regencyCode,
        districtCode,
      });

      const docsToUpload: Array<{ docType: string; file: File }> = [
        { docType: 'Kartu Keluarga', file: kkFile! },
        { docType: 'Akta Kelahiran', file: aktaFile! },
        ...extraDocs.filter(d => d.file).map(d => ({ docType: d.type, file: d.file! })),
      ];

      for (const { docType, file } of docsToUpload) {
        if (!file) continue;
        setMessage(`Mengunggah ${docType}…`);
        const { url } = await uploadUrl({
          registrationId: registration.id,
          docType,
          filename: file.name,
          contentType: file.type,
          size: file.size,
        });

        if (url) {
          const response = await fetch(url, {
            method: 'PUT',
            headers: { 'Content-Type': file.type },
            body: file,
          });
          if (!response.ok) throw new Error('Unggah file gagal.');
        }

        await record({
          registrationId: registration.id,
          docType,
          filename: file.name,
          contentType: file.type,
          size: file.size,
        });
      }

      await finalize({ registrationId: registration.id });
      setShowConfirmModal(false);
      setSuccessInfo({ id: registration.id, code: registration.code });
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : 'Pendaftaran gagal.';
      setMessage(errMsg);
      toast.error(errMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleResetForm = () => {
    setDob('');
    setForm({
      nik: '', fullName: '', bwfId: '', gender: 'pria',
      motherName: '', birthPlace: '', playingHand: 'kanan',
      club: '', nationality: 'WNI', phone: '',
      whatsapp: '', email: '', addressDetail: '', postalCode: '',
    });
    setProvince('');
    setRegency('');
    setKkFile(null);
    setAktaFile(null);
    setSuccessInfo(null);
    setMessage('');
  };

  const sidebarProps = {
    form,
    dob,
    provinceCode,
    regencyCode,
    districtCode,
    kkFile,
    aktaFile,
    calculatedAge,
  };

  const isFormComplete = Boolean(
    form.nik.trim().length >= 16 &&
    form.motherName.trim() &&
    form.birthPlace.trim() &&
    dob && !dobError &&
      kkFile &&
      aktaFile &&
      (!extraDocs.length || extraDocs.every(d => d.file !== null)) &&
      form.fullName.trim() &&
      form.club.trim() &&
      provinceCode &&
      regencyCode &&
      form.addressDetail.trim() &&
      form.whatsapp.trim()
  );

  return (
    <main className="min-h-dvh bg-background text-foreground pb-20 pt-10 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="mx-auto max-w-6xl space-y-8">
        
        {/* CLEAN EDITORIAL HEADER WITH LOGO */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-6">
          <div className="flex items-center gap-4">
            <img src="/logo-pb.png" alt="Logo PB UNDIP" className="h-12 w-auto object-contain shrink-0" />
            <div className="space-y-1">
              <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground text-balance">
                Pendaftaran Atlet Baru
              </h1>
              <p className="text-sm text-muted-foreground text-pretty max-w-xl">
                Lengkapi informasi identitas, domisili, dan berkas usia atlet bulutangkis untuk mendaftar di PB UNDIP.
              </p>
            </div>
          </div>
        </div>

        {/* SUCCESS STATE CARD */}
        <AnimatePresence>
          {successInfo ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="mx-auto max-w-xl rounded-[2rem] border border-border/80 bg-secondary/30 p-1.5 shadow-2xs"
            >
              <div className="rounded-[calc(2rem-0.375rem)] border border-border bg-card p-8 sm:p-10 text-center space-y-6 text-card-foreground">
                <motion.div
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
                  className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                >
                  <CheckCircle size={32} aria-hidden="true" />
                </motion.div>
                <div className="space-y-1.5">
                  <h2 className="font-display text-xl font-bold tracking-tight text-foreground">
                    Terima Kasih Sudah Mendaftar!
                  </h2>
                  <p className="text-xs text-muted-foreground text-pretty max-w-sm mx-auto leading-relaxed">
                    Data atlet telah tercatat dengan aman di sistem kami. Harap simpan Kode Pendaftaran di bawah ini untuk keperluan administratif.
                  </p>
                </div>

                <div className="rounded-2xl border border-border bg-secondary/50 p-5 flex flex-col justify-center text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                    Kode Pendaftaran
                  </span>
                  <span className="font-mono text-xl tracking-[0.2em] font-bold text-foreground mt-1 block tabular-nums">
                    {successInfo.code || successInfo.id}
                  </span>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => window.location.reload()}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-900 bg-slate-900 dark:border-slate-100 dark:bg-slate-100 px-6 py-3 text-xs font-bold text-white dark:text-slate-900 hover:opacity-90 transition-opacity shadow-sm"
                  >
                    <span>Selesai & Tutup</span>
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            /* 2-COLUMN ASYMMETRICAL LAYOUT */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
              
              {/* LEFT COLUMN: LIVE PROGRESS TRACKER */}
              <div className="lg:col-span-4 xl:col-span-4">
                <RegistrationSidebar {...sidebarProps} />
              </div>

              {/* RIGHT COLUMN: DOUBLE-BEZEL CLEAN FORM CANVAS */}
              <div className="lg:col-span-8 xl:col-span-8">
                <div className="rounded-[2rem] border border-border/80 bg-secondary/30 p-1.5 shadow-2xs">
                  <form onSubmit={handleInitialSubmit} className="rounded-[1.75rem] border border-border bg-card p-6 sm:p-10 text-card-foreground shadow-2xs">
                    <div className="grid grid-cols-1 gap-x-5 gap-y-7 sm:grid-cols-6">
                      
                      <div className="col-span-full">
                        <h3 className="text-2xl font-display font-bold text-foreground tracking-tight border-b border-border/60 pb-3 mb-2 flex items-center gap-2">
                          <User size={18} /> Identitas & Data Diri
                        </h3>
                      </div>

                      {/* NIK */}
                      <div className="col-span-full sm:col-span-3">
                        <Label htmlFor="nik" className="text-sm font-medium text-foreground">
                          NIK (Nomor Induk Kependudukan)
                          <span className="text-destructive">*</span>
                        </Label>
                        <Input id="nik" required minLength={16} maxLength={16} name="nik" placeholder="16 Digit NIK"
                          value={form.nik} onChange={(e) => set('nik', e.target.value.replace(/[^0-9]/g, ''))}
                          className="mt-2 tabular-nums"
                        />
                        {form.nik.length > 0 && form.nik.length < 16 && (
                          <p className="text-[11px] text-destructive font-medium mt-1.5 animate-in fade-in slide-in-from-top-1">
                            NIK harus 16 digit (kurang {16 - form.nik.length} digit)
                          </p>
                        )}
                      </div>

                      {/* Nama Lengkap */}
                      <div className="col-span-full sm:col-span-3">
                        <Label htmlFor="fullName" className="text-sm font-medium text-foreground">
                          Nama Lengkap Atlet
                          <span className="text-destructive">*</span>
                        </Label>
                        <Input id="fullName" required minLength={3} maxLength={100} name="fullName" placeholder="Contoh: Anthony Sinisuka Ginting"
                          value={form.fullName} onChange={(e) => set('fullName', e.target.value)}
                          className="mt-2"
                        />
                      </div>

                      {/* ID BWF */}
                      <div className="col-span-full sm:col-span-3">
                        <Label htmlFor="bwfId" className="text-sm font-medium text-foreground block">
                          ID BWF <span className="text-muted-foreground font-normal lowercase">(opsional)</span>
                        </Label>
                        <Input id="bwfId" name="bwfId" placeholder="Kosongkan jika tidak ada"
                          value={form.bwfId} onChange={(e) => set('bwfId', e.target.value)}
                          className="mt-2"
                        />
                        <p className="text-[11px] font-medium text-muted-foreground mt-1.5 leading-relaxed">
                          Pendaftar baru: kosongkan saja. Nanti di berkas akan ditulis strip (–).
                        </p>
                      </div>

                      {/* Klub */}
                      <div className="col-span-full sm:col-span-3">
                        <Label htmlFor="club" className="text-sm font-medium text-foreground">
                          Klub Asal / Mutasi
                          <span className="text-destructive">*</span>
                        </Label>
                        <Input id="club" required minLength={2} maxLength={100} name="club" placeholder="Contoh: PB UNDIP"
                          value={form.club} onChange={(e) => set('club', e.target.value)}
                          className="mt-2"
                        />
                        <p className="text-[11px] font-medium text-muted-foreground mt-1.5 leading-relaxed">
                          Pendaftar baru cukup tulis nama klub saat ini, misal <span className="font-bold">PB UNDIP</span>.
                        </p>
                      </div>

                      {/* Jenis Kelamin & Main Tangan */}
                      <div className="col-span-full sm:col-span-3 space-y-2">
                        <Label className="text-sm font-medium text-foreground">
                          Jenis Kelamin<span className="text-destructive">*</span>
                        </Label>
                        <div className="grid grid-cols-2 gap-2" role="radiogroup">
                          {(['pria', 'wanita'] as const).map((g) => {
                            const isSelected = form.gender === g;
                            return (
                              <Button key={g} type="button" variant={isSelected ? 'default' : 'outline'} onClick={() => set('gender', g)} className="uppercase text-xs font-bold w-full transition-transform active:scale-95">
                                {g === 'pria' ? 'Laki-laki' : 'Perempuan'}
                              </Button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="col-span-full sm:col-span-3 space-y-2">
                        <Label className="text-sm font-medium text-foreground">
                          Main Tangan<span className="text-destructive">*</span>
                        </Label>
                        <div className="grid grid-cols-2 gap-2" role="radiogroup">
                          {['kanan', 'kiri'].map((h) => {
                            const isSelected = form.playingHand === h;
                            return (
                              <Button key={h} type="button" variant={isSelected ? 'default' : 'outline'} onClick={() => set('playingHand', h)} className="uppercase text-xs font-bold w-full transition-transform active:scale-95">
                                {h}
                              </Button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Ibu Kandung */}
                      <div className="col-span-full sm:col-span-3">
                        <Label htmlFor="motherName" className="text-sm font-medium text-foreground">
                          Ibu Kandung<span className="text-destructive">*</span>
                        </Label>
                        <Input id="motherName" required name="motherName" placeholder="Nama Ibu Kandung"
                          value={form.motherName} onChange={(e) => set('motherName', e.target.value)}
                          className="mt-2"
                        />
                      </div>

                      {/* Tempat Lahir */}
                      <div className="col-span-full sm:col-span-3">
                        <Label htmlFor="birthPlace" className="text-sm font-medium text-foreground">
                          Tempat Lahir<span className="text-destructive">*</span>
                        </Label>
                        <Input id="birthPlace" required name="birthPlace" placeholder="Kota Kelahiran"
                          value={form.birthPlace} onChange={(e) => set('birthPlace', e.target.value)}
                          className="mt-2"
                        />
                      </div>

                      {/* Tanggal Lahir */}
                      <div className="col-span-full sm:col-span-3">
                        <CustomDatePicker value={dob} onChange={setDob} />
                        {dobError && <p className="text-[11px] text-destructive font-medium mt-1">{dobError}</p>}
                      </div>

                      {/* Kewarganegaraan */}
                      <div className="col-span-full sm:col-span-3">
                        <CustomSelect
                          label="Kewarganegaraan"
                          placeholder="Pilih Kewarganegaraan"
                          items={[
                            { code: 'WNI', name: 'WNI (Warga Negara Indonesia)' },
                            { code: 'WNA', name: 'WNA (Warga Negara Asing)' },
                          ]}
                          value={form.nationality}
                          disabled={false}
                          onChange={(val) => set('nationality', val)}
                        />
                      </div>

                      {/* SECTION 2 */}
                      <div className="col-span-full mt-4">
                        <h3 className="text-2xl font-display font-bold text-foreground tracking-tight border-b border-border/60 pb-3 mb-2 flex items-center gap-2">
                          <MapPin size={18} /> Wilayah Domisili & Kontak
                        </h3>
                      </div>

                      <div className="col-span-full">
                        <Label htmlFor="addressDetail" className="text-sm font-medium text-foreground">Alamat</Label>
                        <Textarea id="addressDetail" name="addressDetail" placeholder="Alamat lengkap"
                          value={form.addressDetail} onChange={(e) => set('addressDetail', e.target.value)}
                          className="mt-2 min-h-[100px] resize-y"
                        />
                      </div>

                      <div className="col-span-full sm:col-span-3">
                        <CustomSelect label="Provinsi" placeholder="PILIH" items={provinces} value={provinceCode}
                          disabled={!provinces?.length} isLoading={provinces === undefined}
                          onChange={(val) => { setProvince(val); setRegency(''); }}
                        />
                      </div>

                      <div className="col-span-full sm:col-span-3">
                        <CustomSelect label="Kabupaten/Kota" placeholder="- PILIH -" items={regencies} value={regencyCode}
                          disabled={!provinceCode} isLoading={provinceCode !== '' && regencies === undefined}
                          onChange={(val) => { 
                            setRegency(val); 
                            setDistrict('');
                          }}
                        />
                      </div>

                      <div className="col-span-full sm:col-span-4">
                        <CustomSelect label="Kecamatan" placeholder="- PILIH -" items={districts} value={districtCode}
                          disabled={!regencyCode} isLoading={regencyCode !== '' && districts === undefined}
                          onChange={(val) => { 
                            setDistrict(val); 
                            const selected = districts?.find((r: Region) => r.code === val);
                            if (selected?.postalCode) {
                              set('postalCode', selected.postalCode);
                            }
                          }}
                        />
                      </div>

                      <div className="col-span-full sm:col-span-2">
                        <Label htmlFor="postalCode" className="text-sm font-medium text-foreground">Kode Pos</Label>
                        <Input id="postalCode" name="postalCode" placeholder="Kode Pos"
                          value={form.postalCode} onChange={(e) => set('postalCode', e.target.value.replace(/[^0-9]/g, ''))}
                          className="mt-2 tabular-nums"
                        />
                      </div>

                      <div className="col-span-full sm:col-span-3">
                        <Label htmlFor="phone" className="text-sm font-medium text-foreground">Telepon</Label>
                        <Input id="phone" type="tel" name="phone" placeholder="Nomor Telepon Rumah/Kantor"
                          value={form.phone} onChange={(e) => set('phone', e.target.value.replace(/[^0-9]/g, ''))}
                          className="mt-2 tabular-nums"
                        />
                      </div>

                      <div className="col-span-full sm:col-span-3">
                        <Label htmlFor="whatsapp" className="text-sm font-medium text-foreground">
                          Handphone (WA)<span className="text-destructive">*</span>
                        </Label>
                        <Input id="whatsapp" required type="tel" name="whatsapp" placeholder="Contoh: 081234567890"
                          value={form.whatsapp} onChange={(e) => set('whatsapp', e.target.value.replace(/[^0-9]/g, ''))}
                          className="mt-2 tabular-nums"
                        />
                      </div>

                      <div className="col-span-full">
                        <Label htmlFor="email" className="text-sm font-medium text-foreground">Email</Label>
                        <Input id="email" type="email" name="email" placeholder="Contoh: atlet@domain.com"
                          value={form.email} onChange={(e) => set('email', e.target.value)}
                          className="mt-2"
                        />
                      </div>

                      {/* SECTION 3 */}
                      <div className="col-span-full mt-4">
                        <h3 className="text-2xl font-display font-bold text-foreground tracking-tight border-b border-border/60 pb-3 mb-2 flex items-center gap-2">
                          <FileText size={18} /> Unggah Dokumen Pendukung
                        </h3>
                      </div>

                      <div className="col-span-full sm:col-span-3">
                        <FileUploader
                          label="Scan / Foto Kartu Keluarga"
                          accept="image/jpeg,image/png,image/webp,application/pdf"
                          file={kkFile}
                          kind="identity"
                          onFileSelect={setKkFile}
                          hint="Format PDF / JPG / PNG, Maks 5 MB"
                        />
                      </div>

                      <div className="col-span-full sm:col-span-3">
                        <FileUploader
                          label="Scan / Foto Akta Kelahiran"
                          accept="image/jpeg,image/png,image/webp,application/pdf"
                          file={aktaFile}
                          kind="identity"
                          onFileSelect={setAktaFile}
                          hint="Format PDF / JPG / PNG, Maks 5 MB"
                        />
                      </div>

                      {extraDocs.length > 0 && (
                        <div className="col-span-full space-y-6 pt-4 border-t border-border/80">
                          {extraDocs.map((doc) => (
                            <div key={doc.id} className="relative space-y-4 p-4 rounded-2xl border border-border bg-secondary/20">
                              <button
                                type="button"
                                onClick={() => setExtraDocs(extraDocs.filter(d => d.id !== doc.id))}
                                className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-destructive/10 text-destructive hover:bg-destructive/20 flex items-center justify-center transition-colors shadow-sm"
                                title="Hapus dokumen ini"
                              >
                                ✕
                              </button>
                              <div className="w-full sm:w-1/2">
                                <CustomSelect
                                  label="Jenis Dokumen Tambahan"
                                  placeholder="Pilih Jenis Dokumen"
                                  items={IDENTITY_DOC_TYPES.map((t) => ({ code: t, name: t }))}
                                  value={doc.type}
                                  disabled={false}
                                  required={false}
                                  onChange={(val) => setExtraDocs(extraDocs.map(d => d.id === doc.id ? { ...d, type: val } : d))}
                                />
                              </div>
                              <FileUploader
                                label={`Unggah File ${doc.type === 'Mutasi' ? 'Surat Mutasi' : doc.type}`}
                                accept="image/jpeg,image/png,image/webp,application/pdf"
                                file={doc.file}
                                kind="identity"
                                onFileSelect={(f) => setExtraDocs(extraDocs.map(d => d.id === doc.id ? { ...d, file: f } : d))}
                                hint="Format PDF / JPG / PNG, Maks 5 MB"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <div className="col-span-full pt-2">
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => setExtraDocs([...extraDocs, { id: Math.random().toString(36).substring(7), type: IDENTITY_DOC_TYPES[1], file: null }])}
                          className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 gap-1.5 px-0"
                        >
                          <PlusCircle size={18} />
                          Tambah Dokumen Lain (Opsional)
                        </Button>
                      </div>

                    </div>

                    <Separator className="my-8" />

                    <div className="flex flex-col sm:flex-row items-center justify-end gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleResetForm}
                        className="w-full sm:w-auto min-w-[120px]"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={!isFormComplete}
                        className="w-full sm:w-auto min-w-[200px] transition-transform active:scale-95"
                      >
                        <Award size={16} aria-hidden="true" />
                        Tinjau & Kirim
                      </Button>
                    </div>
                    
                    {!isFormComplete && (
                      <p className="mt-3 text-right text-[11px] text-muted-foreground font-medium">
                        Lengkapi seluruh field wajib (<span className="text-destructive font-bold">*</span>) untuk melanjutkan.
                      </p>
                    )}

                    {message && !showConfirmModal && (
                      <div className="mt-6 flex items-center gap-2.5 rounded-md border border-destructive/40 bg-destructive/10 p-3.5 text-xs font-semibold text-destructive">
                        <AlertCircle size={16} className="shrink-0" aria-hidden="true" />
                        <p>{message}</p>
                      </div>
                    )}
                  </form>
                </div>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* CONFIRMATION MODAL */}
      <RegistrationSummaryModal
        isOpen={showConfirmModal}
        saving={saving}
        form={form}
        calculatedAge={calculatedAge}
        selectedProvince={selectedProvince}
        selectedRegency={selectedRegency}
        onClose={() => setShowConfirmModal(false)}
        onSubmit={confirmAndSubmit}
      />
    </main>
  );
}
