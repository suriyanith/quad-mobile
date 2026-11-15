# Thread 4: Activity tab pull-to-refresh and empty state

A small feature PR. Today `src/app/activity.tsx` renders a live Convex feed in a `FlatList`; the relative
times ("5m ago") only update when new data arrives, and the empty state is a single line of muted text.

## Prompt

```
Make one small change to the Activity tab of this Expo app (src/app/activity.tsx). Do not scaffold anything and do not change the Convex schema or functions.

Today: the screen renders useQuery(api.activity.list) in a FlatList (testID activity-list) with items (testID activity-item) and a ListEmptyComponent card (testID activity-empty). The feed is already live through Convex, but the "5m ago" labels go stale because nothing re-renders them, and the empty state is one line of muted text.

Change:
1. Pull-to-refresh on the FlatList using React Native's RefreshControl (testID activity-refresh). The Convex query is already reactive, so refreshing must not refetch by hand: show the spinner for about 600 ms and bump a piece of state so the relative times re-render. Also re-render the times once a minute while the screen is mounted, and clear that timer on unmount.
2. A better empty state, keeping testID activity-empty: a short heading "No activity yet", the existing explanatory sentence, and a button labelled "Add a note" (testID activity-empty-notes) that navigates to the Notes tab with expo-router. Pull-to-refresh must also work when the list is empty.
3. Reuse the components in src/components/ui (Card, Body, Button, usePalette). No new dependencies.

Before opening the pull request: run npx tsc --noEmit and npx expo lint and fix what they report. Then build the iOS app on Revyl with the preview profile in .revyl/config.yaml, install it on a cloud iPhone, and run one Revyl check: open the Activity tab, pull down on the list, and confirm the screen still shows either activity items or the "No activity yet" empty state with an "Add a note" button; tap "Add a note" if it is shown and confirm the Notes tab opens. Screenshot the Activity tab. Save the check as .revyl/tests/quad-activity-refresh.yaml in the same format as .revyl/tests/quad-notes-add.yaml (build name "Quad iOS").

Open a pull request with the screenshot in its description. Read AGENTS.md first: check the Expo SDK 58 docs before using any Expo API.
```

## Expected outcome

- One pull request touching `src/app/activity.tsx` and adding `.revyl/tests/quad-activity-refresh.yaml`.
- A screenshot of the Activity tab in the PR description, and a Revyl verdict comment if thread 2 is merged.

## Verify

- No changes under `convex/`, no new packages in `package.json`.
- `activity-list`, `activity-item` and `activity-empty` testIDs still exist (the README documents them).
- On the phone: pulling down shows a spinner briefly; with a fresh install (no setup) the screen still shows
  the "Set up your agent on the Home tab" card (`activity-needs-setup`), which this change must leave alone.
- `npx tsc --noEmit` passes.
