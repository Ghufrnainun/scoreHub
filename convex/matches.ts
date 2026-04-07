import { mutation, query } from './_generated/server';
import { ConvexError, v } from 'convex/values';
import type { MatchRole, MatchState, TeamSide } from './sports/types';
import { getRulesForSport, resolveSportId } from './sports/registry';
import {
  assertAdminAccess,
  assertRefereeOrAdminAccess,
  generateToken,
  hashSecret,
} from './utils';

const teamSide = v.union(v.literal('home'), v.literal('away'));
const matchRole = v.union(
  v.literal('admin'),
  v.literal('referee'),
  v.literal('display'),
);
const gameMode = v.union(v.literal('single'), v.literal('double'));
const matchCategory = v.union(
  v.literal('MS'),
  v.literal('WS'),
  v.literal('MD'),
  v.literal('WD'),
  v.literal('XD'),
);

const playerInput = v.object({
  name: v.string(),
  country: v.optional(v.string()),
});

const teamInput = v.object({
  name: v.string(),
  players: v.array(playerInput),
  country: v.optional(v.string()),
  logo: v.optional(v.string()),
});

const MAX_REFEREE_PIN_ATTEMPTS = 5;
const REFEREE_LOCK_MS = 5 * 60 * 1000;

const normalizeDisplayCode = (value: string) =>
  value
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');

const normalizePublicStatus = (status: string) =>
  status === 'active' ? 'live' : status;

const activateMatchStatus = (status: string) =>
  status === 'created' || status === 'ready_for_referee' || status === 'active'
    ? 'live'
    : status;

const ensureMatch = async (ctx: any, matchId: string) => {
  const match = await ctx.db
    .query('matches')
    .withIndex('by_matchId', (q: any) => q.eq('matchId', matchId))
    .unique();
  if (!match) {
    throw new ConvexError('Match not found');
  }
  return match;
};

const ensureMatchByDisplayCode = async (ctx: any, displayCode: string) => {
  const normalizedDisplayCode = normalizeDisplayCode(displayCode);
  const match = await ctx.db
    .query('matches')
    .withIndex('by_displayCode', (q: any) =>
      q.eq('displayCode', normalizedDisplayCode),
    )
    .unique();
  if (!match) {
    throw new ConvexError('Display code not found');
  }
  return match;
};

const generateUniqueDisplayCode = async (ctx: any) => {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const candidate = generateToken(3);
    const existing = await ctx.db
      .query('matches')
      .withIndex('by_displayCode', (q: any) => q.eq('displayCode', candidate))
      .unique();
    if (!existing) {
      return candidate;
    }
  }
  throw new ConvexError('Unable to generate unique display code');
};

const stripSystemFields = (match: any) => {
  const {
    _id,
    _creationTime,
    adminPinHash,
    refereePinHash,
    refereeTokenHash,
    ...rest
  } = match;
  return rest;
};

const stripHistory = (match: any) => {
  const { history, ...rest } = match;
  return rest;
};

const sanitizeMatch = (match: any) => {
  const {
    history,
    adminPinHash,
    refereePinHash,
    refereeTokenHash,
    _id,
    _creationTime,
    ...safe
  } = match;

  return {
    ...safe,
    status: normalizePublicStatus(safe.status),
  };
};

const snapshotMatch = (match: MatchState) =>
  JSON.parse(JSON.stringify(stripHistory(match)));

const recordEvent = async (
  ctx: any,
  params: {
    matchId: string;
    action: string;
    before: MatchState | null;
    after: MatchState | null;
    role: MatchRole;
    token?: string;
  },
) => {
  const actorType = params.role === 'admin' ? 'admin' : 'referee';
  const actorTokenId = params.token
    ? await hashSecret(params.token)
    : undefined;
  await ctx.db.insert('match_events', {
    matchId: params.matchId,
    action: params.action,
    before: params.before ? stripHistory(params.before) : null,
    after: params.after ? stripHistory(params.after) : null,
    actorType,
    actorTokenId,
    createdAt: Date.now(),
  });
};

const assertAdminAction = async (match: any, role: MatchRole, pin?: string) => {
  if (role !== 'admin') {
    throw new ConvexError('Only admin can perform this action');
  }
  await assertAdminAccess(match, pin);
};

const getRefereeAuthState = (match: any) => ({
  failedAttempts: match.refereeAuth?.failedAttempts ?? 0,
  lockUntil: match.refereeAuth?.lockUntil ?? null,
  lastAttemptAt: match.refereeAuth?.lastAttemptAt ?? null,
});

export const get = query({
  args: { matchId: v.string() },
  handler: async (ctx, args) => {
    const match = await ctx.db
      .query('matches')
      .withIndex('by_matchId', (q) => q.eq('matchId', args.matchId))
      .unique();
    if (!match) return null;
    return sanitizeMatch(match);
  },
});

export const getByDisplayCode = query({
  args: { displayCode: v.string() },
  handler: async (ctx, args) => {
    const normalizedDisplayCode = normalizeDisplayCode(args.displayCode);
    if (!normalizedDisplayCode) {
      return null;
    }

    const match = await ctx.db
      .query('matches')
      .withIndex('by_displayCode', (q) =>
        q.eq('displayCode', normalizedDisplayCode),
      )
      .unique();

    if (!match) return null;

    return {
      matchId: match.matchId,
      displayCode: match.displayCode,
      sport: match.sport,
      category: match.category,
      status: normalizePublicStatus(match.status),
      teams: {
        home: match.teams.home.name,
        away: match.teams.away.name,
      },
      assignedReferee: match.assignedReferee,
      updatedAt: match.updatedAt,
    };
  },
});

export const listAdmin = query({
  args: { adminPin: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const globalPin = process.env.ADMIN_PIN;
    if (globalPin && args.adminPin !== globalPin) {
      return [];
    }

    const matches = await ctx.db.query('matches').collect();
    return matches
      .sort((a: any, b: any) => (b.updatedAt || 0) - (a.updatedAt || 0))
      .map((match: any) => ({
        matchId: match.matchId,
        displayCode: match.displayCode,
        sport: match.sport,
        category: match.category,
        status: normalizePublicStatus(match.status),
        assignedReferee: match.assignedReferee,
        teams: {
          home: match.teams.home.name,
          away: match.teams.away.name,
        },
        scores: {
          home: match.teams.home.score,
          away: match.teams.away.score,
        },
        createdAt: match.createdAt,
        updatedAt: match.updatedAt,
      }));
  },
});

export const createMatch = mutation({
  args: {
    matchId: v.string(),
    sport: v.string(),
    gameMode: v.optional(gameMode),
    category: v.optional(matchCategory),
    teams: v.object({
      home: teamInput,
      away: teamInput,
    }),
    pin: v.string(),
    adminPin: v.string(),
    createdBy: v.optional(v.string()),
    templateId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const globalAdminPin = process.env.ADMIN_PIN;
    if (!globalAdminPin) {
      throw new ConvexError('ADMIN_PIN is not configured');
    }
    if (args.adminPin !== globalAdminPin) {
      throw new ConvexError('Only admin can create match');
    }

    const existing = await ctx.db
      .query('matches')
      .withIndex('by_matchId', (q) => q.eq('matchId', args.matchId))
      .unique();
    if (existing) {
      throw new ConvexError('Match already exists');
    }

    const resolvedSport = resolveSportId(args.sport);
    const rules = getRulesForSport(resolvedSport);
    const initialState = rules.initMatch(args);

    const now = Date.now();
    const displayCode = await generateUniqueDisplayCode(ctx);
    const refereeToken = generateToken(8);
    const adminPinHash = await hashSecret(args.adminPin);
    const refereePinHash = await hashSecret(args.pin);
    const refereeTokenHash = await hashSecret(refereeToken);

    const match: MatchState = {
      matchId: args.matchId,
      displayCode,
      sport: resolvedSport,
      gameMode: args.gameMode,
      category: args.category,
      status: 'ready_for_referee',
      createdBy: args.createdBy,
      teams: {
        home: {
          name: args.teams.home.name,
          players: args.teams.home.players,
          score: 0,
          setsWon: 0,
          challenges: 2,
          country: args.teams.home.country,
          logo: args.teams.home.logo,
          playerPositions: [0, 1],
        },
        away: {
          name: args.teams.away.name,
          players: args.teams.away.players,
          score: 0,
          setsWon: 0,
          challenges: 2,
          country: args.teams.away.country,
          logo: args.teams.away.logo,
          playerPositions: [0, 1],
        },
      },
      currentSet: 1,
      sets: [],
      history: [],
      timer: {
        mode: 'stopped',
        duration: 0,
        startedAt: null,
        pausedAt: null,
        elapsed: 0,
      },
      displayConfig: {
        templateId: args.templateId || 'modern',
      },
      ads: {
        active: false,
      },
      refereeAuth: {
        failedAttempts: 0,
        lockUntil: null,
        lastAttemptAt: null,
      },
      createdAt: now,
      updatedAt: now,
      ...initialState,
    };

    await ctx.db.insert('matches', {
      ...match,
      adminPinHash,
      refereePinHash,
      refereeTokenHash,
    });

    await ctx.db.insert('referee_tokens', {
      matchId: args.matchId,
      tokenHash: refereeTokenHash,
      expiresAt: now + 1000 * 60 * 60 * 12,
      createdAt: now,
    });

    await recordEvent(ctx, {
      matchId: args.matchId,
      action: 'match:create',
      before: null,
      after: match,
      role: 'admin',
    });

    return {
      matchId: args.matchId,
      displayCode,
      refereeToken,
      status: match.status,
    };
  },
});

export const joinAsReferee = mutation({
  args: {
    displayCode: v.string(),
    pin: v.string(),
    refereeName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const match = await ensureMatchByDisplayCode(ctx, args.displayCode);

    if (match.status === 'finished') {
      throw new ConvexError('Match already finished');
    }

    const now = Date.now();
    const authState = getRefereeAuthState(match);
    if (authState.lockUntil && authState.lockUntil > now) {
      const remainingSeconds = Math.ceil((authState.lockUntil - now) / 1000);
      throw new ConvexError(
        `Too many failed attempts. Try again in ${remainingSeconds}s.`,
      );
    }

    const pinHash = await hashSecret(args.pin);
    const expectedPinHash = match.refereePinHash || match.adminPinHash;

    if (pinHash !== expectedPinHash) {
      const failedAttempts = authState.failedAttempts + 1;
      const shouldLock = failedAttempts >= MAX_REFEREE_PIN_ATTEMPTS;
      const nextAuthState = {
        failedAttempts: shouldLock ? 0 : failedAttempts,
        lockUntil: shouldLock ? now + REFEREE_LOCK_MS : null,
        lastAttemptAt: now,
      };

      await ctx.db.patch(match._id, {
        refereeAuth: nextAuthState,
        updatedAt: now,
      });

      if (shouldLock) {
        throw new ConvexError(
          'Too many failed attempts. Access temporarily locked.',
        );
      }

      throw new ConvexError('Invalid referee PIN');
    }

    const sessionToken = generateToken(12);
    const sessionTokenHash = await hashSecret(sessionToken);
    const nextStatus = activateMatchStatus(match.status);

    const updatedState: MatchState = {
      ...(stripSystemFields(match) as MatchState),
      status: nextStatus as MatchState['status'],
      assignedReferee:
        args.refereeName?.trim() || match.assignedReferee || undefined,
      refereeAuth: {
        failedAttempts: 0,
        lockUntil: null,
        lastAttemptAt: now,
      },
      updatedAt: now,
    };

    await ctx.db.patch(match._id, {
      refereeTokenHash: sessionTokenHash,
      status: updatedState.status,
      assignedReferee: updatedState.assignedReferee,
      refereeAuth: updatedState.refereeAuth,
      updatedAt: now,
    });

    await ctx.db.insert('referee_tokens', {
      matchId: match.matchId,
      tokenHash: sessionTokenHash,
      expiresAt: now + 1000 * 60 * 60 * 12,
      createdAt: now,
    });

    await recordEvent(ctx, {
      matchId: match.matchId,
      action: 'referee:join',
      before: stripSystemFields(match) as MatchState,
      after: updatedState,
      role: 'referee',
      token: sessionToken,
    });

    return {
      matchId: match.matchId,
      displayCode: match.displayCode,
      token: sessionToken,
      status: normalizePublicStatus(updatedState.status),
      sport: match.sport,
      teams: {
        home: match.teams.home.name,
        away: match.teams.away.name,
      },
    };
  },
});

export const updateScore = mutation({
  args: {
    matchId: v.string(),
    role: matchRole,
    pin: v.optional(v.string()),
    token: v.optional(v.string()),
    team: teamSide,
    delta: v.number(),
  },
  handler: async (ctx, args) => {
    const match = await ensureMatch(ctx, args.matchId);
    await assertRefereeOrAdminAccess(
      match,
      args.role as MatchRole,
      args.pin,
      args.token,
    );
    if (match.status === 'finished') {
      throw new ConvexError('Match already finished');
    }

    const team = match.teams[args.team as TeamSide];
    const newScore = Math.max(0, team.score + args.delta);
    const updatedTeams = {
      ...match.teams,
      [args.team]: {
        ...team,
        score: newScore,
      },
    };

    const now = Date.now();
    const nextStatus = activateMatchStatus(match.status);

    const afterState: MatchState = {
      ...(stripSystemFields(match) as MatchState),
      teams: updatedTeams,
      status: nextStatus as MatchState['status'],
      updatedAt: now,
    };

    await ctx.db.patch(match._id, {
      teams: updatedTeams,
      status: nextStatus as MatchState['status'],
      updatedAt: now,
    });

    await recordEvent(ctx, {
      matchId: args.matchId,
      action: 'score:update',
      before: stripSystemFields(match) as MatchState,
      after: afterState,
      role: args.role as MatchRole,
      token: args.token,
    });

    return sanitizeMatch({ ...match, ...afterState });
  },
});

export const awardPoint = mutation({
  args: {
    matchId: v.string(),
    role: matchRole,
    pin: v.optional(v.string()),
    token: v.optional(v.string()),
    winner: teamSide,
    value: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const match = await ensureMatch(ctx, args.matchId);
    await assertRefereeOrAdminAccess(
      match,
      args.role as MatchRole,
      args.pin,
      args.token,
    );
    if (match.status === 'finished') {
      throw new ConvexError('Match already finished');
    }

    const matchState = stripSystemFields(match) as MatchState;
    const history = Array.isArray(match.history) ? match.history : [];
    const snapshot = snapshotMatch(matchState);
    const nextHistory = [...history, snapshot];
    if (nextHistory.length > 50) nextHistory.shift();

    const rules = getRulesForSport(matchState.sport);
    const baseState = {
      ...matchState,
      history: [],
      status: activateMatchStatus(matchState.status) as MatchState['status'],
    };
    const nextState = rules.awardPoint(
      baseState,
      args.winner as TeamSide,
      args.value,
    );

    const now = Date.now();
    const updated: MatchState = {
      ...nextState,
      displayCode: match.displayCode,
      createdBy: match.createdBy,
      assignedReferee: match.assignedReferee,
      history: nextHistory,
      displayConfig: match.displayConfig,
      ads: match.ads,
      refereeAuth: getRefereeAuthState(match),
      createdAt: match.createdAt,
      updatedAt: now,
    };

    await ctx.db.replace(match._id, {
      ...updated,
      adminPinHash: match.adminPinHash,
      refereePinHash: match.refereePinHash || match.adminPinHash,
      refereeTokenHash: match.refereeTokenHash,
    });

    await recordEvent(ctx, {
      matchId: args.matchId,
      action: 'point',
      before: matchState,
      after: updated,
      role: args.role as MatchRole,
      token: args.token,
    });

    return sanitizeMatch({
      ...updated,
      adminPinHash: match.adminPinHash,
      refereePinHash: match.refereePinHash,
      refereeTokenHash: match.refereeTokenHash,
    });
  },
});

export const undo = mutation({
  args: {
    matchId: v.string(),
    role: matchRole,
    pin: v.optional(v.string()),
    token: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const match = await ensureMatch(ctx, args.matchId);
    await assertRefereeOrAdminAccess(
      match,
      args.role as MatchRole,
      args.pin,
      args.token,
    );

    const history = Array.isArray(match.history) ? match.history : [];
    if (history.length === 0) {
      throw new ConvexError('Nothing to undo');
    }

    const previous = history[history.length - 1] as Partial<MatchState>;
    const nextHistory = history.slice(0, -1);
    const now = Date.now();

    const restored: MatchState = {
      ...(stripSystemFields(match) as MatchState),
      ...previous,
      displayCode: match.displayCode,
      createdBy: match.createdBy,
      assignedReferee: match.assignedReferee,
      history: nextHistory,
      displayConfig: match.displayConfig,
      ads: match.ads,
      refereeAuth: getRefereeAuthState(match),
      createdAt: match.createdAt,
      updatedAt: now,
    };

    await ctx.db.replace(match._id, {
      ...restored,
      adminPinHash: match.adminPinHash,
      refereePinHash: match.refereePinHash || match.adminPinHash,
      refereeTokenHash: match.refereeTokenHash,
    });

    await recordEvent(ctx, {
      matchId: args.matchId,
      action: 'undo',
      before: stripSystemFields(match) as MatchState,
      after: restored,
      role: args.role as MatchRole,
      token: args.token,
    });

    return sanitizeMatch({
      ...restored,
      adminPinHash: match.adminPinHash,
      refereePinHash: match.refereePinHash,
      refereeTokenHash: match.refereeTokenHash,
    });
  },
});

export const resetMatch = mutation({
  args: {
    matchId: v.string(),
    role: matchRole,
    pin: v.optional(v.string()),
    token: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const match = await ensureMatch(ctx, args.matchId);
    await assertAdminAction(match, args.role as MatchRole, args.pin);

    const matchState = stripSystemFields(match) as MatchState;
    const rules = getRulesForSport(matchState.sport);
    const initialState = rules.initMatch({
      matchId: matchState.matchId,
      sport: matchState.sport,
      gameMode: matchState.gameMode,
      category: matchState.category,
      teams: {
        home: {
          name: matchState.teams.home.name,
          players: matchState.teams.home.players,
        },
        away: {
          name: matchState.teams.away.name,
          players: matchState.teams.away.players,
        },
      },
    });

    const now = Date.now();
    const resetState: MatchState = {
      ...matchState,
      ...initialState,
      status: 'ready_for_referee',
      currentSet: 1,
      sets: [],
      history: [],
      timer: {
        mode: 'stopped',
        duration: 0,
        startedAt: null,
        pausedAt: null,
        elapsed: 0,
      },
      teams: {
        home: { ...matchState.teams.home, score: 0, setsWon: 0, challenges: 2 },
        away: { ...matchState.teams.away, score: 0, setsWon: 0, challenges: 2 },
      },
      refereeAuth: {
        failedAttempts: 0,
        lockUntil: null,
        lastAttemptAt: null,
      },
      updatedAt: now,
    };

    await ctx.db.replace(match._id, {
      ...resetState,
      adminPinHash: match.adminPinHash,
      refereePinHash: match.refereePinHash || match.adminPinHash,
      refereeTokenHash: match.refereeTokenHash,
    });

    await recordEvent(ctx, {
      matchId: args.matchId,
      action: 'match:reset',
      before: matchState,
      after: resetState,
      role: args.role as MatchRole,
      token: args.token,
    });

    return sanitizeMatch({
      ...resetState,
      adminPinHash: match.adminPinHash,
      refereePinHash: match.refereePinHash,
      refereeTokenHash: match.refereeTokenHash,
    });
  },
});

export const toggleSides = mutation({
  args: {
    matchId: v.string(),
    role: matchRole,
    pin: v.optional(v.string()),
    token: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const match = await ensureMatch(ctx, args.matchId);
    await assertAdminAction(match, args.role as MatchRole, args.pin);

    const now = Date.now();
    const updated = {
      ...stripSystemFields(match),
      isFlipped: !match.isFlipped,
      updatedAt: now,
    } as MatchState;

    await ctx.db.patch(match._id, {
      isFlipped: !match.isFlipped,
      updatedAt: now,
    });

    await recordEvent(ctx, {
      matchId: args.matchId,
      action: 'sides:toggle',
      before: stripSystemFields(match) as MatchState,
      after: updated,
      role: args.role as MatchRole,
      token: args.token,
    });

    return sanitizeMatch({ ...match, ...updated });
  },
});

export const changeServe = mutation({
  args: {
    matchId: v.string(),
    role: matchRole,
    pin: v.optional(v.string()),
    token: v.optional(v.string()),
    team: teamSide,
    position: v.optional(v.union(v.literal('left'), v.literal('right'))),
  },
  handler: async (ctx, args) => {
    const match = await ensureMatch(ctx, args.matchId);
    await assertAdminAction(match, args.role as MatchRole, args.pin);

    const now = Date.now();
    const updated: Partial<MatchState> = {
      server: args.team as TeamSide,
      status: activateMatchStatus(match.status) as MatchState['status'],
      updatedAt: now,
    };
    if (args.position) {
      updated.serviceCourt = args.position;
    }

    await ctx.db.patch(match._id, updated);

    await recordEvent(ctx, {
      matchId: args.matchId,
      action: 'serve:change',
      before: stripSystemFields(match) as MatchState,
      after: { ...(stripSystemFields(match) as MatchState), ...updated },
      role: args.role as MatchRole,
      token: args.token,
    });

    return sanitizeMatch({ ...match, ...updated });
  },
});

export const useChallenge = mutation({
  args: {
    matchId: v.string(),
    role: matchRole,
    pin: v.optional(v.string()),
    token: v.optional(v.string()),
    team: teamSide,
  },
  handler: async (ctx, args) => {
    const match = await ensureMatch(ctx, args.matchId);
    await assertAdminAction(match, args.role as MatchRole, args.pin);

    const team = match.teams[args.team as TeamSide];
    if (team.challenges <= 0) {
      return sanitizeMatch(match);
    }

    const updatedTeams = {
      ...match.teams,
      [args.team]: {
        ...team,
        challenges: Math.max(0, team.challenges - 1),
      },
    };

    const now = Date.now();
    await ctx.db.patch(match._id, {
      teams: updatedTeams,
      updatedAt: now,
    });

    await recordEvent(ctx, {
      matchId: args.matchId,
      action: 'challenge:use',
      before: stripSystemFields(match) as MatchState,
      after: {
        ...(stripSystemFields(match) as MatchState),
        teams: updatedTeams,
        updatedAt: now,
      },
      role: args.role as MatchRole,
      token: args.token,
    });

    return sanitizeMatch({ ...match, teams: updatedTeams, updatedAt: now });
  },
});

export const updateDisplayConfig = mutation({
  args: {
    matchId: v.string(),
    role: matchRole,
    pin: v.optional(v.string()),
    token: v.optional(v.string()),
    config: v.object({
      templateId: v.optional(v.string()),
      primaryColor: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const match = await ensureMatch(ctx, args.matchId);
    await assertAdminAction(match, args.role as MatchRole, args.pin);

    const current = match.displayConfig || { templateId: 'modern' };
    const updatedConfig = { ...current, ...args.config };
    const now = Date.now();
    await ctx.db.patch(match._id, {
      displayConfig: updatedConfig,
      updatedAt: now,
    });

    await recordEvent(ctx, {
      matchId: args.matchId,
      action: 'config:update',
      before: stripSystemFields(match) as MatchState,
      after: {
        ...(stripSystemFields(match) as MatchState),
        displayConfig: updatedConfig,
        updatedAt: now,
      },
      role: args.role as MatchRole,
      token: args.token,
    });

    return sanitizeMatch({
      ...match,
      displayConfig: updatedConfig,
      updatedAt: now,
    });
  },
});

export const changeTemplate = mutation({
  args: {
    matchId: v.string(),
    role: matchRole,
    pin: v.optional(v.string()),
    token: v.optional(v.string()),
    templateId: v.string(),
  },
  handler: async (ctx, args) => {
    const match = await ensureMatch(ctx, args.matchId);
    await assertAdminAction(match, args.role as MatchRole, args.pin);

    const displayConfig = match.displayConfig || {
      templateId: args.templateId,
    };
    const updatedConfig = { ...displayConfig, templateId: args.templateId };
    const now = Date.now();

    await ctx.db.patch(match._id, {
      displayConfig: updatedConfig,
      updatedAt: now,
    });

    await recordEvent(ctx, {
      matchId: args.matchId,
      action: 'template:change',
      before: stripSystemFields(match) as MatchState,
      after: {
        ...(stripSystemFields(match) as MatchState),
        displayConfig: updatedConfig,
        updatedAt: now,
      },
      role: args.role as MatchRole,
      token: args.token,
    });

    return sanitizeMatch({
      ...match,
      displayConfig: updatedConfig,
      updatedAt: now,
    });
  },
});

export const timerStart = mutation({
  args: {
    matchId: v.string(),
    role: matchRole,
    pin: v.optional(v.string()),
    token: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const match = await ensureMatch(ctx, args.matchId);
    await assertAdminAction(match, args.role as MatchRole, args.pin);

    const timer = match.timer || {
      mode: 'stopped' as const,
      duration: 0,
      startedAt: null,
      pausedAt: null,
      elapsed: 0,
    };

    const updatedTimer = {
      ...timer,
      mode: 'countdown' as const,
      startedAt: Date.now(),
      pausedAt: null,
    };

    const now = Date.now();
    await ctx.db.patch(match._id, {
      timer: updatedTimer,
      status: activateMatchStatus(match.status) as MatchState['status'],
      updatedAt: now,
    });

    await recordEvent(ctx, {
      matchId: args.matchId,
      action: 'timer:start',
      before: stripSystemFields(match) as MatchState,
      after: {
        ...(stripSystemFields(match) as MatchState),
        timer: updatedTimer,
        status: activateMatchStatus(match.status) as MatchState['status'],
        updatedAt: now,
      },
      role: args.role as MatchRole,
      token: args.token,
    });

    return sanitizeMatch({ ...match, timer: updatedTimer, updatedAt: now });
  },
});

export const timerPause = mutation({
  args: {
    matchId: v.string(),
    role: matchRole,
    pin: v.optional(v.string()),
    token: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const match = await ensureMatch(ctx, args.matchId);
    await assertAdminAction(match, args.role as MatchRole, args.pin);

    const timer = match.timer;
    if (!timer || !timer.startedAt) {
      return sanitizeMatch(match);
    }

    const updatedTimer = {
      ...timer,
      mode: 'stopped' as const,
      elapsed: timer.elapsed + (Date.now() - timer.startedAt) / 1000,
      startedAt: null,
      pausedAt: Date.now(),
    };

    const now = Date.now();
    await ctx.db.patch(match._id, {
      timer: updatedTimer,
      updatedAt: now,
    });

    await recordEvent(ctx, {
      matchId: args.matchId,
      action: 'timer:pause',
      before: stripSystemFields(match) as MatchState,
      after: {
        ...(stripSystemFields(match) as MatchState),
        timer: updatedTimer,
        updatedAt: now,
      },
      role: args.role as MatchRole,
      token: args.token,
    });

    return sanitizeMatch({ ...match, timer: updatedTimer, updatedAt: now });
  },
});

export const timerReset = mutation({
  args: {
    matchId: v.string(),
    role: matchRole,
    pin: v.optional(v.string()),
    token: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const match = await ensureMatch(ctx, args.matchId);
    await assertAdminAction(match, args.role as MatchRole, args.pin);

    const updatedTimer = {
      mode: 'stopped' as const,
      duration: match.timer?.duration ?? 0,
      startedAt: null,
      pausedAt: null,
      elapsed: 0,
    };

    const now = Date.now();
    await ctx.db.patch(match._id, {
      timer: updatedTimer,
      updatedAt: now,
    });

    await recordEvent(ctx, {
      matchId: args.matchId,
      action: 'timer:reset',
      before: stripSystemFields(match) as MatchState,
      after: {
        ...(stripSystemFields(match) as MatchState),
        timer: updatedTimer,
        updatedAt: now,
      },
      role: args.role as MatchRole,
      token: args.token,
    });

    return sanitizeMatch({ ...match, timer: updatedTimer, updatedAt: now });
  },
});

export const updateAds = mutation({
  args: {
    matchId: v.string(),
    role: matchRole,
    pin: v.optional(v.string()),
    token: v.optional(v.string()),
    active: v.boolean(),
    assetId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const match = await ensureMatch(ctx, args.matchId);
    await assertAdminAction(match, args.role as MatchRole, args.pin);

    const ads = {
      active: args.active,
      currentAssetId: args.assetId,
    };

    const now = Date.now();
    await ctx.db.patch(match._id, {
      ads,
      updatedAt: now,
    });

    await recordEvent(ctx, {
      matchId: args.matchId,
      action: 'ads:update',
      before: stripSystemFields(match) as MatchState,
      after: {
        ...(stripSystemFields(match) as MatchState),
        ads,
        updatedAt: now,
      },
      role: args.role as MatchRole,
      token: args.token,
    });

    return sanitizeMatch({ ...match, ads, updatedAt: now });
  },
});

export const finishMatch = mutation({
  args: {
    matchId: v.string(),
    role: matchRole,
    pin: v.optional(v.string()),
    token: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const match = await ensureMatch(ctx, args.matchId);
    await assertAdminAction(match, args.role as MatchRole, args.pin);

    // Only allow if not already finished? Or just idempotent.
    // If we want to toggle, we'd need a different mutation or arg.
    // For now, "finish" means set to finished.

    const now = Date.now();
    const updated: Partial<MatchState> = {
      status: 'finished',
      updatedAt: now,
      timer: match.timer
        ? {
            ...match.timer,
            mode: 'stopped',
            pausedAt: null,
            startedAt: null,
          }
        : undefined,
    };

    await ctx.db.patch(match._id, updated);

    await recordEvent(ctx, {
      matchId: args.matchId,
      action: 'match:finish',
      before: stripSystemFields(match) as MatchState,
      after: {
        ...(stripSystemFields(match) as MatchState),
        ...updated,
      },
      role: args.role as MatchRole,
      token: args.token,
    });

    return sanitizeMatch({ ...match, ...updated });
  },
});

export const updateTimer = mutation({
  args: {
    matchId: v.string(),
    role: matchRole,
    pin: v.optional(v.string()),
    token: v.optional(v.string()),
    elapsed: v.number(), // New elapsed time in seconds
    duration: v.optional(v.number()), // New duration (for countdowns)
  },
  handler: async (ctx, args) => {
    const match = await ensureMatch(ctx, args.matchId);
    await assertAdminAction(match, args.role as MatchRole, args.pin);

    const timer = match.timer || {
      mode: 'stopped',
      duration: 0,
      elapsed: 0,
      startedAt: null,
      pausedAt: null,
    };

    const updatedTimer = {
      ...timer,
      elapsed: args.elapsed,
      duration: args.duration !== undefined ? args.duration : timer.duration,
      // If running, we might need to reset start time to "now" implies "accumulated match time is preserved but relative start shifts"?
      // Simplest approach: Pause the timer when editing, or just update elapsed and keep running.
      // Usually editing time is done while paused. Let's enforce pause or handle it.
      // If we update elapsed while running, we effectively shift the start time.
      // startedAt = Date.now() - (newElapsed * 1000) ? No, that's for stopwatch.
      // For simplicity/safety, let's say updating timer stops it or assumes it's stopped.
      // If it's running, let's keep it running but shift the anchor?
      // "startedAt" is the timestamp when it *started*.
      // If we change elapsed to X, and it's running, effective time is (Now - StartedAt) + X_old.
      // We want effective time to be X.
      // So effectively: StartedAt = Now. Elapsed = X (if we want to purely track interval).
      // actually our timer logic in frontend usually is:
      // current = elapsed + (running ? now - startedAt : 0)
      // So if we set elapsed = NEW_VALUE, we should reset startedAt to Now (if running) so the delta starts from 0 again.
      startedAt: timer.startedAt ? Date.now() : null,
    };

    const now = Date.now();
    await ctx.db.patch(match._id, {
      timer: updatedTimer,
      updatedAt: now,
    });

    await recordEvent(ctx, {
      matchId: args.matchId,
      action: 'timer:update',
      before: stripSystemFields(match) as MatchState,
      after: {
        ...(stripSystemFields(match) as MatchState),
        timer: updatedTimer,
        updatedAt: now,
      },
      role: args.role as MatchRole,
      token: args.token,
    });

    return sanitizeMatch({ ...match, timer: updatedTimer, updatedAt: now });
  },
});

export const deleteMatch = mutation({
  args: {
    matchId: v.string(),
    pin: v.string(),
  },
  handler: async (ctx, args) => {
    const match = await ensureMatch(ctx, args.matchId);
    await assertAdminAccess(match, args.pin);

    const events = await ctx.db
      .query('match_events')
      .withIndex('by_matchId_createdAt', (q) => q.eq('matchId', args.matchId))
      .collect();
    for (const event of events) {
      await ctx.db.delete(event._id);
    }

    const tokens = await ctx.db
      .query('referee_tokens')
      .withIndex('by_matchId', (q) => q.eq('matchId', args.matchId))
      .collect();
    for (const token of tokens) {
      await ctx.db.delete(token._id);
    }

    await ctx.db.delete(match._id);
  },
});

export const verifyAdminPin = mutation({
  args: { pin: v.string() },
  handler: async (ctx, args) => {
    const globalAdminPin = process.env.ADMIN_PIN;
    if (!globalAdminPin) {
      console.error('ADMIN_PIN is not configured in backend');
      return false;
    }
    return args.pin === globalAdminPin;
  },
});


