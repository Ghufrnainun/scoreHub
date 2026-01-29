'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { useMatch } from '@/hooks/use-match';
import { useState, useEffect } from 'react';
import type { MatchRole } from '@/lib/socket';

// --- ICONS (Material Icons equivalent using SVG) ---
const AddIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
  </svg>
);
const RemoveIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 13H5v-2h14v2z" />
  </svg>
);
const UndoIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z" />
  </svg>
);
const ReportIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
  </svg>
);
const CricketIcon = ({ className }: { className?: string }) => (
  // Using a shuttlecock-like icon or generic sport icon since Material 'sports_cricket' isn't standard SVG usually.
  // Using the previous shuttle icon for consistency
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path
      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8 8 8z"
      opacity="0.3"
    />
    <path d="M7 12l5-5 5 5v7H7v-7z" />
  </svg>
);
const SettingsIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.04.24.24.41.48.41h3.84c.24 0 .43-.17.47-.41l.36-2.54c.59-.24 1.13-.57 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.08-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
  </svg>
);
const HistoryIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z" />
  </svg>
);
const NorthEastIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M9 5v2h6.59L4 18.59 5.41 20 17 8.41V15h2V5z" />
  </svg>
); // Arrow for serve

export default function ControlPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const matchId = params.id as string;
  const role = (searchParams.get('role') || 'referee') as MatchRole;
  const pin = searchParams.get('pin') || undefined;

  const { match, isLoading, error, awardPoint, undo, useChallenge } = useMatch({
    matchId,
    role,
    pin,
  });

  // Theme Toggle logic kept for compatibility, though user design is specific
  useEffect(() => {
    // Check if user has specific preference, otherwise default to dark to match the "cool" look or light based on HTML class
    // The HTML has <html class="dark"> so default to dark? Actually body shows bg-background-light dark:bg-background-dark
    if (localStorage.getItem('theme') === 'dark') {
      document.documentElement.classList.add('dark');
      setTheme('dark');
    } else {
      document.documentElement.classList.remove('dark');
      setTheme('light');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  if (isLoading || !match)
    return (
      <div className="text-white text-center p-10 font-bold">LOADING...</div>
    );

  const home = match.teams.home;
  const away = match.teams.away;
  const homeServing = match.server === 'home';
  const awayServing = match.server === 'away';
  const serveLeft = match.serviceCourt === 'left';
  const isSingles = match.gameMode === 'single';

  // Court Mapping
  // Left side of UI is HOME (or Team A)?
  // User HTML: Left Score 12, Right Score 19.
  // Court Names: Bethany LI (Australia), etc.
  // We need to map Home players to Left/Bottom court visually?
  // Let's assume standard: Home = Left in UI Score, Away = Right in UI Score.
  // Court Visual:
  //   User HTML has 4 quadrants.
  //   Top Left / Top Right / Bottom Left / Bottom Right.
  //   Usually:
  //     Bottom Half = Near Side (Home?)
  //     Top Half = Far Side (Away?)
  //   If Home (Left Score) is serving, arrow points from one of Bottom quadrants.
  //   If Away (Right Score) is serving, arrow points from one of Top quadrants.

  // Logic for Service Arrow Position in the Grid
  // Grid is 2x2.
  // Top-Left (Far-Left), Top-Right (Far-Right) -> Away Side
  // Bottom-Left (Near-Left), Bottom-Right (Near-Right) -> Home Side
  //
  // Service Rules:
  // Even Score -> Right Service Court
  // Odd Score -> Left Service Court
  //
  // Note: "Right Service Court" means the player's right.
  // For Home (Bottom): Right is Bottom-Right. Left is Bottom-Left.
  // For Away (Top): Right is Top-Left (facing net). Left is Top-Right.

  // BUT `match.serve.position` gives 'left' or 'right' service court relative to the server.
  // So:
  // Home Serving + 'right' -> Bottom Right Box
  // Home Serving + 'left' -> Bottom Left Box
  // Away Serving + 'right' -> Top Left Box (visually left from camera, right for player)
  // Away Serving + 'left' -> Top Right Box

  // WAIT. Correct mapping for court visual (Top=Away, Bottom=Home):
  // Away Right Service Court = Top Left quadrant
  // Away Left Service Court = Top Right quadrant
  // Home Right Service Court = Bottom Right quadrant
  // Home Left Service Court = Bottom Left quadrant

  // Service Arrow Logic
  // match.server: 'home' | 'away'
  // match.serviceCourt: 'left' | 'right' (generic court side relative to server)

  let arrowPositionClass = 'hidden';
  let arrowRotation = 'rotate-0';

  if (match.server) {
    if (match.server === 'home') {
      // Home Server (Bottom)
      if (match.serviceCourt === 'right') {
        // Bottom Right
        arrowPositionClass =
          'absolute bottom-[25%] right-[25%] translate-x-1/2 translate-y-1/2';
        arrowRotation = 'rotate-[-45deg]';
      } else {
        // Bottom Left
        arrowPositionClass =
          'absolute bottom-[25%] left-[25%] -translate-x-1/2 translate-y-1/2';
        arrowRotation = 'rotate-[45deg]';
      }
    } else {
      // Away Server (Top)
      if (match.serviceCourt === 'right') {
        // Top Left (visually right for them)
        arrowPositionClass =
          'absolute top-[25%] left-[25%] -translate-x-1/2 -translate-y-1/2';
        arrowRotation = 'rotate-[135deg]';
      } else {
        // Top Right
        arrowPositionClass =
          'absolute top-[25%] right-[25%] translate-x-1/2 -translate-y-1/2';
        arrowRotation = 'rotate-[-135deg]';
      }
    }
  }

  // Simplified Event Log (last 5 points)
  // Since we don't have the full detailed log in `match` guaranteed, we'll try `match.eventLog` if added, or mock it with set history for now as per user request to "ensure functions work".
  // The table in HTML is complex set history. We will render `match.sets.scores` in a similar tabular format.

  return (
    <div className="font-display bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 min-h-screen flex flex-col font-sans transition-colors duration-200">
      {/* Header */}
      <header className="p-4 flex justify-between items-center bg-white/5 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-4">
          <span className="text-sm font-bold tracking-widest text-slate-500 uppercase">
            Visual LiveScore
          </span>
          <span className="px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded text-xs font-mono">
            {matchId}
          </span>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">SET</span>
            <span className="font-bold text-xl">{match.currentSet ?? 1}</span>
          </div>
          <div className="h-6 w-px bg-slate-700"></div>
          <span className="text-sm font-medium text-slate-400 uppercase tracking-tighter hidden sm:inline">
            TournamentSystem
          </span>
          <button
            onClick={toggleTheme}
            className="p-2 bg-white/5 rounded-full hover:bg-white/10"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 flex flex-col gap-6 max-w-7xl mx-auto w-full">
        {/* Top Grid: Scores & Court */}
        <div className="grid grid-cols-12 gap-8 items-center h-full">
          {/* CENTER COLUMN: SCOREBOARD & COURT */}
          <div className="col-span-12 flex flex-col gap-6">
            {/* Score Strip */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl flex items-center justify-center py-4 px-4 lg:px-12 border border-slate-200 dark:border-slate-800 relative overflow-hidden">
              <button
                onClick={undo}
                className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full lg:absolute lg:left-8 transition-colors text-sky-400"
              >
                <UndoIcon className="w-8 h-8" />
              </button>

              <div className="flex items-center gap-8 z-10">
                <div className="flex flex-col items-center">
                  <span className="text-5xl lg:text-7xl font-mono font-black text-slate-800 dark:text-white tracking-tighter tabular-nums">
                    {home.score}
                  </span>
                </div>
                <span className="text-4xl font-bold text-slate-400">-</span>
                <div className="flex flex-col items-center">
                  <span className="text-5xl lg:text-7xl font-mono font-black text-slate-800 dark:text-white tracking-tighter tabular-nums">
                    {away.score}
                  </span>
                </div>
              </div>

              <button className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full lg:absolute lg:right-8 transition-colors text-orange-500">
                <ReportIcon className="w-8 h-8" />
              </button>
            </div>

            {/* Court Visual */}
            <div className="aspect-[16/9] w-full bg-[#16a34a] court-grid rounded-xl badminton-lines relative overflow-hidden shadow-inner border border-white/20 select-none">
              <div className="net-line z-0"></div>

              {/* Service Arrow Layer - Behind text */}
              {/* LEFT-RIGHT orientation (rotated 90° from BWF diagram) */}
              {/* Right court (even score): Home=BL, Away=TR, diagonal BL↔TR */}
              {/* Left court (odd score): Home=TL, Away=BR, diagonal TL↔BR */}
              {match.server && match.serviceCourt && (
                <div className="absolute w-full h-full inset-0 pointer-events-none z-0 overflow-hidden">
                  <div
                    className={`absolute transition-all duration-500 
                        ${
                          match.server === 'home'
                            ? match.serviceCourt === 'right'
                              ? 'bottom-[25%] left-[25%] -translate-x-1/2 translate-y-1/2' // BL → TR
                              : 'top-[25%] left-[25%] -translate-x-1/2 -translate-y-1/2' // TL → BR
                            : match.serviceCourt === 'right'
                              ? 'top-[25%] right-[25%] translate-x-1/2 -translate-y-1/2' // TR → BL
                              : 'bottom-[25%] right-[25%] translate-x-1/2 translate-y-1/2' // BR → TL
                        }
                     `}
                  >
                    <NorthEastIcon
                      className={`text-yellow-400/60 w-24 h-24 lg:w-32 lg:h-32 drop-shadow-sm opacity-80
                              ${
                                match.server === 'home'
                                  ? match.serviceCourt === 'right'
                                    ? 'rotate-[0deg]' // BL → TR (↗ up-right, default)
                                    : 'rotate-[90deg]' // TL → BR (↘ down-right)
                                  : match.serviceCourt === 'right'
                                    ? 'rotate-[180deg]' // TR → BL (↙ down-left)
                                    : 'rotate-[-90deg]' // BR → TL (↖ up-left)
                              }
                       `}
                    />
                  </div>
                </div>
              )}

              {/* Court Areas Grid - Names layer (z-10) */}
              {/* Same logic: Right court (even)=BL/TR, Left court (odd)=TL/BR */}
              {(() => {
                const serverTeam = match.server;
                const court = match.serviceCourt;
                const serverName =
                  serverTeam === 'home'
                    ? home.players[0]?.name || home.name
                    : away.players[0]?.name || away.name;
                const receiverName =
                  serverTeam === 'home'
                    ? away.players[0]?.name || away.name
                    : home.players[0]?.name || home.name;

                const getQuadrantContent = (
                  quadrant: 'TL' | 'TR' | 'BL' | 'BR',
                ) => {
                  if (!serverTeam || !court) {
                    // Fallback: static positions (home left, away right)
                    if (quadrant === 'BL')
                      return home.players[0]?.name || home.name;
                    if (quadrant === 'TR')
                      return away.players[0]?.name || away.name;
                    return isSingles
                      ? ''
                      : quadrant === 'TL'
                        ? home.players[1]?.name || ''
                        : away.players[1]?.name || '';
                  }

                  if (isSingles) {
                    // Right court (even): Home=BL, Away=TR (diagonal BL↔TR)
                    // Left court (odd): Home=TL, Away=BR (diagonal TL↔BR)
                    if (serverTeam === 'home') {
                      if (court === 'right') {
                        if (quadrant === 'BL') return serverName;
                        if (quadrant === 'TR') return receiverName;
                      } else {
                        // left
                        if (quadrant === 'TL') return serverName;
                        if (quadrant === 'BR') return receiverName;
                      }
                    } else {
                      // away serves
                      if (court === 'right') {
                        if (quadrant === 'TR') return serverName;
                        if (quadrant === 'BL') return receiverName;
                      } else {
                        // left
                        if (quadrant === 'BR') return serverName;
                        if (quadrant === 'TL') return receiverName;
                      }
                    }
                    return '';
                  } else {
                    // Doubles: static for now (home=left col, away=right col)
                    if (quadrant === 'TL') return home.players[1]?.name || '';
                    if (quadrant === 'BL')
                      return home.players[0]?.name || home.name;
                    if (quadrant === 'TR')
                      return away.players[0]?.name || away.name;
                    if (quadrant === 'BR') return away.players[1]?.name || '';
                  }
                  return '';
                };

                return (
                  <div className="absolute inset-x-0 inset-y-0 grid grid-cols-2 grid-rows-2 text-white z-10">
                    {/* Top Left */}
                    <div className="flex flex-col items-center justify-center p-2 border-r-2 border-b-2 border-white/30">
                      <span className="font-black text-sm lg:text-lg text-center drop-shadow-md leading-tight">
                        {getQuadrantContent('TL')}
                      </span>
                    </div>
                    {/* Top Right */}
                    <div className="flex flex-col items-center justify-center p-2 border-l-2 border-b-2 border-white/30">
                      <span className="font-black text-sm lg:text-lg text-center drop-shadow-md leading-tight">
                        {getQuadrantContent('TR')}
                      </span>
                    </div>
                    {/* Bottom Left */}
                    <div className="flex flex-col items-center justify-center p-2 border-r-2 border-t-2 border-white/30">
                      <span className="font-black text-sm lg:text-lg text-center drop-shadow-md leading-tight">
                        {getQuadrantContent('BL')}
                      </span>
                    </div>
                    {/* Bottom Right */}
                    <div className="flex flex-col items-center justify-center p-2 border-l-2 border-t-2 border-white/30">
                      <span className="font-black text-sm lg:text-lg text-center drop-shadow-md leading-tight">
                        {getQuadrantContent('BR')}
                      </span>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Footer: SCORE Buttons & Table */}
        <div className="flex flex-col lg:flex-row justify-between items-end mt-auto gap-4 pb-4">
          {/* Home Score Button */}
          <button
            onClick={() => awardPoint('home')}
            className="w-full lg:w-auto bg-blue-600 hover:bg-blue-500 text-white px-8 lg:px-12 py-6 rounded-2xl shadow-lg shadow-blue-500/20 active:scale-95 transition-all flex flex-col items-center justify-center"
          >
            <span className="text-xs font-bold opacity-70 mb-1">
              {home.name}
            </span>
            <span className="text-2xl font-black tracking-widest">
              SCORE +1
            </span>
          </button>

          {/* History Table (Clean Set log) */}
          <div className="flex-1 w-full mx-0 lg:mx-8 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 bg-opacity-90">
            <table className="w-full text-[10px] uppercase font-bold tracking-tight">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/80 text-left text-slate-500">
                  <th className="px-4 py-3 w-40 border-r border-slate-200 dark:border-slate-700">
                    Team
                  </th>
                  <th className="px-4 py-3 text-center w-20 bg-slate-50 dark:bg-white/5">
                    Set 1
                  </th>
                  <th className="px-4 py-3 text-center w-20 bg-slate-50 dark:bg-white/5">
                    Set 2
                  </th>
                  <th className="px-4 py-3 text-center w-20 bg-slate-50 dark:bg-white/5">
                    Set 3
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <td className="px-4 py-3 border-r border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${homeServing ? 'bg-blue-500' : 'bg-transparent'}`}
                      />
                      <span className={homeServing ? 'text-blue-500' : ''}>
                        {home.name}
                      </span>
                    </div>
                  </td>
                  {/* Set 1 */}
                  <td className="px-4 py-3 text-center border-l border-slate-100 dark:border-slate-800">
                    <span
                      className={`text-lg font-mono ${(match.sets[0]?.home ?? 0) > (match.sets[0]?.away ?? 0) ? 'text-blue-600' : 'text-slate-700 dark:text-slate-300'}`}
                    >
                      {match.sets[0]?.home ??
                        (match.currentSet === 1 ? home.score : '-')}
                    </span>
                  </td>
                  {/* Set 2 */}
                  <td className="px-4 py-3 text-center border-l border-slate-100 dark:border-slate-800">
                    <span
                      className={`text-lg font-mono ${(match.sets[1]?.home ?? 0) > (match.sets[1]?.away ?? 0) ? 'text-blue-600' : 'text-slate-700 dark:text-slate-300'}`}
                    >
                      {match.sets[1]?.home ??
                        (match.currentSet === 2 ? home.score : '-')}
                    </span>
                  </td>
                  {/* Set 3 */}
                  <td className="px-4 py-3 text-center border-l border-slate-100 dark:border-slate-800">
                    <span
                      className={`text-lg font-mono ${(match.sets[2]?.home ?? 0) > (match.sets[2]?.away ?? 0) ? 'text-blue-600' : 'text-slate-700 dark:text-slate-300'}`}
                    >
                      {match.sets[2]?.home ??
                        (match.currentSet === 3 ? home.score : '-')}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 border-r border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${awayServing ? 'bg-red-500' : 'bg-transparent'}`}
                      />
                      <span className={awayServing ? 'text-red-500' : ''}>
                        {away.name}
                      </span>
                    </div>
                  </td>
                  {/* Set 1 */}
                  <td className="px-4 py-3 text-center border-l border-slate-100 dark:border-slate-800">
                    <span
                      className={`text-lg font-mono ${(match.sets[0]?.away ?? 0) > (match.sets[0]?.home ?? 0) ? 'text-red-600' : 'text-slate-700 dark:text-slate-300'}`}
                    >
                      {match.sets[0]?.away ??
                        (match.currentSet === 1 ? away.score : '-')}
                    </span>
                  </td>
                  {/* Set 2 */}
                  <td className="px-4 py-3 text-center border-l border-slate-100 dark:border-slate-800">
                    <span
                      className={`text-lg font-mono ${(match.sets[1]?.away ?? 0) > (match.sets[1]?.home ?? 0) ? 'text-red-600' : 'text-slate-700 dark:text-slate-300'}`}
                    >
                      {match.sets[1]?.away ??
                        (match.currentSet === 2 ? away.score : '-')}
                    </span>
                  </td>
                  {/* Set 3 */}
                  <td className="px-4 py-3 text-center border-l border-slate-100 dark:border-slate-800">
                    <span
                      className={`text-lg font-mono ${(match.sets[2]?.away ?? 0) > (match.sets[2]?.home ?? 0) ? 'text-red-600' : 'text-slate-700 dark:text-slate-300'}`}
                    >
                      {match.sets[2]?.away ??
                        (match.currentSet === 3 ? away.score : '-')}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Away Score Button */}
          <button
            onClick={() => awardPoint('away')}
            className="w-full lg:w-auto bg-red-600 hover:bg-red-500 text-white px-8 lg:px-12 py-6 rounded-2xl shadow-lg shadow-red-500/20 active:scale-95 transition-all flex flex-col items-center justify-center"
          >
            <span className="text-xs font-bold opacity-70 mb-1">
              {away.name}
            </span>
            <span className="text-2xl font-black tracking-widest">
              SCORE +1
            </span>
          </button>
        </div>
      </main>

      {/* Footer Settings */}
      <footer className="p-2 px-6 flex justify-between bg-slate-100 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 text-slate-500">
        <div className="flex gap-4">
          <button className="flex items-center gap-2 text-xs font-bold hover:text-blue-500 transition-colors">
            <SettingsIcon className="w-4 h-4" /> SETTINGS
          </button>
          <button className="flex items-center gap-2 text-xs font-bold hover:text-blue-500 transition-colors">
            <HistoryIcon className="w-4 h-4" /> LOG
          </button>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-mono">BUILD: 2.4.0-STABLE</span>
          <div
            className={`w-2 h-2 rounded-full animate-pulse ${isLoading ? 'bg-yellow-500' : 'bg-green-500'}`}
          ></div>
        </div>
      </footer>
    </div>
  );
}
