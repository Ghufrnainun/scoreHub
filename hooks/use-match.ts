'use client';

import { useState, useEffect, useCallback } from 'react';
import { useConvexConnectionState, useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type {
  DisplayConfig,
  MatchRole,
  MatchState,
  MatchFormat,
  TeamLineupRow,
} from '@/lib/match-types';

interface UseMatchOptions {
  matchId: string;
  role: MatchRole;
  pin?: string;
  token?: string;
  adminSessionToken?: string;
}

interface UseMatchReturn {
  match: MatchState | null;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  // Actions
  awardPoint: (winner: 'home' | 'away', value?: number) => void;
  updateScore: (team: 'home' | 'away', delta: number) => void;
  undo: () => void;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  updateConfig: (config: Partial<DisplayConfig>) => void;
  changeServe: (team: 'home' | 'away', position?: 'left' | 'right') => void;
  useChallenge: (team: 'home' | 'away') => void;
  toggleSides: () => void;
  resetMatch: () => void;
  finishMatch: () => void;
  updateTimer: (elapsed: number, duration?: number) => void;
  updateMatchMetadata: (payload: {
    tournamentName?: string;
    assignedReferee?: string;
    matchFormat?: MatchFormat;
    homeTeamName?: string;
    awayTeamName?: string;
    homePlayers?: { name: string; country?: string }[];
    awayPlayers?: { name: string; country?: string }[];
    teamLineup?: TeamLineupRow[];
    badmintonMaxPoints?: number;
  }) => void;
  // Timer computed value
  remainingTime: number;
}

export function useMatch({
  matchId,
  role,
  pin,
  token,
  adminSessionToken,
}: UseMatchOptions): UseMatchReturn {
  const matchResult = useQuery(api.matches.get, { matchId });
  const match = matchResult ?? null;
  const connectionState = useConvexConnectionState();
  const isConnected = connectionState.isWebSocketConnected;
  const isLoading = matchResult === undefined;
  const [error, setError] = useState<string | null>(null);
  const [remainingTime, setRemainingTime] = useState(0);

  const awardPointMutation = useMutation(api.matches.awardPoint);
  const updateScoreMutation = useMutation(api.matches.updateScore);
  const undoMutation = useMutation(api.matches.undo);
  const timerStartMutation = useMutation(api.matches.timerStart);
  const timerPauseMutation = useMutation(api.matches.timerPause);
  const timerResetMutation = useMutation(api.matches.timerReset);
  const updateConfigMutation = useMutation(api.matches.updateDisplayConfig);
  const changeServeMutation = useMutation(api.matches.changeServe);
  const useChallengeMutation = useMutation(api.matches.useChallenge);
  const toggleSidesMutation = useMutation(api.matches.toggleSides);

  const resetMatchMutation = useMutation(api.matches.resetMatch);
  const finishMatchMutation = useMutation(api.matches.finishMatch);
  const updateTimerMutation = useMutation(api.matches.updateTimer);
  const updateMatchMetadataMutation = useMutation(api.matches.updateMatchMetadata);

  const runMutation = useCallback(async (fn: () => Promise<unknown>) => {
    try {
      await fn();
      setError(null);
    } catch (err: any) {
      const message =
        err?.data && typeof err.data === 'string'
          ? err.data
          : err?.message && typeof err.message === 'string'
            ? err.message.includes('Server Error')
              ? 'Aksi gagal. Silakan coba lagi.'
              : err.message.replace(/^ConvexError:\s*/i, '')
            : 'Aksi gagal. Silakan coba lagi.';
      setError(message);
      setTimeout(() => setError(null), 5000);
    }
  }, []);

  // Timer countdown effect
  useEffect(() => {
    if (!match?.timer) return;

    const calculateRemaining = () => {
      const timer = match?.timer;
      if (!timer) return 0;

      if (timer.mode === 'stopped' || timer.duration === 0) {
        // Count up mode or no timer
        if (timer.startedAt) {
          return timer.elapsed + (Date.now() - timer.startedAt) / 1000;
        }
        return timer.elapsed;
      }

      // Countdown mode
      if (timer.startedAt) {
        const elapsed = timer.elapsed + (Date.now() - timer.startedAt) / 1000;
        return Math.max(0, timer.duration - elapsed);
      }

      return Math.max(0, timer.duration - timer.elapsed);
    };

    setRemainingTime(calculateRemaining());

    if (match.timer.startedAt && !match.timer.pausedAt) {
      const interval = setInterval(() => {
        setRemainingTime(calculateRemaining());
      }, 500);

      return () => clearInterval(interval);
    }
  }, [match?.timer]);

  // Action callbacks
  const awardPoint = useCallback(
    (winner: 'home' | 'away', value?: number) => {
      runMutation(() =>
        awardPointMutation({
          matchId,
          role,
          pin,
          token,
          adminSessionToken,
          winner,
          value,
        }),
      );
    },
    [awardPointMutation, matchId, pin, role, runMutation, token, adminSessionToken],
  );

  const updateScore = useCallback(
    (team: 'home' | 'away', delta: number) => {
      runMutation(() =>
        updateScoreMutation({
          matchId,
          role,
          pin,
          token,
          adminSessionToken,
          team,
          delta,
        }),
      );
    },
    [matchId, pin, role, runMutation, token, updateScoreMutation, adminSessionToken],
  );

  const undo = useCallback(() => {
    runMutation(() => undoMutation({ matchId, role, pin, token, adminSessionToken }));
  }, [matchId, pin, role, runMutation, token, undoMutation, adminSessionToken]);

  const startTimer = useCallback(() => {
    runMutation(() => timerStartMutation({ matchId, role, pin, token, adminSessionToken }));
  }, [matchId, pin, role, runMutation, timerStartMutation, token, adminSessionToken]);

  const pauseTimer = useCallback(() => {
    runMutation(() => timerPauseMutation({ matchId, role, pin, token, adminSessionToken }));
  }, [matchId, pin, role, runMutation, timerPauseMutation, token, adminSessionToken]);

  const resetTimer = useCallback(() => {
    runMutation(() => timerResetMutation({ matchId, role, pin, token, adminSessionToken }));
  }, [matchId, pin, role, runMutation, timerResetMutation, token, adminSessionToken]);

  const updateConfig = useCallback(
    (config: Partial<DisplayConfig>) => {
      runMutation(() =>
        updateConfigMutation({
          matchId,
          role,
          pin,
          token,
          adminSessionToken,
          config,
        }),
      );
    },
    [matchId, pin, role, runMutation, token, updateConfigMutation, adminSessionToken],
  );

  const changeServe = useCallback(
    (team: 'home' | 'away', position?: 'left' | 'right') => {
      runMutation(() =>
        changeServeMutation({
          matchId,
          role,
          pin,
          token,
          adminSessionToken,
          team,
          position,
        }),
      );
    },
    [changeServeMutation, matchId, pin, role, runMutation, token, adminSessionToken],
  );

  const useChallenge = useCallback(
    (team: 'home' | 'away') => {
      runMutation(() =>
        useChallengeMutation({
          matchId,
          role,
          pin,
          token,
          adminSessionToken,
          team,
        }),
      );
    },
    [matchId, pin, role, runMutation, token, useChallengeMutation, adminSessionToken],
  );

  const toggleSides = useCallback(() => {
    runMutation(() => toggleSidesMutation({ matchId, role, pin, token, adminSessionToken }));
  }, [matchId, pin, role, runMutation, token, toggleSidesMutation, adminSessionToken]);

  const resetMatch = useCallback(() => {
    runMutation(() => resetMatchMutation({ matchId, role, pin, token, adminSessionToken }));
  }, [matchId, pin, role, resetMatchMutation, runMutation, token, adminSessionToken]);

  const finishMatch = useCallback(() => {
    runMutation(() => finishMatchMutation({ matchId, role, pin, token, adminSessionToken }));
  }, [finishMatchMutation, matchId, pin, role, runMutation, token, adminSessionToken]);

  const updateTimer = useCallback(
    (elapsed: number, duration?: number) => {
      runMutation(() =>
        updateTimerMutation({
          matchId,
          role,
          pin,
          token,
          adminSessionToken,
          elapsed,
          duration,
        }),
      );
    },
    [matchId, pin, role, runMutation, token, updateTimerMutation, adminSessionToken],
  );

  const updateMatchMetadata = useCallback(
    (payload: {
      tournamentName?: string;
      assignedReferee?: string;
      matchFormat?: MatchFormat;
      homeTeamName?: string;
      awayTeamName?: string;
      homePlayers?: { name: string; country?: string }[];
      awayPlayers?: { name: string; country?: string }[];
      teamLineup?: TeamLineupRow[];
      badmintonMaxPoints?: number;
    }) => {
      runMutation(() =>
        updateMatchMetadataMutation({
          matchId,
          role,
          pin,
          token,
          adminSessionToken,
          ...payload,
        }),
      );
    },
    [matchId, pin, role, runMutation, token, updateMatchMetadataMutation, adminSessionToken],
  );

  return {
    match,
    isConnected,
    isLoading,
    error,
    awardPoint,
    updateScore,
    undo,
    startTimer,
    pauseTimer,
    resetTimer,
    updateConfig,
    changeServe,
    useChallenge,
    toggleSides,
    resetMatch,
    finishMatch,
    updateTimer,
    updateMatchMetadata,
    remainingTime,
  };
}
