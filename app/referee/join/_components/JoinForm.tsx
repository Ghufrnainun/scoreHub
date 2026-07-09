'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { saveRefereeSession } from '@/lib/auth';

const normalizeCode = (value: string) =>
  value
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 6);

interface JoinFormProps {
  initialCode?: string;
  initialMatchId?: string;
  initialPin?: string;
}

export default function JoinForm({
  initialCode = '',
  initialMatchId = '',
  initialPin = '',
}: JoinFormProps) {
  const joinAsReferee = useMutation(api.matches.joinAsReferee);

  const [displayCode, setDisplayCode] = useState(initialCode);
  const [pin, setPin] = useState(initialPin);
  const [refereeName, setRefereeName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // If a matchId was passed, look up its display code automatically
  const matchById = useQuery(
    api.matches.get,
    initialMatchId && !initialCode ? { matchId: initialMatchId } : 'skip',
  );

  // Once we have the match from matchId, fill in the display code
  useEffect(() => {
    if (matchById?.displayCode && !displayCode) {
      setDisplayCode(normalizeCode(matchById.displayCode));
    }
  }, [matchById, displayCode]);

  // Sync with prop if it changes (though usually valid on mount)
  useEffect(() => {
    if (initialCode) {
      setDisplayCode(normalizeCode(initialCode));
    }
  }, [initialCode]);

  const canPreview = displayCode.length === 6;
  const matchPreview = useQuery(
    api.matches.getByDisplayCode,
    canPreview ? { displayCode } : 'skip',
  );

  const canSubmit = useMemo(
    () => displayCode.length === 6 && pin.trim().length >= 4 && !isSubmitting,
    [displayCode.length, isSubmitting, pin],
  );

  // Auto-submit if both are provided in URL
  useEffect(() => {
    if (initialCode && initialPin && !isSubmitting) {
      const normCode = normalizeCode(initialCode);
      if (normCode.length === 6 && initialPin.trim().length >= 4) {
        // Short delay to allow user to visually see fields were populated
        const timer = setTimeout(() => {
          const syntheticEvent = { preventDefault: () => {} } as any;
          handleSubmit(syntheticEvent);
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;

    setIsSubmitting(true);
    setError('');
    try {
      const result = await joinAsReferee({
        displayCode,
        pin: pin.trim(),
        refereeName: refereeName.trim() || undefined,
      });

      saveRefereeSession({
        matchId: result.matchId,
        displayCode: result.displayCode,
        token: result.token,
        refereeName: refereeName.trim() || undefined,
        joinedAt: Date.now(),
      });

      // Go directly to control page via absolute navigation for absolute reliability
      window.location.assign(`/match/${result.matchId}/control?role=referee&token=${result.token}`);
    } catch (err: any) {
      const msg =
        err?.data && typeof err.data === 'string'
          ? err.data
          : err?.message && typeof err.message === 'string'
            ? err.message.includes('Server Error')
              ? 'PIN wasit tidak valid atau pertandingan tidak ditemukan.'
              : err.message.replace(/^ConvexError:\s*/i, '')
            : 'Gagal masuk sebagai wasit';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8 text-center">
        <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-black/50">
          Akses Wasit
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-bebas)] text-5xl uppercase tracking-[0.08em] text-balance sm:text-6xl">
          Masuk Kontrol Pertandingan
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-black/60">
          Masukkan kode display dan PIN wasit dari admin.
        </p>
      </div>

      <Card className="rounded-[2rem] border border-black/10 bg-white p-6 shadow-[0_18px_70px_rgba(15,23,42,0.08)] sm:p-8">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="display-code"
              className="text-xs font-bold uppercase tracking-widest text-muted-foreground"
            >
              Kode Tampilan
            </label>
            <Input
              id="display-code"
              value={displayCode}
              onChange={(event) =>
                setDisplayCode(normalizeCode(event.target.value))
              }
              placeholder="Contoh: A1B2C3"
              className="mt-2 h-14 rounded-2xl border-black/10 bg-black/[0.025] text-center font-mono text-xl font-bold tracking-[0.3em] focus:bg-white"
              autoComplete="off"
              readOnly={!!matchById?.displayCode}
            />
          </div>

          <div>
            <label
              htmlFor="referee-pin"
              className="text-xs font-bold uppercase tracking-widest text-muted-foreground"
            >
              PIN Wasit
            </label>
            <Input
              id="referee-pin"
              value={pin}
              onChange={(event) =>
                setPin(event.target.value.replace(/\D/g, '').slice(0, 6))
              }
              placeholder="PIN (4-6 digit)"
              className="mt-2 h-14 rounded-2xl border-black/10 bg-black/[0.025] text-center font-mono text-xl font-bold tracking-[0.3em] focus:bg-white"
              inputMode="numeric"
              autoComplete="one-time-code"
              type="password"
              autoFocus={!!initialPin || !!initialMatchId}
            />
          </div>

          <div>
            <label
              htmlFor="referee-name"
              className="text-xs font-bold uppercase tracking-widest text-muted-foreground"
            >
              Nama Wasit (opsional)
            </label>
            <Input
              id="referee-name"
              value={refereeName}
              onChange={(event) => setRefereeName(event.target.value)}
              placeholder="Nama wasit"
              className="mt-2 h-12 rounded-2xl border-black/10 bg-black/[0.025] focus:bg-white"
              autoComplete="name"
            />
          </div>

          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {error}
            </div>
          ) : null}

          <Button
            type="submit"
            disabled={!canSubmit}
            className="h-12 w-full rounded-full bg-[#111827] text-xs font-bold uppercase tracking-widest text-white transition-transform hover:-translate-y-0.5 hover:bg-black active:translate-y-0"
          >
            {isSubmitting ? 'Memproses...' : 'Masuk Kontrol Wasit'}
          </Button>
        </form>
      </Card>

      <Card className="mt-5 rounded-3xl border border-black/10 bg-white/90 p-5 shadow-sm">
        {canPreview && matchPreview ? (
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-widest text-black/50">
              Pratinjau Pertandingan
            </p>
            <p className="text-base font-bold text-black">
              {matchPreview.teams.home} vs {matchPreview.teams.away}
            </p>
            <div className="flex flex-wrap gap-2 text-xs font-medium text-black/60">
              <span>Olahraga: {matchPreview.sport}</span>
              <span>Status: {matchPreview.status}</span>
              <span>ID Match: {matchPreview.matchId}</span>
            </div>
          </div>
        ) : (
          <p className="text-xs text-black/60">
            Pratinjau pertandingan akan muncul otomatis setelah 6 karakter kode valid.
          </p>
        )}
      </Card>

      <div className="mt-6 text-center">
        <Link
          href="/"
          className="text-xs font-bold uppercase tracking-widest text-black/50 hover:text-black"
        >
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
