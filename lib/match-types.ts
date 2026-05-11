export type MatchRole = 'admin' | 'referee' | 'display';
export type TeamSide = 'home' | 'away';
export type GameMode = 'single' | 'double';
export type MatchFormat = 'perorangan' | 'beregu';
export type TeamMatchCategory = 'MS' | 'WS' | 'MD' | 'WD' | 'XD';

export interface PlayerInfo {
  name: string;
  country?: string;
}

export interface TeamLineupRow {
  home: string;
  homeSecond?: string;
  away: string;
  awaySecond?: string;
  type: TeamMatchCategory;
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
  displayCode: string;
  sport: string;
  gameMode?: GameMode;
  matchFormat?: MatchFormat;
  category?: 'MS' | 'WS' | 'MD' | 'WD' | 'XD';
  teamLineup?: TeamLineupRow[];
  tournamentName?: string;
  status:
    | 'created'
    | 'ready_for_referee'
    | 'live'
    | 'active'
    | 'finished'
    | 'scheduled'
    | 'paused';
  createdBy?: string;
  assignedReferee?: string;
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
  refereeAuth: {
    failedAttempts: number;
    lockUntil: number | null;
    lastAttemptAt: number | null;
  };
  createdAt: number;
  updatedAt: number;
  history?: MatchState[];
}
