'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { loadRefereeSession } from '@/lib/auth';
import { useMatch } from '@/hooks/use-match';

export default function RefereeMatchPage() {
  const params = useParams();
  const matchId = params.id as string;

  const [token, setToken] = useState<string | undefined>(undefined);
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    const session = loadRefereeSession(matchId);
    setToken(session?.token);
    setSessionReady(true);
  }, [matchId]);

  const { match, isLoading, error, awardPoint, undo } = useMatch({
    matchId,
    role: 'referee',
    token,
  });

  const isLocked = useMemo(
    () => !sessionReady || !token || !match || match.status === 'finished',
    [match, sessionReady, token],
  );

  if (!sessionReady) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] text-[#111827] flex items-center justify-center">
        <div className="text-sm font-mono text-black/60">Preparing referee session...</div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] text-[#111827] px-4 py-16">
        <div className="max-w-xl mx-auto rounded-3xl border border-black/10 bg-white p-8 text-center shadow-sm">
          <p className="text-xs uppercase tracking-widest text-black/50 font-bold">
            Referee Session Missing
          </p>
          <h1 className="mt-3 text-3xl font-[family-name:var(--font-bebas)] tracking-[0.08em] uppercase">
            Join First
          </h1>
          <p className="mt-2 text-sm text-black/60">
            Sesi wasit tidak ditemukan. Masuk lewat halaman join menggunakan display code + PIN.
          </p>
          <Link href="/referee/join" className="inline-block mt-6">
            <Button className="rounded-full bg-[#111827] hover:bg-black text-white text-xs uppercase tracking-widest font-bold">
              Go to Referee Join
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading || !match) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] text-[#111827] flex items-center justify-center">
        <div className="text-sm font-mono text-black/60">Loading match...</div>
      </div>
    );
  }

  const home = match.teams.home;
  const away = match.teams.away;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#111827] px-4 py-6 sm:py-10">
      <div className="mx-auto w-full max-w-4xl space-y-4">
        <Card className="rounded-3xl border border-black/10 bg-white p-5 sm:p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-black/50 font-bold">
                Referee Control
              </p>
              <h1 className="text-2xl font-[family-name:var(--font-bebas)] uppercase tracking-[0.08em]">
                {home.name} vs {away.name}
              </h1>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-[0.2em] text-black/50 font-bold">
                Match ID
              </p>
              <p className="text-sm font-mono font-bold">{match.matchId}</p>
              <p className="text-xs text-black/60">Display Code: {match.displayCode}</p>
            </div>
          </div>
          <div className="mt-4 text-xs text-black/60 flex flex-wrap gap-3">
            <span>Status: {match.status}</span>
            <span>Sport: {match.sport}</span>
            <span>Set: {match.currentSet}</span>
          </div>
          {error ? (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">
              {error}
            </div>
          ) : null}
        </Card>

        <Card className="rounded-3xl border border-black/10 bg-white p-6 sm:p-8 shadow-sm">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-3 rounded-full border border-black/10 bg-black/5 px-5 py-2">
              <span className="text-4xl font-black tabular-nums">{home.score}</span>
              <span className="text-lg font-bold text-black/40">-</span>
              <span className="text-4xl font-black tabular-nums">{away.score}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => awardPoint('home')}
              disabled={isLocked}
              className="h-36 rounded-3xl bg-gradient-to-br from-blue-500 to-blue-700 text-white font-black text-base uppercase tracking-[0.15em] shadow-xl active:scale-[0.98] transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Point {home.name}
            </button>
            <button
              type="button"
              onClick={() => awardPoint('away')}
              disabled={isLocked}
              className="h-36 rounded-3xl bg-gradient-to-br from-red-500 to-red-700 text-white font-black text-base uppercase tracking-[0.15em] shadow-xl active:scale-[0.98] transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Point {away.name}
            </button>
          </div>

          <div className="mt-4 flex justify-center">
            <Button
              type="button"
              variant="outline"
              onClick={undo}
              disabled={isLocked}
              className="rounded-full px-6 text-xs uppercase tracking-widest font-bold"
            >
              Undo Last Rally
            </Button>
          </div>
        </Card>

        <div className="text-center">
          <Link
            href={`/display/${match.displayCode}`}
            target="_blank"
            className="text-xs uppercase tracking-widest font-bold text-black/50 hover:text-black"
          >
            Open Display
          </Link>
        </div>
      </div>
    </div>
  );
}
