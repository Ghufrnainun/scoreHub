# Tasks (Derived from PRD)

Status tags:
- [ ] not started
- [x] done
- (OOS) out of scope in PRD
- (Planned) planned but not implemented

## 0) Foundations
- [x] Add sport toggle config file (config/sports.json) and wire it to UI + server
- [x] Document how to enable/disable sports in config
- [x] Ensure default sport fallback when disabled

## 1) Match Setup
- [x] Create match from landing (auto-generate matchId)
- [x] Select sport (badminton/basket/voli/tennis/futsal/soccer) with config-gated availability
- [ ] Select template per sport (2-3 default per sport)
- [x] Category per sport (badminton: MS/WS/MD/WD/XD)
- [x] Set team + player names (home/away)
- [x] Admin access via PIN
- [x] Generate referee link token per match

## 2) Score Control (Rally-based)
- [x] Point Home / Point Away (rally input)
- [x] Undo multi-step (max 50 history)
- [x] score:update event for manual correction (no UI yet)
- [x] Two-team support for all sports

## 3) Badminton Serve Logic
- [x] Server is rally winner
- [x] Service court parity (even=right, odd=left)
- [x] Serve indicator on display
- [ ] (OOS) Doubles rotation / receiver logic fully modeled

## 4) Set & Match Management
- [x] Auto end set (21, win by 2, cap 30)
- [x] Auto end match (best of 3)
- [x] No manual end set / manual score edit UI (per PRD)
- [x] Persist history for undo (max 50)

## 5) Timer
- [x] Timer events: start/pause/reset
- [x] (Planned) initialize timer in match state

## 6) Real-time Sync
- [x] Update score < 1s
- [x] Sync to all displays
- [x] Reconnect returns full state

## 7) Display Config
- [ ] Template system (templateId)
- [ ] Admin template selector (realtime)
- [ ] Display applies template changes
- [ ] Font size controls
- [ ] Team code toggles
- [ ] Team color controls
- [ ] Serve icon toggle

## 8) Architecture / Storage
- [x] Authoritative state on server
- [x] Socket events (match:create, point, undo, template:change, config:update, etc.)
- [ ] (Planned) Convex migration

## 9) Roles & Permissions
- [x] Admin/Wasit/Display roles
- [ ] Admin via PIN global
- [ ] Referee token per match
- [ ] Display read-only
- [ ] Permission checks for all events

## 10) Audit Log
- [ ] Log every action (point/undo/timer) with before/after + timestamp
- [ ] Admin view log post-match
- [ ] (Planned) realtime moderation dashboard

## 11) Onboarding per Role
- [ ] Role selection screen (Admin/Wasit)
- [ ] Lightweight onboarding per role
- [ ] Persist role preference on device

## 12) Multi-match / Multi-court
- [ ] Multiple active matches
- [ ] Admin dashboard lists matches
- [ ] Quick actions: control, copy referee link, open display

## 13) Templates per Sport
- [ ] Badminton template (modern)
- [ ] Basketball templates (2)
- [ ] Volleyball templates (2)
- [ ] Tennis templates (2)
- [ ] Futsal templates (2)
- [ ] Soccer templates (2)

## 14) Landing Page (SaaS)
- [ ] Hero + CTA
- [ ] Problem -> Solution
- [ ] Features
- [ ] Flow (Create -> Control -> Display)
- [ ] Screenshots
- [ ] Use cases
- [ ] CTA footer
- [ ] Footer links

## 15) Success Metrics / Non-functional
- [ ] Latency < 1s
- [ ] Stable 2+ hours
- [ ] UI large buttons, high contrast

## Out of Scope (Per PRD)
- (OOS) Cross-sport template library
- (OOS) Hardware scoreboard integration
- (OOS) Broadcast overlay integration
- (OOS) Advanced stats
- (OOS) Multi-venue cloud sync
- (OOS) Interval timer 11 points & break between sets
- (OOS) Best of 5
- (OOS) Manual end set / manual score edit UI
- (OOS) Realtime moderation dashboard

