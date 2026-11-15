# Thread 3: Convex hackathon skill and build log

Reference: https://github.com/convex/convex-hackathon-skill

## Prompt

```
Add the Convex hackathon skill to this repo and refresh the build log.

1. Download SKILL.md and references/log-format.md from https://github.com/convex/convex-hackathon-skill (main branch) and save them as .agents/skills/convex-hackathon-skill/SKILL.md and .agents/skills/convex-hackathon-skill/references/log-format.md. Keep the references/ folder. Do not edit them.
2. hackathon.md already exists at the repo root and already follows the skill's header and entry format. Follow the installed SKILL.md to update it in place: keep the existing entries, add entries only for commits that are not logged yet, and set Repo to this repository's public GitHub URL. Do not invent anything; every line must be backed by a file or commit in this repo.
3. Open a pull request containing the skill folder and hackathon.md, and nothing else.
```

## Expected outcome

- One pull request adding `.agents/skills/convex-hackathon-skill/SKILL.md` and
  `.agents/skills/convex-hackathon-skill/references/log-format.md`, and updating `hackathon.md`.

## Verify

- `hackathon.md` header: `Repo` is the public GitHub URL, `Convex deployment` is
  `https://fine-octopus-820.convex.cloud`, `Components` is `none`, `Auth` is `none`.
- Existing log entries are still there, oldest first; new entries name real commit SHAs.
- No files outside the skill folder and `hackathon.md` changed.
- After merging, any later thread can refresh the log with `$convex-hackathon-skill`.
