'use client';

import { useState, useRef, useEffect } from 'react';
import { useAction, useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import {
  ageCategory,
  documentRule,
  todayIso,
  validateFile,
  type AgeCategory,
} from '@/lib/pb-registration-validation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  MapPin,
  FileText,
  Upload,
  X,
  Check,
  AlertCircle,
  ShieldCheck,
  Calendar as CalendarIcon,
  FileCheck,
  ArrowRight,
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Info,
} from 'lucide-react';

type Region = { code: string; name: string; postalCode?: string };

const MONTH_NAMES = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

// --- CUSTOM SEARCHABLE SELECT DROPDOWN (NO OS NATIVE SELECT ARTIFACTS) ---
function CustomSelect({
  label,
  placeholder,
  items,
  value,
  disabled,
  onChange,
}: {
  label: string;
  placeholder: string;
  items?: Region[];
  value: string;
  disabled: boolean;
  onChange: (value: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedItem = items?.find((item) => item.code === value);

  const filteredItems = items?.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="space-y-1.5" ref={containerRef}>
      <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
        {label} <span className="text-blue-600">*</span>
      </label>
      <div className="relative">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen(!isOpen)}
          className={`flex w-full items-center justify-between rounded-xl border bg-slate-50 px-4 py-3.5 text-left text-sm font-medium text-slate-900 transition-colors focus:border-slate-900 focus:bg-white focus:outline-none disabled:cursor-not-allowed disabled:opacity-40 ${
            isOpen ? 'border-slate-900 ring-2 ring-slate-900/10' : 'border-slate-300'
          }`}
        >
          <span className={selectedItem ? 'text-slate-900 font-semibold' : 'text-slate-400'}>
            {selectedItem ? selectedItem.name : placeholder}
          </span>
          <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {isOpen && !disabled && (
            <motion.div
              initial={{ opacity: 0, y: 4, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className="absolute left-0 top-full z-50 mt-1.5 w-full rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl shadow-slate-900/10"
            >
              {/* Search Bar inside Select */}
              <div className="relative mb-2 px-1">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder={`Cari ${label.toLowerCase()}...`}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs text-slate-900 outline-none focus:border-slate-900 focus:bg-white"
                />
              </div>

              {/* Items List */}
              <div className="max-h-56 overflow-y-auto rounded-lg">
                {filteredItems && filteredItems.length > 0 ? (
                  filteredItems.map((item) => (
                    <button
                      key={item.code}
                      type="button"
                      onClick={() => {
                        onChange(item.code);
                        setIsOpen(false);
                        setSearch('');
                      }}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-xs text-left transition-colors ${
                        item.code === value
                          ? 'bg-slate-900 font-bold text-white'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span>{item.name}</span>
                      {item.code === value && <Check className="h-3.5 w-3.5 text-white" />}
                    </button>
                  ))
                ) : (
                  <div className="py-4 text-center text-xs text-slate-400">
                    Tidak ditemukan {label.toLowerCase()}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// --- CUSTOM HIGH-END OFF-WHITE DATE PICKER (NO NATIVE OS DATEPICKER POPUP) ---
function CustomDatePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (dob: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Selected date state
  const currentDate = value ? new Date(value) : new Date(2010, 0, 1);
  const [viewYear, setViewYear] = useState(currentDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(currentDate.getMonth());

  useEffect(() => {
    if (value) {
      const d = new Date(value);
      setViewYear(d.getFullYear());
      setViewMonth(d.getMonth());
    }
  }, [value]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();

  const handleSelectDay = (day: number) => {
    const monthStr = String(viewMonth + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const formatted = `${viewYear}-${monthStr}-${dayStr}`;
    onChange(formatted);
    setIsOpen(false);
  };

  const formattedDisplay = value
    ? `${new Date(value).getDate()} ${MONTH_NAMES[new Date(value).getMonth()]} ${new Date(value).getFullYear()}`
    : '';

  // Years options from 1970 to current year
  const years = Array.from(
    { length: new Date().getFullYear() - 1970 + 1 },
    (_, i) => new Date().getFullYear() - i
  );

  return (
    <div className="space-y-1.5" ref={containerRef}>
      <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
        Tanggal Lahir <span className="text-blue-600">*</span>
      </label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`flex w-full items-center justify-between rounded-xl border bg-slate-50 px-4 py-3.5 text-left text-sm font-medium text-slate-900 transition-colors focus:border-slate-900 focus:bg-white focus:outline-none ${
            isOpen ? 'border-slate-900 ring-2 ring-slate-900/10' : 'border-slate-300'
          }`}
        >
          <span className={formattedDisplay ? 'font-semibold text-slate-900' : 'text-slate-400'}>
            {formattedDisplay || 'Pilih Tanggal Lahir Atlet'}
          </span>
          <CalendarIcon className="h-4 w-4 text-slate-500" />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 4, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className="absolute left-0 top-full z-50 mt-1.5 w-72 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl shadow-slate-900/10"
            >
              {/* Year & Month Select Header */}
              <div className="mb-3 flex items-center justify-between gap-1">
                <div className="flex items-center gap-1">
                  <select
                    value={viewMonth}
                    onChange={(e) => setViewMonth(Number(e.target.value))}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-bold text-slate-900 outline-none"
                  >
                    {MONTH_NAMES.map((m, i) => (
                      <option key={m} value={i}>
                        {m}
                      </option>
                    ))}
                  </select>

                  <select
                    value={viewYear}
                    onChange={(e) => setViewYear(Number(e.target.value))}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-bold text-slate-900 outline-none"
                  >
                    {years.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      if (viewMonth === 0) {
                        setViewMonth(11);
                        setViewYear(viewYear - 1);
                      } else setViewMonth(viewMonth - 1);
                    }}
                    className="rounded-md bg-slate-100 p-1 text-slate-600 hover:bg-slate-200"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (viewMonth === 11) {
                        setViewMonth(0);
                        setViewYear(viewYear + 1);
                      } else setViewMonth(viewMonth + 1);
                    }}
                    className="rounded-md bg-slate-100 p-1 text-slate-600 hover:bg-slate-200"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Days Header */}
              <div className="mb-1 grid grid-cols-7 text-center text-[10px] font-extrabold uppercase text-slate-400">
                <span>Min</span>
                <span>Sen</span>
                <span>Sel</span>
                <span>Rab</span>
                <span>Kam</span>
                <span>Jum</span>
                <span>Sab</span>
              </div>

              {/* Days Grid */}
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const dayNum = i + 1;
                  const monthStr = String(viewMonth + 1).padStart(2, '0');
                  const dayStr = String(dayNum).padStart(2, '0');
                  const isoStr = `${viewYear}-${monthStr}-${dayStr}`;
                  const isSelected = value === isoStr;
                  const isFuture = isoStr > todayIso();

                  return (
                    <button
                      key={dayNum}
                      type="button"
                      disabled={isFuture}
                      onClick={() => handleSelectDay(dayNum)}
                      className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-semibold transition-colors ${
                        isSelected
                          ? 'bg-slate-900 font-bold text-white'
                          : isFuture
                          ? 'cursor-not-allowed opacity-20'
                          : 'text-slate-800 hover:bg-slate-100'
                      }`}
                    >
                      {dayNum}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function FileUploader({
  label,
  accept,
  file,
  onFileSelect,
  hint,
  badgeText,
}: {
  label: string;
  accept: string;
  file: File | null;
  onFileSelect: (file: File | null) => void;
  hint: string;
  badgeText?: string;
}) {
  const [preview, setPreview] = useState<string | null>(null);

  const handleFile = (selected: File | null) => {
    onFileSelect(selected);
    if (selected && selected.type.startsWith('image/')) {
      const url = URL.createObjectURL(selected);
      setPreview(url);
    } else {
      setPreview(null);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
          {label} <span className="text-blue-600">*</span>
        </label>
        {badgeText && (
          <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-blue-700">
            {badgeText}
          </span>
        )}
      </div>

      <div className="group relative flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center transition-colors hover:border-slate-900 hover:bg-slate-100/60">
        {file ? (
          <div className="flex w-full items-center justify-between gap-4">
            <div className="flex items-center gap-3 overflow-hidden">
              {preview ? (
                <img
                  src={preview}
                  alt="Preview"
                  className="h-12 w-12 rounded-lg object-cover ring-1 ring-slate-300"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                  <FileText className="h-6 w-6" />
                </div>
              )}
              <div className="text-left">
                <p className="truncate text-sm font-semibold text-slate-900">{file.name}</p>
                <p className="text-xs text-slate-500">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleFile(null)}
              className="rounded-lg bg-slate-200 p-2 text-slate-600 transition-colors hover:bg-rose-100 hover:text-rose-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <label className="flex w-full cursor-pointer flex-col items-center">
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-700 shadow-sm border border-slate-200 transition-transform group-hover:scale-105">
              <Upload className="h-5 w-5" />
            </div>
            <span className="text-sm font-bold text-slate-900">Klik untuk mengunggah</span>
            <span className="mt-1 text-xs text-slate-500">{hint}</span>
            <input
              type="file"
              accept={accept}
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0] || null)}
            />
          </label>
        )}
      </div>
    </div>
  );
}

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

      if (category === 'anak') categoryLabel = 'Kategori Anak (Usia < 15 Tahun)';
      else if (category === 'taruna') categoryLabel = 'Kategori Taruna (Usia 15 - 17 Tahun)';
      else if (category === 'dewasa') categoryLabel = 'Kategori Dewasa (Usia ≥ 18 Tahun)';
    }
  } catch {}

  const selectedProvince = provinces?.find((p) => p.code === provinceCode);
  const selectedRegency = regencies?.find((r) => r.code === regencyCode);
  const selectedDistrict = districts?.find((d) => d.code === districtCode);
  const selectedVillage = villages?.find((v) => v.code === villageCode);

  const set = (name: keyof typeof form, value: string) =>
    setForm((current) => ({ ...current, [name]: value }));

  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!category) return setMessage('Harap isi tanggal lahir atlet dengan benar.');
    if (!profile || !identity)
      return setMessage('Pas foto dan dokumen identitas wajib diunggah.');

    setMessage('');
    setShowConfirmModal(true);
  };

  const confirmAndSubmit = async () => {
    if (!category || !profile || !identity) return;

    try {
      validateFile(profile.name, profile.type, profile.size, 'photo');
      validateFile(identity.name, identity.type, identity.size, 'identity');
      setSaving(true);
      setMessage('Mendaftarkan data peserta...');

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
        setMessage(`Mengunggah ${docType === 'foto_profil' ? 'pas foto' : 'dokumen identitas'}...`);
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
      setMessage(`Pendaftaran berhasil! Kategori terdaftar: ${registration.category.toUpperCase()}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Pendaftaran gagal.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-dvh bg-[#f4f6f9] text-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        {/* Clean Off-White Header */}
        <div className="text-center mb-10">
          <h1 className="font-display text-3xl font-extrabold uppercase tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
            Formulir Pendaftaran Atlet
          </h1>
          <p className="mt-3 text-sm font-medium text-slate-600 max-w-xl mx-auto">
            Silakan lengkapi data atlet, domisili Kemendagri, dan unggah dokumen pendukung resmi di bawah ini.
          </p>
        </div>

        {/* Doppelrand Double-Bezel Off-White Shell */}
        <div className="rounded-[2.5rem] border border-slate-200 bg-white p-2.5 shadow-xl shadow-slate-200/60">
          <form
            onSubmit={handleInitialSubmit}
            className="rounded-[calc(2.5rem-0.625rem)] border border-slate-200/80 bg-white p-6 sm:p-10 space-y-8"
          >
            {/* SECTION 1: PROFIL & IDENTITAS ATLET */}
            <div className="space-y-5">
              <div className="flex items-center gap-2.5 border-b border-slate-200 pb-3">
                <User className="h-5 w-5 text-slate-900" />
                <h2 className="font-display text-xl font-bold uppercase text-slate-900 tracking-wide">
                  1. Data Diri Atlet
                </h2>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Nama Lengkap Atlet <span className="text-blue-600">*</span>
                  </label>
                  <input
                    required
                    minLength={3}
                    maxLength={100}
                    placeholder="Contoh: Anthony Sinisuka Ginting"
                    value={form.fullName}
                    onChange={(e) => set('fullName', e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3.5 text-sm font-semibold text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:border-slate-900 focus:bg-white"
                  />
                </div>

                {/* Custom Off-White Datepicker Component */}
                <CustomDatePicker value={dob} onChange={setDob} />

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Jenis Kelamin <span className="text-blue-600">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {['putra', 'putri'].map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => set('gender', g)}
                        className={`rounded-xl border py-3.5 text-sm font-bold uppercase transition-colors ${
                          form.gender === g
                            ? 'border-slate-900 bg-slate-900 text-white'
                            : 'border-slate-300 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Klub / PB Bulutangkis <span className="text-blue-600">*</span>
                  </label>
                  <input
                    required
                    minLength={2}
                    maxLength={100}
                    placeholder="Contoh: PB Djarum / PB Jaya Raya"
                    value={form.club}
                    onChange={(e) => set('club', e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3.5 text-sm font-semibold text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:border-slate-900 focus:bg-white"
                  />
                </div>
              </div>

              {/* Dynamic Real-time Category Feedback */}
              <AnimatePresence>
                {category && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="rounded-2xl border border-blue-200 bg-blue-50/80 p-4 flex items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="h-5 w-5 text-blue-600" />
                        <span className="text-xs font-bold uppercase text-blue-900">Kategori Terdeteksi Otomatis</span>
                      </div>
                      <p className="font-display text-lg font-extrabold uppercase text-blue-950 mt-0.5">
                        {categoryLabel}
                      </p>
                    </div>
                    <span className="rounded-xl bg-blue-600 px-3.5 py-1 text-xs font-bold text-white uppercase">
                      {category}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* SECTION 2: ALAMAT & DOMISILI KEMENDAGRI */}
            <div className="space-y-5 pt-4">
              <div className="flex items-center gap-2.5 border-b border-slate-200 pb-3">
                <MapPin className="h-5 w-5 text-slate-900" />
                <h2 className="font-display text-xl font-bold uppercase text-slate-900 tracking-wide">
                  2. Alamat & Domisili Atlet
                </h2>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <CustomSelect
                  label="Provinsi"
                  placeholder="-- Pilih Provinsi --"
                  items={provinces}
                  value={provinceCode}
                  disabled={!provinces?.length}
                  onChange={(val) => {
                    setProvince(val);
                    setRegency('');
                    setDistrict('');
                    setVillage('');
                  }}
                />

                <CustomSelect
                  label="Kabupaten/Kota"
                  placeholder="-- Pilih Kabupaten/Kota --"
                  items={regencies}
                  value={regencyCode}
                  disabled={!provinceCode || !regencies?.length}
                  onChange={(val) => {
                    setRegency(val);
                    setDistrict('');
                    setVillage('');
                  }}
                />

                <CustomSelect
                  label="Kecamatan"
                  placeholder="-- Pilih Kecamatan --"
                  items={districts}
                  value={districtCode}
                  disabled={!regencyCode || !districts?.length}
                  onChange={(val) => {
                    setDistrict(val);
                    setVillage('');
                  }}
                />

                <CustomSelect
                  label="Desa/Kelurahan"
                  placeholder="-- Pilih Desa/Kelurahan --"
                  items={villages}
                  value={villageCode}
                  disabled={!districtCode || !villages?.length}
                  onChange={setVillage}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Kode Pos
                  </label>
                  <input
                    readOnly
                    value={selectedVillage?.postalCode || ''}
                    placeholder="Otomatis"
                    className="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3.5 text-sm font-bold text-slate-900 outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Detail Alamat (Jalan, RT/RW, No. Rumah) <span className="text-blue-600">*</span>
                  </label>
                  <input
                    required
                    minLength={5}
                    maxLength={300}
                    placeholder="Jl. Pemuda No. 45, RT 02/RW 03"
                    value={form.addressDetail}
                    onChange={(e) => set('addressDetail', e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3.5 text-sm font-semibold text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:border-slate-900 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    No. WhatsApp Active <span className="text-blue-600">*</span>
                  </label>
                  <input
                    required
                    type="tel"
                    placeholder="081234567890"
                    value={form.whatsapp}
                    onChange={(e) => set('whatsapp', e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3.5 text-sm font-semibold text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:border-slate-900 focus:bg-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Email (Opsional)
                  </label>
                  <input
                    type="email"
                    placeholder="email@domain.com"
                    value={form.email}
                    onChange={(e) => set('email', e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3.5 text-sm font-semibold text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:border-slate-900 focus:bg-white"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 3: UNGGAH BERKAS (DYNAMICALLY ADAPTS TO DOB/CATEGORY) */}
            <div className="space-y-5 pt-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2.5">
                  <FileText className="h-5 w-5 text-slate-900" />
                  <h2 className="font-display text-xl font-bold uppercase text-slate-900 tracking-wide">
                    3. Unggah Berkas & Identitas
                  </h2>
                </div>
                {category && (
                  <span className="text-xs font-bold uppercase text-blue-800 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                    Syarat: {documentRule(category).labels.join(' / ')}
                  </span>
                )}
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <FileUploader
                  label="Pas Foto Atlet"
                  accept="image/jpeg,image/png,image/webp"
                  file={profile}
                  onFileSelect={setProfile}
                  hint="Format JPG / PNG / WEBP, Maks 2 MB"
                />

                <FileUploader
                  label={
                    category === 'anak'
                      ? 'Kartu Keluarga / Akta Lahir'
                      : category === 'taruna'
                      ? 'Kartu Pelajar / KK / Akta Lahir'
                      : category === 'dewasa'
                      ? 'KTP / SIM Resmi'
                      : 'Dokumen Identitas Resmi'
                  }
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  file={identity}
                  onFileSelect={setIdentity}
                  hint="Format JPG / PNG / WEBP / PDF, Maks 2 MB"
                  badgeText={
                    category === 'anak'
                      ? 'KK / Akta'
                      : category === 'taruna'
                      ? 'Kartu Pelajar / KK'
                      : category === 'dewasa'
                      ? 'KTP / SIM'
                      : undefined
                  }
                />
              </div>
            </div>

            {/* SUBMIT TRIGGER */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={
                  !category ||
                  !profile ||
                  !identity ||
                  !form.fullName ||
                  !form.club ||
                  !provinceCode ||
                  !regencyCode ||
                  !districtCode ||
                  !villageCode ||
                  !form.addressDetail ||
                  !form.whatsapp
                }
                className="flex w-full items-center justify-center gap-3 rounded-xl bg-slate-900 px-8 py-4 font-bold text-white text-base uppercase tracking-wider shadow-lg transition-colors hover:bg-slate-800 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <FileCheck className="h-5 w-5" />
                <span>Review & Kirim Pendaftaran</span>
              </button>
            </div>

            {message && !showConfirmModal && (
              <div className="mt-6 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-100 p-4 text-sm font-bold text-slate-900">
                <AlertCircle className="h-5 w-5 text-blue-600 shrink-0" />
                <p>{message}</p>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* POPUP CONFIRMATION MODAL */}
      <AnimatePresence>
        {showConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !saving && setShowConfirmModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl space-y-6 text-slate-900"
            >
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="h-6 w-6 text-slate-900" />
                  <h3 className="font-display text-xl font-bold uppercase tracking-tight text-slate-900">
                    Ringkasan Pendaftaran
                  </h3>
                </div>
                {!saving && (
                  <button
                    onClick={() => setShowConfirmModal(false)}
                    className="rounded-full bg-slate-100 p-1.5 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="space-y-4 text-xs font-medium">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 uppercase font-bold text-[11px]">Nama Atlet</span>
                    <span className="font-bold text-slate-900 text-sm">{form.fullName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 uppercase font-bold text-[11px]">Jenis Kelamin</span>
                    <span className="font-bold text-slate-900 capitalize">{form.gender}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 uppercase font-bold text-[11px]">Kategori Usia</span>
                    <span className="font-extrabold text-blue-600 uppercase">{category} ({calculatedAge} Thn)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 uppercase font-bold text-[11px]">Klub / PB</span>
                    <span className="font-bold text-slate-900">{form.club}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200 pt-3">
                    <span className="text-slate-500 uppercase font-bold text-[11px]">Domisili</span>
                    <span className="font-bold text-slate-900 text-right max-w-[240px]">
                      {selectedVillage?.name}, {selectedDistrict?.name}, {selectedRegency?.name}, {selectedProvince?.name} ({selectedVillage?.postalCode})
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600">Dokumen Diunggah:</p>
                  <div className="flex items-center gap-4 text-xs font-bold text-slate-900">
                    <span className="flex items-center gap-1.5 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                      <Check className="h-3.5 w-3.5 text-blue-600" /> Foto Profil
                    </span>
                    <span className="flex items-center gap-1.5 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                      <Check className="h-3.5 w-3.5 text-blue-600" /> Dokumen Identitas
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => setShowConfirmModal(false)}
                  className="rounded-full border border-slate-300 bg-slate-100 px-5 py-3 text-xs font-bold uppercase text-slate-700 hover:bg-slate-200 hover:text-slate-900 disabled:opacity-40"
                >
                  Edit Data
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={confirmAndSubmit}
                  className="flex items-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-xs font-black uppercase text-white hover:bg-slate-800 disabled:opacity-40 shadow-lg"
                >
                  {saving ? (
                    <span>Mengirim Pendaftaran...</span>
                  ) : (
                    <>
                      <span>Konfirmasi & Kirim</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
