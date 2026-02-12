import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

const teamSide = v.union(v.literal('home'), v.literal('away'));
const gameMode = v.union(v.literal('single'), v.literal('double'));
const matchStatus = v.union(
  v.literal('active'),
  v.literal('finished'),
  v.literal('scheduled'),
  v.literal('paused'),
);

const playerShape = v.object({
  name: v.string(),
  country: v.optional(v.string()),
});

const teamShape = v.object({
  name: v.string(),
  players: v.array(playerShape),
  score: v.number(),
  setsWon: v.number(),
  challenges: v.number(),
  country: v.optional(v.string()),
  logo: v.optional(v.string()),
  playerPositions: v.optional(v.array(v.number())),
});

const timerShape = v.object({
  mode: v.union(
    v.literal('countdown'),
    v.literal('countup'),
    v.literal('stopped'),
  ),
  duration: v.number(),
  startedAt: v.union(v.number(), v.null()),
  pausedAt: v.union(v.number(), v.null()),
  elapsed: v.number(),
});

const setScoreShape = v.object({
  home: v.number(),
  away: v.number(),
});

const displayConfigShape = v.object({
  templateId: v.string(),
  primaryColor: v.optional(v.string()),
});

const sportStateShape = v.object({
  badminton: v.optional(v.object({})),
  tennis: v.optional(
    v.object({
      points: v.object({ home: v.number(), away: v.number() }),
      games: v.object({ home: v.number(), away: v.number() }),
      tiebreak: v.boolean(),
      tiebreakPoints: v.object({ home: v.number(), away: v.number() }),
    }),
  ),
  basketball: v.optional(
    v.object({
      currentPeriod: v.number(),
      periods: v.array(setScoreShape),
    }),
  ),
  soccer: v.optional(
    v.object({
      currentPeriod: v.number(),
      periods: v.array(setScoreShape),
    }),
  ),
  futsal: v.optional(
    v.object({
      currentPeriod: v.number(),
      periods: v.array(setScoreShape),
    }),
  ),
  volleyball: v.optional(
    v.object({
      maxSets: v.number(),
      setsToWin: v.number(),
    }),
  ),
});

export default defineSchema({
  matches: defineTable({
    matchId: v.string(),
    adminPinHash: v.string(),
    refereeTokenHash: v.string(),
    sport: v.string(),
    status: matchStatus,
    gameMode: v.optional(gameMode),
    category: v.optional(v.string()),
    teams: v.object({
      home: teamShape,
      away: teamShape,
    }),
    currentSet: v.number(),
    sets: v.array(setScoreShape),
    server: v.optional(teamSide),
    receiver: v.optional(teamSide),
    servingPlayerIndex: v.optional(v.number()),
    receivingPlayerIndex: v.optional(v.number()),
    serviceCourt: v.optional(v.union(v.literal('left'), v.literal('right'))),
    isFlipped: v.optional(v.boolean()),
    isFlippedInSet3: v.optional(v.boolean()),
    winner: v.optional(teamSide),
    timer: v.optional(timerShape),
    sportState: v.optional(sportStateShape),
    history: v.optional(v.array(v.any())),
    displayConfig: v.optional(displayConfigShape),
    ads: v.optional(
      v.object({
        active: v.boolean(),
        currentAssetId: v.optional(v.string()),
      }),
    ),
  }).index('by_matchId', ['matchId']),

  match_events: defineTable({
    matchId: v.string(),
    action: v.string(),
    before: v.any(),
    after: v.any(),
    actorType: v.union(v.literal('admin'), v.literal('referee')),
    actorTokenId: v.optional(v.string()),
    createdAt: v.number(),
  }).index('by_matchId_createdAt', ['matchId', 'createdAt']),

  referee_tokens: defineTable({
    matchId: v.string(),
    tokenHash: v.string(),
    expiresAt: v.optional(v.number()),
    revokedAt: v.optional(v.number()),
    createdAt: v.number(),
  }).index('by_matchId', ['matchId']),

  media_assets: defineTable({
    name: v.string(),
    url: v.string(),
    type: v.union(v.literal('image'), v.literal('video')),
    storageId: v.optional(v.id('_storage')),
    createdAt: v.number(),
  }),

  settings: defineTable({
    key: v.string(), // e.g. "global_config" (singleton for now)
    value: v.any(),
  }).index('by_key', ['key']),
});
