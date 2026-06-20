'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { MatchState } from '@/lib/match-types';

export interface BroadcastOverlayProps {
  match: MatchState;
  position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right' | 'bottom-center' | 'top-center' | 'fit';
  accentColor?: string;
  theme?: 'classic-bronze' | 'rounded-crimson' | 'neon';
  showFlags?: boolean;
  showSubtext?: boolean;
  scale?: number;
}

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

function ShuttleIcon({ className, size = 16 }: { className?: string; size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      style={{ width: size, height: size }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 2C9.5 2 7.5 4.2 7.5 7c0 1.2.4 2.3 1 3.1L5 21h14l-3.5-10.9c.6-.8 1-1.9 1-3.1C16.5 4.2 14.5 2 12 2z" opacity="0.25"/>
      <circle cx="12" cy="7" r="2.5"/>
      <path d="M9.5 9.5 L6 20 H18 L14.5 9.5" strokeWidth="0.5" stroke="currentColor" fill="none"/>
      <line x1="10" y1="20" x2="10" y2="10" strokeWidth="0.8" stroke="currentColor"/>
      <line x1="12" y1="20" x2="12" y2="9.5" strokeWidth="0.8" stroke="currentColor"/>
      <line x1="14" y1="20" x2="14" y2="10" strokeWidth="0.8" stroke="currentColor"/>
    </svg>
  );
}

// Fade/Pop animation for points when they update
const AnimatedPoint = ({ val }: { val: number | string }) => (
  <AnimatePresence mode="wait">
    <motion.span
      key={val}
      initial={{ y: -6, opacity: 0, scale: 0.9 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: 6, opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className="inline-block"
    >
      {val}
    </motion.span>
  </AnimatePresence>
);

export function BroadcastOverlay({
  match,
  position = 'bottom-center',
  accentColor = '#7F5C31',
  theme = 'classic-bronze',
  showFlags = true,
  showSubtext = true,
  scale = 1,
}: BroadcastOverlayProps) {
  const currentSet = match.currentSet;
  const sets = match.sets ?? [];
  const isFinished = match.status === 'finished';
  const isDoubles = (match.teams.home.players?.length ?? 0) >= 2;

  const currentSetIndex = currentSet - 1;
  const server = match.server === 'home' ? 1 : match.server === 'away' ? 2 : 0;
  const matchWinner = match.winner === 'home' ? 1 : match.winner === 'away' ? 2 : 0;

  // Compile scores history to align with broadcast layout
  const allSetsScores: { p1: number; p2: number; active: boolean; setLabel: string }[] = [];
  
  // Fill in past sets
  for (let i = 0; i < currentSetIndex; i++) {
    const past = sets[i] || { home: 0, away: 0 };
    allSetsScores.push({
      p1: past.home,
      p2: past.away,
      active: false,
      setLabel: `SET ${i + 1}`,
    });
  }

  // Fill in current live set
  allSetsScores.push({
    p1: match.teams.home.score,
    p2: match.teams.away.score,
    active: matchWinner === 0 && !isFinished,
    setLabel: `SET ${currentSetIndex + 1}`,
  });

  const p1Wins = match.teams.home.setsWon;
  const p2Wins = match.teams.away.setsWon;

  // Master transformation styling (dynamic resizing for streaming integration)
  const mainStyle: React.CSSProperties = {
    transform: `scale(${scale})`,
    transformOrigin: 'bottom left',
  };

  const positionClass = {
    'bottom-left': 'bottom-6 left-6',
    'bottom-right': 'bottom-6 right-6',
    'bottom-center': 'bottom-6 left-1/2 -translate-x-1/2',
    'top-left': 'top-6 left-6',
    'top-right': 'top-6 right-6',
    'top-center': 'top-6 left-1/2 -translate-x-1/2',
    'fit': '',
  }[position];

  // Helper to format player names BWF Style (e.g. LEE Z.J. / AXELSEN)
  const formatName = (side: 'home' | 'away') => {
    const team = match.teams[side];
    if (isDoubles) {
      return team.players?.length
        ? team.players.map((p) => p.name.toUpperCase()).join(' / ')
        : team.name.toUpperCase();
    }
    return (team.players?.[0]?.name || team.name).toUpperCase();
  };

  const homeName = formatName('home');
  const awayName = formatName('away');

  const homeIso = getIsoCode(match.teams.home.country || match.teams.home.players?.[0]?.country);
  const awayIso = getIsoCode(match.teams.away.country || match.teams.away.players?.[0]?.country);

  const homeSubtext = match.teams.home.country || '';
  const awaySubtext = match.teams.away.country || '';

  const renderFlagBox = (side: 'home' | 'away') => {
    const team = match.teams[side];
    const isoCode = side === 'home' ? homeIso : awayIso;
    return (
      <div className="w-8 h-5 bg-white border border-gray-200 shadow-sm flex items-center justify-center rounded overflow-hidden flex-shrink-0">
        {team.logo ? (
          <img src={team.logo} alt="Logo" className="w-full h-full object-contain bg-white" />
        ) : isoCode ? (
          <img
            src={`https://flagcdn.com/h40/${isoCode}.png`}
            alt={isoCode}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <span className="text-sm leading-none" title={team.country}>
            🏸
          </span>
        )}
      </div>
    );
  };

  const renderThemeLayout = () => {
    if (theme === 'classic-bronze') {
      // --- STYLE 1: CLASSIC BRONZE & WOOD (IMAGE 1 REPLICA) ---
      return (
        <div 
          id="broadcast-overlay-classic" 
          className="flex flex-col select-none transition-all w-full"
        >
          <div className="relative flex items-stretch w-full">
            {/* Main Name Cards (P1 & P2 vertical stacked rows) */}
            <div className="flex flex-col gap-[3px] flex-1">
              
              {/* Player 1 Row */}
              <div className="h-[48px] bg-gradient-to-r from-[#fafcf8] via-[#f7f5ef] to-[#eeeae0] border-l-8 border-[#82542e] shadow-md flex items-center justify-between px-4 rounded-r-md">
                <div className="flex items-center gap-3 overflow-hidden">
                  {showFlags && renderFlagBox('home')}
                  <div className="flex flex-col justify-center">
                    <span className="font-serif text-[15px] sm:text-base tracking-[0.06em] uppercase font-bold text-[#54462d] truncate">
                      {homeName}
                    </span>
                    {showSubtext && homeSubtext && (
                      <span className="font-sans text-[10px] tracking-wider text-gray-500 font-medium leading-none -mt-0.5">
                        {homeSubtext}
                      </span>
                    )}
                  </div>
                </div>
                
                {/* P1 serving shuttlecock status indicator */}
                {server === 1 && matchWinner === 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-[#8d693f] flex-shrink-0 mr-1"
                  >
                    <ShuttleIcon size={18} />
                  </motion.div>
                )}
              </div>

              {/* Player 2 Row */}
              <div className="h-[48px] bg-gradient-to-r from-[#fafcf8] via-[#f7f5ef] to-[#eeeae0] border-l-8 border-[#82542e] shadow-md flex items-center justify-between px-4 rounded-r-md">
                <div className="flex items-center gap-3 overflow-hidden">
                  {showFlags && renderFlagBox('away')}
                  <div className="flex flex-col justify-center">
                    <span className="font-serif text-[15px] sm:text-base tracking-[0.06em] uppercase font-bold text-[#54462d] truncate">
                      {awayName}
                    </span>
                    {showSubtext && awaySubtext && (
                      <span className="font-sans text-[10px] tracking-wider text-gray-500 font-medium leading-none -mt-0.5">
                        {awaySubtext}
                      </span>
                    )}
                  </div>
                </div>

                {/* P2 serving shuttlecock status indicator */}
                {server === 2 && matchWinner === 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-[#8d693f] flex-shrink-0 mr-1"
                  >
                    <ShuttleIcon size={18} />
                  </motion.div>
                )}
              </div>
            </div>

            {/* Scores Area (Sets column stack shifting right) */}
            <div className="flex gap-[3px] ml-[3px] flex-shrink-0">
              {allSetsScores.map((set, setIdx) => {
                const isActiveSet = set.active;
                return (
                  <div 
                    key={setIdx}
                    className={`relative w-[52px] h-[99px] flex flex-col justify-between p-1 select-none rounded shadow-md transition-all duration-300 ${
                      isActiveSet 
                        ? 'bg-gradient-to-b from-[#8c6131] to-[#4c3115] text-white border-x border-[#b08754]/40 z-10' 
                        : 'bg-white/95 text-gray-700 border-x border-gray-100'
                    }`}
                    style={isActiveSet ? { backgroundImage: `linear-gradient(to bottom, ${accentColor} 0%, rgba(0,0,0,0.85) 100%)` } : undefined}
                  >
                    {/* Set Header Label */}
                    <div className={`text-center text-[9px] font-sans font-bold uppercase tracking-wider ${
                      isActiveSet ? 'text-white/80' : 'text-gray-400'
                    }`}>
                      {set.setLabel}
                    </div>

                    {/* Player 1 Score Block */}
                    <div className="flex-1 flex items-center justify-center font-sans">
                      <span className={`text-xl sm:text-[22px] font-extrabold ${
                        isActiveSet ? 'text-white' : 'text-gray-600'
                      }`}>
                        <AnimatedPoint val={set.p1} />
                      </span>
                    </div>

                    {/* Horizontal visual divider inside column */}
                    <div className={`h-[1px] w-4/5 mx-auto ${
                      isActiveSet ? 'bg-white/10' : 'bg-gray-200'
                    }`} />

                    {/* Player 2 Score Block */}
                    <div className="flex-1 flex items-center justify-center font-sans">
                      <span className={`text-xl sm:text-[22px] font-extrabold ${
                        isActiveSet ? 'text-white' : 'text-gray-600'
                      }`}>
                        <AnimatedPoint val={set.p2} />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Win Match Announcement overlay pill */}
          {matchWinner !== 0 && (
            <motion.div 
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 bg-[#51361b] text-[#f5d9b2] text-[10px] font-sans font-bold uppercase tracking-widest px-4 py-1 self-start rounded shadow-md border border-[#8c6131]/30"
              style={{ backgroundColor: accentColor }}
            >
              🏆 MATCH WON BY {matchWinner === 1 ? homeName : awayName}
            </motion.div>
          )}
        </div>
      );
    }

    if (theme === 'rounded-crimson') {
      // --- STYLE 2: ROUNDED CRIMSON & WHITE (IMAGE 2 REPLICA) ---
      return (
        <div 
          id="broadcast-overlay-rounded" 
          className="flex flex-col select-none w-full"
        >
          <div className="flex flex-col gap-1.5 p-1 w-full">
            {/* Row 1: Player 1 */}
            <div className="h-[46px] bg-gradient-to-r from-white via-[#fbfbfc] to-[#eae9ee] rounded-full shadow-lg border border-gray-200/60 pl-2 pr-1.5 flex items-center justify-between w-full">
              <div className="flex items-center gap-3 overflow-hidden flex-1">
                {showFlags && (
                  <div className="w-[38px] h-[26px] rounded-full overflow-hidden shadow-sm flex items-center justify-center bg-white border border-gray-100 flex-shrink-0">
                    {match.teams.home.logo ? (
                      <img src={match.teams.home.logo} alt="Logo" className="w-full h-full object-contain bg-white" />
                    ) : homeIso ? (
                      <img
                        src={`https://flagcdn.com/h80/${homeIso}.png`}
                        alt={homeIso}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <span className="text-base" title={match.teams.home.country}>
                        🏸
                      </span>
                    )}
                  </div>
                )}
                <div className="flex flex-col overflow-hidden">
                  <span className="font-sans font-extrabold text-[15px] sm:text-[17px] tracking-tight text-gray-800 uppercase truncate">
                    {homeName}
                  </span>
                  {showSubtext && homeSubtext && (
                    <span className="font-sans text-[9px] font-semibold text-gray-400 uppercase leading-none truncate -mt-0.5">
                      {homeSubtext}
                    </span>
                  )}
                </div>
              </div>

              {/* Past set scores and active set scores in row */}
              <div className="flex items-center gap-4 px-2 select-none flex-shrink-0">
                {sets.slice(0, currentSetIndex).map((past, sIdx) => (
                  <div key={sIdx} className="flex items-center font-mono text-[14px] sm:text-[16px] font-bold text-gray-400">
                    <span>{past.home}</span>
                    {sIdx === 0 && <span className="mx-2 text-gray-300">|</span>}
                  </div>
                ))}
                
                {/* Serving Indicator and Current Set Points */}
                <div className="flex items-center gap-1.5 pr-2 pl-1 border-l border-gray-200 font-mono text-base sm:text-lg font-black text-gray-800">
                  {server === 1 && matchWinner === 0 && (
                    <motion.div initial={{ scale: 0.6 }} animate={{ scale: 1 }} className="text-gray-800 mr-1 flex-shrink-0">
                      <ShuttleIcon size={15} />
                    </motion.div>
                  )}
                  <span className="text-gray-800 font-semibold min-w-[20px] text-center">
                    <AnimatedPoint val={match.teams.home.score} />
                  </span>
                </div>

                {/* Crimson Total Sets/Games score rounded pill */}
                <div 
                  className="w-[34px] sm:w-[38px] h-[34px] bg-gradient-to-b from-[#b22d2d] to-[#7f1818] rounded-2xl shadow-md border-t border-white/20 flex items-center justify-center font-sans font-extrabold text-[#fdf2f2] text-lg"
                  style={{ backgroundImage: `linear-gradient(to bottom, ${accentColor} 0%, rgba(0,0,0,0.2) 100%)` }}
                >
                  <AnimatedPoint val={p1Wins} />
                </div>
              </div>
            </div>

            {/* Row 2: Player 2 */}
            <div className="h-[46px] bg-gradient-to-r from-white via-[#fbfbfc] to-[#eae9ee] rounded-full shadow-lg border border-gray-200/60 pl-2 pr-1.5 flex items-center justify-between w-full">
              <div className="flex items-center gap-3 overflow-hidden flex-1">
                {showFlags && (
                  <div className="w-[38px] h-[26px] rounded-full overflow-hidden shadow-sm flex items-center justify-center bg-white border border-gray-100 flex-shrink-0">
                    {match.teams.away.logo ? (
                      <img src={match.teams.away.logo} alt="Logo" className="w-full h-full object-contain bg-white" />
                    ) : awayIso ? (
                      <img
                        src={`https://flagcdn.com/h80/${awayIso}.png`}
                        alt={awayIso}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <span className="text-base" title={match.teams.away.country}>
                        🏸
                      </span>
                    )}
                  </div>
                )}
                <div className="flex flex-col overflow-hidden">
                  <span className="font-sans font-extrabold text-[15px] sm:text-[17px] tracking-tight text-gray-800 uppercase truncate">
                    {awayName}
                  </span>
                  {showSubtext && awaySubtext && (
                    <span className="font-sans text-[9px] font-semibold text-gray-400 uppercase leading-none truncate -mt-0.5">
                      {awaySubtext}
                    </span>
                  )}
                </div>
              </div>

              {/* Past set scores and active set scores in row */}
              <div className="flex items-center gap-4 px-2 select-none flex-shrink-0">
                {sets.slice(0, currentSetIndex).map((past, sIdx) => (
                  <div key={sIdx} className="flex items-center font-mono text-[14px] sm:text-[16px] font-bold text-gray-400">
                    <span>{past.away}</span>
                    {sIdx === 0 && <span className="mx-2 text-gray-300">|</span>}
                  </div>
                ))}

                {/* Serving Indicator and Current Set Points */}
                <div className="flex items-center gap-1.5 pr-2 pl-1 border-l border-gray-200 font-mono text-base sm:text-lg font-black text-gray-800">
                  {server === 2 && matchWinner === 0 && (
                    <motion.div initial={{ scale: 0.6 }} animate={{ scale: 1 }} className="text-gray-800 mr-1 flex-shrink-0">
                      <ShuttleIcon size={15} />
                    </motion.div>
                  )}
                  <span className="text-gray-800 font-semibold min-w-[20px] text-center">
                    <AnimatedPoint val={match.teams.away.score} />
                  </span>
                </div>

                {/* Crimson Total Sets/Games score rounded pill */}
                <div 
                  className="w-[34px] sm:w-[38px] h-[34px] bg-gradient-to-b from-[#b22d2d] to-[#7f1818] rounded-2xl shadow-md border-t border-white/20 flex items-center justify-center font-sans font-extrabold text-[#fdf2f2] text-lg"
                  style={{ backgroundImage: `linear-gradient(to bottom, ${accentColor} 0%, rgba(0,0,0,0.2) 100%)` }}
                >
                  <AnimatedPoint val={p2Wins} />
                </div>
              </div>
            </div>
          </div>

          {/* Win Match Announcement Overlay */}
          {matchWinner !== 0 && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-1 ml-4 bg-[#7f1818] text-[#ffebeb] text-[9px] font-sans font-black uppercase tracking-widest px-4 py-1 self-start rounded-full shadow-md border border-red-500/20"
              style={{ backgroundColor: accentColor }}
            >
              🏆 {matchWinner === 1 ? homeName : awayName} VICTORY (Set Score {p1Wins}-{p2Wins})
            </motion.div>
          )}
        </div>
      );
    }

    // --- STYLE 3: NEON DIGITAL ESPORTS (ADDITIONAL THEME) ---
    return (
      <div 
        id="broadcast-overlay-neon" 
        className="flex flex-col select-none w-full"
      >
        <div className="bg-[#10151c]/90 backdrop-blur-md p-2 rounded-xl border border-cyan-500/30 shadow-2xl shadow-cyan-500/5 w-full">
          <div className="flex flex-col gap-1.5 relative w-full">
            
            {/* Cyber accents */}
            <div className="absolute top-0 right-12 w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping" />
            
            {/* Player 1 Row */}
            <div className="flex items-center justify-between bg-[#151c27] p-2 rounded-lg border border-gray-800 w-full">
              <div className="flex items-center gap-2 overflow-hidden flex-1">
                <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-lg shadow-cyan-400" />
                <div className="flex flex-col overflow-hidden">
                  <span className="font-mono text-xs text-cyan-400 font-bold tracking-wide">PLAYER 1</span>
                  <span className="font-sans font-extrabold text-white uppercase text-[15px] truncate leading-tight">
                    {homeName}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                {/* Set points list */}
                <div className="flex items-center gap-1 font-mono text-[13px] text-gray-500">
                  {sets.slice(0, currentSetIndex).map((prev, idx) => (
                    <span key={idx} className="bg-gray-900 px-1.5 py-0.5 rounded border border-gray-800">
                      {prev.home}
                    </span>
                  ))}
                </div>

                {/* Serves */}
                {server === 1 && matchWinner === 0 && (
                  <div className="text-cyan-400 animate-pulse">
                    <ShuttleIcon size={14} />
                  </div>
                )}

                {/* Point box */}
                <div className="w-10 h-8 bg-black/60 rounded flex items-center justify-center font-mono text-lg font-black text-cyan-400 border border-cyan-500/20">
                  <AnimatedPoint val={match.teams.home.score} />
                </div>

                {/* Golden neon games won block */}
                <div className="w-7 h-7 bg-cyan-500/10 rounded flex items-center justify-center font-mono text-sm font-bold text-cyan-400 border border-cyan-400/40">
                  {p1Wins}
                </div>
              </div>
            </div>

            {/* Player 2 Row */}
            <div className="flex items-center justify-between bg-[#151c27] p-2 rounded-lg border border-gray-800 w-full">
              <div className="flex items-center gap-2 overflow-hidden flex-1">
                <span className="w-2 h-2 rounded-full bg-yellow-400 shadow-lg shadow-yellow-400" />
                <div className="flex flex-col overflow-hidden">
                  <span className="font-mono text-xs text-yellow-400 font-bold tracking-wide">PLAYER 2</span>
                  <span className="font-sans font-extrabold text-white uppercase text-[15px] truncate leading-tight">
                    {awayName}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                {/* Set points list */}
                <div className="flex items-center gap-1 font-mono text-[13px] text-gray-500">
                  {sets.slice(0, currentSetIndex).map((prev, idx) => (
                    <span key={idx} className="bg-gray-900 px-1.5 py-0.5 rounded border border-gray-800">
                      {prev.away}
                    </span>
                  ))}
                </div>

                {/* Serves */}
                {server === 2 && matchWinner === 0 && (
                  <div className="text-yellow-400 animate-pulse">
                    <ShuttleIcon size={14} />
                  </div>
                )}

                {/* Point box */}
                <div className="w-10 h-8 bg-black/60 rounded flex items-center justify-center font-mono text-lg font-black text-yellow-400 border border-yellow-500/20">
                  <AnimatedPoint val={match.teams.away.score} />
                </div>

                {/* Golden neon games won block */}
                <div className="w-7 h-7 bg-yellow-500/10 rounded flex items-center justify-center font-mono text-sm font-bold text-yellow-400 border border-yellow-400/40">
                  {p2Wins}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (position === 'fit') {
    return (
      <div 
        className="absolute inset-0 flex flex-col justify-center items-center p-3 pointer-events-none select-none"
        style={mainStyle}
      >
        {renderThemeLayout()}
      </div>
    );
  }

  return (
    <div
      className={`absolute ${positionClass} pointer-events-none select-none flex flex-col items-center gap-1`}
      style={{ ...mainStyle, width: '90%', maxWidth: 540 }}
    >
      {renderThemeLayout()}
    </div>
  );
}
