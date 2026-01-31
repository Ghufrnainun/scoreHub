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

export interface DisplaySettings {
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
  courtName: string;
  showServerIcon: boolean;
}

export const defaultSettings: DisplaySettings = {
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
  courtName: 'COURT 1',
  showServerIcon: true,
};

interface SettingsPanelProps {
  settings: DisplaySettings;
  onSettingsChange: (settings: DisplaySettings) => void;
  homeTeamName: string;
  awayTeamName: string;
  trigger: React.ReactNode;
}

export function SettingsPanel({
  settings,
  onSettingsChange,
  homeTeamName,
  awayTeamName,
  trigger,
}: SettingsPanelProps) {
  // Local draft state for editing
  const [draft, setDraft] = useState<DisplaySettings>(settings);
  const [isOpen, setIsOpen] = useState(false);

  // Reset draft when opening
  const handleOpenChange = (open: boolean) => {
    if (open) {
      setDraft(settings);
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
        className="w-[340px] sm:w-[420px] flex flex-col overflow-hidden"
      >
        <SheetHeader className="pb-4 border-b border-slate-200 dark:border-slate-700">
          <SheetTitle className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-blue-500"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.04.24.24.41.48.41h3.84c.24 0 .43-.17.47-.41l.36-2.54c.59-.24 1.13-.57 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.08-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
            </svg>
            Display Settings
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-4 space-y-5">
          {/* Font Sizes Section */}
          <section className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 space-y-4">
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
          <section className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                Team Codes
              </h3>
              <div className="flex items-center gap-2">
                <Label className="text-xs text-slate-500">Show</Label>
                <Switch
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
                  <Label className="text-xs font-medium flex items-center gap-1.5 mb-1">
                    <span
                      className="w-2 h-2 rounded-sm"
                      style={{ backgroundColor: draft.teamColors.home }}
                    ></span>
                    {homeTeamName}
                  </Label>
                  <Input
                    value={draft.teamCodes.home}
                    onChange={(e) =>
                      updateDraft({
                        teamCodes: {
                          ...draft.teamCodes,
                          home: e.target.value.toUpperCase(),
                        },
                      })
                    }
                    placeholder="PAB"
                    className="uppercase font-bold text-center"
                    maxLength={5}
                  />
                </div>
                <div>
                  <Label className="text-xs font-medium flex items-center gap-1.5 mb-1">
                    <span
                      className="w-2 h-2 rounded-sm"
                      style={{ backgroundColor: draft.teamColors.away }}
                    ></span>
                    {awayTeamName}
                  </Label>
                  <Input
                    value={draft.teamCodes.away}
                    onChange={(e) =>
                      updateDraft({
                        teamCodes: {
                          ...draft.teamCodes,
                          away: e.target.value.toUpperCase(),
                        },
                      })
                    }
                    placeholder="KUR"
                    className="uppercase font-bold text-center"
                    maxLength={5}
                  />
                </div>
              </div>
            )}
          </section>

          {/* Team Colors Section */}
          <section className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 space-y-4">
            <h3 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
              Team Colors
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium">{homeTeamName}</Label>
                <div className="flex items-center gap-2 bg-white dark:bg-slate-900 rounded-lg p-2 border border-slate-200 dark:border-slate-700">
                  <input
                    type="color"
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
                <Label className="text-xs font-medium">{awayTeamName}</Label>
                <div className="flex items-center gap-2 bg-white dark:bg-slate-900 rounded-lg p-2 border border-slate-200 dark:border-slate-700">
                  <input
                    type="color"
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
          <section className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 space-y-3">
            <h3 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
              Court
            </h3>
            <div>
              <Label className="text-xs font-medium mb-1.5 block">
                Court Name
              </Label>
              <Input
                value={draft.courtName}
                onChange={(e) => updateDraft({ courtName: e.target.value })}
                placeholder="COURT 1"
                className="font-bold"
              />
            </div>
          </section>

          {/* Server Icon Section */}
          <section className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4">
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
