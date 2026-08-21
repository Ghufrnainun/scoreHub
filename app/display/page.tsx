'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { cn } from '@/lib/utils';

export default function SmartTvLaunchPage() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [isNavigating, setIsNavigating] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keep cursor focus always active for ease of remote/keyboard typing on load
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const normalizedCode = code.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
  
  // Active validation against backend for instant response
  const isValidLength = normalizedCode.length === 6;
  const match = useQuery(api.matches.getByDisplayCode, isValidLength ? { displayCode: normalizedCode } : 'skip');

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!isValidLength || !match?.matchId) return;
    
    setIsNavigating(true);
    // Small delay to show navigation visual feedback
    setTimeout(() => {
      router.push(`/match/${match.matchId}/display`);
    }, 300);
  };

  // Auto-open once the backend has resolved the display code to a match.
  useEffect(() => {
    if (match?.matchId) {
      const autoTimer = setTimeout(() => {
        handleSubmit();
      }, 600);
      return () => clearTimeout(autoTimer);
    }
  }, [match?.matchId]);

  const handleContainerClick = () => {
    inputRef.current?.focus();
  };

  return (
    <main 
      className="min-h-screen bg-[#09090b] text-slate-100 flex flex-col items-center justify-center p-6 overflow-hidden relative select-none"
      onClick={handleContainerClick}
    >
      {/* Atmospheric Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-900/10 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-900/10 blur-[100px] rounded-full pointer-events-none"></div>
      
      <div className="w-full max-w-2xl mx-auto flex flex-col items-center z-10">
        {/* Brand Logo */}
        <div className="flex items-center gap-3 mb-12 opacity-80">
          <div className="w-12 h-12 flex items-center justify-center">
            <Image
              src="/pb-emblem.png"
              alt="Scorehub"
              width={40}
              height={40}
              className="h-10 w-10 object-contain"
            />
          </div>
          <div>
            <h1 className="text-lg font-black uppercase tracking-[0.2em] text-white leading-none">ScoreHub</h1>
            <p className="text-xs font-bold text-blue-500 uppercase tracking-widest mt-1">Display Portal</p>
          </div>
        </div>

        <div className="text-center mb-10 space-y-3">
          <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-white uppercase font-[family-name:var(--font-bebas)]">
            Masuk ke Layar Pertandingan
          </h2>
          <p className="text-slate-400 text-lg font-medium">
            Masukkan 6 digit kode tampilan untuk memutar skor langsung.
          </p>
        </div>

        {/* Visual Entry Zone */}
        <form onSubmit={handleSubmit} className="relative w-full max-w-md group">
          {/* Invisible Real Input to capture typing/paste natively on all devices including remote input box */}
          <input
            ref={inputRef}
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="absolute inset-0 opacity-0 cursor-default pointer-events-none h-full w-full z-0"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="characters"
            spellCheck={false}
            maxLength={6}
            disabled={isNavigating}
          />

          <div className={cn(
            "relative flex justify-between items-center gap-2 sm:gap-3 p-2 transition-all duration-300",
            isFocused ? "scale-[1.02]" : "scale-100"
          )}>
            {[...Array(6)].map((_, i) => {
              const char = normalizedCode[i] || '';
              const isActive = isFocused && normalizedCode.length === i;
              
              return (
                <div
                  key={i}
                  className={cn(
                    "relative flex-1 h-16 sm:h-20 rounded-2xl border-2 flex items-center justify-center transition-all duration-200 bg-slate-900/50 backdrop-blur-xl shadow-inner",
                    isActive 
                      ? "border-blue-500 bg-slate-800/80 shadow-[0_0_20px_rgba(59,130,246,0.2)]" 
                      : char 
                        ? "border-slate-700 bg-slate-800/40" 
                        : "border-slate-800/80",
                    isNavigating && "animate-pulse"
                  )}
                >
                  <span className={cn(
                    "text-3xl sm:text-4xl font-mono font-bold uppercase tabular-nums transition-all duration-200",
                    char ? "text-white scale-110" : "text-slate-800",
                    isActive && "animate-pulse"
                  )}>
                    {char || '-'}
                  </span>
                  {isActive && (
                    <div className="absolute bottom-3 w-1/2 h-0.5 bg-blue-500 animate-pulse"></div>
                  )}
                </div>
              );
            })}
          </div>
        </form>

        {/* Interactive Helper State */}
        <div className="h-16 mt-8 flex flex-col items-center justify-center">
          {isValidLength ? (
            <div className="flex flex-col items-center animate-in fade-in zoom-in-95 duration-300">
              {match === undefined ? (
                <span className="text-blue-400 font-bold tracking-widest text-sm uppercase animate-pulse">
                  Memverifikasi Kode...
                </span>
              ) : match ? (
                <div className="flex flex-col items-center gap-2">
                  <span className="text-emerald-400 font-black tracking-widest text-sm uppercase flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                    Pertandingan Ditemukan
                  </span>
                  <p className="text-xs text-white/60 font-mono bg-white/5 px-3 py-1 rounded-full border border-white/10">
                    {match.sport.toUpperCase()} - {match.teams.home} vs {match.teams.away}
                  </p>
                </div>
              ) : (
                <span className="text-red-400 font-bold tracking-widest text-sm uppercase">
                  Kode Tidak Valid
                </span>
              )}
            </div>
          ) : (
            <div className="text-slate-600 text-sm font-bold uppercase tracking-widest animate-pulse">
              {isFocused ? "Menunggu Input..." : "Klik layar untuk mulai mengetik"}
            </div>
          )}
        </div>

        {/* Visual Navigation Button (Manual Trigger) */}
        <div className="mt-2 transition-all duration-500 transform">
          <button
            onClick={() => handleSubmit()}
            disabled={!match?.matchId || isNavigating}
            className={cn(
              "px-8 py-4 rounded-full text-sm font-black uppercase tracking-[0.2em] transition-all duration-300 border flex items-center gap-3",
              match?.matchId && !isNavigating
                ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/30 hover:bg-blue-500 hover:-translate-y-0.5 hover:shadow-blue-600/40 active:translate-y-0"
                : "bg-slate-900/50 border-slate-800 text-slate-700 opacity-50 cursor-not-allowed"
            )}
          >
            {isNavigating ? "MENGHUBUNGKAN..." : "LANJUTKAN"}
            {!isNavigating && (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Floating Tips */}
      <div className="absolute bottom-8 flex gap-8 text-[10px] font-bold uppercase tracking-widest text-slate-600">
        <div className="flex items-center gap-2">
          <kbd className="px-2 py-1 rounded bg-slate-800 border border-slate-700 font-mono text-slate-400">TAB</kbd>
          Fokus Input
        </div>
        <div className="flex items-center gap-2">
          <kbd className="px-2 py-1 rounded bg-slate-800 border border-slate-700 font-mono text-slate-400">ENTER</kbd>
          Buka Layar
        </div>
      </div>
    </main>
  );
}
