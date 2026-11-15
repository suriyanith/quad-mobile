# Sponsor runbook (Convex + Capy + Revyl) - do in this order

All three are required for prizes. Submit by 6:30 PM Pacific. `<...>` = you fill in.

## A. Convex (dashboard.convex.dev)

1. Sign in, create a project (name it `quad-mobile`).
2. Open the **Development** deployment -> **Settings** -> **Generate a deploy key** -> **Select all** -> **Create**. Copy it (this is `CONVEX_DEPLOY_KEY`).
3. Copy the dev deployment URL (`https://<name>.convex.cloud`) and paste it into `.revyl/config.yaml` at `build.env.EXPO_PUBLIC_CONVEX_URL`. Commit + push.
4. Locally (optional if Capy does it), from the repo root:
   ```
   export CONVEX_DEPLOY_KEY='<key from step 2>'
   npx convex dev --once
   npx convex env set QUAD_EVENT_SECRET '<same secret the Quad web app uses>'
   ```

## B. Capy (capy.ai)

5. Sign in with your **hackathon registration email** (the free Capy Max month is tied to it; cloud phones need Pro or higher).
6. Push this repo to GitHub as a **public** repo (required for submission).
7. Onboarding -> **Connect GitHub** -> on GitHub pick **Only select repositories** -> the quad-mobile repo.
8. Project menu above the message box -> **New project** -> **GitHub repository** -> the quad-mobile repo.
9. On New thread, with the project selected: **+** in the message box -> **Environment variables** -> **Project** -> Key `CONVEX_DEPLOY_KEY`, Value = key from step 2 -> **Add variable**. (It is saved when you send the first message.)
10. Thread 1 - send exactly:
    ```
    This repo already contains Quad, an Expo app (Expo Router + TypeScript + Convex) at the root. Do not scaffold a new app. Run npx convex dev --once and fix any errors it reports. Run npx convex env set QUAD_EVENT_SECRET only if it is not already set, and ask me for the value. Then build the iOS app in this repo on Revyl as a standalone simulator build with the JavaScript bundled and EXPO_PUBLIC_CONVEX_URL set, using the preview profile in .revyl/config.yaml (fill in app_id and the EXPO_PUBLIC_CONVEX_URL value there and commit them). Install it on a cloud iPhone and run one Revyl check that adds an item: open the Notes tab, add the note "Study CS61B with Maya", verify it appears in the list, and screenshot the result.
    ```
11. If the build sits waiting: **Settings -> Integrations -> Revyl -> Approve in Revyl** (only happens if your email already had a Revyl account; if the code expires choose **Request approval again**). When it shows **Connected**, **Open dashboard** shows builds and devices.
12. Choose **Open** on the phone card in the thread. Screen-record this for the demo video.
13. Review Capy's PR under **Pull requests** in the side pane; merge it.
14. Thread 2 - send exactly (needs the Revyl GitHub App on the repo; Capy will hand you an install link):
    ```
    Turn on Revyl proof of changes for this repository's pull requests. Read https://docs.revyl.com/agents/proof.md and follow it.
    ```
    Merge that PR. Proofs only start once the Revyl config is merged, and they skip draft PRs. Then open one small non-draft PR to get a verdict comment.
15. Thread 3 - send exactly:
    ```
    Add the Convex hackathon skill to this repo: download SKILL.md and references/log-format.md from https://github.com/convex/convex-hackathon-skill into .agents/skills/convex-hackathon-skill/, keeping the references/ folder. Then follow the SKILL.md to update the existing hackathon.md at the project root, and open a pull request with the skill folder and hackathon.md.
    ```
    Merge it. After that, any new thread can refresh the log with `$convex-hackathon-skill`.

## C. Revyl CLI alternative (only if the Capy path stalls; needs a Revyl account)

16. Sign up at app.revyl.ai/signup (free: 1,200 device minutes/month, 2 devices). Note: signing up before Capy connects triggers the approval in step 11.
17. Install + sign in (approve the printed link/code in a browser within 10 minutes):
    ```
    curl -fsSL https://revyl.com/install.sh | sh
    export PATH="$HOME/.revyl/bin:$PATH"
    revyl auth login
    ```
18. Create the app (config already exists, so skip `revyl init -y`), paste the returned id into `.revyl/config.yaml` at `build.profiles.preview.ios.app_id`, validate:
    ```
    revyl app create --name "Quad iOS" --platform ios --json
    revyl config validate
    ```
19. Cloud build from the Git worktree; wait for status success, copy `build_version_id`:
    ```
    revyl build --platform ios --profile preview --json
    ```
20. Start a device (save `session_id`, open `viewer_url`):
    ```
    revyl device start --platform ios --build-version-id YOUR_BUILD_ID --json
    ```
21. Check and stop:
    ```
    SESSION_ID="YOUR_SESSION_ID"
    revyl device screenshot --session-id "$SESSION_ID" --out after.png
    revyl device validation --session-id "$SESSION_ID" "The Notes tab lists a note that says Study CS61B with Maya." --json
    revyl device stop --session-id "$SESSION_ID"
    ```
22. Register and run the saved tests (the app name in each file must equal `Quad iOS`):
    ```
    revyl test create quad-notes-add --from-file .revyl/tests/quad-notes-add.yaml
    revyl test create quad-setup --from-file .revyl/tests/quad-setup.yaml
    revyl test create quad-bump --from-file .revyl/tests/quad-bump.yaml
    revyl test run quad-notes-add
    ```

## D. Submit by 6:30 PM Pacific

23. Submit on vibeapps.dev via the form linked from https://consumermobilehackathon.com/submit. Tag it **Consumer Mobile Hackathon**.
24. Required: a **demo video** and a **public GitHub repo**. The project must use Capy, Revyl and Convex.
25. Have ready as evidence: Capy PRs in the repo, the Revyl phone recording / test report link / PR verdict comment, `hackathon.md` with the real `*.convex.cloud` URL.

## Ambiguities in the docs (flagged)

- **Profile name for proofs:** the hackathon page builds with `--profile preview`; Revyl's proof doc tells the agent to point `pr_review.build.profile` at a `pull-request` profile. Either let Capy add a `pull-request` profile or point it at `preview`; do not hand-write `pr_review` (full schema was not in the pages read).
- **Who fills app_id on the Capy path:** not stated. The step 10 prompt tells Capy to do it; if the Capy-created Revyl app has a different name than `Quad iOS`, fix `build.name` in `.revyl/tests/*.yaml`.
- **Xcode scheme:** the docs example hardcodes `YourApp.xcworkspace`; ours derives it from the prebuild output so an `app.json` rename does not break the build.
- **Package manager:** docs example uses `bun`; we use `npm ci` because the repo has `package-lock.json`.
- **`npx convex dev --once` with a deploy key:** the hackathon page prescribes it; if the CLI refuses, use `npx convex deploy` against the dev key.
- **`revyl test create --from-file`** copies the YAML into `.revyl/tests/`; ours already live there, so if it complains about an existing file, pass a copy from another path.
- **Convex skill path:** `.agents/skills/...` for Capy; Claude Code needs `.claude/skills/...` instead.
- **Submission form fields** beyond video + public repo + tag are not listed on the hackathon site.
