import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

const teamSide = v.union(v.literal('home'), v.literal('away'));
const gameMode = v.union(v.literal('single'), v.literal('double'));
const matchFormat = v.union(v.literal('perorangan'), v.literal('beregu'));
const matchStatus = v.union(
  v.literal('created'),
  v.literal('ready_for_referee'),
  v.literal('live'),
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

const teamLineupRowShape = v.object({
  home: v.string(),
  homeSecond: v.optional(v.string()),
  away: v.string(),
  awaySecond: v.optional(v.string()),
  type: v.union(
    v.literal('MS'),
    v.literal('WS'),
    v.literal('MD'),
    v.literal('WD'),
    v.literal('XD'),
  ),
});

const displayConfigShape = v.object({
  templateId: v.string(),
  primaryColor: v.optional(v.string()),
});

const refereeAuthShape = v.object({
  failedAttempts: v.number(),
  lockUntil: v.union(v.number(), v.null()),
  lastAttemptAt: v.union(v.number(), v.null()),
});

const sportStateShape = v.object({
  badminton: v.optional(
    v.object({
      maxPoints: v.optional(v.number()),
    })
  ),
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
  admin_auth_state: defineTable({
    key: v.string(),
    failedAttempts: v.number(),
    lockUntil: v.optional(v.number()),
    lastAttemptAt: v.optional(v.number()),
    updatedAt: v.number(),
  }).index('by_key', ['key']),

  admin_credentials: defineTable({
    key: v.string(), // "master_pin"
    pinHash: v.string(),
    updatedAt: v.number(),
  }).index('by_key', ['key']),

  temp_access_codes: defineTable({
    codeHash: v.string(),
    label: v.string(),
    expiresAt: v.number(),
    maxUses: v.optional(v.number()),
    usedCount: v.number(),
    createdAt: v.number(),
  }).index('by_codeHash', ['codeHash'])
    .index('by_expiresAt', ['expiresAt']),

  admin_sessions: defineTable({
    tokenHash: v.string(),
    expiresAt: v.number(),
    revokedAt: v.optional(v.number()),
    createdAt: v.number(),
    lastUsedAt: v.optional(v.number()),
    isTemporary: v.optional(v.boolean()),
    label: v.optional(v.string()),
  }).index('by_tokenHash', ['tokenHash'])
    .index('by_expiresAt', ['expiresAt']),

  matches: defineTable({
    matchId: v.string(),
    displayCode: v.optional(v.string()),
    adminPinHash: v.optional(v.string()),
    refereePinHash: v.optional(v.string()),
    refereeTokenHash: v.string(),
    createdBy: v.optional(v.string()),
    tournamentName: v.optional(v.string()),
    assignedReferee: v.optional(v.string()),
    sport: v.string(),
    status: matchStatus,
    gameMode: v.optional(gameMode),
    matchFormat: v.optional(matchFormat),
    category: v.optional(v.string()),
    teamLineup: v.optional(v.array(teamLineupRowShape)),
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
    refereeAuth: v.optional(refereeAuthShape),
    // Legacy matches may not have these fields yet.
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  })
    .index('by_matchId', ['matchId'])
    .index('by_displayCode', ['displayCode']),

  match_events: defineTable({
    matchId: v.string(),
    action: v.string(),
    before: v.any(),
    after: v.any(),
    actorType: v.union(v.literal('admin'), v.literal('referee')),
    actorTokenId: v.optional(v.string()),
    createdAt: v.number(),
  }).index('by_matchId_createdAt', ['matchId', 'createdAt']),


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

  pb_registrations: defineTable({
    fullName: v.string(), dob: v.string(), gender: v.union(v.literal('putra'), v.literal('putri')),
    club: v.string(), kabupaten: v.string(), whatsapp: v.string(), email: v.optional(v.string()),
    category: v.union(v.literal('anak'), v.literal('taruna'), v.literal('dewasa')),
    status: v.union(v.literal('baru'), v.literal('valid'), v.literal('revisi'), v.literal('sudah_input_pbsi'), v.literal('ditolak')),
    reviewNote: v.optional(v.string()), createdAt: v.number(), updatedAt: v.number(),
  }).index('by_status', ['status']).index('by_category', ['category']).index('by_kabupaten', ['kabupaten']),
  pb_registration_files: defineTable({
    registrationId: v.id('pb_registrations'), category: v.union(v.literal('anak'), v.literal('taruna'), v.literal('dewasa')),
    docType: v.union(v.literal('foto_profil'), v.literal('dokumen_identitas')), objectKey: v.string(), filename: v.string(),
    contentType: v.string(), size: v.number(), createdAt: v.number(),
  }).index('by_registration', ['registrationId']),
  pb_registration_history: defineTable({
    registrationId: v.id('pb_registrations'), status: v.union(v.literal('baru'), v.literal('valid'), v.literal('revisi'), v.literal('sudah_input_pbsi'), v.literal('ditolak')),
    note: v.optional(v.string()), createdAt: v.number(),
  }).index('by_registration', ['registrationId']),
});
