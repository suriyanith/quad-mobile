# Sponsor runbook (Convex + Capy + Revyl)

All three are required for prizes. Submit by 6:30 PM Pacific.

## Remaining human steps (do these, in order)

1. **Push the repo to GitHub as a public repo** named `suriyanith/quad-mobile` (required for submission; Capy
   can only open pull requests on a repo it is connected to).
2. **Convex deploy key.** From the repo root, copy a dev deploy key to the clipboard without printing it
   (needs `npx convex login`; `CONVEX_DEPLOY_KEY` must not be set in that shell):
   ```
   npx convex deployment token create capy-hackathon --deployment fine-octopus-820 | pbcopy
   ```
   Or in the dashboard:
   https://dashboard.convex.dev/t/suriya-nithyanandan/quad-e3178/fine-octopus-820/settings ->
   **Generate a deploy key** -> **Select all** -> **Create** -> copy.
3. **Capy sign-in.** https://capy.ai with the **hackathon registration email** (the free Capy Max month is
   tied to it; cloud phones need Pro or higher).
4. Onboarding -> **Connect GitHub** -> on GitHub pick **Only select repositories** -> `suriyanith/quad-mobile`.
5. Project menu above the message box -> **New project** -> **GitHub repository** -> `suriyanith/quad-mobile`.
6. With the project selected: **+** in the message box -> **Environment variables** -> **Project** -> Key
   `CONVEX_DEPLOY_KEY`, Value = the key from step 2 -> **Add variable**.
7. **Thread 1:** paste the prompt from `capy/01-revyl-notes-check.md` and send.
   - If the build sits waiting: **Settings -> Integrations -> Revyl -> Approve in Revyl** (this email already
     has a Revyl account; if the code expires choose **Request approval again**).
   - Choose **Open** on the phone card and screen-record it for the demo video.
   - If Capy opened a pull request, review it under **Pull requests** in the side pane and merge it.
8. **Thread 2:** paste `capy/02-proof-of-changes.md`. Install the Revyl GitHub App when Capy hands you the
   link. Merge the PR; keep the link to the verdict comment on the follow-up PR.
9. **Thread 3:** paste `capy/03-convex-hackathon-skill.md`. Merge the PR.
10. **Threads 4 and 5** (can run at the same time): paste `capy/04-activity-feed-polish.md` and
    `capy/05-bump-haptics.md`. Review and merge each PR.
11. **Submit** on vibeapps.dev via the form linked from https://consumermobilehackathon.com/submit, tagged
    **Consumer Mobile Hackathon**. Required: a **demo video** and the **public GitHub repo**. Evidence to
    have ready: the Capy PRs, the Revyl phone recording / test report link / PR verdict comment, and
    `hackathon.md` with `https://fine-octopus-820.convex.cloud`.

Optional, instead of pasting in steps 7-10: create a key under Capy **Settings -> API** and run
`scripts/capy-thread.sh` (see `capy/README.md`). Steps 3-6 still have to be done in the Capy app.

## Done

- [x] Convex project created; dev deployment `fine-octopus-820` deployed
  (`https://fine-octopus-820.convex.cloud`) with tables `students`, `activity`, `bumps`, `notes` and the HTTP
  action `POST /quad/event`.
- [x] `QUAD_EVENT_SECRET` set on the deployment; the Quad server at https://quad-flame-two.vercel.app pushes
  `connected` and `plan_confirmed` events, checked live.
- [x] `EXPO_PUBLIC_CONVEX_URL` set in `.revyl/config.yaml` (`build.env`).
- [x] Revyl project linked (`02958253-64e3-4214-a138-683e600dccaf`), app **Quad iOS** created
  (`3829cb32-12d5-4c67-9af0-934022af667d`) and set as `build.profiles.preview.ios.app_id`.
- [x] Two successful Revyl cloud iOS builds: `remote-7598560e`, `remote-6a7529db`.
- [x] `pr_review` and `proof_of_changes` enabled in `.revyl/config.yaml` (profile `preview`).
- [x] Saved Revyl tests in `.revyl/tests/`: `quad-notes-add`, `quad-setup`, `quad-bump`.
- [x] Capy thread prompts written (`capy/`), README sponsor section, `hackathon.md` build log.

Not done yet: nobody has signed in to Capy, the repo is not on GitHub, the Revyl GitHub App is not installed,
and the Convex hackathon skill is not in the repo (thread 3 adds it).

## Revyl CLI fallback (only if the Capy path stalls)

The app and config already exist, so skip `revyl init` and `revyl app create`.

```
export PATH="$HOME/.revyl/bin:$PATH"
revyl auth login                                   # approve the printed link within 10 minutes
revyl config validate
revyl build --platform ios --profile preview --json   # wait for success, copy build_version_id
revyl device start --platform ios --build-version-id YOUR_BUILD_ID --json   # save session_id, open viewer_url
SESSION_ID="YOUR_SESSION_ID"
revyl device screenshot --session-id "$SESSION_ID" --out after.png
revyl device validation --session-id "$SESSION_ID" "The Notes tab lists a note that says Study CS61B with Maya." --json
revyl device stop --session-id "$SESSION_ID"
revyl test create quad-notes-add --from-file .revyl/tests/quad-notes-add.yaml
revyl test run quad-notes-add
```

## Ambiguities in the docs (flagged)

- **Profile name for proofs:** the hackathon page builds with `--profile preview`; Revyl's proof doc tells
  the agent to point `pr_review.build.profile` at a `pull-request` profile. Ours points at `preview`; the
  thread 2 prompt lets Capy keep that or add a `pull-request` profile.
- **Which Revyl organization Capy builds in:** Capy creates or links a Revyl organization on first use
  (https://docs.capy.ai/cloud-phones). If it is not the one that owns app id `3829cb32-...`, the thread 1
  prompt tells Capy to create a `Quad iOS` app there and update `app_id`. The app name must stay `Quad iOS`
  because `.revyl/tests/*.yaml` reference it.
- **Permissions of a CLI-minted deploy key:** `npx convex deployment token create` does not take a
  permission list; if Capy reports a permission error with that key, use the dashboard path with
  **Select all**.
- **`npx convex dev --once` with a deploy key:** the hackathon page prescribes it; if the CLI refuses, use
  `npx convex deploy` against the dev key.
- **`revyl test create --from-file`** copies the YAML into `.revyl/tests/`; ours already live there, so if
  it complains about an existing file, pass a copy from another path.
- **Convex skill path:** `.agents/skills/...` for Capy; Claude Code needs `.claude/skills/...` instead.
- **Submission form fields** beyond video + public repo + tag are not listed on the hackathon site.
