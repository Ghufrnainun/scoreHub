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

const EVENT_PRESETS_STORAGE_KEY = 'scorehub:event-presets:v1';

type EventPreset = {
  id: string;
  name: string;
  tournamentName: string;
  homeTeam: string;
  awayTeam: string;
  homeCountry: string;
  awayCountry: string;
  homeLogo: string;
  awayLogo: string;
  matchFormat: MatchFormat;
  badmintonMaxPoints: number;
  category: MatchCategory;
  templateId: string;
};

export default function CreateMatchPage() {
  const router = useRouter();
  const createMatchMutation = useMutation(api.matches.createMatch);

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
  const [badmintonMaxPoints, setBadmintonMaxPoints] = useState<number>(21);
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
  const [eventPresets, setEventPresets] = useState<EventPreset[]>([]);
  const [selectedPresetId, setSelectedPresetId] = useState('');

  useEffect(() => {
    const session = loadValidAdminSession();
    setAdminSessionToken(session?.token || '');
    try {
      const raw = window.localStorage.getItem(EVENT_PRESETS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as EventPreset[];
        if (Array.isArray(parsed)) setEventPresets(parsed);
      }
    } catch {
      setEventPresets([]);
    }
  }, []);

  const persistEventPresets = (nextPresets: EventPreset[]) => {
    setEventPresets(nextPresets);
    window.localStorage.setItem(EVENT_PRESETS_STORAGE_KEY, JSON.stringify(nextPresets));
  };

  const saveCurrentAsPreset = () => {
    const name = tournamentName.trim() || `Preset ${eventPresets.length + 1}`;
    const preset: EventPreset = {
      id: `preset-${Date.now()}`,
      name,
      tournamentName: tournamentName.trim(),
      homeTeam: homeTeam.trim(),
      awayTeam: awayTeam.trim(),
      homeCountry: homeCountry.trim(),
      awayCountry: awayCountry.trim(),
      homeLogo: homeLogo.trim(),
      awayLogo: awayLogo.trim(),
      matchFormat,
      badmintonMaxPoints,
      category,
      templateId: selectedTemplate || TEMPLATE_DEFAULTS[selectedSport],
    };
    const nextPresets = [preset, ...eventPresets].slice(0, 12);
    persistEventPresets(nextPresets);
    setSelectedPresetId(preset.id);
  };

  const applyPreset = (presetId: string) => {
    setSelectedPresetId(presetId);
    const preset = eventPresets.find((item) => item.id === presetId);
    if (!preset) return;
    setTournamentName(preset.tournamentName);
    setHomeTeam(preset.homeTeam);
    setAwayTeam(preset.awayTeam);
    setHomeCountry(preset.homeCountry);
    setAwayCountry(preset.awayCountry);
    setHomeLogo(preset.homeLogo);
    setAwayLogo(preset.awayLogo);
    setMatchFormat(preset.matchFormat);
    setBadmintonMaxPoints(preset.badmintonMaxPoints);
    setCategory(preset.category);
    setSelectedTemplate(preset.templateId);
    setFieldErrors({});
    setError('');
  };

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
        badmintonMaxPoints: isBadminton ? badmintonMaxPoints : undefined,
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
      
      // Extract clean message from ConvexError or raw error
      const rawMessage = err?.data && typeof err.data === 'string'
        ? err.data
        : err?.message && typeof err.message === 'string' && !err.message.includes('Server Error')
          ? err.message.replace(/^ConvexError:\s*/i, '')
          : '';

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
    <div className="min-h-dvh bg-[#F4F6F8] text-[#111827] font-[family-name:var(--font-literata)] transition-colors duration-300">
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
          <div className="hidden sm:flex items-center gap-2 text-xs font-bold uppercase tracking-[0.24em] text-black/45">
            Builder Match
            <span className="h-1 w-1 rounded-full bg-black/30" />
            Admin
          </div>
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="text-xs font-bold uppercase tracking-widest inline-flex"
          >
            <Link href="/guide">Panduan</Link>
          </Button>
        </div>
      </header>

      <main
        id="main-content"
        className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8 lg:py-8"
      >
        {/* Error Banner */}
        {error && (
          <div
            role="status"
            aria-live="polite"
            className="mb-6 flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700"
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

        <section className="mb-6">
          <div className="grid gap-5 rounded-[1.75rem] border border-black/10 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.07)] lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:p-7">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.28em] text-black/45">
                Match Builder
              </div>
              <h2 className="mt-2 font-display text-3xl font-black tracking-tight text-foreground sm:text-4xl">
                Buat pertandingan baru
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-black/60">
                Isi data pertandingan, pilih pemain, lalu buat akses wasit dan kode display.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2 rounded-2xl bg-[#F4F6F8] p-1.5 text-center">
              {['Detail', 'Pemain', 'Akses'].map((step, index) => (
                <div key={step} className="rounded-xl px-3 py-2.5">
                  <div className="mx-auto flex h-6 w-6 items-center justify-center rounded-full bg-black text-[11px] font-black text-white">
                    {index + 1}
                  </div>
                  <div className="mt-1 text-xs font-black text-black">
                    {step}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
          <div>
            <Card className="rounded-[1.75rem] border border-black/10 bg-white p-5 shadow-[0_18px_70px_rgba(15,23,42,0.08)] lg:p-7">
              <div className="mb-6 flex flex-col gap-2 border-b border-black/10 pb-5 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <div className="text-xs font-bold uppercase tracking-[0.28em] text-black/45">
                    Detail Pertandingan
                  </div>
                  <h3 className="mt-2 font-[family-name:var(--font-bebas)] text-3xl uppercase tracking-wide text-black">
                    Data utama
                  </h3>
                </div>
                <p className="max-w-sm text-sm leading-6 text-black/55">
                  Mulai dari nama event, format, tim, dan pemain.
                </p>
              </div>
              {isBadminton ? (
                <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                  <div className="mb-5 rounded-2xl bg-[#F4F6F8] p-4">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                      <div className="min-w-0">
                        <div className="text-xs font-black uppercase tracking-[0.2em] text-black/45">
                          Preset event
                        </div>
                        <p className="mt-1 text-xs text-black/50">
                          Simpan data event yang sering dipakai agar setup berikutnya lebih cepat.
                        </p>
                      </div>
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <select
                          value={selectedPresetId}
                          onChange={(event) => applyPreset(event.target.value)}
                          className="h-11 min-w-[220px] rounded-xl border border-black/10 bg-white px-3 text-sm font-semibold text-black focus:outline-none focus:ring-2 focus:ring-black/10"
                        >
                          <option value="">Pilih preset</option>
                          {eventPresets.map((preset) => (
                            <option key={preset.id} value={preset.id}>
                              {preset.name}
                            </option>
                          ))}
                        </select>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={saveCurrentAsPreset}
                          className="h-11 rounded-xl border-black/10 font-bold text-black hover:bg-black/5 hover:text-black"
                        >
                          Simpan Preset
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="mb-5 rounded-2xl border border-[#D8B35D]/30 bg-[#FFF8E7] p-5">
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
                      className="mt-2 h-12 rounded-xl border-black/10 bg-white/95 text-base focus:border-black/30"
                    />
                    <p className={`mt-2 text-xs ${fieldErrors.tournamentName ? 'text-red-600 font-semibold' : 'text-black/45'}`}>
                      {fieldErrors.tournamentName || 'Contoh: Kejurkot Jakarta 2026 atau Liga Internal Club.'}
                    </p>
                  </div>
                  <div className="mb-5 rounded-2xl bg-[#F4F6F8] p-4">
                    <div className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-black/45">
                      Format dan skor
                    </div>
                    <div className="flex flex-wrap gap-3 items-center">
                    <div className="inline-flex gap-1 rounded-xl bg-black/5 p-1">
                      {(['perorangan', 'beregu'] as MatchFormat[]).map((format) => (
                        <button
                          key={format}
                          type="button"
                          onClick={() => setMatchFormat(format)}
                          className={`min-h-11 py-2.5 px-5 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors ${
                            matchFormat === format
                              ? 'bg-black text-white shadow-lg shadow-black/15'
                              : 'text-black/50 hover:text-black hover:bg-black/5'
                          }`}
                        >
                          {format}
                        </button>
                      ))}
                    </div>

                    {isBadminton && (
                      <div className="inline-flex gap-1 rounded-xl bg-black/5 p-1">
                        {([21, 15] as const).map((points) => (
                          <button
                            key={points}
                            type="button"
                            onClick={() => setBadmintonMaxPoints(points)}
                            className={`min-h-11 py-2.5 px-5 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors ${
                              badmintonMaxPoints === points
                                ? 'bg-black text-white shadow-lg shadow-black/15'
                                : 'text-black/50 hover:text-black hover:bg-black/5'
                            }`}
                          >
                            {points === 21 ? '3x21 (21 Poin)' : '3x15 (15 Poin)'}
                          </button>
                        ))}
                      </div>
                    )}
                    </div>
                  </div>

                  <div className="mb-8 rounded-2xl bg-[#F4F6F8] p-5">
                    <div className="text-xs font-bold uppercase tracking-[0.2em] text-black/50">
                      Identitas di scoreboard
                    </div>
                    <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <label htmlFor="home-team" className="text-xs font-bold uppercase tracking-widest text-black/45">
                          Nama klub tuan rumah
                        </label>
                        <Input
                          id="home-team"
                          name="homeTeam"
                          autoComplete="organization"
                          placeholder="Contoh: PB Jaya"
                          value={homeTeam}
                          onChange={(e) => setHomeTeam(e.target.value)}
                          className="h-11 rounded-xl border-black/10 bg-white focus:border-black/30"
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="away-team" className="text-xs font-bold uppercase tracking-widest text-black/45">
                          Nama klub tamu
                        </label>
                        <Input
                          id="away-team"
                          name="awayTeam"
                          autoComplete="organization"
                          placeholder="Contoh: PB Maju"
                          value={awayTeam}
                          onChange={(e) => setAwayTeam(e.target.value)}
                          className="h-11 rounded-xl border-black/10 bg-white focus:border-black/30"
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="home-country" className="text-xs font-bold uppercase tracking-widest text-black/45">
                          Kode negara tuan rumah
                        </label>
                        <Input
                          id="home-country"
                          name="homeCountry"
                          autoComplete="off"
                          placeholder="Contoh: ID"
                          value={homeCountry}
                          onChange={(e) => setHomeCountry(e.target.value)}
                          className="h-11 rounded-xl border-black/10 bg-white focus:border-black/30"
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="away-country" className="text-xs font-bold uppercase tracking-widest text-black/45">
                          Kode negara tamu
                        </label>
                        <Input
                          id="away-country"
                          name="awayCountry"
                          autoComplete="off"
                          placeholder="Contoh: TH"
                          value={awayCountry}
                          onChange={(e) => setAwayCountry(e.target.value)}
                          className="h-11 rounded-xl border-black/10 bg-white focus:border-black/30"
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="home-logo" className="text-xs font-bold uppercase tracking-widest text-black/45">
                          URL logo tuan rumah
                        </label>
                        <Input
                          id="home-logo"
                          name="homeLogo"
                          autoComplete="off"
                          placeholder="Opsional"
                          value={homeLogo}
                          onChange={(e) => setHomeLogo(e.target.value)}
                          className="h-11 rounded-xl border-black/10 bg-white focus:border-black/30"
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="away-logo" className="text-xs font-bold uppercase tracking-widest text-black/45">
                          URL logo tamu
                        </label>
                        <Input
                          id="away-logo"
                          name="awayLogo"
                          autoComplete="off"
                          placeholder="Opsional"
                          value={awayLogo}
                          onChange={(e) => setAwayLogo(e.target.value)}
                          className="h-11 rounded-xl border-black/10 bg-white focus:border-black/30"
                        />
                      </div>
                    </div>
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

                  <div className="mt-8 rounded-3xl bg-[#F4F6F8] p-5 lg:p-6">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="text-xs font-bold uppercase tracking-[0.3em] text-black/50">
                          Akses Wasit & Umpire
                        </div>
                        <p className="mt-1 text-sm leading-6 text-black/60">
                          Buat PIN wasit dan atur kode display. Kode bisa otomatis jika tidak perlu kode khusus.
                        </p>
                      </div>
                      <span className="inline-flex items-center rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-black/50">
                        Akses langsung
                      </span>
                    </div>

                    <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3 xl:gap-6">
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
                          {fieldErrors.displayCode || `Kosongkan untuk kode otomatis. Terisi ${manualDisplayCode.length}/6 karakter.`}
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
                          {fieldErrors.createPin || `Gunakan 4-6 digit. Terisi ${createPin.length} digit.`}
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 rounded-2xl border border-dashed border-black/15 bg-white/70 p-4 text-xs leading-6 text-black/55">
                      Setelah dibuat, sistem menampilkan link kontrol wasit dan link display yang siap dibagikan.
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <div className="w-full sm:w-auto">
                      <Button
                        onClick={handleCreateMatch}
                        disabled={isLoading}
                        className="h-12 w-full rounded-full bg-[#111827] px-8 text-base font-bold uppercase tracking-widest text-white shadow-xl shadow-black/15 transition-[box-shadow,background-color,color,transform] hover:-translate-y-0.5 hover:bg-black sm:w-auto"
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
          </div>

          <aside className="rounded-[1.75rem] border border-black/10 bg-white p-5 text-black shadow-[0_18px_60px_rgba(15,23,42,0.08)] lg:sticky lg:top-24">
            <div className="text-xs font-black uppercase tracking-[0.24em] text-black/40">
              Ringkasan Setup
            </div>
            <div className="mt-5 space-y-5 text-sm">
              <div>
                <div className="text-xs font-bold uppercase tracking-widest text-black/35">Turnamen</div>
                <div className="mt-1 text-base font-bold text-black">{tournamentName || 'Belum diisi'}</div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-[#F4F6F8] p-3">
                  <div className="text-xs font-bold uppercase tracking-widest text-black/35">Format</div>
                  <div className="mt-1 font-black capitalize">{matchFormat}</div>
                </div>
                <div className="rounded-2xl bg-[#F4F6F8] p-3">
                  <div className="text-xs font-bold uppercase tracking-widest text-black/35">Skor</div>
                  <div className="mt-1 font-black">{badmintonMaxPoints}</div>
                </div>
              </div>
              <div className="grid gap-3">
                <div>
                  <div className="text-xs font-bold uppercase tracking-widest text-black/35">Kode Display</div>
                  <div className="mt-1 font-mono font-black tracking-widest">{manualDisplayCode || 'OTOMATIS'}</div>
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-widest text-black/35">PIN Wasit</div>
                  <div className="mt-1 font-mono font-black tracking-widest">{createPin ? `${createPin.length} digit` : 'Belum diisi'}</div>
                </div>
              </div>
            </div>
            <div className="mt-6 space-y-3 rounded-2xl border border-black/10 bg-[#F4F6F8] p-4 text-xs leading-6 text-black/55">
              <div className="font-bold uppercase tracking-widest text-black/40">
                Wajib sebelum mulai
              </div>
              <div className="space-y-2">
                {([
                  ['Nama turnamen', Boolean(tournamentName.trim())],
                  ['Pemain atau roster', matchFormat === 'perorangan' ? Boolean(homePlayers[0].trim() && awayPlayers[0].trim()) : Boolean(cleanHomeRosterOptions.length && cleanAwayRosterOptions.length)],
                  ['PIN wasit', createPin.length >= 4],
                ] as Array<[string, boolean]>).map(([label, done]) => (
                  <div key={label} className="flex items-center justify-between gap-3">
                    <span>{label}</span>
                    <span className={`h-2.5 w-2.5 rounded-full ${done ? 'bg-[#D8B35D]' : 'bg-black/20'}`} />
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </section>
      </main>

      <Dialog
        open={Boolean(createdMatch)}
        onOpenChange={(open) => {
          if (!open) setCreatedMatch(null);
        }}
      >
        <DialogContent className="rounded-3xl border-black/10 sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-[family-name:var(--font-bebas)] text-3xl uppercase tracking-[0.08em]">
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



