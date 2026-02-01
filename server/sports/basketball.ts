import { MatchState, SportRules, TeamSide } from './types';

export class BasketballRules implements SportRules {
  initMatch(): Partial<MatchState> {
    return {
      currentSet: 1,
      sets: [],
      isFlipped: false,
      sportState: {
        basketball: {
          currentPeriod: 1,
          periods: [
            { home: 0, away: 0 },
            { home: 0, away: 0 },
            { home: 0, away: 0 },
            { home: 0, away: 0 },
          ],
        },
      },
    };
  }

  awardPoint(state: MatchState, winner: TeamSide, value?: number): MatchState {
    const newState = JSON.parse(JSON.stringify(state));
    const points = value && [1, 2, 3].includes(value) ? value : 1;

    newState.teams[winner].score += points;

    const sportState = newState.sportState || {};
    if (!sportState.basketball) {
      sportState.basketball = {
        currentPeriod: 1,
        periods: [
          { home: 0, away: 0 },
          { home: 0, away: 0 },
          { home: 0, away: 0 },
          { home: 0, away: 0 },
        ],
      };
    }

    const periodIndex = Math.max(
      0,
      Math.min(3, (sportState.basketball.currentPeriod || 1) - 1),
    );
    sportState.basketball.periods[periodIndex][winner] += points;
    newState.sportState = sportState;

    return newState;
  }

  getServeState(state: MatchState): {
    server: TeamSide
    court: 'left' | 'right'
  } {
    return {
      server: state.server || 'home',
      court: state.serviceCourt || 'right',
    };
  }
}
