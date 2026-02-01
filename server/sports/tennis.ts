import { MatchState, SportRules, TeamSide } from './types';

export class TennisRules implements SportRules {
  initMatch(): Partial<MatchState> {
    return {
      currentSet: 1,
      sets: [],
      isFlipped: false,
      sportState: {
        tennis: {
          points: { home: 0, away: 0 },
          games: { home: 0, away: 0 },
          tiebreak: false,
          tiebreakPoints: { home: 0, away: 0 },
        },
      },
    };
  }

  awardPoint(state: MatchState, winner: TeamSide): MatchState {
    const newState = JSON.parse(JSON.stringify(state));
    const sportState = newState.sportState || {};
    if (!sportState.tennis) {
      sportState.tennis = {
        points: { home: 0, away: 0 },
        games: { home: 0, away: 0 },
        tiebreak: false,
        tiebreakPoints: { home: 0, away: 0 },
      };
    }

    const tennis = sportState.tennis as {
      points: { home: number; away: number };
      games: { home: number; away: number };
      tiebreak: boolean;
      tiebreakPoints: { home: number; away: number };
    };

    const loser: TeamSide = winner === 'home' ? 'away' : 'home';

    const winSet = (setWinner: TeamSide) => {
      newState.sets.push({
        home: tennis.games.home,
        away: tennis.games.away,
      });
      newState.teams[setWinner].setsWon += 1;
      tennis.games.home = 0;
      tennis.games.away = 0;
      tennis.points.home = 0;
      tennis.points.away = 0;
      tennis.tiebreak = false;
      tennis.tiebreakPoints.home = 0;
      tennis.tiebreakPoints.away = 0;
      newState.currentSet += 1;
      newState.isFlipped = !newState.isFlipped;

      if (newState.teams[setWinner].setsWon >= 2) {
        newState.status = 'finished';
        newState.winner = setWinner;
      }
    };

    const winGame = (gameWinner: TeamSide) => {
      tennis.points.home = 0;
      tennis.points.away = 0;
      tennis.games[gameWinner] += 1;

      const gameDiff = Math.abs(tennis.games.home - tennis.games.away);
      if (
        (tennis.games[gameWinner] >= 6 && gameDiff >= 2) ||
        tennis.games[gameWinner] === 7
      ) {
        winSet(gameWinner);
        return;
      }

      if (tennis.games.home === 6 && tennis.games.away === 6) {
        tennis.tiebreak = true;
        tennis.tiebreakPoints.home = 0;
        tennis.tiebreakPoints.away = 0;
      }
    };

    if (tennis.tiebreak) {
      tennis.tiebreakPoints[winner] += 1;
      const tbDiff = Math.abs(
        tennis.tiebreakPoints.home - tennis.tiebreakPoints.away,
      );
      if (tennis.tiebreakPoints[winner] >= 7 && tbDiff >= 2) {
        winSet(winner);
      }
    } else {
      const winnerPoint = tennis.points[winner];
      const loserPoint = tennis.points[loser];

      if (winnerPoint <= 2) {
        tennis.points[winner] += 1;
      } else if (winnerPoint === 3) {
        if (loserPoint <= 2) {
          winGame(winner);
        } else if (loserPoint === 3) {
          tennis.points[winner] = 4;
        } else {
          tennis.points[loser] = 3;
        }
      } else if (winnerPoint === 4) {
        winGame(winner);
      }
    }

    newState.teams.home.score = tennis.games.home;
    newState.teams.away.score = tennis.games.away;
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
