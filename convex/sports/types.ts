export type MatchRole = 'admin' | 'referee' | 'display';
export type TeamSide = 'home' | 'away';
export type SportId =
  | 'badminton'
  | 'basketball'
  | 'volleyball'
  | 'tennis'
  | 'futsal'
  | 'soccer';

export interface Player {
  name: string;
  country?: string;
}

export interface TeamState {
  name: string;
  players: Player[];
  score: number;
  setsWon: number;
  challenges: number;
  country?: string;
  logo?: string;
  playerPositions: number[];
}

export interface TimerState {
  mode: 'countdown' | 'countup' | 'stopped';
  duration: number;
  startedAt: number | null;
  pausedAt: number | null;
  elapsed: number;
}

export interface MatchState {
  matchId: string;
  displayCode: string;
  sport: string;
  gameMode?: 'single' | 'double';
  category?: 'MS' | 'WS' | 'MD' | 'WD' | 'XD';
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
  history?: MatchState[];
  timer?: TimerState;
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
  displayConfig?: {
    templateId: string;
    primaryColor?: string;
  };
  sportState?: Record<string, any>;
}

export interface SportRules {
  initMatch(config: any): Partial<MatchState>;
  awardPoint(state: MatchState, winner: TeamSide, value?: number): MatchState;
  getServeState(state: MatchState): {
    server: TeamSide;
    court: 'left' | 'right';
  };
}

export interface SportDefinition {
  id: SportId;
  name: string;
  enabled: boolean;
  templates: string[];
}
