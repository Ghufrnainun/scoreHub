import { MatchState, SportRules, TeamSide } from './types';

export class VolleyballRules implements SportRules {
  initMatch(): Partial<MatchState> {
    return {
      currentSet: 1,
      sets: [],
      isFlipped: false,
      sportState: {
        volleyball: {
          maxSets: 5,
          setsToWin: 3,
        },
      },
    };
  }

  awardPoint(state: MatchState, winner: TeamSide, value?: number): MatchState {
    const newState = JSON.parse(JSON.stringify(state));
    const points = value && value > 0 ? value : 1;
    newState.teams[winner].score += points;

    const homeScore = newState.teams.home.score;
    const awayScore = newState.teams.away.score;
    const maxSets =
      newState.sportState?.volleyball?.maxSets !== undefined
        ? newState.sportState.volleyball.maxSets
        : 5;
    const setsToWin =
      newState.sportState?.volleyball?.setsToWin !== undefined
        ? newState.sportState.volleyball.setsToWin
        : 3;
    const isFinalSet = newState.currentSet === maxSets;
    const setPoint = isFinalSet ? 15 : 25;
    const winBy = 2;

    let setWinner: TeamSide | null = null;
    if (homeScore >= setPoint && homeScore - awayScore >= winBy) {
      setWinner = 'home';
    } else if (awayScore >= setPoint && awayScore - homeScore >= winBy) {
      setWinner = 'away';
    }

    if (setWinner) {
      newState.sets.push({ home: homeScore, away: awayScore });
      newState.teams[setWinner].setsWon += 1;
      newState.teams.home.score = 0;
      newState.teams.away.score = 0;
      newState.currentSet += 1;
      newState.isFlipped = !newState.isFlipped;

      if (newState.teams[setWinner].setsWon >= setsToWin) {
        newState.status = 'finished';
        newState.winner = setWinner;
      }
    }

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
