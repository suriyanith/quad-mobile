# Hackathon log

- **Project:** Quad
- **Event:** The Consumer Mobile Hackathon
- **What it does:** Mobile companion for Quad, a campus study agent in iMessage: set up your agent, watch a live activity feed of what it did, bump phones with a classmate, and keep notes.
- **Live app:** not deployed
- **Repo:** none
- **Frontend:** not deployed
- **Convex deployment:** https://fine-octopus-820.convex.cloud
- **Components:** none
- **Convex features:** schema, indexes, queries, mutations, internal mutations, HTTP actions, environment variables
- **Auth:** none
- **AI models:** none
- **Started:** 2026-11-15T22:48:28Z
- **Last updated:** 2026-11-15T23:11:32Z

## Log

### 2026-11-15 - 91c08f5
Started the repo from the Expo Router + TypeScript template: root layout plus
the template index and explore screens (`src/app/_layout.tsx`,
`src/app/index.tsx`, `src/app/explore.tsx`, `app.json`). No Convex code yet.

### 2026-11-15 - 6355999
Added the Revyl cloud-build recipe for a standalone iOS simulator build with the
JS bundle embedded, passing `EXPO_PUBLIC_CONVEX_URL` and `EXPO_PUBLIC_QUAD_URL`
at build time (`.revyl/config.yaml`). Added three plain-English Revyl tests for
the planned flows: add a note, complete setup, simulate a bump
(`.revyl/tests/quad-notes-add.yaml`, `.revyl/tests/quad-setup.yaml`,
`.revyl/tests/quad-bump.yaml`). Added the sponsor runbook (`SPONSORS.md`).

### 2026-11-15 - d494003
Built the app: Home (setup form and connection badges), Activity, Bump and Notes
tabs (`src/app/index.tsx`, `src/app/activity.tsx`, `src/app/bump.tsx`,
`src/app/notes.tsx`). Added the Convex backend: tables `students`, `activity`,
`bumps` and `notes` with indexes `by_deviceId`, `by_studentId_and_at`, `by_ts`
and `by_deviceId_and_at` (`convex/schema.ts`); queries and mutations for
students, notes and bumps (`convex/students.ts`, `convex/notes.ts`,
`convex/bumps.ts`); the live feed query `activity.list` and the internal
mutation `activity.add` (`convex/activity.ts`). Added the HTTP action
`POST /quad/event`, which checks the `x-quad-secret` header against the
`QUAD_EVENT_SECRET` environment variable and inserts an activity row
(`convex/http.ts`). Convex features: schema, indexes, queries, mutations,
internal mutations, HTTP actions, environment variables.

### 2026-11-15 - 96a69db
Bump screen now holds the waiting state for 15 s while it polls for a match
(`src/app/bump.tsx`).

### 2026-11-15 - dda7c39
Linked the repo to a Revyl project, set the iOS app id on the `preview` build
profile, and enabled `pr_review` with proof of changes (`.revyl/config.yaml`).
Installed the Revyl CLI agent skills (`.agents/skills/revyl-cli*`).

### 2026-11-15 - 0823435
Deployed the Convex functions to the cloud dev deployment `fine-octopus-820` and
pointed the Revyl build at it through `EXPO_PUBLIC_CONVEX_URL`
(`.revyl/config.yaml`). Two Revyl cloud iOS builds succeeded
(`remote-7598560e`, `remote-6a7529db`). The Quad server at
https://quad-flame-two.vercel.app pushes `connected` and `plan_confirmed`
events to `POST /quad/event`, and they were checked live in the `activity`
table.
