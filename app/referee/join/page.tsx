'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { saveRefereeSession } from '@/lib/auth';

const normalizeCode = (value: string) =>
  value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);

export default function RefereeJoinPage() {
  const router = useRouter();
  const joinAsReferee = useMutation(api.matches.joinAsReferee);

  const [displayCode, setDisplayCode] = useState('');
  const [pin, setPin] = useState('');
  const [refereeName, setRefereeName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('code');
    if (code) {
      setDisplayCode(normalizeCode(code));
    }
  }, []);

  const canPreview = displayCode.length >= 4;
  const matchPreview = useQuery(
    api.matches.getByDisplayCode,
    canPreview ? { displayCode } : 'skip',
  );

  const canSubmit = useMemo(
    () => displayCode.length >= 4 && pin.trim().length >= 4 && !isSubmitting,
    [displayCode.length, isSubmitting, pin],
  );

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

      router.push(`/referee/match/${result.matchId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join as referee');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#111827] px-4 py-10 sm:py-16">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-black/50">
            Referee Access
          </p>
          <h1 className="mt-3 text-4xl font-[family-name:var(--font-bebas)] tracking-[0.08em] uppercase">
            Join Match Control
          </h1>
          <p className="mt-2 text-sm text-black/60">
            Masukkan display code dan PIN wasit dari admin.
          </p>
        </div>

        <Card className="rounded-3xl border border-black/10 bg-white p-6 sm:p-8 shadow-sm">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="display-code"
                className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
              >
                Display Code
              </label>
              <Input
                id="display-code"
                value={displayCode}
                onChange={(event) => setDisplayCode(normalizeCode(event.target.value))}
                placeholder="Contoh: A1B2C3"
                className="mt-2 h-11 rounded-xl text-center font-mono tracking-[0.3em]"
                autoComplete="off"
              />
            </div>

            <div>
              <label
                htmlFor="referee-pin"
                className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
              >
                Referee PIN
              </label>
              <Input
                id="referee-pin"
                value={pin}
                onChange={(event) =>
                  setPin(event.target.value.replace(/\\D/g, '').slice(0, 6))
                }
                placeholder="PIN (4-6 digit)"
                className="mt-2 h-11 rounded-xl text-center font-mono tracking-[0.3em]"
                inputMode="numeric"
                autoComplete="one-time-code"
                type="password"
              />
            </div>

            <div>
              <label
                htmlFor="referee-name"
                className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
              >
                Referee Name (optional)
              </label>
              <Input
                id="referee-name"
                value={refereeName}
                onChange={(event) => setRefereeName(event.target.value)}
                placeholder="Nama wasit"
                className="mt-2 h-11 rounded-xl"
                autoComplete="name"
              />
            </div>

            {error ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">
                {error}
              </div>
            ) : null}

            <Button
              type="submit"
              disabled={!canSubmit}
              className="w-full h-11 rounded-full bg-[#111827] hover:bg-black text-white text-xs uppercase tracking-widest font-bold"
            >
              {isSubmitting ? 'Joining...' : 'Enter Referee Control'}
            </Button>
          </form>
        </Card>

        <Card className="mt-6 rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
          {canPreview && matchPreview ? (
            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-black/50">
                Match Preview
              </p>
              <p className="text-sm font-semibold">
                {matchPreview.teams.home} vs {matchPreview.teams.away}
              </p>
              <div className="text-xs text-black/60 flex flex-wrap gap-3">
                <span>Sport: {matchPreview.sport}</span>
                <span>Status: {matchPreview.status}</span>
                <span>Match ID: {matchPreview.matchId}</span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-black/60">
              Preview match akan muncul otomatis setelah display code valid.
            </p>
          )}
        </Card>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-xs font-bold uppercase tracking-widest text-black/50 hover:text-black"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
