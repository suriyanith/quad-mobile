# Hackathon log

- **Project:** Quad
- **Event:** The Consumer Mobile Hackathon
- **What it does:** Mobile companion for Quad: set up your profile to text Quad, watch a live activity feed, bump with a classmate, and keep shared notes.
- **Live app:** not deployed
- **Repo:** none
- **Frontend:** not deployed
- **Convex deployment:** not deployed
- **Components:** none
- **Convex features:** none yet
- **Auth:** none
- **AI models:** none
- **Started:** 2026-11-15T22:48:28Z
- **Last updated:** 2026-11-15T22:49:20Z

## Log

### 2026-11-15 - 91c08f5
Started the repo from the Expo Router + TypeScript template: root layout plus
the template index and explore screens (`src/app/_layout.tsx`,
`src/app/index.tsx`, `src/app/explore.tsx`, `app.json`). No Convex code yet.

### 2026-11-15 - working tree
Added the Revyl cloud-build recipe for a standalone iOS simulator build with the
JS bundle embedded, passing `EXPO_PUBLIC_CONVEX_URL` and `EXPO_PUBLIC_QUAD_URL`
at build time (`.revyl/config.yaml`). Added three plain-English Revyl tests for
the planned flows: add a note, complete setup, simulate a bump
(`.revyl/tests/quad-notes-add.yaml`, `.revyl/tests/quad-setup.yaml`,
`.revyl/tests/quad-bump.yaml`). Added the sponsor runbook (`SPONSORS.md`).
