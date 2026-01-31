'use client';

import { useState, useEffect, type MouseEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

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

const TennisIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
  >
    <circle cx="12" cy="12" r="6" strokeWidth={2} />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 9c2 2 6 2 8 0m-8 6c2-2 6-2 8 0"
    />
  </svg>
);

const VolleyballIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
  >
    <circle cx="12" cy="12" r="9" strokeWidth={2} />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 12a9 9 0 009 9m0-18a9 9 0 019 9M4.5 7.5c4 1.5 6.5 5.5 7.5 12"
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

type SportType = 'badminton' | 'tennis' | 'volleyball';

const SPORTS = [
  {
    id: 'badminton',
    name: 'Badminton',
    icon: BadmintonIcon,
    available: true,
  },
  {
    id: 'tennis',
    name: 'Tennis',
    icon: TennisIcon,
    available: false,
  }, // Future
  {
    id: 'volleyball',
    name: 'Volleyball',
    icon: VolleyballIcon,
    available: false,
  }, // Future
];

export default function ScoreboardLanding() {
  const router = useRouter();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Form State
  const [matchIdInput, setMatchIdInput] = useState('');
  const [pinInput, setPinInput] = useState('');

  // Create Match State
  const [selectedSport, setSelectedSport] = useState<SportType>('badminton');
  const [createPin, setCreatePin] = useState('');

  // Category logic replaces simple gameMode toggle
  type MatchCategory = 'MS' | 'WS' | 'MD' | 'WD' | 'XD';
  const [category, setCategory] = useState<MatchCategory>('MS');

  // Computed gameMode based on category
  const gameMode = ['MD', 'WD', 'XD'].includes(category) ? 'double' : 'single';

  const [homePlayers, setHomePlayers] = useState(['', '']);
  const [awayPlayers, setAwayPlayers] = useState(['', '']);
  const [homeTeam, setHomeTeam] = useState(''); // Club name
  const [awayTeam, setAwayTeam] = useState(''); // Club name
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const canJoinDisplay = matchIdInput.trim().length > 0;
  const canJoinReferee =
    matchIdInput.trim().length > 0 && pinInput.trim().length >= 4;

  // Theme Logic
  useEffect(() => {
    const saved = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (saved) setTheme(saved);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

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
    if (selectedSport !== 'badminton') {
      setError('Only Badminton is supported in this beta version.');
      return;
    }

    if (!createPin || createPin.length < 4) {
      setError('PIN must be at least 4 digits');
      return;
    }

    // Validation
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

    setIsLoading(true);
    setError('');

    const newMatchId = generateMatchId();

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001'}/api/matches`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            matchId: newMatchId,
            sport: selectedSport,
            gameMode,
            category, // Pass category to backend
            teams: {
              home: {
                name: homeTeam || homePlayers[0],
                players:
                  gameMode === 'single'
                    ? [{ name: homePlayers[0] }]
                    : [{ name: homePlayers[0] }, { name: homePlayers[1] }],
              },
              away: {
                name: awayTeam || awayPlayers[0],
                players:
                  gameMode === 'single'
                    ? [{ name: awayPlayers[0] }]
                    : [{ name: awayPlayers[0] }, { name: awayPlayers[1] }],
              },
            },
            pin: createPin,
            templateId: 'bwf-default',
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create match');
      }

      router.push(
        `/match/${newMatchId}/control?role=admin&pin=${encodeURIComponent(createPin)}`,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create match');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinMatch = (role: 'referee' | 'display') => {
    if (!matchIdInput) {
      setError('Please enter Match ID');
      return;
    }

    if (role === 'referee') {
      if (!pinInput || pinInput.length < 4) {
        setError('PIN required for referee access');
        return;
      }
      router.push(
        `/match/${matchIdInput}/control?role=referee&pin=${encodeURIComponent(pinInput)}`,
      );
    } else {
      router.push(`/match/${matchIdInput}/display`);
    }
  };

  const handleJoinLinkClick = (
    role: 'referee' | 'display',
    event: MouseEvent<HTMLAnchorElement>,
  ) => {
    if (role === 'referee') {
      if (!canJoinReferee) {
        event.preventDefault();
        handleJoinMatch('referee');
      }
    } else if (!canJoinDisplay) {
      event.preventDefault();
      handleJoinMatch('display');
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans transition-colors duration-300 relative overflow-hidden">
      <div
        className="pointer-events-none absolute -top-32 left-1/2 h-[420px] w-[900px] -translate-x-1/2 opacity-40 blur-3xl"
        aria-hidden="true"
      >
        <div className="h-full w-full rounded-full bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.28),rgba(59,130,246,0.12),transparent_70%)]" />
      </div>
      {/* Top Bar */}
      <header className="h-16 border-b bg-card/80 backdrop-blur px-4 lg:px-8 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-black text-sm tracking-wide">
            MP
          </div>
          <div>
            <h1 className="font-display text-sm leading-none uppercase tracking-[0.2em]">
              MatchPoint
            </h1>
            <span className="text-[10px] font-body text-muted-foreground uppercase tracking-widest">
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
            <Link href="/docs">Guide</Link>
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
                Your Arena Workspace
              </div>
              <div className="mt-3 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="font-display text-3xl lg:text-4xl font-black tracking-tight text-foreground">
                    Match Control Hub
                  </h2>
                  <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                    Launch new matches fast, keep officials synced, and run
                    broadcast-ready displays from one console.
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-xl border bg-background/80 px-4 py-3">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      Active
                    </div>
                    <div className="mt-1 text-2xl font-black text-foreground">
                      1
                    </div>
                  </div>
                  <div className="rounded-xl border bg-background/80 px-4 py-3">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      Displays
                    </div>
                    <div className="mt-1 text-2xl font-black text-foreground">
                      2
                    </div>
                  </div>
                  <div className="rounded-xl border bg-background/80 px-4 py-3">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      Templates
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
              <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
                Match Builder
              </div>
              <h2 className="mt-2 text-3xl font-black text-foreground tracking-tight">
                Create Match
              </h2>
              <p className="text-sm text-muted-foreground">
                Select your sport and configure the match details.
              </p>
            </div>

            <Card className="p-6 lg:p-8 border shadow-sm bg-card">
              {/* Sport Selector (SaaS Style) */}
              <div className="mb-8">
                <label className="text-[10px] font-bold uppercase text-muted-foreground mb-3 block tracking-widest">
                  Select Sport
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {SPORTS.map((s) => (
                    <button
                      key={s.id}
                      onClick={() =>
                        s.available && setSelectedSport(s.id as SportType)
                      }
                      disabled={!s.available}
                      aria-pressed={selectedSport === s.id}
                      aria-disabled={!s.available}
                      type="button"
                      className={`
                        relative group flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-colors transition-shadow
                        ${
                          selectedSport === s.id
                            ? 'border-primary bg-primary/5 shadow-md'
                            : 'border-transparent bg-secondary'
                        }
                        ${!s.available ? 'opacity-50 cursor-not-allowed grayscale' : 'hover:border-primary/50 cursor-pointer'}
                      `}
                    >
                      <span className="text-3xl mb-2">
                        <s.icon className="w-7 h-7" />
                      </span>
                      <span className="text-xs font-bold uppercase tracking-wider">
                        {s.name}
                      </span>
                      {!s.available && (
                        <span className="absolute top-2 right-2 text-[8px] font-bold bg-muted-foreground/20 text-muted-foreground px-1.5 py-0.5 rounded">
                          SOON
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Only show config if sport is valid (Badminton for now) */}
              {selectedSport === 'badminton' && (
                <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                  {/* Category Toggle */}
                  <div className="flex justify-center mb-8">
                    <div className="bg-secondary p-1 rounded-xl flex gap-1 w-full max-w-lg overflow-x-auto">
                      {(['MS', 'WS', 'MD', 'WD', 'XD'] as MatchCategory[]).map(
                        (cat) => (
                          <button
                            key={cat}
                            onClick={() => setCategory(cat)}
                            className={`flex-1 py-3 px-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors transition-shadow min-w-[50px] whitespace-nowrap ${
                              category === cat
                                ? 'bg-background shadow-sm text-foreground ring-1 ring-border'
                                : 'text-muted-foreground hover:text-foreground'
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
                          Home Side
                        </span>
                      </div>

                      <div className="space-y-3">
                        <div className="relative">
                          <label htmlFor="home-player-1" className="sr-only">
                            Home player 1
                          </label>
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            <UserIcon className="w-4 h-4" />
                          </div>
                          <Input
                            id="home-player-1"
                            name="homePlayer1"
                            autoComplete="off"
                            placeholder="Player 1 (e.g. Andi)…"
                            className="pl-9 h-11 bg-secondary/50 border-transparent focus:bg-background focus:border-border transition-colors"
                            value={homePlayers[0]}
                            onChange={(e) =>
                              handlePlayerChange('home', 0, e.target.value)
                            }
                          />
                        </div>
                        {gameMode === 'double' && (
                          <div className="relative">
                            <label htmlFor="home-player-2" className="sr-only">
                              Home player 2
                            </label>
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                              <UserIcon className="w-4 h-4" />
                            </div>
                            <Input
                              id="home-player-2"
                              name="homePlayer2"
                              autoComplete="off"
                              placeholder="Player 2 (e.g. Budi)…"
                              className="pl-9 h-11 bg-secondary/50 border-transparent focus:bg-background focus:border-border transition-colors"
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
                          Away Side
                        </span>
                      </div>

                      <div className="space-y-3">
                        <div className="relative">
                          <label htmlFor="away-player-1" className="sr-only">
                            Away player 1
                          </label>
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            <UserIcon className="w-4 h-4" />
                          </div>
                          <Input
                            id="away-player-1"
                            name="awayPlayer1"
                            autoComplete="off"
                            placeholder="Player 1 (e.g. Sari)…"
                            className="pl-9 h-11 bg-secondary/50 border-transparent focus:bg-background focus:border-border transition-colors"
                            value={awayPlayers[0]}
                            onChange={(e) =>
                              handlePlayerChange('away', 0, e.target.value)
                            }
                          />
                        </div>
                        {gameMode === 'double' && (
                          <div className="relative">
                            <label htmlFor="away-player-2" className="sr-only">
                              Away player 2
                            </label>
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                              <UserIcon className="w-4 h-4" />
                            </div>
                            <Input
                              id="away-player-2"
                              name="awayPlayer2"
                              autoComplete="off"
                              placeholder="Player 2 (e.g. Rina)…"
                              className="pl-9 h-11 bg-secondary/50 border-transparent focus:bg-background focus:border-border transition-colors"
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
                      className="flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-widest"
                    >
                      Advanced Options{' '}
                      <ChevronDownIcon
                        className={`w-3 h-3 transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
                      />
                    </button>

                    {showAdvanced && (
                      <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                        <label htmlFor="home-team" className="sr-only">
                          Home team or club name
                        </label>
                        <Input
                          id="home-team"
                          name="homeTeam"
                          autoComplete="organization"
                          placeholder="Home Team/Club Name (e.g. PB Jaya)…"
                          value={homeTeam}
                          onChange={(e) => setHomeTeam(e.target.value)}
                          className="h-9 text-xs"
                        />
                        <label htmlFor="away-team" className="sr-only">
                          Away team or club name
                        </label>
                        <Input
                          id="away-team"
                          name="awayTeam"
                          autoComplete="organization"
                          placeholder="Away Team/Club Name (e.g. PB Maju)…"
                          value={awayTeam}
                          onChange={(e) => setAwayTeam(e.target.value)}
                          className="h-9 text-xs"
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
                        Set Referee PIN
                      </label>
                      <Input
                        id="create-pin"
                        name="createPin"
                        autoComplete="new-password"
                        placeholder="PIN (e.g. 1234)…"
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
                          Creating Match…
                        </span>
                      ) : (
                        'Start Match'
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
                Join Existing
              </h2>
            </div>

            {/* Join as Referee */}
            <Card className="p-5 border shadow-sm bg-card hover:border-[var(--accent-b)] transition-colors group">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-foreground">Join as Referee</h3>
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
                <label htmlFor="match-id-referee" className="sr-only">
                  Match ID
                </label>
                <Input
                  id="match-id-referee"
                  name="matchId"
                  autoComplete="off"
                  placeholder="Match ID (e.g. MATCH-1A2B)…"
                  className="h-9 font-mono text-xs uppercase"
                  value={matchIdInput}
                  onChange={(e) =>
                    setMatchIdInput(e.target.value.toUpperCase())
                  }
                />
                <label htmlFor="pin-referee" className="sr-only">
                  Referee PIN
                </label>
                <Input
                  id="pin-referee"
                  name="pin"
                  autoComplete="current-password"
                  placeholder="PIN (e.g. 1234)…"
                  type="password"
                  className="h-9 font-mono text-xs"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                />
                <Button
                  asChild
                  variant="secondary"
                  className={`w-full h-9 text-xs font-bold uppercase tracking-wider ${
                    canJoinReferee ? '' : 'opacity-50 cursor-not-allowed'
                  }`}
                >
                  <Link
                    href={
                      canJoinReferee
                        ? `/match/${matchIdInput}/control?role=referee&pin=${encodeURIComponent(
                            pinInput,
                          )}`
                        : '#'
                    }
                    aria-disabled={!canJoinReferee}
                    onClick={(event) => handleJoinLinkClick('referee', event)}
                  >
                    Enter Console
                  </Link>
                </Button>
              </div>
            </Card>

            {/* Display Screen Shortcut */}
            <Card className="p-5 border shadow-sm bg-card hover:border-[var(--accent-a)] transition-colors group">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-foreground">Display Screen</h3>
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
              <div className="space-y-3">
                <label htmlFor="match-id-display" className="sr-only">
                  Match ID
                </label>
                <Input
                  id="match-id-display"
                  name="matchIdDisplay"
                  autoComplete="off"
                  placeholder="Match ID (e.g. MATCH-1A2B)…"
                  className="h-9 font-mono text-xs uppercase"
                  value={matchIdInput}
                  onChange={(e) =>
                    setMatchIdInput(e.target.value.toUpperCase())
                  }
                />
                <Button
                  asChild
                  variant="secondary"
                  className={`w-full h-9 text-xs font-bold uppercase tracking-wider ${
                    canJoinDisplay ? '' : 'opacity-50 cursor-not-allowed'
                  }`}
                >
                  <Link
                    href={
                      canJoinDisplay ? `/match/${matchIdInput}/display` : '#'
                    }
                    aria-disabled={!canJoinDisplay}
                    onClick={(event) => handleJoinLinkClick('display', event)}
                  >
                    Launch Display
                  </Link>
                </Button>
              </div>
            </Card>

            {/* Recent Matches Placeholder */}
            <div className="mt-4">
              <h3 className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest mb-3">
                Recent Matches
              </h3>
              <div className="space-y-2">
                <div className="p-3 bg-muted/20 border rounded-lg flex items-center justify-between opacity-50 cursor-not-allowed">
                  <span className="text-xs font-bold">MATCH-SAMPLE</span>
                  <span className="text-[10px] text-muted-foreground">
                    Example
                  </span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <footer className="mt-auto py-8 border-t bg-card/30">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-primary text-white flex items-center justify-center font-black text-[10px]">
              MP
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              MatchPoint Control Suite
            </span>
          </div>
          <div className="flex gap-6">
            <Link
              href="/docs"
              className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
            >
              Documentation
            </Link>
            <Link
              href="/docs#badminton-rules"
              className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
            >
              BWF Rules
            </Link>
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">
              Status: Stable
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
