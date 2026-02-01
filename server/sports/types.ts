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
}

export interface TeamState {
  name: string;
  players: Player[];
  score: number;
  setsWon: number;
  challenges: number;
  country?: string;
  logo?: string;
  // playerPositions[0] is in Even (Right) court, playerPositions[1] is in Odd (Left) court
  // Stores the index of the player in team.players array
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
  id: string;
  matchId: string;
  sport: string; // 'badminton', 'tennis', etc.
  gameMode?: 'single' | 'double';
  category?: 'MS' | 'WS' | 'MD' | 'WD' | 'XD';
  status: 'active' | 'finished' | 'scheduled' | 'paused';
  teams: {
    home: TeamState;
    away: TeamState;
  };
  currentSet: number;
  sets: { home: number; away: number }[]; // History of set scores
  server?: TeamSide; // Who is serving (home/away)
  servingPlayerIndex?: number; // Index in team.players (0 or 1)
  receiver?: TeamSide; // Who is receiving
  receivingPlayerIndex?: number; // Index in team.players (0 or 1)
  serviceCourt?: 'left' | 'right'; // For badminton/tennis
  isFlipped?: boolean; // If true, home is right and away is left
  isFlippedInSet3?: boolean;
  winner?: TeamSide;

  // Undo History
  history: MatchState[];

  timer?: TimerState;

  // SaaS Features
  adminPin?: string;
  refereeToken?: string;
  ads?: {
    active: boolean;
    currentAssetId?: string;
  };
  displayConfig?: {
    templateId: string;
    primaryColor?: string;
  };

  // Sport-specific extended state
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
