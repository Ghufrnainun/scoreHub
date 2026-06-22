'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ScoreFlipDigit, ScoreGlowFlash } from './ScoreFlipDigit';
import type { MatchState } from '@/lib/match-types';

interface ScorelineOverlayProps {
  match: MatchState;
  accentColor?: string;
  position?: 'bottom' | 'top';
}

const SPORT_LABELS: Record<string, string> = {
  badminton: 'BADMINTON',
  tennis: 'TENNIS',
  basketball: 'BASKETBALL',
  volleyball: 'VOLLEYBALL',
  soccer: 'SOCCER',
  futsal: 'FUTSAL',
};

function ShuttleIcon({ className, size = 16, color }: { className?: string; size?: number; color?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      style={{ width: size, height: size, color: color }}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="12" cy="7" r="2.5"/>
      <path d="M9.5 9.5 L6 20 H18 L14.5 9.5" strokeWidth="0.5" stroke="currentColor" fill="none"/>
      <line x1="10" y1="20" x2="10" y2="10" strokeWidth="0.8" stroke="currentColor"/>
      <line x1="12" y1="20" x2="12" y2="9.5" strokeWidth="0.8" stroke="currentColor"/>
      <line x1="14" y1="20" x2="14" y2="10" strokeWidth="0.8" stroke="currentColor"/>
    </svg>
  );
}

export function ScorelineOverlay({
  match,
  accentColor = '#fbbf24',
  position = 'bottom',
}: ScorelineOverlayProps) {
  const homeScore = match.teams.home.score;
  const awayScore = match.teams.away.score;
  const currentSet = match.currentSet;
  const sets = match.sets || [];
  const isFinished = match.status === 'finished';
  const isHomeWinner = isFinished && match.winner === 'home';
  const isAwayWinner = isFinished && match.winner === 'away';

  const posClass = position === 'bottom'
    ? 'bottom-0 left-0 right-0'
    : 'top-0 left-0 right-0';

  return (
    <div className={`absolute ${posClass} pointer-events-none select-none`}>
      <motion.div
        initial={{ opacity: 0, y: position === 'bottom' ? 40 : -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Gradient fade edge at top */}
        {position === 'bottom' && (
          <div className="h-12 w-full" style={{
            background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.55))',
          }} />
        )}

        <div
          className="w-full flex items-stretch"
          style={{
            background: 'rgba(0,0,0,0.88)',
            backdropFilter: 'blur(20px)',
            height: 72,
            borderTop: position === 'bottom' ? `2px solid ${accentColor}` : undefined,
            borderBottom: position === 'top' ? `2px solid ${accentColor}` : undefined,
          }}
        >
          {/* Sport badge left */}
          <div
            className="flex items-center justify-center px-5 flex-shrink-0"
            style={{
              background: accentColor,
              minWidth: 120,
            }}
          >
            <div className="text-center">
              <p className="text-[9px] font-black uppercase tracking-widest text-black/60 leading-none">
                {SPORT_LABELS[match.sport] || match.sport.toUpperCase()}
              </p>
              {!isFinished && (
                <p className="text-[11px] font-black uppercase tracking-widest text-black leading-none mt-1">
                  SET {currentSet}
                </p>
              )}
              {isFinished && (
                <p className="text-[11px] font-black uppercase tracking-widest text-black leading-none mt-1">
                  SELESAI
                </p>
              )}
            </div>
          </div>

          {/* Home team */}
          <div className="flex-1 flex items-center px-6 gap-4">
            {/* Serve shuttlecock */}
            <AnimatePresence>
              {match.server === 'home' && !isFinished && (
                <motion.span
                  key="home-serve"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  className="flex-shrink-0"
                >
                  <ShuttleIcon size={18} color={accentColor} className="animate-pulse" />
                </motion.span>
              )}
            </AnimatePresence>
            <span className="font-black text-white text-lg uppercase tracking-widest truncate">
              {match.teams.home.name}
            </span>
            {/* Past set scores */}
            <div className="flex gap-1.5 flex-shrink-0">
              {sets.slice(0, currentSet - 1).map((s, i) => (
                <span
                  key={i}
                  className="text-[11px] font-black tabular-nums bg-white/10 text-white/60 px-2 py-0.5 rounded border border-white/5 shadow-inner"
                >
                  {s.home}
                </span>
              ))}
            </div>
          </div>

          {/* Scorebox home */}
          <div
            className="flex items-center justify-center px-4 flex-shrink-0"
            style={{ minWidth: 72 }}
          >
            <ScoreGlowFlash trigger={homeScore}>
              <ScoreFlipDigit
                value={homeScore}
                digitClassName="text-4xl font-black tabular-nums"
                style={{ color: isHomeWinner ? '#fbbf24' : accentColor }}
              />
            </ScoreGlowFlash>
          </div>

          {/* Separator */}
          <div className="flex items-center px-2 flex-shrink-0">
            <span className="text-white/20 font-black text-2xl">—</span>
          </div>

          {/* Scorebox away */}
          <div
            className="flex items-center justify-center px-4 flex-shrink-0"
            style={{ minWidth: 72 }}
          >
            <ScoreGlowFlash trigger={awayScore}>
              <ScoreFlipDigit
                value={awayScore}
                digitClassName="text-4xl font-black tabular-nums"
                style={{ color: isAwayWinner ? '#fbbf24' : accentColor }}
              />
            </ScoreGlowFlash>
          </div>

          {/* Away team */}
          <div className="flex-1 flex items-center px-6 gap-4 flex-row-reverse">
            <AnimatePresence>
              {match.server === 'away' && !isFinished && (
                <motion.span
                  key="away-serve"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  className="flex-shrink-0"
                >
                  <ShuttleIcon size={18} color={accentColor} className="animate-pulse" />
                </motion.span>
              )}
            </AnimatePresence>
            <span className="font-black text-white text-lg uppercase tracking-widest truncate text-right">
              {match.teams.away.name}
            </span>
            {/* Past set scores */}
            <div className="flex gap-1.5 flex-shrink-0 flex-row-reverse">
              {sets.slice(0, currentSet - 1).map((s, i) => (
                <span
                  key={i}
                  className="text-[11px] font-black tabular-nums bg-white/10 text-white/60 px-2 py-0.5 rounded border border-white/5 shadow-inner"
                >
                  {s.away}
                </span>
              ))}
            </div>
          </div>

          {/* Live badge right */}
          <div
            className="flex items-center justify-center px-5 flex-shrink-0"
            style={{ minWidth: 80 }}
          >
            {!isFinished ? (
              <span className="flex flex-col items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
                <span className="text-[9px] font-black uppercase tracking-widest text-red-400">LIVE</span>
              </span>
            ) : (
              <span className="text-[9px] font-black uppercase tracking-widest text-white/40">FT</span>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
