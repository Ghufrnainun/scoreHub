'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useMutation, usePaginatedQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { loadValidAdminSession } from '@/lib/admin-session';
import { genderLabel } from '@/lib/gender';
import * as XLSX from 'xlsx';
import {
  LogOut,
  RefreshCw,
  Users,
  AlertCircle,
  KeyRound,
  ArrowRight,
  Download,
  FileSpreadsheet,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import RegistrationStats, { type RegistrationItem } from './_components/RegistrationStats';
import RegistrationFilterBar from './_components/RegistrationFilterBar';
import RegistrationTable from './_components/RegistrationTable';
import { useRouter } from 'next/navigation';

const PB_TOKEN_KEY = 'pb_admin_token';

export default function AdminPendaftaranPBPage() {
  const [token, setToken] = useState<string>('');
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // Login State
  const [pinInput, setPinInput] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedKabupaten, setSelectedKabupaten] = useState('');

  const router = useRouter();

  // Convex Queries
  const verifyPin = useMutation(api.pbRegistration.verifyAdminPBPin);
  const { results: data, status: paginatedStatus, loadMore } = usePaginatedQuery(
    api.pbRegistration.listAdmin,
    token ? { adminSessionToken: token } : 'skip',
    { initialNumItems: 50 }
  );

  // 1. Initial Session Check (Check PB dedicated token OR Master Admin token)
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

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinInput.trim()) return;

    setIsLoggingIn(true);
    setLoginError('');
    try {
      const res = await verifyPin({ pin: pinInput.trim() });
      localStorage.setItem(PB_TOKEN_KEY, res.token);
      setToken(res.token);
      setPinInput('');
      toast.success('Login berhasil! Selamat datang di Dashboard Pendaftaran PB UNDIP.');
    } catch (err) {
      setLoginError((err as Error).message || 'PIN yang dimasukkan salah.');
      toast.error('Gagal login: PIN tidak valid.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem(PB_TOKEN_KEY);
    setToken('');
    toast.info('Anda telah keluar dari Dashboard Pendaftaran.');
  };

  // Kabupaten list for dropdown
  const kabupatenList = useMemo(() => {
    if (!data) return [];
    const list = data
      .map((item) => item.regencyName)
      .filter(Boolean) as string[];
    return Array.from(new Set(list)).sort();
  }, [data]);

  // Filtered Data
  const filteredData = useMemo(() => {
    if (!data) return [];
    return data.filter((item) => {
      // Status Filter
      if (selectedStatus && item.status !== selectedStatus) return false;


      // Kabupaten Filter
      const itemKab = item.regencyName || '';
      if (selectedKabupaten && itemKab !== selectedKabupaten) return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = item.fullName.toLowerCase().includes(q);
        const matchClub = item.club.toLowerCase().includes(q);
        const matchWa = item.whatsapp.toLowerCase().includes(q);
        const matchEmail = (item.email || '').toLowerCase().includes(q);
        if (!matchName && !matchClub && !matchWa && !matchEmail) return false;
      }

      return true;
    });
  }, [data, selectedStatus, selectedKabupaten, searchQuery]);

  // Export XLSX Handler (SheetJS). Kolom numerik sensitif (NIK, WA, HP, kode pos)
  // dipaksa bertipe teks biar Excel tidak mengubah jadi notasi ilmiah / menghilangkan 0 depan.
  const handleExportCSV = () => {
    if (!filteredData || filteredData.length === 0) {
      toast.error('Tidak ada data untuk diekspor.');
      return;
    }

    const headers = ['ID', 'NIK', 'Nama Lengkap', 'ID BWF', 'Gender', 'Ibu Kandung', 'Tempat Lahir', 'Tanggal Lahir', 'Main Tangan', 'Kewarganegaraan', 'Klub', 'Provinsi', 'Kabupaten/Kota', 'Kode Pos', 'Alamat Lengkap', 'No Telepon', 'No Handphone', 'Email', 'Status', 'Tanggal Daftar'];

    // Kolom yang harus selalu jadi TEKS (hindari notasi ilmiah / hilangnya 0 di depan)
    const textColumns = new Set([1, 3, 7, 13, 15, 16, 19]); // NIK, ID BWF, Tgl Lahir, Kode Pos, No Telp, No HP, Tgl Daftar
    const numCols = headers.length;

    const aoa: (string | number)[][] = [headers];
    filteredData.forEach((item) => {
      const row = [
        item._id,
        item.nik || '--',
        item.fullName,
        item.bwfId || '--',
        genderLabel(item.gender),
        item.motherName || '--',
        item.birthPlace || '--',
        item.dob || '--',
        item.playingHand || '--',
        item.nationality || '--',
        item.club,
        item.provinceName || '--',
        item.regencyName || '--',
        item.postalCode || '--',
        item.addressDetail || '--',
        item.phone || '--',
        item.whatsapp || '--',
        item.email || '--',
        item.status,
        item.createdAt ? new Date(item.createdAt).toISOString().slice(0, 10) : '--',
      ];
      aoa.push(row);
    });

    const ws = XLSX.utils.aoa_to_sheet(aoa);

    // Paksa kolom sensitif bertipe teks (z: '0' = format teks di SheetJS)
    for (let c = 0; c < numCols; c++) {
      if (textColumns.has(c)) {
        for (let r = 1; r < aoa.length; r++) {
          const cell = ws[XLSX.utils.encode_cell({ r, c })];
          if (cell) {
            cell.t = 's'; // string type
            cell.z = '@'; // text format
          }
        }
      }
    }

    // Auto column width (paling lebar ~40 chars, min 8)
    const colWidths: { wch: number }[] = [];
    for (let c = 0; c < numCols; c++) {
      let maxLen = headers[c].length;
      aoa.forEach((row) => {
        const v = String(row[c] ?? '');
        if (v.length > maxLen) maxLen = v.length;
      });
      colWidths.push({ wch: Math.min(Math.max(maxLen + 2, 8), 40) });
    }
    ws['!cols'] = colWidths;

    // Freeze header row
    ws['!freeze'] = { xSplit: 0, ySplit: 1 };

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Pendaftar');

    const filename = `Pendaftaran_PB_UNDIP_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(wb, filename);
    toast.success(`${filteredData.length} data pendaftar berhasil diekspor ke Excel (.xlsx).`);
  };

  // Reset Filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedStatus('');
    setSelectedKabupaten('');
  };

  const hasActiveFilters = Boolean(searchQuery || selectedStatus || selectedKabupaten);
  // LOADING CHECK
  if (isAuthChecking) {
    return (
      <div className="flex min-h-dvh w-full items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
          <span className="text-sm font-semibold text-muted-foreground">Memuat sesi...</span>
        </div>
      </div>
    );
  }

  // LOGIN SCREEN
  if (!token || (data.length === 0 && paginatedStatus === 'LoadingFirstPage' && loginError)) {
    return (
      <div className="flex min-h-dvh w-full items-center justify-center p-4 sm:p-6 bg-background text-foreground">
        <div className="w-full max-w-md animate-in fade-in-50 duration-200">
          <div className="rounded-[2rem] border border-border/80 bg-card p-8 sm:p-10 text-card-foreground shadow-lg">
            <div className="flex flex-col items-center text-center">
              <img src="/pb-emblem.png" alt="Logo PB UNDIP" className="h-16 w-auto object-contain mb-4" />
              <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
                PB UNDIP • Admin Pendaftaran
              </h1>
              <p className="mt-1.5 text-xs font-medium text-muted-foreground max-w-xs">
                Masukkan PIN untuk mengakses dasbor tracking data pendaftaran dan berkas atlet.
              </p>
            </div>

            <form onSubmit={handleLogin} className="mt-8 space-y-4">
              <div>
                <label htmlFor="pin-input" className="block text-xs font-bold uppercase tracking-wider text-foreground mb-2">
                  PIN Admin
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="pin-input"
                    type="password"
                    placeholder="Masukkan PIN..."
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value)}
                    className="h-12 rounded-xl border-border bg-secondary/30 pl-10 pr-4 text-center text-lg font-bold tracking-widest transition-all focus:bg-background focus:ring-2 focus:ring-primary"
                    autoFocus
                  />
                </div>
                {loginError && (
                  <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-destructive">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{loginError}</span>
                  </div>
                )}
              </div>

              <Button
                type="submit"
                disabled={isLoggingIn || !pinInput.trim()}
                className="h-12 w-full gap-2 rounded-xl bg-primary text-sm font-bold text-primary-foreground shadow hover:bg-primary/90 disabled:opacity-50 transition-all cursor-pointer"
              >
                {isLoggingIn ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Memverifikasi...</span>
                  </>
                ) : (
                  <>
                    <span>Masuk Dashboard</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 border-t border-border/80 pt-4 text-center">
              <p className="text-[11px] font-medium text-muted-foreground">
                Catatan: Akses ini terpisah dari papan skor pertandingan utama ScoreHub.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // MAIN AUTHENTICATED DASHBOARD
  return (
    <div className="min-h-dvh bg-background text-foreground pb-20">
      {/* Clean Header Bar with Export Button */}
      <header className="sticky top-0 z-30 border-b border-border/80 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3.5">
            <img src="/pb-emblem-text.png" alt="PB UNDIP" className="h-11 w-auto object-contain shrink-0" />
            <div>
              <h1 className="font-display text-lg font-bold tracking-tight text-foreground">
                Dashboard Pendaftaran
              </h1>
              <p className="text-xs font-medium text-muted-foreground">
                Tracking data pendaftaran atlet, verifikasi berkas, dan ekspor SI PBSI.
              </p>
            </div>
          </div>

          {/* Banner PolyTron di tengah */}
          <div className="hidden lg:block shrink-0">
            <img
              src="/polyTron-banner.png"
              alt="PolyTron"
              className="h-11 w-auto object-contain"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* XLSX Export */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              className="h-9 gap-1.5 rounded-xl border-border bg-card text-xs font-bold text-foreground hover:bg-secondary transition-all cursor-pointer shadow-2xs"
            >
              <FileSpreadsheet className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden sm:inline">Ekspor Excel</span>
            </Button>

            {/* Logout */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="h-9 gap-2 rounded-xl border-border bg-card text-xs font-bold text-foreground hover:bg-secondary transition-all cursor-pointer shadow-2xs"
            >
              <LogOut className="h-3.5 w-3.5 text-destructive" />
              <span>Keluar</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8 space-y-8">
        {/* 1. Statistics Cards */}
        <section aria-label="Statistik Pendaftaran">
          <RegistrationStats
            data={data || []}
            selectedStatus={selectedStatus}
            onSelectStatus={setSelectedStatus}
          />
        </section>

        {/* 2. Filter Bar */}
        <section aria-label="Filter dan Pencarian">
          <RegistrationFilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedKabupaten={selectedKabupaten}
            onKabupatenChange={setSelectedKabupaten}
            kabupatenList={kabupatenList}
            onReset={handleResetFilters}
            hasActiveFilters={hasActiveFilters}
          />
        </section>

        {/* 3. Table */}
        <section aria-label="Daftar Atlet" className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="font-display text-sm font-bold text-foreground flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <span>Daftar Atlet Pendaftar</span>
              <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-black text-foreground border border-border">
                {filteredData.length}
              </span>
            </h2>

            {selectedStatus && (
              <span className="text-xs font-semibold text-primary flex items-center gap-1 bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
                <span>Filter aktif:</span>
                <strong className="uppercase">{selectedStatus}</strong>
              </span>
            )}
          </div>

          <RegistrationTable
            data={filteredData}
            onSelectRow={(item) => router.push(`/pendaftaran-pb/admin/${item._id}`)}
            isLoading={paginatedStatus === 'LoadingFirstPage'}
          />
          
          {paginatedStatus === 'CanLoadMore' && (
            <div className="flex justify-center mt-6">
              <Button
                variant="outline"
                onClick={() => loadMore(50)}
                className="h-10 px-6 rounded-xl font-bold bg-card border-border hover:bg-secondary transition-colors"
              >
                Muat Lebih Banyak
              </Button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
