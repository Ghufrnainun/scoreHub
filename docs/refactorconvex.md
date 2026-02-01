# Refactor Plan: Migration to Convex

This document outlines the step-by-step implementation plan to migrate Scorehub from a custom Node.js/Socket.io server to a **Convex** serverless backend.

## 1. Architecture Shift

| Feature            | Current (Socket.io)                 | New (Convex)                           |
| :----------------- | :---------------------------------- | :------------------------------------- |
| **State Storage**  | In-Memory `Map<string, MatchState>` | Database Table `matches`               |
| **Realtime**       | `socket.emit` / `socket.on`         | `useQuery` (Automatic Sync)            |
| **Logic**          | Class Methods (`MatchManager`)      | Convex Mutations (`convex/matches.ts`) |
| **Access Control** | Middleware + PIN Check              | `ctx.auth` / PIN Validation in Query   |
| **Deployment**     | Requires VPS / Long-running Node    | Serverless (Vercel + Convex Cloud)     |

## 2. Database Schema (`convex/schema.ts`)

Map **existing MatchState** to Convex. Keep `matchId` as the primary lookup
for frontend compatibility and add an index for it.

```typescript
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
    servingPlayerIndex: v.optional(v.number()),
    receivingPlayerIndex: v.optional(v.number()),
    serviceCourt: v.optional(v.union(v.literal('left'), v.literal('right'))),
    isFlipped: v.optional(v.boolean()),
    isFlippedInSet3: v.optional(v.boolean()),
    winner: v.optional(teamSide),

    timer: v.optional(timerShape),
    sportState: v.optional(sportStateShape),

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
});
```

## 3. Core Functions (Mutations)

We will recreate `MatchManager` methods as exported queries and mutations in `convex/matches.ts`.

### 3.1 Queries

- `get(matchId)`: Returns current state. Replaces `socket.on('match:state')`.
  - _Security_: If `role == 'admin'`, return full object. If `role == 'display'`, exclude PIN/Token.

### 3.2 Mutations (Actions)

- `createMatch(args)`: Replaces `socket.emit('match:create')`.
- `updateScore(args: { matchId, team, delta })`: Replaces `score:update`.
- `awardPoint(args: { matchId, winner, value? })`: Main logic hub.
  - Fetches current match.
  - Applies sport rule (badminton/tennis/basket/volley/soccer/futsal).
  - Updates DB.
- `undo(args: { matchId })`: Restores state from `historyJson`.
- `resetMatch(args)`: Resets scores to 0.

## 4. Frontend Refactoring

### 4.1 Install Convex

```bash
npm install convex
npx convex dev
```

### 4.2 Auth Wrapper (`ConvexClientProvider`)

Wrap the app in `app/layout.tsx` (Client Component wrapper).

### 4.3 `useMatch` Hook Refactor

Modify `hooks/use-match.ts` to swap Socket.io logic with Convex hooks.

**Before (Socket):**

```typescript
useEffect(() => {
  socket.on('match:state', setState);
  socket.emit('join', matchId);
}, []);

const updateScore = (team, delta) => socket.emit('score:update', { ... });
```

**After (Convex):**

```typescript
const match = useQuery(api.matches.get, { matchId });
const updateScoreMutation = useMutation(api.matches.updateScore);

const updateScore = (team, delta) =>
  updateScoreMutation({ matchId, team, delta });
```

## 5. Security Strategy

Since Convex is public by default, we use "Application-Level Auth":

1. **Admin Ops**: Require `pin` argument hash matches `adminPinHash`.
2. **Referee Ops**: Require `token` argument hash matches `refereeTokenHash`.
3. **Display**: Read-only; redact admin/ref tokens in query response.
4. **Token Expiry**: Reject if `expiresAt` is set and `Date.now() > expiresAt`.
5. **Revocation**: Reject if `revokedAt` is set.

## 6. Implementation Checklist

- [ ] **Init**: `npx convex dev` & setup `ConvexClientProvider`.
- [ ] **Schema**: Implement `convex/schema.ts` aligned with `MatchState` + sportState.
- [ ] **Logic Migration**:
  - [ ] Copy logic from `server/sports/badminton.ts` to `convex/sports/badminton.ts` (pure functions).
  - [ ] Copy logic from `server/sports/tennis.ts` to `convex/sports/tennis.ts`.
  - [ ] Copy logic from `server/sports/basketball.ts` to `convex/sports/basketball.ts`.
  - [ ] Copy logic from `server/sports/volleyball.ts` to `convex/sports/volleyball.ts`.
  - [ ] Copy logic from `server/sports/soccer.ts` and `server/sports/futsal.ts` to `convex/sports/soccer.ts` + `convex/sports/futsal.ts`.
  - [ ] Implement `createMatch` mutation.
  - [ ] Implement `awardPoint` mutation (rally logic).
  - [ ] Implement `undo` mutation.
  - [ ] Implement `timer:start`, `timer:pause`, `timer:reset` mutations.
  - [ ] Implement `config:update` + `template:change` mutations.
  - [ ] Implement `serve:change` and `sides:toggle` mutations.
- [ ] **Frontend Integration**:
  - [ ] Rewrite `hooks/use-match.ts`.
  - [ ] Verify `ControlPage` works.
  - [ ] Verify `DisplayPage` works.
- [ ] **Audit Log**:
  - [ ] Insert `match_events` on every mutation (before/after snapshot).
- [ ] **Security**:
  - [ ] Hash pin/token on create.
  - [ ] Validate role + expiry on every mutation.
- [ ] **Cleanup**: Delete `server/` folder and `socket.io-client` dependency.

## 7. Notes & Edge Cases

- Keep `matchId` as the external identifier (frontend depends on it).
- `sportState` is required for period/point breakdowns (basketball/tennis/soccer).
- Timer behavior should match `TimerState` in `lib/socket.ts` (countup/countdown).
- Undo history should be capped at 50 states (mirror current server behavior).
