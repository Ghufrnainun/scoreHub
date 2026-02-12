'use client';

import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useMatch } from '@/hooks/use-match';
import { useState, useEffect } from 'react';
import type { MatchRole } from '@/lib/match-types';
import { cn } from '@/lib/utils';
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
  <svg aria-hidden="true" className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
  </svg>
);
const UndoIcon = ({ className }: { className?: string }) => (
  <svg aria-hidden="true" className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z" />
  </svg>
);
const ReportIcon = ({ className }: { className?: string }) => (
  <svg aria-hidden="true" className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
  </svg>
);
const SettingsIcon = ({ className }: { className?: string }) => (
  <svg aria-hidden="true" className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.04.24.24.41.48.41h3.84c.24 0 .43-.17.47-.41l.36-2.54c.59-.24 1.13-.57 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.08-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
  </svg>
);
const HistoryIcon = ({ className }: { className?: string }) => (
  <svg aria-hidden="true" className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z" />
  </svg>
);
const NorthEastIcon = ({ className }: { className?: string }) => (
  <svg aria-hidden="true" className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M9 5v2h6.59L4 18.59 5.41 20 17 8.41V15h2V5z" />
  </svg>
);
const SunIcon = ({ className }: { className?: string }) => (
  <svg aria-hidden="true" className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M6.76 4.84l-1.8-1.79-1.41 1.41 1.79 1.8 1.42-1.42zM12 4V1h-2v3h2zm5.24.84l1.42 1.42 1.79-1.8-1.41-1.41-1.8 1.79zM21 11h-3v2h3v-2zM6 12a6 6 0 1112 0 6 6 0 01-12 0zm-3 1H0v-2h3v2zm3.76 7.16l-1.42 1.42 1.8 1.79 1.41-1.41-1.79-1.8zm10.48 0l1.79 1.8 1.41-1.41-1.8-1.79-1.4 1.4zM12 23v-3h-2v3h2z" />
  </svg>
);
const MoonIcon = ({ className }: { className?: string }) => (
  <svg aria-hidden="true" className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
  </svg>
);
const SwapIcon = ({ className }: { className?: string }) => (
  <svg aria-hidden="true" className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M6.99 11L3 15l3.99 4v-3H14v-2H6.99v-3zM21 9l-3.99-4v3H10v2h7.01v3L21 9z" />
  </svg>
);
const HelpIcon = ({ className }: { className?: string }) => (
  <svg aria-hidden="true" className={className} viewBox="0 0 24 24" fill="currentColor">
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

  const formatTime = (seconds: number) => {
    const safeSeconds = Math.max(0, Math.floor(seconds));
    const mins = Math.floor(safeSeconds / 60);
    const secs = safeSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const matchId = params.id as string;
  const role = (searchParams.get('role') || 'admin') as MatchRole;
  const pin = searchParams.get('pin') || undefined;
  const token = searchParams.get('token') || undefined;

  const {
    match,
    isLoading,
    error,
    awardPoint,
    undo,
    startTimer,
    pauseTimer,
    resetTimer,
    useChallenge,
    toggleSides,
    resetMatch,
    remainingTime,
  } = useMatch({
    matchId,
    role,
    pin,
    token,
  });

  const isTimerRunning = Boolean(match?.timer?.startedAt && !match?.timer?.pausedAt);

  const toggleTimer = () => {
    if (isTimerRunning) {
      pauseTimer();
      return;
    }
    startTimer();
  };

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
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center text-center p-10 font-bold">
        LOADING…
      </div>
    );

  const home = match.teams.home;
  const away = match.teams.away;
  const displayPath = match.displayCode
    ? `/display/${match.displayCode}`
    : `/match/${matchId}/display`;
  const homeServing = match.server === 'home';
  const awayServing = match.server === 'away';
  const isSingles = match.gameMode === 'single';
  const isBadminton = match.sport === 'badminton';
  const isBasketball = match.sport === 'basketball';
  const isVolleyball = match.sport === 'volleyball';
  const isTennis = match.sport === 'tennis';
  const isSoccerLike = match.sport === 'soccer' || match.sport === 'futsal';
  const isSetBased = isBadminton || isVolleyball || isTennis;

  const phaseLabel = isBasketball ? 'QTR' : isSoccerLike ? 'HALF' : 'SET';
  const phaseValue =
    match.status === 'finished'
      ? 'FIN'
      : isBasketball
        ? (match.sportState?.basketball?.currentPeriod ?? 1)
        : isSoccerLike
          ? (match.sportState?.soccer?.currentPeriod ?? 1)
          : (match.currentSet ?? 1);

  const resolveTeamSide = (side: 'home' | 'away') => {
    if (!match.isFlipped) return side;
    return side === 'home' ? 'away' : 'home';
  };

  const renderScoringControls = () => {
    const homeSide = resolveTeamSide('home');
    const awaySide = resolveTeamSide('away');

    if (match.sport === 'basketball') {
      return (
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { side: homeSide, label: home.name, tone: 'blue' },
            { side: awaySide, label: away.name, tone: 'red' },
          ].map((team) => (
            <div
              key={team.side}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-700 dark:text-slate-200 text-pretty">
                  {team.label}
                </span>
                <span className="text-sm font-mono font-bold tabular-nums text-slate-500 dark:text-slate-400">
                  {team.side === 'home' ? home.score : away.score}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map((value) => (
                  <Button
                    key={value}
                    variant="secondary"
                    className={cn(
                      'h-12 text-sm font-bold tabular-nums',
                      team.tone === 'blue'
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-red-600 dark:text-red-400',
                    )}
                    onClick={() => awardPoint(team.side, value)}
                    aria-label={`Add ${value} point for ${team.label}`}
                  >
                    +{value}
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (match.sport === 'tennis') {
      const tennis = match.sportState?.tennis;
      const pointLabel = (value: number) => {
        if (tennis?.tiebreak) return `${value}`;
        if (value === 0) return '0';
        if (value === 1) return '15';
        if (value === 2) return '30';
        if (value === 3) return '40';
        return 'AD';
      };

      return (
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { side: homeSide, label: home.name },
            { side: awaySide, label: away.name },
          ].map((team) => (
            <div
              key={team.side}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-700 dark:text-slate-200 text-pretty">
                  {team.label}
                </span>
                <span className="text-sm font-mono font-bold tabular-nums text-slate-500 dark:text-slate-400">
                  Games: {team.side === 'home' ? home.score : away.score}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="secondary"
                  className="h-12 text-sm font-bold"
                  onClick={() => awardPoint(team.side)}
                  aria-label={`Add point for ${team.label}`}
                >
                  Point
                </Button>
                <div className="rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-3 py-2 text-xs text-slate-500 dark:text-slate-400 text-pretty">
                  {tennis?.tiebreak
                    ? `TB: ${pointLabel(
                        tennis.tiebreakPoints?.[team.side] || 0,
                      )}`
                    : `Point: ${pointLabel(tennis?.points?.[team.side] || 0)}`}
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (match.sport === 'volleyball') {
      return (
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { side: homeSide, label: home.name, tone: 'blue' },
            { side: awaySide, label: away.name, tone: 'red' },
          ].map((team) => (
            <div
              key={team.side}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-700 dark:text-slate-200 text-pretty">
                  {team.label}
                </span>
                <span className="text-sm font-mono font-bold tabular-nums text-slate-500 dark:text-slate-400">
                  {team.side === 'home' ? home.score : away.score}
                </span>
              </div>
              <Button
                variant="secondary"
                className={cn(
                  'h-12 text-sm font-bold',
                  team.tone === 'blue'
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-red-600 dark:text-red-400',
                )}
                onClick={() => awardPoint(team.side)}
                aria-label={`Add point for ${team.label}`}
              >
                +1 Point
              </Button>
            </div>
          ))}
        </div>
      );
    }

    if (match.sport === 'soccer' || match.sport === 'futsal') {
      return (
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { side: homeSide, label: home.name, tone: 'blue' },
            { side: awaySide, label: away.name, tone: 'red' },
          ].map((team) => (
            <div
              key={team.side}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-700 dark:text-slate-200 text-pretty">
                  {team.label}
                </span>
                <span className="text-sm font-mono font-bold tabular-nums text-slate-500 dark:text-slate-400">
                  {team.side === 'home' ? home.score : away.score}
                </span>
              </div>
              <Button
                variant="secondary"
                className={cn(
                  'h-12 text-sm font-bold',
                  team.tone === 'blue'
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-red-600 dark:text-red-400',
                )}
                onClick={() => awardPoint(team.side)}
                aria-label={`Add goal for ${team.label}`}
              >
                +1 Goal
              </Button>
            </div>
          ))}
        </div>
      );
    }

    return null;
  };

  const getPeriodScore = (
    side: 'home' | 'away',
    index: number,
    currentPeriod: number,
    periods?: { home: number; away: number }[],
  ) => {
    if (index + 1 > currentPeriod) return '-';
    const period = periods?.[index];
    if (!period) return index + 1 === currentPeriod ? 0 : '-';
    return period[side];
  };

  const scoreTableConfig = (() => {
    if (isBasketball) {
      const currentPeriod = match.sportState?.basketball?.currentPeriod ?? 1;
      const periods = match.sportState?.basketball?.periods ?? [];
      const columns = Array.from({ length: 4 }, (_, index) => ({
        key: `q-${index + 1}`,
        label: `Q${index + 1}`,
        home: getPeriodScore('home', index, currentPeriod, periods),
        away: getPeriodScore('away', index, currentPeriod, periods),
      }));
      return { columns, showServe: false };
    }

    if (isSoccerLike) {
      const currentPeriod = match.sportState?.soccer?.currentPeriod ?? 1;
      const periods = match.sportState?.soccer?.periods ?? [];
      const columns = Array.from({ length: 2 }, (_, index) => ({
        key: `h-${index + 1}`,
        label: `H${index + 1}`,
        home: getPeriodScore('home', index, currentPeriod, periods),
        away: getPeriodScore('away', index, currentPeriod, periods),
      }));
      return { columns, showServe: false };
    }

    if (isSetBased) {
      const maxSets = isVolleyball
        ? (match.sportState?.volleyball?.maxSets ?? 5)
        : 3;
      const columns = Array.from({ length: maxSets }, (_, index) => ({
        key: `set-${index + 1}`,
        label: `Set ${index + 1}`,
        home:
          match.sets[index]?.home ??
          (match.currentSet === index + 1 ? home.score : '-'),
        away:
          match.sets[index]?.away ??
          (match.currentSet === index + 1 ? away.score : '-'),
      }));
      return { columns, showServe: isBadminton };
    }

    return null;
  })();

  return (
    <div className="font-display bg-slate-50 dark:bg-background text-slate-900 dark:text-foreground min-h-screen flex flex-col font-sans transition-colors duration-200">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-slate-900 focus:px-4 focus:py-2 focus:text-xs focus:font-bold focus:text-white"
      >
        Skip to content
      </a>
      {/* Header */}
      <header className="p-3 px-6 flex justify-between items-center bg-white dark:bg-card/80 dark:backdrop-blur-xl border-b border-slate-200 dark:border-white/5 shadow-sm z-30">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="group flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Image
                src="/scorehub-logo.svg"
                alt="Scorehub logo"
                width={18}
                height={18}
                className="h-4 w-4"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-black tracking-tighter uppercase leading-none">
                ScoreHub
              </span>
              <span className="text-[11px] font-bold text-blue-500 tracking-[0.2em] leading-none mt-1">
                CONTROL
              </span>
            </div>
          </Link>
          <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1"></div>
          <div className="flex flex-col gap-1 items-start">
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-card border-2 border-slate-200 dark:border-white/5 rounded-xl shadow-sm">
              <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">
                Match ID
              </span>
              <span className="text-sm font-mono font-black text-slate-900 dark:text-foreground leading-none">
                {matchId}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Link
                href={displayPath}
                target="_blank"
                className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 transition-all shadow-md active:scale-95 flex items-center gap-2"
              >
                <NorthEastIcon className="w-3.5 h-3.5" /> OPEN DISPLAY
              </Link>
              <button
                onClick={() => {
                  const url = `${window.location.origin}${displayPath}`;
                  navigator.clipboard.writeText(url);
                  alert('Display link copied!');
                }}
                className="px-3 py-1.5 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-white/10 transition-all border border-slate-200 dark:border-white/5 active:scale-95"
              >
                COPY LINK
              </button>
              <button
                onClick={() => {
                  const url = `${window.location.origin}${displayPath}?overlay=true`;
                  navigator.clipboard.writeText(url);
                  alert(
                    'OBS Overlay link copied! Use this as a Browser Source in OBS.',
                  );
                }}
                className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-green-500 transition-all shadow-md active:scale-95 flex items-center gap-1.5"
              >
                <div className="w-2 h-2 rounded-full bg-white animate-pulse motion-reduce:animate-none"></div>
                OBS LINK
              </button>
            </div>
          </div>
        </div>

        {/* Central Match Status & Timer */}
        <div className="flex items-center gap-4 bg-slate-100 dark:bg-card/50 dark:backdrop-blur-md px-5 py-2 rounded-2xl border border-slate-200 dark:border-white/5 shadow-inner">
          <div className="flex flex-col items-center min-w-[50px]">
            <span className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase leading-none mb-1.5">
              {phaseLabel}
            </span>
            <span className="text-2xl font-black leading-none dark:text-foreground">
              {phaseValue}
            </span>
          </div>
          <div className="h-8 w-px bg-slate-300 dark:bg-slate-600"></div>
          <button
            className="flex flex-col items-center select-none group px-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg"
            onClick={toggleTimer}
            onContextMenu={(e) => {
              e.preventDefault();
              resetTimer();
            }}
            aria-label={`Match timer. Currently ${formatTime(remainingTime)}. ${isTimerRunning ? 'Click to pause' : 'Click to start'}. Right click to reset.`}
          >
            <span
              className={cn(
                'text-2xl font-mono font-black tabular-nums transition-all duration-300',
                isTimerRunning
                  ? 'text-blue-600 dark:text-blue-400 scale-110'
                  : 'text-slate-400',
              )}
            >
              {formatTime(remainingTime)}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 group-hover:text-blue-500 transition-colors">
              {isTimerRunning ? 'PAUSE' : 'START'}
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleSides}
            title="Swap Sides"
            aria-label="Swap sides on court"
            className="p-3.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-slate-600 dark:text-slate-400 group active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 shadow-sm"
          >
            <SwapIcon className="w-6 h-6 group-active:rotate-180 transition-transform duration-500" />
          </button>

          <SettingsPanel
            settings={displaySettings}
            onSettingsChange={handleSettingsChange}
            homeTeamName={home.name}
            awayTeamName={away.name}
            sportId={match.sport}
            trigger={
              <button
                title="Display Settings"
                aria-label="Open display settings"
                className="p-3.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-slate-600 dark:text-slate-400 group active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 shadow-sm"
              >
                <SettingsIcon className="w-6 h-6 group-hover:rotate-90 transition-transform duration-500" />
              </button>
            }
          />

          <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 mx-1"></div>

          <button
            onClick={toggleTheme}
            title="Toggle Theme"
            aria-label="Toggle dark mode"
            className="p-3.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-slate-600 dark:text-slate-400 active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 shadow-sm"
          >
            {theme === 'light' ? (
              <MoonIcon className="w-6 h-6" />
            ) : (
              <SunIcon className="w-6 h-6" />
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
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-md flex items-center justify-center py-2 px-3 border border-slate-200 dark:border-slate-800 relative">
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
        </div>

        {/* Main Game Area */}
        <div className="flex flex-col landscape:flex-row items-center gap-2 sm:gap-3 flex-1 min-h-0">
          {/* Left Score Button */}
          {isBadminton && match.status === 'finished' ? (
            <div className="hidden landscape:flex flex-shrink-0 w-24 sm:w-28 lg:w-40 flex-col items-center justify-center opacity-50 cursor-not-allowed border-2 border-white/5 rounded-xl lg:rounded-3xl bg-slate-900/50">
              <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest text-center">
                MATCH
                <br />
                ENDED
              </span>
            </div>
          ) : isBadminton ? (
            <button
              onClick={() => awardPoint(match.isFlipped ? 'away' : 'home')}
              className="hidden landscape:flex flex-shrink-0 w-24 sm:w-28 lg:w-40 bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white rounded-xl lg:rounded-3xl shadow-xl active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 flex-col items-center justify-center py-6 lg:py-10 border-2 border-white/10"
            >
              <span className="text-[9px] lg:text-[10px] font-black opacity-70 mb-1 lg:mb-2 uppercase tracking-widest leading-none">
                AWARD POINT
              </span>
              <span className="text-xs lg:text-base font-black text-center leading-tight px-3 mb-2 lg:mb-4 uppercase tracking-tight">
                {match.isFlipped ? away.name : home.name}
              </span>
              <AddIcon className="w-8 h-8 lg:w-12 lg:h-12 drop-shadow-lg" />
            </button>
          ) : null}

          {/* Court Visual */}
          {isBadminton ? (
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

                const getQuadrantInfo = (
                  quadrant: 'TL' | 'TR' | 'BL' | 'BR',
                ) => {
                  if (quadrant === 'TL')
                    return { side: leftTeamSide, team: leftTeam, courtIdx: 1 };
                  if (quadrant === 'BL')
                    return { side: leftTeamSide, team: leftTeam, courtIdx: 0 };
                  if (quadrant === 'TR')
                    return {
                      side: rightTeamSide,
                      team: rightTeam,
                      courtIdx: 0,
                    };
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

                const getServerColor = (
                  quadrant: 'TL' | 'TR' | 'BL' | 'BR',
                ) => {
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
                          className={`font-black text-base lg:text-xl text-center drop-shadow-md leading-tight ${isServer ? 'text-yellow-200' : ''}`}
                          style={
                            isServer
                              ? { textShadow: '0 0 10px rgba(0,0,0,0.6)' }
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
          ) : (
            <div className="flex-1 w-full min-w-0 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 text-pretty">
                    Sport
                  </p>
                  <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 text-balance">
                    {match.sport}
                  </h2>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 text-pretty">
                    Status
                  </p>
                  <p className="text-sm font-mono font-bold text-slate-700 dark:text-slate-200 tabular-nums">
                    {match.status}
                  </p>
                </div>
              </div>
              <div className="mt-4">{renderScoringControls()}</div>
            </div>
          )}

          {/* Right Score Button */}
          {isBadminton && match.status === 'finished' ? (
            <div className="hidden landscape:flex flex-shrink-0 w-24 sm:w-28 lg:w-40 flex-col items-center justify-center opacity-50 cursor-not-allowed border-2 border-white/5 rounded-xl lg:rounded-3xl bg-slate-900/50">
              <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest text-center">
                MATCH
                <br />
                ENDED
              </span>
            </div>
          ) : isBadminton ? (
            <button
              onClick={() => awardPoint(match.isFlipped ? 'home' : 'away')}
              className="hidden landscape:flex flex-shrink-0 w-24 sm:w-28 lg:w-40 bg-gradient-to-b from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white rounded-xl lg:rounded-3xl shadow-xl active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 flex-col items-center justify-center py-6 lg:py-10 border-2 border-white/10"
            >
              <span className="text-[9px] lg:text-[10px] font-black opacity-70 mb-1 lg:mb-2 uppercase tracking-widest leading-none">
                AWARD POINT
              </span>
              <span className="text-xs lg:text-base font-black text-center leading-tight px-3 mb-2 lg:mb-4 uppercase tracking-tight">
                {match.isFlipped ? home.name : away.name}
              </span>
              <AddIcon className="w-8 h-8 lg:w-12 lg:h-12 drop-shadow-lg" />
            </button>
          ) : null}
        </div>

        {/* Portrait Buttons */}
        {isBadminton ? (
          <div className="flex landscape:hidden gap-4 px-2 mb-2">
            <button
              onClick={() => awardPoint(match.isFlipped ? 'away' : 'home')}
              className="flex-1 bg-gradient-to-br from-blue-500 to-blue-700 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 rounded-3xl py-10 flex flex-col items-center justify-center shadow-xl border-2 border-white/10"
            >
              <span className="text-xs font-black text-white uppercase mb-2 tracking-[0.2em]">
                {match.isFlipped ? away.name : home.name}
              </span>
              <AddIcon className="w-12 h-12 text-white drop-shadow-lg" />
            </button>
            <button
              onClick={() => awardPoint(match.isFlipped ? 'home' : 'away')}
              className="flex-1 bg-gradient-to-br from-red-500 to-red-700 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 rounded-3xl py-10 flex flex-col items-center justify-center shadow-xl border-2 border-white/10"
            >
              <span className="text-xs font-black text-white uppercase mb-2 tracking-[0.2em]">
                {match.isFlipped ? home.name : away.name}
              </span>
              <AddIcon className="w-12 h-12 text-white drop-shadow-lg" />
            </button>
          </div>
        ) : null}

        {/* History Table */}
        {scoreTableConfig ? (
          <div className="flex-shrink-0 w-full mt-auto">
            <div className="w-full max-w-5xl mx-auto overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-all duration-300">
              <table className="w-full text-xs sm:text-sm uppercase font-black tracking-tight">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800/80 text-left text-slate-500">
                    <th className="px-6 py-4 w-48 border-r border-slate-200 dark:border-slate-700">
                      Team
                    </th>
                    {scoreTableConfig.columns.map((column) => (
                      <th
                        key={column.key}
                        className="px-6 py-4 text-center w-24 bg-slate-100/50 dark:bg-white/5"
                      >
                        {column.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-100 dark:border-slate-800">
                    <td className="px-6 py-4 border-r border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        {scoreTableConfig.showServe ? (
                          <div
                            className={`w-2 h-2 rounded-full ${homeServing ? 'bg-blue-500' : 'bg-transparent'}`}
                          />
                        ) : null}
                        <span>{home.name}</span>
                      </div>
                    </td>
                    {scoreTableConfig.columns.map((column) => (
                      <td
                        key={`home-${column.key}`}
                        className="px-6 py-4 text-center border-l border-slate-100 dark:border-slate-800"
                      >
                        <span className="text-lg font-mono">
                          {column.home}
                        </span>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-6 py-4 border-r border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        {scoreTableConfig.showServe ? (
                          <div
                            className={`w-2 h-2 rounded-full ${awayServing ? 'bg-red-500' : 'bg-transparent'}`}
                          />
                        ) : null}
                        <span>{away.name}</span>
                      </div>
                    </td>
                    {scoreTableConfig.columns.map((column) => (
                      <td
                        key={`away-${column.key}`}
                        className="px-6 py-4 text-center border-l border-slate-100 dark:border-slate-800"
                      >
                        <span className="text-lg font-mono">
                          {column.away}
                        </span>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
      </main>

      {/* Footer */}
      <footer className="p-2 px-6 flex justify-between bg-slate-100 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 text-slate-500">
        <div className="flex gap-4">
          <SettingsPanel
            settings={displaySettings}
            onSettingsChange={handleSettingsChange}
            homeTeamName={home.name}
            awayTeamName={away.name}
            sportId={match.sport}
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
