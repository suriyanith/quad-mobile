# Thread 2: Revyl proof of changes on pull requests

Reference: https://docs.revyl.com/agents/proof.md

Needs: the Revyl GitHub App installed on `suriyanith/quad-mobile` (you install it with your GitHub login;
Capy will hand you the link).

## Prompt

```
Turn on Revyl proof of changes for this repository's pull requests. Read https://docs.revyl.com/agents/proof.md and follow it.

Current state of this repo, so you do not redo it:
- .revyl/config.yaml already has pr_review.enabled: true, pr_review.build (kind: revyl, profile: preview) and pr_review.proof_of_changes (enabled: true, harness kind: revyl).
- The only build profile is "preview": an iOS Release simulator build with app_id set. The proof doc asks for a "pull-request" profile. Either add a pull-request profile that reuses the preview iOS recipe, or keep pointing pr_review.build.profile at preview. Pick whichever passes revyl config validate and say which you chose.
- There is no always_verify check yet. Add one: the app launches to its first screen (the Home tab titled Quad).

The repository needs the Revyl GitHub App; give me the install link and wait for me. If revyl github status shows this project as not published, ask me before you run revyl config push.

You are done when revyl config validate passes and a small pull request you open, not a draft, gets Revyl's verdict comment.
```

## Expected outcome

- A pull request that edits only `.revyl/config.yaml` (the `always_verify` check, and a `pull-request`
  profile if Capy chose to add one).
- After that merges, a second small non-draft pull request carrying Revyl's verdict comment.

## Verify

- `revyl config validate` passes on the PR branch.
- `build.env` still has both `EXPO_PUBLIC_CONVEX_URL` and `EXPO_PUBLIC_QUAD_URL`, and `app_id` is unchanged.
- The verdict comment is on a **non-draft** PR. Proofs do not run for the PR that first adds a project's
  config; they start once that config is merged.
- Keep the verdict comment link for the submission.
