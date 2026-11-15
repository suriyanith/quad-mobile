# Thread 1: build on Revyl, cloud iPhone, add a note

Needs: Capy Pro or higher (the hackathon Max month covers it) and `CONVEX_DEPLOY_KEY` saved as a Project
environment variable.

## Prompt

```
This repo already contains Quad, a finished Expo app (Expo Router + TypeScript + Convex) at the repo root. Do not scaffold a new app and do not change the Convex schema.

Current state you can rely on:
- Convex dev deployment fine-octopus-820 is already deployed (https://fine-octopus-820.convex.cloud) with tables students, activity, bumps, notes and an HTTP action POST /quad/event. CONVEX_DEPLOY_KEY is set in this project's environment. Run npx convex dev --once only to confirm the functions are in sync, and fix any error it reports.
- .revyl/config.yaml already has the build recipe: profile "preview", iOS, a standalone Release simulator build with the JavaScript bundled, and EXPO_PUBLIC_CONVEX_URL and EXPO_PUBLIC_QUAD_URL set under build.env. Use that profile as it is. If the Revyl organization you build in does not own app_id 3829cb32-12d5-4c67-9af0-934022af667d, create an iOS app named exactly "Quad iOS" there, put its id in build.profiles.preview.ios.app_id, and commit that one change.

Do this:
1. Build the iOS app in this repo on Revyl as a standalone simulator build with the JavaScript bundled and EXPO_PUBLIC_CONVEX_URL set, using the preview profile.
2. Install the build on a cloud iPhone.
3. Open the Notes tab, type "Study CS61B with Maya" in the note input (testID note-input), tap Add (testID note-add), and confirm a note with that text appears in the list (testID note-item).
4. Screenshot the result and show it in this thread.
5. Run the saved Revyl test .revyl/tests/quad-notes-add.yaml (register it first if it is not registered: revyl test create quad-notes-add --from-file .revyl/tests/quad-notes-add.yaml) and report whether it passed, with the report link.
6. If you changed any file, open a pull request with only those changes. If nothing changed, say so and do not open an empty pull request.
```

## Expected outcome

- A **Mobile build** row in the thread that ends in success, and a phone card for an iPhone with Quad installed.
- A screenshot of the Notes tab listing "Study CS61B with Maya".
- A pass for `quad-notes-add` with a Revyl report link.
- A pull request only if Capy had to change `app_id` (or fix a real error). No PR is a valid result here.

## Verify

- Choose **Open** on the phone card and screen-record it for the demo video.
- The note is in Convex: dashboard -> fine-octopus-820 -> Data -> `notes`, or `npx convex data notes`.
- If a PR was opened, its diff touches only `.revyl/config.yaml` (and nothing in `convex/schema.ts`).
- If the build sits waiting: **Settings -> Integrations -> Revyl -> Approve in Revyl** (this appears because
  the email already has a Revyl account; if the code expired choose **Request approval again**).
