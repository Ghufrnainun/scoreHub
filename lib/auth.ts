export const ADMIN_AUTH_STORAGE_KEY = 'scorehub:admin:auth';
export const ADMIN_AUTH_TTL_MS = 1000 * 60 * 60 * 8;

export const REFEREE_SESSION_STORAGE_PREFIX = 'scorehub:referee:session:';

export interface RefereeSession {
  matchId: string;
  displayCode: string;
  token: string;
  refereeName?: string;
  joinedAt: number;
}

export const getRefereeSessionStorageKey = (matchId: string) =>
  `${REFEREE_SESSION_STORAGE_PREFIX}${matchId}`;

export const saveRefereeSession = (session: RefereeSession) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(
    getRefereeSessionStorageKey(session.matchId),
    JSON.stringify(session),
  );
};

export const loadRefereeSession = (
  matchId: string,
): RefereeSession | null => {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(getRefereeSessionStorageKey(matchId));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as RefereeSession;
  } catch {
    return null;
  }
};
