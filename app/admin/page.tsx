'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery } from 'convex/react';
import QRCode from 'qrcode';
import { api } from '@/convex/_generated/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { saveAdminSession } from '@/lib/auth';
import { loadValidAdminSession } from '@/lib/admin-session';

type MatchStatus =
  | 'created'
  | 'ready_for_referee'
  | 'live'
  | 'paused'
  | 'finished';

type DashboardView = 'all' | 'history' | 'result';

interface MatchSummary {
  id: string;
  matchId: string;
  displayCode?: string;
  sport: string;
  category?: string;
  status: MatchStatus;
  assignedReferee?: string;
  home: { name: string; score: number };
  away: { name: string; score: number };
  updatedAt?: number;
}

export default function AdminDashboard() {
  const [adminSessionToken, setAdminSessionToken] = useState('');
  const [isSessionReady, setIsSessionReady] = useState(false);
  const [viewFilter, setViewFilter] = useState<DashboardView>('all');
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [shareMatch, setShareMatch] = useState<MatchSummary | null>(null);
  const [sharePin, setSharePin] = useState('');
  const [displayQr, setDisplayQr] = useState('');

  useEffect(() => {
    const session = loadValidAdminSession();
    setAdminSessionToken(session?.token || '');
    setIsSessionReady(true);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const displayCode = shareMatch?.displayCode;
    if (!displayCode) {
      setDisplayQr('');
      return;
    }

    QRCode.toDataURL(`${window.location.origin}/display/${displayCode}`, {
      margin: 1,
      width: 180,
      color: {
        dark: '#111827',
        light: '#FFFFFF',
      },
    })
      .then((url) => {
        if (!cancelled) setDisplayQr(url);
      })
      .catch(() => {
        if (!cancelled) setDisplayQr('');
      });

    return () => {
      cancelled = true;
    };
  }, [shareMatch?.displayCode]);

  const [localPinInput, setLocalPinInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const verifyAdminMutation = useMutation(api.matches.verifyAdminPin);

  const handleAdminAuth = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!localPinInput.trim()) {
      setAuthError('PIN admin wajib diisi.');
      return;
    }
    setIsVerifying(true);
    try {
      const authResult = await verifyAdminMutation({ pin: localPinInput });
      if (authResult?.token && authResult?.expiresAt) {
        saveAdminSession({
          token: authResult.token,
          expiresAt: authResult.expiresAt,
        });
        setAdminSessionToken(authResult.token);
        setAuthError('');
      } else {
        setAuthError('Login admin gagal.');
      }
    } catch (err: any) {
      const message =
        err?.data && typeof err.data === 'string'
          ? err.data
          : err?.message && typeof err.message === 'string'
            ? err.message.includes('Server Error:')
              ? err.message.split('Server Error:')[1]?.trim().split('\n')[0]
              : err.message.includes('Server Error')
                ? 'Gagal verifikasi kredensial admin.'
                : err.message
            : 'Gagal verifikasi kredensial admin.';
      setAuthError(message);
    } finally {
      setIsVerifying(false);
    }
  };

  if (isSessionReady && !adminSessionToken) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-[#F8FAFC] p-4">
        <div className="w-full max-w-md space-y-8 overflow-hidden rounded-[2rem] border border-black/10 bg-white p-8 text-center shadow-[0_24px_80px_rgba(15,23,42,0.12)] sm:p-10">
          <div className="space-y-3">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-black flex items-center justify-center shadow-xl shadow-black/20">
              <svg
                className="w-8 h-8 text-amber-500"
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
            </div>
            <h1 className="text-3xl uppercase font-black tracking-widest font-[family-name:var(--font-bebas)]">
              Akses Admin
            </h1>
            <p className="text-slate-500 font-medium text-sm">
              Masukkan password admin untuk mengelola turnamen.
            </p>
          </div>

          <form onSubmit={handleAdminAuth} className="space-y-6">
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="••••"
                value={localPinInput}
                onChange={(e) => setLocalPinInput(e.target.value)}
                className="h-16 rounded-2xl border-black/10 bg-black/[0.035] text-center text-3xl font-bold tracking-[0.5em] transition-all focus:border-black/25 focus:bg-white"
                autoFocus
              />
              {authError && (
                <p className="text-xs font-bold uppercase tracking-widest text-red-500 animate-shake">
                  {authError}
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <Link
                href="/"
                className="inline-flex h-14 flex-1 items-center justify-center rounded-full border border-black/10 text-[11px] font-black uppercase tracking-[0.2em] text-black/60 transition-all hover:border-black/30 hover:text-black"
              >
                Kembali
              </Link>
              <Button
                type="submit"
                disabled={isVerifying}
                className="h-14 flex-[2] rounded-full bg-black text-[11px] font-bold uppercase tracking-[0.3em] text-white shadow-lg shadow-black/20 transition-all hover:-translate-y-0.5 hover:bg-neutral-800 active:translate-y-0"
              >
                {isVerifying ? 'Memverifikasi...' : 'Masuk'}
              </Button>
            </div>
          </form>
        </div>
      </main>
    );
  }

  const matchData = useQuery(
    api.matches.listAdmin,
    isSessionReady && adminSessionToken ? { adminSessionToken } : 'skip',
  );

  const finishMatch = useMutation(api.matches.finishMatch);
  const deleteMatch = useMutation(api.matches.deleteMatch);
  const issueRefereeAccessToken = useMutation(
    api.matches.issueRefereeAccessToken,
  );

  const onFinishMatch = async (matchId: string) => {
    if (!adminSessionToken) return;
    try {
      await finishMatch({
        matchId,
        role: 'admin',
        adminSessionToken,
      });
      setFeedback({
        type: 'success',
        message: 'Pertandingan berhasil diakhiri.',
      });
    } catch (error) {
      console.error('Failed to finish match:', error);
      setFeedback({
        type: 'error',
        message: 'Gagal mengakhiri match. Silakan coba lagi.',
      });
    }
  };

  const onDeleteMatch = async (matchId: string) => {
    if (!adminSessionToken) return;
    try {
      await deleteMatch({ matchId, adminSessionToken });
      setFeedback({
        type: 'success',
        message: 'Pertandingan berhasil dihapus.',
      });
    } catch (error) {
      console.error('Failed to delete match:', error);
      setFeedback({
        type: 'error',
        message: 'Gagal menghapus match. Silakan coba lagi.',
      });
    }
  };

  const isLoading = !isSessionReady || matchData === undefined;

  const matches = useMemo<MatchSummary[]>(() => {
    const data = matchData || [];
    return data.map((item: any, index: number) => ({
      id: item.matchId || `${index}`,
      matchId: item.matchId,
      displayCode: item.displayCode || undefined,
      sport: item.sport,
      category: item.category,
      status: item.status,
      assignedReferee: item.assignedReferee,
      home: {
        name: item.teams?.home || 'HOME',
        score: item.scores?.home || 0,
      },
      away: {
        name: item.teams?.away || 'AWAY',
        score: item.scores?.away || 0,
      },
      updatedAt: item.updatedAt,
    }));
  }, [matchData]);

  const filteredMatches = useMemo(() => {
    return matches.filter((match) => {
      if (viewFilter === 'history') return match.status !== 'finished';
      if (viewFilter === 'result') return match.status === 'finished';
      return true;
    });
  }, [matches, viewFilter]);

  const statusCounts = useMemo(() => {
    return matches.reduce(
      (acc, match) => {
        acc.all += 1;
        if (match.status === 'finished') {
          acc.result += 1;
        } else {
          acc.history += 1;
        }
        return acc;
      },
      {
        all: 0,
        history: 0,
        result: 0,
      } as Record<string, number>,
    );
  }, [matches]);

  const statusDot: Record<MatchStatus, string> = {
    created: 'bg-slate-400',
    ready_for_referee: 'bg-amber-500',
    live: 'bg-emerald-500',
    paused: 'bg-orange-500',
    finished: 'bg-rose-500',
  };

  const statusBadge: Record<MatchStatus, string> = {
    created: 'bg-slate-500/10 text-slate-700',
    ready_for_referee: 'bg-amber-500/10 text-amber-700',
    live: 'bg-emerald-500/10 text-emerald-700',
    paused: 'bg-orange-500/10 text-orange-700',
    finished: 'bg-rose-500/10 text-rose-700',
  };



  return (
    <div className="space-y-7">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-[family-name:var(--font-bebas)] text-3xl uppercase tracking-wide text-black text-balance sm:text-4xl">
            Dashboard Pertandingan
          </h1>
          <p className="text-xs sm:text-sm text-black/60 font-medium text-pretty">
            Pantau match aktif, buka kontrol, dan bagikan akses wasit dari satu
            tempat.
          </p>
        </div>
        <Link href="/create">
          <Button className="h-11 rounded-full bg-[#111827] px-6 text-xs font-bold uppercase tracking-wide text-white shadow-lg shadow-black/15 transition-transform hover:-translate-y-0.5 hover:bg-black active:translate-y-0">
            <svg
              aria-hidden="true"
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Buat Pertandingan
          </Button>
        </Link>
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

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Card className="rounded-2xl border border-black/10 bg-white/95 p-5 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Total
          </div>
          <div className="mt-2 text-3xl font-black tabular-nums text-foreground">
            {statusCounts.all}
          </div>
        </Card>
        <Card className="rounded-2xl border border-black/10 bg-white/95 p-5 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Aktif
          </div>
          <div className="mt-2 text-3xl font-black tabular-nums text-foreground">
            {statusCounts.history}
          </div>
        </Card>
        <Card className="rounded-2xl border border-black/10 bg-white/95 p-5 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Hasil
          </div>
          <div className="mt-2 text-3xl font-black tabular-nums text-foreground">
            {statusCounts.result}
          </div>
        </Card>
      </div>

      <Card className="rounded-3xl border border-black/10 bg-white/95 p-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          {(['all', 'history', 'result'] as DashboardView[]).map((view) => (
            <button
              key={view}
              type="button"
              onClick={() => setViewFilter(view)}
              className={`h-11 rounded-full px-5 text-xs font-bold uppercase tracking-widest transition-colors ${
                viewFilter === view
                  ? 'bg-black text-white'
                  : 'bg-black/5 text-black/50 hover:bg-black/10'
              }`}
            >
              {view === 'all'
                ? 'semua'
                : view === 'history'
                  ? 'aktif'
                  : 'hasil'}
            </button>
          ))}
        </div>
      </Card>



      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-44 animate-pulse rounded-3xl bg-secondary/70 motion-reduce:animate-none"
            />
          ))}
        </div>
      ) : filteredMatches.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-black/15 bg-white/70 py-16 text-center">
          <div className="mx-auto mb-3 h-12 w-12 rounded-2xl bg-black/[0.04]" />
          <div className="mb-1 font-semibold text-black/70">
            Belum ada pertandingan pada kategori ini.
          </div>
          <Link
            href="/create"
            className="mt-4 inline-flex rounded-full border border-black/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-black/60 hover:border-black/30 hover:text-black"
          >
            Buat Match
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredMatches.map((match, index) => (
            <Card
              key={match.id}
              style={{ animationDelay: `${index * 75}ms` }}
              className="flex flex-col gap-4 rounded-3xl border border-black/10 bg-white p-5 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both transition-[border-color,box-shadow,transform] hover:-translate-y-1 hover:border-black/25 hover:shadow-lg hover:shadow-black/5"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${statusDot[match.status]} ${match.status === 'live' ? 'animate-pulse motion-reduce:animate-none' : ''}`}
                    />
                    <span className="text-xs font-mono font-bold text-muted-foreground">
                      {match.matchId}
                    </span>
                  </div>
                  <div className="text-xs font-bold uppercase tracking-wider text-black/50">
                    CODE: {match.displayCode || '-'}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-xs font-bold uppercase tracking-wider bg-black/5 px-2 py-1 rounded text-black/60">
                    {match.sport}
                  </span>
                  <span
                    className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded ${statusBadge[match.status]}`}
                  >
                    {match.status}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-2xl bg-black/[0.025] px-3 py-4">
                <div className="text-center flex-1">
                  <div className="font-bold truncate text-sm mb-1">
                    {match.home.name}
                  </div>
                  <div className="text-5xl font-black tabular-nums leading-none">
                    {match.home.score}
                  </div>
                </div>
                <div className="text-xs font-bold text-muted-foreground px-2">
                  VS
                </div>
                <div className="text-center flex-1">
                  <div className="font-bold truncate text-sm mb-1">
                    {match.away.name}
                  </div>
                  <div className="text-5xl font-black tabular-nums leading-none">
                    {match.away.score}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2 mt-auto">
                <Link
                  href={`/admin/matches/${match.matchId}/control`}
                  className="w-full"
                >
                  <Button className="h-11 w-full rounded-full bg-[#111827] text-xs font-bold uppercase tracking-wider text-white shadow-sm hover:bg-black">
                    Buka Kontrol
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Link
                  href={
                    match.displayCode
                      ? `/display/${match.displayCode}`
                      : `/match/${match.matchId}/display`
                  }
                  target="_blank"
                  className="w-full"
                >
                  <Button
                    variant="outline"
                    className="h-11 w-full rounded-full border-black/10 text-xs font-bold text-black hover:bg-black/5 hover:text-black"
                  >
                    Tampilan
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="h-11 w-full rounded-full border-black/10 text-xs font-bold text-black hover:bg-black/5 hover:text-black"
                  onClick={() => {
                    if (!match.displayCode) return;
                    const link = `${window.location.origin}/display/${match.displayCode}`;
                    navigator.clipboard.writeText(link);
                    setFeedback({
                      type: 'success',
                      message: 'Link display berhasil disalin.',
                    });
                  }}
                  disabled={!match.displayCode}
                >
                  Salin Link Layar
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-2 rounded-2xl bg-black/[0.025] p-2">
                <Button
                  variant="ghost"
                  className="h-10 w-full rounded-xl px-2 text-[11px] font-bold uppercase tracking-tight text-black/70 hover:bg-white hover:text-black"
                  onClick={async () => {
                    if (!match.displayCode || !adminSessionToken) return;
                    try {
                      const access = await issueRefereeAccessToken({
                        matchId: match.matchId,
                        role: 'admin',
                        adminSessionToken,
                        refereeName: match.assignedReferee || undefined,
                      });
                      const link = `${window.location.origin}/match/${access.matchId}/control?role=referee&token=${encodeURIComponent(access.token)}`;
                      navigator.clipboard.writeText(link);
                      setFeedback({
                        type: 'success',
                        message: 'Link kontrol wasit berhasil disalin.',
                      });
                    } catch (error) {
                      console.error(
                        'Failed to issue referee access token:',
                        error,
                      );
                      setFeedback({
                        type: 'error',
                        message: 'Gagal membuat link kontrol wasit.',
                      });
                    }
                  }}
                  disabled={!match.displayCode}
                >
                  Link Wasit
                </Button>
                <Button
                  variant="ghost"
                  className="h-10 w-full rounded-xl px-2 text-[11px] font-bold uppercase tracking-tight text-black/70 hover:bg-white hover:text-black"
                  onClick={() => {
                    if (!match.displayCode) return;
                    setSharePin('');
                    setShareMatch(match);
                  }}
                  disabled={!match.displayCode}
                >
                  Share Center
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-2 border-t border-black/5 pt-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs h-10 rounded-full text-warn hover:bg-warn/10 hover:text-warn font-bold transition-transform active:scale-95"
                  onClick={() => onFinishMatch(match.matchId)}
                  disabled={match.status === 'finished'}
                >
                  Akhiri
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-xs h-10 rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive font-bold transition-transform active:scale-95"
                    >
                      Hapus
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Hapus Pertandingan?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tindakan ini tidak dapat dibatalkan. Ini akan secara
                        permanen menghapus pertandingan{' '}
                        <strong>
                          {match.home.name} vs {match.away.name}
                        </strong>{' '}
                        dan menghapus semua data terkait.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Batal</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                        onClick={() => onDeleteMatch(match.matchId)}
                      >
                        Hapus Pertandingan
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog
        open={Boolean(shareMatch)}
        onOpenChange={(open) => {
          if (!open) {
            setShareMatch(null);
            setSharePin('');
            setDisplayQr('');
          }
        }}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Share Center</DialogTitle>
            <DialogDescription>
              Siapkan link display, akses wasit, dan pesan WhatsApp dari satu
              panel.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-2xl border border-black/10 bg-[#F8FAFC] p-4">
              <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-start">
                <div>
                  <div className="mt-1 text-lg font-black text-black">
                    {shareMatch
                      ? `${shareMatch.home.name} vs ${shareMatch.away.name}`
                      : '-'}
                  </div>
                  <div className="mt-2 grid gap-2 text-xs sm:grid-cols-2">
                    <div className="rounded-xl bg-white p-3">
                      <div className="font-bold uppercase tracking-widest text-black/35">
                        Kode Display
                      </div>
                      <div className="mt-1 font-mono text-base font-black">
                        {shareMatch?.displayCode || '-'}
                      </div>
                    </div>
                    <div className="rounded-xl bg-white p-3">
                      <div className="font-bold uppercase tracking-widest text-black/35">
                        Status
                      </div>
                      <div className="mt-1 font-black uppercase">
                        {shareMatch?.status || '-'}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="w-fit rounded-2xl border border-black/10 bg-white p-3">
                  {displayQr ? (
                    <img
                      src={displayQr}
                      alt="QR link display"
                      className="h-32 w-32"
                    />
                  ) : (
                    <div className="flex h-32 w-32 items-center justify-center text-center text-[10px] font-black uppercase tracking-widest text-black/35">
                      QR belum siap
                    </div>
                  )}
                  <div className="mt-2 text-center text-[10px] font-black uppercase tracking-widest text-black/40">
                    QR Display
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Button
                type="button"
                variant="outline"
                className="h-11 rounded-xl border-black/10 font-bold text-black hover:bg-black/5 hover:text-black"
                disabled={!shareMatch?.displayCode}
                onClick={() => {
                  if (!shareMatch?.displayCode) return;
                  navigator.clipboard.writeText(
                    `${window.location.origin}/display/${shareMatch.displayCode}`,
                  );
                  setFeedback({
                    type: 'success',
                    message: 'Link display disalin.',
                  });
                }}
              >
                Salin Link Display
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-11 rounded-xl border-black/10 font-bold text-black hover:bg-black/5 hover:text-black"
                disabled={!shareMatch?.displayCode || !sharePin}
                onClick={() => {
                  if (!shareMatch?.displayCode || !sharePin) return;
                  navigator.clipboard.writeText(
                    `${window.location.origin}/referee/join?code=${shareMatch.displayCode}&pin=${sharePin}`,
                  );
                  setFeedback({
                    type: 'success',
                    message: 'Link join wasit disalin.',
                  });
                }}
              >
                Salin Link Join Wasit
              </Button>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="share-pin"
                className="text-xs font-black uppercase tracking-widest text-black/45"
              >
                PIN wasit untuk auto-join
              </label>
              <Input
                id="share-pin"
                value={sharePin}
                onChange={(event) =>
                  setSharePin(event.target.value.replace(/\D/g, '').slice(0, 6))
                }
                placeholder="PIN wasit (opsional)"
                inputMode="numeric"
                className="h-11 rounded-xl"
              />
              <p className="text-xs text-black/45">
                Direct token tetap bisa dibuat tanpa PIN. Auto-join butuh PIN
                wasit.
              </p>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShareMatch(null);
                setSharePin('');
                setDisplayQr('');
              }}
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="outline"
              className="border-black/10 font-bold text-black hover:bg-black/5 hover:text-black"
              onClick={async () => {
                if (!shareMatch?.displayCode || !adminSessionToken) return;
                try {
                  const access = await issueRefereeAccessToken({
                    matchId: shareMatch.matchId,
                    role: 'admin',
                    adminSessionToken,
                    refereeName: shareMatch.assignedReferee || undefined,
                  });
                  const controlLink = `${window.location.origin}/match/${access.matchId}/control?role=referee&token=${encodeURIComponent(access.token)}`;
                  navigator.clipboard.writeText(controlLink);
                  setFeedback({
                    type: 'success',
                    message: 'Direct link wasit disalin.',
                  });
                } catch (error) {
                  console.error('Failed to issue referee access token:', error);
                  setFeedback({
                    type: 'error',
                    message: 'Gagal membuat direct link wasit.',
                  });
                }
              }}
            >
              Salin Direct Wasit
            </Button>
            <Button
              type="button"
              onClick={async () => {
                if (!shareMatch?.displayCode || !adminSessionToken) return;
                try {
                  const access = await issueRefereeAccessToken({
                    matchId: shareMatch.matchId,
                    role: 'admin',
                    adminSessionToken,
                    refereeName: shareMatch.assignedReferee || undefined,
                  });
                  const controlLink = `${window.location.origin}/match/${access.matchId}/control?role=referee&token=${encodeURIComponent(access.token)}`;
                  const pinText = sharePin || '[backup PIN opsional]';
                  const msg = `Akses Wasit

Kode Tampilan: ${shareMatch.displayCode}
PIN: ${pinText}

Link Kontrol Wasit (langsung masuk):
${controlLink}

Link Display:
${window.location.origin}/display/${shareMatch.displayCode}`;
                  const wa = `https://wa.me/?text=${encodeURIComponent(msg)}`;
                  window.open(wa, '_blank', 'noopener,noreferrer');
                  setShareMatch(null);
                  setSharePin('');
                } catch (error) {
                  console.error(
                    'Failed to issue referee access token for WhatsApp:',
                    error,
                  );
                  setFeedback({
                    type: 'error',
                    message: 'Gagal membuat link direct wasit untuk WhatsApp.',
                  });
                }
              }}
            >
              Kirim ke WhatsApp
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
