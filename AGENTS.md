# Repository Guidelines

## Project Structure & Module Organization

- `app/`: Next.js App Router pages, including display routes (e.g., `/display`).
- `components/`: Reusable UI components.
- `server/`: Realtime server (Socket.io + Express).
- `public/`: Static assets (logos, images).
- `styles/`: Global styles and Tailwind config helpers.
- `docs/`: Product and design docs (see `docs/PRD.md`).
- `docs/PRD.md`: Source of truth for scope, rules, and realtime behavior.

## Build, Test, and Development Commands

- `npm run dev`: Run the Next.js app for local development.
- `npm run dev:server`: Run the realtime server in watch mode.
- `npm run dev:all`: Run app + server together.
- `npm run build`: Build the Next.js app for production.
- `npm run start`: Start the Next.js production server.
- `npm run start:server`: Start the realtime server (prod).
- `npm run lint`: Run ESLint across the repo.

## Coding Style & Naming Conventions

- Indentation: 2 spaces in JSON, 2 spaces in CSS, 2 spaces in TS/TSX.
- Filenames: `kebab-case` for folders, `PascalCase` for React components.
- Tailwind is used for styling; prefer class-based styling over inline styles.
- Keep server event names `namespace:action` (e.g., `match:state`).

## Testing Guidelines

- Automated tests are not set up yet.
- If adding tests, place them beside the module or in a `__tests__/` folder.
- Suggested naming: `*.test.ts` or `*.test.tsx`.

## Documentation & PRD Checks

- Before changing features or rules (scoring, serve logic, timers), cross-check `docs/PRD.md`.
- If behavior deviates from PRD, note the rationale in the PR or update the PRD.

## Commit & Pull Request Guidelines

- This repo has no commit history yet, so no established convention.
- Recommended commit style: `type(scope): message` (e.g., `feat(display): add serve indicator`).
- PRs should include:
  - Brief summary and linked issue (if any).
  - Screenshots or short screen recordings for UI changes.
  - Notes on any breaking changes or required config updates.

## Configuration Tips

- Copy `/.env.example` to `/.env.local` and adjust values as needed.
- The display client is read-only; do not enable input on `/display`.

## Agent Skills & AI Usage

- If using AI agents, consult skill guides first:
  - Primary: `.codex/skills/<skill>/SKILL.md`
  - Mirrors for other agents (if applicable): `.agent/skills/`, `.claude/skills/`, `.cursor/skills/`, `.gemini/skills/`
- Pick the minimal skill set needed for the task and follow its workflow (plan/build/review).
