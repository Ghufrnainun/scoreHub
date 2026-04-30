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

const STATUS_FILTERS: Array<'all' | MatchStatus> = [
  'all',
  'created',
  'ready_for_referee',
  'live',
  'paused',
  'finished',
];

export default function AdminDashboard() {
  const router = useRouter();
  const [adminPin, setAdminPin] = useState('');
  const [isPinReady, setIsPinReady] = useState(false);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | MatchStatus>('all');
  const [sportFilter, setSportFilter] = useState('all');
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

  useEffect(() => {
    if (!isAdminAuthenticated()) {
      router.replace('/');
    }
  }, [router]);

  const matchData = useQuery(
    api.matches.listAdmin,
    isPinReady ? { adminPin: adminPin || undefined } : 'skip',
  );

  const finishMatch = useMutation(api.matches.finishMatch);
  const deleteMatch = useMutation(api.matches.deleteMatch);

  const onFinishMatch = async (matchId: string) => {
    if (!adminPin) return;
    try {
      await finishMatch({ matchId, role: 'admin', pin: adminPin });
      setFeedback({ type: 'success', message: 'Match berhasil diakhiri.' });
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
      setFeedback({ type: 'success', message: 'Match berhasil dihapus.' });
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

  const sportOptions = useMemo(() => {
    const sports = Array.from(new Set(matches.map((match) => match.sport)));
    return sports.filter(Boolean).sort();
  }, [matches]);

  const filteredMatches = useMemo(() => {
    const term = query.trim().toLowerCase();
    return matches.filter((match) => {
      const matchesQuery =
        !term ||
        match.matchId.toLowerCase().includes(term) ||
        (match.displayCode || '').toLowerCase().includes(term) ||
        match.home.name.toLowerCase().includes(term) ||
        match.away.name.toLowerCase().includes(term);
      const matchesStatus =
        statusFilter === 'all' || match.status === statusFilter;
      const matchesSport = sportFilter === 'all' || match.sport === sportFilter;
      return matchesQuery && matchesStatus && matchesSport;
    });
  }, [matches, query, statusFilter, sportFilter]);

  const statusCounts = useMemo(() => {
    return matches.reduce(
      (acc, match) => {
        acc.total += 1;
        acc[match.status] += 1;
        return acc;
      },
      {
        total: 0,
        created: 0,
        ready_for_referee: 0,
        live: 0,
        paused: 0,
        finished: 0,
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

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="p-4 rounded-2xl border border-black/10 bg-white/90">
          <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Total
          </div>
          <div className="mt-2 text-2xl font-black text-foreground">
            {statusCounts.total}
          </div>
        </Card>
        <Card className="p-4 rounded-2xl border border-black/10 bg-white/90">
          <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Langsung
          </div>
          <div className="mt-2 text-2xl font-black text-foreground">
            {statusCounts.live}
          </div>
        </Card>
        <Card className="p-4 rounded-2xl border border-black/10 bg-white/90">
          <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Siap Wasit
          </div>
          <div className="mt-2 text-2xl font-black text-foreground">
            {statusCounts.ready_for_referee}
          </div>
        </Card>
        <Card className="p-4 rounded-2xl border border-black/10 bg-white/90">
          <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Baru
          </div>
          <div className="mt-2 text-2xl font-black text-foreground">
            {statusCounts.created}
          </div>
        </Card>
        <Card className="p-4 rounded-2xl border border-black/10 bg-white/90">
          <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Selesai
          </div>
          <div className="mt-2 text-2xl font-black text-foreground">
            {statusCounts.finished}
          </div>
        </Card>
      </div>

      <Card className="p-4 rounded-3xl border border-black/10 bg-white/90">
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-4">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Cari
            </label>
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Cari ID match, kode tampilan, atau tim..."
              className="mt-2 h-10 rounded-2xl bg-black/5 border-transparent focus:bg-white focus:border-black/20"
            />
          </div>
          <div className="space-y-3">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Status
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {STATUS_FILTERS.map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setStatusFilter(status)}
                    className={`h-11 px-4 rounded-full text-xs font-bold uppercase tracking-widest transition-colors ${
                      statusFilter === status
                        ? 'bg-black text-white'
                        : 'bg-black/5 text-black/50 hover:bg-black/10'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Cabang Olahraga
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setSportFilter('all')}
                  className={`h-11 px-4 rounded-full text-xs font-bold uppercase tracking-widest transition-colors ${
                    sportFilter === 'all'
                      ? 'bg-black text-white'
                      : 'bg-black/5 text-black/50 hover:bg-black/10'
                  }`}
                >
                  Semua
                </button>
                {sportOptions.map((sport) => (
                  <button
                    key={sport}
                    type="button"
                    onClick={() => setSportFilter(sport)}
                    className={`h-11 px-4 rounded-full text-xs font-bold uppercase tracking-widest transition-colors ${
                      sportFilter === sport
                        ? 'bg-black text-white'
                        : 'bg-black/5 text-black/50 hover:bg-black/10'
                    }`}
                  >
                    {sport}
                  </button>
                ))}
              </div>
            </div>
          </div>
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
          <div className="text-muted-foreground mb-4">Pertandingan tidak ditemukan</div>
          <Button
            onClick={() => {
              setQuery('');
              setStatusFilter('all');
              setSportFilter('all');
            }}
            className="rounded-full bg-black text-white hover:bg-black/90 tracking-widest uppercase font-bold text-xs h-10 px-6"
          >
            Reset Filters
          </Button>
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
                  <div className="text-[10px] font-bold uppercase tracking-wider text-black/50">
                    CODE: {match.displayCode || '-'}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-black/5 px-2 py-1 rounded text-black/60">
                    {match.sport}
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded ${statusBadge[match.status]}`}
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
                  className="w-full text-[10px] h-11 rounded-full border-black/10 text-black hover:bg-black/5 hover:text-black px-1 font-bold uppercase tracking-tight"
                  onClick={() => {
                    if (!match.displayCode) return;
                    const link = `${window.location.origin}/referee/join?code=${encodeURIComponent(match.displayCode)}`;
                    navigator.clipboard.writeText(link);
                    setFeedback({
                      type: 'success',
                      message: 'Link wasit berhasil disalin.',
                    });
                  }}
                  disabled={!match.displayCode}
                >
                  Link Wasit
                </Button>
                <Button
                  variant="outline"
                  className="w-full text-[10px] h-11 rounded-full border-black/10 text-black hover:bg-black/5 hover:text-black px-1 font-bold uppercase tracking-tight"
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
                  className="w-full text-[10px] h-11 rounded-full border-black/10 text-black hover:bg-black/5 hover:text-black px-1 font-bold uppercase tracking-tight"
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
                      DELETE
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
              onClick={() => {
                if (!shareMatch?.displayCode) return;
                const pinText = sharePin || '[isi PIN wasit]';
                const msg = `Akses Wasit\n\nKode Tampilan: ${shareMatch.displayCode}\nPIN: ${pinText}\n\nLink Wasit:\n${window.location.origin}/referee/join?code=${encodeURIComponent(shareMatch.displayCode)}\n\nLink Display:\n${window.location.origin}/display/${shareMatch.displayCode}`;
                const wa = `https://wa.me/?text=${encodeURIComponent(msg)}`;
                window.open(wa, '_blank', 'noopener,noreferrer');
                setShareMatch(null);
                setSharePin('');
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
