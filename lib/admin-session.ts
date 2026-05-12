import {
  clearAdminSession,
  loadAdminSession,
  type AdminSession,
} from './auth';

export const loadValidAdminSession = (): AdminSession | null => {
  const session = loadAdminSession();
  if (!session) return null;
  if (session.expiresAt <= Date.now()) {
    clearAdminSession();
    return null;
  }
  return session;
};

