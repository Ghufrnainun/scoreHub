'use client';

import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useMatch } from '@/hooks/use-match';
import { useState, useEffect } from 'react';
import type { MatchRole } from '@/lib/match-types';
import { cn } from '@/lib/utils';
import { loadRefereeSession, saveRefereeSession } from '@/lib/auth';
import { loadValidAdminSession } from '@/lib/admin-session';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  SettingsPanel,
  DisplaySettings,
  MatchSettingsDraft,
  SettingsSavePayload,
  defaultSettings,
} from '@/components/match/settings-panel';

// --- MINIMALIST ICONS (Clean SVG) ---
const UndoIcon = ({ className }: { className?: string }) => (
  <svg aria-hidden="true" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 7v6h6" />
    <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
  </svg>
);
const SettingsIcon = ({ className }: { className?: string }) => (
  <svg aria-hidden="true" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const SunIcon = ({ className }: { className?: string }) => (
  <svg aria-hidden="true" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
  </svg>
);
const MoonIcon = ({ className }: { className?: string }) => (
  <svg aria-hidden="true" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
  </svg>
);
const SwapIcon = ({ className }: { className?: string }) => (
  <svg aria-hidden="true" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m16 3 4 4-4 4M20 7H4M8 21l-4-4 4-4M4 17h16" />
  </svg>
);
const ShuttlecockIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    {/* Base Cork at the bottom */}
    <path d="M10 17a2 2 0 0 0 4 0v-2h-4v2z" fill="currentColor" />
    {/* Feathers body outline */}
    <path d="M5 4c0 0 1.5 8 5 11h4c3.5-3 5-11 5-11" />
    {/* Internal feather ribs */}
    <path d="M9 4v11" />
    <path d="M12 4v11" />
    <path d="M15 4v11" />
    {/* Horizontal bands */}
    <path d="M6.5 8h11" />
    <path d="M8 12h8" />
  </svg>
);

export default function ControlPage() {
  const AUTO_TIMER_KEY = 'scorehub:auto-start-timer-on-first-point';
  const params = useParams();
  const searchParams = useSearchParams();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [displaySettings, setDisplaySettings] = useState<DisplaySettings>(defaultSettings);
  const [pendingAction, setPendingAction] = useState<{
    title: string;
    description: string;
    confirmLabel: string;
    action: () => void;
  } | null>(null);
  const [autoStartTimerOnFirstPoint, setAutoStartTimerOnFirstPoint] = useState(false);
  const [pendingPointAward, setPendingPointAward] = useState<{
    winner: 'home' | 'away';
    value?: number;
  } | null>(null);

  const formatTime = (seconds: number) => {
    const safeSeconds = Math.max(0, Math.floor(seconds));
    const mins = Math.floor(safeSeconds / 60);
    const secs = safeSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const matchId = params.id as string;
  const role = (searchParams.get('role') || 'admin') as MatchRole;
  const pin = searchParams.get('pin') || undefined;
  const queryToken = searchParams.get('token') || undefined;
  const [sessionReady, setSessionReady] = useState(false);
  const [token, setToken] = useState<string | undefined>(queryToken);
  const [adminSessionToken, setAdminSessionToken] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (role === 'admin') {
      const adminSession = loadValidAdminSession();
      setAdminSessionToken(adminSession?.token);
      setSessionReady(true);
      return;
    }

    if (role !== 'referee') {
      setSessionReady(true);
      return;
    }

    if (queryToken) {
      setToken(queryToken);
      setSessionReady(true);
      return;
    }

    const session = loadRefereeSession(matchId);
    setToken(session?.token);
    setSessionReady(true);
  }, [matchId, queryToken, role]);

  const {
    match,
    isLoading,
    error,
    awardPoint,
    undo,
    startTimer,
    pauseTimer,
    resetTimer,
    changeServe,
    toggleSides,
    resetMatch,
    finishMatch,
    updateConfig,
    updateMatchMetadata,
    remainingTime,
  } = useMatch({
    matchId,
    role,
    pin,
    token,
    adminSessionToken,
  });

  const { toast } = useToast();

  useEffect(() => {
    if (role === 'referee' && token && match?.displayCode) {
      saveRefereeSession({
        matchId,
        token,
        displayCode: match.displayCode,
        joinedAt: Date.now(),
      });
    }
  }, [role, token, match?.displayCode, matchId]);

  const isTimerRunning = Boolean(match?.timer?.startedAt && !match?.timer?.pausedAt);
  const isReferee = role === 'referee';
  const canOperateActions = role === 'admin' || role === 'referee';

  const runRiskyAction = (
    config: {
      title: string;
      description: string;
      confirmLabel: string;
    },
    action: () => void,
    forceConfirm = false,
  ) => {
    if (forceConfirm || isReferee) {
      setPendingAction({ ...config, action });
      return;
    }
    action();
  };

  const toggleTimer = () => {
    if (!canOperateActions) return;
    if (isTimerRunning) {
      pauseTimer();
      return;
    }
    startTimer();
  };

  const handleChangeServe = (team: 'home' | 'away', position?: 'left' | 'right') => {
    if (!canOperateActions) return;
    runRiskyAction(
      {
        title: 'Ubah Server?',
        description: 'Perubahan server dilakukan manual dan dapat memengaruhi alur servis pertandingan.',
        confirmLabel: 'Ubah Server',
      },
      () => changeServe(team, position),
    );
  };

  const handleToggleSides = () => {
    if (!canOperateActions) return;
    runRiskyAction(
      {
        title: 'Tukar Sisi Lapangan?',
        description: 'Aksi ini menukar posisi tim pada tampilan dan control. Pastikan ini memang diperlukan.',
        confirmLabel: 'Tukar Sisi',
      },
      () => toggleSides(),
    );
  };

  const handleResetMatch = () => {
    if (!canOperateActions) return;
    runRiskyAction(
      {
        title: 'Reset Match?',
        description: 'Ini akan menghapus semua skor, set, dan riwayat pertandingan secara permanen.',
        confirmLabel: 'Reset Match',
      },
      () => resetMatch(),
      true,
    );
  };

  const handleFinishMatch = () => {
    if (!canOperateActions || match?.status === 'finished') return;
    runRiskyAction(
      {
        title: 'Akhiri Match?',
        description: 'Match akan ditandai selesai dan input poin tidak bisa dilanjutkan kecuali dilakukan reset.',
        confirmLabel: 'Akhiri Match',
      },
      () => finishMatch(),
      true,
    );
  };

  const pushCopyFeedback = (message: string) => {
    toast({
      title: 'Tautan Berhasil Disalin',
      description: message,
      duration: 2500,
    });
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
    const savedAutoTimer = localStorage.getItem(AUTO_TIMER_KEY);
    if (savedAutoTimer !== null) {
      setAutoStartTimerOnFirstPoint(savedAutoTimer === 'true');
    }
  }, []);

  const handleSettingsSave = (payload: SettingsSavePayload) => {
    const { displaySettings: newSettings, matchSettings } = payload;
    const applySettings = () => {
      setDisplaySettings(newSettings);
      localStorage.setItem('displaySettings', JSON.stringify(newSettings));
      updateConfig({ templateId: newSettings.template });
      const metadataPayload: Parameters<typeof updateMatchMetadata>[0] = {
        tournamentName: matchSettings.tournamentName,
        assignedReferee: matchSettings.assignedReferee,
        matchFormat: matchSettings.matchFormat,
        homeTeamName: matchSettings.homeTeamName,
        awayTeamName: matchSettings.awayTeamName,
        homePlayers: matchSettings.homePlayers.map((name) => ({ name })),
        awayPlayers: matchSettings.awayPlayers.map((name) => ({ name })),
        badmintonMaxPoints: matchSettings.badmintonMaxPoints,
      };
      if (matchSettings.matchFormat === 'beregu') {
        metadataPayload.teamLineup = matchSettings.teamLineup;
      }
      updateMatchMetadata(metadataPayload);
    };

    if (isReferee) {
      runRiskyAction(
        {
          title: 'Simpan Pengaturan Match?',
          description: 'Perubahan display dan data pertandingan akan tersinkron ke semua client aktif.',
          confirmLabel: 'Simpan Pengaturan',
        },
        applySettings,
      );
      return;
    }

    applySettings();
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

  const handleAwardPoint = (winner: 'home' | 'away', value?: number) => {
    if (!canOperateActions || match?.status === 'finished') return;

    if (isBeforeFirstRally && !isTimerRunning) {
      if (autoStartTimerOnFirstPoint) {
        startTimer();
        awardPoint(winner, value);
        return;
      }
      setPendingPointAward({ winner, value });
      return;
    }

    awardPoint(winner, value);
  };

  if (role === 'referee' && !sessionReady) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center font-mono text-sm">
        Menyiapkan sesi wasit...
      </div>
    );
  }

  if (role === 'admin' && !sessionReady) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center font-mono text-sm">
        Menyiapkan sesi admin...
      </div>
    );
  }

  if (role === 'admin' && !adminSessionToken) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#070b16] dark:text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-[#0b0f19] p-8 text-center shadow-2xl">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500 font-bold">Sesi Admin Tidak Ditemukan</p>
          <h1 className="mt-4 text-3xl font-[family-name:var(--font-bebas)] tracking-wider uppercase">Masuk Admin Dulu</h1>
          <p className="mt-2 text-sm text-slate-400">Login dari halaman admin untuk membuka kontrol pertandingan.</p>
          <Link href="/admin" className="inline-block mt-6">
            <Button className="rounded-full bg-blue-600 hover:bg-blue-500 px-8 py-2 text-xs uppercase tracking-widest font-bold">
              Ke Halaman Admin
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (role === 'referee' && !token) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#070b16] dark:text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-[#0b0f19] p-8 text-center shadow-2xl">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500 font-bold">Sesi Wasit Tidak Ditemukan</p>
          <h1 className="mt-4 text-3xl font-[family-name:var(--font-bebas)] tracking-wider uppercase">Masuk Terlebih Dahulu</h1>
          <p className="mt-2 text-sm text-slate-400">Masuk lagi melalui halaman join menggunakan kode pertandingan & PIN.</p>
          <Link href={`/referee/join?matchId=${matchId}`} className="inline-block mt-6">
            <Button className="rounded-full bg-blue-600 hover:bg-blue-500 px-8 py-2 text-xs uppercase tracking-widest font-bold">
              Ke Halaman Masuk Wasit
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading || !match) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#070b16] dark:text-slate-100 flex items-center justify-center font-mono text-sm">
        Memuat data pertandingan...
      </div>
    );
  }

  const home = match.teams.home;
  const away = match.teams.away;
  const matchSettingsDraft: MatchSettingsDraft = {
    tournamentName: match.tournamentName || '',
    assignedReferee: match.assignedReferee || '',
    matchFormat: match.matchFormat || 'perorangan',
    homeTeamName: home.name,
    awayTeamName: away.name,
    homePlayers: home.players.map((player) => player.name),
    awayPlayers: away.players.map((player) => player.name),
    teamLineup:
      match.teamLineup && match.teamLineup.length > 0
        ? match.teamLineup
        : [
            {
              home: home.players[0]?.name || '',
              homeSecond: home.players[1]?.name || '',
              away: away.players[0]?.name || '',
              awaySecond: away.players[1]?.name || '',
              type: match.category || 'MS',
            },
          ],
    category: match.category,
    gameMode: match.gameMode,
    badmintonMaxPoints: match.sportState?.badminton?.maxPoints ?? 21,
  };

  const leftDisplaySide: 'home' | 'away' = match.isFlipped ? 'away' : 'home';
  const rightDisplaySide: 'home' | 'away' = match.isFlipped ? 'home' : 'away';
  const leftDisplayTeam = match.teams[leftDisplaySide];
  const rightDisplayTeam = match.teams[rightDisplaySide];
  const displayPath = match.displayCode ? `/display/${match.displayCode}` : `/match/${matchId}/display`;
  const isBeforeFirstRally =
    home.score === 0 &&
    away.score === 0 &&
    (match.currentSet ?? 1) === 1 &&
    (match.sets?.length ?? 0) === 0;

  const homeServing = match.server === 'home';
  const awayServing = match.server === 'away';
  const isTeamMatch = match.matchFormat === 'beregu';
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

  const formatPlayerNames = (side: 'home' | 'away') => {
    const names = match.teams[side].players
      .map((player) => player.name.trim())
      .filter((name) => name.length > 0);
    if (names.length === 0) return '-';
    return names.join(' / ');
  };

  const getPrimaryTableLabel = (side: 'home' | 'away') => {
    if (isTeamMatch) return match.teams[side].name;
    return formatPlayerNames(side);
  };

  const toggleAutoStartTimer = () => {
    const nextValue = !autoStartTimerOnFirstPoint;
    setAutoStartTimerOnFirstPoint(nextValue);
    localStorage.setItem(AUTO_TIMER_KEY, String(nextValue));
  };

  const renderScoringControls = () => {
    const homeSide = resolveTeamSide('home');
    const awaySide = resolveTeamSide('away');

    if (match.sport === 'basketball') {
      return (
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            { side: homeSide, label: home.name, colorClass: 'text-blue-500 border-blue-500/20 bg-blue-500/5' },
            { side: awaySide, label: away.name, colorClass: 'text-red-500 border-red-500/20 bg-red-500/5' },
          ].map((team) => (
            <div key={team.side} className="rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-[#0b0f19]/50 p-6 flex flex-col justify-between gap-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 dark:text-slate-200 tracking-tight">{team.label}</span>
                <span className="font-mono text-3xl font-black tabular-nums">{team.side === 'home' ? home.score : away.score}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map((value) => (
                  <button
                    key={value}
                    className={cn('h-12 rounded-xl border font-mono font-black text-lg transition-transform active:scale-95', team.colorClass)}
                    onClick={() => handleAwardPoint(team.side, value)}
                  >
                    +{value}
                  </button>
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
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            { side: homeSide, label: home.name },
            { side: awaySide, label: away.name },
          ].map((team) => (
            <div key={team.side} className="rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-[#0b0f19]/50 p-6 flex flex-col justify-between gap-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 dark:text-slate-200 tracking-tight">{team.label}</span>
                <span className="font-mono text-lg font-bold text-slate-500 dark:text-slate-400">Games: {team.side === 'home' ? home.score : away.score}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  className="h-12 rounded-xl bg-slate-100 hover:bg-slate-250 dark:bg-slate-800 dark:hover:bg-slate-700 font-bold text-sm text-slate-800 dark:text-white transition-transform active:scale-95 border border-slate-200 dark:border-white/5"
                  onClick={() => handleAwardPoint(team.side)}
                >
                  Point
                </button>
                <div className="rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950 px-4 py-3 flex items-center justify-center font-mono font-black text-blue-600 dark:text-blue-400">
                  {tennis?.tiebreak
                    ? `TB: ${pointLabel(tennis.tiebreakPoints?.[team.side] || 0)}`
                    : `PT: ${pointLabel(tennis?.points?.[team.side] || 0)}`}
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (match.sport === 'volleyball' || isSoccerLike) {
      const isVolley = match.sport === 'volleyball';
      return (
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            { side: homeSide, label: home.name, themeClass: 'bg-blue-600 hover:bg-blue-500 shadow-blue-900/30' },
            { side: awaySide, label: away.name, themeClass: 'bg-red-600 hover:bg-red-500 shadow-red-900/30' },
          ].map((team) => (
            <div key={team.side} className="rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-[#0b0f19]/50 p-6 flex flex-col justify-between gap-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 dark:text-slate-200 tracking-tight truncate max-w-[160px]">{team.label}</span>
                <span className="font-mono text-3xl font-black text-slate-900 dark:text-white">{team.side === 'home' ? home.score : away.score}</span>
              </div>
              <button
                className={cn('h-14 rounded-xl font-bold uppercase tracking-widest text-xs text-white shadow-lg transition-transform active:scale-95', team.themeClass)}
                onClick={() => handleAwardPoint(team.side)}
              >
                +{isVolley ? '1 Point' : '1 Goal'}
              </button>
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
      const maxSets = isVolleyball ? (match.sportState?.volleyball?.maxSets ?? 5) : 3;
      const columns = Array.from({ length: maxSets }, (_, index) => ({
        key: `set-${index + 1}`,
        label: `Set ${index + 1}`,
        home: match.sets[index]?.home ?? (match.currentSet === index + 1 ? home.score : '-'),
        away: match.sets[index]?.away ?? (match.currentSet === index + 1 ? away.score : '-'),
      }));
      return { columns, showServe: isBadminton };
    }

    return null;
  })();

  const renderQuadrantCell = (quadrant: 'TL' | 'TR' | 'BL' | 'BR', className?: string) => {
    const { side, courtIdx } = getQuadrantInfo(quadrant);
    const isServer = isServerQuadrant(quadrant);
    const isReceiver = isReceiverQuadrant(quadrant);
    const serverColor = getServerColor(quadrant);
    const content = getQuadrantContent(quadrant);

    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center p-2 transition-all duration-300 rounded-2xl relative border border-transparent',
          className,
        )}
        style={
          isServer
            ? {
                backgroundColor: `${serverColor}20`,
                borderColor: `${serverColor}50`,
                boxShadow: `0 0 15px ${serverColor}20`,
              }
            : isReceiver
              ? { backgroundColor: `${serverColor}08` }
              : {}
        }
      >
        <div className="flex flex-col items-center gap-1.5">
          {isServer && (
            <ShuttlecockIcon className="w-7 h-7 text-white drop-shadow-[0_0_15px_rgba(255,255,255,1)] animate-bounce" />
          )}
          <span
            className={cn(
              'text-[10px] sm:text-xs text-center leading-tight tracking-wider uppercase px-2.5 py-1 rounded-lg transition-all',
              isServer
                ? 'text-slate-950 bg-yellow-300 border border-yellow-400 font-black shadow-md'
                : 'text-white bg-slate-950/60 border border-white/15 font-bold',
            )}
          >
            {content || '-'}
          </span>
        </div>
      </div>
    );
  };

  const getQuadrantInfo = (quadrant: 'TL' | 'TR' | 'BL' | 'BR') => {
    const leftTeamSide = match.isFlipped ? 'away' : 'home';
    const rightTeamSide = match.isFlipped ? 'home' : 'away';
    const leftTeam = match.teams[leftTeamSide];
    const rightTeam = match.teams[rightTeamSide];

    if (quadrant === 'TL') return { side: leftTeamSide, team: leftTeam, courtIdx: 1 };
    if (quadrant === 'BL') return { side: leftTeamSide, team: leftTeam, courtIdx: 0 };
    if (quadrant === 'TR') return { side: rightTeamSide, team: rightTeam, courtIdx: 0 };
    return { side: rightTeamSide, team: rightTeam, courtIdx: 1 };
  };

  const getQuadrantContent = (quadrant: 'TL' | 'TR' | 'BL' | 'BR') => {
    const { team, courtIdx } = getQuadrantInfo(quadrant);
    if (!team || !match.server) return '';

    if (isSingles) {
      const servingTeam = match.server === 'home' ? home : away;
      const activeCourtIdx = servingTeam.score % 2 === 0 ? 0 : 1;
      if (courtIdx !== activeCourtIdx) return '';
      return team.players[0]?.name || team.name;
    }

    const pPositions = team.playerPositions || [0, 1];
    const playerIdx = pPositions[courtIdx];
    return team.players[playerIdx]?.name || (courtIdx === 0 ? team.name : '');
  };

  const isServerQuadrant = (quadrant: 'TL' | 'TR' | 'BL' | 'BR') => {
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

  const isReceiverQuadrant = (quadrant: 'TL' | 'TR' | 'BL' | 'BR') => {
    const { side } = getQuadrantInfo(quadrant);
    const isServerSide = side === match.server;
    if (isServerSide) return false;

    const servingTeam = match.server === 'home' ? home : away;
    const activeCourtIdx = servingTeam.score % 2 === 0 ? 0 : 1;

    const { courtIdx } = getQuadrantInfo(quadrant);
    return courtIdx === activeCourtIdx;
  };

  const getServerColor = (quadrant: 'TL' | 'TR' | 'BL' | 'BR') => {
    const { side } = getQuadrantInfo(quadrant);
    return side === 'home' ? displaySettings.teamColors.home : displaySettings.teamColors.away;
  };

  return (
    <div className="bg-slate-50 text-slate-900 dark:bg-[#070b16] dark:text-slate-100 min-h-screen flex flex-col font-sans transition-colors duration-200 antialiased">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-blue-600 focus:px-4 focus:py-2 text-xs font-bold text-white">
        Skip to content
      </a>

      {/* --- HEADER (Minimalist, Unified) --- */}
      <header className="px-6 py-3 flex flex-col gap-4 landscape:flex-row landscape:justify-between landscape:items-center bg-white dark:bg-[#0b0f19] border-b border-slate-200 dark:border-white/[0.03] shadow-sm dark:shadow-md z-30">
        <div className="flex items-center justify-between landscape:justify-start gap-4">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white">
              <ShuttlecockIcon className="h-5.5 w-5.5" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-black tracking-wider uppercase leading-none text-slate-800 dark:text-white">scoreHub</span>
              <span className="text-[10px] font-black text-blue-500 tracking-[0.2em] leading-none mt-1">CTRL</span>
            </div>
          </Link>
          <div className="h-6 w-px bg-slate-200 dark:bg-white/[0.08] hidden lg:block landscape:hidden xl:landscape:block"></div>
          <div className="hidden sm:flex landscape:hidden xl:landscape:flex items-center gap-1.5 rounded-full border border-slate-200 dark:border-white/5 bg-slate-200/50 dark:bg-slate-900/60 px-3 py-1">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">ID</span>
            <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 truncate max-w-[120px]">{matchId}</span>
          </div>
        </div>

        {/* Central Timer Readout */}
        <div className="flex items-center justify-center gap-4 bg-slate-100 dark:bg-slate-950/40 px-4 py-1.5 rounded-2xl border border-slate-200 dark:border-white/5 shadow-inner self-center landscape:self-auto">
          <div className="text-center px-1">
            <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none mb-1">{phaseLabel}</span>
            <span className="text-sm font-black text-slate-750 dark:text-slate-200 leading-none">{phaseValue}</span>
          </div>
          <div className="h-6 w-px bg-slate-200 dark:bg-white/[0.08]"></div>
          <button
            className="flex items-center gap-3 focus:outline-none group px-2 rounded-lg"
            onClick={toggleTimer}
            disabled={!canOperateActions}
            onContextMenu={(e) => {
              if (!canOperateActions) return;
              e.preventDefault();
              resetTimer();
            }}
          >
            <span className={cn('text-2xl font-mono font-black tracking-tight tabular-nums transition-colors', isTimerRunning ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500')}>
              {formatTime(remainingTime)}
            </span>
            <div className="flex flex-col items-start">
              <span className="text-[9px] font-black tracking-wider text-slate-500 group-hover:text-blue-600 dark:text-slate-400 dark:group-hover:text-blue-400 transition-colors uppercase leading-none">
                {isTimerRunning ? 'PAUSE' : 'START'}
              </span>
              {!isTimerRunning ? (
                <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-amber-655 dark:text-amber-400">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500"></span>
                  </span>
                  STANDBY
                </span>
              ) : null}
            </div>
          </button>
          <div className="h-6 w-px bg-slate-200 dark:bg-white/[0.08]"></div>
          <button
            onClick={toggleAutoStartTimer}
            className={cn(
              'rounded-lg border px-2 py-1 text-[9px] font-bold uppercase tracking-[0.1em] transition-colors',
              autoStartTimerOnFirstPoint
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                : 'border-slate-200 bg-slate-100 dark:border-white/5 dark:bg-slate-900/60 text-slate-500 hover:text-slate-700 dark:hover:text-slate-400',
            )}
          >
            Auto 1st {autoStartTimerOnFirstPoint ? 'On' : 'Off'}
          </button>
        </div>

        {/* Header Action Controls */}
        <div className="flex flex-wrap items-center justify-end gap-2">
          <div className="hidden xl:flex flex-wrap items-center gap-1 rounded-xl bg-slate-100 dark:bg-slate-900/40 p-1 border border-slate-200 dark:border-white/5">
            <Link
              href={displayPath}
              target="_blank"
              className="px-3 py-1.5 rounded-lg text-[10px] font-black tracking-wider uppercase text-slate-600 hover:text-slate-950 hover:bg-slate-200 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5 transition-colors"
            >
              Live Display
            </Link>
            <button
              onClick={() => {
                const url = `${window.location.origin}${displayPath}`;
                navigator.clipboard.writeText(url);
                pushCopyFeedback('Tautan layar display berhasil disalin ke clipboard.');
              }}
              className="px-3 py-1.5 rounded-lg text-[10px] font-black tracking-wider uppercase text-slate-600 hover:text-slate-950 hover:bg-slate-200 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5 transition-colors"
            >
              Salin Link
            </button>
            <button
              onClick={() => {
                const url = `${window.location.origin}/overlay/${encodeURIComponent(matchId)}?style=bwf`;
                navigator.clipboard.writeText(url);
                pushCopyFeedback('Tautan overlay OBS berhasil disalin ke clipboard.');
              }}
              className="px-3 py-1.5 rounded-lg text-[10px] font-black tracking-wider uppercase text-green-600 hover:text-green-800 hover:bg-green-500/10 dark:text-green-500 dark:hover:text-green-400 dark:hover:bg-green-500/10 transition-colors"
            >
              OBS Overlay
            </button>
          </div>

          <div className="h-6 w-px bg-slate-200 dark:bg-white/[0.08] hidden xl:block"></div>

          <button
            onClick={handleToggleSides}
            title="Tukar Sisi"
            disabled={!canOperateActions}
            className="p-2 rounded-lg border border-slate-200 dark:border-white/5 bg-slate-100 dark:bg-slate-900/40 text-slate-655 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white active:scale-95 transition-all"
          >
            <SwapIcon className="w-5 h-5" />
          </button>

          <SettingsPanel
            settings={displaySettings}
            matchSettings={matchSettingsDraft}
            onSave={handleSettingsSave}
            sportId={match.sport}
            matchId={matchId}
            trigger={
              <button
                title="Pengaturan Display"
                className="p-2 rounded-lg border border-slate-200 dark:border-white/5 bg-slate-100 dark:bg-slate-900/40 text-slate-655 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white active:scale-95 transition-all"
              >
                <SettingsIcon className="w-5 h-5" />
              </button>
            }
          />

          <button
            onClick={toggleTheme}
            title="Ubah Tema"
            className="p-2 rounded-lg border border-slate-200 dark:border-white/5 bg-slate-100 dark:bg-slate-900/40 text-slate-655 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white active:scale-95 transition-all"
          >
            {theme === 'light' ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* --- MAIN CONTENT AREA --- */}
      <main id="main-content" className="flex-1 p-4 max-w-7xl mx-auto w-full flex flex-col gap-4 overflow-hidden">
        {error && (
          <div className="rounded-xl border border-red-900/50 bg-red-950/20 px-4 py-3 text-xs font-bold uppercase tracking-wider text-red-400">
            {error}
          </div>
        )}

        {/* --- BROADCAST SCOREBOARD MONITOR (Sleek Minimalist Panel) --- */}
        <section className="rounded-2xl border border-slate-200 dark:border-white/[0.03] bg-white dark:bg-[#0b0f19] shadow-md dark:shadow-2xl relative overflow-hidden">
          <div className="absolute top-1/2 left-2 -translate-y-1/2 z-10">
            <button
              onClick={undo}
              aria-label="Undo last point"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 dark:border-white/5 bg-slate-100 dark:bg-slate-900/50 text-sky-600 dark:text-sky-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all active:scale-90"
            >
              <UndoIcon className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 px-12 py-6 sm:py-8">
            {/* Left Side (Home) */}
            <div className="min-w-0 flex items-center gap-6 justify-start pl-4">
              <span className="font-mono text-6xl sm:text-7xl lg:text-8xl font-black text-blue-500 tracking-tighter tabular-nums leading-none drop-shadow-[0_0_30px_rgba(59,130,246,0.15)]">
                {leftDisplayTeam.score}
              </span>
              <div className="min-w-0">
                <span className="block text-xs uppercase tracking-widest text-slate-500 font-bold mb-1">
                  {leftDisplaySide === 'home' ? 'Home' : 'Away'}
                </span>
                <p className="truncate text-base sm:text-lg lg:text-xl font-bold uppercase tracking-wide text-slate-800 dark:text-slate-200">
                  {leftDisplayTeam.name}
                </p>
              </div>
            </div>

            {/* Central Badge */}
            <div className="flex flex-col items-center gap-1.5 px-4">
              <span className="text-xl sm:text-2xl font-black text-slate-300 dark:text-slate-700 leading-none">-</span>
              <span className="inline-flex items-center rounded-full border border-slate-200 dark:border-white/5 bg-slate-100 dark:bg-slate-950/80 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">
                {phaseLabel} {phaseValue}
              </span>
            </div>

            {/* Right Side (Away) */}
            <div className="min-w-0 flex items-center gap-6 justify-end text-right pr-4">
              <div className="min-w-0 order-2 sm:order-1">
                <span className="block text-xs uppercase tracking-widest text-slate-500 font-bold mb-1">
                  {rightDisplaySide === 'home' ? 'Home' : 'Away'}
                </span>
                <p className="truncate text-base sm:text-lg lg:text-xl font-bold uppercase tracking-wide text-slate-800 dark:text-slate-200">
                  {rightDisplayTeam.name}
                </p>
              </div>
              <span className="font-mono text-6xl sm:text-7xl lg:text-8xl font-black text-red-500 tracking-tighter tabular-nums leading-none order-1 sm:order-2 drop-shadow-[0_0_30px_rgba(239,68,68,0.15)]">
                {rightDisplayTeam.score}
              </span>
            </div>
          </div>
        </section>

        {/* --- DYNAMIC MATCH LAYOUT --- */}
        <section className="flex flex-col landscape:flex-row items-stretch gap-4 flex-1 min-h-0">
          {isBadminton ? (
            <>
              {/* Landscape Mode: Home controls (Left Panel) */}
              <div className="hidden landscape:flex flex-col justify-between w-36 sm:w-44 lg:w-56 xl:w-64 rounded-2xl border border-slate-200 dark:border-white/[0.03] bg-white dark:bg-slate-900/30 p-4 gap-4">
                <div className="space-y-3">
                  <span className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Pilih Server (Servis)</span>
                  <div className="flex flex-col gap-1.5 bg-slate-50 dark:bg-slate-950/60 p-1.5 rounded-xl border border-slate-200 dark:border-white/5">
                    {(() => {
                      const side = match.isFlipped ? 'away' : 'home';
                      const team = match.teams[side];
                      const positions = isSingles ? (['left'] as const) : (['left', 'right'] as const);
                      return positions.map((pos) => {
                        const isActive = match.server === side && (isSingles || match.serviceCourt === pos);
                        const playerIdx = isSingles ? 0 : pos === 'left' ? 1 : 0;
                        const playerName = team.players[team.playerPositions?.[playerIdx] ?? playerIdx]?.name || team.name;

                        return (
                          <button
                            key={pos}
                            onClick={() => handleChangeServe(side, isSingles ? undefined : pos)}
                            disabled={!canOperateActions}
                            className={cn(
                              'w-full px-3 py-2.5 rounded-lg flex items-center gap-2.5 transition-all text-left border relative overflow-hidden',
                              isActive
                                ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30 font-bold'
                                : 'bg-transparent text-slate-700 dark:text-slate-400 border-transparent hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-white/[0.02]',
                            )}
                          >
                            <ShuttlecockIcon className={cn('w-4.5 h-4.5 flex-shrink-0', isActive ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400 dark:text-slate-500')} />
                            <span className="text-[10px] font-bold truncate uppercase tracking-wider leading-none">
                              {isSingles ? 'Servis' : playerName.split(' ')[0]}
                            </span>
                          </button>
                        );
                      });
                    })()}
                  </div>
                </div>

                {match.status === 'finished' ? (
                  <div className="w-full rounded-xl bg-slate-50 dark:bg-slate-950/30 border border-slate-200 dark:border-white/5 py-8 flex flex-col items-center justify-center opacity-40">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Ended</span>
                  </div>
                ) : (
                  <button
                    onClick={() => handleAwardPoint(match.isFlipped ? 'away' : 'home')}
                    className="w-full py-8 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-900/20 border border-blue-500/20 active:scale-98 transition-all flex flex-col items-center justify-center gap-2 group"
                  >
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Poin Home (+1)</span>
                    <span className="text-xs font-black truncate max-w-full px-4 uppercase">{match.isFlipped ? away.name : home.name}</span>
                  </button>
                )}
              </div>

              {/* Central Matte Green Court */}
              <div className="flex-1 w-full landscape:w-auto min-w-0 aspect-[2/1] max-h-[30vh] landscape:max-h-[50vh] lg:max-h-[42vh] bg-[#15803d] rounded-2xl relative overflow-hidden shadow-[inset_0_0_60px_rgba(0,0,0,0.3)] border border-white/10 select-none flex items-center justify-center">
                {/* Visual SVG Lines */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-85" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <rect x="1" y="1" width="98" height="98" fill="none" stroke="white" strokeWidth="0.4" />
                  <line x1="50" y1="0" x2="50" y2="100" stroke="white" strokeWidth="0.6" strokeDasharray="1.5,1" />
                  <line x1="0" y1="8" x2="100" y2="8" stroke="white" strokeWidth="0.35" />
                  <line x1="0" y1="92" x2="100" y2="92" stroke="white" strokeWidth="0.35" />
                  <line x1="33" y1="0" x2="33" y2="100" stroke="white" strokeWidth="0.4" />
                  <line x1="67" y1="0" x2="67" y2="100" stroke="white" strokeWidth="0.4" />
                  <line x1="6" y1="0" x2="6" y2="100" stroke="white" strokeWidth="0.3" />
                  <line x1="94" y1="0" x2="94" y2="100" stroke="white" strokeWidth="0.3" />
                  <line x1="0" y1="50" x2="33" y2="50" stroke="white" strokeWidth="0.4" />
                  <line x1="67" y1="50" x2="100" y2="50" stroke="white" strokeWidth="0.4" />
                </svg>

                {/* Court Grid Layout */}
                <div className="absolute inset-0 grid grid-cols-[33%_34%_33%] grid-rows-2 p-1.5 z-10">
                  {renderQuadrantCell('TL', 'col-start-1 row-start-1 m-1 pointer-events-auto')}
                  {renderQuadrantCell('BL', 'col-start-1 row-start-2 m-1 pointer-events-auto')}

                  <div className="col-start-2 row-span-2 flex flex-col items-center justify-end pb-3 pointer-events-none">
                    <button
                      onClick={handleToggleSides}
                      disabled={!canOperateActions}
                      className="pointer-events-auto bg-black/50 backdrop-blur-md border border-white/10 hover:border-white/20 text-white/70 hover:text-white rounded-full px-3 py-1.5 transition-all active:scale-90 flex items-center gap-1.5 group"
                    >
                      <SwapIcon className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-300" />
                      <span className="text-[10px] font-black uppercase tracking-wider">Tukar Sisi</span>
                    </button>
                  </div>

                  {renderQuadrantCell('TR', 'col-start-3 row-start-1 m-1 pointer-events-auto')}
                  {renderQuadrantCell('BR', 'col-start-3 row-start-2 m-1 pointer-events-auto')}
                </div>
              </div>

              {/* Landscape Mode: Away controls (Right Panel) */}
              <div className="hidden landscape:flex flex-col justify-between w-36 sm:w-44 lg:w-56 xl:w-64 rounded-2xl border border-slate-200 dark:border-white/[0.03] bg-white dark:bg-slate-900/30 p-4 gap-4">
                <div className="space-y-3">
                  <span className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Pilih Server (Servis)</span>
                  <div className="flex flex-col gap-1.5 bg-slate-50 dark:bg-slate-950/60 p-1.5 rounded-xl border border-slate-200 dark:border-white/5">
                    {(() => {
                      const side = match.isFlipped ? 'home' : 'away';
                      const team = match.teams[side];
                      const positions = isSingles ? (['left'] as const) : (['left', 'right'] as const);
                      return positions.map((pos) => {
                        const isActive = match.server === side && (isSingles || match.serviceCourt === pos);
                        const playerIdx = isSingles ? 0 : pos === 'left' ? 1 : 0;
                        const playerName = team.players[team.playerPositions?.[playerIdx] ?? playerIdx]?.name || team.name;

                        return (
                          <button
                            key={pos}
                            onClick={() => handleChangeServe(side, isSingles ? undefined : pos)}
                            disabled={!canOperateActions}
                            className={cn(
                              'w-full px-3 py-2.5 rounded-lg flex items-center gap-2.5 transition-all text-left border relative overflow-hidden',
                              isActive
                                ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30 font-bold'
                                : 'bg-transparent text-slate-700 dark:text-slate-400 border-transparent hover:text-slate-800 dark:hover:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-white/[0.02]',
                            )}
                          >
                            <ShuttlecockIcon className={cn('w-4.5 h-4.5 flex-shrink-0', isActive ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400 dark:text-slate-500')} />
                            <span className="text-[10px] font-bold truncate uppercase tracking-wider leading-none">
                              {isSingles ? 'Servis' : playerName.split(' ')[0]}
                            </span>
                          </button>
                        );
                      });
                    })()}
                  </div>
                </div>

                {match.status === 'finished' ? (
                  <div className="w-full rounded-xl bg-slate-50 dark:bg-slate-950/30 border border-slate-200 dark:border-white/5 py-8 flex flex-col items-center justify-center opacity-40">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Ended</span>
                  </div>
                ) : (
                  <button
                    onClick={() => handleAwardPoint(match.isFlipped ? 'home' : 'away')}
                    className="w-full py-8 bg-red-600 hover:bg-red-500 text-white rounded-xl shadow-lg shadow-red-900/20 border border-red-500/20 active:scale-98 transition-all flex flex-col items-center justify-center gap-2 group"
                  >
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Poin Away (+1)</span>
                    <span className="text-xs font-black truncate max-w-full px-4 uppercase">{match.isFlipped ? home.name : away.name}</span>
                  </button>
                )}
              </div>
            </>
          ) : (
            /* Non-badminton Fallback controls card */
            <div className="flex-1 w-full min-w-0 rounded-2xl border border-slate-200 dark:border-white/[0.03] bg-white dark:bg-slate-900/30 p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/5 pb-4 mb-4">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Olahraga</p>
                  <h2 className="text-lg font-black text-slate-800 dark:text-slate-200 uppercase">{match.sport}</h2>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Status</p>
                  <p className="text-sm font-mono font-bold text-blue-600 dark:text-blue-400 uppercase">{match.status}</p>
                </div>
              </div>
              <div>{renderScoringControls()}</div>
            </div>
          )}
        </section>

        {/* --- PORTRAIT MOBILE CONTROLS (Ergonomic layout for phones) --- */}
        {isBadminton && (
          <section className="flex landscape:hidden flex-col gap-3 mt-1 px-1">
            <div className="grid grid-cols-2 gap-3">
              {/* Left Side (Home) */}
              <div className="flex flex-col gap-2 bg-white dark:bg-slate-900/20 p-2 rounded-2xl border border-slate-200 dark:border-white/5">
                <div className="flex gap-1.5 bg-slate-50 dark:bg-slate-950/60 p-1 rounded-xl">
                  {(() => {
                    const side = match.isFlipped ? 'away' : 'home';
                    const team = match.teams[side];
                    const positions = isSingles ? (['left'] as const) : (['left', 'right'] as const);
                    return positions.map((pos) => {
                      const isActive = match.server === side && (isSingles || match.serviceCourt === pos);
                      const playerIdx = isSingles ? 0 : pos === 'left' ? 1 : 0;
                      const playerName = team.players[team.playerPositions?.[playerIdx] ?? playerIdx]?.name || team.name;
                      return (
                        <button
                          key={pos}
                          onClick={() => handleChangeServe(side, isSingles ? undefined : pos)}
                          disabled={!canOperateActions}
                          className={cn(
                            'flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 border transition-all text-[9px] font-black uppercase tracking-wider',
                            isActive
                              ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30 font-bold'
                              : 'bg-transparent text-slate-700 dark:text-slate-400 border-transparent',
                          )}
                        >
                          <ShuttlecockIcon className={cn('w-3.5 h-3.5', isActive ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400 dark:text-slate-500')} />
                          <span className="truncate">{isSingles ? 'Servis' : playerName.split(' ')[0]}</span>
                        </button>
                      );
                    });
                  })()}
                </div>
                <button
                  onClick={() => handleAwardPoint(match.isFlipped ? 'away' : 'home')}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-xl py-6 flex flex-col items-center justify-center border border-blue-500/20 active:scale-95 shadow-lg shadow-blue-900/10"
                >
                  <span className="text-[9px] font-black uppercase tracking-widest opacity-60">Home (+1)</span>
                </button>
              </div>

              {/* Right Side (Away) */}
              <div className="flex flex-col gap-2 bg-white dark:bg-slate-900/20 p-2 rounded-2xl border border-slate-200 dark:border-white/5">
                <div className="flex gap-1.5 bg-slate-50 dark:bg-slate-950/60 p-1 rounded-xl">
                  {(() => {
                    const side = match.isFlipped ? 'home' : 'away';
                    const team = match.teams[side];
                    const positions = isSingles ? (['left'] as const) : (['left', 'right'] as const);
                    return positions.map((pos) => {
                      const isActive = match.server === side && (isSingles || match.serviceCourt === pos);
                      const playerIdx = isSingles ? 0 : pos === 'left' ? 1 : 0;
                      const playerName = team.players[team.playerPositions?.[playerIdx] ?? playerIdx]?.name || team.name;
                      return (
                        <button
                          key={pos}
                          onClick={() => handleChangeServe(side, isSingles ? undefined : pos)}
                          disabled={!canOperateActions}
                          className={cn(
                            'flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 border transition-all text-[9px] font-black uppercase tracking-wider',
                            isActive
                              ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30 font-bold'
                              : 'bg-transparent text-slate-700 dark:text-slate-400 border-transparent',
                          )}
                        >
                          <ShuttlecockIcon className={cn('w-3.5 h-3.5', isActive ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400 dark:text-slate-500')} />
                          <span className="truncate">{isSingles ? 'Servis' : playerName.split(' ')[0]}</span>
                        </button>
                      );
                    });
                  })()}
                </div>
                <button
                  onClick={() => handleAwardPoint(match.isFlipped ? 'home' : 'away')}
                  className="w-full bg-red-600 hover:bg-red-500 text-white rounded-xl py-6 flex flex-col items-center justify-center border border-red-500/20 active:scale-95 shadow-lg shadow-red-900/10"
                >
                  <span className="text-[9px] font-black uppercase tracking-widest opacity-60">Away (+1)</span>
                </button>
              </div>
            </div>
          </section>
        )}

        {/* --- SET HISTORY TABLE --- */}
        {scoreTableConfig && (
          <section className="w-full overflow-x-auto rounded-xl border border-slate-200 dark:border-white/[0.03] bg-white dark:bg-[#0b0f19]/40 shadow-inner">
            <div className={cn('w-full max-w-5xl mx-auto', isTeamMatch ? 'min-w-[800px]' : 'min-w-[640px]')}>
              <table className="w-full text-xs uppercase font-black tracking-wider">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-900/50 text-slate-500 border-b border-slate-200 dark:border-b-white/[0.03]">
                    <th className="px-6 py-3 w-48 text-left">Pihak</th>
                    {isTeamMatch && <th className="px-6 py-3 w-56 text-left">Lineup Pemain</th>}
                    {scoreTableConfig.columns.map((column) => (
                      <th key={column.key} className="px-6 py-3 text-center w-24 bg-white/[0.01]">{column.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-200 dark:border-b-white/[0.03]">
                    <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-300">
                      <div className="flex items-center gap-2">
                        {scoreTableConfig.showServe && <div className={cn('w-2 h-2 rounded-full', homeServing ? 'bg-amber-400 shadow-[0_0_8px_rgba(250,204,21,0.5)]' : 'bg-transparent')} />}
                        <span>{getPrimaryTableLabel('home')}</span>
                      </div>
                    </td>
                    {isTeamMatch && <td className="px-6 py-4 text-slate-500 dark:text-slate-400 normal-case font-semibold">{formatPlayerNames('home')}</td>}
                    {scoreTableConfig.columns.map((column) => (
                      <td key={`home-${column.key}`} className="px-6 py-4 text-center border-l border-slate-200 dark:border-l-white/[0.02]">
                        <span className="text-sm font-mono font-black">{column.home}</span>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-300">
                      <div className="flex items-center gap-2">
                        {scoreTableConfig.showServe && <div className={cn('w-2 h-2 rounded-full', awayServing ? 'bg-amber-400 shadow-[0_0_8px_rgba(250,204,21,0.5)]' : 'bg-transparent')} />}
                        <span>{getPrimaryTableLabel('away')}</span>
                      </div>
                    </td>
                    {isTeamMatch && <td className="px-6 py-4 text-slate-500 dark:text-slate-400 normal-case font-semibold">{formatPlayerNames('away')}</td>}
                    {scoreTableConfig.columns.map((column) => (
                      <td key={`away-${column.key}`} className="px-6 py-4 text-center border-l border-slate-200 dark:border-l-white/[0.02]">
                        <span className="text-sm font-mono font-black">{column.away}</span>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>

      {/* --- FOOTER (Low Profile & Grouped Admin Actions) --- */}
      <footer className="px-6 py-3 bg-white dark:bg-[#0b0f19] border-t border-slate-200 dark:border-white/[0.03] text-slate-500 text-xs flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
        <div className="flex flex-wrap gap-4 items-center">
          <SettingsPanel
            settings={displaySettings}
            matchSettings={matchSettingsDraft}
            onSave={handleSettingsSave}
            sportId={match.sport}
            trigger={
              <button className="text-[10px] font-black uppercase tracking-wider hover:text-slate-800 dark:hover:text-slate-300 transition-colors flex items-center gap-1.5">
                <SettingsIcon className="w-3.5 h-3.5" /> Display Setting
              </button>
            }
          />
          <span className="text-slate-200 dark:text-white/[0.08] hidden sm:inline">|</span>
          <Button asChild variant="ghost" className="h-auto p-0 text-[10px] font-black uppercase tracking-wider hover:text-slate-800 dark:hover:text-slate-300 bg-transparent hover:bg-transparent">
            <Link href="/guide" target="_blank">Panduan Bantuan</Link>
          </Button>

          {canOperateActions && (
            <>
              <span className="text-slate-200 dark:text-white/[0.08] hidden sm:inline">|</span>
              <button
                onClick={handleFinishMatch}
                disabled={match.status === 'finished'}
                className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-500/80 hover:text-amber-700 dark:hover:text-amber-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Tandai Selesai
              </button>
              <button
                onClick={handleResetMatch}
                className="text-[10px] font-black uppercase tracking-wider text-red-600 dark:text-red-500/80 hover:text-red-700 dark:hover:text-red-400 transition-colors"
              >
                Reset Match
              </button>
            </>
          )}
        </div>
        <div className="flex items-center gap-4 justify-between sm:justify-end">
          <span className="font-mono text-[10px]">CTRL-V2.4.0</span>
          <div className="flex items-center gap-2">
            <div className={cn('w-2 h-2 rounded-full', isLoading ? 'bg-yellow-500 animate-pulse' : 'bg-green-500')}></div>
            <span className="text-[10px] font-bold tracking-wide uppercase text-slate-500 dark:text-slate-600">{isLoading ? 'Syncing...' : 'Connected'}</span>
          </div>
        </div>
      </footer>

      {/* --- DIALOGS (Alerts) --- */}
      <AlertDialog open={Boolean(pendingPointAward)} onOpenChange={(open) => !open && setPendingPointAward(null)}>
        <AlertDialogContent className="bg-white dark:bg-[#0b0f19] border-slate-200 dark:border-white/5 text-slate-800 dark:text-slate-200 max-w-sm rounded-2xl animate-in fade-in zoom-in-95">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-900 dark:text-white font-black tracking-tight text-lg uppercase">Timer Belum Jalan</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 dark:text-slate-400 text-sm">Ini poin pertama pertandingan. Mau sekalian jalankan timer?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2 mt-4">
            <AlertDialogCancel className="border-slate-200 dark:border-white/5 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl text-xs uppercase tracking-wider font-bold">
              Batal
            </AlertDialogCancel>
            <Button
              type="button"
              variant="outline"
              className="border-slate-200 dark:border-white/5 bg-transparent text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl text-xs uppercase tracking-wider font-bold"
              onClick={() => {
                if (!pendingPointAward) return;
                awardPoint(pendingPointAward.winner, pendingPointAward.value);
                setPendingPointAward(null);
              }}
            >
              Tanpa Timer
            </Button>
            <AlertDialogAction
              className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs uppercase tracking-wider font-black px-6"
              onClick={() => {
                if (!pendingPointAward) return;
                startTimer();
                awardPoint(pendingPointAward.winner, pendingPointAward.value);
                setPendingPointAward(null);
              }}
            >
              Start Timer + Poin
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={Boolean(pendingAction)} onOpenChange={(open) => !open && setPendingAction(null)}>
        <AlertDialogContent className="bg-white dark:bg-[#0b0f19] border-slate-200 dark:border-white/5 text-slate-800 dark:text-slate-200 max-w-sm rounded-2xl animate-in fade-in zoom-in-95">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-900 dark:text-white font-black tracking-tight text-lg uppercase">{pendingAction?.title}</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 dark:text-slate-400 text-sm">{pendingAction?.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 mt-4">
            <AlertDialogCancel className="border-slate-200 dark:border-white/5 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl text-xs uppercase tracking-wider font-bold">
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-950 rounded-xl text-xs uppercase tracking-wider font-black px-6"
              onClick={() => {
                pendingAction?.action();
                setPendingAction(null);
              }}
            >
              {pendingAction?.confirmLabel || 'Konfirmasi'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Toaster />
    </div>
  );
}
