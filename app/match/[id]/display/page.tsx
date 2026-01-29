'use client';

import { useParams } from 'next/navigation';
import { useMatch } from '@/hooks/use-match';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { JetBrains_Mono } from 'next/font/google';

// Load a specific font for the LED/Digital look if possible, or fallback to system mono
// Using a standard google font variable if configured, otherwise using system fonts.
// We'll stick to standard Tailwind font-mono for reliability.

const themeStyles = {
  '--bg': '#000000', // Pure Black
  '--text-primary': '#FFFFFF',
  '--text-secondary': '#fbbf24', // Amber-400 (LED Orange)
  '--text-highlight': '#4ade80', // Green-400 (LED Green)
  '--panel-gap': '4px',
} as React.CSSProperties;

// Component: Country Flag/Code Placeholder
const CountryBadge = ({
  name,
  colorClass,
}: {
  name: string;
  colorClass: string;
}) => {
  // Mock generation of Country Code from Name (First 3 chars upper) or use real field
  const code = name.substring(0, 3).toUpperCase();
  return (
    <div className="flex items-center gap-4">
      <div
        className={cn(
          'w-16 h-10 shadow-sm relative overflow-hidden',
          colorClass,
        )}
      >
        {/* Faux Flag Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-black/10"></div>
      </div>
      <span className="font-bold text-3xl tracking-widest text-white font-mono">
        {code}
      </span>
    </div>
  );
};

export default function BwfScoreboard() {
  const params = useParams();
  const matchId = params.id as string;
  const [isFullscreen, setIsFullscreen] = useState(false);

  const { match, isLoading } = useMatch({ matchId, role: 'display' });

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  if (isLoading || !match) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-black text-[#fbbf24] font-mono text-2xl tracking-widest animate-pulse">
        INITIALIZING SYSTEM...
      </div>
    );
  }

  // match.server: 'home' | 'away'
  const { teams, sets, server, serviceCourt, status, currentSet, category } =
    match;
  const home = teams.home;
  const away = teams.away;

  // Category Map
  const CATEGORY_NAMES: Record<string, string> = {
    MS: "Men's Singles",
    WS: "Women's Singles",
    MD: "Men's Doubles",
    WD: "Women's Doubles",
    XD: 'Mixed Doubles',
  };

  const displayCategory = category || 'MS';
  const displayCategoryName =
    CATEGORY_NAMES[displayCategory] || "Men's Singles";

  // Logic to determine score colors mimicking the reference
  // In the reference (LED board):
  // Top row led (orange text)
  // Bottom row led (green text)
  // This might be fixed colors for P1/P2 or based on who is leading.
  // We'll use:
  // - Serving team gets the "Active" brighter color (Green or bright White)
  // - Or simply: Names White, Scores Amber (standard LED).
  // - Current Set Score: Green if leading, Red/Orange if losing?
  // Let's go with a High Contrast Professional look:
  // Names: White.
  // Scores: LED Amber (#fbbf24) for history, Bright Green (#4ade80) for current set.

  // Helper helper to decide if we show a set column
  // We show Set N if currentSet > N.
  // Example: We show Set 1 column if currentSet >= 2. (Actually user said "if currentSet is 2, show previous set").
  // So Set 1 is visible when current != 1? No, Set 1 is visible when currentSet >= 2.
  // Set 2 is visible when currentSet >= 3.
  // Set 3 is visible when currentSet >= 4 (finished?).
  // Wait, if match is finished (status === 'finished'), all sets should be shown.

  const showSet1 = currentSet >= 2 || status === 'finished';
  const showSet2 = currentSet >= 3 || status === 'finished';
  const showSet3 = status === 'finished' && sets.length >= 3;

  const renderRow = (team: typeof home, isHome: boolean) => {
    const isServing = server === (isHome ? 'home' : 'away');
    const displayNames = team.players?.length
      ? team.players.map((p) => p.name).join(' / ')
      : team.name;
    const teamColor = isHome ? 'bg-blue-600' : 'bg-red-600'; // Fallback flag color

    return (
      <div className="grid grid-cols-[1fr_auto] border-b border-slate-800 last:border-0 flex-1 min-h-[160px]">
        {/* Name Section */}
        <div className="flex items-center px-12 gap-8 bg-[#111] relative">
          {/* Active Server Indicator Bar */}
          {isServing && (
            <div className="absolute left-0 top-0 bottom-0 w-3 bg-[#fbbf24] animate-pulse"></div>
          )}

          <CountryBadge name={team.name} colorClass={teamColor} />
          <span
            className={cn(
              'text-5xl lg:text-7xl font-bold tracking-tight truncate text-white uppercase',
              isServing ? 'text-white' : 'text-gray-400',
            )}
          >
            {displayNames}
          </span>
        </div>

        {/* Scores Section */}
        <div className="flex bg-black">
          {/* Set 1 */}
          {showSet1 && (
            <div className="w-40 flex items-center justify-center bg-[#0a0a0a]">
              <span className="text-5xl font-mono font-bold text-[#fbbf24] opacity-80">
                {sets[0] ? (isHome ? sets[0].home : sets[0].away) : '0'}
              </span>
            </div>
          )}

          {/* Set 2 */}
          {showSet2 && (
            <div className="w-40 flex items-center justify-center bg-[#0a0a0a]">
              <span className="text-5xl font-mono font-bold text-[#fbbf24] opacity-80">
                {sets[1] ? (isHome ? sets[1].home : sets[1].away) : '0'}
              </span>
            </div>
          )}

          {/* Set 3 */}
          {showSet3 && (
            <div className="w-40 flex items-center justify-center bg-[#0a0a0a]">
              <span className="text-5xl font-mono font-bold text-[#fbbf24] opacity-80">
                {sets[2] ? (isHome ? sets[2].home : sets[2].away) : '0'}
              </span>
            </div>
          )}

          {/* Points (Current Set) */}
          <div className="w-64 flex items-center justify-center border-l-4 border-slate-700 bg-black">
            <span
              className={cn(
                'text-8xl lg:text-9xl font-mono font-black tabular-nums tracking-tighter',
                isServing ? 'text-[#4ade80]' : 'text-[#4ade80]',
              )}
            >
              {team.score}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      className="w-screen h-screen bg-black overflow-hidden flex flex-col font-sans cursor-pointer select-none"
      onClick={toggleFullscreen}
      style={themeStyles}
    >
      {/* Top Header Strip - Simplified */}
      <div className="h-16 bg-[#111] border-b border-slate-800 flex items-center justify-between px-8">
        <div className="flex items-center gap-4">
          <div className="bg-[#fbbf24] text-black px-2 py-1 text-sm font-bold uppercase rounded-sm">
            {displayCategory}
          </div>
          <span className="text-gray-400 font-mono text-xl uppercase tracking-widest">
            {displayCategoryName}
          </span>
        </div>
        {/* Hiding Match ID and Status as requested "cuma judul..." */}
        <div className="flex items-center gap-6">
          {/* Empty or Logo if needed */}
        </div>
      </div>

      {/* Main Scoreboard Area */}
      <div className="flex-1 flex flex-col justify-center max-w-[95%] mx-auto w-full py-8">
        {/* Table Header - Conditional */}
        <div className="grid grid-cols-[1fr_auto] mb-2 px-2">
          <div></div>
          <div className="flex text-gray-500 font-mono text-sm font-bold uppercase tracking-widest text-center">
            {showSet1 && <div className="w-40">Set 1</div>}
            {showSet2 && <div className="w-40">Set 2</div>}
            {showSet3 && <div className="w-40">Set 3</div>}
            <div className="w-64 text-[#fbbf24]">Points</div>
          </div>
        </div>

        {/* Container Board */}
        <div className="border-4 border-slate-800 rounded-lg overflow-hidden bg-black shadow-2xl shadow-green-900/10 flex flex-col">
          {renderRow(home, true)}
          {renderRow(away, false)}
        </div>

        {/* Footer / Match Context - Simplified */}
        <div className="mt-8 flex justify-center gap-12 text-gray-600 font-mono uppercase text-sm tracking-[0.3em]">
          <span>Court 1</span>
        </div>
      </div>
    </div>
  );
}
