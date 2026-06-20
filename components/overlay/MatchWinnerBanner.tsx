'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { MatchState } from '@/lib/match-types';

interface MatchWinnerBannerProps {
  match: MatchState;
}

export function MatchWinnerBanner({ match }: MatchWinnerBannerProps) {
  const isFinished = match.status === 'finished';
  const winner = match.winner;
  const winnerName = winner
    ? match.teams[winner].name
    : null;

  return (
    <AnimatePresence>
      {isFinished && winnerName && (
        <motion.div
          key="winner-banner"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none z-50"
        >
          {/* Dark backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />

          {/* Banner content */}
          <motion.div
            initial={{ scale: 0.7, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 text-center"
          >
            {/* GAME text */}
            <motion.p
              initial={{ letterSpacing: '0.1em', opacity: 0 }}
              animate={{ letterSpacing: '0.5em', opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6, ease: 'easeOut' }}
              className="text-8xl font-black text-white uppercase mb-2"
              style={{ fontFamily: 'var(--font-bebas)' }}
            >
              GAME!
            </motion.p>

            {/* Winner name */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="text-4xl font-black uppercase tracking-widest mb-1"
              style={{
                color: '#fbbf24',
                textShadow: '0 0 40px rgba(251,191,36,0.5)',
              }}
            >
              {winnerName}
            </motion.p>

            {/* Set scores */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.4 }}
              className="flex items-center justify-center gap-4 mt-4"
            >
              {match.sets.map((s, i) => (
                <div key={i} className="text-center">
                  <p className="text-xs text-white/40 uppercase tracking-widest font-bold">
                    Set {i + 1}
                  </p>
                  <p className="text-2xl font-black text-white tabular-nums">
                    {s.home} – {s.away}
                  </p>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Animated confetti-like particles */}
          {Array.from({ length: 12 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full"
              style={{
                background: i % 3 === 0 ? '#fbbf24' : i % 3 === 1 ? '#3b82f6' : '#ef4444',
                left: `${8 + i * 7.5}%`,
                top: '50%',
              }}
              initial={{ y: 0, opacity: 0 }}
              animate={{
                y: [0, -(80 + i * 20), 300],
                opacity: [0, 1, 0],
                x: [(i % 2 === 0 ? -1 : 1) * i * 8, (i % 2 === 0 ? 1 : -1) * i * 12],
              }}
              transition={{
                delay: 0.5 + i * 0.08,
                duration: 1.8,
                ease: 'easeOut',
                repeat: Infinity,
                repeatDelay: 2,
              }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
