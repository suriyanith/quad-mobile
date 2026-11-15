# Quad mobile

Companion app for **Quad**, the campus study agent that lives in iMessage. Set up your agent, bump phones with a
classmate, and watch what your agent did — live.

Expo (SDK 58, Expo Router, TypeScript) + Convex. The Quad server itself is a separate Next.js app at
`https://quad-flame-two.vercel.app`.

## Run it

```bash
npm install

# 1. Convex: push schema + functions and write EXPO_PUBLIC_CONVEX_URL to .env.local.
#    Needs `npx convex login` (interactive) or CONVEX_DEPLOY_KEY in the environment.
npx convex dev --once

# 2. Shared secret the Quad server uses to push events into the feed.
npx convex env set QUAD_EVENT_SECRET <value>

# 3. Start the app (press i for the iOS simulator).
npx expo start
```

No Convex account handy? `CONVEX_AGENT_MODE=anonymous npx convex dev` runs a local backend on `127.0.0.1:3210`
(fine for the simulator on the same machine; not reachable from a cloud device).

### Environment

| Variable | Default | Purpose |
| --- | --- | --- |
| `EXPO_PUBLIC_CONVEX_URL` | none — app shows "Convex not configured" | Convex deployment URL (`https://<name>.convex.cloud`) |
| `EXPO_PUBLIC_QUAD_URL` | `https://quad-flame-two.vercel.app` | Quad server base URL |

`EXPO_PUBLIC_*` values are inlined at bundle time: for a simulator/EAS build, set them in `.env.local` (or EAS env)
before building.

### Build for a cloud simulator (Revyl)

```bash
npx expo prebuild --platform ios
npx expo run:ios --configuration Release        # or: eas build -p ios --profile preview (simulator build)
```

Bundle id `ai.quad.app`, scheme `quad`.

## Screens

| Tab | What it does | Key testIDs |
| --- | --- | --- |
| Home | First run: name, school, daily minutes → `POST /api/setup`; token saved in SecureStore and mirrored to Convex `students`. Then connection badges from `GET /api/setup/state`, "Finish setup" (opens the setup URL), "Text Quad" (opens `firstMessage.smsUrl`). | `setup-first-name`, `setup-school`, `setup-minutes-60`, `setup-submit`, `badge-canvas`, `badge-google`, `finish-setup`, `text-quad` |
| Activity | Live `useQuery(api.activity.list)` feed for the student's Quad id. | `activity-list`, `activity-item`, `activity-empty` |
| Bump | Accelerometer spike > 2.5 g (300 ms debounce) or **Simulate bump** → `POST /api/bump/motion` → waiting → matched code → confirm → connected. Each bump is also recorded in Convex `bumps`. | `simulate-bump`, `bump-status`, `bump-confirm`, `bump-decline`, `bump-reset` |
| Notes | List + text field + Add, backed by Convex `notes`. | `note-input`, `note-add`, `note-item` |

## Convex backend (`convex/`)

- `schema.ts` — `students`, `activity` (index `by_studentId_and_at`), `bumps` (index `by_ts`), `notes`.
- `students.get` / `students.upsert`, `activity.list`, `activity.add` (internal), `notes.list` / `notes.add`, `bumps.record`.
- `http.ts` — `POST /quad/event`.

`convex/_generated/` is produced by `npx convex dev` / `npx convex codegen` and is committed, per Convex convention.

### How the Quad server pushes live updates

HTTP actions are served from the deployment's **site** URL (`https://<name>.convex.site`, also written to
`.env.local` as `EXPO_PUBLIC_CONVEX_SITE_URL`).

```
POST https://<name>.convex.site/quad/event
x-quad-secret: <QUAD_EVENT_SECRET>
content-type: application/json

{
  "type": "plan_confirmed",          // connected | plan_confirmed | proactive | session_ready | note
  "studentId": "stu_abc123",         // Quad student id (state.student.id)
  "title": "Locked in: CS61B with Maya",
  "body": "Thu 4pm, Moffitt",        // optional string
  "at": 1794772800000                // optional; epoch ms or ISO string, defaults to now
}
```

| Status | Body | When |
| --- | --- | --- |
| 200 | `{"ok":true,"id":"<activity doc id>"}` | inserted |
| 400 | `{"ok":false,"error":"..."}` | bad JSON, unknown `type`, missing `studentId`/`title`, bad `at` |
| 401 | `{"ok":false,"error":"unauthorized"}` | missing or wrong `x-quad-secret` |
| 500 | `{"ok":false,"error":"QUAD_EVENT_SECRET is not set"}` | secret not configured on the deployment |

```bash
curl -X POST "https://<name>.convex.site/quad/event" \
  -H "x-quad-secret: $QUAD_EVENT_SECRET" -H "content-type: application/json" \
  -d '{"type":"proactive","studentId":"stu_abc123","title":"New in CS61B: Project 2 posted","body":"Due Friday"}'
```

The row appears in the Activity tab immediately — no refresh.

## Checks

```bash
npx tsc --noEmit
npx expo export --platform ios
```
