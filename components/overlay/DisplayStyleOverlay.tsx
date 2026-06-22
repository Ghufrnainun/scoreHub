'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ScoreFlipDigit, ScoreGlowFlash } from './ScoreFlipDigit';
import type { MatchState } from '@/lib/match-types';

export interface DisplayStyleOverlayProps {
  match: MatchState;
  position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right' | 'bottom-center' | 'top-center';
  accentColor?: string;
}

function ShuttleIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
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

export function DisplayStyleOverlay({
  match,
  position = 'bottom-center',
  accentColor = '#fbbf24',
}: DisplayStyleOverlayProps) {
  const currentSet = match.currentSet;
  const sets = match.sets ?? [];
  const isFinished = match.status === 'finished';
  const isDoubles = (match.teams.home.players?.length ?? 0) >= 2;

  const showSet1 = sets.length >= 1;
  const showSet2 = sets.length >= 2;
  const showSet3 = sets.length >= 3;

  const positionClass = {
    'bottom-left': 'bottom-6 left-6',
    'bottom-right': 'bottom-6 right-6',
    'bottom-center': 'bottom-6 left-1/2 -translate-x-1/2',
    'top-left': 'top-6 left-6',
    'top-right': 'top-6 right-6',
    'top-center': 'top-6 left-1/2 -translate-x-1/2',
  }[position];

  // Team colors or default fallback
  const homeColor = '#3b82f6'; // Blue
  const awayColor = '#ef4444'; // Red

  const renderTeamRow = (side: 'home' | 'away') => {
    const team = match.teams[side];
    const isServing = match.server === side;
    const isWinner = isFinished && match.winner === side;
    const color = side === 'home' ? homeColor : awayColor;
    const pastScores = sets.map((s) => (side === 'home' ? s.home : s.away));

    const displayNames = isDoubles
      ? team.players?.length
        ? team.players.map((p) => p.name.split(' ')[0]).join(' / ')
        : team.name
      : team.players?.[0]?.name || team.name;

    const code = (team.country || team.name.slice(0, 3)).slice(0, 3).toUpperCase();

    return (
      <div className="grid grid-cols-[1fr_auto] border-b border-white/5 last:border-0 h-14 relative overflow-hidden">
        {/* Left: serve bar indicator + Team details */}
        <div className="flex items-center px-4 gap-3 bg-[#0a0c14]/40 relative overflow-hidden">
          {/* Serve indicator left-side bar */}
          <AnimatePresence>
            {isServing && !isFinished && (
              <motion.div
                initial={{ opacity: 0, scaleY: 0 }}
                animate={{ opacity: 1, scaleY: 1 }}
                exit={{ opacity: 0, scaleY: 0 }}
                className="absolute left-0 top-0 bottom-0 w-1"
                style={{ backgroundColor: accentColor, boxShadow: `0 0 10px ${accentColor}` }}
              />
            )}
          </AnimatePresence>

          {/* Country flag code badge */}
          <div
            className="w-10 h-6 rounded flex items-center justify-center text-[10px] font-black text-white/90 border border-white/10"
            style={{
              background: `linear-gradient(135deg, ${color}cc 0%, ${color}77 100%)`,
            }}
          >
            {code}
          </div>

          {/* Team Name */}
          <span
            className={`font-black tracking-widest uppercase truncate text-sm flex items-center gap-2 ${
              isServing ? 'text-white' : 'text-white/60'
            }`}
            style={{
              textShadow: isWinner ? `0 0 12px ${accentColor}80` : undefined,
              color: isWinner ? accentColor : undefined,
            }}
          >
            {displayNames}
            {isServing && !isFinished && (
              <ShuttleIcon className="w-3.5 h-3.5 text-amber-400 animate-pulse flex-shrink-0" />
            )}
          </span>
        </div>

        {/* Right: Scores */}
        <div className="flex bg-[#030408]/90">
          {/* Set 1 Score */}
          {showSet1 && (
            <div className="w-16 flex items-center justify-center bg-[#07080f]/50 border-l border-white/5">
              <span className="text-sm font-black text-white/55 tabular-nums">
                {pastScores[0]}
              </span>
            </div>
          )}

          {/* Set 2 Score */}
          {showSet2 && (
            <div className="w-16 flex items-center justify-center bg-[#07080f]/50 border-l border-white/5">
              <span className="text-sm font-black text-white/55 tabular-nums">
                {pastScores[1]}
              </span>
            </div>
          )}

          {/* Set 3 Score */}
          {showSet3 && (
            <div className="w-16 flex items-center justify-center bg-[#07080f]/50 border-l border-white/5">
              <span className="text-sm font-black text-white/55 tabular-nums">
                {pastScores[2]}
              </span>
            </div>
          )}

          {/* Current Score / Points */}
          <div
            className="w-20 flex items-center justify-center border-l-2 border-white/10"
            style={{
              background: isWinner
                ? 'rgba(251, 191, 36, 0.12)'
                : 'rgba(0, 0, 0, 0.2)',
            }}
          >
            <ScoreGlowFlash trigger={team.score}>
              <ScoreFlipDigit
                value={team.score}
                digitClassName="text-2xl font-black tabular-nums"
                style={{
                  color: isWinner ? '#fbbf24' : isServing ? accentColor : `${accentColor}cc`,
                }}
              />
            </ScoreGlowFlash>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`absolute ${positionClass} pointer-events-none select-none`} style={{ width: 560 }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: position.includes('top') ? -24 : 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        className="relative"
      >
        {/* Main card panel */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: 'rgba(10,12,20,0.85)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 16px 48px rgba(0,0,0,0.75), 0 0 0 1px rgba(255,255,255,0.08)',
          }}
        >
          {/* Header */}
          <div
            className="px-4 py-2.5 flex items-center justify-between"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div className="flex items-center gap-2">
              {!isFinished && (
                <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-red-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                  LIVE
                </span>
              )}
              <span
                className="text-[9px] font-black uppercase tracking-[0.2em] text-white/50"
              >
                {match.tournamentName || 'BWF BADMINTON'}
              </span>
            </div>

            <div className="flex text-[9px] font-bold text-white/45 uppercase tracking-widest text-center">
              {showSet1 && <div className="w-16">SET 1</div>}
              {showSet2 && <div className="w-16">SET 2</div>}
              {showSet3 && <div className="w-16">SET 3</div>}
              <div className="w-20 text-white/70">POIN</div>
            </div>
          </div>

          {/* Rows */}
          <div className="flex flex-col">
            {renderTeamRow('home')}
            {renderTeamRow('away')}
          </div>

          {/* Bottom Accent */}
          <div
            className="h-1 w-full"
            style={{
              background: `linear-gradient(90deg, ${homeColor}aa, ${accentColor}, ${awayColor}aa)`,
            }}
          />
        </div>
      </motion.div>
    </div>
  );
}
