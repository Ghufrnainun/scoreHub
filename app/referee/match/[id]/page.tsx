'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { loadRefereeSession } from '@/lib/auth';

export default function RefereeMatchPage() {
  const router = useRouter();
  const params = useParams();
  const matchId = params.id as string;

  useEffect(() => {
    const session = loadRefereeSession(matchId);
    if (!session?.token) {
      router.replace('/referee/join');
      return;
    }
    router.replace(`/match/${matchId}/control?role=referee`);
  }, [matchId, router]);

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
      <p className="text-sm font-mono text-muted-foreground">
        Menyiapkan kontrol wasit...
      </p>
    </div>
  );
}
