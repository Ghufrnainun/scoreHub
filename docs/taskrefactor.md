# Refactor Task Execution (Admin vs Referee Flow)

## Objective
Implement the full workflow refactor:
1. Routing + role guard
2. Match domain model updates
3. Authorization hardening
4. Post-create UX (success modal + sharing)
5. Referee join flow (display code + PIN)
6. Audit + safety (PIN lock / logs)
7. Display media fail-safe pipeline

## Execution Checklist
- [x] Added role-based route flow:
  - `/admin/*` for admin management
  - `/referee/join` + `/referee/match/[id]` for referee-only scoring
  - `/display/[code]` as display-code entrypoint
  - `proxy.ts` redirect guard for legacy `/match/[id]/control` access
- [x] Refined match data model:
  - Added `displayCode`, `refereePinHash`, `assignedReferee`, `createdBy`
  - Added workflow-compatible `status` values (`created`, `ready_for_referee`, `live`, `finished`, etc.)
  - Added `refereeAuth` lock state + `createdAt`/`updatedAt`
- [x] Hardened server authorization:
  - Referee auth now supports token session and `refereePinHash`
  - Sensitive mutations restricted to admin
  - Referee-scoring path remains available through scoring/undo
- [x] Refactored create flow:
  - Match create no longer auto-jumps to control
  - Added success modal with share actions
  - Added quick actions: copy referee link, WhatsApp share, go to dashboard/admin control
- [x] Built dedicated referee join:
  - `displayCode + PIN` join mutation
  - Session token issuance and client storage
  - Referee control page limited to scoring and undo
- [x] Added safety controls:
  - PIN attempt tracking
  - temporary lock on repeated failures
  - existing event logging preserved and extended (`referee:join`)
- [x] Display ad pipeline improved:
  - Added media resolver query for display playback
  - Added ad rendering with fallback to scoreboard on media failure

## Validation Run
- [x] `npx convex codegen`
- [x] `npm run lint`
- [x] `npm run build`

## Notes
- Next.js build still prints baseline-browser-mapping update notices (non-blocking warning).
