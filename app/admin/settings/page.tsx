'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { loadValidAdminSession } from '@/lib/admin-session';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function SettingsPage() {
  const [session, setSession] = useState<{
    token: string;
    isTemporary: boolean;
    isReady: boolean;
  }>({
    token: '',
    isTemporary: false,
    isReady: false,
  });
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  useEffect(() => {
    const s = loadValidAdminSession();
    setSession({
      token: s?.token || '',
      isTemporary: !!s?.isTemporary,
      isReady: true,
    });
  }, []);

  const existingColor = useQuery(api.settings.get, { key: 'primaryColor' });
  const updateSetting = useMutation(api.settings.update);

  const [primaryColor, setPrimaryColor] = useState('#fbbf24');
  const [isSaving, setIsSaving] = useState(false);

  // Master PIN change state
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isChangingPin, setIsChangingPin] = useState(false);

  // Temp code creation state
  const [tempLabel, setTempLabel] = useState('');
  const [tempDuration, setTempDuration] = useState('4'); // hours
  const [tempMaxUses, setTempMaxUses] = useState('');
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<{
    code: string;
    expiresAt: number;
    label: string;
  } | null>(null);

  // Mutations & Queries
  const changeMasterPin = useMutation(api.auth.changeMasterPin);
  const generateTempCode = useMutation(api.auth.generateTempCode);
  const tempCodes = useQuery(
    api.auth.listTempCodes,
    session.isReady && session.token && !session.isTemporary
      ? { adminSessionToken: session.token }
      : 'skip'
  );
  const revokeTempCode = useMutation(api.auth.revokeTempCode);

  useEffect(() => {
    if (existingColor) {
      setPrimaryColor(existingColor);
    }
  }, [existingColor]);

  const handleSaveColor = async () => {
    setIsSaving(true);
    setFeedback(null);
    try {
      await updateSetting({
        key: 'primaryColor',
        value: primaryColor,
        adminSessionToken: session.token,
      });
      setFeedback({
        type: 'success',
        message: 'Pengaturan warna display berhasil disimpan.',
      });
    } catch (e: any) {
      console.error(e);
      const msg =
        e?.data && typeof e.data === 'string'
          ? e.data
          : e?.message && typeof e.message === 'string' && !e.message.includes('Server Error')
            ? e.message.replace(/^ConvexError:\s*/i, '')
            : 'Gagal menyimpan pengaturan. Silakan coba lagi.';
      setFeedback({
        type: 'error',
        message: msg,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPin || !newPin || !confirmPin) {
      setFeedback({ type: 'error', message: 'Semua kolom PIN harus diisi.' });
      return;
    }
    if (newPin !== confirmPin) {
      setFeedback({ type: 'error', message: 'Konfirmasi PIN baru tidak cocok.' });
      return;
    }
    if (!/^\d{4,10}$/.test(newPin)) {
      setFeedback({
        type: 'error',
        message: 'PIN baru harus berupa 4-10 digit angka.',
      });
      return;
    }

    setIsChangingPin(true);
    setFeedback(null);
    try {
      await changeMasterPin({
        oldPin,
        newPin,
        adminSessionToken: session.token,
      });
      setFeedback({ type: 'success', message: 'Master PIN berhasil diubah.' });
      setOldPin('');
      setNewPin('');
      setConfirmPin('');
    } catch (err: any) {
      console.error(err);
      const msg =
        err?.data && typeof err.data === 'string'
          ? err.data
          : err?.message && typeof err.message === 'string'
            ? err.message.includes('Server Error')
              ? 'Gagal mengubah PIN. Pastikan PIN lama benar.'
              : err.message.replace(/^ConvexError:\s*/i, '')
            : 'Gagal mengubah PIN.';
      setFeedback({ type: 'error', message: msg });
    } finally {
      setIsChangingPin(false);
    }
  };

  const handleGenerateCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempLabel.trim()) {
      setFeedback({ type: 'error', message: 'Label kode sementara harus diisi.' });
      return;
    }

    setIsGeneratingCode(true);
    setFeedback(null);
    try {
      const result = await generateTempCode({
        label: tempLabel,
        durationHours: Number(tempDuration),
        maxUses: tempMaxUses ? Number(tempMaxUses) : undefined,
        adminSessionToken: session.token,
      });

      setGeneratedCode({
        code: result.code,
        expiresAt: result.expiresAt,
        label: tempLabel,
      });

      setTempLabel('');
      setTempMaxUses('');
      setFeedback({
        type: 'success',
        message: 'Kode akses sementara berhasil dibuat.',
      });
    } catch (err: any) {
      console.error(err);
      const msg =
        err?.data && typeof err.data === 'string'
          ? err.data
          : err?.message && typeof err.message === 'string'
            ? err.message.includes('Server Error')
              ? 'Gagal membuat kode akses sementara.'
              : err.message.replace(/^ConvexError:\s*/i, '')
            : 'Gagal membuat kode akses.';
      setFeedback({ type: 'error', message: msg });
    } finally {
      setIsGeneratingCode(false);
    }
  };

  const handleRevokeCode = async (codeId: any) => {
    setFeedback(null);
    try {
      await revokeTempCode({
        codeId,
        adminSessionToken: session.token,
      });
      setFeedback({
        type: 'success',
        message: 'Kode akses berhasil dimatikan.',
      });
    } catch (err: any) {
      console.error(err);
      const msg =
        err?.data && typeof err.data === 'string'
          ? err.data
          : err?.message && typeof err.message === 'string'
            ? err.message.includes('Server Error')
              ? 'Gagal mematikan kode akses.'
              : err.message.replace(/^ConvexError:\s*/i, '')
            : 'Gagal mematikan kode akses.';
      setFeedback({ type: 'error', message: msg });
    }
  };

  const handleShareWhatsApp = () => {
    if (!generatedCode) return;
    const dateStr = new Date(generatedCode.expiresAt).toLocaleString('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
    const msg = `Halo, berikut adalah Kode Akses Sementara untuk mengelola Turnamen:

Label: ${generatedCode.label}
Kode Akses (PIN): ${generatedCode.code}
Kedaluwarsa pada: ${dateStr}

Silakan masuk menggunakan kode di atas.`;
    const url = `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  const handleCopyCode = () => {
    if (!generatedCode) return;
    navigator.clipboard.writeText(generatedCode.code);
  };

  if (!session.isReady) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-4 text-sm text-muted-foreground font-mono shadow-sm animate-pulse">
          Memuat pengaturan...
        </div>
      </div>
    );
  }

  if (session.isTemporary) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="p-8 text-center border-red-200 bg-red-50/80 text-red-700 rounded-3xl shadow-sm">
          <svg
            className="w-12 h-12 text-red-500 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          <h2 className="text-2xl font-black mb-2 text-red-800">Akses Ditolak</h2>
          <p className="text-sm text-red-700 leading-relaxed max-w-xl mx-auto">
            Anda login menggunakan Kode Akses Sementara dan tidak memiliki wewenang untuk mengelola pengaturan sistem atau keamanan.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-black tracking-tight text-slate-900">Pengaturan</h1>
        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
          Atur keamanan sistem, buat kode akses sementara, dan ubah pengaturan global.
        </p>
      </div>

      {feedback ? (
        <div
          role="status"
          aria-live="polite"
          className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${
            feedback.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border-red-200 bg-red-50 text-red-700'
          }`}
        >
          {feedback.message}
        </div>
      ) : null}

      {/* ACCESS & SECURITY PANEL */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Ubah PIN Utama */}
        <Card className="p-6 rounded-3xl border border-slate-200 bg-white shadow-sm">
          <h3 className="font-black text-lg mb-1 flex items-center gap-2 text-slate-900">
            <svg
              className="w-5 h-5 text-amber-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 7a2 2 0 012 2m-2 4a2 2 0 012 2m-2-4a2 2 0 11-4 0v-5a2 2 0 013-1.732M11 7a2 2 0 00-2 2v5a4 4 0 01-8 0v-5a2 2 0 013-1.732"
              />
            </svg>
            Ubah PIN Utama (Master)
          </h3>
          <p className="text-xs text-muted-foreground mb-5 leading-relaxed">
            Ganti PIN utama untuk akses admin penuh.
          </p>
          <form onSubmit={handleChangePin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="old-pin">PIN Lama</Label>
              <Input
                id="old-pin"
                type="password"
                placeholder="PIN saat ini"
                value={oldPin}
                onChange={(e) => setOldPin(e.target.value.replace(/\D/g, ''))}
                className="font-mono h-11 rounded-xl bg-slate-50 border-slate-200"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-pin">PIN Baru (4-10 Digit)</Label>
              <Input
                id="new-pin"
                type="password"
                placeholder="PIN Baru"
                value={newPin}
                onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                className="font-mono h-11 rounded-xl bg-slate-50 border-slate-200"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-pin">Konfirmasi PIN Baru</Label>
              <Input
                id="confirm-pin"
                type="password"
                placeholder="Konfirmasi PIN Baru"
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                className="font-mono h-11 rounded-xl bg-slate-50 border-slate-200"
              />
            </div>
            <Button
              type="submit"
              disabled={isChangingPin}
              className="w-full rounded-xl h-11 font-bold transition-all hover:-translate-y-0.5 active:translate-y-0"
            >
              {isChangingPin ? 'Mengubah...' : 'Simpan PIN Baru'}
            </Button>
          </form>
        </Card>

        {/* Buat Kode Akses Sementara */}
        <Card className="p-6 rounded-3xl border border-slate-200 bg-white shadow-sm">
          <h3 className="font-black text-lg mb-1 flex items-center gap-2 text-slate-900">
            <svg
              className="w-5 h-5 text-indigo-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h2M4 8h16"
              />
            </svg>
            Buat Kode Sementara
          </h3>
          <p className="text-xs text-muted-foreground mb-5 leading-relaxed">
            Beri akses terbatas untuk panitia tanpa membagikan PIN utama.
          </p>
          <form onSubmit={handleGenerateCode} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="temp-label">Nama Panitia / Keterangan</Label>
              <Input
                id="temp-label"
                placeholder="Contoh: Panitia GOR A, Wasit Event"
                value={tempLabel}
                onChange={(e) => setTempLabel(e.target.value)}
                className="h-11 rounded-xl bg-slate-50 border-slate-200"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="temp-duration">Durasi Akses</Label>
              <select
                id="temp-duration"
                value={tempDuration}
                onChange={(e) => setTempDuration(e.target.value)}
                className="flex h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2"
              >
                <option value="1">1 Jam</option>
                <option value="4">4 Jam</option>
                <option value="8">8 Jam</option>
                <option value="12">12 Jam</option>
                <option value="24">24 Jam (1 Hari)</option>
                <option value="168">7 Hari (1 Minggu)</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="temp-max-uses">Batas Login Berapa Kali? (Opsional)</Label>
              <Input
                id="temp-max-uses"
                type="number"
                placeholder="Kosongkan jika bebas"
                value={tempMaxUses}
                onChange={(e) => setTempMaxUses(e.target.value.replace(/\D/g, ''))}
                className="h-11 rounded-xl bg-slate-50 border-slate-200"
              />
            </div>
            <Button
              type="submit"
              disabled={isGeneratingCode}
              className="w-full rounded-xl h-11 font-bold transition-all hover:-translate-y-0.5 active:translate-y-0"
            >
              {isGeneratingCode ? 'Membuat...' : 'Generate Kode Akses'}
            </Button>
          </form>
        </Card>
      </div>

      {/* DAFTAR KODE AKSES SEMENTARA */}
      <Card className="p-6 rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="mb-5">
          <h3 className="font-black text-lg text-slate-900">Daftar Kode Akses Sementara</h3>
          <p className="text-xs text-muted-foreground mt-1">Pantau akses aktif dan matikan kode saat event selesai.</p>
        </div>
        {tempCodes === undefined ? (
          <div className="space-y-3 animate-pulse">
            <div className="h-10 rounded-xl bg-slate-100" />
            <div className="h-10 rounded-xl bg-slate-100" />
            <div className="h-10 rounded-xl bg-slate-100" />
          </div>
        ) : tempCodes.length === 0 ? (
          <div className="text-center py-10 px-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/70">
            <p className="text-sm font-bold text-slate-700">Belum ada kode akses sementara</p>
            <p className="text-xs text-muted-foreground mt-1">Buat kode baru untuk membagikan akses admin terbatas.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-100">
            <table className="w-full text-sm border-collapse text-left">
              <thead className="bg-slate-50">
                <tr className="border-b border-slate-100 text-muted-foreground font-semibold">
                  <th className="py-3 px-4">Nama / Label</th>
                  <th className="py-3 px-4">Dibuat</th>
                  <th className="py-3 px-4">Kedaluwarsa</th>
                  <th className="py-3 px-4 text-center">Penggunaan</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {tempCodes.map((code) => (
                  <tr key={code._id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70">
                    <td className="py-4 px-4 font-bold text-slate-900">{code.label}</td>
                    <td className="py-4 px-4 text-muted-foreground">
                      {new Date(code.createdAt).toLocaleString('id-ID', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })}
                    </td>
                    <td className="py-4 px-4 text-muted-foreground">
                      {code.expiresAt === 0
                        ? 'Dimatikan'
                        : new Date(code.expiresAt).toLocaleString('id-ID', {
                            dateStyle: 'short',
                            timeStyle: 'short',
                          })}
                    </td>
                    <td className="py-4 px-4 text-center font-mono">
                      {code.usedCount}
                      {code.maxUses !== undefined ? ` / ${code.maxUses}` : ''}
                    </td>
                    <td className="py-4 px-4">
                      {code.isExpired || code.expiresAt === 0 ? (
                        <span className="text-xs font-bold uppercase tracking-wider bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full">
                          Tidak Aktif
                        </span>
                      ) : (
                        <span className="text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                          Aktif
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right">
                      {!code.isExpired && code.expiresAt !== 0 ? (
                        <Button
                          variant="ghost"
                          onClick={() => handleRevokeCode(code._id)}
                          className="text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-50 h-8 rounded-xl px-3"
                        >
                          Matikan
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">N/A</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Nilai Bawaan Display */}
      <Card className="p-6 rounded-3xl border border-slate-200 bg-white shadow-sm">
        <h3 className="font-black text-lg mb-1 text-slate-900">Nilai Bawaan Display</h3>
        <p className="text-xs text-muted-foreground mb-5">Pengaturan ini memengaruhi tampilan scoreboard, bukan halaman admin.</p>
        <div className="space-y-4 max-w-md">
          <div className="space-y-2">
            <Label htmlFor="primary-color">Warna Utama</Label>
            <div className="flex gap-2">
              <Input
                id="primary-color"
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-14 h-11 p-1 cursor-pointer rounded-xl"
              />
              <Input
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="font-mono h-11 rounded-xl bg-slate-50 border-slate-200"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Dipakai untuk aksen, sorotan, dan state aktif pada scoreboard.
            </p>
          </div>

          <div className="pt-4">
            <Button onClick={handleSaveColor} disabled={isSaving} className="h-11 rounded-xl font-bold transition-all hover:-translate-y-0.5 active:translate-y-0">
              {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Informasi Sistem */}
      <Card className="p-6 rounded-3xl border border-slate-200 bg-white shadow-sm">
        <h3 className="font-black text-lg mb-4 text-slate-900">Informasi Sistem</h3>
        <div className="text-sm text-muted-foreground space-y-2">
          <div className="flex justify-between border-b pb-2">
            <span>Versi</span>
            <span className="font-mono">v1.0.0-beta</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span>Lingkungan</span>
            <span className="font-mono">Production (Convex)</span>
          </div>
          <div className="flex justify-between py-2">
            <span>Status</span>
            <span className="text-emerald-500 font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Operasional
            </span>
          </div>
        </div>
      </Card>

      {/* MODAL UNTUK MENAMPILKAN KODE AKSES YANG BARU DIGENERATE */}
      <Dialog
        open={Boolean(generatedCode)}
        onOpenChange={(open) => {
          if (!open) setGeneratedCode(null);
        }}
      >
        <DialogContent className="sm:max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle>Kode akses berhasil dibuat</DialogTitle>
            <DialogDescription>
              Salin kode di bawah ini dan berikan kepada panitia/wasit. Kode ini hanya akan ditampilkan SEKALI.
            </DialogDescription>
          </DialogHeader>
          {generatedCode && (
            <div className="space-y-4 text-center my-4">
              <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                {generatedCode.label}
              </div>
              <div className="text-4xl font-extrabold tracking-widest bg-slate-100 py-4 rounded-2xl font-mono border border-slate-200">
                {generatedCode.code}
              </div>
              <p className="text-xs text-muted-foreground">
                Kedaluwarsa pada:{' '}
                {new Date(generatedCode.expiresAt).toLocaleString('id-ID', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              </p>
            </div>
          )}
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCopyCode}
              className="w-full sm:w-auto"
            >
              Salin Kode
            </Button>
            <Button
              type="button"
              onClick={handleShareWhatsApp}
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Kirim ke WhatsApp
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setGeneratedCode(null)}
              className="w-full sm:w-auto"
            >
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
