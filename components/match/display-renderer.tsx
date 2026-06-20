'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';
import type { DisplaySettings } from './display-settings';

const ShuttlecockIcon = ({
  className,
  style,
  isServing = false,
}: {
  className?: string;
  style?: React.CSSProperties;
  isServing?: boolean;
}) => (
  <svg
    aria-hidden="true"
    className={cn(
      className,
      'transition-all duration-500',
      isServing && 'drop-shadow-[0_0_15px_rgba(251,191,36,0.8)]',
    )}
    viewBox="0 -0.42 42.356 42.356"
    fill="currentColor"
    style={style}
  >
    <path
      d="M157.288,169.268l2.295,5.865s-8.735,11.6-9.88,13.583-4.124,3.328-4.124,3.328l-1.666,3.2,2.738,2.738,1.709-1.709a49.942,49.942,0,0,1,2.636-5.656c1.212-2.013,9.826-13.669,9.826-13.669L167.7,178.3l1.354,6.882s-11.6,8.556-13.669,9.826a46.424,46.424,0,0,1-5.656,2.636l-1.709,1.709,2.693,2.693,3.363-1.745s1.327-2.963,3.3-4.1,13.5-9.8,13.5-9.8l5.852,2.307-1.6,5.511s-13.267,5.661-15.275,6.735a48.208,48.208,0,0,1-5.477,1.733l-6.765,3.887.711.711-2.45,2.45-.092-.092a6.523,6.523,0,0,1-8.253-.714l-1.83-1.83c-2.214-2.214-1.388-4.625.6-6.938l-.034-.034.942-.942h0l1.508-1.508.665.665,3.8-6.589a21.029,21.029,0,0,1,1.759-5.5c1.146-1.986,6.814-15.355,6.814-15.355l5.536-1.63M142.993,197l-1.7,3.259,2.223,2.223-.686-.686,2.479-2.479Zm3.689,3.689L144.2,203.17l1.483,1.483,3.265-1.694Z"
      transform="translate(-134.376 -169.268)"
    />
  </svg>
);

const getCountryCode = (value?: string) => {
  if (!value) return '';
  const trimmed = value.trim();
  if (!trimmed) return '';
  const cleaned = trimmed.replace(/[^a-zA-Z]/g, '');
  if (cleaned.length === 2 || cleaned.length === 3) {
    return cleaned.toUpperCase();
  }
  if (cleaned.length > 3) {
    return cleaned.slice(0, 3).toUpperCase();
  }
  return trimmed
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 3)
    .toUpperCase();
};

const TeamMark = ({
  team,
  teamCode,
  showCode = true,
  teamColor,
  size = 'lg',
}: {
  team: any;
  teamCode?: string;
  showCode?: boolean;
  teamColor?: string;
  size?: 'sm' | 'md' | 'lg';
}) => {
  const fallbackCode = getCountryCode(team.country) || team.name.slice(0, 3);
  const code = (teamCode || fallbackCode).toUpperCase();
  const sizeClasses =
    size === 'sm'
      ? 'w-10 h-7 rounded-sm'
      : size === 'md'
        ? 'w-14 h-9 rounded-sm'
        : 'w-16 h-10 rounded-sm';
  const textClasses =
    size === 'sm' ? 'text-xs' : size === 'md' ? 'text-xs' : 'text-sm';
  return (
    <div className="flex items-center gap-4">
      <div
        className={cn(
          'shadow-sm relative overflow-hidden border border-white/10',
          sizeClasses,
        )}
        style={
          teamColor
            ? { backgroundColor: teamColor }
            : { backgroundColor: '#111' }
        }
      >
        {team.logo ? (
          <Image
            src={team.logo}
            alt={`${team.name} logo`}
            fill
            sizes="64px"
            unoptimized
            className="h-full w-full object-contain bg-black/10"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-white/80 font-bold tracking-widest uppercase">
            <span className={textClasses}>{code}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-black/20"></div>
      </div>
      {showCode && (
        <span className="font-bold text-3xl tracking-widest text-white font-mono">
          {code}
        </span>
      )}
    </div>
  );
};

// --- TEMPLATE COMPONENTS ---

interface TemplateProps {
  match: any;
  displaySettings: DisplaySettings;
}

const ModernTemplate = ({ match, displaySettings }: TemplateProps) => {
  const { teams, sets, server, status, currentSet, category } =
    match;
  const home = match.teams.home;
  const away = match.teams.away;
  const isSingles = category === 'MS' || category === 'WS';
  const isTeamMatch =
    !isSingles &&
    ((home.players?.length || 0) > 2 || (away.players?.length || 0) > 2);

  const showSet1 = currentSet > 1 || status === 'finished';
  const showSet2 = currentSet > 2 || status === 'finished';
  const showSet3 = status === 'finished' && sets.length >= 3;
  const showSetWinsAtRight = status === 'finished' && !isTeamMatch;

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
      <div className="grid grid-cols-[1fr_auto] border-b border-slate-800 last:border-0 flex-1 min-h-[120px] sm:min-h-[160px]">
        <div className="flex items-center px-4 sm:px-12 gap-4 sm:gap-8 bg-[#111] relative overflow-hidden">
          {isServing && (
            <div
              className="absolute left-0 top-0 bottom-0 w-3 animate-pulse motion-reduce:animate-none"
              style={{ backgroundColor: teamColor }}
            ></div>
          )}
          <TeamMark
            team={team}
            teamCode={teamCode || undefined}
            showCode={showCode}
            teamColor={teamColor}
            size="lg"
          />
          <span
            className={cn(
              'font-bold tracking-tight truncate uppercase flex items-center gap-6',
              isServing ? 'text-white' : 'text-gray-400',
            )}
            style={{ fontSize: `${displaySettings.fontSizes.teamName}px` }}
          >
            {isTeamMatch ? (
              <span className="inline-flex items-center rounded-md border border-emerald-400/30 bg-emerald-500/15 px-3 py-1 text-base sm:text-lg font-black text-emerald-300 font-mono tracking-wider">
                {team.setsWon}
              </span>
            ) : null}
            {displayNames}
            {isServing && displaySettings.showServerIcon && (
              <ShuttlecockIcon
                isServing={true}
                className="w-10 h-10 text-[#fbbf24] animate-in motion-reduce:animate-none zoom-in duration-300 animate-pulse"
              />
            )}
          </span>
        </div>

        <div className="flex bg-black">
          {showSet1 && (
            <div className="w-16 sm:w-24 md:w-40 flex items-center justify-center bg-[#0a0a0a]">
              <span className="text-2xl sm:text-3xl md:text-5xl font-mono font-bold text-[#fbbf24] opacity-80 tabular-nums">
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
            <div className="w-16 sm:w-24 md:w-40 flex items-center justify-center bg-[#0a0a0a]">
              <span className="text-2xl sm:text-3xl md:text-5xl font-mono font-bold text-[#fbbf24] opacity-80 tabular-nums">
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
            <div className="w-16 sm:w-24 md:w-40 flex items-center justify-center bg-[#0a0a0a]">
              <span className="text-2xl sm:text-3xl md:text-5xl font-mono font-bold text-[#fbbf24] opacity-80 tabular-nums">
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
          <div className="w-24 sm:w-32 md:w-64 flex items-center justify-center border-l-2 sm:border-l-4 border-slate-700 bg-black">
            <span
              className="font-mono font-black tabular-nums tracking-tighter text-[#4ade80]"
              style={{
                fontSize: `clamp(24px, 10vw, ${displaySettings.fontSizes.score}px)`,
              }}
            >
              {showSetWinsAtRight ? team.setsWon : team.score}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col justify-center max-w-[95%] mx-auto w-full py-8">
      <div className="grid grid-cols-[1fr_auto] mb-2 px-2">
        <div></div>
        <div className="flex text-gray-500 font-mono text-xs sm:text-sm font-bold uppercase tracking-widest text-center">
          {showSet1 && <div className="w-16 sm:w-24 md:w-40">Set 1</div>}
          {showSet2 && <div className="w-16 sm:w-24 md:w-40">Set 2</div>}
          {showSet3 && <div className="w-16 sm:w-24 md:w-40">Set 3</div>}
          <div className="w-24 sm:w-32 md:w-64 text-[#fbbf24]">
            {showSetWinsAtRight ? 'Set Menang' : 'Poin'}
          </div>
        </div>
      </div>

      <div className="rounded-lg overflow-hidden bg-black shadow-2xl flex flex-col">
        {renderRow(home, true)}
        {renderRow(away, false)}
      </div>
    </div>
  );
};

const ClassicTemplate = ({ match, displaySettings }: TemplateProps) => {
  const { teams, sets, server, currentSet } = match;
  const home = match.teams.home;
  const away = match.teams.away;

  const renderRow = (team: any, isHome: boolean) => {
    const isServing = server === (isHome ? 'home' : 'away');
    const teamColor = isHome
      ? displaySettings.teamColors.home
      : displaySettings.teamColors.away;
    return (
      <div className="flex items-center min-h-[6rem] border-b border-slate-700 bg-[#1a1a1a]">
        <div
          className="w-4 h-full"
          style={{ backgroundColor: isServing ? teamColor : 'transparent' }}
        ></div>
        <div className="flex-1 px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <TeamMark
              team={team}
              teamCode={undefined}
              showCode={false}
              teamColor={teamColor}
              size="sm"
            />
            <span className="font-bold text-xl sm:text-3xl uppercase text-white truncate max-w-[150px] sm:max-w-none">
              {team.name}
            </span>
            {isServing && displaySettings.showServerIcon && (
              <ShuttlecockIcon
                isServing={true}
                className="w-6 h-6 text-amber-500 animate-pulse"
              />
            )}
          </div>
          <div className="flex gap-8 items-center">
            {sets.map((s: any, idx: number) => (
              <div key={idx} className="text-2xl font-mono text-gray-500">
                {isHome ? s.home : s.away}
              </div>
            ))}
            <div className="text-3xl sm:text-6xl font-mono font-black text-white tabular-nums px-2 sm:px-4 bg-black/40 rounded">
              {team.score}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex items-center justify-center p-8">
      <div className="w-full max-w-6xl rounded-xl border-4 border-slate-700 overflow-hidden shadow-2xl">
        {renderRow(home, true)}
        {renderRow(away, false)}
      </div>
    </div>
  );
};

const MinimalTemplate = ({ match, displaySettings }: TemplateProps) => {
  const { teams, server } = match;
  const home = match.teams.home;
  const away = match.teams.away;

  const renderSide = (team: any, isHome: boolean) => {
    const isServing = server === (isHome ? 'home' : 'away');
    const teamColor = isHome
      ? displaySettings.teamColors.home
      : displaySettings.teamColors.away;
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.4em] text-slate-500 mb-4 opacity-50">
          {isHome
            ? displaySettings.teamLabels?.home || 'TUAN RUMAH'
            : displaySettings.teamLabels?.away || 'TAMU'}
        </p>
        <div className="mb-6">
          <TeamMark
            team={team}
            teamCode={undefined}
            showCode={false}
            teamColor={teamColor}
            size="md"
          />
        </div>
        <div className="mb-8 relative">
          <h2
            className={cn(
              'text-2xl sm:text-4xl md:text-6xl font-black uppercase tracking-tighter truncate max-w-[200px] sm:max-w-none',
              isServing ? 'text-white' : 'text-slate-600',
            )}
          >
            {team.name}
          </h2>
          {isServing && displaySettings.showServerIcon && (
            <div className="absolute -right-16 top-1/2 -translate-y-1/2">
              <ShuttlecockIcon
                isServing={true}
                className="w-12 h-12 text-amber-400 animate-pulse"
              />
            </div>
          )}
        </div>
        <div
          className="text-[120px] sm:text-[180px] md:text-[240px] leading-none font-black tabular-nums transition-[color,text-shadow] duration-300"
          style={{
            color: isServing
              ? isHome
                ? displaySettings.teamColors.home
                : displaySettings.teamColors.away
              : '#1a1a1a',
            textShadow: isServing ? '0 0 40px rgba(255,255,255,0.1)' : 'none',
          }}
        >
          {team.score}
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 flex divide-x divide-slate-800">
      {renderSide(home, true)}
      {renderSide(away, false)}
    </div>
  );
};

const NeonTemplate = ({ match, displaySettings }: TemplateProps) => {
  const { teams, server } = match;
  const home = match.teams.home;
  const away = match.teams.away;

  const renderNeonPanel = (team: any, isHome: boolean) => {
    const isServing = server === (isHome ? 'home' : 'away');
    const color = isHome
      ? displaySettings.teamColors.home
      : displaySettings.teamColors.away;
    return (
      <div
        className={cn(
          'flex-1 m-4 rounded-3xl border-2 transition-[opacity,background-color,border-color,filter] duration-500 flex flex-col items-center justify-center relative overflow-hidden',
          isServing
            ? 'border-white/20 bg-white/5'
            : 'border-white/5 bg-transparent opacity-40 grayscale',
        )}
      >
        {isServing && (
          <div
            className="absolute inset-0 bg-gradient-to-br opacity-20 pointer-events-none"
            style={{
              backgroundImage: `linear-gradient(to bottom right, ${color}, transparent)`,
            }}
          ></div>
        )}
        <div className="z-10 text-center">
          <p className="text-sm font-bold uppercase tracking-[0.5em] text-white/50 mb-4">
            {isHome
              ? displaySettings.teamLabels?.home || 'TUAN RUMAH'
              : displaySettings.teamLabels?.away || 'TAMU'}
          </p>
          <div className="mb-6 flex justify-center">
            <TeamMark
              team={team}
              teamCode={undefined}
              showCode={false}
              teamColor={color}
              size="md"
            />
          </div>
          <h2 className="text-xl sm:text-2xl md:text-4xl font-black uppercase tracking-widest text-white mb-4 sm:mb-8 transition-transform truncate max-w-[250px] sm:max-w-none">
            {team.name}
          </h2>
          <div className="relative">
            <span
              className="text-[100px] sm:text-[140px] md:text-[180px] font-black leading-none tabular-nums italic"
              style={{
                color: color,
                filter: `drop-shadow(0 0 20px ${color}80)`,
              }}
            >
              {team.score}
            </span>
            {isServing && (
              <div className="absolute -top-12 -right-12 animate-bounce motion-reduce:animate-none">
                <ShuttlecockIcon
                  isServing={true}
                  className="w-16 h-16 text-amber-300"
                  style={{ filter: 'drop-shadow(0 0 20px #fbbf24)' }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 flex p-8 bg-[#050505]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      {renderNeonPanel(home, true)}
      <div className="flex flex-col items-center justify-center gap-4 z-10">
        <div className="w-px h-32 bg-gradient-to-b from-transparent via-white/20 to-transparent"></div>
        <span className="text-2xl font-black italic text-white/20 uppercase tracking-tighter">
          VS
        </span>
        <div className="w-px h-32 bg-gradient-to-b from-transparent via-white/20 to-transparent"></div>
      </div>
      {renderNeonPanel(away, false)}
    </div>
  );
};

const BasketballTemplate = ({ match, displaySettings }: TemplateProps) => {
  const sportState = match.sportState?.basketball;
  const periods = sportState?.periods || [
    { home: 0, away: 0 },
    { home: 0, away: 0 },
    { home: 0, away: 0 },
    { home: 0, away: 0 },
  ];
  const currentPeriod = sportState?.currentPeriod || 1;

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-10 py-8">
      <div className="w-full max-w-6xl rounded-2xl border border-slate-800 bg-black/80 p-8">
        <div className="flex items-center justify-between text-white">
          <div>
            <p className="text-xs text-slate-400 text-pretty">Bola Basket</p>
            <h2 className="text-3xl font-black text-balance">Skor Langsung</h2>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400 text-pretty">Kuarter</p>
            <p className="text-2xl font-mono font-black tabular-nums">
              {currentPeriod}
            </p>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-8">
          {(['home', 'away'] as const).map((side) => {
            const teamColor =
              side === 'home'
                ? displaySettings.teamColors.home
                : displaySettings.teamColors.away;
            return (
              <div
                key={side}
                className="rounded-xl border border-slate-800 bg-[#0a0a0a] p-6 text-white"
              >
                <div className="flex items-center gap-3">
                  <TeamMark
                    team={match.teams[side]}
                    teamCode={undefined}
                    showCode={false}
                    teamColor={teamColor}
                    size="sm"
                  />
                  <p className="text-sm font-semibold text-pretty">
                    {match.teams[side].name}
                  </p>
                </div>
                <p className="mt-3 text-7xl font-black tabular-nums">
                  {match.teams[side].score}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-8 grid grid-cols-4 gap-4 text-center text-white">
          {periods.map((period: any, idx: number) => (
            <div
              key={`q-${idx}`}
              className="rounded-lg border border-slate-800 bg-[#111] px-3 py-2"
            >
              <p className="text-xs text-slate-400 text-pretty">
                Q{idx + 1}
              </p>
              <p className="mt-1 text-sm font-mono font-bold tabular-nums">
                {period.home} - {period.away}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const VolleyballTemplate = ({ match, displaySettings }: TemplateProps) => {
  const sets = match.sets || [];
  return (
    <div className="flex-1 flex items-center justify-center px-10 py-8">
      <div className="w-full max-w-6xl rounded-2xl border border-slate-800 bg-black/80 p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 text-pretty">Bola Voli</p>
            <h2 className="text-3xl font-black text-balance">Skor Set</h2>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400 text-pretty">Set</p>
            <p className="text-2xl font-mono font-black tabular-nums">
              {match.currentSet}
            </p>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-8">
          {(['home', 'away'] as const).map((side) => {
            const teamColor =
              side === 'home'
                ? displaySettings.teamColors.home
                : displaySettings.teamColors.away;
            return (
              <div
                key={side}
                className="rounded-xl border border-slate-800 bg-[#0a0a0a] p-6"
              >
                <div className="flex items-center gap-3">
                  <TeamMark
                    team={match.teams[side]}
                    teamCode={undefined}
                    showCode={false}
                    teamColor={teamColor}
                    size="sm"
                  />
                  <p className="text-sm font-semibold text-pretty">
                    {match.teams[side].name}
                  </p>
                </div>
                <p className="mt-3 text-6xl font-black tabular-nums">
                  {match.teams[side].score}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-8 grid grid-cols-5 gap-3">
          {[0, 1, 2, 3, 4].map((idx) => (
            <div
              key={`set-${idx}`}
              className="rounded-lg border border-slate-800 bg-[#111] px-3 py-2 text-center"
            >
              <p className="text-xs text-slate-400 text-pretty">
                Set {idx + 1}
              </p>
              <p className="mt-1 text-sm font-mono font-bold tabular-nums">
                {sets[idx] ? `${sets[idx].home} - ${sets[idx].away}` : '-'}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const TennisTemplate = ({ match, displaySettings }: TemplateProps) => {
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
    <div className="flex-1 flex items-center justify-center px-10 py-8">
      <div className="w-full max-w-6xl rounded-2xl border border-slate-800 bg-black/80 p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 text-pretty">Tenis</p>
            <h2 className="text-3xl font-black text-balance">Skor</h2>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400 text-pretty">Set</p>
            <p className="text-2xl font-mono font-black tabular-nums">
              {match.currentSet}
            </p>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-8">
          {(['home', 'away'] as const).map((side) => {
            const teamColor =
              side === 'home'
                ? displaySettings.teamColors.home
                : displaySettings.teamColors.away;
            return (
              <div
                key={side}
                className="rounded-xl border border-slate-800 bg-[#0a0a0a] p-6"
              >
                <div className="flex items-center gap-3">
                  <TeamMark
                    team={match.teams[side]}
                    teamCode={undefined}
                    showCode={false}
                    teamColor={teamColor}
                    size="sm"
                  />
                  <p className="text-sm font-semibold text-pretty">
                    {match.teams[side].name}
                  </p>
                </div>
                <div className="mt-4 flex items-end justify-between">
                  <div>
                    <p className="text-xs text-slate-400 text-pretty">Games</p>
                    <p className="text-4xl font-black tabular-nums">
                      {match.teams[side].score}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400 text-pretty">
                      {tennis?.tiebreak ? 'Tiebreak' : 'Poin'}
                    </p>
                    <p className="text-3xl font-mono font-black tabular-nums">
                      {tennis?.tiebreak
                        ? pointLabel(tennis.tiebreakPoints?.[side] || 0)
                        : pointLabel(tennis?.points?.[side] || 0)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 grid grid-cols-5 gap-3 text-center">
          {[0, 1, 2, 3, 4].map((idx) => (
            <div
              key={`set-${idx}`}
              className="rounded-lg border border-slate-800 bg-[#111] px-3 py-2"
            >
              <p className="text-xs text-slate-400 text-pretty">
                Set {idx + 1}
              </p>
              <p className="mt-1 text-sm font-mono font-bold tabular-nums">
                {match.sets[idx]
                  ? `${match.sets[idx].home} - ${match.sets[idx].away}`
                  : '-'}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const SoccerTemplate = ({ match, displaySettings }: TemplateProps) => {
  const sportState = match.sportState?.soccer || match.sportState?.futsal;
  const currentPeriod = sportState?.currentPeriod || 1;
  const periodLabel = currentPeriod === 1 ? 'Babak 1' : 'Babak 2';

  return (
    <div className="flex-1 flex items-center justify-center px-10 py-8">
      <div className="w-full max-w-6xl rounded-2xl border border-slate-800 bg-black/80 p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 text-pretty">Sepak Bola</p>
            <h2 className="text-3xl font-black text-balance">
              Skor Pertandingan
            </h2>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400 text-pretty">Babak</p>
            <p className="text-2xl font-mono font-black tabular-nums">
              {periodLabel}
            </p>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-8">
          {(['home', 'away'] as const).map((side) => {
            const teamColor =
              side === 'home'
                ? displaySettings.teamColors.home
                : displaySettings.teamColors.away;
            return (
              <div
                key={side}
                className="rounded-xl border border-slate-800 bg-[#0a0a0a] p-6"
              >
                <div className="flex items-center gap-3">
                  <TeamMark
                    team={match.teams[side]}
                    teamCode={undefined}
                    showCode={false}
                    teamColor={teamColor}
                    size="sm"
                  />
                  <p className="text-sm font-semibold text-pretty">
                    {match.teams[side].name}
                  </p>
                </div>
                <p className="mt-3 text-6xl font-black tabular-nums">
                  {match.teams[side].score}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const FLAG_ISO_MAP: Record<string, string> = {
  INA: 'id', IDN: 'id', INDONESIA: 'id',
  MAS: 'my', MALAYSIA: 'my',
  CHN: 'cn', CHINA: 'cn',
  JPN: 'jp', JAPAN: 'jp',
  KOR: 'kr', KOREA: 'kr',
  DEN: 'dk', DENMARK: 'dk',
  IND: 'in', INDIA: 'in',
  THA: 'th', THAILAND: 'th',
  TPE: 'tw', TAIPEI: 'tw',
  HKG: 'hk', HKC: 'hk', 'HONG KONG': 'hk',
  SGP: 'sg', SINGAPORE: 'sg',
  ENG: 'gb-eng', ENGLAND: 'gb-eng',
  GBR: 'gb',
  NED: 'nl', NETHERLANDS: 'nl',
  GER: 'de', GERMANY: 'de',
  FRA: 'fr', FRANCE: 'fr',
  ESP: 'es', SPAIN: 'es',
  USA: 'us', CAN: 'ca', CANADA: 'ca',
  AUS: 'au', AUSTRALIA: 'au',
  PHL: 'ph', PHILIPPINES: 'ph',
  VIE: 'vn', VIETNAM: 'vn',
  MYS: 'my',
};

const BwfCourtTemplate = ({ match, displaySettings }: TemplateProps) => {
  const { teams, sets, server, status, currentSet, category } = match;
  const home = teams.home;
  const away = teams.away;
  const isFinished = status === 'finished';
  const isHomeServing = server === 'home';
  const isAwayServing = server === 'away';

  const isSingles = category === 'MS' || category === 'WS';
  const formatPlayerName = (team: any) => {
    if (isSingles) {
      return team.players?.[0]?.name || team.name;
    }
    return team.players?.length
      ? team.players.map((p: any) => p.name).join(' / ')
      : team.name;
  };

  const homeName = formatPlayerName(home);
  const awayName = formatPlayerName(away);

  // Custom colors for players (default: home is orange, away is green)
  const isDefaultHomeColor = displaySettings.teamColors.home === '#3b82f6';
  const isDefaultAwayColor = displaySettings.teamColors.away === '#ef4444';
  const homeColor = isDefaultHomeColor ? '#FF9F29' : (displaySettings.teamColors.home || '#FF9F29');
  const awayColor = isDefaultAwayColor ? '#39FF14' : (displaySettings.teamColors.away || '#39FF14');

  const homeCode = (displaySettings.teamCodes.home || getCountryCode(home.country) || home.name.slice(0, 3)).toUpperCase();
  const awayCode = (displaySettings.teamCodes.away || getCountryCode(away.country) || away.name.slice(0, 3)).toUpperCase();

  const getIsoCode = (code: string) => {
    const upper = code.trim().toUpperCase();
    if (FLAG_ISO_MAP[upper]) {
      return FLAG_ISO_MAP[upper];
    }
    if (upper.length === 2) {
      return upper.toLowerCase();
    }
    return '';
  };

  const homeIso = getIsoCode(homeCode);
  const awayIso = getIsoCode(awayCode);

  // Compile scores history
  const allSets: { home: number; away: number; isActive: boolean }[] = [];

  // Fill in past sets
  const currentSetIndex = currentSet - 1;
  for (let i = 0; i < currentSetIndex; i++) {
    const past = sets[i] || { home: 0, away: 0 };
    allSets.push({
      home: past.home,
      away: past.away,
      isActive: false,
    });
  }

  // Fill in current set
  if (!isFinished) {
    allSets.push({
      home: home.score,
      away: away.score,
      isActive: true,
    });
  } else {
    // If finished, make sure we show all played sets
    for (let i = allSets.length; i < sets.length; i++) {
      allSets.push({
        home: sets[i].home,
        away: sets[i].away,
        isActive: i === sets.length - 1, // last set is concluding
      });
    }
  }

  return (
    <div className="flex-1 w-full h-full bg-black text-white flex p-6 sm:p-12 md:p-16 select-none font-sans overflow-hidden items-stretch">
      {/* Left Column (55% width) - Matches the screenshot layout */}
      <div className="w-[55%] flex flex-col justify-between h-full py-2 sm:py-6">
        {/* Category: MS, WS, etc. */}
        <div>
          <h1 className="text-7xl sm:text-[100px] md:text-[130px] font-black leading-none text-white tracking-tighter uppercase font-sans">
            {category || 'MS'}
          </h1>
        </div>

        {/* Players Block */}
        <div className="space-y-6 sm:space-y-12">
          {/* Player 1 Row */}
          <div className="space-y-1 sm:space-y-3">
            <div className="flex items-center gap-2 sm:gap-4">
              {homeIso && (
                <img
                  src={`https://flagcdn.com/h80/${homeIso}.png`}
                  alt={homeCode}
                  className="h-8 sm:h-12 w-auto object-contain border border-white/10 shadow-sm"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              )}
              <span className="text-2xl sm:text-[44px] font-black tracking-widest text-white font-sans uppercase">
                {homeCode}
              </span>
              {isHomeServing && !isFinished && (
                <ShuttlecockIcon
                  isServing={true}
                  className="w-8 h-8 text-[#fbbf24] animate-pulse ml-2 flex-shrink-0"
                />
              )}
            </div>
            <h2
              className="text-3xl sm:text-[54px] md:text-[68px] font-extrabold tracking-tight uppercase leading-none truncate pr-4"
              style={{ color: homeColor }}
            >
              {homeName}
            </h2>
          </div>

          {/* Player 2 Row */}
          <div className="space-y-1 sm:space-y-3">
            <div className="flex items-center gap-2 sm:gap-4">
              {awayIso && (
                <img
                  src={`https://flagcdn.com/h80/${awayIso}.png`}
                  alt={awayCode}
                  className="h-8 sm:h-12 w-auto object-contain border border-white/10 shadow-sm"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              )}
              <span className="text-2xl sm:text-[44px] font-black tracking-widest text-white font-sans uppercase">
                {awayCode}
              </span>
              {isAwayServing && !isFinished && (
                <ShuttlecockIcon
                  isServing={true}
                  className="w-8 h-8 text-[#fbbf24] animate-pulse ml-2 flex-shrink-0"
                />
              )}
            </div>
            <h2
              className="text-3xl sm:text-[54px] md:text-[68px] font-extrabold tracking-tight uppercase leading-none truncate pr-4"
              style={{ color: awayColor }}
            >
              {awayName}
            </h2>
          </div>
        </div>
      </div>

      {/* Right Column (45% width) - Score blocks columns */}
      <div className="w-[45%] flex items-end justify-end h-full py-4 sm:py-6">
        <div className="flex divide-x divide-slate-800/80 border-2 border-slate-800/80 bg-black h-[280px] sm:h-[380px] md:h-[440px] rounded-2xl overflow-hidden shadow-2xl">
          {allSets.map((set, idx) => {
            const isHomeServingActive = set.isActive && isHomeServing && !isFinished;
            const isAwayServingActive = set.isActive && isAwayServing && !isFinished;

            // Highlight the winner's score box if match is finished
            const isHomeWinnerHighlight = isFinished && idx === allSets.length - 1 && match.winner === 'home';
            const isAwayWinnerHighlight = isFinished && idx === allSets.length - 1 && match.winner === 'away';

            const highlightHome = isHomeServingActive || isHomeWinnerHighlight;
            const highlightAway = isAwayServingActive || isAwayWinnerHighlight;

            return (
              <div key={idx} className="w-[90px] sm:w-[150px] md:w-[180px] flex flex-col h-full">
                {/* Player 1 score block */}
                <div
                  className={cn(
                    'flex-1 flex items-center justify-center transition-all duration-300',
                    highlightHome ? '' : 'bg-black',
                  )}
                  style={highlightHome ? { backgroundColor: homeColor } : undefined}
                >
                  <span
                    className="text-6xl sm:text-[100px] md:text-[140px] font-black leading-none font-sans tabular-nums select-none tracking-tighter"
                    style={{ color: highlightHome ? '#000000' : homeColor }}
                  >
                    {set.home}
                  </span>
                </div>

                {/* Divider between home and away */}
                <div className="h-[2px] w-full bg-slate-800/60" />

                {/* Player 2 score block */}
                <div
                  className={cn(
                    'flex-1 flex items-center justify-center transition-all duration-300',
                    highlightAway ? '' : 'bg-black',
                  )}
                  style={highlightAway ? { backgroundColor: awayColor } : undefined}
                >
                  <span
                    className="text-6xl sm:text-[100px] md:text-[140px] font-black leading-none font-sans tabular-nums select-none tracking-tighter"
                    style={{ color: highlightAway ? '#000000' : awayColor }}
                  >
                    {set.away}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export function DisplayRenderer({ match, displaySettings }: TemplateProps) {
  if (match.sport !== 'badminton') {
    if (match.sport === 'basketball') {
      return (
        <BasketballTemplate match={match} displaySettings={displaySettings} />
      );
    }
    if (match.sport === 'volleyball') {
      return (
        <VolleyballTemplate match={match} displaySettings={displaySettings} />
      );
    }
    if (match.sport === 'tennis') {
      return (
        <TennisTemplate match={match} displaySettings={displaySettings} />
      );
    }
    if (match.sport === 'soccer' || match.sport === 'futsal') {
      return (
        <SoccerTemplate match={match} displaySettings={displaySettings} />
      );
    }
    return (
      <BasketballTemplate match={match} displaySettings={displaySettings} />
    );
  }

  switch (displaySettings.template) {
    case 'classic':
      return (
        <ClassicTemplate match={match} displaySettings={displaySettings} />
      );
    case 'minimal':
      return (
        <MinimalTemplate match={match} displaySettings={displaySettings} />
      );
    case 'neon':
      return <NeonTemplate match={match} displaySettings={displaySettings} />;
    case 'bwf-court':
      return (
        <BwfCourtTemplate match={match} displaySettings={displaySettings} />
      );
    case 'modern':
    default:
      return (
        <ModernTemplate match={match} displaySettings={displaySettings} />
      );
  }
}
