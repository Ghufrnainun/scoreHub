'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ScoreFlipDigit, ScoreGlowFlash } from './ScoreFlipDigit';
import type { MatchState } from '@/lib/match-types';

interface CornerBarOverlayProps {
  match: MatchState;
  position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right' | 'bottom-center' | 'top-center';
  accentColor?: string;
}

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

const SPORT_LABELS: Record<string, string> = {
  badminton: 'BWF BADMINTON',
  tennis: 'TENNIS',
  basketball: 'BASKETBALL',
  volleyball: 'VOLLEYBALL',
  soccer: 'SOCCER',
  futsal: 'FUTSAL',
};

export function CornerBarOverlay({
  match,
  position = 'bottom-right',
  accentColor = '#fbbf24',
}: CornerBarOverlayProps) {
  const homeScore = match.teams.home.score;
  const awayScore = match.teams.away.score;
  const currentSet = match.currentSet;
  const sets = match.sets || [];
  const isFinished = match.status === 'finished';
  const winner = match.winner;

  const positionClass = {
    'bottom-left': 'bottom-6 left-6',
    'bottom-right': 'bottom-6 right-6',
    'bottom-center': 'bottom-6 left-1/2 -translate-x-1/2',
    'top-left': 'top-0 left-0',
    'top-right': 'top-0 right-0',
    'top-center': 'top-0 left-1/2 -translate-x-1/2',
  }[position];

  return (
    <div className={`absolute ${positionClass} pointer-events-none select-none`}>
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative"
      >
        {/* Backdrop blur card */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: 'rgba(15, 23, 42, 0.95)',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 16px 48px rgba(0, 0, 0, 0.85), 0 0 0 1.5px rgba(255, 255, 255, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
            minWidth: 340,
            maxWidth: 420,
          }}
        >
          {/* Top accent bar + header */}
          <div
            className="px-4 pt-3 pb-2 flex items-center justify-between gap-3"
            style={{ borderBottom: `1px solid rgba(255, 255, 255, 0.12)` }}
          >
            <div className="flex items-center gap-2">
              {/* Live indicator */}
              {!isFinished && (
                <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-red-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                  LIVE
                </span>
              )}
              <span
                className="text-[10px] font-black uppercase tracking-[0.18em]"
                style={{ color: accentColor }}
              >
                {SPORT_LABELS[match.sport] || match.sport.toUpperCase()}
              </span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">
              {isFinished ? 'SELESAI' : `SET ${currentSet}`}
            </span>
          </div>

          {/* Scores */}
          <div className="px-4 py-3 space-y-1.5">
            {/* Home row */}
            <TeamRow
              name={match.teams.home.name}
              score={homeScore}
              isServing={match.server === 'home'}
              isWinner={isFinished && winner === 'home'}
              setsWon={match.teams.home.setsWon}
              pastSets={sets.map((s) => s.home)}
              currentSet={currentSet}
              accentColor={accentColor}
              side="home"
            />
            {/* Away row */}
            <TeamRow
              name={match.teams.away.name}
              score={awayScore}
              isServing={match.server === 'away'}
              isWinner={isFinished && winner === 'away'}
              setsWon={match.teams.away.setsWon}
              pastSets={sets.map((s) => s.away)}
              currentSet={currentSet}
              accentColor={accentColor}
              side="away"
            />
          </div>

          {/* Colored accent bottom strip */}
          <div
            className="h-0.5 w-full"
            style={{ background: `linear-gradient(90deg, transparent, ${accentColor}66, transparent)` }}
          />
        </div>
      </motion.div>
    </div>
  );
}

interface TeamRowProps {
  name: string;
  score: number;
  isServing: boolean;
  isWinner: boolean;
  setsWon: number;
  pastSets: number[];
  currentSet: number;
  accentColor: string;
  side: 'home' | 'away';
}

function TeamRow({
  name,
  score,
  isServing,
  isWinner,
  setsWon,
  pastSets,
  currentSet,
  accentColor,
}: TeamRowProps) {
  return (
    <div className="flex items-center gap-2">
      {/* Serve indicator */}
      <AnimatePresence>
        {isServing ? (
          <motion.span
            key="serve"
            initial={{ opacity: 0, x: -6, scale: 0.5 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -6, scale: 0.5 }}
            transition={{ duration: 0.22 }}
            className="flex-shrink-0"
          >
            <ShuttleIcon size={14} color={accentColor} className="animate-pulse" />
          </motion.span>
        ) : (
          <span className="w-3.5 h-3.5 inline-block flex-shrink-0" />
        )}
      </AnimatePresence>

      {/* Team name */}
      <span className="flex-1 font-black text-white text-sm uppercase tracking-widest truncate" style={{ maxWidth: 160 }}>
        {name}
      </span>

      {/* Past set scores */}
      <div className="flex items-center gap-1.5">
        {Array.from({ length: currentSet - 1 }).map((_, i) => (
          <span
            key={i}
            className="text-[11px] font-bold tabular-nums text-white/60 w-6 text-center"
          >
            {pastSets[i] ?? '-'}
          </span>
        ))}
      </div>

      {/* Sets won bubbles */}
      <div className="flex gap-0.5">
        {Array.from({ length: setsWon }).map((_, i) => (
          <span
            key={i}
            className="w-2 h-2 rounded-full"
            style={{ background: accentColor }}
          />
        ))}
      </div>

      {/* Current score */}
      <ScoreGlowFlash trigger={score}>
        <ScoreFlipDigit
          value={score}
          digitClassName="text-3xl font-black tabular-nums"
          className=""
          style={{ color: isWinner ? '#fbbf24' : accentColor }}
        />
      </ScoreGlowFlash>
    </div>
  );
}
