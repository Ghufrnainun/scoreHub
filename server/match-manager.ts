import { MatchState, SportRules, TeamSide, MatchRole } from './sports/types';
import { BadmintonRules } from './sports/badminton';

// Re-export types for compatibility
export type { MatchState, TeamSide, MatchRole };

export class MatchManager {
  private matches: Map<string, MatchState> = new Map();
  private ruleEngines: Map<string, SportRules> = new Map();

  constructor() {
    // Initialize supported sports
    this.ruleEngines.set('badminton', new BadmintonRules());
    // Future: this.ruleEngines.set('tennis', new TennisRules());
  }

  createMatch(config: {
    matchId: string;
    sport: string;
    gameMode?: 'single' | 'double';
    category?: 'MS' | 'WS' | 'MD' | 'WD' | 'XD';
    teams: {
      home: { name: string; players: { name: string }[] };
      away: { name: string; players: { name: string }[] };
    };
    pin?: string;
    templateId?: string;
  }): MatchState {
    const rules =
      this.ruleEngines.get(config.sport) || this.ruleEngines.get('badminton')!;

    const initialState = rules.initMatch(config);

    const match: MatchState = {
      id: config.matchId,
      matchId: config.matchId,
      sport: config.sport || 'badminton',
      category: config.category,
      gameMode: config.gameMode,
      status: 'active',
      teams: {
        home: {
          name: config.teams.home.name,
          players: config.teams.home.players,
          score: 0,
          setsWon: 0,
          challenges: 2,
          playerPositions: [0, 1],
        },
        away: {
          name: config.teams.away.name,
          players: config.teams.away.players,
          score: 0,
          setsWon: 0,
          challenges: 2,
          playerPositions: [0, 1],
        },
      },
      currentSet: 1,
      sets: [],
      history: [],
      adminPin: config.pin,
      displayConfig: {
        templateId: config.templateId || 'bwf-default',
      },
      ...initialState,
    } as MatchState;

    this.matches.set(config.matchId, match);
    return match;
  }

  getMatch(matchId: string): MatchState | undefined {
    return this.matches.get(matchId);
  }

  listMatches(): MatchState[] {
    return Array.from(this.matches.values());
  }

  deleteMatch(matchId: string): boolean {
    return this.matches.delete(matchId);
  }

  awardPoint(matchId: string, winner: TeamSide): MatchState | undefined {
    const match = this.matches.get(matchId);
    if (!match || match.status === 'finished') return undefined;

    // Save history for undo
    // Simple deep copy
    match.history.push(
      JSON.parse(
        JSON.stringify({
          ...match,
          history: [], // Don't nest history inside history
        }),
      ),
    );

    // Limit history size
    if (match.history.length > 50) match.history.shift();

    const rules =
      this.ruleEngines.get(match.sport) || this.ruleEngines.get('badminton')!;

    // Delegate to sport rules
    const newState = rules.awardPoint(match, winner);

    // Preserve runtime fields that SportRules might not return
    newState.history = match.history;
    newState.adminPin = match.adminPin;
    newState.displayConfig = match.displayConfig;
    newState.ads = match.ads;

    this.matches.set(matchId, newState);
    return newState;
  }

  updateScore(
    matchId: string,
    team: TeamSide,
    delta: number,
  ): MatchState | undefined {
    const match = this.matches.get(matchId);
    if (!match || match.status === 'finished') return undefined;

    match.teams[team].score += delta;
    if (match.teams[team].score < 0) match.teams[team].score = 0;

    return match;
  }

  useChallenge(matchId: string, team: TeamSide): MatchState | undefined {
    const match = this.matches.get(matchId);
    if (!match || match.status === 'finished') return undefined;

    if (match.teams[team].challenges > 0) {
      match.teams[team].challenges--;
      // Add history?
    }
    return match;
  }

  startTimer(matchId: string): MatchState | undefined {
    const match = this.matches.get(matchId);
    if (match && match.timer) {
      match.timer.mode = 'countdown';
      match.timer.startedAt = Date.now();
      match.timer.pausedAt = null;
    }
    return match;
  }

  pauseTimer(matchId: string): MatchState | undefined {
    const match = this.matches.get(matchId);
    if (match && match.timer && match.timer.startedAt) {
      match.timer.mode = 'stopped';
      match.timer.elapsed += (Date.now() - match.timer.startedAt) / 1000;
      match.timer.startedAt = null;
      match.timer.pausedAt = Date.now();
    }
    return match;
  }

  resetTimer(matchId: string): MatchState | undefined {
    const match = this.matches.get(matchId);
    if (match && match.timer) {
      match.timer.mode = 'stopped';
      match.timer.elapsed = 0;
      match.timer.startedAt = null;
      match.timer.pausedAt = null;
    }
    return match;
  }

  changeServe(
    matchId: string,
    team: TeamSide,
    position?: 'left' | 'right',
  ): MatchState | undefined {
    const match = this.matches.get(matchId);
    if (match) {
      match.server = team;
      if (position) match.serviceCourt = position;
    }
    return match;
  }

  changeTemplate(matchId: string, templateId: string): MatchState | undefined {
    const match = this.matches.get(matchId);
    if (match) {
      if (!match.displayConfig) match.displayConfig = { templateId };
      else match.displayConfig.templateId = templateId;
    }
    return match;
  }

  undo(matchId: string): MatchState | undefined {
    const match = this.matches.get(matchId);
    if (!match || !match.history || match.history.length === 0) return match;

    const previousState = match.history.pop();
    if (previousState) {
      // Restore state
      // We need to keep the history array which was popped
      const restoredState = {
        ...previousState,
        history: match.history,
      };
      this.matches.set(matchId, restoredState);
      return restoredState;
    }
    return match;
  }

  // Admin Features
  updateDisplayConfig(
    matchId: string,
    config: Partial<MatchState['displayConfig']>,
  ): MatchState | undefined {
    const match = this.matches.get(matchId);
    if (!match) return undefined;

    const current = match.displayConfig || { templateId: 'bwf-default' };
    match.displayConfig = { ...current, ...config };
    return match;
  }

  setAdStatus(
    matchId: string,
    active: boolean,
    assetId?: string,
  ): MatchState | undefined {
    const match = this.matches.get(matchId);
    if (!match) return undefined;

    match.ads = {
      active,
      currentAssetId: assetId,
    };
    return match;
  }

  resetMatch(matchId: string): MatchState | undefined {
    const match = this.matches.get(matchId);
    if (!match) return undefined;

    const rules =
      this.ruleEngines.get(match.sport) || this.ruleEngines.get('badminton')!;
    const initialState = rules.initMatch({
      matchId: match.id,
      sport: match.sport,
      gameMode: match.gameMode,
      category: match.category,
      teams: {
        home: {
          name: match.teams.home.name,
          players: match.teams.home.players,
        },
        away: {
          name: match.teams.away.name,
          players: match.teams.away.players,
        },
      },
      pin: match.adminPin,
    });

    const resetState: MatchState = {
      ...match,
      ...initialState,
      status: 'active',
      currentSet: 1,
      sets: [],
      history: [],
      teams: {
        home: { ...match.teams.home, score: 0, setsWon: 0, challenges: 2 },
        away: { ...match.teams.away, score: 0, setsWon: 0, challenges: 2 },
      },
    };

    this.matches.set(matchId, resetState);
    return resetState;
  }

  toggleSides(matchId: string): MatchState | undefined {
    const match = this.matches.get(matchId);
    if (!match) return undefined;

    match.isFlipped = !match.isFlipped;
    return match;
  }
}

// Singleton instance
export const matchManager = new MatchManager();
