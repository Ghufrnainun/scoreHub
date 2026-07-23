'use client';

import { useState, useRef, useEffect } from 'react';
import { useAction, useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import {
  ageCategory,
  documentRule,
  todayIso,
  validateFile,
  normalizeWhatsApp,
  type AgeCategory,
} from '@/lib/pb-registration-validation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Location,
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
  Loader,
  CheckCircle,
  AddCircle,
} from 'reicon-react';

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

// --- CUSTOM SEARCHABLE SELECT DROPDOWN (COMPLIANT WITH WEB INTERFACE GUIDELINES) ---
function CustomSelect({
  label,
  placeholder,
  items,
  value,
  disabled,
  isLoading,
  onChange,
}: {
  label: string;
  placeholder: string;
  items?: Region[];
  value: string;
  disabled: boolean;
  isLoading?: boolean;
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
          disabled={disabled || isLoading}
          onClick={() => setIsOpen(!isOpen)}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          className={`flex min-h-[44px] w-full items-center justify-between rounded-xl border bg-slate-50 px-4 py-3 text-left text-sm font-medium text-slate-900 transition-all focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-40 ${
            isOpen ? 'border-blue-600 ring-2 ring-blue-100' : 'border-slate-300'
          }`}
        >
          <span className={selectedItem ? 'text-slate-900 font-semibold' : 'text-slate-400'}>
            {isLoading ? `Memuat data ${label.toLowerCase()}…` : selectedItem ? selectedItem.name : placeholder}
          </span>
          {isLoading ? (
            <Loader size={16} className="text-slate-400 animate-spin" aria-hidden="true" />
          ) : (
            <ChevronDown size={16} className={`text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
          )}
        </button>

        <AnimatePresence>
          {isOpen && !disabled && !isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 4, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className="absolute left-0 top-full z-50 mt-1.5 w-full rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl shadow-slate-900/10"
            >
              <div className="relative mb-2 px-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                <input
                  type="text"
                  placeholder={`Cari ${label.toLowerCase()}…`}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs text-slate-900 outline-none focus:border-blue-600 focus:bg-white"
                />
              </div>

              <div className="max-h-56 overflow-y-auto rounded-lg" role="listbox">
                {filteredItems && filteredItems.length > 0 ? (
                  filteredItems.map((item) => (
                    <button
                      key={item.code}
                      type="button"
                      role="option"
                      aria-selected={item.code === value}
                      onClick={() => {
                        onChange(item.code);
                        setIsOpen(false);
                        setSearch('');
                      }}
                      className={`flex min-h-[40px] w-full items-center justify-between rounded-lg px-3 py-2 text-xs text-left transition-colors ${
                        item.code === value
                          ? 'bg-blue-600 font-bold text-white'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span>{item.name}</span>
                      {item.code === value && <Check size={14} className="text-white" aria-hidden="true" />}
                    </button>
                  ))
                ) : (
                  <div className="py-4 text-center text-xs text-slate-400">
                    Tidak ditemukan data {label.toLowerCase()}
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

// --- CUSTOM DATE PICKER (COMPLIANT WITH ACCESSIBILITY & FOCUS STATES) ---
function CustomDatePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (dob: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          className={`flex min-h-[44px] w-full items-center justify-between rounded-xl border bg-slate-50 px-4 py-3 text-left text-sm font-medium text-slate-900 transition-all focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 ${
            isOpen ? 'border-blue-600 ring-2 ring-blue-100' : 'border-slate-300'
          }`}
        >
          <span className={formattedDisplay ? 'font-semibold text-slate-900' : 'text-slate-400'}>
            {formattedDisplay || 'Contoh: 23 Juli 2008…'}
          </span>
          <CalendarIcon size={16} className="text-slate-500" aria-hidden="true" />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 4, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className="absolute left-0 top-full z-50 mt-1.5 w-72 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl shadow-slate-900/10"
              role="dialog"
              aria-label="Pilih tanggal lahir"
            >
              <div className="mb-3 flex items-center justify-between gap-1">
                <div className="flex items-center gap-1">
                  <select
                    value={viewMonth}
                    onChange={(e) => setViewMonth(Number(e.target.value))}
                    aria-label="Pilih bulan"
                    className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-bold text-slate-900 outline-none focus:border-blue-600"
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
                    aria-label="Pilih tahun"
                    className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-bold text-slate-900 outline-none focus:border-blue-600"
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
                    aria-label="Bulan sebelumnya"
                    className="rounded-md bg-slate-100 p-1.5 text-slate-600 hover:bg-slate-200 transition-colors"
                  >
                    <ChevronLeft size={16} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (viewMonth === 11) {
                        setViewMonth(0);
                        setViewYear(viewYear + 1);
                      } else setViewMonth(viewMonth + 1);
                    }}
                    aria-label="Bulan berikutnya"
                    className="rounded-md bg-slate-100 p-1.5 text-slate-600 hover:bg-slate-200 transition-colors"
                  >
                    <ChevronRight size={16} aria-hidden="true" />
                  </button>
                </div>
              </div>

              <div className="mb-1 grid grid-cols-7 text-center text-[10px] font-extrabold uppercase text-slate-400">
                <span>Min</span>
                <span>Sen</span>
                <span>Sel</span>
                <span>Rab</span>
                <span>Kam</span>
                <span>Jum</span>
                <span>Sab</span>
              </div>

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
                          ? 'bg-blue-600 font-bold text-white shadow-sm'
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

// --- FILE UPLOADER WITH ACCESSIBLE DESCRIPTION & ALERTS ---
function FileUploader({
  label,
  accept,
  file,
  kind,
  onFileSelect,
  hint,
}: {
  label: string;
  accept: string;
  file: File | null;
  kind: 'photo' | 'identity';
  onFileSelect: (file: File | null) => void;
  hint: string;
}) {
  const [preview, setPreview] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFile = (selected: File | null) => {
    setErrorMsg(null);
    if (!selected) {
      onFileSelect(null);
      setPreview(null);
      return;
    }

    try {
      validateFile(selected.name, selected.type, selected.size, kind);
      onFileSelect(selected);
      if (selected.type.startsWith('image/')) {
        const url = URL.createObjectURL(selected);
        setPreview(url);
      } else {
        setPreview(null);
      }
    } catch (err) {
      onFileSelect(null);
      setPreview(null);
      setErrorMsg(err instanceof Error ? err.message : 'File tidak valid.');
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
          {label} <span className="text-blue-600">*</span>
        </label>
      </div>

      <div
        className={`group relative flex flex-col items-center justify-center rounded-2xl border border-dashed p-5 text-center transition-all ${
          errorMsg
            ? 'border-rose-300 bg-rose-50/50'
            : file
            ? 'border-slate-300 bg-slate-50'
            : 'border-slate-300 bg-slate-50 hover:border-blue-500 hover:bg-slate-100/60'
        }`}
      >
        {file ? (
          <div className="flex w-full items-center justify-between gap-4">
            <div className="flex items-center gap-3 overflow-hidden">
              {preview ? (
                <img
                  src={preview}
                  alt="Pratinjau Berkas"
                  className="h-12 w-12 rounded-lg object-cover ring-1 ring-slate-300"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <FileText size={24} aria-hidden="true" />
                </div>
              )}
              <div className="text-left">
                <p className="truncate text-sm font-semibold text-slate-900">{file.name}</p>
                <p className="text-xs text-slate-500">
                  {(file.size / (1024 * 1024)).toFixed(2)}&nbsp;MB
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleFile(null)}
              aria-label={`Hapus ${label}`}
              className="rounded-lg bg-slate-200 p-2 text-slate-600 transition-colors hover:bg-rose-100 hover:text-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-500"
            >
              <X size={16} aria-hidden="true" />
            </button>
          </div>
        ) : (
          <label className="flex w-full cursor-pointer flex-col items-center py-2">
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-700 shadow-sm border border-slate-200 transition-transform group-hover:scale-105">
              <Upload size={20} aria-hidden="true" />
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

      {errorMsg && (
        <p className="flex items-center gap-1 text-[11px] font-semibold text-rose-600" aria-live="polite">
          <AlertCircle size={14} aria-hidden="true" />
          <span>{errorMsg}</span>
        </p>
      )}
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

      if (category === 'anak') categoryLabel = 'Kategori Anak (Usia < 15 Tahun)';
      else if (category === 'taruna') categoryLabel = 'Kategori Taruna (Usia 15 - 17 Tahun)';
      else if (category === 'dewasa') categoryLabel = 'Kategori Dewasa (Usia ≥ 18 Tahun)';
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
    } catch (err) {
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
      validateFile(profile.name, profile.type, profile.size, 'photo');
      validateFile(identity.name, identity.type, identity.size, 'identity');
      setSaving(true);
      setMessage('Mendaftarkan data peserta…');

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

  const getCategoryColorStyles = (cat: AgeCategory) => {
    switch (cat) {
      case 'anak':
        return 'border-teal-200 bg-teal-50 text-teal-900';
      case 'taruna':
        return 'border-blue-200 bg-blue-50 text-blue-900';
      case 'dewasa':
        return 'border-emerald-200 bg-emerald-50 text-emerald-950';
      default:
        return 'border-slate-200 bg-slate-50 text-slate-900';
    }
  };

  return (
    <main className="min-h-dvh bg-[#f4f6f9] text-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        {/* Header Title with Calibrated Color */}
        <div className="text-center mb-10">
          <h1 className="font-display text-3xl font-extrabold uppercase tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
            Pendaftaran Atlet PB Undip
          </h1>
          <p className="mt-3 text-sm font-medium text-slate-600 max-w-xl mx-auto">
            Silakan lengkapi formulir pendaftaran anggota dan atlet PB Undip secara resmi di bawah ini.
          </p>
        </div>

        {/* SUCCESS STATE CARD */}
        <AnimatePresence>
          {successInfo ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-[2.5rem] border border-slate-200 bg-white p-8 sm:p-12 text-center shadow-xl shadow-slate-200/60 space-y-6"
            >
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <CheckCircle size={40} aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Pendaftaran Berhasil!</h2>
                <p className="mt-2 text-sm text-slate-600">
                  Data atlet telah resmi terdaftar di database PB Undip.
                </p>
              </div>

              <div className="inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-6 py-4 text-xs font-semibold text-slate-700">
                <div>
                  <span className="text-slate-400 uppercase font-bold block text-[10px]">ID Pendaftaran</span>
                  <span className="font-mono text-sm font-bold text-slate-900">{successInfo.id}</span>
                </div>
                <div className="h-8 w-px bg-slate-200" />
                <div>
                  <span className="text-slate-400 uppercase font-bold block text-[10px]">Kategori Terdaftar</span>
                  <span className="font-bold text-blue-600 uppercase text-sm">{successInfo.category}</span>
                </div>
              </div>

              <div>
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/20"
                >
                  <AddCircle size={16} aria-hidden="true" />
                  <span>Daftarkan Atlet Lain</span>
                </button>
              </div>
            </motion.div>
          ) : (
            /* FORM SHELL */
            <div className="rounded-[2.5rem] border border-slate-200 bg-white p-2.5 shadow-xl shadow-slate-200/60">
              <form
                onSubmit={handleInitialSubmit}
                className="rounded-[calc(2.5rem-0.625rem)] border border-slate-200/80 bg-white p-6 sm:p-10 space-y-8"
              >
                {/* SECTION 1: PROFIL & IDENTITAS ATLET */}
                <div className="space-y-5">
                  <div className="flex items-center gap-2.5 border-b border-slate-200 pb-3">
                    <User size={20} className="text-blue-600" aria-hidden="true" />
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
                        name="fullName"
                        autoComplete="name"
                        placeholder="Contoh: Anthony Sinisuka Ginting…"
                        value={form.fullName}
                        onChange={(e) => set('fullName', e.target.value)}
                        className="w-full min-h-[44px] rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100"
                      />
                      <p className="text-[11px] text-slate-400">Sesuai nama pada KTP, Akta, atau Kartu Keluarga.</p>
                    </div>

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
                            className={`min-h-[44px] rounded-xl border py-3 text-sm font-bold uppercase transition-colors focus:outline-none focus:ring-2 focus:ring-blue-100 ${
                              form.gender === g
                                ? 'border-blue-600 bg-blue-50 text-blue-700'
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
                        name="club"
                        autoComplete="off"
                        placeholder="Contoh: PB Djarum / PB Jaya Raya…"
                        value={form.club}
                        onChange={(e) => set('club', e.target.value)}
                        className="w-full min-h-[44px] rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100"
                      />
                    </div>
                  </div>

                  {/* Real-time Category Feedback with calibrated style */}
                  <AnimatePresence>
                    {category && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={`rounded-2xl border p-4 flex items-center justify-between gap-4 transition-colors ${getCategoryColorStyles(category)}`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <ShieldCheck size={20} className="opacity-85" aria-hidden="true" />
                            <span className="text-xs font-bold uppercase opacity-90">Kategori Usia Pertandingan</span>
                          </div>
                          <p className="font-display text-lg font-extrabold uppercase mt-0.5">
                            {categoryLabel}
                          </p>
                        </div>
                        <span className="rounded-xl bg-white px-3.5 py-1 text-xs font-bold shadow-sm uppercase border border-slate-200">
                          {category}
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* SECTION 2: ALAMAT & DOMISILI KEMENDAGRI */}
                <div className="space-y-5 pt-4">
                  <div className="flex items-center gap-2.5 border-b border-slate-200 pb-3">
                    <Location size={20} className="text-blue-600" aria-hidden="true" />
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
                      placeholder="-- Pilih Kabupaten/Kota --"
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
                      placeholder="-- Pilih Kecamatan --"
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
                      placeholder="-- Pilih Desa/Kelurahan --"
                      items={villages}
                      value={villageCode}
                      disabled={!districtCode}
                      isLoading={districtCode !== '' && villages === undefined}
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
                        className="w-full min-h-[44px] rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm font-bold text-slate-900 outline-none"
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
                        name="addressDetail"
                        autoComplete="street-address"
                        placeholder="Contoh: Jl. Pemuda No. 45, RT 02/RW 03…"
                        value={form.addressDetail}
                        onChange={(e) => set('addressDetail', e.target.value)}
                        className="w-full min-h-[44px] rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100"
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
                        name="whatsapp"
                        autoComplete="tel"
                        placeholder="Contoh: 081234567890…"
                        value={form.whatsapp}
                        onChange={(e) => set('whatsapp', e.target.value)}
                        className="w-full min-h-[44px] rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Email (Opsional)
                      </label>
                      <input
                        type="email"
                        name="email"
                        autoComplete="email"
                        spellCheck={false}
                        placeholder="Contoh: email@domain.com…"
                        value={form.email}
                        onChange={(e) => set('email', e.target.value)}
                        className="w-full min-h-[44px] rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100"
                      />
                    </div>
                  </div>
                </div>

                {/* SECTION 3: UNGGAH BERKAS */}
                <div className="space-y-5 pt-4">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <div className="flex items-center gap-2.5">
                      <FileText size={20} className="text-blue-600" aria-hidden="true" />
                      <h2 className="font-display text-xl font-bold uppercase text-slate-900 tracking-wide">
                        3. Unggah Berkas & Identitas
                      </h2>
                    </div>
                    {category && (
                      <span className="text-xs font-bold uppercase text-blue-800 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                        Dokumen Wajib: {documentRule(category).labels.join(' / ')}
                      </span>
                    )}
                  </div>

                  <div className="grid gap-6 sm:grid-cols-2">
                    <FileUploader
                      label="Pas Foto Atlet"
                      accept="image/jpeg,image/png,image/webp"
                      file={profile}
                      kind="photo"
                      onFileSelect={setProfile}
                      hint="Format JPG / PNG / WEBP, Maks 2 MB"
                    />

                    <FileUploader
                      label={
                        category === 'anak'
                          ? 'Dokumen Identitas (KK / Akta)'
                          : category === 'taruna'
                          ? 'Dokumen Identitas (Kartu Pelajar / KK / Akta)'
                          : category === 'dewasa'
                          ? 'Dokumen Identitas (KTP / SIM)'
                          : 'Dokumen Identitas Resmi'
                      }
                      accept="image/jpeg,image/png,image/webp,application/pdf"
                      file={identity}
                      kind="identity"
                      onFileSelect={setIdentity}
                      hint="Format JPG / PNG / WEBP / PDF, Maks 2 MB"
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
                    className="flex min-h-[48px] w-full items-center justify-center gap-3 rounded-xl bg-blue-600 px-8 py-4 font-bold text-white text-base uppercase tracking-wider shadow-lg shadow-blue-600/10 transition-colors hover:bg-blue-500 active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <FileCheck size={20} aria-hidden="true" />
                    <span>Review & Kirim Pendaftaran</span>
                  </button>
                </div>

                {message && !showConfirmModal && (
                  <div className="mt-6 flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700" aria-live="polite">
                    <AlertCircle size={20} className="text-rose-600 shrink-0" aria-hidden="true" />
                    <p>{message}</p>
                  </div>
                )}
              </form>
            </div>
          )}
        </AnimatePresence>
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
              role="dialog"
              aria-modal="true"
              aria-label="Ringkasan pendaftaran atlet"
            >
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck size={24} className="text-blue-600" aria-hidden="true" />
                  <h3 className="font-display text-xl font-bold uppercase tracking-tight text-slate-900">
                    Ringkasan Pendaftaran Atlet
                  </h3>
                </div>
                {!saving && (
                  <button
                    onClick={() => setShowConfirmModal(false)}
                    aria-label="Tutup ringkasan"
                    className="rounded-full bg-slate-100 p-1.5 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                  >
                    <X size={16} aria-hidden="true" />
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
                    <span className="font-extrabold text-blue-600 uppercase">{category} ({calculatedAge}&nbsp;Thn)</span>
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
                      <Check size={14} className="text-blue-600" aria-hidden="true" /> Foto Profil
                    </span>
                    <span className="flex items-center gap-1.5 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                      <Check size={14} className="text-blue-600" aria-hidden="true" /> Dokumen Identitas
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => setShowConfirmModal(false)}
                  className="min-h-[44px] rounded-full border border-slate-300 bg-slate-100 px-5 py-3 text-xs font-bold uppercase text-slate-700 hover:bg-slate-200 hover:text-slate-900 disabled:opacity-40"
                >
                  Edit Data
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={confirmAndSubmit}
                  className="flex min-h-[44px] items-center gap-2 rounded-full bg-blue-600 px-6 py-2.5 text-xs font-bold uppercase text-white hover:bg-blue-500 disabled:opacity-40 shadow-lg shadow-blue-600/10"
                >
                  {saving ? (
                    <span className="flex items-center gap-2">
                      <Loader size={16} className="animate-spin" aria-hidden="true" /> Mengirim…
                    </span>
                  ) : (
                    <>
                      <span>Kirim Pendaftaran</span>
                      <ArrowRight size={16} aria-hidden="true" />
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
