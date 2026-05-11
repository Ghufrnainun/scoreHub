'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useRouter } from 'next/navigation';
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
import { ADMIN_AUTH_STORAGE_KEY, isAdminAuthenticated } from '@/lib/auth';

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
  const router = useRouter();
  const [adminPin, setAdminPin] = useState('');
  const [isPinReady, setIsPinReady] = useState(false);
  const [viewFilter, setViewFilter] = useState<DashboardView>('all');
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [shareMatch, setShareMatch] = useState<MatchSummary | null>(null);
  const [sharePin, setSharePin] = useState('');

  useEffect(() => {
    const raw = localStorage.getItem(ADMIN_AUTH_STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setAdminPin(parsed?.pin || '');
      } catch {
        setAdminPin('');
      }
    }
    setIsPinReady(true);
  }, []);

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    setIsAuthenticated(isAdminAuthenticated());
  }, []);

  const [localPinInput, setLocalPinInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const verifyAdminMutation = useMutation(api.matches.verifyAdminPin);

  const handleAdminAuth = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!localPinInput) return;
    setIsVerifying(true);
    try {
      const isValid = await verifyAdminMutation({ pin: localPinInput });
      if (isValid) {
        localStorage.setItem(
          ADMIN_AUTH_STORAGE_KEY,
          JSON.stringify({ pin: localPinInput, ts: Date.now() }),
        );
        setAdminPin(localPinInput);
        setIsAuthenticated(true);
      } else {
        setAuthError('PIN Administrator Salah');
      }
    } catch (err) {
      setAuthError('Gagal verifikasi PIN');
    } finally {
      setIsVerifying(false);
    }
  };

  if (isPinReady && !isAuthenticated) {
    return (
      <main className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-[2.5rem] border border-black/10 shadow-2xl overflow-hidden p-8 sm:p-10 text-center space-y-8">
          <div className="space-y-3">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-black flex items-center justify-center shadow-xl shadow-black/20">
              <svg className="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-3xl uppercase font-black tracking-widest font-[family-name:var(--font-bebas)]">Akses Admin</h1>
            <p className="text-slate-500 font-medium text-sm">Masukkan PIN administrator untuk mengelola turnamen.</p>
          </div>
          
          <form onSubmit={handleAdminAuth} className="space-y-6">
            <div className="space-y-2">
              <Input 
                type="password" 
                placeholder="••••" 
                value={localPinInput} 
                onChange={(e) => setLocalPinInput(e.target.value)} 
                className="h-16 text-center text-3xl tracking-[0.5em] font-bold rounded-2xl border-black/10 bg-black/5 focus:bg-white focus:border-black/20 transition-all" 
                autoFocus
              />
              {authError && (
                <p className="text-xs font-bold uppercase tracking-widest text-red-500 animate-shake">{authError}</p>
              )}
            </div>
            
            <div className="flex gap-3">
              <Link href="/" className="flex-1 h-14 inline-flex items-center justify-center rounded-full border border-black/10 text-[11px] font-black uppercase tracking-[0.2em] text-black/60 hover:border-black/30 transition-all">Kembali</Link>
              <Button 
                type="submit"
                disabled={isVerifying} 
                className="flex-[2] h-14 rounded-full bg-black text-white hover:bg-neutral-800 text-[11px] font-bold uppercase tracking-[0.3em] shadow-lg shadow-black/20 transition-all"
              >
                {isVerifying ? "Memverifikasi..." : "Masuk"}
              </Button>
            </div>
          </form>
        </div>
      </main>
    );
  }

  const matchData = useQuery(
    api.matches.listAdmin,
    isPinReady ? { adminPin: adminPin || undefined } : 'skip',
  );

  const finishMatch = useMutation(api.matches.finishMatch);
  const deleteMatch = useMutation(api.matches.deleteMatch);
  const issueRefereeAccessToken = useMutation(api.matches.issueRefereeAccessToken);

  const onFinishMatch = async (matchId: string) => {
    if (!adminPin) return;
    try {
      await finishMatch({ matchId, role: 'admin', pin: adminPin });
      setFeedback({ type: 'success', message: 'Pertandingan berhasil diakhiri.' });
    } catch (error) {
      console.error('Failed to finish match:', error);
      setFeedback({
        type: 'error',
        message: 'Gagal mengakhiri match. Silakan coba lagi.',
      });
    }
  };

  const onDeleteMatch = async (matchId: string) => {
    if (!adminPin) return;
    try {
      await deleteMatch({ matchId, pin: adminPin });
      setFeedback({ type: 'success', message: 'Pertandingan berhasil dihapus.' });
    } catch (error) {
      console.error('Failed to delete match:', error);
      setFeedback({
        type: 'error',
        message: 'Gagal menghapus match. Silakan coba lagi.',
      });
    }
  };

  const isLoading = !isPinReady || matchData === undefined;

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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-[family-name:var(--font-bebas)] tracking-wide uppercase text-black text-balance">
            Dashboard Pertandingan
          </h1>
          <p className="text-xs sm:text-sm text-black/60 font-medium text-pretty">
            Buat di /create, lalu kelola dan bagikan dari sini.
          </p>
        </div>
        <Link href="/create">
          <Button className="rounded-full bg-[#111827] text-white hover:bg-black shadow-lg shadow-black/20 tracking-wide uppercase font-bold text-xs h-10 px-6">
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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="p-4 rounded-2xl border border-black/10 bg-white/90">
          <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Total
          </div>
          <div className="mt-2 text-2xl font-black text-foreground">
            {statusCounts.all}
          </div>
        </Card>
        <Card className="p-4 rounded-2xl border border-black/10 bg-white/90">
          <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Riwayat
          </div>
          <div className="mt-2 text-2xl font-black text-foreground">
            {statusCounts.history}
          </div>
        </Card>
        <Card className="p-4 rounded-2xl border border-black/10 bg-white/90">
          <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Hasil
          </div>
          <div className="mt-2 text-2xl font-black text-foreground">
            {statusCounts.result}
          </div>
        </Card>
      </div>

      <Card className="p-4 rounded-3xl border border-black/10 bg-white/90">
        <div className="flex flex-wrap items-center gap-2">
          {(['all', 'history', 'result'] as DashboardView[]).map((view) => (
            <button
              key={view}
              type="button"
              onClick={() => setViewFilter(view)}
              className={`h-11 px-5 rounded-full text-xs font-bold uppercase tracking-widest transition-colors ${
                viewFilter === view
                  ? 'bg-black text-white'
                  : 'bg-black/5 text-black/50 hover:bg-black/10'
              }`}
            >
              {view === 'all'
                ? 'total'
                : view === 'history'
                  ? 'riwayat'
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
              className="h-40 bg-secondary/50 animate-pulse motion-reduce:animate-none rounded-xl"
            />
          ))}
        </div>
      ) : filteredMatches.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed rounded-xl">
          <div className="text-muted-foreground mb-1">Belum ada pertandingan pada kategori ini.</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMatches.map((match) => (
            <Card
              key={match.id}
              className="p-5 flex flex-col gap-4 border border-black/10 shadow-sm bg-white hover:border-black/20 rounded-3xl transition-[border-color,box-shadow]"
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

              <div className="flex justify-between items-center py-2">
                <div className="text-center flex-1">
                  <div className="font-bold truncate text-sm mb-1">
                    {match.home.name}
                  </div>
                  <div className="text-3xl font-black">{match.home.score}</div>
                </div>
                <div className="text-xs font-bold text-muted-foreground px-2">
                  VS
                </div>
                <div className="text-center flex-1">
                  <div className="font-bold truncate text-sm mb-1">
                    {match.away.name}
                  </div>
                  <div className="text-3xl font-black">{match.away.score}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-auto">
                <Link
                  href={`/admin/matches/${match.matchId}/control`}
                  className="w-full"
                >
                  <Button
                    variant="secondary"
                    className="w-full text-xs h-11 rounded-full bg-black/5 hover:bg-black/10 text-black shadow-none"
                  >
                    Kontrol
                  </Button>
                </Link>
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
                    className="w-full text-xs h-11 rounded-full border-black/10 text-black hover:bg-black/5 hover:text-black"
                  >
                    Buka Tampilan
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-auto">
                <Button
                  variant="outline"
                  className="w-full text-xs h-11 rounded-full border-black/10 text-black hover:bg-black/5 hover:text-black px-1 font-bold uppercase tracking-tight"
                  onClick={async () => {
                    if (!match.displayCode || !adminPin) return;
                    try {
                      const access = await issueRefereeAccessToken({
                        matchId: match.matchId,
                        role: 'admin',
                        pin: adminPin,
                        refereeName: match.assignedReferee || undefined,
                      });
                      const link = `${window.location.origin}/match/${access.matchId}/control?role=referee&token=${encodeURIComponent(access.token)}`;
                      navigator.clipboard.writeText(link);
                      setFeedback({
                        type: 'success',
                        message: 'Link kontrol wasit direct berhasil disalin.',
                      });
                    } catch (error) {
                      console.error('Failed to issue referee access token:', error);
                      setFeedback({
                        type: 'error',
                        message: 'Gagal membuat link direct wasit.',
                      });
                    }
                  }}
                  disabled={!match.displayCode}
                >
                  Link Kontrol
                </Button>
                <Button
                  variant="outline"
                  className="w-full text-xs h-11 rounded-full border-black/10 text-black hover:bg-black/5 hover:text-black px-1 font-bold uppercase tracking-tight"
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
                  Link Layar
                </Button>
                <Button
                  variant="outline"
                  className="w-full text-xs h-11 rounded-full border-black/10 text-black hover:bg-black/5 hover:text-black px-1 font-bold uppercase tracking-tight"
                  onClick={() => {
                    if (!match.displayCode) return;
                    setSharePin('');
                    setShareMatch(match);
                  }}
                  disabled={!match.displayCode}
                >
                  WhatsApp
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-2 border-t border-black/5 pt-3 mt-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs h-11 rounded-full text-amber-600 hover:bg-amber-50 hover:text-amber-700 font-bold"
                  onClick={() => onFinishMatch(match.matchId)}
                  disabled={match.status === 'finished'}
                >
                  AKHIRI MATCH
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs h-11 rounded-full text-red-600 hover:bg-red-50 hover:text-red-700 font-bold"
                >
                  HAPUS
                </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Hapus Pertandingan?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tindakan ini tidak dapat dibatalkan. Ini akan secara permanen
                        menghapus pertandingan{' '}
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
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Bagikan Akses Wasit</DialogTitle>
            <DialogDescription>
              Masukkan PIN wasit (opsional) sebelum kirim ke WhatsApp.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">
              Kode tampilan: <span className="font-mono font-bold">{shareMatch?.displayCode || '-'}</span>
            </p>
            <Input
              value={sharePin}
              onChange={(event) =>
                setSharePin(event.target.value.replace(/\D/g, '').slice(0, 6))
              }
              placeholder="PIN wasit (opsional)"
              inputMode="numeric"
              className="h-11"
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShareMatch(null);
                setSharePin('');
              }}
            >
              Batal
            </Button>
            <Button
              type="button"
              onClick={async () => {
                if (!shareMatch?.displayCode || !adminPin) return;
                try {
                  const access = await issueRefereeAccessToken({
                    matchId: shareMatch.matchId,
                    role: 'admin',
                    pin: adminPin,
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
                  console.error('Failed to issue referee access token for WhatsApp:', error);
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
