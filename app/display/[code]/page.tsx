'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

const normalizeCode = (value: string) =>
  value.toUpperCase().replace(/[^A-Z0-9]/g, '');

export default function DisplayByCodePage() {
  const params = useParams();
  const router = useRouter();
  const code = normalizeCode(params.code as string);

  const matchRef = useQuery(
    api.matches.getByDisplayCode,
    code ? { displayCode: code } : 'skip',
  );

  useEffect(() => {
    if (matchRef?.matchId) {
      router.replace(`/match/${matchRef.matchId}/display`);
    }
  }, [matchRef?.matchId, router]);

  if (!code) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center space-y-3">
          <p className="text-sm uppercase tracking-widest text-white/60">Invalid Display Code</p>
          <Link href="/" className="text-xs font-bold uppercase tracking-widest text-[#fbbf24]">
            Back Home
          </Link>
        </div>
      </div>
    );
  }

  if (matchRef === undefined) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-sm font-mono text-white/60">Resolving display code...</div>
      </div>
    );
  }

  if (!matchRef) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center space-y-3">
          <p className="text-sm uppercase tracking-widest text-white/60">Display code not found</p>
          <Link href="/" className="text-xs font-bold uppercase tracking-widest text-[#fbbf24]">
            Back Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-sm font-mono text-white/60">Opening display...</div>
    </div>
  );
}
