'use client';

import React, { useState } from 'react';
import { useAction, useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import {
  ageCategory,
  normalizeWhatsApp,
  type AgeCategory,
} from '@/lib/pb-registration-validation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Location,
  FileText,
  AlertCircle,
  CheckCircle,
  AddCircle,
  Award,
} from 'reicon-react';

// Modular Components
import RegistrationSidebar from './_components/RegistrationSidebar';
import CustomSelect, { type Region } from './_components/CustomSelect';
import CustomDatePicker from './_components/CustomDatePicker';
import FileUploader from './_components/FileUploader';
import RegistrationSummaryModal from './_components/RegistrationSummaryModal';

export default function PendaftaranPBPage() {
  const [dob, setDob] = useState('');
  const [form, setForm] = useState({
    gender: 'putra',
    fullName: '',
    club: '',
    whatsapp: '',
    email: '',
    addressDetail: '',
  });
  const [provinceCode, setProvince] = useState('');
  const [regencyCode, setRegency] = useState('');
  const [districtCode, setDistrict] = useState('');
  const [villageCode, setVillage] = useState('');
  const [profile, setProfile] = useState<File | null>(null);
  const [identity, setIdentity] = useState<File | null>(null);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [successInfo, setSuccessInfo] = useState<{ id: string; category: string } | null>(null);

  const provinces = useQuery(api.regions.children, {});
  const regencies = useQuery(
    api.regions.children,
    provinceCode ? { parentCode: provinceCode } : 'skip'
  );
  const districts = useQuery(
    api.regions.children,
    regencyCode ? { parentCode: regencyCode } : 'skip'
  );
  const villages = useQuery(
    api.regions.children,
    districtCode ? { parentCode: districtCode } : 'skip'
  );

  const create = useMutation(api.pbRegistration.create);
  const record = useMutation(api.pbRegistration.recordFile);
  const finalize = useMutation(api.pbRegistration.finalize);
  const uploadUrl = useAction(api.pbRegistration.uploadUrl);

  let category: AgeCategory | null = null;
  let categoryLabel = '';
  let calculatedAge: number | null = null;

  try {
    if (dob) {
      category = ageCategory(dob);
      const bornYear = new Date(dob).getFullYear();
      const currentYear = new Date().getFullYear();
      calculatedAge = currentYear - bornYear;

      if (category === 'anak') categoryLabel = 'Kategori Anak (< 15 Tahun)';
      else if (category === 'taruna') categoryLabel = 'Kategori Taruna (15 - 17 Tahun)';
      else if (category === 'dewasa') categoryLabel = 'Kategori Dewasa (≥ 18 Tahun)';
    }
  } catch {}

  const selectedProvince = provinces?.find((p: Region) => p.code === provinceCode);
  const selectedRegency = regencies?.find((r: Region) => r.code === regencyCode);
  const selectedDistrict = districts?.find((d: Region) => d.code === districtCode);
  const selectedVillage = villages?.find((v: Region) => v.code === villageCode);

  const set = (name: keyof typeof form, value: string) =>
    setForm((current) => ({ ...current, [name]: value }));

  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!category) return setMessage('Harap isi tanggal lahir atlet dengan benar.');

    try {
      normalizeWhatsApp(form.whatsapp);
    } catch {
      return setMessage('Nomor WhatsApp harus nomor Indonesia yang aktif (contoh: 081234567890).');
    }

    if (!profile || !identity)
      return setMessage('Pas foto dan dokumen identitas wajib diunggah.');

    setMessage('');
    setShowConfirmModal(true);
  };

  const confirmAndSubmit = async () => {
    if (!category || !profile || !identity) return;

    try {
      setSaving(true);
      setMessage('Sedang memproses pendaftaran atlet…');

      const registration = await create({
        ...form,
        dob,
        gender: form.gender as 'putra' | 'putri',
        email: form.email || undefined,
        provinceCode,
        regencyCode,
        districtCode,
        villageCode,
      });

      for (const [docType, file] of [
        ['foto_profil', profile],
        ['dokumen_identitas', identity],
      ] as const) {
        setMessage(`Mengunggah ${docType === 'foto_profil' ? 'pas foto' : 'dokumen identitas'}…`);
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
      setSuccessInfo({ id: registration.id, category: registration.category });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Pendaftaran gagal.');
    } finally {
      setSaving(false);
    }
  };

  const handleResetForm = () => {
    setDob('');
    setForm({
      gender: 'putra',
      fullName: '',
      club: '',
      whatsapp: '',
      email: '',
      addressDetail: '',
    });
    setProvince('');
    setRegency('');
    setDistrict('');
    setVillage('');
    setProfile(null);
    setIdentity(null);
    setSuccessInfo(null);
    setMessage('');
  };

  const sidebarProps = {
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
  };

  const isFormComplete = Boolean(
    category &&
      profile &&
      identity &&
      form.fullName.trim() &&
      form.club.trim() &&
      provinceCode &&
      regencyCode &&
      districtCode &&
      villageCode &&
      form.addressDetail.trim() &&
      form.whatsapp.trim()
  );

  return (
    <main className="min-h-dvh bg-background text-foreground pb-20 pt-10 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="mx-auto max-w-6xl space-y-8">
        
        {/* CLEAN EDITORIAL HEADER WITH LOGO */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-6">
          <div className="flex items-center gap-4">
            <img src="/logo-pb.png" alt="Logo PB Undip" className="h-12 w-auto object-contain shrink-0" />
            <div className="space-y-1">
              <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground text-balance">
                Pendaftaran Atlet Baru
              </h1>
              <p className="text-sm text-muted-foreground text-pretty max-w-xl">
                Lengkapi informasi identitas, domisili, dan berkas usia atlet bulutangkis untuk mendaftar di PB Undip.
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
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle size={32} aria-hidden="true" />
                </div>
                <div className="space-y-1.5">
                  <h2 className="font-display text-xl font-bold tracking-tight text-foreground">
                    Pendaftaran Berhasil Disimpan
                  </h2>
                  <p className="text-xs text-muted-foreground text-pretty max-w-sm mx-auto leading-relaxed">
                    Data atlet telah tercatat dengan baik. Harap simpan atau catat ID Pendaftaran di bawah ini.
                  </p>
                </div>

                <div className="rounded-2xl border border-border bg-secondary/50 p-5 grid grid-cols-2 gap-4 text-left">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                      ID Pendaftaran
                    </span>
                    <span className="font-mono text-sm font-bold text-foreground mt-0.5 block tabular-nums">
                      {successInfo.id}
                    </span>
                  </div>
                  <div className="border-l border-border pl-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                      Kategori Usia
                    </span>
                    <span className="font-extrabold text-amber-700 dark:text-amber-400 text-sm mt-0.5 block uppercase">
                      {successInfo.category}
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleResetForm}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-900 bg-slate-900 dark:border-slate-100 dark:bg-slate-100 px-6 py-3 text-xs font-bold text-white dark:text-slate-900 hover:opacity-90 transition-opacity shadow-sm"
                  >
                    <AddCircle size={16} aria-hidden="true" />
                    <span>Daftarkan Atlet Lainnya</span>
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
                  <form
                    onSubmit={handleInitialSubmit}
                    className="rounded-[calc(2rem-0.375rem)] border border-border bg-card p-6 sm:p-10 space-y-10 text-card-foreground shadow-2xs"
                  >
                    {/* SECTION 1: DATA DIRI ATLET */}
                    <div className="space-y-5">
                      <div className="flex items-center gap-3 border-b border-border/60 pb-4">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border bg-secondary text-foreground">
                          <User size={18} aria-hidden="true" />
                        </div>
                        <div>
                          <h2 className="font-display text-base font-bold text-foreground tracking-tight">
                            1. Identitas & Data Diri
                          </h2>
                          <p className="text-xs text-muted-foreground">Tuliskan nama, tanggal lahir, dan asal klub atlet.</p>
                        </div>
                      </div>

                      <div className="grid gap-5 sm:grid-cols-2">
                        <div className="sm:col-span-2 space-y-1.5">
                          <label
                            htmlFor="fullName"
                            className="text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1"
                          >
                            <span>Nama Lengkap Atlet</span>
                            <span className="text-destructive font-bold">*</span>
                          </label>
                          <input
                            id="fullName"
                            required
                            minLength={3}
                            maxLength={100}
                            name="fullName"
                            autoComplete="name"
                            placeholder="Contoh: Anthony Sinisuka Ginting"
                            value={form.fullName}
                            onChange={(e) => set('fullName', e.target.value)}
                            className={`w-full min-h-[46px] rounded-xl border px-3.5 py-2.5 text-sm transition-all outline-none shadow-2xs ${
                              form.fullName.trim().length > 0
                                ? 'border-emerald-500/80 bg-emerald-50/20 text-slate-900 font-medium dark:border-emerald-500/60 dark:bg-emerald-950/20 dark:text-white'
                                : 'border-slate-300 bg-white text-slate-900 font-medium placeholder:text-slate-400 placeholder:font-normal hover:border-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 dark:hover:border-slate-600 dark:focus:border-emerald-500'
                            }`}
                          />
                          <p className="text-[11px] text-muted-foreground font-medium">
                            Tuliskan nama lengkap tanpa singkatan.
                          </p>
                        </div>

                        <CustomDatePicker value={dob} onChange={setDob} />

                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1">
                            <span>Jenis Kelamin</span>
                            <span className="text-destructive font-bold">*</span>
                          </label>
                          <div className="grid grid-cols-2 gap-2.5" role="radiogroup" aria-label="Jenis kelamin">
                            {['putra', 'putri'].map((g) => {
                              const isSelected = form.gender === g;
                              return (
                                <button
                                  key={g}
                                  type="button"
                                  role="radio"
                                  aria-checked={isSelected}
                                  onClick={() => set('gender', g)}
                                  className={`min-h-[46px] rounded-xl border py-2.5 text-xs font-bold uppercase tracking-wider transition-all focus:outline-none focus:ring-4 focus:ring-emerald-500/20 active:scale-95 shadow-2xs ${
                                    isSelected
                                      ? 'border-slate-900 bg-slate-900 text-white dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900 shadow-sm ring-1 ring-slate-900/10'
                                      : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-400 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-slate-800'
                                  }`}
                                >
                                  {g}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div className="space-y-1.5 sm:col-span-2">
                          <label
                            htmlFor="club"
                            className="text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1"
                          >
                            <span>Klub / Asal PB Bulutangkis</span>
                            <span className="text-destructive font-bold">*</span>
                          </label>
                          <input
                            id="club"
                            required
                            minLength={2}
                            maxLength={100}
                            name="club"
                            autoComplete="off"
                            placeholder="Contoh: PB Djarum Kudus / PB Jaya Raya"
                            value={form.club}
                            onChange={(e) => set('club', e.target.value)}
                            className={`w-full min-h-[46px] rounded-xl border px-3.5 py-2.5 text-sm transition-all outline-none shadow-2xs ${
                              form.club.trim().length > 0
                                ? 'border-emerald-500/80 bg-emerald-50/20 text-slate-900 font-medium dark:border-emerald-500/60 dark:bg-emerald-950/20 dark:text-white'
                                : 'border-slate-300 bg-white text-slate-900 font-medium placeholder:text-slate-400 placeholder:font-normal hover:border-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 dark:hover:border-slate-600 dark:focus:border-emerald-500'
                            }`}
                          />
                        </div>
                      </div>
                    </div>

                    {/* SECTION 2: ALAMAT & DOMISILI */}
                    <div className="space-y-5">
                      <div className="flex items-center gap-3 border-b border-border/60 pb-4">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border bg-secondary text-foreground">
                          <Location size={18} aria-hidden="true" />
                        </div>
                        <div>
                          <h2 className="font-display text-base font-bold text-foreground tracking-tight">
                            2. Wilayah Domisili & Kontak
                          </h2>
                          <p className="text-xs text-muted-foreground">Pilih alamat tempat tinggal dan nomor WhatsApp yang aktif.</p>
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <CustomSelect
                          label="Provinsi"
                          placeholder="Pilih Provinsi"
                          items={provinces}
                          value={provinceCode}
                          disabled={!provinces?.length}
                          isLoading={provinces === undefined}
                          onChange={(val) => {
                            setProvince(val);
                            setRegency('');
                            setDistrict('');
                            setVillage('');
                          }}
                        />

                        <CustomSelect
                          label="Kabupaten/Kota"
                          placeholder="Pilih Kabupaten/Kota"
                          items={regencies}
                          value={regencyCode}
                          disabled={!provinceCode}
                          isLoading={provinceCode !== '' && regencies === undefined}
                          onChange={(val) => {
                            setRegency(val);
                            setDistrict('');
                            setVillage('');
                          }}
                        />

                        <CustomSelect
                          label="Kecamatan"
                          placeholder="Pilih Kecamatan"
                          items={districts}
                          value={districtCode}
                          disabled={!regencyCode}
                          isLoading={regencyCode !== '' && districts === undefined}
                          onChange={(val) => {
                            setDistrict(val);
                            setVillage('');
                          }}
                        />

                        <CustomSelect
                          label="Desa/Kelurahan"
                          placeholder="Pilih Desa/Kelurahan"
                          items={villages}
                          value={villageCode}
                          disabled={!districtCode}
                          isLoading={districtCode !== '' && villages === undefined}
                          onChange={setVillage}
                        />
                      </div>

                      <div className="grid gap-4 sm:grid-cols-3">
                        <div>
                          <label
                            htmlFor="postalCode"
                            className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1.5"
                          >
                            Kode Pos
                          </label>
                          <input
                            id="postalCode"
                            readOnly
                            value={selectedVillage?.postalCode || ''}
                            placeholder="Otomatis"
                            className="w-full min-h-[46px] rounded-xl border border-slate-200 bg-slate-100/80 px-3.5 py-2.5 text-sm font-mono font-medium text-slate-600 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-400 outline-none cursor-not-allowed tabular-nums"
                          />
                        </div>
                        <div className="sm:col-span-2 space-y-1.5">
                          <label
                            htmlFor="addressDetail"
                            className="text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1"
                          >
                            <span>Detail Alamat (Jalan, RT/RW, No. Rumah)</span>
                            <span className="text-destructive font-bold">*</span>
                          </label>
                          <input
                            id="addressDetail"
                            required
                            minLength={5}
                            maxLength={300}
                            name="addressDetail"
                            autoComplete="street-address"
                            placeholder="Contoh: Jl. Pemuda No. 45, RT 02/RW 03"
                            value={form.addressDetail}
                            onChange={(e) => set('addressDetail', e.target.value)}
                            className={`w-full min-h-[46px] rounded-xl border px-3.5 py-2.5 text-sm transition-all outline-none shadow-2xs ${
                              form.addressDetail.trim().length > 0
                                ? 'border-emerald-500/80 bg-emerald-50/20 text-slate-900 font-medium dark:border-emerald-500/60 dark:bg-emerald-950/20 dark:text-white'
                                : 'border-slate-300 bg-white text-slate-900 font-medium placeholder:text-slate-400 placeholder:font-normal hover:border-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 dark:hover:border-slate-600 dark:focus:border-emerald-500'
                            }`}
                          />
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1.5">
                          <label
                            htmlFor="whatsapp"
                            className="text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1"
                          >
                            <span>No. WhatsApp Aktif</span>
                            <span className="text-destructive font-bold">*</span>
                          </label>
                          <input
                            id="whatsapp"
                            required
                            type="tel"
                            name="whatsapp"
                            autoComplete="tel"
                            placeholder="Contoh: 081234567890"
                            value={form.whatsapp}
                            onChange={(e) => set('whatsapp', e.target.value)}
                            className={`w-full min-h-[46px] rounded-xl border px-3.5 py-2.5 text-sm font-mono transition-all outline-none shadow-2xs tabular-nums ${
                              form.whatsapp.trim().length > 0
                                ? 'border-emerald-500/80 bg-emerald-50/20 text-slate-900 font-medium dark:border-emerald-500/60 dark:bg-emerald-950/20 dark:text-white'
                                : 'border-slate-300 bg-white text-slate-900 font-medium placeholder:text-slate-400 placeholder:font-sans placeholder:font-normal hover:border-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 dark:hover:border-slate-600 dark:focus:border-emerald-500'
                            }`}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label
                            htmlFor="email"
                            className="text-xs font-semibold text-slate-700 dark:text-slate-200 block"
                          >
                            Email <span className="text-muted-foreground font-normal lowercase">(opsional)</span>
                          </label>
                          <input
                            id="email"
                            type="email"
                            name="email"
                            autoComplete="email"
                            spellCheck={false}
                            placeholder="Contoh: atlet@domain.com"
                            value={form.email}
                            onChange={(e) => set('email', e.target.value)}
                            className={`w-full min-h-[46px] rounded-xl border px-3.5 py-2.5 text-sm transition-all outline-none shadow-2xs ${
                              form.email.trim().length > 0
                                ? 'border-emerald-500/80 bg-emerald-50/20 text-slate-900 font-medium dark:border-emerald-500/60 dark:bg-emerald-950/20 dark:text-white'
                                : 'border-slate-300 bg-white text-slate-900 font-medium placeholder:text-slate-400 placeholder:font-normal hover:border-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 dark:hover:border-slate-600 dark:focus:border-emerald-500'
                            }`}
                          />
                        </div>
                      </div>
                    </div>

                    {/* SECTION 3: UNGGAH BERKAS */}
                    <div className="space-y-5">
                      <div className="flex items-center gap-3 border-b border-border/60 pb-4">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border bg-secondary text-foreground">
                          <FileText size={18} aria-hidden="true" />
                        </div>
                        <div>
                          <h2 className="font-display text-base font-bold text-foreground tracking-tight">
                            3. Unggah Dokumen Pendukung
                          </h2>
                          <p className="text-xs text-muted-foreground">Unggah foto dan bukti identitas atlet.</p>
                        </div>
                      </div>

                      <div className="grid gap-6 sm:grid-cols-2">
                        <FileUploader
                          label="Pas Foto Terbaru"
                          accept="image/jpeg,image/png,image/webp"
                          file={profile}
                          kind="photo"
                          onFileSelect={setProfile}
                          hint="Format JPG / PNG / WEBP, Maksimal 2 MB"
                        />

                        <FileUploader
                          label={
                            category === 'anak'
                              ? 'Bukti Usia (KK / Akta Kelahiran)'
                              : category === 'taruna'
                              ? 'Bukti Usia (Kartu Pelajar / KK / Akta)'
                              : category === 'dewasa'
                              ? 'Bukti Usia (KTP / SIM)'
                              : 'Dokumen Bukti Usia'
                          }
                          accept="image/jpeg,image/png,image/webp,application/pdf"
                          file={identity}
                          kind="identity"
                          onFileSelect={setIdentity}
                          hint="Format JPG / PNG / WEBP / PDF, Maksimal 2 MB"
                        />
                      </div>
                    </div>

                    {/* SUBMIT BUTTON WITH DIPONEGORO SLATE/NAVY TRUST AUTHORITY */}
                    <div className="pt-6 border-t border-border/80">
                      <button
                        type="submit"
                        disabled={!isFormComplete}
                        className="group flex min-h-[52px] w-full items-center justify-center gap-2.5 rounded-xl border border-slate-900 bg-slate-900 dark:border-slate-100 dark:bg-slate-100 px-6 py-3.5 font-bold text-white dark:text-slate-900 text-xs uppercase tracking-wider transition-all duration-200 hover:opacity-90 active:scale-[0.99] focus:outline-none focus:ring-4 focus:ring-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:opacity-40 shadow-md shadow-slate-900/10"
                      >
                        <Award size={16} aria-hidden="true" />
                        <span>Tinjau & Kirim Pendaftaran</span>
                      </button>
                      {!isFormComplete && (
                        <p className="mt-3 text-center text-[11px] text-muted-foreground font-medium">
                          Lengkapi seluruh field wajib (<span className="text-destructive font-bold">*</span>) untuk melanjutkan.
                        </p>
                      )}
                    </div>

                    {message && !showConfirmModal && (
                      <div className="flex items-center gap-2.5 rounded-xl border border-destructive/40 bg-destructive/10 p-3.5 text-xs font-semibold text-destructive" aria-live="polite">
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
        category={category}
        calculatedAge={calculatedAge}
        selectedProvince={selectedProvince}
        selectedRegency={selectedRegency}
        selectedDistrict={selectedDistrict}
        selectedVillage={selectedVillage}
        onClose={() => setShowConfirmModal(false)}
        onSubmit={confirmAndSubmit}
      />
    </main>
  );
}
