import { MatchState, SportRules, TeamSide } from './types';

export class BadmintonRules implements SportRules {
  initMatch(config: any): Partial<MatchState> {
    // Config could contain scoring system overrides (e.g. 21 vs 15)
    // For now, assume standard 3x21
    return {
      currentSet: 1,
      sets: [],
      server: 'home', // Coin toss logic usually, default to home
      serviceCourt: 'right', // Start from right
    };
  }

  awardPoint(state: MatchState, winner: TeamSide): MatchState {
    const newState = JSON.parse(JSON.stringify(state)); // Deep copy for immutability

    // 1. Update Score
    newState.teams[winner].score++;

    // 2. Check Set Win
    const homeScore = newState.teams.home.score;
    const awayScore = newState.teams.away.score;
    const maxScore = 30; // BWF hard cap
    const setPoint = 21;

    let setWinner: TeamSide | null = null;

    if (
      (homeScore >= setPoint && homeScore - awayScore >= 2) ||
      homeScore === maxScore
    ) {
      setWinner = 'home';
    } else if (
      (awayScore >= setPoint && awayScore - homeScore >= 2) ||
      awayScore === maxScore
    ) {
      setWinner = 'away';
    }

    if (setWinner) {
      // Record Set
      newState.sets.push({
        home: newState.teams.home.score,
        away: newState.teams.away.score,
      });

      newState.teams[setWinner].setsWon++;

      // Reset scores for next set
      newState.teams.home.score = 0;
      newState.teams.away.score = 0;
      newState.currentSet++;

      // Check Match Win (Best of 3)
      if (newState.teams[setWinner].setsWon >= 2) {
        newState.status = 'finished';
        newState.winner = setWinner;
      }
    }

    // 3. Update Server (Winner of rally serves)
    newState.server = winner;

    // 4. Update Court (Odd/Even logic)
    // Server's score determines court
    const serverScore = newState.teams[winner].score;
    newState.serviceCourt = serverScore % 2 === 0 ? 'right' : 'left';

    return newState;
  }

  getServeState(state: MatchState): {
    server: TeamSide;
    court: 'left' | 'right';
  } {
    if (!state.server) return { server: 'home', court: 'right' };
    return {
      server: state.server,
      court: state.serviceCourt || 'right',
    };
  }
}
