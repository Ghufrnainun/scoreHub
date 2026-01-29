'use client';

import { io, Socket } from 'socket.io-client';

// Types synced from server
export type MatchRole = 'admin' | 'referee' | 'display';
export type GameMode = 'single' | 'double';

export interface PlayerInfo {
  name: string;
  country?: string;
}

export interface TeamState {
  name: string;
  score: number;
  country?: string;
  logo?: string;
  challenges: number;
  players: PlayerInfo[];
}

export interface TimerState {
  mode: 'countdown' | 'countup' | 'stopped';
  duration: number;
  startedAt: number | null;
  pausedAt: number | null;
  elapsed: number;
}

export interface ServeState {
  team: 'home' | 'away';
  position: 'left' | 'right';
}

export interface SetScore {
  home: number;
  away: number;
  winner?: 'home' | 'away';
}

export interface BWFRules {
  pointsToWin: number;
  maxPoints: number;
  minAdvantage: number;
  setsToWin: number;
  maxSets: number;
}

export interface DisplayConfig {
  fontScale: number;
  showTimer: boolean;
  showSets: boolean;
  showCountry: boolean;
  theme: 'dark' | 'light' | 'bwf-green';
  colors: {
    background: string;
    scoreText: string;
    leadingScore: string;
    teamName: string;
    setScore: string;
  };
  fontSize: {
    teamName: number;
    currentScore: number;
    setScore: number;
  };
}

export interface ScoreLogEntry {
  winner: 'home' | 'away';
  homeScore: number;
  awayScore: number;
  server: 'home' | 'away';
  set: number;
  timestamp: number;
}

export interface MatchState {
  id: string; // Changed from matchId to id (backend uses id, but mapped to matchId in some places?)
  // Actually backend match-manager uses `id: config.matchId` but previously server.ts mapped regular API list to matchId.
  // Let's stick to what match-manager.ts defines: MatchState has `id`.
  matchId: string; // Alias or primary? Backend sends object with `id`.
  // Wait, let's look at match-manager.ts again.
  // match-manager.ts: id: config.matchId.
  // server.ts sends `socket.emit('match:state', match)` where match is the object.
  // So client receives object with `id`.
  // BUT frontend code uses `matchId`.
  // We should align or map.
  // For now, let's try to match what the backend sends exactly.

  sport: string;
  status: 'active' | 'finished' | 'scheduled' | 'paused';
  teams: {
    home: TeamState;
    away: TeamState;
  };
  currentSet: number;
  sets: { home: number; away: number }[]; // History of set scores
  server?: 'home' | 'away'; // TeamSide
  serviceCourt?: 'left' | 'right';
  winner?: 'home' | 'away';
  gameMode?: 'single' | 'double';
  category?: 'MS' | 'WS' | 'MD' | 'WD' | 'XD'; // Standard BWF categories

  // History
  history?: object[]; // Simplified

  // SaaS Features
  adminPin?: string;
  ads?: {
    active: boolean;
    currentAssetId?: string;
  };
  displayConfig?: {
    templateId: string;
    primaryColor?: string;
  };

  // Legacy/Computed or Additional fields that might be sent
  timer?: TimerState; // If we add timer back to generic
}

// Update TeamState to generic
export interface TeamState {
  name: string;
  players: PlayerInfo[];
  score: number;
  setsWon: number;
  country?: string; // Optional
  logo?: string; // Optional
}

export interface MatchUpdate {
  type:
    | 'score'
    | 'point'
    | 'timer'
    | 'config'
    | 'template'
    | 'set'
    | 'challenge';
  teams?: MatchState['teams'];
  timer?: MatchState['timer'];
  config?: MatchState['displayConfig'];
  sets?: MatchState['sets'];
  serve?: ServeState;
  templateId?: string;
  matchWinner?: 'home' | 'away';
  status?: MatchState['status'];
}

// Socket singleton
let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    const url = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';
    socket = io(url, {
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });
  }
  return socket;
}

export function connectToMatch(
  matchId: string,
  role: MatchRole,
  pin?: string,
): Socket {
  const s = getSocket();

  s.auth = { matchId, role, pin };
  s.connect();

  return s;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
  }
}

// Event emitters
export function emitCreateMatch(data: {
  sport: string;
  teams: { home: any; away: any };
  pin: string;
  templateId?: string;
  gameMode?: GameMode;
}): void {
  socket?.emit('match:create', data);
}

export function emitPoint(winner: 'home' | 'away'): void {
  socket?.emit('point', { winner });
}

export function emitScoreUpdate(team: 'home' | 'away', delta: number): void {
  socket?.emit('score:update', { team, delta });
}

export function emitUndo(): void {
  socket?.emit('undo');
}

export function emitTimerStart(): void {
  socket?.emit('timer:start');
}

export function emitTimerPause(): void {
  socket?.emit('timer:pause');
}

export function emitTimerReset(): void {
  socket?.emit('timer:reset');
}

export function emitConfigUpdate(config: Partial<DisplayConfig>): void {
  socket?.emit('config:update', config);
}

export function emitTemplateChange(templateId: string): void {
  socket?.emit('template:change', templateId);
}

export function emitChangeServe(
  team: 'home' | 'away',
  position?: 'left' | 'right',
): void {
  socket?.emit('serve:change', { team, position });
}

export function emitUseChallenge(team: 'home' | 'away'): void {
  socket?.emit('challenge:use', { team });
}
