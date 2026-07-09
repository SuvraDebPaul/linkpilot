<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start dev server (Turbopack)
- `npm run build` — production build (also runs the TypeScript check)
- `npm run lint` — ESLint
- `npx tsc --noEmit -p tsconfig.json` — type-check only, faster than a full build when iterating
- `npx prisma db push` — sync schema changes to the dev database
- `npx prisma generate` — regenerate the Prisma client after schema changes (output: `src/generated/prisma`)

No test runner is configured in this repo.

### Database: never run `prisma migrate dev`

The dev database is a **shared Neon Postgres instance**. `migrate dev` will detect drift against it and offer to `migrate reset`, which wipes data. Always use `npx prisma db push` + `npx prisma generate` for schema changes instead.

## Architecture

### Multi-tenancy: Workspaces

Every resource (links, campaigns, custom domains, client portals) belongs to a `Workspace`, not directly to a `User`. Users join workspaces via `WorkspaceMember` with a role (`OWNER` > `ADMIN` > `MEMBER`).

- `ensureWorkspace(userId)` (`src/server/queries/workspace.queries.ts`) is the canonical way to resolve "the current workspace" in a server component or action — it also auto-provisions a personal workspace for users who don't have one yet (e.g. first OAuth login). Prefer this over a manual `workspaceMember.findFirst` query.
- Which workspace is "active" is driven by an `active_workspace` cookie (`ACTIVE_WORKSPACE_COOKIE`), read by `getActiveWorkspaceId`. Users can belong to and switch between multiple workspaces via `WorkspaceSwitcher`. How many workspaces a user can *own* is plan-gated (`PLAN_LIMITS[plan].workspaces` — free/starter: 1, pro: 5) because Starter's per-workspace resource caps (links/campaigns/domains) could otherwise be multiplied by creating extra workspaces.
- Permissions: `OWNER`/`ADMIN` manage members, branding, and defaults; only `OWNER` can change member roles or transfer ownership; the owner can't be removed and must transfer ownership before leaving.

### Link redirect pipeline

The core product path: `src/app/[slug]/route.ts` → `handleRootRedirect` (`src/server/redirects/handle-root-redirect.ts`). `resolveSlug` resolves two link types — **managed** (owned by a registered user, full feature set) and **guest** (anonymous, created without an account, limited fields); managed links take priority on a slug collision.

Redirect behavior has a strict precedence order inside `handleRootRedirect`, and only one outcome fires per request: password gate → click recording → geo-targeting (`cf-ipcountry` header) → A/B split testing (only if geo didn't already redirect) → retargeting pixels → cloaking (iframe) → hide-referrer (JS redirect page) → OG-tags-only (meta redirect page) → plain HTTP redirect (301/302/307 per `redirectType`).

### Plan gating

`src/lib/plans.ts` (`PLAN_LIMITS`, `canCreate*` helpers) defines free/starter/pro limits (links, campaigns, custom domains, client portals, workspaces, etc.). `getUserPlan(userId)` (`src/lib/subscription.ts`) derives the tier from Stripe fields on `User` (`stripePriceId`, `stripeCurrentPeriodEnd`, `lifetimeAccess`) — there is no separate "plan" column. Free-plan usage is tracked via lifetime counters on `User` (`totalLinksCreated`, `totalCampaignsCreated`) since free users could otherwise delete/recreate resources to dodge a live count; paid plans check the live count instead.

### Demo mode

`NEXT_PUBLIC_DEMO=true` makes every dashboard page branch to hardcoded fixtures in `src/lib/demo-stats.ts` instead of querying the database — used for the public marketing demo. When adding a field to a real query/page, the matching demo fixture usually needs updating too, or the feature silently disappears in demo mode.

### Auth (`src/lib/auth.ts`)

NextAuth v4, JWT session strategy, Google OAuth + credentials (email/password).

- **2FA** is a hand-rolled TOTP implementation (`src/lib/totp.ts`, RFC 6238 via Node's `crypto`, no external dependency), with backup codes stored on `User.twoFactorBackupCodes`. The credentials `authorize()` callback throws the literal string `"2FA_REQUIRED"` when the password is correct but no OTP was supplied; the login form checks for that exact error to reveal the OTP field and resubmit.
- **Session revocation**: sessions are JWTs, not DB-backed, so "sign out everywhere" works via `User.sessionVersion` — bumping it makes the `session` callback drop the `user` from the session object, invalidating every existing token on its next request.
- **Login activity**: `LoginEvent` rows are written from the credentials `authorize()` callback (has request headers, so IP/browser are captured) and from the `signIn` event for Google sign-ins (no request object available there, so IP/browser are recorded as unknown).

### Image uploads (Cloudinary)

`src/components/shared/image-uploader.tsx` is the one reusable upload component (local preview → explicit "Upload" click → Cloudinary) used everywhere an image is needed (avatars, workspace branding logo, QR center logo, link OG image). Uploads are signed server-side (`src/features/uploads/actions/upload.actions.ts` generates a signature with `CLOUDINARY_API_SECRET`, which never reaches the client) and go directly from the browser to Cloudinary. Every upload lands in `<workspace-slug>/<purpose>/` (e.g. `acme-co/avatars/`), with the folder resolved from the *current* workspace via `ensureWorkspace`. Requires `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.

### Theme

Custom light/dark/auto theme system (`src/components/shared/theme-provider.tsx`) — not the `next-themes` package listed in `package.json` (unused leftover from scaffolding). Applies a `.dark` class to `<html>`, persisted to `localStorage` and mirrored to `User.theme`; a pre-hydration inline script in `src/app/layout.tsx` sets the class before paint to avoid a flash of the wrong theme.

### Code organization

Code outside `src/app` (routes) is organized under `src/features/<domain>/{actions,components,schemas}` (e.g. `features/campaigns`, `features/workspace`, `features/links`) rather than by technical layer. Cross-cutting server logic lives in `src/server/{queries,services,redirects,db}`; shared UI lives in `src/components/{ui,shared,charts,layout}`. Path alias `@/*` maps to `src/*`.
