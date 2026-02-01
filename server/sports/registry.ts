import { SportDefinition, SportId } from './types';
import sportConfig from '../../config/sports.json';

const SPORT_TOGGLES = new Map(
  (sportConfig.sports || []).map((sport) => [sport.id, sport.enabled]),
);

export const SPORT_REGISTRY: Record<SportId, SportDefinition> = {
  badminton: {
    id: 'badminton',
    name: 'Badminton',
    enabled: SPORT_TOGGLES.get('badminton') ?? true,
    templates: ['modern', 'classic', 'minimal', 'neon'],
  },
  basketball: {
    id: 'basketball',
    name: 'Basketball',
    enabled: SPORT_TOGGLES.get('basketball') ?? false,
    templates: ['hoops-classic', 'hoops-led'],
  },
  volleyball: {
    id: 'volleyball',
    name: 'Volleyball',
    enabled: SPORT_TOGGLES.get('volleyball') ?? false,
    templates: ['volley-clean', 'volley-led'],
  },
  tennis: {
    id: 'tennis',
    name: 'Tennis',
    enabled: SPORT_TOGGLES.get('tennis') ?? false,
    templates: ['tennis-scoreline', 'tennis-minimal'],
  },
  futsal: {
    id: 'futsal',
    name: 'Futsal',
    enabled: SPORT_TOGGLES.get('futsal') ?? false,
    templates: ['futsal-broadcast', 'futsal-minimal'],
  },
  soccer: {
    id: 'soccer',
    name: 'Soccer',
    enabled: SPORT_TOGGLES.get('soccer') ?? false,
    templates: ['soccer-broadcast', 'soccer-minimal'],
  },
};

export function isSportEnabled(
  sportId: string | undefined,
): sportId is SportId {
  if (!sportId) return false;
  const entry = SPORT_REGISTRY[sportId as SportId];
  return Boolean(entry && entry.enabled);
}

export function resolveSportId(sportId: string | undefined): SportId {
  return isSportEnabled(sportId) ? (sportId as SportId) : 'badminton';
}
