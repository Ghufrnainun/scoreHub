export type MatchRole = 'admin' | 'referee' | 'display';
export type TeamSide = 'home' | 'away';
export type GameMode = 'single' | 'double';

export interface PlayerInfo {
  name: string;
  country?: string;
}

export interface TeamState {
  name: string;
  players: PlayerInfo[];
  score: number;
  setsWon: number;
  challenges: number;
  country?: string;
  logo?: string;
  playerPositions?: number[];
}

export interface TimerState {
  mode: 'countdown' | 'countup' | 'stopped';
  duration: number;
  startedAt: number | null;
  pausedAt: number | null;
  elapsed: number;
}

export interface DisplayConfig {
  templateId: string;
  primaryColor?: string;
}

export interface MatchState {
  matchId: string;
  sport: string;
  gameMode?: GameMode;
  category?: 'MS' | 'WS' | 'MD' | 'WD' | 'XD';
  status: 'active' | 'finished' | 'scheduled' | 'paused';
  teams: {
    home: TeamState;
    away: TeamState;
  };
  currentSet: number;
  sets: { home: number; away: number }[];
  server?: TeamSide;
  servingPlayerIndex?: number;
  receiver?: TeamSide;
  receivingPlayerIndex?: number;
  serviceCourt?: 'left' | 'right';
  isFlipped?: boolean;
  isFlippedInSet3?: boolean;
  winner?: TeamSide;
  timer?: TimerState;
  sportState?: Record<string, any>;
  displayConfig?: DisplayConfig;
  ads?: {
    active: boolean;
    currentAssetId?: string;
  };
  history?: MatchState[];
}
