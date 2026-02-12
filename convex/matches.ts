import { mutation, query } from './_generated/server';
import { ConvexError, v } from 'convex/values';
import type { MatchRole, MatchState, TeamSide } from './sports/types';
import { getRulesForSport, resolveSportId } from './sports/registry';
import {
  assertAdminAccess,
  assertRefereeOrAdminAccess,
  generateToken,
  hashSecret,
  isGlobalAdminPin,
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

const stripSystemFields = (match: any) => {
  const { _id, _creationTime, adminPinHash, refereeTokenHash, ...rest } = match;
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
    refereeTokenHash,
    _id,
    _creationTime,
    ...safe
  } = match;
  return safe;
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

export const listAdmin = query({
  args: { adminPin: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const globalPin = process.env.ADMIN_PIN;
    if (globalPin && args.adminPin !== globalPin) {
      return [];
    }
    const matches = await ctx.db.query('matches').collect();
    return matches.map((match: any) => ({
      matchId: match.matchId,
      sport: match.sport,
      status: match.status,
      teams: {
        home: match.teams.home.name,
        away: match.teams.away.name,
      },
      scores: {
        home: match.teams.home.score,
        away: match.teams.away.score,
      },
      updatedAt: Date.now(),
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
    templateId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
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

    const refereeToken = generateToken();
    const adminPinHash = await hashSecret(args.pin);
    const refereeTokenHash = await hashSecret(refereeToken);

    const match: MatchState = {
      matchId: args.matchId,
      sport: resolvedSport,
      gameMode: args.gameMode,
      category: args.category,
      status: 'active',
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
      ...initialState,
    };

    await ctx.db.insert('matches', {
      ...match,
      adminPinHash,
      refereeTokenHash,
    });

    await ctx.db.insert('referee_tokens', {
      matchId: args.matchId,
      tokenHash: refereeTokenHash,
      createdAt: Date.now(),
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
      refereeToken,
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

    const afterState: MatchState = {
      ...(stripSystemFields(match) as MatchState),
      teams: updatedTeams,
    };

    await ctx.db.patch(match._id, {
      teams: updatedTeams,
    });

    await recordEvent(ctx, {
      matchId: args.matchId,
      action: 'score:update',
      before: stripSystemFields(match) as MatchState,
      after: afterState,
      role: args.role as MatchRole,
      token: args.token,
    });

    return sanitizeMatch({ ...match, teams: updatedTeams });
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
    const baseState = { ...matchState, history: [] };
    const nextState = rules.awardPoint(
      baseState,
      args.winner as TeamSide,
      args.value,
    );

    const updated: MatchState = {
      ...nextState,
      history: nextHistory,
      displayConfig: match.displayConfig,
      ads: match.ads,
    };

    await ctx.db.replace(match._id, {
      ...updated,
      adminPinHash: match.adminPinHash,
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

    const previous = history[history.length - 1] as MatchState;
    const nextHistory = history.slice(0, -1);

    const restored: MatchState = {
      ...previous,
      history: nextHistory,
      displayConfig: match.displayConfig,
      ads: match.ads,
    };

    await ctx.db.replace(match._id, {
      ...restored,
      adminPinHash: match.adminPinHash,
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
    await assertRefereeOrAdminAccess(
      match,
      args.role as MatchRole,
      args.pin,
      args.token,
    );

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

    const resetState: MatchState = {
      ...matchState,
      ...initialState,
      status: 'active',
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
    };

    await ctx.db.replace(match._id, {
      ...resetState,
      adminPinHash: match.adminPinHash,
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
    await assertRefereeOrAdminAccess(
      match,
      args.role as MatchRole,
      args.pin,
      args.token,
    );

    const updated = {
      ...stripSystemFields(match),
      isFlipped: !match.isFlipped,
    } as MatchState;

    await ctx.db.patch(match._id, { isFlipped: !match.isFlipped });

    await recordEvent(ctx, {
      matchId: args.matchId,
      action: 'sides:toggle',
      before: stripSystemFields(match) as MatchState,
      after: updated,
      role: args.role as MatchRole,
      token: args.token,
    });

    return sanitizeMatch({ ...match, isFlipped: !match.isFlipped });
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
    await assertRefereeOrAdminAccess(
      match,
      args.role as MatchRole,
      args.pin,
      args.token,
    );

    const updated: Partial<MatchState> = {
      server: args.team as TeamSide,
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
    await assertRefereeOrAdminAccess(
      match,
      args.role as MatchRole,
      args.pin,
      args.token,
    );

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

    await ctx.db.patch(match._id, { teams: updatedTeams });

    await recordEvent(ctx, {
      matchId: args.matchId,
      action: 'challenge:use',
      before: stripSystemFields(match) as MatchState,
      after: {
        ...(stripSystemFields(match) as MatchState),
        teams: updatedTeams,
      },
      role: args.role as MatchRole,
      token: args.token,
    });

    return sanitizeMatch({ ...match, teams: updatedTeams });
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
    if (args.role !== 'admin') {
      throw new ConvexError('Only admin can update config');
    }
    await assertAdminAccess(match, args.pin);

    const current = match.displayConfig || { templateId: 'modern' };
    const updatedConfig = { ...current, ...args.config };
    await ctx.db.patch(match._id, { displayConfig: updatedConfig });

    await recordEvent(ctx, {
      matchId: args.matchId,
      action: 'config:update',
      before: stripSystemFields(match) as MatchState,
      after: {
        ...(stripSystemFields(match) as MatchState),
        displayConfig: updatedConfig,
      },
      role: args.role as MatchRole,
      token: args.token,
    });

    return sanitizeMatch({ ...match, displayConfig: updatedConfig });
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
    if (args.role !== 'admin') {
      throw new ConvexError('Only admin can change template');
    }
    await assertAdminAccess(match, args.pin);

    const displayConfig = match.displayConfig || {
      templateId: args.templateId,
    };
    const updatedConfig = { ...displayConfig, templateId: args.templateId };

    await ctx.db.patch(match._id, { displayConfig: updatedConfig });

    await recordEvent(ctx, {
      matchId: args.matchId,
      action: 'template:change',
      before: stripSystemFields(match) as MatchState,
      after: {
        ...(stripSystemFields(match) as MatchState),
        displayConfig: updatedConfig,
      },
      role: args.role as MatchRole,
      token: args.token,
    });

    return sanitizeMatch({ ...match, displayConfig: updatedConfig });
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
    await assertRefereeOrAdminAccess(
      match,
      args.role as MatchRole,
      args.pin,
      args.token,
    );

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

    await ctx.db.patch(match._id, { timer: updatedTimer });

    await recordEvent(ctx, {
      matchId: args.matchId,
      action: 'timer:start',
      before: stripSystemFields(match) as MatchState,
      after: {
        ...(stripSystemFields(match) as MatchState),
        timer: updatedTimer,
      },
      role: args.role as MatchRole,
      token: args.token,
    });

    return sanitizeMatch({ ...match, timer: updatedTimer });
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
    await assertRefereeOrAdminAccess(
      match,
      args.role as MatchRole,
      args.pin,
      args.token,
    );

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

    await ctx.db.patch(match._id, { timer: updatedTimer });

    await recordEvent(ctx, {
      matchId: args.matchId,
      action: 'timer:pause',
      before: stripSystemFields(match) as MatchState,
      after: {
        ...(stripSystemFields(match) as MatchState),
        timer: updatedTimer,
      },
      role: args.role as MatchRole,
      token: args.token,
    });

    return sanitizeMatch({ ...match, timer: updatedTimer });
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
    await assertRefereeOrAdminAccess(
      match,
      args.role as MatchRole,
      args.pin,
      args.token,
    );

    const updatedTimer = {
      mode: 'stopped' as const,
      duration: match.timer?.duration ?? 0,
      startedAt: null,
      pausedAt: null,
      elapsed: 0,
    };

    await ctx.db.patch(match._id, { timer: updatedTimer });

    await recordEvent(ctx, {
      matchId: args.matchId,
      action: 'timer:reset',
      before: stripSystemFields(match) as MatchState,
      after: {
        ...(stripSystemFields(match) as MatchState),
        timer: updatedTimer,
      },
      role: args.role as MatchRole,
      token: args.token,
    });

    return sanitizeMatch({ ...match, timer: updatedTimer });
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
    if (args.role !== 'admin') {
      throw new ConvexError('Only admin can update ads');
    }
    await assertAdminAccess(match, args.pin);

    const ads = {
      active: args.active,
      currentAssetId: args.assetId,
    };

    await ctx.db.patch(match._id, { ads });

    await recordEvent(ctx, {
      matchId: args.matchId,
      action: 'ads:update',
      before: stripSystemFields(match) as MatchState,
      after: {
        ...(stripSystemFields(match) as MatchState),
        ads,
      },
      role: args.role as MatchRole,
      token: args.token,
    });

    return sanitizeMatch({ ...match, ads });
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

    // Cascade delete events and tokens
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
