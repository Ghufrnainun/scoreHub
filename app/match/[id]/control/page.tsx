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

// --- ICONS (Material Icons equivalent using SVG) ---
const AddIcon = ({ className }: { className?: string }) => (
  <svg
    aria-hidden="true"
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
  </svg>
);
const UndoIcon = ({ className }: { className?: string }) => (
  <svg
    aria-hidden="true"
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z" />
  </svg>
);
const ReportIcon = ({ className }: { className?: string }) => (
  <svg
    aria-hidden="true"
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
  </svg>
);
const SettingsIcon = ({ className }: { className?: string }) => (
  <svg
    aria-hidden="true"
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.04.24.24.41.48.41h3.84c.24 0 .43-.17.47-.41l.36-2.54c.59-.24 1.13-.57 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.08-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
  </svg>
);
const HistoryIcon = ({ className }: { className?: string }) => (
  <svg
    aria-hidden="true"
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z" />
  </svg>
);
const NorthEastIcon = ({ className }: { className?: string }) => (
  <svg
    aria-hidden="true"
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M9 5v2h6.59L4 18.59 5.41 20 17 8.41V15h2V5z" />
  </svg>
);
const SunIcon = ({ className }: { className?: string }) => (
  <svg
    aria-hidden="true"
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M6.76 4.84l-1.8-1.79-1.41 1.41 1.79 1.8 1.42-1.42zM12 4V1h-2v3h2zm5.24.84l1.42 1.42 1.79-1.8-1.41-1.41-1.8 1.79zM21 11h-3v2h3v-2zM6 12a6 6 0 1112 0 6 6 0 01-12 0zm-3 1H0v-2h3v2zm3.76 7.16l-1.42 1.42 1.8 1.79 1.41-1.41-1.79-1.8zm10.48 0l1.79 1.8 1.41-1.41-1.8-1.79-1.4 1.4zM12 23v-3h-2v3h2z" />
  </svg>
);
const MoonIcon = ({ className }: { className?: string }) => (
  <svg
    aria-hidden="true"
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
  </svg>
);
const SwapIcon = ({ className }: { className?: string }) => (
  <svg
    aria-hidden="true"
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M6.99 11L3 15l3.99 4v-3H14v-2H6.99v-3zM21 9l-3.99-4v3H10v2h7.01v3L21 9z" />
  </svg>
);
const HelpIcon = ({ className }: { className?: string }) => (
  <svg
    aria-hidden="true"
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
  >
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
  const AUTO_TIMER_KEY = 'scorehub:auto-start-timer-on-first-point';
  const params = useParams();
  const searchParams = useSearchParams();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [displaySettings, setDisplaySettings] =
    useState<DisplaySettings>(defaultSettings);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<{
    title: string;
    description: string;
    confirmLabel: string;
    action: () => void;
  } | null>(null);
  const [autoStartTimerOnFirstPoint, setAutoStartTimerOnFirstPoint] =
    useState(false);
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
  const [adminSessionToken, setAdminSessionToken] = useState<string | undefined>(
    undefined,
  );

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

  // Auto-persist referee session once match is successfully loaded and token is verified
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

  const isTimerRunning = Boolean(
    match?.timer?.startedAt && !match?.timer?.pausedAt,
  );
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

  const handleChangeServe = (
    team: 'home' | 'away',
    position?: 'left' | 'right',
  ) => {
    if (!canOperateActions) return;
    runRiskyAction(
      {
        title: 'Ubah Server?',
        description:
          'Perubahan server dilakukan manual dan dapat memengaruhi alur servis pertandingan.',
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
        description:
          'Aksi ini menukar posisi tim pada tampilan dan control. Pastikan ini memang diperlukan.',
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
        description:
          'Ini akan menghapus semua skor, set, dan riwayat pertandingan secara permanen.',
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
        description:
          'Match akan ditandai selesai dan input poin tidak bisa dilanjutkan kecuali dilakukan reset.',
        confirmLabel: 'Akhiri Match',
      },
      () => finishMatch(),
      true,
    );
  };

  const pushCopyFeedback = (message: string) => {
    setCopyFeedback(message);
    window.setTimeout(() => setCopyFeedback(null), 2200);
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
          description:
            'Perubahan display dan data pertandingan akan tersinkron ke semua client aktif.',
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

  if (role === 'referee' && !sessionReady) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <p className="text-sm font-mono text-muted-foreground">
          Menyiapkan sesi wasit...
        </p>
      </div>
    );
  }

  if (role === 'admin' && !sessionReady) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <p className="text-sm font-mono text-muted-foreground">
          Menyiapkan sesi admin...
        </p>
      </div>
    );
  }

  if (role === 'admin' && !adminSessionToken) {
    return (
      <div className="min-h-screen bg-background text-foreground px-4 py-16">
        <div className="max-w-xl mx-auto rounded-3xl border border-border bg-card p-8 text-center shadow-sm">
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold">
            Sesi Admin Tidak Ditemukan
          </p>
          <h1 className="mt-3 text-3xl font-[family-name:var(--font-bebas)] tracking-[0.08em] uppercase">
            Masuk Admin Dulu
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Login dari halaman admin untuk membuka kontrol pertandingan.
          </p>
          <Link href="/admin" className="inline-block mt-6">
            <Button className="rounded-full text-xs uppercase tracking-widest font-bold">
              Ke Halaman Admin
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (role === 'referee' && !token) {
    return (
      <div className="min-h-screen bg-background text-foreground px-4 py-16">
        <div className="max-w-xl mx-auto rounded-3xl border border-border bg-card p-8 text-center shadow-sm">
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold">
            Sesi Wasit Tidak Ditemukan
          </p>
          <h1 className="mt-3 text-3xl font-[family-name:var(--font-bebas)] tracking-[0.08em] uppercase">
            Masuk Terlebih Dahulu
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Masuk lagi melalui halaman join menggunakan display code + PIN.
          </p>
          <Link
            href={`/referee/join?matchId=${matchId}`}
            className="inline-block mt-6"
          >
            <Button className="rounded-full text-xs uppercase tracking-widest font-bold">
              Ke Halaman Masuk Wasit
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading || !match)
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center text-center p-10 font-bold">
        Memuat data pertandingan...
      </div>
    );

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
  };
  const leftDisplaySide: 'home' | 'away' = match.isFlipped ? 'away' : 'home';
  const rightDisplaySide: 'home' | 'away' = match.isFlipped ? 'home' : 'away';
  const leftDisplayTeam = match.teams[leftDisplaySide];
  const rightDisplayTeam = match.teams[rightDisplaySide];
  const displayPath = match.displayCode
    ? `/display/${match.displayCode}`
    : `/match/${matchId}/display`;
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

  const handleAwardPoint = (winner: 'home' | 'away', value?: number) => {
    if (!canOperateActions || match.status === 'finished') return;

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
                    onClick={() => handleAwardPoint(team.side, value)}
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
                  onClick={() => handleAwardPoint(team.side)}
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
                onClick={() => handleAwardPoint(team.side)}
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
                onClick={() => handleAwardPoint(team.side)}
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
      <header className="p-3 px-4 sm:px-6 flex flex-col gap-3 lg:flex-row lg:justify-between lg:items-center bg-white dark:bg-card/80 dark:backdrop-blur-xl border-b border-slate-200 dark:border-white/5 shadow-sm z-30">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3 sm:gap-4">
          <Link href="/admin" className="group flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Image
                src="/logo-pb.png"
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
          <div className="hidden xl:block h-8 w-px bg-slate-200 dark:bg-slate-800"></div>
          <div className="min-w-0 flex-1">
            <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-slate-200 dark:border-white/5 bg-slate-100/90 dark:bg-card px-3 py-1.5 shadow-sm">
              <span className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">
                Match ID
              </span>
              <span className="text-sm font-mono font-black text-slate-900 dark:text-foreground leading-none tracking-tight truncate max-w-[160px] sm:max-w-none">
                {matchId}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Link
                href={displayPath}
                target="_blank"
                className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-white shadow-md transition-colors hover:bg-blue-500 active:scale-95"
              >
                <NorthEastIcon className="w-3.5 h-3.5" /> OPEN DISPLAY
              </Link>
              <button
                onClick={() => {
                  const url = `${window.location.origin}${displayPath}`;
                  navigator.clipboard.writeText(url);
                  pushCopyFeedback('Display link copied');
                }}
                className="inline-flex items-center rounded-full border border-slate-200 dark:border-white/5 bg-slate-100/90 dark:bg-white/5 px-4 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-slate-600 dark:text-slate-400 transition-colors hover:bg-slate-200 dark:hover:bg-white/10 active:scale-95"
              >
                COPY LINK
              </button>
              <button
                onClick={() => {
                  const url = `${window.location.origin}${displayPath}?overlay=true`;
                  navigator.clipboard.writeText(url);
                  pushCopyFeedback('OBS overlay link copied');
                }}
                className="inline-flex items-center gap-1.5 rounded-full bg-green-600 px-4 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-white shadow-md transition-colors hover:bg-green-500 active:scale-95"
              >
                <div className="w-2 h-2 rounded-full bg-white animate-pulse motion-reduce:animate-none"></div>
                OBS LINK
              </button>
            </div>
            {copyFeedback ? (
              <p className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                {copyFeedback}
              </p>
            ) : null}
          </div>
        </div>

        {/* Central Match Status & Timer */}
        <div className="flex items-center gap-3 sm:gap-4 bg-slate-100 dark:bg-card/50 dark:backdrop-blur-md px-3 py-2 rounded-2xl border border-slate-200 dark:border-white/5 shadow-inner w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex flex-col items-center min-w-[42px] sm:min-w-[50px]">
            <span className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase leading-none mb-1.5">
              {phaseLabel}
            </span>
            <span className="text-xl sm:text-2xl font-black leading-none dark:text-foreground">
              {phaseValue}
            </span>
          </div>
          <div className="h-8 w-px bg-slate-300 dark:bg-slate-600"></div>
          <button
            className="flex flex-col items-center select-none group px-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg min-w-[64px]"
            onClick={toggleTimer}
            disabled={!canOperateActions}
            onContextMenu={(e) => {
              if (!canOperateActions) return;
              e.preventDefault();
              resetTimer();
            }}
            aria-label={`Match timer. Currently ${formatTime(remainingTime)}. ${isTimerRunning ? 'Click to pause' : 'Click to start'}. Right click to reset.`}
          >
            <span
              className={cn(
                'text-xl sm:text-2xl font-mono font-black tabular-nums transition-[color,transform] duration-300',
                isTimerRunning
                  ? 'text-blue-600 dark:text-blue-400 scale-110'
                  : 'text-slate-400',
              )}
            >
              {formatTime(remainingTime)}
            </span>
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-slate-500 group-hover:text-blue-500 transition-colors">
              {isTimerRunning ? 'PAUSE' : 'START'}
            </span>
            {!isTimerRunning ? (
              <span className="mt-1 rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-amber-700 animate-pulse motion-reduce:animate-none dark:bg-amber-500/20 dark:text-amber-300">
                Timer Belum Jalan
              </span>
            ) : null}
          </button>
          <div className="hidden sm:block h-8 w-px bg-slate-300 dark:bg-slate-600"></div>
          <button
            onClick={toggleAutoStartTimer}
            className={cn(
              'rounded-xl border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] transition-colors whitespace-nowrap',
              autoStartTimerOnFirstPoint
                ? 'border-emerald-300 bg-emerald-100 text-emerald-700 dark:border-emerald-500/50 dark:bg-emerald-500/20 dark:text-emerald-300'
                : 'border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-400 dark:hover:bg-slate-800',
            )}
            title="Auto-start timer saat poin pertama"
            aria-label="Toggle auto-start timer on first point"
          >
            Auto 1st {autoStartTimerOnFirstPoint ? 'On' : 'Off'}
          </button>
        </div>

        <div className="flex items-center gap-2 justify-end flex-wrap lg:flex-nowrap">
          <button
            onClick={handleToggleSides}
            title="Tukar Sisi"
            aria-label="Tukar sisi di lapangan"
            disabled={!canOperateActions}
            className="p-3.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-400 group active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 shadow-sm"
          >
            <SwapIcon className="w-6 h-6 group-active:rotate-180 transition-transform duration-500" />
          </button>

          <SettingsPanel
            settings={displaySettings}
            matchSettings={matchSettingsDraft}
            onSave={handleSettingsSave}
            sportId={match.sport}
            trigger={
              <button
                title="Pengaturan Display"
                aria-label="Buka pengaturan display"
                className="p-3.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-400 group active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 shadow-sm"
              >
                <SettingsIcon className="w-6 h-6 group-hover:rotate-90 transition-transform duration-500" />
              </button>
            }
          />

          <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 mx-1"></div>

          <button
            onClick={toggleTheme}
            title="Ubah Tema"
            aria-label="Ubah mode gelap"
            className="p-3.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-400 active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 shadow-sm"
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
        className="flex-1 p-2 sm:p-4 flex flex-col gap-3 max-w-7xl mx-auto w-full overflow-x-hidden"
      >
        {error ? (
          <div className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-xs font-bold uppercase tracking-wider text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
            {error}
          </div>
        ) : null}
        {/* Score Strip */}
        <div className="relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900 shadow-sm">
          <button
            onClick={undo}
            aria-label="Undo last point"
            className="absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-sky-400 transition-[background-color,transform] hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900"
          >
            <UndoIcon className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 px-10 py-1.5 sm:px-12 sm:py-2">
            <div className="min-w-0 flex items-end gap-2">
              <p className="truncate text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400">
                {leftDisplayTeam.name}
              </p>
              <span className="block text-2xl sm:text-3xl lg:text-4xl font-mono font-black text-blue-600 dark:text-blue-400 tracking-tighter tabular-nums leading-none">
                {leftDisplayTeam.score}
              </span>
            </div>

            <div className="flex flex-col items-center gap-0">
              <span className="text-lg sm:text-xl font-black text-slate-300 dark:text-slate-600 leading-none">
                -
              </span>
              <span className="inline-flex items-center rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 px-2 py-0 text-[9px] font-black uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                {phaseLabel} {phaseValue}
              </span>
            </div>

            <div className="min-w-0 flex items-end justify-end gap-2 text-right">
              <p className="truncate text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400">
                {rightDisplayTeam.name}
              </p>
              <span className="block text-2xl sm:text-3xl lg:text-4xl font-mono font-black text-red-600 dark:text-red-400 tracking-tighter tabular-nums leading-none">
                {rightDisplayTeam.score}
              </span>
            </div>
          </div>
        </div>

        {/* Main Game Area */}
        <div className="flex flex-col landscape:flex-row items-center gap-2 sm:gap-3 flex-1 min-h-0">
          {/* Left Controls */}
          {isBadminton ? (
            <div className="hidden landscape:flex flex-col gap-2 items-center">
              {/* Manual Service Selectors Left */}
              <div className="flex flex-col gap-1 bg-slate-900/40 p-1 rounded-xl border border-white/5 min-w-[92px] lg:min-w-[128px]">
                {(() => {
                  const side = match.isFlipped ? 'away' : 'home';
                  const team = match.teams[side];
                  const positions = isSingles
                    ? (['left'] as const)
                    : (['left', 'right'] as const);
                  return positions.map((pos) => {
                    const isActive =
                      match.server === side &&
                      (isSingles || match.serviceCourt === pos);
                    const playerIdx = isSingles ? 0 : pos === 'left' ? 1 : 0;
                    const playerName =
                      team.players[
                        team.playerPositions?.[playerIdx] ?? playerIdx
                      ]?.name || team.name;

                    return (
                      <button
                        key={pos}
                        onClick={() =>
                          handleChangeServe(side, isSingles ? undefined : pos)
                        }
                        disabled={!canOperateActions}
                        className={cn(
                          'w-full px-3 py-2 rounded-xl flex items-center gap-3 transition-all duration-300 active:scale-90 group relative overflow-hidden border-2',
                          isActive
                            ? 'bg-gradient-to-br from-amber-300 via-amber-500 to-orange-600 text-slate-900 shadow-[0_0_20px_rgba(245,158,11,0.4)] border-amber-200/50'
                            : 'bg-slate-800/40 backdrop-blur-md text-slate-400 border-white/5 hover:bg-white/10 hover:border-white/20',
                        )}
                        title={`Set ${playerName} as server`}
                      >
                        <ShuttlecockIcon
                          className={cn(
                            'w-5 h-5 lg:w-7 lg:h-7 flex-shrink-0 transition-transform duration-500',
                            isActive
                              ? 'drop-shadow-[0_2px_3px_rgba(0,0,0,0.3)] scale-110'
                              : 'group-hover:translate-x-1',
                          )}
                        />
                        <span
                          className={cn(
                            'text-xs lg:text-[11px] font-black truncate uppercase tracking-widest leading-none',
                            isActive ? 'text-slate-900' : 'text-slate-400',
                          )}
                        >
                          {isSingles ? 'SERVE' : playerName.split(' ')[0]}
                        </span>
                        {isActive && (
                          <div className="absolute inset-0 bg-white/20 animate-pulse motion-reduce:animate-none mix-blend-overlay"></div>
                        )}
                      </button>
                    );
                  });
                })()}
              </div>

              {/* Award Point Button */}
              {match.status === 'finished' ? (
                <div className="flex-shrink-0 w-28 sm:w-32 lg:w-40 flex-col items-center justify-center opacity-50 cursor-not-allowed border-2 border-white/5 rounded-xl lg:rounded-3xl bg-slate-900/50 flex py-6 lg:py-9">
                  <span className="text-xs font-black uppercase text-slate-500 tracking-widest text-center">
                    ENDED
                  </span>
                </div>
              ) : (
                <button
                  onClick={() =>
                    handleAwardPoint(match.isFlipped ? 'away' : 'home')
                  }
                  className="flex-shrink-0 w-28 sm:w-32 lg:w-40 bg-gradient-to-br from-blue-500 to-blue-700 hover:from-blue-400 hover:to-blue-600 text-white rounded-2xl lg:rounded-[2rem] shadow-[0_10px_30px_-10px_rgba(37,99,235,0.5)] active:scale-90 transition-all duration-300 flex flex-col items-center justify-center py-6 lg:py-9 border-2 border-white/20 group overflow-hidden relative"
                >
                  <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <span className="text-xs font-black opacity-60 mb-1 lg:mb-2 uppercase tracking-[0.2em] leading-none">
                    AWARD POINT
                  </span>
                  <span className="text-xs lg:text-base font-black text-center leading-tight px-3 mb-2 lg:mb-4 uppercase tracking-tighter drop-shadow-md">
                    {match.isFlipped ? away.name : home.name}
                  </span>
                  <AddIcon className="w-8 h-8 lg:w-12 lg:h-12 drop-shadow-lg group-hover:scale-110 transition-transform duration-500" />
                </button>
              )}
            </div>
          ) : null}

          {/* Court Visual */}
          {isBadminton ? (
            <div className="flex-1 w-full landscape:w-auto min-w-0 aspect-[2/1] max-h-[35vh] landscape:max-h-[50vh] lg:max-h-[40vh] bg-[#00a651] rounded-xl relative overflow-hidden shadow-[inset_0_0_100px_rgba(0,0,0,0.2)] border border-white/20 select-none">
              {/* Badminton Court Markings (SVG) */}
              <svg
                className="absolute inset-x-0 inset-y-0 w-full h-full pointer-events-none opacity-80"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
              >
                {/* Outer boundary (Doubles) */}
                <rect
                  x="1"
                  y="1"
                  width="98"
                  height="98"
                  fill="none"
                  stroke="white"
                  strokeWidth="0.6"
                />

                {/* Net line (Center dashed) */}
                <line
                  x1="50"
                  y1="0"
                  x2="50"
                  y2="100"
                  stroke="white"
                  strokeWidth="0.8"
                  strokeDasharray="2,1"
                />

                {/* Singles side lines (inner horizontal lines in landscape view) */}
                <line
                  x1="0"
                  y1="7.5"
                  x2="100"
                  y2="7.5"
                  stroke="white"
                  strokeWidth="0.5"
                />
                <line
                  x1="0"
                  y1="92.5"
                  x2="100"
                  y2="92.5"
                  stroke="white"
                  strokeWidth="0.5"
                />

                {/* Short service lines (vertical lines near net) */}
                <line
                  x1="35"
                  y1="0"
                  x2="35"
                  y2="100"
                  stroke="white"
                  strokeWidth="0.6"
                />
                <line
                  x1="65"
                  y1="0"
                  x2="65"
                  y2="100"
                  stroke="white"
                  strokeWidth="0.6"
                />

                {/* Long service lines for doubles (inner vertical lines near baselines) */}
                <line
                  x1="6.5"
                  y1="0"
                  x2="6.5"
                  y2="100"
                  stroke="white"
                  strokeWidth="0.4"
                />
                <line
                  x1="93.5"
                  y1="0"
                  x2="93.5"
                  y2="100"
                  stroke="white"
                  strokeWidth="0.4"
                />

                {/* Center lines (horizontal lines dividing sub-courts) */}
                <line
                  x1="0"
                  y1="50"
                  x2="35"
                  y2="50"
                  stroke="white"
                  strokeWidth="0.6"
                />
                <line
                  x1="65"
                  y1="50"
                  x2="100"
                  y2="50"
                  stroke="white"
                  strokeWidth="0.6"
                />
              </svg>

              {/* Court Names layer */}
              {(() => {
                const leftTeamSide: 'home' | 'away' = match.isFlipped
                  ? 'away'
                  : 'home';
                const rightTeamSide: 'home' | 'away' = match.isFlipped
                  ? 'home'
                  : 'away';
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

                  const servingTeam = match.server === 'home' ? home : away;
                  const activeCourtIdx = servingTeam.score % 2 === 0 ? 0 : 1;

                  if (isSingles) {
                    const { courtIdx } = getQuadrantInfo(quadrant);
                    return courtIdx === activeCourtIdx;
                  } else {
                    const { courtIdx } = getQuadrantInfo(quadrant);
                    const expectedReceiverCourtIdx = activeCourtIdx;
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
                  className,
                }: {
                  quadrant: 'TL' | 'TR' | 'BL' | 'BR';
                  className?: string;
                }) => {
                  const {
                    side,
                    quadrant: qName,
                    courtIdx,
                  } = (() => {
                    const info = getQuadrantInfo(quadrant);
                    const qPos =
                      quadrant === 'TL' || quadrant === 'BL' ? 'left' : 'right';
                    return { ...info, quadrant: qPos };
                  })();

                  const isServer = isServerQuadrant(quadrant);
                  const isReceiver = isReceiverQuadrant(quadrant);
                  const serverColor = getServerColor(quadrant);
                  const content = getQuadrantContent(quadrant);

                  return (
                    <div
                      className={cn(
                        'flex flex-col items-center justify-center p-2 transition-all duration-500 rounded-lg relative',
                        className,
                      )}
                      style={
                        isServer
                          ? {
                              backgroundColor: `${serverColor}60`,
                              boxShadow: `inset 0 0 20px ${serverColor}40`,
                            }
                          : isReceiver
                            ? { backgroundColor: `${serverColor}20` }
                            : {}
                      }
                    >
                      <div className="flex flex-col items-center gap-1">
                        {isServer && (
                          <ShuttlecockIcon className="w-5 h-5 lg:w-8 lg:h-8 text-yellow-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] animate-bounce motion-reduce:animate-none" />
                        )}
                        <span
                          className={cn(
                            'font-black text-xs sm:text-xs lg:text-base text-center shadow-lg leading-tight tracking-tight uppercase px-2 py-1 rounded border border-white/10 bg-black/40 backdrop-blur-md transition-all duration-300',
                            isServer
                              ? 'text-yellow-200 border-yellow-400/30 scale-110 shadow-yellow-500/20'
                              : 'text-white',
                          )}
                        >
                          {content}
                        </span>
                      </div>
                    </div>
                  );
                };

                return (
                  <div className="absolute inset-0 text-white z-10 pointer-events-none">
                    <div className="absolute inset-0 grid grid-cols-[35%_30%_35%] grid-rows-2">
                      <QuadrantCell
                        quadrant="TL"
                        className="col-start-1 row-start-1 m-2 pointer-events-auto"
                      />
                      <QuadrantCell
                        quadrant="BL"
                        className="col-start-1 row-start-2 m-2 pointer-events-auto"
                      />

                      <div className="col-start-2 row-span-2 flex flex-col items-center justify-end pb-4 pointer-events-none">
                        <button
                          onClick={handleToggleSides}
                          disabled={!canOperateActions}
                          className="pointer-events-auto bg-black/40 backdrop-blur-md border border-white/10 text-white/50 hover:text-white hover:bg-black/60 rounded-full p-2 transition-all active:scale-90 flex items-center gap-2 group mb-2"
                          title="Tukar sisi"
                        >
                          <SwapIcon className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                          <span className="text-xs font-black uppercase tracking-widest hidden sm:inline">
                            Tukar Sisi
                          </span>
                        </button>
                      </div>

                      <QuadrantCell
                        quadrant="TR"
                        className="col-start-3 row-start-1 m-2 pointer-events-auto"
                      />
                      <QuadrantCell
                        quadrant="BR"
                        className="col-start-3 row-start-2 m-2 pointer-events-auto"
                      />
                    </div>
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

          {/* Right Controls */}
          {isBadminton ? (
            <div className="hidden landscape:flex flex-col gap-2 items-center">
              {/* Manual Service Selectors Right */}
              <div className="flex flex-col gap-1 bg-slate-900/40 p-1 rounded-xl border border-white/5 min-w-[92px] lg:min-w-[128px]">
                {(() => {
                  const side = match.isFlipped ? 'home' : 'away';
                  const team = match.teams[side];
                  const positions = isSingles
                    ? (['left'] as const)
                    : (['left', 'right'] as const);
                  return positions.map((pos) => {
                    const isActive =
                      match.server === side &&
                      (isSingles || match.serviceCourt === pos);
                    const playerIdx = isSingles ? 0 : pos === 'left' ? 1 : 0;
                    const playerName =
                      team.players[
                        team.playerPositions?.[playerIdx] ?? playerIdx
                      ]?.name || team.name;

                    return (
                      <button
                        key={pos}
                        onClick={() =>
                          handleChangeServe(side, isSingles ? undefined : pos)
                        }
                        disabled={!canOperateActions}
                        className={cn(
                          'w-full px-3 py-2 rounded-xl flex items-center gap-3 transition-all duration-300 active:scale-90 group relative overflow-hidden border-2',
                          isActive
                            ? 'bg-gradient-to-br from-amber-300 via-amber-500 to-orange-600 text-slate-900 shadow-[0_0_20px_rgba(245,158,11,0.4)] border-amber-200/50'
                            : 'bg-slate-800/40 backdrop-blur-md text-slate-400 border-white/5 hover:bg-white/10 hover:border-white/20',
                        )}
                        title={`Set ${playerName} as server`}
                      >
                        <ShuttlecockIcon
                          className={cn(
                            'w-5 h-5 lg:w-7 lg:h-7 flex-shrink-0 transition-transform duration-500',
                            isActive
                              ? 'drop-shadow-[0_2px_3px_rgba(0,0,0,0.3)] scale-110'
                              : 'group-hover:translate-x-1',
                          )}
                        />
                        <span
                          className={cn(
                            'text-xs lg:text-[11px] font-black truncate uppercase tracking-widest leading-none',
                            isActive ? 'text-slate-900' : 'text-slate-400',
                          )}
                        >
                          {isSingles ? 'SERVE' : playerName.split(' ')[0]}
                        </span>
                        {isActive && (
                          <div className="absolute inset-0 bg-white/20 animate-pulse motion-reduce:animate-none mix-blend-overlay"></div>
                        )}
                      </button>
                    );
                  });
                })()}
              </div>

              {/* Award Point Button */}
              {match.status === 'finished' ? (
                <div className="flex-shrink-0 w-28 sm:w-32 lg:w-40 flex-col items-center justify-center opacity-50 cursor-not-allowed border-2 border-white/5 rounded-xl lg:rounded-3xl bg-slate-900/50 flex py-6 lg:py-9">
                  <span className="text-xs font-black uppercase text-slate-500 tracking-widest text-center">
                    ENDED
                  </span>
                </div>
              ) : (
                <button
                  onClick={() =>
                    handleAwardPoint(match.isFlipped ? 'home' : 'away')
                  }
                  className="flex-shrink-0 w-28 sm:w-32 lg:w-40 bg-gradient-to-br from-red-500 to-red-700 hover:from-red-400 hover:to-red-600 text-white rounded-2xl lg:rounded-[2rem] shadow-[0_10px_30px_-10px_rgba(220,38,38,0.5)] active:scale-90 transition-all duration-300 flex flex-col items-center justify-center py-6 lg:py-9 border-2 border-white/20 group overflow-hidden relative"
                >
                  <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <span className="text-xs font-black opacity-60 mb-1 lg:mb-2 uppercase tracking-[0.2em] leading-none">
                    AWARD POINT
                  </span>
                  <span className="text-xs lg:text-base font-black text-center leading-tight px-3 mb-2 lg:mb-4 uppercase tracking-tighter drop-shadow-md">
                    {match.isFlipped ? home.name : away.name}
                  </span>
                  <AddIcon className="w-8 h-8 lg:w-12 lg:h-12 drop-shadow-lg group-hover:scale-110 transition-transform duration-500" />
                </button>
              )}
            </div>
          ) : null}
        </div>

        {/* Portrait Buttons */}
        {isBadminton ? (
          <div className="flex landscape:hidden gap-4 px-2 mb-2">
            <div className="flex-1 flex flex-col gap-2">
              <div className="flex gap-2 justify-center bg-slate-900/40 p-1 rounded-2xl border border-white/5">
                {(() => {
                  const side = match.isFlipped ? 'away' : 'home';
                  const team = match.teams[side];
                  const positions = isSingles
                    ? (['left'] as const)
                    : (['left', 'right'] as const);
                  return positions.map((pos) => {
                    const isActive =
                      match.server === side &&
                      (isSingles || match.serviceCourt === pos);
                    const playerIdx = isSingles ? 0 : pos === 'left' ? 1 : 0;
                    const playerName =
                      team.players[
                        team.playerPositions?.[playerIdx] ?? playerIdx
                      ]?.name || team.name;
                    return (
                      <button
                        key={pos}
                        onClick={() =>
                          handleChangeServe(side, isSingles ? undefined : pos)
                        }
                        disabled={!canOperateActions}
                        className={cn(
                          'flex-1 h-14 rounded-2xl flex items-center justify-center gap-3 transition-all duration-300 active:scale-90 px-3 relative overflow-hidden border-2',
                          isActive
                            ? 'bg-gradient-to-br from-amber-300 via-amber-500 to-orange-600 text-slate-900 shadow-[0_0_20px_rgba(245,158,11,0.4)] border-amber-200/50'
                            : 'bg-slate-800/40 backdrop-blur-md text-slate-400 border-white/5 hover:bg-white/10',
                        )}
                      >
                        <ShuttlecockIcon
                          className={cn(
                            'w-6 h-6 transition-transform duration-500',
                            isActive
                              ? 'drop-shadow-[0_2px_3px_rgba(0,0,0,0.3)] scale-110'
                              : '',
                          )}
                        />
                        <span
                          className={cn(
                            'text-xs font-black truncate uppercase tracking-widest',
                            isActive ? 'text-slate-900' : 'text-slate-400',
                          )}
                        >
                          {isSingles ? 'SERVE' : playerName.split(' ')[0]}
                        </span>
                        {isActive && (
                          <div className="absolute inset-0 bg-white/20 animate-pulse motion-reduce:animate-none mix-blend-overlay"></div>
                        )}
                      </button>
                    );
                  });
                })()}
              </div>
              <button
                onClick={() =>
                  handleAwardPoint(match.isFlipped ? 'away' : 'home')
                }
                className="w-full bg-gradient-to-br from-blue-500 to-blue-700 hover:from-blue-400 hover:to-blue-600 active:scale-90 transition-all duration-300 rounded-3xl py-10 flex flex-col items-center justify-center shadow-[0_10px_40px_-10px_rgba(37,99,235,0.5)] border-2 border-white/20 group overflow-hidden relative"
              >
                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <span className="text-xs font-black text-white uppercase mb-2 tracking-[0.2em] opacity-70 group-hover:opacity-100 transition-opacity">
                  {match.isFlipped ? away.name : home.name}
                </span>
                <AddIcon className="w-12 h-12 text-white drop-shadow-lg group-hover:scale-110 transition-transform duration-500" />
              </button>
            </div>

            <div className="flex-1 flex flex-col gap-2">
              <div className="flex gap-2 justify-center bg-slate-900/40 p-1 rounded-2xl border border-white/5">
                {(() => {
                  const side = match.isFlipped ? 'home' : 'away';
                  const team = match.teams[side];
                  const positions = isSingles
                    ? (['left'] as const)
                    : (['left', 'right'] as const);
                  return positions.map((pos) => {
                    const isActive =
                      match.server === side &&
                      (isSingles || match.serviceCourt === pos);
                    const playerIdx = isSingles ? 0 : pos === 'left' ? 1 : 0;
                    const playerName =
                      team.players[
                        team.playerPositions?.[playerIdx] ?? playerIdx
                      ]?.name || team.name;
                    return (
                      <button
                        key={pos}
                        onClick={() =>
                          handleChangeServe(side, isSingles ? undefined : pos)
                        }
                        disabled={!canOperateActions}
                        className={cn(
                          'flex-1 h-14 rounded-2xl flex items-center justify-center gap-3 transition-all duration-300 active:scale-90 px-3 relative overflow-hidden border-2',
                          isActive
                            ? 'bg-gradient-to-br from-amber-300 via-amber-500 to-orange-600 text-slate-900 shadow-[0_0_20px_rgba(245,158,11,0.4)] border-amber-200/50'
                            : 'bg-slate-800/40 backdrop-blur-md text-slate-400 border-white/5 hover:bg-white/10',
                        )}
                      >
                        <ShuttlecockIcon
                          className={cn(
                            'w-6 h-6 transition-transform duration-500',
                            isActive
                              ? 'drop-shadow-[0_2px_3px_rgba(0,0,0,0.3)] scale-110'
                              : '',
                          )}
                        />
                        <span
                          className={cn(
                            'text-xs font-black truncate uppercase tracking-widest',
                            isActive ? 'text-slate-900' : 'text-slate-400',
                          )}
                        >
                          {isSingles ? 'SERVE' : playerName.split(' ')[0]}
                        </span>
                        {isActive && (
                          <div className="absolute inset-0 bg-white/20 animate-pulse motion-reduce:animate-none mix-blend-overlay"></div>
                        )}
                      </button>
                    );
                  });
                })()}
              </div>
              <button
                onClick={() =>
                  handleAwardPoint(match.isFlipped ? 'home' : 'away')
                }
                className="w-full bg-gradient-to-br from-red-500 to-red-700 hover:from-red-400 hover:to-red-600 active:scale-90 transition-all duration-300 rounded-3xl py-10 flex flex-col items-center justify-center shadow-[0_10px_40px_-10px_rgba(220,38,38,0.5)] border-2 border-white/20 group overflow-hidden relative"
              >
                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <span className="text-xs font-black text-white uppercase mb-2 tracking-[0.2em] opacity-70 group-hover:opacity-100 transition-opacity">
                  {match.isFlipped ? home.name : away.name}
                </span>
                <AddIcon className="w-12 h-12 text-white drop-shadow-lg group-hover:scale-110 transition-transform duration-500" />
              </button>
            </div>
          </div>
        ) : null}

        {/* History Table */}
        {scoreTableConfig ? (
          <div className="flex-shrink-0 w-full mt-auto overflow-x-auto">
            <div
              className={cn(
                'w-full max-w-5xl mx-auto overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-all duration-300',
                isTeamMatch ? 'min-w-[860px]' : 'min-w-[720px]',
              )}
            >
              <table className="w-full text-xs sm:text-sm uppercase font-black tracking-tight">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800/80 text-left text-slate-500">
                    <th className="px-6 py-4 w-48 border-r border-slate-200 dark:border-slate-700">
                      {isTeamMatch ? 'Team' : 'Pemain'}
                    </th>
                    {isTeamMatch ? (
                      <th className="px-6 py-4 w-56 border-r border-slate-200 dark:border-slate-700">
                        Pemain
                      </th>
                    ) : null}
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
                        <span>{getPrimaryTableLabel('home')}</span>
                      </div>
                    </td>
                    {isTeamMatch ? (
                      <td className="px-6 py-4 border-r border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300 normal-case font-semibold">
                        {formatPlayerNames('home')}
                      </td>
                    ) : null}
                    {scoreTableConfig.columns.map((column) => (
                      <td
                        key={`home-${column.key}`}
                        className="px-6 py-4 text-center border-l border-slate-100 dark:border-slate-800"
                      >
                        <span className="text-lg font-mono">{column.home}</span>
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
                        <span>{getPrimaryTableLabel('away')}</span>
                      </div>
                    </td>
                    {isTeamMatch ? (
                      <td className="px-6 py-4 border-r border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300 normal-case font-semibold">
                        {formatPlayerNames('away')}
                      </td>
                    ) : null}
                    {scoreTableConfig.columns.map((column) => (
                      <td
                        key={`away-${column.key}`}
                        className="px-6 py-4 text-center border-l border-slate-100 dark:border-slate-800"
                      >
                        <span className="text-lg font-mono">{column.away}</span>
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
      <footer className="p-2 px-4 sm:px-6 flex flex-col gap-2 sm:flex-row sm:justify-between bg-slate-100 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 text-slate-500">
        <div className="flex flex-wrap gap-3 sm:gap-4">
          <SettingsPanel
            settings={displaySettings}
            matchSettings={matchSettingsDraft}
            onSave={handleSettingsSave}
            sportId={match.sport}
            trigger={
              <button className="flex items-center gap-2 text-xs font-bold hover:text-blue-500 transition-colors">
                <SettingsIcon className="w-4 h-4" /> PENGATURAN
              </button>
            }
          />
          <button className="flex items-center gap-2 text-xs font-bold hover:text-blue-500 transition-colors">
            <HistoryIcon className="w-4 h-4" /> RIWAYAT
          </button>
          <Button
            asChild
            variant="ghost"
            className="h-auto p-0 flex items-center gap-2 text-xs font-bold hover:text-blue-500 transition-colors bg-transparent hover:bg-transparent"
          >
            <Link href="/guide" target="_blank">
              <HelpIcon className="w-4 h-4" /> BANTUAN
            </Link>
          </Button>
          {canOperateActions ? (
            <>
              <button
                onClick={handleFinishMatch}
                disabled={match.status === 'finished'}
                className="flex items-center gap-2 text-xs font-bold text-amber-600 hover:text-amber-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                FINISH
              </button>
              <button
                onClick={handleResetMatch}
                className="flex items-center gap-2 text-xs font-bold text-red-500 hover:text-red-400 transition-colors"
              >
                <div className="w-4 h-4 border-2 border-current rounded-full flex items-center justify-center font-black text-[8px]">
                  X
                </div>{' '}
                RESET
              </button>
            </>
          ) : null}
        </div>
        <div className="flex items-center gap-4 justify-between sm:justify-end">
          <span className="text-xs font-mono">BUILD: 2.4.0-STABLE</span>
          <div
            className={`w-2 h-2 rounded-full animate-pulse motion-reduce:animate-none ${isLoading ? 'bg-yellow-500' : 'bg-green-500'}`}
          ></div>
        </div>
      </footer>
      <AlertDialog
        open={Boolean(pendingPointAward)}
        onOpenChange={(open) => {
          if (!open) setPendingPointAward(null);
        }}
      >
        <AlertDialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 font-sans">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-900 dark:text-slate-100 uppercase tracking-tighter font-black text-xl">
              Timer Belum Jalan
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 dark:text-slate-400 font-medium">
              Ini poin pertama pertandingan. Mau sekalian mulai timer?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold uppercase tracking-tight">
              Batal
            </AlertDialogCancel>
            <Button
              type="button"
              variant="outline"
              className="font-bold uppercase tracking-tight"
              onClick={() => {
                if (!pendingPointAward) return;
                awardPoint(pendingPointAward.winner, pendingPointAward.value);
                setPendingPointAward(null);
              }}
            >
              Lanjut Tanpa Timer
            </Button>
            <AlertDialogAction
              onClick={() => {
                if (!pendingPointAward) return;
                startTimer();
                awardPoint(pendingPointAward.winner, pendingPointAward.value);
                setPendingPointAward(null);
              }}
              className="bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-tight transition-transform active:scale-95 px-6"
            >
              Start Timer + Poin
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={Boolean(pendingAction)}
        onOpenChange={(open) => {
          if (!open) setPendingAction(null);
        }}
      >
        <AlertDialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 font-sans">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-900 dark:text-slate-100 uppercase tracking-tighter font-black text-2xl">
              {pendingAction?.title}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 dark:text-slate-400 font-medium">
              {pendingAction?.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3">
            <AlertDialogCancel className="border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold uppercase tracking-tight">
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                pendingAction?.action();
                setPendingAction(null);
              }}
              className="bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-tight transition-transform active:scale-95 px-8"
            >
              {pendingAction?.confirmLabel || 'Konfirmasi'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
