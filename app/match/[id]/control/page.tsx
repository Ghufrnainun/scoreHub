'use client';

import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useMatch } from '@/hooks/use-match';
import { useState, useEffect } from 'react';
import type { MatchRole } from '@/lib/socket';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  SettingsPanel,
  DisplaySettings,
  defaultSettings,
} from '@/components/match/settings-panel';

// --- ICONS (Material Icons equivalent using SVG) ---
const AddIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
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
);
const SunIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M6.76 4.84l-1.8-1.79-1.41 1.41 1.79 1.8 1.42-1.42zM12 4V1h-2v3h2zm5.24.84l1.42 1.42 1.79-1.8-1.41-1.41-1.8 1.79zM21 11h-3v2h3v-2zM6 12a6 6 0 1112 0 6 6 0 01-12 0zm-3 1H0v-2h3v2zm3.76 7.16l-1.42 1.42 1.8 1.79 1.41-1.41-1.79-1.8zm10.48 0l1.79 1.8 1.41-1.41-1.8-1.79-1.4 1.4zM12 23v-3h-2v3h2z" />
  </svg>
);
const MoonIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
  </svg>
);
const SwapIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M6.99 11L3 15l3.99 4v-3H14v-2H6.99v-3zM21 9l-3.99-4v3H10v2h7.01v3L21 9z" />
  </svg>
);
const HelpIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z" />
  </svg>
);

const ShuttlecockIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 -0.42 42.356 42.356"
    fill="currentColor"
  >
    <path
      d="M157.288,169.268l2.295,5.865s-8.735,11.6-9.88,13.583-4.124,3.328-4.124,3.328l-1.666,3.2,2.738,2.738,1.709-1.709a49.942,49.942,0,0,1,2.636-5.656c1.212-2.013,9.826-13.669,9.826-13.669L167.7,178.3l1.354,6.882s-11.6,8.556-13.669,9.826a46.424,46.424,0,0,1-5.656,2.636l-1.709,1.709,2.693,2.693,3.363-1.745s1.327-2.963,3.3-4.1,13.5-9.8,13.5-9.8l5.852,2.307-1.6,5.511s-13.267,5.661-15.275,6.735a48.208,48.208,0,0,1-5.477,1.733l-6.765,3.887.711.711-2.45,2.45-.092-.092a6.523,6.523,0,0,1-8.253-.714l-1.83-1.83c-2.214-2.214-1.388-4.625.6-6.938l-.034-.034.942-.942h0l1.508-1.508.665.665,3.8-6.589a21.029,21.029,0,0,1,1.759-5.5c1.146-1.986,6.814-15.355,6.814-15.355l5.536-1.63M142.993,197l-1.7,3.259,2.223,2.223-.686-.686,2.479-2.479Zm3.689,3.689L144.2,203.17l1.483,1.483,3.265-1.694Z"
      transform="translate(-134.376 -169.268)"
    />
  </svg>
);

export default function ControlPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [displaySettings, setDisplaySettings] =
    useState<DisplaySettings>(defaultSettings);

  const matchId = params.id as string;
  const role = (searchParams.get('role') || 'referee') as MatchRole;
  const pin = searchParams.get('pin') || undefined;

  const {
    match,
    isLoading,
    error,
    awardPoint,
    undo,
    useChallenge,
    toggleSides,
    resetMatch,
  } = useMatch({
    matchId,
    role,
    pin,
  });

  useEffect(() => {
    const saved = localStorage.getItem('displaySettings');
    if (saved) {
      try {
        setDisplaySettings({ ...defaultSettings, ...JSON.parse(saved) });
      } catch {
        // Invalid JSON
      }
    }
  }, []);

  const handleSettingsChange = (newSettings: DisplaySettings) => {
    setDisplaySettings(newSettings);
    localStorage.setItem('displaySettings', JSON.stringify(newSettings));
  };

  useEffect(() => {
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
      <div className="text-white text-center p-10 font-bold">LOADING…</div>
    );

  const home = match.teams.home;
  const away = match.teams.away;
  const homeServing = match.server === 'home';
  const awayServing = match.server === 'away';
  const isSingles = match.gameMode === 'single';

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
            onClick={toggleSides}
            title="Swap Sides"
            className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-black uppercase transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          >
            <SwapIcon className="w-5 h-5" />
            <span className="hidden sm:inline">Swap Sides</span>
          </button>
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="w-11 h-11 flex items-center justify-center bg-white/5 rounded-full hover:bg-white/10 transition-all active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          >
            {theme === 'dark' ? (
              <SunIcon className="w-4 h-4" />
            ) : (
              <MoonIcon className="w-4 h-4" />
            )}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main
        id="main-content"
        className="flex-1 p-2 sm:p-4 flex flex-col gap-3 max-w-7xl mx-auto w-full overflow-hidden"
      >
        {/* Score Strip */}
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg flex items-center justify-center py-2 px-3 border border-slate-200 dark:border-slate-800 relative">
          <button
            onClick={undo}
            aria-label="Undo last point"
            className="w-12 h-12 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full absolute left-2 transition-all active:scale-90 text-sky-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900"
          >
            <UndoIcon className="w-6 h-6 sm:w-7 sm:h-7" />
          </button>

          <div className="flex items-center gap-4 sm:gap-6">
            <span className="text-3xl sm:text-5xl lg:text-6xl font-mono font-black text-blue-600 dark:text-blue-400 tracking-tighter tabular-nums">
              {home.score}
            </span>
            <span className="text-2xl sm:text-3xl font-bold text-slate-400">
              -
            </span>
            <span className="text-3xl sm:text-5xl lg:text-6xl font-mono font-black text-red-600 dark:text-red-400 tracking-tighter tabular-nums">
              {away.score}
            </span>
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                aria-label="Report issue"
                className="w-12 h-12 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full absolute right-2 transition-all active:scale-90 text-orange-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900"
              >
                <ReportIcon className="w-6 h-6 sm:w-7 sm:h-7" />
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-slate-900 dark:text-slate-100 uppercase tracking-tight font-black">
                  Report Match Issue
                </AlertDialogTitle>
                <AlertDialogDescription className="text-slate-500 dark:text-slate-400">
                  The referee has been notified about the issue on Court.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogAction className="bg-orange-500 hover:bg-orange-600 text-white font-bold uppercase transition-transform active:scale-95">
                  Confirm
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Main Game Area */}
        <div className="flex flex-col landscape:flex-row items-center gap-2 sm:gap-3 flex-1 min-h-0">
          {/* Left Score Button */}
          <button
            onClick={() => awardPoint(match.isFlipped ? 'away' : 'home')}
            className="hidden landscape:flex flex-shrink-0 w-14 sm:w-20 lg:w-24 bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white rounded-lg lg:rounded-xl shadow-md active:scale-95 transition-[transform,box-shadow,background-color] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 flex-col items-center justify-center py-3 sm:py-4"
          >
            <span className="text-[8px] sm:text-[10px] font-semibold opacity-90 text-center leading-tight px-1 line-clamp-1 mb-1">
              {match.isFlipped ? away.name : home.name}
            </span>
            <AddIcon className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {/* Court Visual */}
          <div className="flex-1 w-full landscape:w-auto min-w-0 aspect-[2/1] max-h-[35vh] landscape:max-h-[50vh] lg:max-h-[40vh] bg-[#16a34a] court-grid rounded-xl badminton-lines relative overflow-hidden shadow-inner border border-white/20 select-none">
            <div className="net-line z-0"></div>

            {/* Service Arrow */}
            {match.server && match.serviceCourt && (
              <div className="absolute w-full h-full inset-0 pointer-events-none z-0 overflow-hidden">
                {(() => {
                  const isHomeOnLeft = !match.isFlipped;
                  const serverSide =
                    match.server === 'home'
                      ? isHomeOnLeft
                        ? 'left'
                        : 'right'
                      : isHomeOnLeft
                        ? 'right'
                        : 'left';

                  const isServiceRight = match.serviceCourt === 'right';

                  // Determine position based on serving side and court
                  const posClass =
                    serverSide === 'left'
                      ? isServiceRight
                        ? 'bottom-[25%] left-[25%] -translate-x-1/2 translate-y-1/2' // BL
                        : 'top-[25%] left-[25%] -translate-x-1/2 -translate-y-1/2' // TL
                      : isServiceRight
                        ? 'top-[25%] right-[25%] translate-x-1/2 -translate-y-1/2' // TR
                        : 'bottom-[25%] right-[25%] translate-x-1/2 translate-y-1/2'; // BR

                  // Rotation logic: diagonal points towards the other end
                  const rotClass =
                    serverSide === 'left'
                      ? isServiceRight
                        ? 'rotate-[0deg]' // BL -> TR
                        : 'rotate-[90deg]' // TL -> BR
                      : isServiceRight
                        ? 'rotate-[180deg]' // TR -> BL
                        : 'rotate-[-90deg]'; // BR -> TL

                  return (
                    <div
                      className={`absolute transition-[transform,top,right,bottom,left] duration-500 ${posClass}`}
                    >
                      <NorthEastIcon
                        className={`text-yellow-400/60 w-24 h-24 lg:w-32 lg:h-32 drop-shadow-sm opacity-80 ${rotClass}`}
                      />
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Court Names layer */}
            {(() => {
              const leftTeamSide = match.isFlipped ? 'away' : 'home';
              const rightTeamSide = match.isFlipped ? 'home' : 'away';
              const leftTeam = match.teams[leftTeamSide];
              const rightTeam = match.teams[rightTeamSide];

              const getQuadrantInfo = (quadrant: 'TL' | 'TR' | 'BL' | 'BR') => {
                if (quadrant === 'TL')
                  return { side: leftTeamSide, team: leftTeam, courtIdx: 1 };
                if (quadrant === 'BL')
                  return { side: leftTeamSide, team: leftTeam, courtIdx: 0 };
                if (quadrant === 'TR')
                  return { side: rightTeamSide, team: rightTeam, courtIdx: 0 };
                return { side: rightTeamSide, team: rightTeam, courtIdx: 1 };
              };

              const getQuadrantContent = (
                quadrant: 'TL' | 'TR' | 'BL' | 'BR',
              ) => {
                const { side, team, courtIdx } = getQuadrantInfo(quadrant);
                if (!team || !match.server) return '';

                if (isSingles) {
                  // In Singles, both players are in the quadrant matching the server's score
                  const servingTeam = match.server === 'home' ? home : away;
                  const activeCourtIdx = servingTeam.score % 2 === 0 ? 0 : 1;

                  if (courtIdx !== activeCourtIdx) return '';
                  return team.players[0]?.name || team.name;
                }

                const pPositions = team.playerPositions || [0, 1];
                const playerIdx = pPositions[courtIdx];
                return (
                  team.players[playerIdx]?.name ||
                  (courtIdx === 0 ? team.name : '')
                );
              };

              const isServerQuadrant = (
                quadrant: 'TL' | 'TR' | 'BL' | 'BR',
              ) => {
                const { side, team, courtIdx } = getQuadrantInfo(quadrant);
                if (!match.server || side !== match.server) return false;
                if (isSingles) {
                  const expectedCourtIdx = team.score % 2 === 0 ? 0 : 1;
                  return courtIdx === expectedCourtIdx;
                } else {
                  if (match.servingPlayerIndex === undefined) return false;
                  const pPositions = team.playerPositions || [0, 1];
                  return pPositions[courtIdx] === match.servingPlayerIndex;
                }
              };

              const isReceiverQuadrant = (
                quadrant: 'TL' | 'TR' | 'BL' | 'BR',
              ) => {
                const { side, team } = getQuadrantInfo(quadrant);
                const isServerSide = side === match.server;
                if (isServerSide) return false;

                // Receiver's court is the same parity as Server's score
                const servingTeam = match.server === 'home' ? home : away;
                const activeCourtIdx = servingTeam.score % 2 === 0 ? 0 : 1;

                if (isSingles) {
                  const { courtIdx } = getQuadrantInfo(quadrant);
                  return courtIdx === activeCourtIdx;
                } else {
                  // In Doubles, the receiver is the player who will receive based on current server action
                  // This matches the court index currently served to
                  const { courtIdx } = getQuadrantInfo(quadrant);
                  const expectedReceiverCourtIdx = activeCourtIdx; // Receiver occupies the same-type court relative to their baseline
                  return courtIdx === expectedReceiverCourtIdx;
                }
              };

              const getServerColor = (quadrant: 'TL' | 'TR' | 'BL' | 'BR') => {
                const isServer = isServerQuadrant(quadrant);
                const isReceiver = isReceiverQuadrant(quadrant);
                if (!isServer && !isReceiver) return '';
                const { side } = getQuadrantInfo(quadrant);
                return side === 'home'
                  ? displaySettings.teamColors.home
                  : displaySettings.teamColors.away;
              };

              const QuadrantCell = ({
                quadrant,
                borderClass,
              }: {
                quadrant: 'TL' | 'TR' | 'BL' | 'BR';
                borderClass: string;
              }) => {
                const isServer = isServerQuadrant(quadrant);
                const isReceiver = isReceiverQuadrant(quadrant);
                const serverColor = getServerColor(quadrant);
                const content = getQuadrantContent(quadrant);
                return (
                  <div
                    className={`flex flex-col items-center justify-center p-2 ${borderClass} transition-colors duration-300`}
                    style={
                      isServer
                        ? { backgroundColor: `${serverColor}40` }
                        : isReceiver
                          ? { backgroundColor: `${serverColor}15` }
                          : {}
                    }
                  >
                    <div className="flex items-center gap-1">
                      {isServer && displaySettings.showServerIcon && (
                        <ShuttlecockIcon className="w-3 h-3 lg:w-4 lg:h-4 text-yellow-300 drop-shadow" />
                      )}
                      <span
                        className={`font-black text-sm lg:text-lg text-center drop-shadow-md leading-tight ${isServer ? 'text-yellow-200' : ''}`}
                        style={
                          isServer
                            ? { textShadow: '0 0 8px rgba(0,0,0,0.5)' }
                            : {}
                        }
                      >
                        {content}
                      </span>
                    </div>
                  </div>
                );
              };

              return (
                <div className="absolute inset-x-0 inset-y-0 grid grid-cols-2 grid-rows-2 text-white z-10">
                  <QuadrantCell
                    quadrant="TL"
                    borderClass="border-r-2 border-b-2 border-white/30"
                  />
                  <QuadrantCell
                    quadrant="TR"
                    borderClass="border-l-2 border-b-2 border-white/30"
                  />
                  <QuadrantCell
                    quadrant="BL"
                    borderClass="border-r-2 border-t-2 border-white/30"
                  />
                  <QuadrantCell
                    quadrant="BR"
                    borderClass="border-l-2 border-t-2 border-white/30"
                  />
                </div>
              );
            })()}
          </div>

          {/* Right Score Button */}
          <button
            onClick={() => awardPoint(match.isFlipped ? 'home' : 'away')}
            className="hidden landscape:flex flex-shrink-0 w-14 sm:w-20 lg:w-24 bg-gradient-to-b from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white rounded-lg lg:rounded-xl shadow-md active:scale-95 transition-[transform,box-shadow,background-color] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 flex-col items-center justify-center py-3 sm:py-4"
          >
            <span className="text-[8px] sm:text-[10px] font-semibold opacity-90 text-center leading-tight px-1 line-clamp-1 mb-1">
              {match.isFlipped ? home.name : away.name}
            </span>
            <AddIcon className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Portrait Buttons */}
        <div className="flex landscape:hidden gap-3 px-2 mb-1">
          <button
            onClick={() => awardPoint(match.isFlipped ? 'away' : 'home')}
            className="flex-1 bg-gradient-to-br from-blue-500 to-blue-700 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 rounded-2xl py-8 flex flex-col items-center justify-center shadow-xl border border-blue-400/20"
          >
            <span className="text-[10px] font-black text-white/70 uppercase mb-2 tracking-widest">
              {match.isFlipped ? away.name : home.name}
            </span>
            <AddIcon className="w-10 h-10 text-white drop-shadow-md" />
          </button>
          <button
            onClick={() => awardPoint(match.isFlipped ? 'home' : 'away')}
            className="flex-1 bg-gradient-to-br from-red-500 to-red-700 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 rounded-2xl py-8 flex flex-col items-center justify-center shadow-xl border border-red-400/20"
          >
            <span className="text-[10px] font-black text-white/70 uppercase mb-2 tracking-widest">
              {match.isFlipped ? home.name : away.name}
            </span>
            <AddIcon className="w-10 h-10 text-white drop-shadow-md" />
          </button>
        </div>

        {/* History Table */}
        <div className="flex-shrink-0 overflow-auto max-h-[30vh] lg:max-h-[25vh]">
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
                      <span>{home.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center border-l border-slate-100 dark:border-slate-800">
                    <span className="text-lg font-mono">
                      {match.sets[0]?.home ??
                        (match.currentSet === 1 ? home.score : '-')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center border-l border-slate-100 dark:border-slate-800">
                    <span className="text-lg font-mono">
                      {match.sets[1]?.home ??
                        (match.currentSet === 2 ? home.score : '-')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center border-l border-slate-100 dark:border-slate-800">
                    <span className="text-lg font-mono">
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
                      <span>{away.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center border-l border-slate-100 dark:border-slate-800">
                    <span className="text-lg font-mono">
                      {match.sets[0]?.away ??
                        (match.currentSet === 1 ? away.score : '-')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center border-l border-slate-100 dark:border-slate-800">
                    <span className="text-lg font-mono">
                      {match.sets[1]?.away ??
                        (match.currentSet === 2 ? away.score : '-')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center border-l border-slate-100 dark:border-slate-800">
                    <span className="text-lg font-mono">
                      {match.sets[2]?.away ??
                        (match.currentSet === 3 ? away.score : '-')}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-2 px-6 flex justify-between bg-slate-100 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 text-slate-500">
        <div className="flex gap-4">
          <SettingsPanel
            settings={displaySettings}
            onSettingsChange={handleSettingsChange}
            homeTeamName={home.name}
            awayTeamName={away.name}
            trigger={
              <button className="flex items-center gap-2 text-xs font-bold hover:text-blue-500 transition-colors">
                <SettingsIcon className="w-4 h-4" /> SETTINGS
              </button>
            }
          />
          <button className="flex items-center gap-2 text-xs font-bold hover:text-blue-500 transition-colors">
            <HistoryIcon className="w-4 h-4" /> LOG
          </button>
          <Button
            asChild
            variant="ghost"
            className="h-auto p-0 flex items-center gap-2 text-xs font-bold hover:text-blue-500 transition-colors bg-transparent hover:bg-transparent"
          >
            <Link href="/docs" target="_blank">
              <HelpIcon className="w-4 h-4" /> HELP
            </Link>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button className="flex items-center gap-2 text-xs font-bold text-red-500 hover:text-red-400 transition-colors">
                <div className="w-4 h-4 border-2 border-current rounded-full flex items-center justify-center font-black text-[8px]">
                  X
                </div>{' '}
                RESET
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 font-sans">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-slate-900 dark:text-slate-100 uppercase tracking-tighter font-black text-2xl">
                  Reset Match?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-slate-500 dark:text-slate-400 font-medium">
                  This will PERMANENTLY clear all scores, sets, and match
                  history. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="gap-3">
                <AlertDialogCancel className="border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold uppercase tracking-tight">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={resetMatch}
                  className="bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-tight transition-transform active:scale-95 px-8"
                >
                  Reset Match
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-mono">BUILD: 2.4.0-STABLE</span>
          <div
            className={`w-2 h-2 rounded-full animate-pulse motion-reduce:animate-none ${isLoading ? 'bg-yellow-500' : 'bg-green-500'}`}
          ></div>
        </div>
      </footer>
    </div>
  );
}
