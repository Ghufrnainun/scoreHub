export const ADMIN_AUTH_STORAGE_KEY = 'scorehub:admin:session';
export const ADMIN_AUTH_TTL_MS = 1000 * 60 * 60 * 8;

export interface AdminSession {
  token: string;
  expiresAt: number;
}

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

const getAdminSessionStorage = () =>
  typeof window === 'undefined' ? null : window.sessionStorage;

export const saveAdminSession = (session: AdminSession) => {
  const storage = getAdminSessionStorage();
  if (!storage) return;
  storage.setItem(ADMIN_AUTH_STORAGE_KEY, JSON.stringify(session));
};

export const loadAdminSession = (): AdminSession | null => {
  const storage = getAdminSessionStorage();
  if (!storage) return null;
  const raw = storage.getItem(ADMIN_AUTH_STORAGE_KEY);
  const fallbackRaw = raw || window.localStorage.getItem(ADMIN_AUTH_STORAGE_KEY);
  const source = raw || fallbackRaw;
  if (!source) return null;
  if (!raw && fallbackRaw) {
    storage.setItem(ADMIN_AUTH_STORAGE_KEY, fallbackRaw);
  }
  try {
    const parsed = JSON.parse(source) as Partial<AdminSession>;
    if (!parsed?.token || !parsed?.expiresAt) return null;
    return {
      token: parsed.token,
      expiresAt: parsed.expiresAt,
    };
  } catch {
    return null;
  }
};

export const clearAdminSession = () => {
  const storage = getAdminSessionStorage();
  if (!storage) return;
  storage.removeItem(ADMIN_AUTH_STORAGE_KEY);
  window.localStorage.removeItem(ADMIN_AUTH_STORAGE_KEY);
};

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

export const isAdminAuthenticated = (): boolean => {
  const session = loadAdminSession();
  if (!session) return false;
  return session.expiresAt > Date.now();
};
