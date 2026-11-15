# Capy threads for Quad mobile

One file per Capy thread. Each has the exact prompt to paste, the pull request to expect, and what to check
before merging. Send them in order, one task per thread. Setup (sign-in, GitHub, the `CONVEX_DEPLOY_KEY`
variable) is in the root `README.md` under "Capy setup (5 minutes)".

| # | File | Result |
| --- | --- | --- |
| 1 | `01-revyl-notes-check.md` | iOS build on Revyl, cloud iPhone, the note "Study CS61B with Maya", screenshot, saved test run |
| 2 | `02-proof-of-changes.md` | Revyl proof of changes verified on this repo's pull requests |
| 3 | `03-convex-hackathon-skill.md` | Convex hackathon skill installed, `hackathon.md` refreshed |
| 4 | `04-activity-feed-polish.md` | Feature PR: pull-to-refresh and a better empty state on Activity |
| 5 | `05-bump-haptics.md` | Feature PR: haptic feedback when a bump matches |

Threads 4 and 5 are independent of each other and can run at the same time. Run thread 2 before them if you
want a Revyl verdict comment on their pull requests.

## Starting a thread from the terminal (optional)

Capy documents an HTTP API (https://docs.capy.ai/api-reference/quickstart). `scripts/capy-thread.sh` wraps it:

```bash
export CAPY_API_KEY='capy_...'          # capy.ai -> Settings -> API; shown once
scripts/capy-thread.sh --list-projects  # find the project id
export CAPY_PROJECT_ID='project_...'
scripts/capy-thread.sh capy/01-revyl-notes-check.md
```

The script sends only the text inside the file's first fenced block under "Prompt". Environment variables
cannot be set through the API or by an agent (https://docs.capy.ai/secrets), so add `CONVEX_DEPLOY_KEY` in
the Capy app first.
