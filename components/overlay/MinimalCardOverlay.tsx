'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ScoreFlipDigit, ScoreGlowFlash } from './ScoreFlipDigit';
import type { MatchState } from '@/lib/match-types';

interface MinimalCardOverlayProps {
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
    >
      <circle cx="12" cy="7" r="2.5"/>
      <path d="M9.5 9.5 L6 20 H18 L14.5 9.5" strokeWidth="0.5" stroke="currentColor" fill="none"/>
      <line x1="10" y1="20" x2="10" y2="10" strokeWidth="0.8" stroke="currentColor"/>
      <line x1="12" y1="20" x2="12" y2="9.5" strokeWidth="0.8" stroke="currentColor"/>
      <line x1="14" y1="20" x2="14" y2="10" strokeWidth="0.8" stroke="currentColor"/>
    </svg>
  );
}

export function MinimalCardOverlay({
  match,
  position = 'top-right',
  accentColor = '#3b82f6',
}: MinimalCardOverlayProps) {
  const homeScore = match.teams.home.score;
  const awayScore = match.teams.away.score;
  const currentSet = match.currentSet;
  const isFinished = match.status === 'finished';

  const positionClass = {
    'bottom-left': 'bottom-6 left-6',
    'bottom-right': 'bottom-6 right-6',
    'bottom-center': 'bottom-6 left-1/2 -translate-x-1/2',
    'top-left': 'top-6 left-6',
    'top-right': 'top-6 right-6',
    'top-center': 'top-6 left-1/2 -translate-x-1/2',
  }[position];

  return (
    <div className={`absolute ${positionClass} pointer-events-none select-none`}>
      <motion.div
        initial={{ opacity: 0, scale: 0.88, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: 'rgba(15, 23, 42, 0.95)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 16px 48px rgba(0, 0, 0, 0.85), 0 0 0 1.5px rgba(255, 255, 255, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
            minWidth: 220,
          }}
        >
          {/* Header */}
          <div
            className="px-3 pt-2.5 pb-1.5 flex items-center justify-between"
            style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.12)' }}
          >
            <span
              className="text-[9px] font-black uppercase tracking-[0.22em]"
              style={{ color: accentColor }}
            >
              {isFinished ? 'SELESAI' : `SET ${currentSet}`}
            </span>
            {!isFinished && (
              <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-red-400">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />
                LIVE
              </span>
            )}
          </div>

          {/* Score rows */}
          <div className="px-3 py-2 space-y-1">
            <MinimalRow
              name={match.teams.home.name}
              score={homeScore}
              isServing={match.server === 'home'}
              isWinner={isFinished && match.winner === 'home'}
              pastSets={match.sets?.map((s) => s.home) || []}
              currentSet={currentSet}
              accentColor={accentColor}
            />
            {/* Divider */}
            <div className="h-px w-full" style={{ background: 'rgba(255, 255, 255, 0.12)' }} />
            <MinimalRow
              name={match.teams.away.name}
              score={awayScore}
              isServing={match.server === 'away'}
              isWinner={isFinished && match.winner === 'away'}
              pastSets={match.sets?.map((s) => s.away) || []}
              currentSet={currentSet}
              accentColor={accentColor}
            />
          </div>

          {/* Colored bottom accent */}
          <div
            className="h-[3px] w-full"
            style={{ background: accentColor }}
          />
        </div>
      </motion.div>
    </div>
  );
}

interface MinimalRowProps {
  name: string;
  score: number;
  isServing: boolean;
  isWinner: boolean;
  pastSets: number[];
  currentSet: number;
  accentColor: string;
}

function MinimalRow({
  name,
  score,
  isServing,
  isWinner,
  pastSets,
  currentSet,
  accentColor,
}: MinimalRowProps) {
  const completedSets = pastSets.slice(0, currentSet - 1);

  return (
    <div className="flex items-center gap-2 py-0.5">
      {/* Serve indicator */}
      <AnimatePresence>
        {isServing ? (
          <motion.div
            key="serve"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.2 }}
            className="flex-shrink-0"
          >
            <ShuttleIcon size={12} color={accentColor} className="animate-pulse" />
          </motion.div>
        ) : (
          <div className="w-3 h-3 flex-shrink-0" />
        )}
      </AnimatePresence>

      {/* Team name */}
      <span
        className="flex-1 text-xs font-black uppercase tracking-widest truncate"
        style={{
          color: isWinner ? accentColor : 'rgba(255,255,255,0.85)',
          maxWidth: 120,
        }}
      >
        {name}
      </span>

      {/* Winner crown */}
      {isWinner && (
        <motion.span
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-xs"
        >
          👑
        </motion.span>
      )}

      {/* Past set scores */}
      {completedSets.length > 0 && (
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {completedSets.map((s, i) => (
            <span
              key={i}
              className="text-[10px] font-black text-white/60 tabular-nums w-4 text-center"
            >
              {s}
            </span>
          ))}
        </div>
      )}

      {/* Score */}
      <ScoreGlowFlash trigger={score}>
        <ScoreFlipDigit
          value={score}
          digitClassName={`text-xl font-black tabular-nums ${isWinner ? '' : ''}`}
          className=""
        />
      </ScoreGlowFlash>
    </div>
  );
}
