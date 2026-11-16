# Quad — Consumer Mobile Hackathon submission

## 1. One-line pitch

Quad is a campus study agent that lives in iMessage: bump with a classmate and your two agents work out a joint study session for you.

## 2. Description (90 words)

Quad is a study agent every student texts in iMessage. Connect Canvas and Google once on the web dashboard, then just text. When two students bump (invite code or a phone knock), their agents exchange six typed messages: class fingerprints as bands, never grades, then calendars, a proposal and an accept. Each student gets one summary text and a booked joint session with a study-room link and a whiteboard link. Quad also watches Canvas and texts you about new assignments. The Expo + Convex mobile app shows a live feed of what your agent did.

## 3. How we used the required tools

**Capy** (https://capy.ai)
- Five agent threads started through Capy's HTTP API against the mobile repo, one task per thread; prompts are in [`capy/`](https://github.com/suriyanith/quad-mobile/tree/master/capy), launcher is `scripts/capy-thread.sh`.
- Three Capy pull requests merged on the mobile repo: [#1](https://github.com/suriyanith/quad-mobile/pull/1) Convex hackathon skill + `hackathon.md` refresh, [#2](https://github.com/suriyanith/quad-mobile/pull/2) Activity pull-to-refresh and empty state, [#3](https://github.com/suriyanith/quad-mobile/pull/3) haptic feedback on Bump.

**Revyl** (https://revyl.ai)
- Cloud iOS builds of the Expo app (standalone simulator build, JS bundled) from the `preview` profile in `.revyl/config.yaml`.
- A passing "add a note" check on a cloud iPhone: https://app.revyl.ai/tests/report?sessionId=a8ba8394-8c17-4d65-9d95-e56a49ddb62b
- Plain-English tests saved in `.revyl/tests/` (add a note, complete setup, simulate a bump).

**Convex** (https://convex.dev)
- The mobile app's whole backend: tables `students`, `activity`, `bumps`, `notes`; live queries drive the Activity and Notes tabs.
- HTTP action `POST /quad/event` (shared-secret header) lets the Quad platform push agent activity into the feed in real time.
- Deployment `fine-octopus-820` (`https://fine-octopus-820.convex.cloud`); build log in `hackathon.md`.

## 4. Other tech

- **Keiki** — the iMessage transport. Quad runs as an external harness: Keiki pushes each turn to `/api/keiki/turn`.
- **Supermemory** — the memory layer: per-student and per-pair namespaces with consent-scoped sharing, plus superrag over course files.
- **Vercel** — hosts the Next.js platform (serverless functions + cron).
- **Neon** — Postgres, migrated with Drizzle on every build.
- **OpenAI** — the agent's model; realtime model for the whiteboard / voice tutor.
- **Canvas + Google Calendar** — the student's courses, assignments and free time.

## 5. Links

| | |
| --- | --- |
| Live app | https://quad-flame-two.vercel.app |
| Setup dashboard | https://quad-flame-two.vercel.app/setup |
| Text Quad | +1 779 625 1378 — first text must include the join code `K-AGWNYZ` |
| Mobile repo (Expo + Convex) | https://github.com/suriyanith/quad-mobile |
| Platform repo (Next.js) | https://github.com/SachchitBalamurugan/quad |
| Capy PRs | https://github.com/suriyanith/quad-mobile/pulls?q=is%3Apr (#1, #2, #3, all merged) |
| Revyl session | https://app.revyl.ai/tests/report?sessionId=a8ba8394-8c17-4d65-9d95-e56a49ddb62b |
| Convex deployment | `fine-octopus-820` — https://fine-octopus-820.convex.cloud |

## 6. Demo video shot list (75 seconds)

| # | Time | On screen | Say |
| --- | --- | --- | --- |
| 1 | 0:00–0:10 | Browser at `/setup`. Paste the Canvas token, click Google sign-in, show both connected. | "Quad is a study agent that lives in iMessage. Setup is one page: Canvas and Google." |
| 2 | 0:10–0:20 | iMessage to +1 779 625 1378. Send "K-AGWNYZ hey, what's due this week?" Show the reply. | "Then you just text it. It already knows my classes and deadlines." |
| 3 | 0:20–0:32 | Two phones. Send the friend's invite code in the thread (or knock the phones on the app's Bump tab). | "When I bump with a classmate, our two agents talk to each other, not us." |
| 4 | 0:32–0:42 | Both phones receive one text. Tap the study-room link, then the whiteboard link. | "Each of us gets one summary text: a booked session, a study room and a whiteboard." |
| 5 | 0:42–0:50 | Text "what did our agents say?" Show the reply listing the exchange. | "Six typed messages. They share bands, never grades, and only what we consented to." |
| 6 | 0:50–0:58 | Quad mobile app, Activity tab. A new row appears without refreshing. | "The mobile app runs on Convex. The platform pushes events in and the feed updates live." |
| 7 | 0:58–1:07 | Revyl report page for the session: cloud iPhone adding a note, passing. | "Revyl builds the iOS app in the cloud and checks it on a cloud iPhone." |
| 8 | 1:07–1:15 | GitHub pull requests list on `quad-mobile` (#1–#3, merged), open #1, then the `capy/` folder. | "Capy agents work the mobile repo, five threads started from its API. That's Quad." |

Before recording: both students have finished `/setup`, at least one has Google connected (for calendar events), and each phone has already sent its first text with the join code.

## 7. Copy-paste answers for the submit form

The submit page (https://consumermobilehackathon.com/submit) states only: submit on vibeapps.dev by 6:30 PM Pacific, tag it "Consumer Mobile Hackathon", a demo video and a public GitHub repo are required, and the project must use Capy, Revyl and Convex. The form itself (https://vibeapps.dev/judging/consumer-mobile-hackathon/submit) renders client-side, so the field names below are the likely ones; match them to what you see.

- **Project name:** Quad
- **Tagline:** A campus study agent in iMessage: bump with a classmate and your agents book the study session.
- **Description:** paste section 2.
- **Tag:** Consumer Mobile Hackathon
- **Demo video URL:** _(paste the uploaded video link)_
- **GitHub repo (public):** https://github.com/suriyanith/quad-mobile
- **Live app / website:** https://quad-flame-two.vercel.app
- **Second repo, if there is a field or in the description:** https://github.com/SachchitBalamurugan/quad
- **How you used Capy:** Five Capy agent threads started via Capy's API against the mobile repo, one task each; three PRs merged (#1 Convex hackathon skill, #2 Activity pull-to-refresh, #3 Bump haptics): https://github.com/suriyanith/quad-mobile/pulls?q=is%3Apr
- **How you used Revyl:** Cloud iOS builds of the Expo app and a passing "add a note" check on a cloud iPhone: https://app.revyl.ai/tests/report?sessionId=a8ba8394-8c17-4d65-9d95-e56a49ddb62b
- **How you used Convex:** Backend of the mobile app (deployment fine-octopus-820): four tables, live queries for the activity feed and notes, and an HTTP action the Quad platform calls to push agent activity.
- **Other tools:** Keiki (iMessage), Supermemory (memory), OpenAI, Vercel, Neon Postgres, Canvas, Google Calendar.
- **How to try it:** Open https://quad-flame-two.vercel.app/setup, connect Canvas and Google, then text +1 779 625 1378 with `K-AGWNYZ` in your first message.

## 8. Known limits

- Canvas changes are noticed once a day on Vercel's Hobby-plan cron unless a heartbeat is configured; the whiteboard / voice tutor needs OpenAI realtime.
- Calendar events are created only for students who connected Google; others still get the summary text and links.
- Keiki's shared line means the student must text first, with the join code, before Quad can message them.
