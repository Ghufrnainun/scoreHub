'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ScoreFlipDigit, ScoreGlowFlash } from './ScoreFlipDigit';
import type { MatchState } from '@/lib/match-types';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BwfOverlayProps {
  match: MatchState;
  position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right' | 'bottom-center' | 'top-center';
  accentColor?: string;
}

// ─── Country → Flag mapping ───────────────────────────────────────────────────

const FLAG_ISO_MAP: Record<string, string> = {
  INA: 'id', IDN: 'id', INDONESIA: 'id',
  MAS: 'my', MALAYSIA: 'my',
  CHN: 'cn', CHINA: 'cn',
  JPN: 'jp', JAPAN: 'jp',
  KOR: 'kr', KOREA: 'kr',
  DEN: 'dk', DENMARK: 'dk',
  IND: 'in', INDIA: 'in',
  THA: 'th', THAILAND: 'th',
  TPE: 'tw', TAIPEI: 'tw',
  HKG: 'hk', HKC: 'hk', 'HONG KONG': 'hk',
  SGP: 'sg', SINGAPORE: 'sg',
  ENG: 'gb-eng', ENGLAND: 'gb-eng',
  GBR: 'gb',
  NED: 'nl', NETHERLANDS: 'nl',
  GER: 'de', GERMANY: 'de',
  FRA: 'fr', FRANCE: 'fr',
  ESP: 'es', SPAIN: 'es',
  USA: 'us', CAN: 'ca', CANADA: 'ca',
  AUS: 'au', AUSTRALIA: 'au',
  PHL: 'ph', PHILIPPINES: 'ph',
  VIE: 'vn', VIETNAM: 'vn',
  MYS: 'my',
};

function getIsoCode(country?: string): string {
  if (!country) return '';
  const upper = country.trim().toUpperCase();
  if (FLAG_ISO_MAP[upper]) {
    return FLAG_ISO_MAP[upper];
  }
  if (upper.length === 2) {
    return upper.toLowerCase();
  }
  return '';
}

// ─── Shuttle SVG — the real badminton serve indicator ─────────────────────────

function ShuttleIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Simplified shuttlecock shape */}
      <path d="M12 2C9.5 2 7.5 4.2 7.5 7c0 1.2.4 2.3 1 3.1L5 21h14l-3.5-10.9c.6-.8 1-1.9 1-3.1C16.5 4.2 14.5 2 12 2z" opacity="0.25"/>
      <circle cx="12" cy="7" r="2.5"/>
      <path d="M9.5 9.5 L6 20 H18 L14.5 9.5" strokeWidth="0.5" stroke="currentColor" fill="none"/>
      <line x1="10" y1="20" x2="10" y2="10" strokeWidth="0.8" stroke="currentColor"/>
      <line x1="12" y1="20" x2="12" y2="9.5" strokeWidth="0.8" stroke="currentColor"/>
      <line x1="14" y1="20" x2="14" y2="10" strokeWidth="0.8" stroke="currentColor"/>
    </svg>
  );
}

// ─── Team Row ─────────────────────────────────────────────────────────────────

interface BwfTeamRowProps {
  name: string;
  players: { name: string; country?: string }[];
  country?: string;
  score: number;
  isServing: boolean;
  isWinner: boolean;
  setsWon: number;
  pastSets: number[];
  currentSet: number;
  teamColor: string;
  isDoubles: boolean;
  isFinished: boolean;
  accentColor?: string;
}

function BwfTeamRow({
  name,
  players,
  country,
  score,
  isServing,
  isWinner,
  pastSets,
  currentSet,
  teamColor,
  isDoubles,
  isFinished: _isFinished,
  accentColor,
}: BwfTeamRowProps) {
  const isoCode = getIsoCode(country ?? players[0]?.country);

  // Name logic: doubles → 2 player names stacked; singles → team/player name
  const line1 = isDoubles
    ? (players[0]?.name ?? name).toUpperCase()
    : (name || players[0]?.name || '—').toUpperCase();
  const line2 = isDoubles ? (players[1]?.name ?? '').toUpperCase() : null;

  // Past set scores (only completed sets)
  const pastScores = pastSets.slice(0, currentSet - 1);

  const rowHeight = isDoubles ? 64 : 56;

  return (
    <div className="flex items-stretch" style={{ height: rowHeight }}>

      {/* ── Left: flag block ── */}
      <div
        className="flex-shrink-0 flex flex-col items-center justify-center gap-0.5 relative"
        style={{
          width: 52,
          background: `linear-gradient(160deg, ${teamColor}EE 0%, ${teamColor}BB 100%)`,
          boxShadow: `inset -2px 0 8px rgba(0,0,0,0.3)`,
        }}
      >
        <ShuttleIcon className="absolute w-[22px] h-[22px] opacity-40 drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]" />
        {isoCode && (
          <img
            src={`https://flagcdn.com/h40/${isoCode}.png`}
            alt={isoCode}
            width={36}
            height={24}
            className="h-6 w-auto object-contain border border-white/10 shadow-sm relative z-10 bg-transparent"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        )}
      </div>

      {/* ── Middle: name + serve indicator ── */}
      <div
        className="flex-1 min-w-0 flex flex-col justify-center px-4 gap-0"
        style={{
          background: 'rgba(14, 16, 24, 0.93)',
          borderRight: '1px solid rgba(255,255,255,0.04)',
        }}
      >
        {line2 ? (
          // Doubles layout
          <>
            <div className="flex items-center gap-2 leading-tight">
              <AnimatePresence mode="wait">
                {isServing && (
                  <motion.span
                    key="serve"
                    initial={{ opacity: 0, x: -4, scale: 0.6 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -4, scale: 0.6 }}
                    transition={{ duration: 0.2 }}
                    className="flex-shrink-0"
                    style={{ color: '#f5c518', filter: 'drop-shadow(0 0 6px #f5c518AA)' }}
                  >
                    <ShuttleIcon className="w-3.5 h-3.5" />
                  </motion.span>
                )}
                {!isServing && <span className="w-3.5 flex-shrink-0" />}
              </AnimatePresence>
              <span className="text-[12px] font-black text-white uppercase tracking-wider leading-tight truncate">
                {line1}
              </span>
            </div>
            <div className="flex items-center gap-2 leading-tight mt-0.5">
              <span className="w-3.5 flex-shrink-0" />
              <span className="text-[12px] font-black text-white/80 uppercase tracking-wider leading-tight truncate">
                {line2}
              </span>
            </div>
          </>
        ) : (
          // Singles layout
          <div className="flex items-center gap-2.5 h-full">
            <AnimatePresence mode="wait">
              {isServing && (
                <motion.span
                  key="serve"
                  initial={{ opacity: 0, x: -6, scale: 0.5 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -6, scale: 0.5 }}
                  transition={{ duration: 0.22 }}
                  className="flex-shrink-0"
                  style={{ color: '#f5c518', filter: 'drop-shadow(0 0 8px #f5c518)' }}
                >
                  <ShuttleIcon className="w-4 h-4" />
                </motion.span>
              )}
              {!isServing && <span className="w-4 flex-shrink-0" />}
            </AnimatePresence>
            <span
              className="text-[17px] font-black text-white uppercase tracking-widest truncate"
              style={{
                textShadow: isWinner ? '0 0 20px rgba(245,197,24,0.4)' : undefined,
                color: isWinner ? '#f5c518' : 'white',
              }}
            >
              {line1}
            </span>
          </div>
        )}
      </div>

      {/* ── Past set scores ── */}
      {pastScores.length > 0 && (
        <div
          className="flex-shrink-0 flex items-center justify-end gap-0"
          style={{
            background: 'rgba(14, 16, 24, 0.93)',
            borderRight: '1px solid rgba(255,255,255,0.04)',
            paddingLeft: 8,
            paddingRight: 8,
            minWidth: pastScores.length * 32,
          }}
        >
          {pastScores.map((s, i) => (
            <span
              key={i}
              className="text-[13px] font-bold tabular-nums text-white/35 w-8 text-center"
            >
              {s}
            </span>
          ))}
        </div>
      )}

      {/* ── Current score ── */}
      <div
        className="flex-shrink-0 flex items-center justify-center"
        style={{
          width: 68,
          background: isWinner
            ? 'rgba(245, 197, 24, 0.14)'
            : 'rgba(0, 0, 0, 0.25)', // Bypasses OBS transparent-page premultiplication blending bug (was white rgba(255,255,255,0.055))
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Winner shimmer */}
        {isWinner && (
          <motion.div
            className="absolute inset-0"
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 1.4, repeat: Infinity }}
            style={{ background: 'radial-gradient(ellipse at center, rgba(245,197,24,0.2) 0%, transparent 70%)' }}
          />
        )}
        <ScoreGlowFlash trigger={score}>
          <ScoreFlipDigit
            value={score}
            digitClassName={[
              'tabular-nums font-black leading-none',
              // Scale font based on digit count
              score >= 100 ? 'text-[28px]' : 'text-[36px]',
            ].join(' ')}
            style={{ color: isWinner ? '#f5c518' : accentColor || '#fbbf24' }}
          />
        </ScoreGlowFlash>
      </div>
    </div>
  );
}

// ─── Main overlay ─────────────────────────────────────────────────────────────

export function BwfOverlay({ match, position = 'bottom-left', accentColor }: BwfOverlayProps) {
  const currentSet = match.currentSet;
  const sets = match.sets ?? [];
  const isFinished = match.status === 'finished';
  const isDoubles = (match.teams.home.players?.length ?? 0) >= 2;

  const positionStyle: Record<string, React.CSSProperties> = {
    'bottom-left':   { bottom: 32, left: 0 },
    'bottom-right':  { bottom: 32, right: 0 },
    'bottom-center': { bottom: 32, left: '50%', transform: 'translateX(-50%)' },
    'top-left':      { top: 32, left: 0 },
    'top-right':     { top: 32, right: 0 },
    'top-center':    { top: 32, left: '50%', transform: 'translateX(-50%)' },
  };

  // Slide in from the correct side
  const slideFrom = position.includes('right') ? 60 : -60;

  // Team accent colors (home = warm red, away = deep blue)
  const homeColor = '#C8102E'; // BWF-ish red
  const awayColor = '#003DA5'; // BWF-ish blue

  const hasPastSets = currentSet > 1;

  return (
    <div
      className="absolute pointer-events-none select-none"
      style={{ ...positionStyle[position], minWidth: 480, maxWidth: 620 }}
    >
      <motion.div
        initial={{ opacity: 0, x: slideFrom }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        style={{
          boxShadow: '0 12px 60px rgba(0,0,0,0.7), 0 2px 8px rgba(0,0,0,0.5)',
          overflow: 'hidden',
          borderRadius: position.includes('left') ? '0 4px 4px 0' : position.includes('right') ? '4px 0 0 4px' : '4px',
        }}
      >
        {/* ── Header bar ── */}
        <div
          className="flex items-center gap-2.5 px-3"
          style={{
            background: 'rgba(6, 8, 14, 0.98)',
            height: 28,
            borderBottom: '1px solid rgba(255,255,255,0.07)',
          }}
        >
          {/* Live badge */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {!isFinished ? (
              <>
                <motion.span
                  className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                />
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-red-400">
                  LIVE
                </span>
              </>
            ) : (
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30">FINAL</span>
            )}
          </div>

          {/* Divider */}
          <span className="w-px h-3 bg-white/15 flex-shrink-0" />

          {/* Tournament name */}
          <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/50 flex-1 truncate">
            {match.tournamentName || 'BWF BADMINTON'}
          </span>

          {/* Set indicator */}
          <span className="text-[9px] font-black uppercase tracking-[0.15em] text-white/40 flex-shrink-0">
            {isFinished ? 'SELESAI' : `SET ${currentSet}`}
          </span>

          {/* Past set score header labels */}
          {hasPastSets && (
            <div className="flex flex-shrink-0" style={{ marginRight: 68, gap: 0 }}>
              {Array.from({ length: currentSet - 1 }).map((_, i) => (
                <span key={i} className="text-[8px] font-black text-white/20 uppercase tracking-wider w-8 text-center">
                  G{i + 1}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* ── Home row ── */}
        <BwfTeamRow
          name={match.teams.home.name}
          players={match.teams.home.players ?? []}
          country={match.teams.home.country}
          score={match.teams.home.score}
          isServing={match.server === 'home'}
          isWinner={isFinished && match.winner === 'home'}
          setsWon={match.teams.home.setsWon}
          pastSets={sets.map((s) => s.home)}
          currentSet={currentSet}
          teamColor={homeColor}
          isDoubles={isDoubles}
          isFinished={isFinished}
          accentColor={accentColor}
        />

        {/* ── Row divider ── */}
        <div style={{ height: 1.5, background: 'rgba(0,0,0,0.8)' }} />

        {/* ── Away row ── */}
        <BwfTeamRow
          name={match.teams.away.name}
          players={match.teams.away.players ?? []}
          country={match.teams.away.country}
          score={match.teams.away.score}
          isServing={match.server === 'away'}
          isWinner={isFinished && match.winner === 'away'}
          setsWon={match.teams.away.setsWon}
          pastSets={sets.map((s) => s.away)}
          currentSet={currentSet}
          teamColor={awayColor}
          isDoubles={isDoubles}
          isFinished={isFinished}
          accentColor={accentColor}
        />
      </motion.div>
    </div>
  );
}
