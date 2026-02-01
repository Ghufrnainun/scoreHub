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
    };
  }

  awardPoint(state: MatchState, winner: TeamSide): MatchState {
    const newState = JSON.parse(JSON.stringify(state));
    const previousServer = state.server;
    const isDoubles = state.gameMode === 'double';

    // 1. Update Score
    const oldScore = newState.teams[winner].score;
    newState.teams[winner].score++;
    const newScore = newState.teams[winner].score;

    // 2. Side Switching Check (in Set 3 at 11 pts)
    if (
      newState.currentSet === 3 &&
      newScore >= 11 &&
      oldScore < 11 &&
      !newState.isFlippedInSet3
    ) {
      newState.isFlipped = !newState.isFlipped;
      newState.isFlippedInSet3 = true;
    }

    // 3. Update Serving State
    if (winner === previousServer) {
      // Serving side won the point
      if (isDoubles) {
        // Swap player positions (alternate courts)
        const team = newState.teams[winner];
        [team.playerPositions[0], team.playerPositions[1]] = [
          team.playerPositions[1],
          team.playerPositions[0],
        ];
        // Server remains the same player, but court changes based on new score
        newState.serviceCourt = newScore % 2 === 0 ? 'right' : 'left';
      } else {
        // Singles: Server remains same, court based on score
        newState.serviceCourt = newScore % 2 === 0 ? 'right' : 'left';
      }
    } else {
      // Receiving side won the point (Service Over)
      newState.server = winner;
      if (isDoubles) {
        // Find who is standing in the correct court for the new score
        const team = newState.teams[winner];
        const correctCourtIndex = newScore % 2 === 0 ? 0 : 1; // 0=Even/Right, 1=Odd/Left
        newState.servingPlayerIndex = team.playerPositions[correctCourtIndex];
        newState.serviceCourt = newScore % 2 === 0 ? 'right' : 'left';
      } else {
        // Singles
        newState.servingPlayerIndex = 0;
        newState.serviceCourt = newScore % 2 === 0 ? 'right' : 'left';
      }
    }

    // Determine receiver (based on score parity)
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

    // 4. Check Set Win
    const homeScore = newState.teams.home.score;
    const awayScore = newState.teams.away.score;
    const maxScore = 30;
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
      newState.sets.push({ home: homeScore, away: awayScore });
      newState.teams[setWinner].setsWon++;
      newState.teams.home.score = 0;
      newState.teams.away.score = 0;
      newState.currentSet++;

      // Side flip at end of set
      newState.isFlipped = !newState.isFlipped;

      if (newState.teams[setWinner].setsWon >= 2 || newState.currentSet >= 4) {
        newState.status = 'finished';
        newState.winner = setWinner;
      } else {
        // Reset server/receiver for next set start (Winner serves first)
        newState.server = setWinner;
        newState.servingPlayerIndex = 0;
        newState.serviceCourt = 'right';
        newState.receivingPlayerIndex = 0; // Standardize for next set start
        newState.receiver = setWinner === 'home' ? 'away' : 'home';
        // Reset positions to default [0, 1] for both teams starting a new set
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
