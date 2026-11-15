# Thread 5: haptic feedback when a bump matches

A small feature PR. `src/app/bump.tsx` moves through phases (waiting -> matched -> connected / declined) with
no physical feedback. `expo-haptics` is not installed yet.

## Prompt

```
Add haptic feedback to the Bump tab of this Expo app (src/app/bump.tsx). Do not scaffold anything and do not change the Convex schema or functions.

Today: a bump (accelerometer spike or the "Simulate bump" button, testID simulate-bump) posts to the Quad server, the screen shows a waiting state for up to 15 s, and on a match it sets the phase to "matched" and shows the code in the status text (testID bump-status) with confirm and decline buttons (testIDs bump-confirm, bump-decline). Confirming leads to "connected" or "declined". There is no haptic feedback and expo-haptics is not in package.json.

Change:
1. Install expo-haptics with npx expo install expo-haptics (never npm install; see AGENTS.md) and read the Expo SDK 58 docs for it before writing code.
2. Put the calls in a small helper, src/lib/haptics.ts, that never throws: haptics are unavailable on simulators and on web, so swallow errors and skip web.
3. Fire: a light impact when a bump is detected and the request is sent; a success notification when the phase becomes "matched"; a success notification when it becomes "connected"; a warning notification when it becomes "declined" or the wait times out with no match. Fire once per transition, not on every render.
4. Change nothing else about the bump flow, its timings, or its testIDs.

Before opening the pull request: run npx tsc --noEmit and npx expo lint and fix what they report. Then build the iOS app on Revyl with the preview profile in .revyl/config.yaml (a new native module means a new build is required), install it on a cloud iPhone, and run the saved test .revyl/tests/quad-bump.yaml: open the Bump tab, tap "Simulate bump", and confirm the waiting state appears and the app does not crash. A simulator cannot feel haptics, so the check proves the flow still works with the module linked; say that plainly in the pull request. Screenshot the Bump tab in the waiting state.

Open a pull request with the screenshot in its description.
```

## Expected outcome

- One pull request: `expo-haptics` added to `package.json` and `package-lock.json`, new `src/lib/haptics.ts`,
  a few calls in `src/app/bump.tsx`.
- A passing `quad-bump` run on a fresh Revyl build, with a screenshot.

## Verify

- `expo-haptics` version is the SDK 58 one (`~58.x`), installed by `npx expo install`.
- The haptic calls sit in effects or handlers keyed on the phase change, not in render.
- `simulate-bump`, `bump-status`, `bump-confirm`, `bump-decline`, `bump-reset` testIDs are unchanged.
- The PR says the haptics themselves were not felt on the simulator. Feel them on a real phone (Expo Go or a
  device build) before the demo if you plan to mention them.
