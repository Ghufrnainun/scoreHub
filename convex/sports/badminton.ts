import { MatchState, SportRules, TeamSide } from './types';

export class BadmintonRules implements SportRules {
  initMatch(config: any): Partial<MatchState> {
    return {
      currentSet: 1,
      sets: [],
      server: 'home',
      servingPlayerIndex: 0,
      serviceCourt: 'right',
      isFlipped: false,
      isFlippedInSet3: false,
      sportState: {
        badminton: {
          maxPoints: config.badmintonMaxPoints ?? 21,
        },
      },
    };
  }

  awardPoint(state: MatchState, winner: TeamSide): MatchState {
    const newState = JSON.parse(JSON.stringify(state));
    const previousServer = state.server;
    const isDoubles = state.gameMode === 'double';

    const oldScore = newState.teams[winner].score;
    newState.teams[winner].score += 1;
    const newScore = newState.teams[winner].score;

    const maxPointsSetting = newState.sportState?.badminton?.maxPoints ?? 21;
    const changeOfEndsPoint = maxPointsSetting === 15 ? 8 : 11;

    if (
      newState.currentSet === 3 &&
      newScore >= changeOfEndsPoint &&
      oldScore < changeOfEndsPoint &&
      !newState.isFlippedInSet3
    ) {
      newState.isFlipped = !newState.isFlipped;
      newState.isFlippedInSet3 = true;
    }

    if (winner === previousServer) {
      if (isDoubles) {
        const team = newState.teams[winner];
        [team.playerPositions[0], team.playerPositions[1]] = [
          team.playerPositions[1],
          team.playerPositions[0],
        ];
        newState.serviceCourt = newScore % 2 === 0 ? 'right' : 'left';
      } else {
        newState.serviceCourt = newScore % 2 === 0 ? 'right' : 'left';
      }
    } else {
      newState.server = winner;
      if (isDoubles) {
        const team = newState.teams[winner];
        const correctCourtIndex = newScore % 2 === 0 ? 0 : 1;
        newState.servingPlayerIndex = team.playerPositions[correctCourtIndex];
        newState.serviceCourt = newScore % 2 === 0 ? 'right' : 'left';
      } else {
        newState.servingPlayerIndex = 0;
        newState.serviceCourt = newScore % 2 === 0 ? 'right' : 'left';
      }
    }

    const receiverSide = winner === 'home' ? 'away' : 'home';
    newState.receiver = receiverSide;
    if (isDoubles) {
      const receiverTeam = newState.teams[receiverSide];
      const receivingCourtIndex = newScore % 2 === 0 ? 0 : 1;
      newState.receivingPlayerIndex =
        receiverTeam.playerPositions[receivingCourtIndex];
    } else {
      newState.receivingPlayerIndex = 0;
    }

    const homeScore = newState.teams.home.score;
    const awayScore = newState.teams.away.score;
    const setPoint = maxPointsSetting;
    const maxScore = maxPointsSetting === 15 ? 21 : 30;

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
      newState.sets.push({ home: homeScore, away: awayScore });
      newState.teams[setWinner].setsWon += 1;
      newState.teams.home.score = 0;
      newState.teams.away.score = 0;
      newState.currentSet += 1;
      newState.isFlipped = !newState.isFlipped;

      if (newState.teams[setWinner].setsWon >= 2 || newState.currentSet >= 4) {
        newState.status = 'finished';
        newState.winner = setWinner;
      } else {
        newState.server = setWinner;
        newState.servingPlayerIndex = 0;
        newState.serviceCourt = 'right';
        newState.receivingPlayerIndex = 0;
        newState.receiver = setWinner === 'home' ? 'away' : 'home';
        newState.teams.home.playerPositions = [0, 1];
        newState.teams.away.playerPositions = [0, 1];
      }
    }

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
