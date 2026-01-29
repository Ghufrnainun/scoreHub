export type MatchRole = 'admin' | 'referee' | 'display';
export type TeamSide = 'home' | 'away';

export interface Player {
  name: string;
}

export interface TeamState {
  name: string;
  players: Player[];
  score: number;
  setsWon: number;
  challenges: number;
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
  server?: TeamSide; // Who is serving
  receiver?: TeamSide; // Who is receiving
  serviceCourt?: 'left' | 'right'; // For badminton/tennis
  winner?: TeamSide;

  // Undo History
  history: MatchState[];

  timer?: TimerState;

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
}

export interface SportRules {
  initMatch(config: any): Partial<MatchState>;
  awardPoint(state: MatchState, winner: TeamSide): MatchState;
  getServeState(state: MatchState): {
    server: TeamSide;
    court: 'left' | 'right';
  };
}
