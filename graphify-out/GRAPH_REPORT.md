# Graph Report - D:\VsCode\Scoreboard  (2026-07-27)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 1113 nodes · 2012 edges · 109 communities (53 shown, 56 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 7 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `3367209b`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [matchId]/page.tsx
- cn
- MatchState
- matches.ts
- react
- hooks/use-toast.ts
- devDependencies
- sidebar.tsx
- lib/utils.ts
- pb-registration-validation.ts
- display-renderer.tsx
- compilerOptions
- loadValidAdminSession
- match/[id]/control/page.tsx
- settings-panel.tsx
- settings/page.tsx
- pbRegistration.ts
- media.ts
- item.tsx
- convex/utils.ts
- components.json
- schema.ts
- create/page.tsx
- menubar.tsx
- context-menu.tsx
- dropdown-menu.tsx
- overlay/page.tsx
- select.tsx
- field.tsx
- api.js
- card.tsx
- dependencies
- app/page.tsx
- JoinForm.tsx
- input-group.tsx
- RegistrationTable.tsx
- guide/page.tsx
- navigation-menu.tsx
- app/layout.tsx
- button.tsx
- empty.tsx
- [code]/page.tsx
- legacy/route.ts
- server.d.ts
- opengraph-image.tsx
- overlay/layout.tsx
- proxy.ts
- build-regions-import.py
- vercel.json
- autoprefixer
- @aws-sdk/client-s3
- @aws-sdk/s3-request-presigner
- class-variance-authority
- clsx
- cmdk
- convex
- date-fns
- framer-motion
- @hookform/resolvers
- lucide-react
- next
- next.config.mjs
- next-themes
- @radix-ui/react-accordion
- @radix-ui/react-alert-dialog
- @radix-ui/react-aspect-ratio
- @radix-ui/react-avatar
- @radix-ui/react-checkbox
- @radix-ui/react-collapsible
- @radix-ui/react-context-menu
- @radix-ui/react-dialog
- @radix-ui/react-dropdown-menu
- @radix-ui/react-hover-card
- @radix-ui/react-label
- @radix-ui/react-menubar
- @radix-ui/react-navigation-menu
- @radix-ui/react-popover
- @radix-ui/react-progress
- @radix-ui/react-radio-group
- @radix-ui/react-scroll-area
- @radix-ui/react-select
- @radix-ui/react-separator
- @radix-ui/react-slider
- @radix-ui/react-slot
- @radix-ui/react-switch
- @radix-ui/react-toggle
- @radix-ui/react-toggle-group
- react-day-picker
- react-dom
- react-hook-form
- react-resizable-panels
- recharts
- tailwind-merge
- tailwindcss-animate
- vaul
- @vercel/analytics
- zod
- postcss.config.mjs
- httpAction
- internalAction

## God Nodes (most connected - your core abstractions)
1. `cn()` - 296 edges
2. `MatchState` - 26 edges
3. `loadValidAdminSession()` - 21 edges
4. `Button()` - 20 edges
5. `TeamSide` - 20 edges
6. `react` - 20 edges
7. `MatchState` - 18 edges
8. `SportRules` - 17 edges
9. `compilerOptions` - 16 edges
10. `api` - 16 edges

## Surprising Connections (you probably didn't know these)
- `AdminError()` --calls--> `clearAdminSession()`  [EXTRACTED]
  app/admin/error.tsx → lib/auth.ts
- `RegistrationStats()` --calls--> `cn()`  [EXTRACTED]
  app/admin/pendaftaran-pb/_components/RegistrationStats.tsx → lib/utils.ts
- `RegistrationTable()` --calls--> `cn()`  [EXTRACTED]
  app/admin/pendaftaran-pb/_components/RegistrationTable.tsx → lib/utils.ts
- `SettingsPage()` --calls--> `loadValidAdminSession()`  [EXTRACTED]
  app/admin/settings/page.tsx → lib/admin-session.ts
- `TemplatesPage()` --calls--> `loadValidAdminSession()`  [EXTRACTED]
  app/admin/templates/page.tsx → lib/admin-session.ts

## Import Cycles
- None detected.

## Communities (109 total, 56 thin omitted)

### Community 0 - "[matchId]/page.tsx"
Cohesion: 0.05
Nodes (49): BG_MAP, ChromaBg, OverlayPage(), OverlayPageProps, OverlayPosition, OverlayStyle, useOverlayScale(), MatchSettingsDraft (+41 more)

### Community 1 - "cn"
Cohesion: 0.06
Nodes (41): AccordionContent(), AccordionItem(), AccordionTrigger(), Avatar(), AvatarFallback(), AvatarImage(), BreadcrumbEllipsis(), BreadcrumbItem() (+33 more)

### Community 2 - "MatchState"
Cohesion: 0.09
Nodes (23): BadmintonRules, BasketballRules, FutsalRules, getRulesForSport(), isSportEnabled(), resolveSportId(), RULE_ENGINES, SPORT_REGISTRY (+15 more)

### Community 3 - "matches.ts"
Cohesion: 0.04
Nodes (40): awardPoint, changeServe, changeTemplate, createMatch, deleteMatch, ensureMatchByDisplayCode(), finishMatch, gameMode (+32 more)

### Community 4 - "react"
Cohesion: 0.06
Nodes (40): Carousel(), CarouselApi, CarouselContent(), CarouselContext, CarouselContextProps, CarouselItem(), CarouselNext(), CarouselOptions (+32 more)

### Community 5 - "hooks/use-toast.ts"
Cohesion: 0.08
Nodes (38): Toast, ToastAction, ToastActionElement, ToastClose, ToastDescription, ToastProps, ToastTitle, toastVariants (+30 more)

### Community 6 - "devDependencies"
Cohesion: 0.05
Nodes (39): eslint, eslint-config-next, @eslint/eslintrc, @eslint/js, globals, devDependencies, eslint, eslint-config-next (+31 more)

### Community 7 - "sidebar.tsx"
Cohesion: 0.07
Nodes (33): Sidebar(), SidebarContent(), SidebarContext, SidebarContextProps, SidebarFooter(), SidebarGroup(), SidebarGroupAction(), SidebarGroupContent() (+25 more)

### Community 8 - "lib/utils.ts"
Cohesion: 0.07
Nodes (16): Alert(), AlertDescription(), AlertTitle(), alertVariants, Checkbox(), DrawerContent(), DrawerDescription(), DrawerFooter() (+8 more)

### Community 9 - "pb-registration-validation.ts"
Cohesion: 0.13
Nodes (18): CustomDatePicker(), CustomDatePickerProps, MONTH_NAMES, PickerMode, CustomSelectProps, Region, FileUploaderProps, RegistrationSidebar() (+10 more)

### Community 10 - "display-renderer.tsx"
Cohesion: 0.10
Nodes (19): ControlPage(), BwfScoreboard(), CATEGORY_NAMES, DisplayRenderer, BwfCourtTemplate(), FLAG_ISO_MAP, getCountryCode(), isUsableImageSrc() (+11 more)

### Community 11 - "compilerOptions"
Cohesion: 0.07
Nodes (27): dom, dom.iterable, esnext, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules, **/*.ts (+19 more)

### Community 12 - "loadValidAdminSession"
Cohesion: 0.13
Nodes (17): AdminLayout(), MENU_ITEMS, MediaManager(), AdminDashboard(), RefereeMatchPage(), loadValidAdminSession(), AdminSession, clearAdminSession() (+9 more)

### Community 13 - "match/[id]/control/page.tsx"
Cohesion: 0.15
Nodes (16): DashboardView, MatchStatus, MatchSummary, defaultSettings, DisplaySettings, SettingsSavePayload, AlertDialog(), AlertDialogAction() (+8 more)

### Community 14 - "settings-panel.tsx"
Cohesion: 0.13
Nodes (18): buildPlayerOptions(), dedupe(), DEFAULT_LINEUP, isDoublesCategory(), sanitizeRoster(), SettingsPanel(), SettingsPanelProps, TEMPLATE_OPTIONS (+10 more)

### Community 15 - "settings/page.tsx"
Cohesion: 0.13
Nodes (16): SettingsPage(), Command(), CommandDialog(), CommandGroup(), CommandInput(), CommandItem(), CommandList(), CommandSeparator() (+8 more)

### Community 16 - "pbRegistration.ts"
Cohesion: 0.10
Nodes (20): action, internalQuery, assertPBAdminSession(), authorizeMaster, category, create, docType, downloadUrl (+12 more)

### Community 17 - "media.ts"
Cohesion: 0.11
Nodes (16): cleanupExpiredData, crons, internal, internalMutation, mutation, query, create, generateUploadUrl (+8 more)

### Community 18 - "item.tsx"
Cohesion: 0.13
Nodes (17): ButtonGroup(), ButtonGroupSeparator(), ButtonGroupText(), buttonGroupVariants, Item(), ItemActions(), ItemContent(), ItemDescription() (+9 more)

### Community 19 - "convex/utils.ts"
Cohesion: 0.17
Nodes (16): changeMasterPin, generateTempCode, getSessionInfo, listTempCodes, revokeTempCode, generateUniqueDisplayCode(), MatchRole, assertAdminAccess() (+8 more)

### Community 20 - "components.json"
Cohesion: 0.11
Nodes (17): aliases, components, hooks, lib, ui, utils, iconLibrary, rsc (+9 more)

### Community 21 - "schema.ts"
Cohesion: 0.11
Nodes (16): DataModel, Doc, Id, TableNames, displayConfigShape, gameMode, matchFormat, matchStatus (+8 more)

### Community 22 - "create/page.tsx"
Cohesion: 0.14
Nodes (14): CreateMatchPage(), EventPreset, FieldErrorKey, generateMatchId(), isDoubleCategory(), MatchCategory, MatchFormat, normalizeDisplayCodeInput() (+6 more)

### Community 23 - "menubar.tsx"
Cohesion: 0.12
Nodes (11): Menubar(), MenubarCheckboxItem(), MenubarContent(), MenubarItem(), MenubarLabel(), MenubarRadioItem(), MenubarSeparator(), MenubarShortcut() (+3 more)

### Community 24 - "context-menu.tsx"
Cohesion: 0.12
Nodes (9): ContextMenuCheckboxItem(), ContextMenuContent(), ContextMenuItem(), ContextMenuLabel(), ContextMenuRadioItem(), ContextMenuSeparator(), ContextMenuShortcut(), ContextMenuSubContent() (+1 more)

### Community 25 - "dropdown-menu.tsx"
Cohesion: 0.12
Nodes (11): DropdownMenu(), DropdownMenuCheckboxItem(), DropdownMenuContent(), DropdownMenuItem(), DropdownMenuLabel(), DropdownMenuRadioItem(), DropdownMenuSeparator(), DropdownMenuShortcut() (+3 more)

### Community 26 - "overlay/page.tsx"
Cohesion: 0.15
Nodes (12): BG_OPTIONS, ChromaBg, FIT_DIMENSIONS, OBS_STEPS_FIT, OBS_STEPS_POSITIONED, OverlayConfig, OverlayGeneratorPage(), OverlayPosition (+4 more)

### Community 27 - "select.tsx"
Cohesion: 0.20
Nodes (10): RegistrationFilterBarProps, Select(), SelectContent(), SelectItem(), SelectLabel(), SelectScrollDownButton(), SelectScrollUpButton(), SelectSeparator() (+2 more)

### Community 28 - "field.tsx"
Cohesion: 0.16
Nodes (12): Field(), FieldContent(), FieldDescription(), FieldError(), FieldGroup(), FieldLabel(), FieldLegend(), FieldSeparator() (+4 more)

### Community 29 - "api.js"
Cohesion: 0.21
Nodes (9): address(), AdminPendaftaranPB(), statuses, GET(), resolveParams(), RouteContext, SmartTvLaunchPage(), api (+1 more)

### Community 30 - "card.tsx"
Cohesion: 0.18
Nodes (10): Template, TEMPLATES, TemplatesPage(), Card(), CardAction(), CardContent(), CardDescription(), CardFooter() (+2 more)

### Community 31 - "dependencies"
Cohesion: 0.18
Nodes (12): embla-carousel-react, input-otp, dependencies, embla-carousel-react, input-otp, @radix-ui/react-tabs, @radix-ui/react-toast, @radix-ui/react-tooltip (+4 more)

### Community 32 - "app/page.tsx"
Cohesion: 0.16
Nodes (6): bodyFont, displayFont, flowSteps, LandingPage(), useCases, PopoverContent()

### Community 33 - "JoinForm.tsx"
Cohesion: 0.24
Nodes (6): JoinForm(), JoinFormProps, normalizeCode(), Props, Input(), saveRefereeSession()

### Community 34 - "input-group.tsx"
Cohesion: 0.24
Nodes (9): InputGroup(), InputGroupAddon(), inputGroupAddonVariants, InputGroupButton(), inputGroupButtonVariants, InputGroupInput(), InputGroupText(), InputGroupTextarea() (+1 more)

### Community 35 - "RegistrationTable.tsx"
Cohesion: 0.29
Nodes (7): RegistrationItem, RegistrationStats(), RegistrationStatsProps, RegistrationTable(), RegistrationTableProps, Badge(), badgeVariants

### Community 36 - "guide/page.tsx"
Cohesion: 0.20
Nodes (7): faqs, matchFlow, metadata, quickStartSteps, quickStats, roleGuides, troubleshooting

### Community 37 - "navigation-menu.tsx"
Cohesion: 0.22
Nodes (9): NavigationMenu(), NavigationMenuContent(), NavigationMenuIndicator(), NavigationMenuItem(), NavigationMenuLink(), NavigationMenuList(), NavigationMenuTrigger(), navigationMenuTriggerStyle (+1 more)

### Community 38 - "app/layout.tsx"
Cohesion: 0.25
Nodes (6): barlow, barlowCondensed, bebas, literata, metadata, ConvexClientProvider()

### Community 39 - "button.tsx"
Cohesion: 0.46
Nodes (5): AdminError(), Button(), buttonVariants, Calendar(), CalendarDayButton()

### Community 40 - "empty.tsx"
Cohesion: 0.29
Nodes (7): Empty(), EmptyContent(), EmptyDescription(), EmptyHeader(), EmptyMedia(), emptyMediaVariants, EmptyTitle()

### Community 41 - "[code]/page.tsx"
Cohesion: 0.40
Nodes (4): client, DisplayByCodePage(), normalizeCode(), Props

### Community 42 - "legacy/route.ts"
Cohesion: 0.53
Nodes (5): esc(), GET(), renderLegacyPage(), resolveParams(), RouteContext

### Community 43 - "server.d.ts"
Cohesion: 0.33
Nodes (5): ActionCtx, DatabaseReader, DatabaseWriter, MutationCtx, QueryCtx

## Knowledge Gaps
- **344 isolated node(s):** `MENU_ITEMS`, `OverlayStyle`, `OverlayPosition`, `ChromaBg`, `OverlayConfig` (+339 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **56 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `cn` to `react`, `hooks/use-toast.ts`, `sidebar.tsx`, `lib/utils.ts`, `display-renderer.tsx`, `loadValidAdminSession`, `match/[id]/control/page.tsx`, `settings-panel.tsx`, `settings/page.tsx`, `item.tsx`, `menubar.tsx`, `context-menu.tsx`, `dropdown-menu.tsx`, `overlay/page.tsx`, `select.tsx`, `field.tsx`, `api.js`, `card.tsx`, `app/page.tsx`, `JoinForm.tsx`, `input-group.tsx`, `RegistrationTable.tsx`, `navigation-menu.tsx`, `button.tsx`, `empty.tsx`?**
  _High betweenness centrality (0.397) - this node is a cross-community bridge._
- **Why does `dependencies` connect `dependencies` to `react`, `devDependencies`, `loadValidAdminSession`, `autoprefixer`, `@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`, `class-variance-authority`, `clsx`, `cmdk`, `convex`, `date-fns`, `framer-motion`, `@hookform/resolvers`, `lucide-react`, `next`, `next-themes`, `@radix-ui/react-accordion`, `@radix-ui/react-alert-dialog`, `@radix-ui/react-aspect-ratio`, `@radix-ui/react-avatar`, `@radix-ui/react-checkbox`, `@radix-ui/react-collapsible`, `@radix-ui/react-context-menu`, `@radix-ui/react-dialog`, `@radix-ui/react-dropdown-menu`, `@radix-ui/react-hover-card`, `@radix-ui/react-label`, `@radix-ui/react-menubar`, `@radix-ui/react-navigation-menu`, `@radix-ui/react-popover`, `@radix-ui/react-progress`, `@radix-ui/react-radio-group`, `@radix-ui/react-scroll-area`, `@radix-ui/react-select`, `@radix-ui/react-separator`, `@radix-ui/react-slider`, `@radix-ui/react-slot`, `@radix-ui/react-switch`, `@radix-ui/react-toggle`, `@radix-ui/react-toggle-group`, `react-day-picker`, `react-dom`, `react-hook-form`, `react-resizable-panels`, `recharts`, `tailwind-merge`, `tailwindcss-animate`, `vaul`, `@vercel/analytics`, `zod`?**
  _High betweenness centrality (0.176) - this node is a cross-community bridge._
- **Why does `react` connect `react` to `cn`, `hooks/use-toast.ts`, `sidebar.tsx`, `button.tsx`, `settings-panel.tsx`, `dependencies`?**
  _High betweenness centrality (0.128) - this node is a cross-community bridge._
- **What connects `MENU_ITEMS`, `OverlayStyle`, `OverlayPosition` to the rest of the system?**
  _344 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `[matchId]/page.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.05328218243819267 - nodes in this community are weakly interconnected._
- **Should `cn` be split into smaller, more focused modules?**
  _Cohesion score 0.06262626262626263 - nodes in this community are weakly interconnected._
- **Should `MatchState` be split into smaller, more focused modules?**
  _Cohesion score 0.09433962264150944 - nodes in this community are weakly interconnected._