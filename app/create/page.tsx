'use client';

import { useState, useEffect } from 'react';
import { useMutation } from 'convex/react';
import { ConvexError } from 'convex/values';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import sportConfig from '@/config/sports.json';
import { api } from '@/convex/_generated/api';
import { isAdminAuthenticated } from '@/lib/auth';
import { loadValidAdminSession } from '@/lib/admin-session';

// --- ICONS ---
const ThemeToggleIcon = ({ mode }: { mode: 'light' | 'dark' }) => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    {mode === 'dark' ? (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
      />
    ) : (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
      />
    )}
  </svg>
);

const BadmintonIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5 5l7 7m0 0l4 4m-4-4l6-6M8 8l-3 3"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15.5 15.5l3 3m-1.5-4.5a2.12 2.12 0 013 3"
    />
  </svg>
);

const UserIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
    />
  </svg>
);

function generateMatchId(): string {
  return `MATCH-${Date.now().toString(36).toUpperCase()}`;
}

function normalizeDisplayCodeInput(value: string): string {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
}

function isDoubleCategory(type: MatchCategory): boolean {
  return type === 'MD' || type === 'WD' || type === 'XD';
}

type SportType =
  | 'badminton'
  | 'basketball'
  | 'volleyball'
  | 'tennis'
  | 'futsal'
  | 'soccer';
type MatchCategory = 'MS' | 'WS' | 'MD' | 'WD' | 'XD';
type MatchFormat = 'perorangan' | 'beregu';
type TeamMatchRow = {
  home: string;
  homeSecond: string;
  away: string;
  awaySecond: string;
  type: MatchCategory;
};
type FieldErrorKey =
  | 'tournamentName'
  | 'displayCode'
  | 'createPin'
  | 'homePlayers'
  | 'awayPlayers'
  | 'homeRoster'
  | 'awayRoster'
  | 'teamMatches'
  | 'general';

const SPORT_TOGGLES = new Map(
  (sportConfig.sports || []).map((sport) => [sport.id, sport.enabled]),
);
const SPORT_NAMES = new Map(
  (sportConfig.sports || []).map((sport) => [sport.id, sport.name]),
);

const SPORTS = [
  {
    id: 'badminton',
    name: SPORT_NAMES.get('badminton') || 'Badminton',
    icon: BadmintonIcon,
    available: SPORT_TOGGLES.get('badminton') ?? true,
  },
];

const TEMPLATE_DEFAULTS: Record<SportType, string> = {
  badminton: 'modern',
  basketball: 'hoops-classic',
  volleyball: 'volley-clean',
  tennis: 'tennis-scoreline',
  futsal: 'futsal-broadcast',
  soccer: 'soccer-broadcast',
};

const DEFAULT_SPORT =
  (SPORTS.find((sport) => sport.available)?.id as SportType) || 'badminton';

export default function CreateMatchPage() {
  const router = useRouter();
  const createMatchMutation = useMutation(api.matches.createMatch);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Protect Route - Admin Auth Check
  useEffect(() => {
    if (!isAdminAuthenticated()) {
      router.replace('/');
    }
  }, [router]);

  // Create Match State
  const [selectedSport, setSelectedSport] = useState<SportType>(DEFAULT_SPORT);
  const [selectedTemplate, setSelectedTemplate] = useState<string>(
    TEMPLATE_DEFAULTS[DEFAULT_SPORT],
  );
  const [createPin, setCreatePin] = useState('');
  const [adminSessionToken, setAdminSessionToken] = useState('');
  const [tournamentName, setTournamentName] = useState('');
  const [umpireName, setUmpireName] = useState('');
  const [manualDisplayCode, setManualDisplayCode] = useState('');

  const [matchFormat, setMatchFormat] = useState<MatchFormat>('perorangan');
  const [category, setCategory] = useState<MatchCategory>('MS');
  const [teamMatches, setTeamMatches] = useState<TeamMatchRow[]>([
    { home: '', homeSecond: '', away: '', awaySecond: '', type: 'MS' },
  ]);
  const [homeRoster, setHomeRoster] = useState(['', '', '', '']);
  const [awayRoster, setAwayRoster] = useState(['', '', '', '']);

  const isBadminton = selectedSport === 'badminton';
  // Computed gameMode based on category
  const activeCategory =
    matchFormat === 'perorangan' ? category : (teamMatches[0]?.type ?? 'MS');
  const gameMode =
    isBadminton && ['MD', 'WD', 'XD'].includes(activeCategory)
      ? 'double'
      : 'single';

  const [homePlayers, setHomePlayers] = useState(['', '']);
  const [awayPlayers, setAwayPlayers] = useState(['', '']);
  const [homeTeam, setHomeTeam] = useState(''); // Club name
  const [awayTeam, setAwayTeam] = useState(''); // Club name
  const [homeCountry, setHomeCountry] = useState('');
  const [awayCountry, setAwayCountry] = useState('');
  const [homeLogo, setHomeLogo] = useState('');
  const [awayLogo, setAwayLogo] = useState('');
  const [createdMatch, setCreatedMatch] = useState<{
    matchId: string;
    displayCode: string;
    refereePin: string;
    refereeToken: string;
    status: string;
  } | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<FieldErrorKey, string>>>({});

  // Theme Logic
  useEffect(() => {
    const saved = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (saved) setTheme(saved);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const session = loadValidAdminSession();
    setAdminSessionToken(session?.token || '');
  }, []);

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');
  const clearFieldError = (key: FieldErrorKey) => {
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };
  const failValidation = (key: FieldErrorKey, message: string) => {
    setFieldErrors((prev) => ({ ...prev, [key]: message }));
    setError(message);
  };

  const refereeControlLink = createdMatch
    ? `${window.location.origin}/match/${createdMatch.matchId}/control?role=referee&token=${encodeURIComponent(createdMatch.refereeToken)}`
    : '';

  // Input Handlers
  const handlePlayerChange = (
    team: 'home' | 'away',
    index: number,
    value: string,
  ) => {
    if (team === 'home') {
      const newPlayers = [...homePlayers];
      newPlayers[index] = value;
      setHomePlayers(newPlayers);
      clearFieldError('homePlayers');
    } else {
      const newPlayers = [...awayPlayers];
      newPlayers[index] = value;
      setAwayPlayers(newPlayers);
      clearFieldError('awayPlayers');
    }
  };

  const handleRosterChange = (
    side: 'home' | 'away',
    index: number,
    value: string,
  ) => {
    if (side === 'home') {
      const next = [...homeRoster];
      next[index] = value;
      setHomeRoster(next);
      clearFieldError('homeRoster');
    } else {
      const next = [...awayRoster];
      next[index] = value;
      setAwayRoster(next);
      clearFieldError('awayRoster');
    }
  };

  const addRosterMember = (side: 'home' | 'away') => {
    if (side === 'home') {
      setHomeRoster([...homeRoster, '']);
    } else {
      setAwayRoster([...awayRoster, '']);
    }
  };

  const removeRosterMember = (side: 'home' | 'away', index: number) => {
    if (side === 'home') {
      if (homeRoster.length <= 1) return;
      setHomeRoster(homeRoster.filter((_, i) => i !== index));
    } else {
      if (awayRoster.length <= 1) return;
      setAwayRoster(awayRoster.filter((_, i) => i !== index));
    }
  };

  const handleTeamMatchChange = (
    index: number,
    key: keyof TeamMatchRow,
    value: string,
  ) => {
    setTeamMatches((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              [key]: value,
            }
          : item,
      ),
    );
    clearFieldError('teamMatches');
  };

  const addTeamMatch = () => {
    setTeamMatches((prev) => [
      ...prev,
      { home: '', homeSecond: '', away: '', awaySecond: '', type: 'MS' },
    ]);
  };

  const removeTeamMatch = (index: number) => {
    setTeamMatches((prev) =>
      prev.length <= 1 ? prev : prev.filter((_, i) => i !== index),
    );
  };

  const cleanHomeRosterOptions = Array.from(
    new Set(homeRoster.map((name) => name.trim()).filter(Boolean)),
  );
  const cleanAwayRosterOptions = Array.from(
    new Set(awayRoster.map((name) => name.trim()).filter(Boolean)),
  );

  const buildRosterSelectOptions = (
    rosterOptions: string[],
    currentValue: string,
    excludedValue?: string,
  ) => {
    const withCurrent = currentValue && !rosterOptions.includes(currentValue)
      ? [currentValue, ...rosterOptions]
      : rosterOptions;
    const filtered = excludedValue
      ? withCurrent.filter(
          (name) => name !== excludedValue || name === currentValue,
        )
      : withCurrent;
    return Array.from(new Set(filtered));
  };

  const handleCreateMatch = async () => { 
    setFieldErrors({});
    if (!adminSessionToken) { 
      failValidation('general', 'Sesi admin tidak valid. Silakan login ulang.'); 
      return; 
    } 

    if (!createPin || createPin.length < 4) { 
      failValidation('createPin', 'PIN wasit minimal 4 digit.'); 
      return; 
    } 

    if (!tournamentName.trim()) {
      failValidation('tournamentName', 'Nama turnamen wajib diisi.');
      return;
    }

    let finalDisplayCode = undefined;
    if (manualDisplayCode.trim()) {
      finalDisplayCode = normalizeDisplayCodeInput(manualDisplayCode);
      if (finalDisplayCode.length !== 6) {
        failValidation('displayCode', 'Display code manual harus 6 karakter.');
        return;
      }
    }

    // Validation
    if (isBadminton && matchFormat === 'perorangan') {
      const p1Home = homePlayers[0].trim();
      const p1Away = awayPlayers[0].trim();

      if (!p1Home || !p1Away) { 
        failValidation('homePlayers', 'Nama pemain utama wajib diisi untuk kedua sisi.'); 
        return; 
      } 

      if (gameMode === 'double') { 
        if (!homePlayers[1].trim() || !awayPlayers[1].trim()) { 
          failValidation('awayPlayers', 'Nama pemain kedua wajib diisi untuk mode ganda.'); 
          return; 
        } 
      } 
    } else if (!isBadminton) { 
      if (!homeTeam.trim() || !awayTeam.trim()) { 
        setError('Nama tim wajib diisi untuk kedua sisi.'); 
        return; 
      } 
    } else {
      const cleanHomeRoster = homeRoster.map((name) => name.trim()).filter(Boolean);
      const cleanAwayRoster = awayRoster.map((name) => name.trim()).filter(Boolean);
      if (cleanHomeRoster.length === 0 || cleanAwayRoster.length === 0) {
        failValidation('homeRoster', 'Isi minimal 1 anggota tim untuk sisi tuan rumah dan sisi tamu.');
        return;
      }

      const invalidTeamMatch = teamMatches.some(
        (item) =>
          !item.home.trim() ||
          !item.away.trim() ||
          (isDoubleCategory(item.type) &&
            (!item.homeSecond.trim() || !item.awaySecond.trim())),
      );
      if (invalidTeamMatch) {
        failValidation('teamMatches', 'Lengkapi semua pasangan partai beregu (home dan away).');
        return;
      }
    }

    setIsLoading(true);
    setError('');

    const newMatchId = generateMatchId();

    try {
      const cleanHomeRoster = homeRoster.map((name) => name.trim()).filter(Boolean);
      const cleanAwayRoster = awayRoster.map((name) => name.trim()).filter(Boolean);
      const normalizedTeamLineup =
        matchFormat === 'beregu'
          ? teamMatches.map((item) => ({
              home: item.home.trim(),
              homeSecond: item.homeSecond.trim() || undefined,
              away: item.away.trim(),
              awaySecond: item.awaySecond.trim() || undefined,
              type: item.type,
            }))
          : undefined;
      const data = await createMatchMutation({
        matchId: newMatchId,
        sport: selectedSport,
        gameMode: isBadminton ? gameMode : undefined,
        matchFormat: isBadminton ? matchFormat : undefined,
        category: isBadminton ? activeCategory : undefined,
        teamLineup: normalizedTeamLineup,
        displayCode: finalDisplayCode,
        tournamentName: tournamentName.trim(),
        assignedReferee: umpireName.trim() || undefined,
        teams: {
          home: {
            name:
              homeTeam ||
              (matchFormat === 'beregu'
                ? cleanHomeRoster.join(', ')
                : homePlayers[0]) ||
              (isBadminton ? 'Home Player' : 'Home Team'),
            country: homeCountry.trim() || undefined,
            logo: homeLogo.trim() || undefined,
            players: isBadminton
              ? matchFormat === 'beregu'
                ? cleanHomeRoster.map((name) => ({ name }))
                : gameMode === 'single'
                  ? [{ name: homePlayers[0] }]
                  : [{ name: homePlayers[0] }, { name: homePlayers[1] }]
              : [{ name: homeTeam || 'Home Team' }],
          },
          away: {
            name:
              awayTeam ||
              (matchFormat === 'beregu'
                ? cleanAwayRoster.join(', ')
                : awayPlayers[0]) ||
              (isBadminton ? 'Away Player' : 'Away Team'),
            country: awayCountry.trim() || undefined,
            logo: awayLogo.trim() || undefined,
            players: isBadminton
              ? matchFormat === 'beregu'
                ? cleanAwayRoster.map((name) => ({ name }))
                : gameMode === 'single'
                  ? [{ name: awayPlayers[0] }]
                  : [{ name: awayPlayers[0] }, { name: awayPlayers[1] }]
              : [{ name: awayTeam || 'Away Team' }],
          },
        },
        pin: createPin,
        adminSessionToken,
        templateId: selectedTemplate || TEMPLATE_DEFAULTS[selectedSport],
      });

      setCreatedMatch({
        matchId: newMatchId,
        displayCode: (data?.displayCode as string) || '',
        refereePin: createPin,
        refereeToken: (data?.refereeToken as string) || '',
        status: (data?.status as string) || 'ready_for_referee',
      });
    } catch (err: any) { 
      console.error('Failed to create match:', err);
      
      let userFriendlyMsg = 'Gagal membuat pertandingan. Terjadi kesalahan sistem.';
      
      // Extract detailed message if it's a ConvexError
      const rawMessage = err instanceof ConvexError 
        ? (err.data as string) 
        : err.message || '';

      if (rawMessage.includes('Display code already exists')) {
        userFriendlyMsg = 'Kode Display sudah digunakan untuk match lain. Silakan pilih kode lain.';
      } else if (rawMessage) {
        userFriendlyMsg = `Gagal: ${rawMessage}`;
      }

      setError(userFriendlyMsg); 
    } finally { 
      setIsLoading(false); 
    } 
  }; 

  return (
    <div className="min-h-screen bg-background text-foreground font-[family-name:var(--font-literata)] relative overflow-hidden transition-colors duration-300">
      <div className="pointer-events-none absolute -top-40 right-[-10%] h-[480px] w-[520px] rounded-full bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.35),transparent_70%)] blur-3xl opacity-50" />
      <div className="pointer-events-none absolute bottom-[-120px] left-[-10%] h-[360px] w-[420px] rounded-full bg-[radial-gradient(circle_at_center,rgba(17,24,39,0.18),transparent_70%)] blur-3xl opacity-50" />

      {/* Top Bar */}
      <header className="h-16 border-b border-black/10 bg-white/80 backdrop-blur px-4 lg:px-8 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="w-10 h-10 flex items-center justify-center hover:scale-105 transition-transform"
          >
            <Image
              src="/logo-pb.png"
              alt="Scorehub logo"
              width={32}
              height={32}
              className="h-8 w-8 object-contain"
              priority
            />
          </Link>
          <div>
            <h1 className="font-[family-name:var(--font-bebas)] text-sm leading-none uppercase tracking-[0.25em] text-black">
              Scorehub
            </h1>
            <span className="text-xs font-[family-name:var(--font-literata)] text-black/50 uppercase tracking-[0.2em] font-bold">
              Control Suite
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-xs font-bold uppercase tracking-[0.24em] text-muted-foreground">
            Workspace
            <span className="h-1 w-1 rounded-full bg-muted-foreground/60" />
            Arena Ops
          </div>
          <div className="hidden sm:flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs font-bold uppercase tracking-widest text-foreground/80">
            Plan: Studio
          </div>
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="text-xs font-bold uppercase tracking-widest inline-flex"
          >
            <Link href="/guide">Panduan</Link>
          </Button>
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-2 rounded-md hover:bg-muted text-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            type="button"
          >
            <ThemeToggleIcon mode={theme} />
          </button>
        </div>
      </header>

      <main
        id="main-content"
        className="container mx-auto max-w-6xl p-4 lg:p-8"
      >
        {/* Error Banner */}
        {error && (
          <div
            role="status"
            aria-live="polite"
            className="mb-6 p-3 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 text-sm font-bold rounded-lg flex items-center gap-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            {error}
          </div>
        )}

        <section className="mb-8">
          <div className="relative overflow-hidden rounded-2xl border bg-card/80 p-6 lg:p-8">
            <div
              className="pointer-events-none absolute -top-24 right-0 h-64 w-64 rounded-full bg-[radial-gradient(circle_at_center,rgba(239,68,68,0.15),transparent_65%)]"
              aria-hidden="true"
            />
            <div className="relative">
              <div className="text-xs font-bold uppercase tracking-[0.3em] text-muted-foreground">
                Ruang Kerja Arena Anda
              </div>
              <div className="mt-3 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="font-display text-3xl lg:text-4xl font-black tracking-tight text-foreground">
                    Pusat Kontrol Pertandingan
                  </h2>
                  <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                    Mulai pertandingan baru dengan cepat, sinkronkan wasit, dan tayangkan skor standar broadcast dari satu konsol.
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-xl border bg-background/80 px-4 py-3">
                    <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      Aktif
                    </div>
                    <div className="mt-1 text-2xl font-black text-foreground">
                      1
                    </div>
                  </div>
                  <div className="rounded-xl border bg-background/80 px-4 py-3">
                    <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      Layar
                    </div>
                    <div className="mt-1 text-2xl font-black text-foreground">
                      2
                    </div>
                  </div>
                  <div className="rounded-xl border bg-background/80 px-4 py-3">
                    <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      Templat
                    </div>
                    <div className="mt-1 text-2xl font-black text-foreground">
                      4
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section>
            <div className="mb-6">
              <div className="text-xs font-bold uppercase tracking-[0.3em] text-black/50">
                Match Builder
              </div>
              <h2 className="mt-2 text-4xl font-[family-name:var(--font-bebas)] text-black tracking-wide uppercase">
                Mulai Pertandingan
              </h2>
              <p className="text-sm text-black/60 font-medium">
                Atur detail pertandingan badminton Anda di bawah ini.
              </p>
            </div>

            <Card className="p-6 lg:p-8 border border-black/10 shadow-xl bg-white rounded-[32px]">
              {isBadminton ? (
                <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                  <div className="mb-6 rounded-2xl border border-black/10 bg-gradient-to-r from-amber-50 to-white p-4">
                    <div className="flex items-center justify-between gap-2">
                      <label
                        htmlFor="tournament-name"
                        className="text-xs font-bold uppercase tracking-[0.2em] text-black/60"
                      >
                        Nama Turnamen <span className="text-red-500">*</span>
                      </label>
                      <span className="text-xs font-semibold uppercase tracking-wider text-black/40">
                        Wajib diisi
                      </span>
                    </div>
                    <Input
                      id="tournament-name"
                      name="tournamentName"
                      autoComplete="off"
                      placeholder="Contoh: Kejuaraan Kota Jakarta 2026"
                      value={tournamentName}
                      onChange={(event) => {
                        setTournamentName(event.target.value);
                        clearFieldError('tournamentName');
                      }}
                      className="mt-2 h-11 rounded-xl border-black/10 bg-white/90 focus:border-black/30"
                    />
                    <p className={`mt-2 text-xs ${fieldErrors.tournamentName ? 'text-red-600 font-semibold' : 'text-black/45'}`}>
                      {fieldErrors.tournamentName || 'Contoh: Kejurkot / Open Tournament / Internal Club League.'}
                    </p>
                  </div>
                  <div className="mb-6">
                    <div className="bg-black/5 p-1 rounded-xl inline-flex gap-1">
                      {(['perorangan', 'beregu'] as MatchFormat[]).map((format) => (
                        <button
                          key={format}
                          type="button"
                          onClick={() => setMatchFormat(format)}
                          className={`py-2.5 px-5 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors ${
                            matchFormat === format
                              ? 'bg-black text-white shadow-lg shadow-black/20'
                              : 'text-black/50 hover:text-black hover:bg-black/5'
                          }`}
                        >
                          {format}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4 rounded-2xl border border-black/10 bg-black/[0.02] p-4">
                    <div className="md:col-span-2 text-xs font-bold uppercase tracking-[0.2em] text-black/50">
                      Informasi Tim (Ditampilkan di skor)
                    </div>
                    <Input
                      id="home-team"
                      name="homeTeam"
                      autoComplete="organization"
                      placeholder="Nama Klub Tuan Rumah (misal, PB Jaya)"
                      value={homeTeam}
                      onChange={(e) => setHomeTeam(e.target.value)}
                      className="h-10 text-xs bg-white border-black/10 focus:border-black/30 rounded-lg"
                    />
                    <Input
                      id="away-team"
                      name="awayTeam"
                      autoComplete="organization"
                      placeholder="Nama Klub Tamu (misal, PB Maju)"
                      value={awayTeam}
                      onChange={(e) => setAwayTeam(e.target.value)}
                      className="h-10 text-xs bg-white border-black/10 focus:border-black/30 rounded-lg"
                    />
                    <Input
                      id="home-country"
                      name="homeCountry"
                      autoComplete="off"
                      placeholder="Negara Home (misal, ID)"
                      value={homeCountry}
                      onChange={(e) => setHomeCountry(e.target.value)}
                      className="h-10 text-xs bg-white border-black/10 focus:border-black/30 rounded-lg"
                    />
                    <Input
                      id="away-country"
                      name="awayCountry"
                      autoComplete="off"
                      placeholder="Negara Away (misal, TH)"
                      value={awayCountry}
                      onChange={(e) => setAwayCountry(e.target.value)}
                      className="h-10 text-xs bg-white border-black/10 focus:border-black/30 rounded-lg"
                    />
                    <Input
                      id="home-logo"
                      name="homeLogo"
                      autoComplete="off"
                      placeholder="URL Logo Home (opsional)"
                      value={homeLogo}
                      onChange={(e) => setHomeLogo(e.target.value)}
                      className="h-10 text-xs bg-white border-black/10 focus:border-black/30 rounded-lg"
                    />
                    <Input
                      id="away-logo"
                      name="awayLogo"
                      autoComplete="off"
                      placeholder="URL Logo Away (opsional)"
                      value={awayLogo}
                      onChange={(e) => setAwayLogo(e.target.value)}
                      className="h-10 text-xs bg-white border-black/10 focus:border-black/30 rounded-lg"
                    />
                  </div>

                  {matchFormat === 'perorangan' ? (
                    <>
                      <div className="flex justify-center mb-8">
                        <div className="bg-black/5 p-1 rounded-xl flex gap-1 w-full max-w-lg overflow-x-auto">
                          {(['MS', 'WS', 'MD', 'WD', 'XD'] as MatchCategory[]).map(
                            (cat) => (
                              <button
                                key={cat}
                                onClick={() => setCategory(cat)}
                                className={`flex-1 py-3 px-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors transition-shadow min-w-[50px] whitespace-nowrap ${
                                  category === cat
                                    ? 'bg-black text-white shadow-lg shadow-black/20'
                                    : 'text-black/40 hover:text-black hover:bg-black/5'
                                }`}
                              >
                                {cat}
                              </button>
                            ),
                          )}
                        </div>
                      </div>

                      {gameMode === 'double' ? (
                        <div className="mb-6 rounded-2xl border border-dashed border-black/15 bg-black/[0.02] px-4 py-3 text-xs text-black/60">
                          Mode ganda aktif: isi dua pemain untuk masing-masing sisi.
                        </div>
                      ) : null}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 pb-2 border-b">
                            <div className="w-2 h-2 rounded-full bg-[var(--accent-b)]" />
                            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                              Sisi Tuan Rumah
                            </span>
                          </div>
                          <div className="space-y-3">
                            <div className="relative">
                              <label htmlFor="home-player-1" className="sr-only">
                                Pemain tuan rumah 1
                              </label>
                              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                <UserIcon className="w-4 h-4" />
                              </div>
                              <Input
                                id="home-player-1"
                                name="homePlayer1"
                                autoComplete="off"
                                placeholder="Pemain 1 (misal, Andi)..."
                                className="pl-9 h-11 bg-black/5 border-transparent focus:bg-white focus:border-black/20 focus:ring-black/10 transition-[background-color,border-color,box-shadow] rounded-xl"
                                value={homePlayers[0]}
                                onChange={(e) =>
                                  handlePlayerChange('home', 0, e.target.value)
                                }
                              />
                            </div>
                            {gameMode === 'double' && (
                              <div className="relative">
                                <label htmlFor="home-player-2" className="sr-only">
                                  Pemain tuan rumah 2
                                </label>
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                  <UserIcon className="w-4 h-4" />
                                </div>
                                <Input
                                  id="home-player-2"
                                  name="homePlayer2"
                                  autoComplete="off"
                                  placeholder="Pemain 2 (misal, Budi)..."
                                  className="pl-9 h-11 bg-black/5 border-transparent focus:bg-white focus:border-black/20 focus:ring-black/10 transition-[background-color,border-color,box-shadow] rounded-xl"
                                  value={homePlayers[1]}
                                  onChange={(e) =>
                                    handlePlayerChange('home', 1, e.target.value)
                                  }
                                />
                              </div>
                            )}
                          </div>
                          {fieldErrors.homePlayers ? (
                            <p className="text-xs text-red-600 font-semibold">
                              {fieldErrors.homePlayers}
                            </p>
                          ) : null}
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-center gap-2 pb-2 border-b">
                            <div className="w-2 h-2 rounded-full bg-[var(--accent-a)]" />
                            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                              Sisi Tamu
                            </span>
                          </div>
                          <div className="space-y-3">
                            <div className="relative">
                              <label htmlFor="away-player-1" className="sr-only">
                                Pemain tamu 1
                              </label>
                              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                <UserIcon className="w-4 h-4" />
                              </div>
                              <Input
                                id="away-player-1"
                                name="awayPlayer1"
                                autoComplete="off"
                                placeholder="Pemain 1 (misal, Sari)..."
                                className="pl-9 h-11 bg-black/5 border-transparent focus:bg-white focus:border-black/20 focus:ring-black/10 transition-[background-color,border-color,box-shadow] rounded-xl"
                                value={awayPlayers[0]}
                                onChange={(e) =>
                                  handlePlayerChange('away', 0, e.target.value)
                                }
                              />
                            </div>
                            {gameMode === 'double' && (
                              <div className="relative">
                                <label htmlFor="away-player-2" className="sr-only">
                                  Pemain tamu 2
                                </label>
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                  <UserIcon className="w-4 h-4" />
                                </div>
                                <Input
                                  id="away-player-2"
                                  name="awayPlayer2"
                                  autoComplete="off"
                                  placeholder="Pemain 2 (misal, Rina)..."
                                  className="pl-9 h-11 bg-black/5 border-transparent focus:bg-white focus:border-black/20 focus:ring-black/10 transition-[background-color,border-color,box-shadow] rounded-xl"
                                  value={awayPlayers[1]}
                                  onChange={(e) =>
                                    handlePlayerChange('away', 1, e.target.value)
                                  }
                                />
                              </div>
                            )}
                          </div>
                          {fieldErrors.awayPlayers ? (
                            <p className="text-xs text-red-600 font-semibold">
                              {fieldErrors.awayPlayers}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between pb-1">
                            <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                              Roster Sisi Tuan Rumah
                            </div>
                            <button
                              type="button"
                              onClick={() => addRosterMember('home')}
                              className="text-[10px] font-bold uppercase tracking-wider bg-black/5 hover:bg-black/10 text-black/60 px-2 py-1 rounded-md transition-colors"
                            >
                              + Tambah
                            </button>
                          </div>
                          {fieldErrors.homeRoster ? (
                            <p className="text-xs text-red-600 font-semibold">
                              {fieldErrors.homeRoster}
                            </p>
                          ) : null}
                          <div className="space-y-2">
                            {homeRoster.map((member, index) => (
                              <div key={`home-roster-${index}`} className="flex items-center gap-2">
                                <Input
                                  value={member}
                                  onChange={(event) =>
                                    handleRosterChange('home', index, event.target.value)
                                  }
                                  placeholder={`Anggota ${index + 1} (home)`}
                                  className="h-10 bg-black/5 border-transparent focus:bg-white focus:border-black/20 rounded-xl"
                                />
                                {homeRoster.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => removeRosterMember('home', index)}
                                    className="h-10 w-10 flex-shrink-0 flex items-center justify-center text-black/40 hover:text-red-500 transition-colors"
                                    title="Hapus"
                                  >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between pb-1">
                            <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                              Roster Sisi Tamu
                            </div>
                            <button
                              type="button"
                              onClick={() => addRosterMember('away')}
                              className="text-[10px] font-bold uppercase tracking-wider bg-black/5 hover:bg-black/10 text-black/60 px-2 py-1 rounded-md transition-colors"
                            >
                              + Tambah
                            </button>
                          </div>
                          {fieldErrors.awayRoster ? (
                            <p className="text-xs text-red-600 font-semibold">
                              {fieldErrors.awayRoster}
                            </p>
                          ) : null}
                          <div className="space-y-2">
                            {awayRoster.map((member, index) => (
                              <div key={`away-roster-${index}`} className="flex items-center gap-2">
                                <Input
                                  key={`away-roster-${index}`}
                                  value={member}
                                  onChange={(event) =>
                                    handleRosterChange('away', index, event.target.value)
                                  }
                                  placeholder={`Anggota ${index + 1} (away)`}
                                  className="h-10 bg-black/5 border-transparent focus:bg-white focus:border-black/20 rounded-xl"
                                />
                                {awayRoster.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => removeRosterMember('away', index)}
                                    className="h-10 w-10 flex-shrink-0 flex items-center justify-center text-black/40 hover:text-red-500 transition-colors"
                                    title="Hapus"
                                  >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-black/10 pt-5 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                            Susunan Partai Beregu
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={addTeamMatch}
                            className="h-9 rounded-full text-xs uppercase tracking-widest font-bold"
                          >
                            Tambah Partai
                          </Button>
                        </div>
                        {fieldErrors.teamMatches ? (
                          <p className="text-xs text-red-600 font-semibold">
                            {fieldErrors.teamMatches}
                          </p>
                        ) : null}

                        {teamMatches.map((item, index) => (
                          <div
                            key={`team-match-${index}`}
                            className="rounded-2xl border border-black/10 p-4 space-y-3"
                          >
                            <div className="flex items-center justify-between">
                              <div className="text-xs font-bold uppercase tracking-widest text-black/50">
                                Partai {index + 1}
                              </div>
                              {teamMatches.length > 1 ? (
                                <button
                                  type="button"
                                  onClick={() => removeTeamMatch(index)}
                                  className="text-xs font-bold uppercase tracking-widest text-red-600 hover:text-red-700"
                                >
                                  Hapus
                                </button>
                              ) : null}
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_auto] gap-3 items-start">
                              <div className="space-y-2">
                                <Select
                                  value={item.home || undefined}
                                  onValueChange={(value) =>
                                    handleTeamMatchChange(index, 'home', value)
                                  }
                                >
                                  <SelectTrigger className="h-10 w-full bg-black/5 border-transparent focus:bg-white focus:border-black/20 rounded-xl">
                                    <SelectValue
                                      placeholder={
                                        isDoubleCategory(item.type)
                                          ? 'Pilih pemain home 1'
                                          : 'Pilih pemain home'
                                      }
                                    />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {buildRosterSelectOptions(
                                      cleanHomeRosterOptions,
                                      item.home,
                                    ).map((playerName) => (
                                      <SelectItem
                                        key={`home-${index}-${playerName}`}
                                        value={playerName}
                                      >
                                        {playerName}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                {isDoubleCategory(item.type) ? (
                                  <Select
                                    value={item.homeSecond || undefined}
                                    onValueChange={(value) =>
                                      handleTeamMatchChange(
                                        index,
                                        'homeSecond',
                                        value,
                                      )
                                    }
                                  >
                                    <SelectTrigger className="h-10 w-full bg-black/5 border-transparent focus:bg-white focus:border-black/20 rounded-xl">
                                      <SelectValue placeholder="Pilih pemain home 2" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {buildRosterSelectOptions(
                                        cleanHomeRosterOptions,
                                        item.homeSecond,
                                        item.home,
                                      ).map((playerName) => (
                                        <SelectItem
                                          key={`home-second-${index}-${playerName}`}
                                          value={playerName}
                                        >
                                          {playerName}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                ) : null}
                              </div>
                              <div className="space-y-2">
                                <Select
                                  value={item.away || undefined}
                                  onValueChange={(value) =>
                                    handleTeamMatchChange(index, 'away', value)
                                  }
                                >
                                  <SelectTrigger className="h-10 w-full bg-black/5 border-transparent focus:bg-white focus:border-black/20 rounded-xl">
                                    <SelectValue
                                      placeholder={
                                        isDoubleCategory(item.type)
                                          ? 'Pilih pemain away 1'
                                          : 'Pilih pemain away'
                                      }
                                    />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {buildRosterSelectOptions(
                                      cleanAwayRosterOptions,
                                      item.away,
                                    ).map((playerName) => (
                                      <SelectItem
                                        key={`away-${index}-${playerName}`}
                                        value={playerName}
                                      >
                                        {playerName}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                {isDoubleCategory(item.type) ? (
                                  <Select
                                    value={item.awaySecond || undefined}
                                    onValueChange={(value) =>
                                      handleTeamMatchChange(
                                        index,
                                        'awaySecond',
                                        value,
                                      )
                                    }
                                  >
                                    <SelectTrigger className="h-10 w-full bg-black/5 border-transparent focus:bg-white focus:border-black/20 rounded-xl">
                                      <SelectValue placeholder="Pilih pemain away 2" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {buildRosterSelectOptions(
                                        cleanAwayRosterOptions,
                                        item.awaySecond,
                                        item.away,
                                      ).map((playerName) => (
                                        <SelectItem
                                          key={`away-second-${index}-${playerName}`}
                                          value={playerName}
                                        >
                                          {playerName}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                ) : null}
                              </div>
                              <div className="bg-black/5 p-1 rounded-xl flex gap-1 flex-wrap">
                                {(
                                  ['MS', 'WS', 'MD', 'WD', 'XD'] as MatchCategory[]
                                ).map((cat) => (
                                  <button
                                    key={`${index}-${cat}`}
                                    type="button"
                                    onClick={() =>
                                      handleTeamMatchChange(index, 'type', cat)
                                    }
                                    className={`h-8 px-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors ${
                                      item.type === cat
                                        ? 'bg-black text-white'
                                        : 'text-black/50 hover:bg-black/10'
                                    }`}
                                  >
                                    {cat}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                  )}

                  <div className="mt-8 rounded-3xl border border-black/10 bg-[linear-gradient(180deg,rgba(17,24,39,0.03),rgba(255,255,255,0.9))] p-5 lg:p-6">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="text-xs font-bold uppercase tracking-[0.3em] text-black/50">
                          Akses Wasit & Umpire
                        </div>
                        <p className="mt-1 text-sm text-black/60">
                          Link kontrol akan mengarah langsung ke control panel wasit.
                        </p>
                      </div>
                      <span className="inline-flex items-center rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-black/50">
                        Direct control
                      </span>
                    </div>

                    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 xl:gap-8">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <label
                            htmlFor="umpire-name"
                            className="text-xs font-bold uppercase tracking-widest text-black/50"
                          >
                            Nama Umpire
                          </label>
                          <span className="text-xs font-semibold uppercase tracking-widest text-black/35">
                            Opsional
                          </span>
                        </div>
                        <Input
                          id="umpire-name"
                          name="umpireName"
                          autoComplete="name"
                          placeholder="Nama umpire / wasit"
                          value={umpireName}
                          onChange={(e) => setUmpireName(e.target.value)}
                          className="h-11 rounded-xl bg-white border-black/10 focus:border-black/30"
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <label 
                            htmlFor="display-code" 
                            className="text-xs font-bold uppercase tracking-widest text-black/50" 
                          > 
                            Kode Tampilan 
                          </label> 
                          <span className="text-xs font-semibold uppercase tracking-widest text-black/35">
                            Opsional
                          </span>
                        </div>
                        <Input
                          id="display-code"
                          name="displayCode"
                          autoComplete="off"
                          placeholder="A1B2C3"
                          value={manualDisplayCode}
                          onChange={(e) => {
                            setManualDisplayCode(
                              normalizeDisplayCodeInput(e.target.value),
                            );
                            clearFieldError('displayCode');
                          }}
                          className={`h-11 rounded-xl font-mono tracking-[0.45em] text-center uppercase bg-white focus:border-black/30 ${
                            fieldErrors.displayCode ? 'border-red-500 focus:border-red-500' : 'border-black/10'
                          }`}
                        />
                        <p className={`text-xs ${fieldErrors.displayCode ? 'text-red-600 font-semibold' : 'text-black/45'}`}>
                          {fieldErrors.displayCode || `Kosongkan untuk generate otomatis. Saat ini: ${manualDisplayCode.length}/6`}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <label
                            htmlFor="create-pin-team"
                            className="text-xs font-bold uppercase tracking-widest text-black/50"
                          >
                            PIN Wasit
                            <span className="text-red-500"> *</span>
                          </label>
                          <span className="text-xs font-semibold uppercase tracking-widest text-black/35">
                            Wajib
                          </span>
                        </div>
                        <Input
                          id="create-pin-team"
                          name="createPin"
                          autoComplete="new-password"
                          placeholder="1234"
                          type="number"
                          pattern="[0-9]*"
                          inputMode="numeric"
                          maxLength={6}
                          className="h-11 rounded-xl text-center font-mono tracking-[0.5em] bg-white border-black/10 focus:border-black/30"
                          value={createPin}
                          onChange={(e) => {
                            setCreatePin(
                              e.target.value.replace(/\D/g, '').slice(0, 6),
                            );
                            clearFieldError('createPin');
                          }}
                        />
                        <p className={`text-xs ${fieldErrors.createPin ? 'text-red-600 font-semibold' : 'text-black/45'}`}>
                          {fieldErrors.createPin || `PIN 4-6 digit. Saat ini: ${createPin.length} digit`}
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 grid gap-4 md:grid-cols-2">
                      <div className="rounded-2xl border border-black/10 bg-white/90 p-4 text-xs text-black/60">
                        <div className="font-bold uppercase tracking-widest text-black/50">
                          Yang wajib diisi
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <span className="rounded-full bg-black px-2.5 py-1 text-xs font-bold uppercase tracking-widest text-white">
                            Turnamen
                          </span>
                          <span className="rounded-full border border-black/20 px-2.5 py-1 text-xs font-bold uppercase tracking-widest text-black/60"> 
                            Kode Tampilan (Opsional) 
                          </span> 
                          <span className="rounded-full bg-black px-2.5 py-1 text-xs font-bold uppercase tracking-widest text-white">
                            PIN Wasit
                          </span>
                        </div>
                      </div>
                      <div className="rounded-2xl border border-dashed border-black/15 bg-black/[0.02] p-4 text-xs text-black/55">
                        Setelah dibuat, klik link kontrol wasit untuk masuk tanpa input ulang.
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <div className="w-full sm:w-auto">
                      <Button
                        onClick={handleCreateMatch}
                        disabled={isLoading}
                        className="w-full sm:w-auto h-12 px-8 text-base font-bold bg-[#111827] hover:bg-black text-white shadow-xl shadow-black/20 transition-[box-shadow,background-color,color] rounded-full uppercase tracking-widest"
                      >
                        {isLoading ? (
                          <span className="flex items-center gap-2">
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Membuat Pertandingan...
                          </span>
                        ) : (
                          'Mulai Pertandingan'
                        )}
                      </Button>
                      {fieldErrors.general ? (
                        <p className="mt-2 text-xs text-red-600 font-semibold text-right">
                          {fieldErrors.general}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 pb-2 border-b">
                        <div className="w-2 h-2 rounded-full bg-[var(--accent-b)]" />{' '}
                        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                          Tim Tuan Rumah
                        </span>
                      </div>
                      <Input
                        id="home-team-primary"
                        name="homeTeamPrimary"
                        autoComplete="organization"
                        placeholder="Tim Tuan Rumah (misal, Tigers)"
                        className="h-11 bg-secondary/50 border-transparent focus:bg-background focus:border-border transition-colors"
                        value={homeTeam}
                        onChange={(e) => setHomeTeam(e.target.value)}
                      />
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 pb-2 border-b">
                        <div className="w-2 h-2 rounded-full bg-[var(--accent-a)]" />{' '}
                        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                          Tim Tamu
                        </span>
                      </div>
                      <Input
                        id="away-team-primary"
                        name="awayTeamPrimary"
                        autoComplete="organization"
                        placeholder="Tim Tamu (misal, Falcons)"
                        className="h-11 bg-secondary/50 border-transparent focus:bg-background focus:border-border transition-colors"
                        value={awayTeam}
                        onChange={(e) => setAwayTeam(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <label htmlFor="home-country-primary" className="sr-only">
                        Kode negara tuan rumah
                      </label>
                      <Input
                        id="home-country-primary"
                        name="homeCountryPrimary"
                        autoComplete="off"
                        placeholder="Negara Tuan Rumah (misal, ID)..."
                        className="h-10 bg-secondary/50 border-transparent focus:bg-background focus:border-border transition-colors"
                        value={homeCountry}
                        onChange={(e) => setHomeCountry(e.target.value)}
                      />
                      <label htmlFor="home-logo-primary" className="sr-only">
                        URL logo tuan rumah
                      </label>
                      <Input
                        id="home-logo-primary"
                        name="homeLogoPrimary"
                        autoComplete="off"
                        placeholder="URL Logo Tuan Rumah (opsional)..."
                        className="h-10 bg-secondary/50 border-transparent focus:bg-background focus:border-border transition-colors"
                        value={homeLogo}
                        onChange={(e) => setHomeLogo(e.target.value)}
                      />
                    </div>
                    <div className="space-y-3">
                      <label htmlFor="away-country-primary" className="sr-only">
                        Kode negara tamu
                      </label>
                      <Input
                        id="away-country-primary"
                        name="awayCountryPrimary"
                        autoComplete="off"
                        placeholder="Negara Tamu (misal, TH)..."
                        className="h-10 bg-secondary/50 border-transparent focus:bg-background focus:border-border transition-colors"
                        value={awayCountry}
                        onChange={(e) => setAwayCountry(e.target.value)}
                      />
                      <label htmlFor="away-logo-primary" className="sr-only">
                        URL logo tamu
                      </label>
                      <Input
                        id="away-logo-primary"
                        name="awayLogoPrimary"
                        autoComplete="off"
                        placeholder="URL Logo Tamu (opsional)..."
                        className="h-10 bg-secondary/50 border-transparent focus:bg-background focus:border-border transition-colors"
                        value={awayLogo}
                        onChange={(e) => setAwayLogo(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="mt-8 pt-8 border-t grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6 items-end">
                    <div>
                      <label
                        htmlFor="create-pin"
                        className="text-xs font-bold uppercase text-muted-foreground mb-2 block tracking-widest"
                      >
                        Tentukan PIN Wasit
                      </label>
                      <Input
                        id="create-pin"
                        name="createPin"
                        autoComplete="new-password"
                        placeholder="PIN (misal, 1234)..."
                        type="number"
                        pattern="[0-9]*"
                        inputMode="numeric"
                        maxLength={6}
                        className="text-center font-mono tracking-[0.5em] h-12 text-lg bg-secondary/30 focus:bg-background transition-colors"
                        value={createPin}
                        onChange={(e) =>
                          setCreatePin(
                            e.target.value.replace(/\D/g, '').slice(0, 6),
                          )
                        }
                      />
                    </div>
                    <Button
                      onClick={handleCreateMatch}
                      disabled={isLoading}
                      className="w-full h-12 text-base font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl shadow-primary/20 transition-[box-shadow,background-color,color]"
                    >
                      {isLoading ? (
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Membuat Pertandingan...
                        </span>
                      ) : (
                        'Mulai Pertandingan'
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </Card>
        </section>
      </main>

      <Dialog
        open={Boolean(createdMatch)}
        onOpenChange={(open) => {
          if (!open) setCreatedMatch(null);
        }}
      >
        <DialogContent className="sm:max-w-2xl rounded-3xl border-black/10">
          <DialogHeader>
            <DialogTitle className="text-2xl font-[family-name:var(--font-bebas)] uppercase tracking-[0.08em]">
              Pertandingan Berhasil Dibuat
            </DialogTitle>
            <DialogDescription className="text-black/60">
              Bagikan link kontrol wasit langsung. Umpire bisa masuk tanpa isi form lagi.
            </DialogDescription>
          </DialogHeader>

          {createdMatch ? (
            <div className="grid gap-4 sm:grid-cols-3 text-sm">
              <div className="rounded-xl border border-black/10 bg-black/5 p-3">
                <div className="text-xs uppercase tracking-widest text-black/50 font-bold">
                  Match ID
                </div>
                <div className="mt-1 font-mono font-bold">{createdMatch.matchId}</div>
              </div>
              <div className="rounded-xl border border-black/10 bg-black/5 p-3"> 
                <div className="text-xs uppercase tracking-widest text-black/50 font-bold"> 
                  Kode Tampilan 
                </div> 
                <div className="mt-1 font-mono font-bold">{createdMatch.displayCode}</div> 
              </div> 
              <div className="rounded-xl border border-black/10 bg-black/5 p-3"> 
                <div className="text-xs uppercase tracking-widest text-black/50 font-bold"> 
                  PIN Wasit 
                </div> 
                <div className="mt-1 font-mono font-bold">{createdMatch.refereePin}</div> 
              </div> 
            </div>
          ) : null}

          <div className="grid gap-2 sm:grid-cols-3">
            <Button
              type="button"
              variant="outline"
              className="rounded-full text-xs uppercase tracking-widest font-bold px-1"
              onClick={() => {
                if (!createdMatch) return;
                const directAutoJoinLink = `${window.location.origin}/referee/join?code=${createdMatch.displayCode}&pin=${createdMatch.refereePin}`;
                navigator.clipboard.writeText(directAutoJoinLink);
              }}
            >
              Salin Link Kontrol
            </Button>
            <Button
              type="button"
              variant="outline"
              className="rounded-full text-xs uppercase tracking-widest font-bold px-1"
              onClick={() => {
                if (!createdMatch) return;
                const link = `${window.location.origin}/display/${createdMatch.displayCode}`;
                navigator.clipboard.writeText(link);
              }}
            >
              Salin Link Layar
            </Button>
            <Button
              type="button"
              variant="outline"
              className="rounded-full text-xs uppercase tracking-widest font-bold px-1"
              onClick={() => {
                if (!createdMatch || !refereeControlLink) return;
                const directAutoJoinLink = `${window.location.origin}/referee/join?code=${createdMatch.displayCode}&pin=${createdMatch.refereePin}`;
                const message = `Akses Wasit\n\nNama Turnamen: ${tournamentName.trim()}\nKode Tampilan: ${createdMatch.displayCode}\nPIN: ${createdMatch.refereePin}\n\nLink Kontrol Wasit (Auto-Login):\n${directAutoJoinLink}\n\nLink Display:\n${window.location.origin}/display/${createdMatch.displayCode}`;
                const waUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
                window.open(waUrl, '_blank', 'noopener,noreferrer');
              }}
            >
              WhatsApp
            </Button>
          </div>

          <DialogFooter className="sm:justify-between gap-2">
            <Button
              type="button"
              variant="ghost"
              className="text-xs uppercase tracking-widest font-bold"
              onClick={() => {
                if (!createdMatch) return;
                router.push(`/admin/matches/${createdMatch.matchId}/control`);
                setCreatedMatch(null);
              }}
            >
              Buka Kontrol Admin
            </Button>
            <Button
              type="button"
              className="rounded-full bg-[#111827] hover:bg-black text-white text-xs uppercase tracking-widest font-bold"
              onClick={() => {
                router.push('/admin');
                setCreatedMatch(null);
              }}
            >
              Ke Dashboard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}



