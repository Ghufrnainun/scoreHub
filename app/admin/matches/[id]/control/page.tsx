'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function AdminMatchControlRedirectPage() {
  const router = useRouter();
  const params = useParams();
  const matchId = params.id as string;

  useEffect(() => {
    const qs = new URLSearchParams({ role: 'admin' });
    router.replace(`/match/${matchId}/control?${qs.toString()}`);
  }, [matchId, router]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#111827] flex items-center justify-center">
      <div className="text-sm font-mono text-black/60">Opening admin control...</div>
    </div>
  );
}
