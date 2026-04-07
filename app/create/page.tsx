'use client';

import { useState, useEffect } from 'react';
import { useMutation } from 'convex/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import sportConfig from '@/config/sports.json';
import { cn } from '@/lib/utils';
import { api } from '@/convex/_generated/api';
import { ADMIN_AUTH_STORAGE_KEY, isAdminAuthenticated } from '@/lib/auth';

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

const ChevronDownIcon = ({ className }: { className?: string }) => (
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
      d="M19 9l-7 7-7-7"
    />
  </svg>
);

function generateMatchId(): string {
  return `MATCH-${Date.now().toString(36).toUpperCase()}`;
}

type SportType =
  | 'badminton'
  | 'basketball'
  | 'volleyball'
  | 'tennis'
  | 'futsal'
  | 'soccer';

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

type TemplateOption = {
  id: string;
  name: string;
  description: string;
  accent: string;
};

const TEMPLATE_OPTIONS: Record<SportType, TemplateOption[]> = {
  badminton: [
    {
      id: 'modern',
      name: 'Modern',
      description: 'Broadcast grid with set columns.',
      accent: '#fbbf24',
    },
    {
      id: 'classic',
      name: 'Classic',
      description: 'Straight scoreboard with set rows.',
      accent: '#22c55e',
    },
    {
      id: 'minimal',
      name: 'Minimal',
      description: 'Big score focus, clean typography.',
      accent: '#60a5fa',
    },
    {
      id: 'neon',
      name: 'Neon',
      description: 'High contrast, esports glow.',
      accent: '#f472b6',
    },
  ],
  basketball: [
    {
      id: 'hoops-classic',
      name: 'Hoops Classic',
      description: 'Score + quarter breakdown.',
      accent: '#f97316',
    },
    {
      id: 'hoops-led',
      name: 'Hoops LED',
      description: 'Arena style LED scoreboard.',
      accent: '#ef4444',
    },
  ],
  volleyball: [
    {
      id: 'volley-clean',
      name: 'Volley Clean',
      description: 'Set tracker with bold totals.',
      accent: '#38bdf8',
    },
    {
      id: 'volley-led',
      name: 'Volley LED',
      description: 'LED strips and set chips.',
      accent: '#22d3ee',
    },
  ],
  tennis: [
    {
      id: 'tennis-scoreline',
      name: 'Scoreline',
      description: 'Games + points stack.',
      accent: '#34d399',
    },
    {
      id: 'tennis-minimal',
      name: 'Minimal',
      description: 'Clean court-ready view.',
      accent: '#a3e635',
    },
  ],
  futsal: [
    {
      id: 'futsal-broadcast',
      name: 'Broadcast',
      description: 'Wide layout for big screens.',
      accent: '#f59e0b',
    },
    {
      id: 'futsal-minimal',
      name: 'Minimal',
      description: 'Compact scoreboard layout.',
      accent: '#fb7185',
    },
  ],
  soccer: [
    {
      id: 'soccer-broadcast',
      name: 'Broadcast',
      description: 'Full match HUD layout.',
      accent: '#84cc16',
    },
    {
      id: 'soccer-minimal',
      name: 'Minimal',
      description: 'Simple score focus.',
      accent: '#0ea5e9',
    },
  ],
};

const DEFAULT_SPORT =
  (SPORTS.find((sport) => sport.available)?.id as SportType) || 'badminton';

export default function CreateMatchPage() {
  const router = useRouter();
  const createMatchMutation = useMutation(api.matches.createMatch);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Quick Access State
  const [displayCodeInput, setDisplayCodeInput] = useState('');

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
  const [adminPin, setAdminPin] = useState('');

  // Category logic replaces simple gameMode toggle
  type MatchCategory = 'MS' | 'WS' | 'MD' | 'WD' | 'XD';
  const [category, setCategory] = useState<MatchCategory>('MS');

  const isBadminton = selectedSport === 'badminton';
  // Computed gameMode based on category
  const gameMode =
    isBadminton && ['MD', 'WD', 'XD'].includes(category) ? 'double' : 'single';

  const [homePlayers, setHomePlayers] = useState(['', '']);
  const [awayPlayers, setAwayPlayers] = useState(['', '']);
  const [homeTeam, setHomeTeam] = useState(''); // Club name
  const [awayTeam, setAwayTeam] = useState(''); // Club name
  const [homeCountry, setHomeCountry] = useState('');
  const [awayCountry, setAwayCountry] = useState('');
  const [homeLogo, setHomeLogo] = useState('');
  const [awayLogo, setAwayLogo] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [createdMatch, setCreatedMatch] = useState<{
    matchId: string;
    displayCode: string;
    refereePin: string;
    status: string;
  } | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const canJoinDisplay = displayCodeInput.trim().length >= 4;
  const canJoinReferee = displayCodeInput.trim().length >= 4;
  const templateOptions = TEMPLATE_OPTIONS[selectedSport] || [];

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
    const options = TEMPLATE_OPTIONS[selectedSport] || [];
    const fallback = TEMPLATE_DEFAULTS[selectedSport] || 'modern';
    if (!options.some((option) => option.id === selectedTemplate)) {
      setSelectedTemplate(fallback);
    }
  }, [selectedSport, selectedTemplate]);

  useEffect(() => {
    const raw = localStorage.getItem(ADMIN_AUTH_STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed?.pin) {
          setAdminPin(parsed.pin);
          return;
        }
      } catch {
        // Ignore malformed local storage payload.
      }
    }
    if (process.env.NEXT_PUBLIC_ADMIN_PIN) {
      setAdminPin(process.env.NEXT_PUBLIC_ADMIN_PIN);
    }
  }, []);

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

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
    } else {
      const newPlayers = [...awayPlayers];
      newPlayers[index] = value;
      setAwayPlayers(newPlayers);
    }
  };

  const handleCreateMatch = async () => {
    if (!adminPin || adminPin.length < 4) {
      setError('Admin PIN required. Set admin auth first.');
      return;
    }

    if (!createPin || createPin.length < 4) {
      setError('PIN must be at least 4 digits');
      return;
    }

    // Validation
    if (isBadminton) {
      const p1Home = homePlayers[0].trim();
      const p1Away = awayPlayers[0].trim();

      if (!p1Home || !p1Away) {
        setError('Player 1 name is required for both sides');
        return;
      }

      if (gameMode === 'double') {
        if (!homePlayers[1].trim() || !awayPlayers[1].trim()) {
          setError('Player 2 name is required for doubles');
          return;
        }
      }
    } else {
      if (!homeTeam.trim() || !awayTeam.trim()) {
        setError('Team name is required for both sides');
        return;
      }
    }

    setIsLoading(true);
    setError('');

    const newMatchId = generateMatchId();

    try {
      const data = await createMatchMutation({
        matchId: newMatchId,
        sport: selectedSport,
        gameMode: isBadminton ? gameMode : undefined,
        category: isBadminton ? category : undefined,
        teams: {
          home: {
            name:
              homeTeam ||
              homePlayers[0] ||
              (isBadminton ? 'Home Player' : 'Home Team'),
            country: homeCountry.trim() || undefined,
            logo: homeLogo.trim() || undefined,
            players: isBadminton
              ? gameMode === 'single'
                ? [{ name: homePlayers[0] }]
                : [{ name: homePlayers[0] }, { name: homePlayers[1] }]
              : [{ name: homeTeam || 'Home Team' }],
          },
          away: {
            name:
              awayTeam ||
              awayPlayers[0] ||
              (isBadminton ? 'Away Player' : 'Away Team'),
            country: awayCountry.trim() || undefined,
            logo: awayLogo.trim() || undefined,
            players: isBadminton
              ? gameMode === 'single'
                ? [{ name: awayPlayers[0] }]
                : [{ name: awayPlayers[0] }, { name: awayPlayers[1] }]
              : [{ name: awayTeam || 'Away Team' }],
          },
        },
        pin: createPin,
        adminPin,
        templateId: selectedTemplate || TEMPLATE_DEFAULTS[selectedSport],
      });

      localStorage.setItem(
        ADMIN_AUTH_STORAGE_KEY,
        JSON.stringify({ pin: adminPin, ts: Date.now() }),
      );
      setDisplayCodeInput((data?.displayCode as string) || '');
      setCreatedMatch({
        matchId: newMatchId,
        displayCode: (data?.displayCode as string) || '',
        refereePin: createPin,
        status: (data?.status as string) || 'ready_for_referee',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create match');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinMatch = (role: 'referee' | 'display') => {
    const code = displayCodeInput.trim().toUpperCase();
    if (!code) {
      setError('Please enter Display Code');
      return;
    }

    if (role === 'referee') {
      router.push(`/referee/join?code=${encodeURIComponent(code)}`);
    } else {
      router.push(`/display/${encodeURIComponent(code)}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#111827] font-[family-name:var(--font-literata)] relative overflow-hidden transition-colors duration-300">
      <div className="pointer-events-none absolute -top-40 right-[-10%] h-[480px] w-[520px] rounded-full bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.35),transparent_70%)] blur-3xl opacity-50" />
      <div className="pointer-events-none absolute bottom-[-120px] left-[-10%] h-[360px] w-[420px] rounded-full bg-[radial-gradient(circle_at_center,rgba(17,24,39,0.18),transparent_70%)] blur-3xl opacity-50" />
      <div className="pointer-events-none absolute left-1/2 top-24 h-[380px] w-[900px] -translate-x-1/2 border border-black/10 bg-[linear-gradient(120deg,rgba(0,0,0,0.04),transparent)] opacity-70" />
      {/* Top Bar */}
      <header className="h-16 border-b border-black/10 bg-white/80 backdrop-blur px-4 lg:px-8 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="w-10 h-10 rounded-xl bg-[#111827] text-[#F59E0B] flex items-center justify-center hover:scale-105 transition-transform"
          >
            <Image
              src="/scorehub-logo.svg"
              alt="Scorehub logo"
              width={20}
              height={20}
              className="h-5 w-5"
              priority
            />
          </Link>
          <div>
            <h1 className="font-[family-name:var(--font-bebas)] text-sm leading-none uppercase tracking-[0.25em] text-black">
              Scorehub
            </h1>
            <span className="text-[10px] font-[family-name:var(--font-literata)] text-black/50 uppercase tracking-[0.2em] font-bold">
              Control Suite
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.24em] text-muted-foreground">
            Workspace
            <span className="h-1 w-1 rounded-full bg-muted-foreground/60" />
            Arena Ops
          </div>
          <div className="hidden sm:flex items-center gap-2 rounded-full border border-border px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-foreground/80">
            Plan: Studio
          </div>
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="text-xs font-bold uppercase tracking-widest hidden sm:flex"
          >
            <Link href="/docs">Panduan</Link>
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
              <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
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
                    <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      Aktif
                    </div>
                    <div className="mt-1 text-2xl font-black text-foreground">
                      1
                    </div>
                  </div>
                  <div className="rounded-xl border bg-background/80 px-4 py-3">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      Layar
                    </div>
                    <div className="mt-1 text-2xl font-black text-foreground">
                      2
                    </div>
                  </div>
                  <div className="rounded-xl border bg-background/80 px-4 py-3">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
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

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
          {/* Primary Column: Create Match (Embedded) */}
          <section>
            <div className="mb-6">
              <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-black/50">
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
              {/* Template Gallery */}
              <div className="mb-10">
                <label className="text-[10px] font-bold uppercase text-muted-foreground mb-3 block tracking-widest">
                  Templat Tampilan
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {templateOptions.map((template) => {
                    const isSelected = selectedTemplate === template.id;
                    return (
                      <button
                        key={template.id}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => setSelectedTemplate(template.id)}
                        className={cn(
                          'group rounded-3xl border p-4 text-left transition-[transform,border-color,box-shadow,background-color] duration-300',
                          isSelected
                            ? 'bg-black text-white border-black shadow-xl scale-[1.01]'
                            : 'bg-white border-black/10 hover:border-black/30 hover:bg-black/5',
                        )}
                        style={
                          isSelected
                            ? {
                                boxShadow: `0 16px 32px ${template.accent}33`,
                              }
                            : undefined
                        }
                      >
                        <div className="flex items-center justify-between">
                          <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                            Templat
                          </div>
                          <span className="text-[10px] font-mono font-bold uppercase text-muted-foreground">
                            {template.id}
                          </span>
                        </div>
                        <div className="mt-3 rounded-2xl border border-black/5 bg-black/5 p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="h-2 w-12 rounded-full bg-black/40"></div>
                            <div className="h-2 w-8 rounded-full bg-black/20"></div>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="rounded-xl border border-black/10 bg-white/70 p-3">
                              <div className="h-2 w-14 rounded-full bg-black/20 mb-3"></div>
                              <div
                                className="h-8 rounded-lg"
                                style={{ backgroundColor: template.accent }}
                              ></div>
                            </div>
                            <div className="rounded-xl border border-black/10 bg-white/70 p-3">
                              <div className="h-2 w-14 rounded-full bg-black/20 mb-3"></div>
                              <div className="h-8 rounded-lg bg-black/80"></div>
                            </div>
                          </div>
                        </div>
                        <div className="mt-4">
                          <h3 className="text-sm font-bold uppercase tracking-wider">
                            {template.name}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-1">
                            {template.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {isBadminton ? (
                <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                  {/* Category Toggle */}
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

                  {/* Player Inputs - Tournament Style */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                    {/* Home Side */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 pb-2 border-b">
                        <div className="w-2 h-2 rounded-full bg-[var(--accent-b)]" />{' '}
                        {/* Red marker */}
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
                            placeholder="Pemain 1 (misal, Andi)…"
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
                              placeholder="Pemain 2 (misal, Budi)…"
                              className="pl-9 h-11 bg-black/5 border-transparent focus:bg-white focus:border-black/20 focus:ring-black/10 transition-[background-color,border-color,box-shadow] rounded-xl"
                              value={homePlayers[1]}
                              onChange={(e) =>
                                handlePlayerChange('home', 1, e.target.value)
                              }
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Away Side */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 pb-2 border-b">
                        <div className="w-2 h-2 rounded-full bg-[var(--accent-a)]" />{' '}
                        {/* Blue marker */}
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
                            placeholder="Pemain 1 (misal, Sari)…"
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
                              placeholder="Pemain 2 (misal, Rina)…"
                              className="pl-9 h-11 bg-black/5 border-transparent focus:bg-white focus:border-black/20 focus:ring-black/10 transition-[background-color,border-color,box-shadow] rounded-xl"
                              value={awayPlayers[1]}
                              onChange={(e) =>
                                handlePlayerChange('away', 1, e.target.value)
                              }
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Advanced Options Toggle */}
                  <div className="mt-8">
                    <button
                      onClick={() => setShowAdvanced(!showAdvanced)}
                      className="flex items-center gap-2 text-xs font-bold text-black/40 hover:text-black transition-colors uppercase tracking-widest"
                    >
                      Opsi Lanjutan{' '}
                      <ChevronDownIcon
                        className={`w-3 h-3 transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
                      />
                    </button>

                    {showAdvanced && (
                      <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                        <label htmlFor="home-team" className="sr-only">
                          Nama klub tuan rumah
                        </label>
                        <Input
                          id="home-team"
                          name="homeTeam"
                          autoComplete="organization"
                          placeholder="Nama Klub Tuan Rumah (misal, PB Jaya)..."
                          value={homeTeam}
                          onChange={(e) => setHomeTeam(e.target.value)}
                          className="h-9 text-xs bg-black/5 border-transparent focus:bg-white focus:border-black/20 rounded-lg"
                        />
                        <label htmlFor="away-team" className="sr-only">
                          Nama klub tamu
                        </label>
                        <Input
                          id="away-team"
                          name="awayTeam"
                          autoComplete="organization"
                          placeholder="Nama Klub Tamu (misal, PB Maju)..."
                          value={awayTeam}
                          onChange={(e) => setAwayTeam(e.target.value)}
                          className="h-9 text-xs bg-black/5 border-transparent focus:bg-white focus:border-black/20 rounded-lg"
                        />
                        <label htmlFor="home-country" className="sr-only">
                          Kode negara tuan rumah
                        </label>
                        <Input
                          id="home-country"
                          name="homeCountry"
                          autoComplete="off"
                          placeholder="Negara (misal, ID)..."
                          value={homeCountry}
                          onChange={(e) => setHomeCountry(e.target.value)}
                          className="h-9 text-xs bg-black/5 border-transparent focus:bg-white focus:border-black/20 rounded-lg"
                        />
                        <label htmlFor="away-country" className="sr-only">
                          Kode negara tamu
                        </label>
                        <Input
                          id="away-country"
                          name="awayCountry"
                          autoComplete="off"
                          placeholder="Negara (misal, TH)..."
                          value={awayCountry}
                          onChange={(e) => setAwayCountry(e.target.value)}
                          className="h-9 text-xs bg-black/5 border-transparent focus:bg-white focus:border-black/20 rounded-lg"
                        />
                        <label htmlFor="home-logo" className="sr-only">
                          URL logo tuan rumah
                        </label>
                        <Input
                          id="home-logo"
                          name="homeLogo"
                          autoComplete="off"
                          placeholder="URL Logo Tuan Rumah (opsional)..."
                          value={homeLogo}
                          onChange={(e) => setHomeLogo(e.target.value)}
                          className="h-9 text-xs bg-black/5 border-transparent focus:bg-white focus:border-black/20 rounded-lg"
                        />
                        <label htmlFor="away-logo" className="sr-only">
                          URL logo tamu
                        </label>
                        <Input
                          id="away-logo"
                          name="awayLogo"
                          autoComplete="off"
                          placeholder="URL Logo Tamu (opsional)..."
                          value={awayLogo}
                          onChange={(e) => setAwayLogo(e.target.value)}
                          className="h-9 text-xs bg-black/5 border-transparent focus:bg-white focus:border-black/20 rounded-lg"
                        />
                      </div>
                    )}
                  </div>

                  {/* PIN & Submit */}
                  <div className="mt-8 pt-8 border-t grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6 items-end">
                    <div>
                      <label
                        htmlFor="create-pin"
                        className="text-[10px] font-bold uppercase text-muted-foreground mb-2 block tracking-widest"
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
                        className="text-center font-mono tracking-[0.5em] h-12 text-lg bg-black/5 focus:bg-white focus:border-black/20 transition-colors rounded-xl border-transparent"
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
                      className="w-full h-12 text-base font-bold bg-[#111827] hover:bg-black text-white shadow-xl shadow-black/20 transition-[box-shadow,background-color,color] rounded-full uppercase tracking-widest"
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
                        className="text-[10px] font-bold uppercase text-muted-foreground mb-2 block tracking-widest"
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

          {/* Secondary Column: Join & Shortcuts */}
          <aside className="flex flex-col gap-6">
            <div className="mb-2">
              <h2 className="text-sm font-bold uppercase text-muted-foreground tracking-widest">
                Masuk yang Sudah Ada
              </h2>
            </div>

            {/* Join as Referee */}
            <Card className="p-5 border border-black/10 shadow-sm bg-white hover:border-black/20 transition-colors group rounded-3xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-foreground">Masuk sebagai Wasit</h3>
                <div className="w-6 h-6 rounded bg-secondary flex items-center justify-center text-muted-foreground group-hover:text-[var(--accent-b)] transition-colors">
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                    />
                  </svg>
                </div>
              </div>
              <div className="space-y-3">
                <label htmlFor="display-code-referee" className="sr-only">
                  Kode Tampilan
                </label>
                <Input
                  id="display-code-referee"
                  name="displayCode"
                  autoComplete="off"
                  placeholder="Kode Tampilan (misal, A1B2C3)..."
                  className="h-9 font-mono text-xs uppercase bg-black/5 border-transparent focus:bg-white focus:border-black/20 rounded-lg"
                  value={displayCodeInput}
                  onChange={(e) =>
                    setDisplayCodeInput(
                      e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''),
                    )
                  }
                />
                <Button
                  onClick={() => handleJoinMatch('referee')}
                  disabled={!canJoinReferee}
                  variant="secondary"
                  className="w-full text-xs font-bold uppercase tracking-widest h-10 rounded-full bg-black/5 hover:bg-black/10 text-black shadow-none border border-transparent"
                >
                  Buka Halaman Wasit
                </Button>
                <p className="text-[11px] text-black/50">
                  Wasit tetap login pakai Kode Tampilan + PIN di halaman join.
                </p>
              </div>
            </Card>

            {/* Join as Display */}
            <Card className="p-5 border border-black/10 shadow-sm bg-white hover:border-black/20 transition-colors group rounded-3xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-foreground">Buka Tampilan Layar</h3>
                <div className="w-6 h-6 rounded bg-secondary flex items-center justify-center text-muted-foreground group-hover:text-[var(--accent-a)] transition-colors">
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mb-4">
                Buka tampilan papan skor publik untuk TV atau proyektor.
              </p>
              <div className="space-y-3">
                <label htmlFor="display-code-open" className="sr-only">
                  Kode Tampilan
                </label>
                <Input
                  id="display-code-open"
                  name="displayCodeOpen"
                  autoComplete="off"
                  placeholder="Kode Tampilan (misal, A1B2C3)..."
                  className="h-9 font-mono text-xs uppercase"
                  value={displayCodeInput}
                  onChange={(e) =>
                    setDisplayCodeInput(
                      e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''),
                    )
                  }
                />
                <Button
                  onClick={() => handleJoinMatch('display')}
                  disabled={!canJoinDisplay}
                  variant="outline"
                  className="w-full text-xs font-bold uppercase tracking-widest h-10"
                >
                  Buka Layar
                </Button>
              </div>
            </Card>
          </aside>
        </div>
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
              Bagikan akses wasit dari popup ini. Admin berikutnya lanjut dari dashboard.
            </DialogDescription>
          </DialogHeader>

          {createdMatch ? (
            <div className="grid gap-4 sm:grid-cols-3 text-sm">
              <div className="rounded-xl border border-black/10 bg-black/5 p-3">
                <div className="text-[10px] uppercase tracking-widest text-black/50 font-bold">
                  Match ID
                </div>
                <div className="mt-1 font-mono font-bold">{createdMatch.matchId}</div>
              </div>
              <div className="rounded-xl border border-black/10 bg-black/5 p-3">
                <div className="text-[10px] uppercase tracking-widest text-black/50 font-bold">
                  Display Code
                </div>
                <div className="mt-1 font-mono font-bold">{createdMatch.displayCode}</div>
              </div>
              <div className="rounded-xl border border-black/10 bg-black/5 p-3">
                <div className="text-[10px] uppercase tracking-widest text-black/50 font-bold">
                  Referee PIN
                </div>
                <div className="mt-1 font-mono font-bold">{createdMatch.refereePin}</div>
              </div>
            </div>
          ) : null}

          <div className="grid gap-2 sm:grid-cols-2">
            <Button
              type="button"
              variant="outline"
              className="rounded-full text-xs uppercase tracking-widest font-bold"
              onClick={() => {
                if (!createdMatch) return;
                const link = `${window.location.origin}/referee/join?code=${encodeURIComponent(createdMatch.displayCode)}`;
                navigator.clipboard.writeText(link);
              }}
            >
              Salin Link Wasit
            </Button>
            <Button
              type="button"
              variant="outline"
              className="rounded-full text-xs uppercase tracking-widest font-bold"
              onClick={() => {
                if (!createdMatch) return;
                const message = `Akses wasit\\nKode Tampilan: ${createdMatch.displayCode}\\nPIN: ${createdMatch.refereePin}\\nLink: ${window.location.origin}/referee/join?code=${encodeURIComponent(createdMatch.displayCode)}`;
                const waUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
                window.open(waUrl, '_blank', 'noopener,noreferrer');
              }}
            >
              Bagikan ke WhatsApp
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
