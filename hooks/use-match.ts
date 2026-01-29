'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  getSocket,
  connectToMatch,
  disconnectSocket,
  MatchState,
  MatchUpdate,
  MatchRole,
  DisplayConfig,
  emitPoint,
  emitScoreUpdate,
  emitUndo,
  emitTimerStart,
  emitTimerPause,
  emitTimerReset,
  emitConfigUpdate,
  emitChangeServe,
  emitUseChallenge,
} from '@/lib/socket';

interface UseMatchOptions {
  matchId: string;
  role: MatchRole;
  pin?: string;
}

interface UseMatchReturn {
  match: MatchState | null;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  // Actions
  awardPoint: (winner: 'home' | 'away') => void;
  updateScore: (team: 'home' | 'away', delta: number) => void;
  undo: () => void;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  updateConfig: (config: Partial<DisplayConfig>) => void;
  changeServe: (team: 'home' | 'away', position?: 'left' | 'right') => void;
  useChallenge: (team: 'home' | 'away') => void;
  // Timer computed value
  remainingTime: number;
}

export function useMatch({
  matchId,
  role,
  pin,
}: UseMatchOptions): UseMatchReturn {
  const [match, setMatch] = useState<MatchState | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [remainingTime, setRemainingTime] = useState(0);

  useEffect(() => {
    const socket = connectToMatch(matchId, role, pin);

    socket.on('connect', () => {
      setIsConnected(true);
      setIsLoading(false);
      setError(null);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('connect_error', (err) => {
      setError(err.message);
      setIsLoading(false);
    });

    socket.on('match:state', (state: MatchState) => {
      setMatch(state);
      setIsLoading(false);
    });

    socket.on('match:update', (update: any) => {
      // Backend now sends full state mostly on events?
      // Actually backend code says: io.to(matchId).emit('match:state', match);
      // But legacy code might send match:update.
      // If backend sends match:state, we handle it in 'match:state' listener.
      // If we need to handle partial updates, we might need to be careful.
      // Current backend only emits 'match:state' with full match object for points/scores.
      // It emits 'match:update' only for timer/config?
      // Let's look at server.ts:
      // socket.on('timer:start') -> emit('match:update', { type: 'timer', timer: match.timer })
      // So partial updates are still used for Timers.

      setMatch((prev) => {
        if (!prev) return prev;
        const updated = { ...prev };

        // Map timer if needed
        if (update.type === 'timer' && update.timer)
          updated.timer = update.timer;
        if (update.type === 'config' && update.config)
          updated.displayConfig = update.config; // Mapped

        return updated;
      });
    });

    // Special listener for full state refresh if needed
    socket.on('match:refresh', (state: MatchState) => {
      setMatch(state);
    });

    socket.on('match:ended', () => {
      setError('Match has ended');
    });

    socket.on('error:permission', (message: string) => {
      setError(message);
      // Clear error after 3 seconds
      setTimeout(() => setError(null), 3000);
    });

    socket.on('error:undo', (message: string) => {
      setError(message);
      setTimeout(() => setError(null), 3000);
    });

    return () => {
      disconnectSocket();
    };
  }, [matchId, role, pin]);

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
      }, 100);

      return () => clearInterval(interval);
    }
  }, [match?.timer]);

  // Action callbacks
  const awardPoint = useCallback((winner: 'home' | 'away') => {
    emitPoint(winner);
  }, []);

  const updateScore = useCallback((team: 'home' | 'away', delta: number) => {
    emitScoreUpdate(team, delta);
  }, []);

  const undo = useCallback(() => {
    emitUndo();
  }, []);

  const startTimer = useCallback(() => {
    emitTimerStart();
  }, []);

  const pauseTimer = useCallback(() => {
    emitTimerPause();
  }, []);

  const resetTimer = useCallback(() => {
    emitTimerReset();
  }, []);

  const updateConfig = useCallback((config: Partial<DisplayConfig>) => {
    emitConfigUpdate(config);
  }, []);

  const changeServe = useCallback(
    (team: 'home' | 'away', position?: 'left' | 'right') => {
      emitChangeServe(team, position);
    },
    [],
  );

  const useChallenge = useCallback((team: 'home' | 'away') => {
    emitUseChallenge(team);
  }, []);

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
    remainingTime,
  };
}
