# Quad mobile

Companion app for **Quad**, the campus study agent that lives in iMessage. Set up your agent, bump phones with a
classmate, and watch what your agent did — live.

Expo (SDK 58, Expo Router, TypeScript) + Convex. The Quad server itself is a separate Next.js app at
`https://quad-flame-two.vercel.app`.

## Built with Capy, Revyl and Convex

| Tool | What it does in this project |
| --- | --- |
| **Convex** | The backend. Tables `students`, `activity`, `bumps`, `notes`; live queries drive the Activity and Notes tabs; the HTTP action `POST /quad/event` lets the Quad server push `connected` and `plan_confirmed` events into the feed. |
| **Revyl** | Cloud iOS builds (standalone simulator build, JS bundled) from the `preview` profile in `.revyl/config.yaml`, cloud iPhones to run them on, the saved tests in `.revyl/tests/`, and proof of changes on pull requests (`pr_review` is enabled). |
| **Capy** | Coding agent that opens the pull requests. Each thread in `capy/` is one task: it changes the code, builds on Revyl, checks the result on a cloud iPhone and opens a PR. |

| | |
| --- | --- |
| Convex deployment | `fine-octopus-820` (dev) — `https://fine-octopus-820.convex.cloud`, HTTP actions at `https://fine-octopus-820.convex.site` |
| Revyl project id | `02958253-64e3-4214-a138-683e600dccaf` |
| Revyl app id (Quad iOS) | `3829cb32-12d5-4c67-9af0-934022af667d` |
| Revyl builds | `remote-7598560e`, `remote-6a7529db` |
| Quad platform | https://quad-flame-two.vercel.app |

### Capy setup (5 minutes)

1. Sign in at https://capy.ai with the **hackathon registration email** (the free Capy Max month is tied to
   it; cloud phones and builds need Pro or higher).
2. Onboarding -> **Connect GitHub** -> on GitHub choose **Only select repositories** -> `suriyanith/quad-mobile`.
3. Project menu above the message box -> **New project** -> **GitHub repository** -> `suriyanith/quad-mobile`.
4. Get a Convex deploy key for the dev deployment. Either copy one straight to the clipboard from this repo
   (needs `npx convex login`, and `CONVEX_DEPLOY_KEY` must not already be set in the shell):
   ```bash
   npx convex deployment token create capy-hackathon --deployment fine-octopus-820 | pbcopy
   ```
   or use the dashboard: https://dashboard.convex.dev/t/suriya-nithyanandan/quad-e3178/fine-octopus-820/settings
   -> **Generate a deploy key** -> **Select all** -> **Create**.
5. In Capy, with the project selected: **+** in the message box -> **Environment variables** -> **Project** ->
   Key `CONVEX_DEPLOY_KEY`, Value = the key -> **Add variable**.
6. Paste the prompt from `capy/01-revyl-notes-check.md` and send it. When the phone card appears choose
   **Open**.
7. Review the pull request under **Pull requests** in the side pane and merge it. Then send
   `capy/02-proof-of-changes.md` through `capy/05-bump-haptics.md`, one thread each.

To start threads from a terminal instead, see `capy/README.md` (`scripts/capy-thread.sh`, needs a
`CAPY_API_KEY` from Capy **Settings -> API**).

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
