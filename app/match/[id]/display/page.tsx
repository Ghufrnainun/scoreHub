'use client';

import { useParams } from 'next/navigation';
import { useMatch } from '@/hooks/use-match';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

// --- ICONS ---
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

// Display Settings interface (synced from control page)
interface DisplaySettings {
  fontSizes: { teamName: number; score: number };
  teamCodes: { home: string; away: string; show: boolean };
  teamColors: { home: string; away: string };
  courtName: string;
  showServerIcon: boolean;
}

const defaultSettings: DisplaySettings = {
  fontSizes: { teamName: 24, score: 72 },
  teamCodes: { home: '', away: '', show: true },
  teamColors: { home: '#3b82f6', away: '#ef4444' },
  courtName: 'COURT 1',
  showServerIcon: true,
};

const themeStyles = {
  '--bg': '#000000',
  '--text-primary': '#FFFFFF',
  '--text-secondary': '#fbbf24',
  '--text-highlight': '#4ade80',
  '--panel-gap': '4px',
} as React.CSSProperties;

const CountryBadge = ({
  name,
  teamCode,
  showCode,
  teamColor,
}: {
  name: string;
  teamCode?: string;
  showCode?: boolean;
  teamColor?: string;
}) => {
  const code = teamCode || name.substring(0, 3).toUpperCase();
  return (
    <div className="flex items-center gap-4">
      <div
        className={cn(
          'w-16 h-10 shadow-sm relative overflow-hidden border border-white/10 rounded-sm',
        )}
        style={teamColor ? { backgroundColor: teamColor } : {}}
      >
        <div className="absolute inset-x-0 top-0 h-1/2 bg-white/10"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-black/20"></div>
      </div>
      {showCode !== false && (
        <span className="font-bold text-3xl tracking-widest text-white font-mono">
          {code}
        </span>
      )}
    </div>
  );
};

export default function BwfScoreboard() {
  const params = useParams();
  const matchId = params.id as string;
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showFullscreenButton, setShowFullscreenButton] = useState(true);
  const [displaySettings, setDisplaySettings] =
    useState<DisplaySettings>(defaultSettings);

  const { match, isLoading, error, isConnected } = useMatch({
    matchId,
    role: 'display',
  });

  useEffect(() => {
    const loadSettings = () => {
      const saved = localStorage.getItem('displaySettings');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed) {
            setDisplaySettings((prev) => ({
              ...prev,
              ...parsed,
              fontSizes: { ...prev.fontSizes, ...parsed.fontSizes },
              teamCodes: { ...prev.teamCodes, ...parsed.teamCodes },
              teamColors: { ...prev.teamColors, ...parsed.teamColors },
            }));
          }
        } catch {}
      }
    };
    loadSettings();
    const interval = setInterval(loadSettings, 1000);
    window.addEventListener('storage', loadSettings);
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', loadSettings);
    };
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    handleFullscreenChange();

    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {
        // Autoplay fullscreen may be blocked; user can use the button instead.
      });
    }

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowFullscreenButton(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen();
    }
  };

  if (isLoading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-black text-[#fbbf24] font-mono text-2xl tracking-widest animate-pulse motion-reduce:animate-none">
        INITIALIZING SYSTEM...
      </div>
    );
  }
  if (error) {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center bg-black text-[#fbbf24] font-mono text-lg tracking-widest gap-4 text-center px-6">
        <div className="text-2xl font-bold">CONNECTION ERROR</div>
        <div className="text-sm text-gray-400 max-w-2xl">{error}</div>
        <div className="text-xs text-gray-500">
          Match ID: {matchId} - Socket: {isConnected ? 'Connected' : 'Offline'}
        </div>
      </div>
    );
  }
  if (!match) {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center bg-black text-[#fbbf24] font-mono text-lg tracking-widest gap-4 text-center px-6">
        <div className="text-2xl font-bold">WAITING FOR MATCH</div>
        <div className="text-xs text-gray-500">Match ID: {matchId}</div>
      </div>
    );
  }

  const { teams, sets, server, status, currentSet, category, isFlipped } =
    match;
  const home = match.teams.home;
  const away = match.teams.away;
  const isSingles = category === 'MS' || category === 'WS';

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

  const showSet1 = currentSet >= 1 || status === 'finished';
  const showSet2 = currentSet >= 2 || status === 'finished';
  const showSet3 =
    (status === 'finished' && sets.length >= 3) || currentSet === 3;

  const renderRow = (team: any, isHome: boolean) => {
    const isServing = server === (isHome ? 'home' : 'away');
    const displayNames = isSingles
      ? team.players?.[0]?.name || team.name
      : team.players?.length
        ? team.players.map((p: any) => p.name).join(' / ')
        : team.name;

    const teamColor = isHome
      ? displaySettings.teamColors.home
      : displaySettings.teamColors.away;
    const teamCode = isHome
      ? displaySettings.teamCodes.home
      : displaySettings.teamCodes.away;
    const showCode = displaySettings.teamCodes.show;

    return (
      <div className="grid grid-cols-[1fr_auto] border-b border-slate-800 last:border-0 flex-1 min-h-[160px]">
        <div className="flex items-center px-12 gap-8 bg-[#111] relative">
          {isServing && (
            <div
              className="absolute left-0 top-0 bottom-0 w-3 animate-pulse motion-reduce:animate-none"
              style={{ backgroundColor: teamColor }}
            ></div>
          )}
          <CountryBadge
            name={team.name}
            teamCode={teamCode || undefined}
            showCode={showCode}
            teamColor={teamColor}
          />
          <span
            className={cn(
              'font-bold tracking-tight truncate uppercase flex items-center gap-6',
              isServing ? 'text-white' : 'text-gray-400',
            )}
            style={{ fontSize: `${displaySettings.fontSizes.teamName}px` }}
          >
            {displayNames}
            {isServing && displaySettings.showServerIcon && (
              <ShuttlecockIcon className="w-10 h-10 text-[#fbbf24] animate-in zoom-in duration-300" />
            )}
          </span>
        </div>

        <div className="flex bg-black">
          {showSet1 && (
            <div className="w-40 flex items-center justify-center bg-[#0a0a0a]">
              <span className="text-5xl font-mono font-bold text-[#fbbf24] opacity-80 tabular-nums">
                {sets[0]
                  ? isHome
                    ? sets[0].home
                    : sets[0].away
                  : currentSet === 1
                    ? team.score
                    : '0'}
              </span>
            </div>
          )}
          {showSet2 && (
            <div className="w-40 flex items-center justify-center bg-[#0a0a0a]">
              <span className="text-5xl font-mono font-bold text-[#fbbf24] opacity-80 tabular-nums">
                {sets[1]
                  ? isHome
                    ? sets[1].home
                    : sets[1].away
                  : currentSet === 2
                    ? team.score
                    : '0'}
              </span>
            </div>
          )}
          {showSet3 && (
            <div className="w-40 flex items-center justify-center bg-[#0a0a0a]">
              <span className="text-5xl font-mono font-bold text-[#fbbf24] opacity-80 tabular-nums">
                {sets[2]
                  ? isHome
                    ? sets[2].home
                    : sets[2].away
                  : currentSet === 3
                    ? team.score
                    : '0'}
              </span>
            </div>
          )}
          <div className="w-64 flex items-center justify-center border-l-4 border-slate-700 bg-black">
            <span
              className="font-mono font-black tabular-nums tracking-tighter text-[#4ade80]"
              style={{ fontSize: `${displaySettings.fontSizes.score}px` }}
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
      id="main-content"
      className="w-screen h-screen bg-black overflow-hidden flex flex-col font-sans cursor-pointer select-none group"
      onClick={toggleFullscreen}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          toggleFullscreen();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label="Toggle fullscreen"
      style={themeStyles}
    >
      <div className="h-16 bg-[#111] border-b border-slate-800 flex items-center justify-between px-8">
        <div className="flex items-center gap-4">
          <div className="bg-[#fbbf24] text-black px-2 py-1 text-sm font-bold uppercase rounded-sm">
            {displayCategory}
          </div>
          <span className="text-gray-400 font-mono text-xl uppercase tracking-widest">
            {displayCategoryName}
          </span>
        </div>
        <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={(event) => {
              event.stopPropagation();
              toggleFullscreen();
            }}
            className="px-4 py-1.5 text-xs font-black uppercase tracking-widest text-black bg-[#fbbf24] rounded-sm hover:bg-[#fcd34d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fbbf24]/60 transition-colors"
            type="button"
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          >
            {isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center max-w-[95%] mx-auto w-full py-8">
        <div className="grid grid-cols-[1fr_auto] mb-2 px-2">
          <div></div>
          <div className="flex text-gray-500 font-mono text-sm font-bold uppercase tracking-widest text-center">
            {showSet1 && <div className="w-40">Set 1</div>}
            {showSet2 && <div className="w-40">Set 2</div>}
            {showSet3 && <div className="w-40">Set 3</div>}
            <div className="w-64 text-[#fbbf24]">Points</div>
          </div>
        </div>

        <div className="rounded-lg overflow-hidden bg-black shadow-2xl flex flex-col">
          {isFlipped ? renderRow(away, false) : renderRow(home, true)}
          {isFlipped ? renderRow(home, true) : renderRow(away, false)}
        </div>

        <div className="mt-8 flex justify-center gap-12 text-gray-600 font-mono uppercase text-sm tracking-[0.3em]">
          <span>{displaySettings.courtName}</span>
        </div>
      </div>
    </div>
  );
}
