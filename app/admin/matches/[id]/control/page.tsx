'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ADMIN_AUTH_STORAGE_KEY } from '@/lib/auth';

export default function AdminMatchControlRedirectPage() {
  const router = useRouter();
  const params = useParams();
  const matchId = params.id as string;

  useEffect(() => {
    let pin = '';

    const raw = localStorage.getItem(ADMIN_AUTH_STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        pin = parsed?.pin || '';
      } catch {
        pin = '';
      }
    }

    const qs = new URLSearchParams({ role: 'admin' });
    if (pin) qs.set('pin', pin);
    router.replace(`/match/${matchId}/control?${qs.toString()}`);
  }, [matchId, router]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#111827] flex items-center justify-center">
      <div className="text-sm font-mono text-black/60">Opening admin control...</div>
    </div>
  );
}
