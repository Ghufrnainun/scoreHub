import { MatchState, SportRules, TeamSide } from './types';

export class FutsalRules implements SportRules {
  initMatch(): Partial<MatchState> {
    return {
      currentSet: 1,
      sets: [],
      isFlipped: false,
      sportState: {
        futsal: {
          currentPeriod: 1,
          periods: [
            { home: 0, away: 0 },
            { home: 0, away: 0 },
          ],
        },
      },
    };
  }

  awardPoint(state: MatchState, winner: TeamSide, value?: number): MatchState {
    const newState = JSON.parse(JSON.stringify(state));
    const goals = value && value > 0 ? value : 1;
    newState.teams[winner].score += goals;

    const sportState = newState.sportState || {};
    if (!sportState.futsal) {
      sportState.futsal = {
        currentPeriod: 1,
        periods: [
          { home: 0, away: 0 },
          { home: 0, away: 0 },
        ],
      };
    }

    const periodIndex = Math.max(
      0,
      Math.min(1, (sportState.futsal.currentPeriod || 1) - 1),
    );
    sportState.futsal.periods[periodIndex][winner] += goals;
    newState.sportState = sportState;

    return newState;
  }

  getServeState(state: MatchState): {
    server: TeamSide;
    court: 'left' | 'right';
  } {
    return {
      server: state.server || 'home',
      court: state.serviceCourt || 'right',
    };
  }
}
