# Multi-Sport System Spec (Draft)

Status: Draft (February 1, 2026)

Goal: Define the multi-sport registry, rules engine shape, and Convex data model
to support multi-match and per-sport templates.

---

## 1) Sport Registry (Static Catalog)

Each sport registers:
- id (string)
- name (string)
- scoring model (point, goal, rally, set)
- periods (sets/quarters/halves)
- timers (game clock? set clock?)
- template ids (per sport)
- validation rules (max score, win by, cap, etc.)

Example registry (conceptual):

```
badminton:
  format: best_of_3
  set_points: 21
  win_by: 2
  cap: 30
  templates: [modern, classic, minimal, neon]

basketball:
  periods: 4 quarters
  period_length: 10m (customizable)
  scoring: 1/2/3 points
  templates: [hoops-classic, hoops-led]

volleyball:
  format: best_of_3 or best_of_5
  set_points: 25
  win_by: 2
  cap: none
  templates: [volley-clean, volley-led]

tennis:
  sets: best_of_3 or 5
  games_per_set: 6 (win by 2)
  tiebreak: 6-6 (standard)
  templates: [tennis-scoreline, tennis-minimal]

futsal / sepakbola:
  periods: 2 halves
  period_length: 20m / 45m
  scoring: goals
  templates: [soccer-broadcast, soccer-minimal]
```

---

## 2) Rules Engine (Per Sport)

Rules engine is a thin layer that applies sport-specific scoring logic.
Core idea: match state is authoritative in DB; mutations call rules.

### 2.1 Interface Shape (conceptual)

```
type RuleContext = {
  sportId: string,
  matchId: Id<"matches">,
  state: MatchState,
  payload: ActionPayload,
  actor: { role: "admin" | "referee" }
}

type RuleResult = {
  nextState: MatchState,
  events: MatchEvent[],
  errors?: string[]
}

applyAction(ctx: RuleContext): RuleResult
```

### 2.2 Action Types (shared)

- point: { team: "home" | "away", value?: number }
- undo: { steps: number }
- timer:start | timer:pause | timer:reset
- set:reset | match:end (admin only)

Each sport can override how `point` changes state.

### 2.3 Audit Event Shape

Every mutation produces an audit event:

```
{
  matchId,
  action,
  before: { score, set, serve, clock },
  after: { score, set, serve, clock },
  actorType: "admin" | "referee",
  actorTokenId?: Id<"referee_tokens">,
  createdAt
}
```

---

## 3) Convex Data Model (V1)

### 3.1 Core Tables

1) `sports`
- id (string, unique)
- name (string)
- config (object: format, scoring, periods)
- templateIds (array of Id<"templates">)

2) `templates`
- id (string, unique)
- sportId (string)
- name (string)
- layout (string)
- config (object: font sizes, colors, positions)
- isDefault (boolean)

3) `matches`
- sportId (string)
- templateId (string)
- status ("pending" | "active" | "finished")
- courtLabel (string)
- teams (home/away: name, players)
- score (object per sport)
- period (set/quarter/half)
- timer (clock state)
- createdAt
- updatedAt

4) `referee_tokens`
- matchId (Id<"matches">)
- tokenHash (string)
- expiresAt (number, optional)
- revokedAt (number, optional)
- createdAt

5) `match_events`
- matchId (Id<"matches">)
- action (string)
- before (object)
- after (object)
- actorType ("admin" | "referee")
- actorTokenId (Id<"referee_tokens">, optional)
- createdAt

### 3.2 Indexes

- `matches` by status
- `matches` by sportId
- `matches` by updatedAt
- `match_events` by matchId, createdAt
- `referee_tokens` by matchId, createdAt

### 3.3 Token Handling

- Tokens are random, stored as hash.
- Referee link includes raw token; server validates hash.
- Default expiry: match end. Optional: 24h.

---

## 4) Multi-Match Dashboard (Data Needs)

Queries:
- list active matches (status=active)
- filter by sportId
- show last updated time
- quick actions: open control / open display / copy referee link

---

## 5) Next Step

Implement Convex schema + functions:
- schema.ts with tables + indexes
- mutations: createMatch, updateScore, undo, endMatch
- queries: getMatch, listActiveMatches, getAuditLog

