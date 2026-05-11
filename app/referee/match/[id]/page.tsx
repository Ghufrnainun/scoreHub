'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { loadRefereeSession } from '@/lib/auth';

export default function RefereeMatchPage() {
  const params = useParams();
  const matchId = params.id as string;

  useEffect(() => {
    if (!matchId) return;
    if (typeof window === 'undefined') return;
    
    const session = loadRefereeSession(matchId);
    
    if (session?.token) {
      window.location.assign(`/match/${matchId}/control?role=referee&token=${session.token}`);
      return;
    }

    window.location.assign(`/referee/join?matchId=${matchId}`);
  }, [matchId]);


  return (
    <main
      id="main-content"
      className="min-h-screen bg-white text-slate-900 flex items-center justify-center"
    >
      <div className="flex flex-col items-center gap-4">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
        <p className="text-sm font-medium text-slate-600">
          Menghubungkan ke Server...
        </p>
        <div className="mt-4 text-xs space-y-2 text-center">
           <a href={`/referee/join?matchId=${matchId}`} className="block text-blue-600 hover:underline font-semibold">
             Klik di sini untuk Memaksa Masuk
           </a>
        </div>
      </div>
    </main>
  );
}
