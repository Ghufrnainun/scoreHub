'use client';

import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
export interface DisplaySettings {
  template:
    | 'modern'
    | 'classic'
    | 'minimal'
    | 'neon'
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
  onSettingsChange: (settings: DisplaySettings) => void;
  homeTeamName: string;
  awayTeamName: string;
  sportId?: string;
  trigger: React.ReactNode;
}

const TEMPLATE_OPTIONS: Record<
  string,
  { id: DisplaySettings['template']; label: string }[]
> = {
  badminton: [
    { id: 'modern', label: 'Modern BWF' },
    { id: 'classic', label: 'Classic Strip' },
    { id: 'minimal', label: 'Minimalist' },
    { id: 'neon', label: 'Neon Glow' },
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

export function SettingsPanel({
  settings,
  onSettingsChange,
  homeTeamName,
  awayTeamName,
  sportId,
  trigger,
}: SettingsPanelProps) {
  // Local draft state for editing
  const [draft, setDraft] = useState<DisplaySettings>(settings);
  const [isOpen, setIsOpen] = useState(false);

  // Reset draft when opening
  const handleOpenChange = (open: boolean) => {
    if (open) {
      const options =
        TEMPLATE_OPTIONS[sportId || 'badminton'] || TEMPLATE_OPTIONS.badminton;
      const hasTemplate = options.some((tpl) => tpl.id === settings.template);
      setDraft({
        ...settings,
        template: hasTemplate ? settings.template : options[0].id,
      });
    }
    setIsOpen(open);
  };

  const updateDraft = (partial: Partial<DisplaySettings>) => {
    setDraft((prev) => ({ ...prev, ...partial }));
  };

  const handleSave = () => {
    onSettingsChange(draft);
    setIsOpen(false);
  };

  const handleReset = () => {
    setDraft(defaultSettings);
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent
        side="right"
        className="w-[340px] sm:w-[420px] flex flex-col overflow-hidden overscroll-contain"
      >
        <SheetHeader className="pb-4 border-b border-slate-200 dark:border-slate-700">
          <SheetTitle className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-blue-500"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.04.24.24.41.48.41h3.84c.24 0 .43-.17.47-.41l.36-2.54c.59-.24 1.13-.57 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.08-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
            </svg>
            Display Settings
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-4 space-y-5">
          {/* Template Selection */}
          <section className="bg-slate-50 dark:bg-card/50 rounded-lg p-4 space-y-4 border border-slate-100 dark:border-white/5">
            <h3 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
              Display Template
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {(TEMPLATE_OPTIONS[sportId || 'badminton'] ||
                TEMPLATE_OPTIONS.badminton
              ).map((tpl) => (
                <button
                  key={tpl.id}
                  onClick={() => updateDraft({ template: tpl.id as any })}
                  className={cn(
                    'px-3 py-2 rounded-md text-xs font-bold uppercase transition-all border-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900',
                    draft.template === tpl.id
                      ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-blue-400',
                  )}
                >
                  {tpl.label}
                </button>
              ))}
            </div>
          </section>

          {/* Font Sizes Section */}
          <section className="bg-slate-50 dark:bg-card/50 rounded-lg p-4 space-y-4 border border-slate-100 dark:border-white/5">
            <h3 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
              Font Sizes
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label className="text-sm font-medium">Team Name</Label>
                  <span className="text-xs font-mono bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded">
                    {draft.fontSizes.teamName}px
                  </span>
                </div>
                <Slider
                  value={[draft.fontSizes.teamName]}
                  onValueChange={([v]) =>
                    updateDraft({
                      fontSizes: { ...draft.fontSizes, teamName: v },
                    })
                  }
                  min={14}
                  max={48}
                  step={2}
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label className="text-sm font-medium">Score</Label>
                  <span className="text-xs font-mono bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded">
                    {draft.fontSizes.score}px
                  </span>
                </div>
                <Slider
                  value={[draft.fontSizes.score]}
                  onValueChange={([v]) =>
                    updateDraft({ fontSizes: { ...draft.fontSizes, score: v } })
                  }
                  min={48}
                  max={120}
                  step={4}
                />
              </div>
            </div>
          </section>

          {/* Team Codes Section */}
          <section className="bg-slate-50 dark:bg-card/50 rounded-lg p-4 space-y-4 border border-slate-100 dark:border-white/5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                Team Codes
              </h3>
              <div className="flex items-center gap-2">
                <Label className="text-xs text-slate-500" htmlFor="team-codes-show">
                  Show
                </Label>
                <Switch
                  id="team-codes-show"
                  checked={draft.teamCodes.show}
                  onCheckedChange={(show) =>
                    updateDraft({ teamCodes: { ...draft.teamCodes, show } })
                  }
                />
              </div>
            </div>
            {draft.teamCodes.show && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label
                    className="text-xs font-medium flex items-center gap-1.5 mb-1"
                    htmlFor="team-code-home"
                  >
                    <span
                      className="w-2 h-2 rounded-sm"
                      style={{ backgroundColor: draft.teamColors.home }}
                    ></span>
                    {homeTeamName}
                  </Label>
                  <Input
                    id="team-code-home"
                    name="teamCodeHome"
                    autoComplete="off"
                    spellCheck={false}
                    value={draft.teamCodes.home}
                    onChange={(e) =>
                      updateDraft({
                        teamCodes: {
                          ...draft.teamCodes,
                          home: e.target.value.toUpperCase(),
                        },
                      })
                    }
                    placeholder="PAB…"
                    className="uppercase font-bold text-center"
                    maxLength={5}
                  />
                </div>
                <div>
                  <Label
                    className="text-xs font-medium flex items-center gap-1.5 mb-1"
                    htmlFor="team-code-away"
                  >
                    <span
                      className="w-2 h-2 rounded-sm"
                      style={{ backgroundColor: draft.teamColors.away }}
                    ></span>
                    {awayTeamName}
                  </Label>
                  <Input
                    id="team-code-away"
                    name="teamCodeAway"
                    autoComplete="off"
                    spellCheck={false}
                    value={draft.teamCodes.away}
                    onChange={(e) =>
                      updateDraft({
                        teamCodes: {
                          ...draft.teamCodes,
                          away: e.target.value.toUpperCase(),
                        },
                      })
                    }
                    placeholder="KUR…"
                    className="uppercase font-bold text-center"
                    maxLength={5}
                  />
                </div>
              </div>
            )}
          </section>

          {/* Team Labels Section */}
          <section className="bg-slate-50 dark:bg-card/50 rounded-lg p-4 space-y-4 border border-slate-100 dark:border-white/5">
            <h3 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
              Display Labels
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label
                  className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 block"
                  htmlFor="team-label-home"
                >
                  Home Side
                </Label>
                <Input
                  id="team-label-home"
                  name="teamLabelHome"
                  autoComplete="off"
                  spellCheck={false}
                  value={draft.teamLabels?.home || 'HOST'}
                  onChange={(e) =>
                    updateDraft({
                      teamLabels: {
                        ...(draft.teamLabels || {
                          home: 'HOST',
                          away: 'GUEST',
                        }),
                        home: e.target.value.toUpperCase(),
                      },
                    })
                  }
                  placeholder="HOST…"
                  className="uppercase font-mono text-xs font-black tracking-widest text-center h-9 border-2"
                />
              </div>
              <div>
                <Label
                  className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 block"
                  htmlFor="team-label-away"
                >
                  Guest Side
                </Label>
                <Input
                  id="team-label-away"
                  name="teamLabelAway"
                  autoComplete="off"
                  spellCheck={false}
                  value={draft.teamLabels?.away || 'GUEST'}
                  onChange={(e) =>
                    updateDraft({
                      teamLabels: {
                        ...(draft.teamLabels || {
                          home: 'HOST',
                          away: 'GUEST',
                        }),
                        away: e.target.value.toUpperCase(),
                      },
                    })
                  }
                  placeholder="GUEST…"
                  className="uppercase font-mono text-xs font-black tracking-widest text-center h-9 border-2"
                />
              </div>
            </div>
            <p className="text-[10px] text-slate-500 italic mt-1 px-1">
              * Used as sub-headers in some display templates (e.g. Neon)
            </p>
          </section>

          {/* Team Colors Section */}
          <section className="bg-slate-50 dark:bg-card/50 rounded-lg p-4 space-y-4 border border-slate-100 dark:border-white/5">
            <h3 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
              Team Colors
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium" htmlFor="team-color-home">
                  {homeTeamName}
                </Label>
                <div className="flex items-center gap-2 bg-white dark:bg-card border-slate-200 dark:border-white/5">
                  <input
                    type="color"
                    name="teamColorHomePicker"
                    aria-label={`${homeTeamName} color`}
                    value={draft.teamColors.home}
                    onChange={(e) =>
                      updateDraft({
                        teamColors: {
                          ...draft.teamColors,
                          home: e.target.value,
                        },
                      })
                    }
                    className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent"
                  />
                  <Input
                    id="team-color-home"
                    name="teamColorHome"
                    autoComplete="off"
                    value={draft.teamColors.home}
                    onChange={(e) =>
                      updateDraft({
                        teamColors: {
                          ...draft.teamColors,
                          home: e.target.value,
                        },
                      })
                    }
                    className="flex-1 font-mono text-xs border-0 bg-transparent p-0 h-auto"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium" htmlFor="team-color-away">
                  {awayTeamName}
                </Label>
                <div className="flex items-center gap-2 bg-white dark:bg-card border-slate-200 dark:border-white/5">
                  <input
                    type="color"
                    name="teamColorAwayPicker"
                    aria-label={`${awayTeamName} color`}
                    value={draft.teamColors.away}
                    onChange={(e) =>
                      updateDraft({
                        teamColors: {
                          ...draft.teamColors,
                          away: e.target.value,
                        },
                      })
                    }
                    className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent"
                  />
                  <Input
                    id="team-color-away"
                    name="teamColorAway"
                    autoComplete="off"
                    value={draft.teamColors.away}
                    onChange={(e) =>
                      updateDraft({
                        teamColors: {
                          ...draft.teamColors,
                          away: e.target.value,
                        },
                      })
                    }
                    className="flex-1 font-mono text-xs border-0 bg-transparent p-0 h-auto"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Court Name Section */}
          <section className="bg-slate-50 dark:bg-card/50 rounded-lg p-4 space-y-3 border border-slate-100 dark:border-white/5">
            <h3 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
              Court
            </h3>
            <div>
              <Label className="text-xs font-medium mb-1.5 block" htmlFor="court-name">
                Court Name
              </Label>
              <Input
                id="court-name"
                name="courtName"
                autoComplete="off"
                spellCheck={false}
                value={draft.courtName}
                onChange={(e) => updateDraft({ courtName: e.target.value })}
                placeholder="COURT 1…"
                className="font-bold"
              />
            </div>
          </section>

          {/* Server Icon Section */}
          <section className="bg-slate-50 dark:bg-card/50 rounded-lg p-4 border border-slate-100 dark:border-white/5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></span>
                  Server Indicator
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Show shuttlecock icon for serving player
                </p>
              </div>
              <Switch
                checked={draft.showServerIcon}
                onCheckedChange={(showServerIcon) =>
                  updateDraft({ showServerIcon })
                }
              />
            </div>
          </section>
          {/* OBS Overlay Section */}
          <section className="bg-slate-50 dark:bg-card/50 rounded-lg p-4 space-y-4 border border-slate-100 dark:border-white/5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm4.59-12.42L10 14.17l-2.59-2.58L6 13l4 4 8-8z" />
                </svg>
                OBS Overlay Mode
              </h3>
              <Switch
                checked={draft.overlay?.enabled}
                onCheckedChange={(enabled) =>
                  updateDraft({
                    overlay: {
                      ...(draft.overlay || defaultSettings.overlay),
                      enabled,
                    },
                  })
                }
              />
            </div>

            {draft.overlay?.enabled && (
              <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-white/5">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase text-slate-500">
                    Background Type
                  </Label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: 'transparent', label: 'Alpha' },
                      { id: 'chroma-green', label: 'Green' },
                      { id: 'chroma-blue', label: 'Blue' },
                    ].map((bg) => (
                      <button
                        key={bg.id}
                        onClick={() =>
                          updateDraft({
                            overlay: {
                              ...draft.overlay,
                              background: bg.id as any,
                            },
                          })
                        }
                        className={cn(
                          'py-1.5 rounded text-[10px] font-bold uppercase transition-all border',
                          draft.overlay.background === bg.id
                            ? 'bg-slate-900 dark:bg-slate-100 border-slate-900 dark:border-slate-100 text-white dark:text-slate-900'
                            : 'bg-white dark:bg-card border-slate-200 dark:border-white/5 text-slate-500 hover:border-slate-300',
                        )}
                      >
                        {bg.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium text-slate-600 dark:text-slate-400">
                    Hide Header
                  </Label>
                  <Switch
                    className="scale-75"
                    checked={draft.overlay.hideHeader}
                    onCheckedChange={(hideHeader) =>
                      updateDraft({ overlay: { ...draft.overlay, hideHeader } })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium text-slate-600 dark:text-slate-400">
                    Hide Footer
                  </Label>
                  <Switch
                    className="scale-75"
                    checked={draft.overlay.hideFooter}
                    onCheckedChange={(hideFooter) =>
                      updateDraft({ overlay: { ...draft.overlay, hideFooter } })
                    }
                  />
                </div>
              </div>
            )}
          </section>
        </div>

        {/* Footer with Save/Reset buttons */}
        <SheetFooter className="pt-4 border-t border-slate-200 dark:border-slate-700 gap-2">
          <Button variant="outline" onClick={handleReset} className="flex-1">
            Reset
          </Button>
          <SheetClose asChild>
            <Button
              onClick={handleSave}
              className="flex-1 bg-blue-600 hover:bg-blue-500"
            >
              <svg
                className="w-4 h-4 mr-1.5"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z" />
              </svg>
              Save Changes
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
