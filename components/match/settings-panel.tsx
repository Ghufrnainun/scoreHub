'use client';

import { useMemo, useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { MatchFormat, TeamLineupRow } from '@/lib/match-types';

export interface DisplaySettings {
  template:
    | 'modern'
    | 'classic'
    | 'minimal'
    | 'neon'
    | 'bwf-court'
    | 'hoops-classic'
    | 'hoops-led'
    | 'volley-clean'
    | 'volley-led'
    | 'tennis-scoreline'
    | 'tennis-minimal'
    | 'futsal-broadcast'
    | 'futsal-minimal'
    | 'soccer-broadcast'
    | 'soccer-minimal';
  fontSizes: {
    teamName: number;
    score: number;
  };
  teamCodes: {
    home: string;
    away: string;
    show: boolean;
  };
  teamColors: {
    home: string;
    away: string;
  };
  teamLabels: {
    home: string;
    away: string;
  };
  courtName: string;
  showServerIcon: boolean;
  overlay: {
    enabled: boolean;
    background: 'transparent' | 'chroma-green' | 'chroma-blue';
    hideHeader: boolean;
    hideFooter: boolean;
  };
}

export interface MatchSettingsDraft {
  tournamentName: string;
  assignedReferee: string;
  matchFormat: MatchFormat;
  homeTeamName: string;
  awayTeamName: string;
  homePlayers: string[];
  awayPlayers: string[];
  teamLineup: TeamLineupRow[];
  category?: 'MS' | 'WS' | 'MD' | 'WD' | 'XD';
  gameMode?: 'single' | 'double';
  badmintonMaxPoints?: number;
}

export interface SettingsSavePayload {
  displaySettings: DisplaySettings;
  matchSettings: MatchSettingsDraft;
}

export const defaultSettings: DisplaySettings = {
  template: 'modern',
  fontSizes: {
    teamName: 24,
    score: 72,
  },
  teamCodes: {
    home: '',
    away: '',
    show: true,
  },
  teamColors: {
    home: '#3b82f6',
    away: '#ef4444',
  },
  teamLabels: {
    home: 'HOST',
    away: 'GUEST',
  },
  courtName: 'COURT 1',
  showServerIcon: true,
  overlay: {
    enabled: false,
    background: 'transparent',
    hideHeader: true,
    hideFooter: true,
  },
};

interface SettingsPanelProps {
  settings: DisplaySettings;
  matchSettings: MatchSettingsDraft;
  onSave: (payload: SettingsSavePayload) => void;
  sportId?: string;
  trigger: React.ReactNode;
  matchId?: string;
}

const TEMPLATE_OPTIONS: Record<string, { id: DisplaySettings['template']; label: string }[]> = {
  badminton: [
    { id: 'modern', label: 'Modern BWF' },
    { id: 'classic', label: 'Classic Strip' },
    { id: 'minimal', label: 'Minimalist' },
    { id: 'neon', label: 'Neon Glow' },
    { id: 'bwf-court', label: 'BWF Court Side' },
  ],
  basketball: [
    { id: 'hoops-classic', label: 'Hoops Classic' },
    { id: 'hoops-led', label: 'Hoops LED' },
  ],
  volleyball: [
    { id: 'volley-clean', label: 'Volley Clean' },
    { id: 'volley-led', label: 'Volley LED' },
  ],
  tennis: [
    { id: 'tennis-scoreline', label: 'Scoreline' },
    { id: 'tennis-minimal', label: 'Tennis Minimal' },
  ],
  futsal: [
    { id: 'futsal-broadcast', label: 'Futsal Broadcast' },
    { id: 'futsal-minimal', label: 'Futsal Minimal' },
  ],
  soccer: [
    { id: 'soccer-broadcast', label: 'Soccer Broadcast' },
    { id: 'soccer-minimal', label: 'Soccer Minimal' },
  ],
};

const DEFAULT_LINEUP: TeamLineupRow = {
  home: '',
  homeSecond: '',
  away: '',
  awaySecond: '',
  type: 'MS',
};

const isDoublesCategory = (type: TeamLineupRow['type']) =>
  type === 'MD' || type === 'WD' || type === 'XD';

const dedupe = (values: string[]) => Array.from(new Set(values.filter(Boolean)));

const sanitizeRoster = (values: string[]) =>
  values.map((name) => name.trim()).filter(Boolean);

const buildPlayerOptions = (
  roster: string[],
  currentValue: string,
  excludedValue?: string,
) => {
  const withCurrent =
    currentValue && !roster.includes(currentValue)
      ? [currentValue, ...roster]
      : roster;

  if (!excludedValue) return dedupe(withCurrent);

  return dedupe(
    withCurrent.filter(
      (name) => name !== excludedValue || name === currentValue,
    ),
  );
};

export function SettingsPanel({
  settings,
  matchSettings,
  onSave,
  sportId,
  trigger,
  matchId,
}: SettingsPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<'data' | 'display'>('data');
  const [displayDraft, setDisplayDraft] = useState<DisplaySettings>(settings);
  const [matchDraft, setMatchDraft] = useState<MatchSettingsDraft>(matchSettings);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopyFeedback(label);
    setTimeout(() => setCopyFeedback(null), 2000);
  };

  const templateOptions =
    TEMPLATE_OPTIONS[sportId || 'badminton'] || TEMPLATE_OPTIONS.badminton;

  const handleOpenChange = (open: boolean) => {
    if (open) {
      const hasTemplate = templateOptions.some(
        (template) => template.id === settings.template,
      );
      setDisplayDraft({
        ...settings,
        template: hasTemplate ? settings.template : templateOptions[0].id,
      });
      setMatchDraft(matchSettings);
    }
    setIsOpen(open);
  };

  const homeRosterOptions = useMemo(
    () => sanitizeRoster(matchDraft.homePlayers),
    [matchDraft.homePlayers],
  );
  const awayRosterOptions = useMemo(
    () => sanitizeRoster(matchDraft.awayPlayers),
    [matchDraft.awayPlayers],
  );

  const updateDisplay = (partial: Partial<DisplaySettings>) => {
    setDisplayDraft((prev) => ({ ...prev, ...partial }));
  };

  const updateMatch = (partial: Partial<MatchSettingsDraft>) => {
    setMatchDraft((prev) => ({ ...prev, ...partial }));
  };

  const updatePlayer = (
    side: 'homePlayers' | 'awayPlayers',
    index: number,
    value: string,
  ) => {
    setMatchDraft((prev) => {
      const next = [...prev[side]];
      next[index] = value;
      return { ...prev, [side]: next };
    });
  };

  const addPlayer = (side: 'homePlayers' | 'awayPlayers') => {
    setMatchDraft((prev) => ({ ...prev, [side]: [...prev[side], ''] }));
  };

  const removePlayer = (side: 'homePlayers' | 'awayPlayers', index: number) => {
    setMatchDraft((prev) => {
      if (prev[side].length <= 1) return prev;
      return { ...prev, [side]: prev[side].filter((_, i) => i !== index) };
    });
  };

  const updateLineup = (
    index: number,
    key: keyof TeamLineupRow,
    value: string,
  ) => {
    setMatchDraft((prev) => ({
      ...prev,
      teamLineup: prev.teamLineup.map((row, rowIndex) =>
        rowIndex === index ? { ...row, [key]: value } : row,
      ),
    }));
  };

  const addLineupRow = () => {
    setMatchDraft((prev) => ({
      ...prev,
      teamLineup: [...prev.teamLineup, { ...DEFAULT_LINEUP }],
    }));
  };

  const removeLineupRow = (index: number) => {
    setMatchDraft((prev) => ({
      ...prev,
      teamLineup:
        prev.teamLineup.length <= 1
          ? prev.teamLineup
          : prev.teamLineup.filter((_, rowIndex) => rowIndex !== index),
    }));
  };

  const handleSave = () => {
    onSave({
      displaySettings: displayDraft,
      matchSettings: {
        ...matchDraft,
        tournamentName: matchDraft.tournamentName.trim(),
        assignedReferee: matchDraft.assignedReferee.trim(),
        homeTeamName: matchDraft.homeTeamName.trim(),
        awayTeamName: matchDraft.awayTeamName.trim(),
        homePlayers: sanitizeRoster(matchDraft.homePlayers),
        awayPlayers: sanitizeRoster(matchDraft.awayPlayers),
        teamLineup: matchDraft.teamLineup.map((row) => ({
          ...row,
          home: row.home.trim(),
          homeSecond: row.homeSecond?.trim() || undefined,
          away: row.away.trim(),
          awaySecond: row.awaySecond?.trim() || undefined,
        })),
      },
    });
    setIsOpen(false);
  };

  const handleResetDisplay = () => {
    setDisplayDraft(defaultSettings);
  };

  const handleReloadMatchData = () => {
    setMatchDraft(matchSettings);
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent
        side="right"
        className="w-[390px] sm:w-[560px] p-0 flex flex-col overflow-hidden"
      >
        <SheetHeader className="px-5 py-4 border-b border-slate-200 dark:border-slate-800">
          <SheetTitle className="text-lg font-black tracking-tight">
            Pengaturan Match
          </SheetTitle>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setActiveSection('data')}
              className={cn(
                'h-9 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors',
                activeSection === 'data'
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
              )}
            >
              Data Match
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('display')}
              className={cn(
                'h-9 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors',
                activeSection === 'display'
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
              )}
            >
              Display
            </button>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {activeSection === 'data' ? (
            <>
              <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/40 p-4 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">
                  Informasi Inti
                </h3>
                <div className="space-y-2">
                  <Label htmlFor="settings-tournament">Nama Turnamen</Label>
                  <Input
                    id="settings-tournament"
                    value={matchDraft.tournamentName}
                    onChange={(event) =>
                      updateMatch({ tournamentName: event.target.value })
                    }
                    placeholder="Nama turnamen"
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="settings-referee">Nama Umpire / Referee</Label>
                  <Input
                    id="settings-referee"
                    value={matchDraft.assignedReferee}
                    onChange={(event) =>
                      updateMatch({ assignedReferee: event.target.value })
                    }
                    placeholder="Nama umpire"
                    className="h-10"
                  />
                </div>
              </section>

              <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/40 p-4 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">
                  Nama Tim
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="settings-home-team">Tim Home</Label>
                    <Input
                      id="settings-home-team"
                      value={matchDraft.homeTeamName}
                      onChange={(event) =>
                        updateMatch({ homeTeamName: event.target.value })
                      }
                      placeholder="Nama tim home"
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="settings-away-team">Tim Away</Label>
                    <Input
                      id="settings-away-team"
                      value={matchDraft.awayTeamName}
                      onChange={(event) =>
                        updateMatch({ awayTeamName: event.target.value })
                      }
                      placeholder="Nama tim away"
                      className="h-10"
                    />
                  </div>
                </div>
              </section>

              <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/40 p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">
                    Format Match
                  </h3>
                  <div className="inline-flex rounded-full bg-slate-200 dark:bg-slate-800 p-1">
                    {(['perorangan', 'beregu'] as MatchFormat[]).map((format) => (
                      <button
                        key={format}
                        type="button"
                        onClick={() => updateMatch({ matchFormat: format })}
                        className={cn(
                          'h-7 px-3 rounded-full text-[11px] font-bold uppercase tracking-wider transition-colors',
                          matchDraft.matchFormat === format
                            ? 'bg-white dark:bg-slate-950 text-slate-900 dark:text-white shadow-sm'
                            : 'text-slate-500 dark:text-slate-300',
                        )}
                      >
                        {format}
                      </button>
                    ))}
                  </div>
                </div>


                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">
                        Roster Home
                      </Label>
                      <button
                        type="button"
                        onClick={() => addPlayer('homePlayers')}
                        className="text-[10px] font-bold uppercase tracking-wider text-blue-600 hover:text-blue-700"
                      >
                        + tambah
                      </button>
                    </div>
                    {matchDraft.homePlayers.map((name, index) => (
                      <div key={`settings-home-player-${index}`} className="flex items-center gap-2">
                        <Input
                          value={name}
                          onChange={(event) =>
                            updatePlayer('homePlayers', index, event.target.value)
                          }
                          placeholder={`Pemain home ${index + 1}`}
                          aria-label={`Pemain home ${index + 1}`}
                          className="h-9"
                        />
                        {matchDraft.homePlayers.length > 1 ? (
                          <button
                            type="button"
                            onClick={() => removePlayer('homePlayers', index)}
                            className="h-9 w-9 rounded-lg text-black/45 dark:text-white/45 hover:text-red-600 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center"
                            title="Hapus pemain"
                            aria-label={`Hapus pemain home ${index + 1}`}
                          >
                            x
                          </button>
                        ) : null}
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">
                        Roster Away
                      </Label>
                      <button
                        type="button"
                        onClick={() => addPlayer('awayPlayers')}
                        className="text-[10px] font-bold uppercase tracking-wider text-blue-600 hover:text-blue-700"
                      >
                        + tambah
                      </button>
                    </div>
                    {matchDraft.awayPlayers.map((name, index) => (
                      <div key={`settings-away-player-${index}`} className="flex items-center gap-2">
                        <Input
                          value={name}
                          onChange={(event) =>
                            updatePlayer('awayPlayers', index, event.target.value)
                          }
                          placeholder={`Pemain away ${index + 1}`}
                          aria-label={`Pemain away ${index + 1}`}
                          className="h-9"
                        />
                        {matchDraft.awayPlayers.length > 1 ? (
                          <button
                            type="button"
                            onClick={() => removePlayer('awayPlayers', index)}
                            className="h-9 w-9 rounded-lg text-black/45 dark:text-white/45 hover:text-red-600 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center"
                            title="Hapus pemain"
                            aria-label={`Hapus pemain away ${index + 1}`}
                          >
                            x
                          </button>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {matchDraft.matchFormat === 'beregu' ? (
                <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/40 p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">
                      Susunan Partai
                    </h3>
                    <Button
                      type="button"
                      variant="outline"
                      className="h-8 px-3 text-[11px] font-bold uppercase tracking-wider"
                      onClick={addLineupRow}
                    >
                      Tambah Partai
                    </Button>
                  </div>

                  {matchDraft.teamLineup.map((row, rowIndex) => (
                    <div
                      key={`settings-lineup-${rowIndex}`}
                      className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900 p-3 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                          Partai {rowIndex + 1}
                        </span>
                        {matchDraft.teamLineup.length > 1 ? (
                          <button
                            type="button"
                            onClick={() => removeLineupRow(rowIndex)}
                            className="px-2 py-1 rounded text-[11px] font-bold uppercase tracking-wider text-red-600 hover:text-red-700 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                            aria-label={`Hapus partai ${rowIndex + 1}`}
                          >
                            Hapus
                          </button>
                        ) : null}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-2 items-start">
                        <div className="space-y-2">
                          <Select
                            value={row.home || undefined}
                            onValueChange={(value) =>
                              updateLineup(rowIndex, 'home', value)
                            }
                          >
                            <SelectTrigger className="h-9 w-full">
                              <SelectValue placeholder="Pilih pemain home 1" />
                            </SelectTrigger>
                            <SelectContent>
                              {buildPlayerOptions(
                                homeRosterOptions,
                                row.home,
                              ).map((player) => (
                                <SelectItem
                                  key={`lineup-home-${rowIndex}-${player}`}
                                  value={player}
                                >
                                  {player}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {isDoublesCategory(row.type) ? (
                            <Select
                              value={row.homeSecond || undefined}
                              onValueChange={(value) =>
                                updateLineup(rowIndex, 'homeSecond', value)
                              }
                            >
                              <SelectTrigger className="h-9 w-full">
                                <SelectValue placeholder="Pilih pemain home 2" />
                              </SelectTrigger>
                              <SelectContent>
                                {buildPlayerOptions(
                                  homeRosterOptions,
                                  row.homeSecond || '',
                                  row.home,
                                ).map((player) => (
                                  <SelectItem
                                    key={`lineup-home-2-${rowIndex}-${player}`}
                                    value={player}
                                  >
                                    {player}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : null}
                        </div>

                        <div className="space-y-2">
                          <Select
                            value={row.away || undefined}
                            onValueChange={(value) =>
                              updateLineup(rowIndex, 'away', value)
                            }
                          >
                            <SelectTrigger className="h-9 w-full">
                              <SelectValue placeholder="Pilih pemain away 1" />
                            </SelectTrigger>
                            <SelectContent>
                              {buildPlayerOptions(
                                awayRosterOptions,
                                row.away,
                              ).map((player) => (
                                <SelectItem
                                  key={`lineup-away-${rowIndex}-${player}`}
                                  value={player}
                                >
                                  {player}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {isDoublesCategory(row.type) ? (
                            <Select
                              value={row.awaySecond || undefined}
                              onValueChange={(value) =>
                                updateLineup(rowIndex, 'awaySecond', value)
                              }
                            >
                              <SelectTrigger className="h-9 w-full">
                                <SelectValue placeholder="Pilih pemain away 2" />
                              </SelectTrigger>
                              <SelectContent>
                                {buildPlayerOptions(
                                  awayRosterOptions,
                                  row.awaySecond || '',
                                  row.away,
                                ).map((player) => (
                                  <SelectItem
                                    key={`lineup-away-2-${rowIndex}-${player}`}
                                    value={player}
                                  >
                                    {player}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : null}
                        </div>

                        <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-lg flex gap-1 flex-wrap h-fit">
                          {(['MS', 'WS', 'MD', 'WD', 'XD'] as TeamLineupRow['type'][]).map(
                            (type) => (
                              <button
                                key={`lineup-${rowIndex}-${type}`}
                                type="button"
                                onClick={() => updateLineup(rowIndex, 'type', type)}
                                className={cn(
                                  'h-7 px-2 rounded-md text-[11px] font-bold uppercase tracking-wider transition-colors',
                                  row.type === type
                                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                                    : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700',
                                )}
                              >
                                {type}
                              </button>
                            ),
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </section>
              ) : null}
            </>
          ) : (
            <>
              {matchId && (
                <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/40 p-4 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">
                    Tautan Layar & Broadcast
                  </h3>
                  <div className="space-y-2">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                        <span className="font-bold text-slate-700 dark:text-slate-350">Layar Utama (Display)</span>
                        <div className="flex gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              const path = `/match/${matchId}/display`;
                              const url = `${window.location.origin}${path}`;
                              handleCopy(url, 'Layar Utama');
                            }}
                            className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold uppercase tracking-wider transition-colors active:scale-95"
                          >
                            Salin
                          </button>
                          <a
                            href={`/match/${matchId}/display`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-750 dark:text-slate-300 border border-slate-250 dark:border-slate-700 text-[10px] font-bold uppercase tracking-wider transition-colors"
                          >
                            Buka
                          </a>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                        <span className="font-bold text-slate-700 dark:text-slate-350">OBS Overlay (BWF Style)</span>
                        <button
                          type="button"
                          onClick={() => {
                            const url = `${window.location.origin}/overlay/${encodeURIComponent(matchId)}?style=bwf`;
                            handleCopy(url, 'OBS Overlay');
                          }}
                          className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-wider transition-colors active:scale-95"
                        >
                          Salin Link OBS
                        </button>
                      </div>
                    </div>
                  </div>
                  {copyFeedback && (
                    <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 text-center animate-pulse pt-1">
                      ✓ Link {copyFeedback} berhasil disalin!
                    </div>
                  )}
                </section>
              )}

              <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/40 p-4 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">
                  Template Display
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {templateOptions.map((template) => (
                    <button
                      key={template.id}
                      type="button"
                      onClick={() => updateDisplay({ template: template.id as any })}
                      className={cn(
                        'h-9 rounded-lg text-xs font-bold uppercase tracking-wider border transition-colors',
                        displayDraft.template === template.id
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300',
                      )}
                    >
                      {template.label}
                    </button>
                  ))}
                </div>
              </section>

              <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/40 p-4 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">
                  Ukuran Font
                </h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Nama Tim</Label>
                      <span className="text-xs font-mono text-slate-500">
                        {displayDraft.fontSizes.teamName}px
                      </span>
                    </div>
                    <Slider
                      value={[displayDraft.fontSizes.teamName]}
                      onValueChange={([value]) =>
                        updateDisplay({
                          fontSizes: { ...displayDraft.fontSizes, teamName: value },
                        })
                      }
                      min={14}
                      max={48}
                      step={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Skor</Label>
                      <span className="text-xs font-mono text-slate-500">
                        {displayDraft.fontSizes.score}px
                      </span>
                    </div>
                    <Slider
                      value={[displayDraft.fontSizes.score]}
                      onValueChange={([value]) =>
                        updateDisplay({
                          fontSizes: { ...displayDraft.fontSizes, score: value },
                        })
                      }
                      min={48}
                      max={120}
                      step={4}
                    />
                  </div>
                </div>
              </section>

              <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/40 p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">
                    Kode Tim
                  </h3>
                  <Switch
                    checked={displayDraft.teamCodes.show}
                    onCheckedChange={(show) =>
                      updateDisplay({
                        teamCodes: { ...displayDraft.teamCodes, show },
                      })
                    }
                  />
                </div>
                {displayDraft.teamCodes.show ? (
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      value={displayDraft.teamCodes.home}
                      onChange={(event) =>
                        updateDisplay({
                          teamCodes: {
                            ...displayDraft.teamCodes,
                            home: event.target.value.toUpperCase(),
                          },
                        })
                      }
                      placeholder="Kode home"
                    />
                    <Input
                      value={displayDraft.teamCodes.away}
                      onChange={(event) =>
                        updateDisplay({
                          teamCodes: {
                            ...displayDraft.teamCodes,
                            away: event.target.value.toUpperCase(),
                          },
                        })
                      }
                      placeholder="Kode away"
                    />
                  </div>
                ) : null}
              </section>

              <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/40 p-4 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">
                  Label Display
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    value={displayDraft.teamLabels.home}
                    onChange={(event) =>
                      updateDisplay({
                        teamLabels: {
                          ...displayDraft.teamLabels,
                          home: event.target.value.toUpperCase(),
                        },
                      })
                    }
                    placeholder="HOST"
                  />
                  <Input
                    value={displayDraft.teamLabels.away}
                    onChange={(event) =>
                      updateDisplay({
                        teamLabels: {
                          ...displayDraft.teamLabels,
                          away: event.target.value.toUpperCase(),
                        },
                      })
                    }
                    placeholder="GUEST"
                  />
                </div>
              </section>
            </>
          )}
        </div>

        <SheetFooter className="px-5 py-4 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-2">
          <Button variant="outline" onClick={handleReloadMatchData}>
            Muat Ulang Data
          </Button>
          <Button variant="outline" onClick={handleResetDisplay}>
            Reset Display
          </Button>
          <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-500">
            Simpan
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
