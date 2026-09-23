---
name: delegate
description: Turns a rough task into a delegation brief (task, verifiable "done" criteria, stop conditions), confirms it once, then runs it autonomously to completion with a checklist in PROGRESS.md. Use when the user types /delegate, says "take this and run with it", "handle this end to end", or hands over a large multi-step task (migration, refactor, audit, feature) they want done without supervision.
argument-hint: "<rough task description> [--go to skip brief confirmation]"
---

# Delegate

Turn the user's rough ask into a contract, then execute it without stopping until the contract is met or a stop condition fires.

## Step 1 — Ground the brief (quick, read-only)

Before writing the brief, look just enough to make the criteria concrete:
- Read `PROGRESS.md` if it exists.
- Find how the project verifies itself: test command, typecheck, lint, build (check `package.json`, `Makefile`, `pyproject.toml`, CI config).
- Locate the files/areas the task touches.

Don't start changing anything yet.

## Step 2 — Write the brief

Present it in exactly this shape:

```
## Task
<one or two sentences, in concrete terms: which code, what change>

## Done means
- [ ] <verifiable check — a command that passes, a grep that returns nothing, a behavior you can demonstrate>
- [ ] ...
(Every item must be checkable by running something or inspecting something. No "code is clean"-style criteria.)

## Stop and ask me only if
- <situations where you genuinely can't continue — e.g. a test fails for a reason you can't explain, requirements conflict>
- Before anything destructive: deleting data, force-pushing, dropping tables, touching anything outside this repo.

## Out of scope
- <things you will deliberately NOT do, to prevent scope creep>

## Plan
<3–8 bullets; mark which ones are independent and can go to parallel subagents>
```

Fill gaps with sensible defaults rather than questions. Only ask a question if the answer would change what "done" means.

## Step 3 — Confirm once

Unless the args include `--go`, show the brief and wait for one reply ("go", or edits). Apply any edits, then proceed. This is the only planned checkpoint.

## Step 4 — Record the checklist

Append a section to `PROGRESS.md` (create it if missing) headed `## Delegated: <short task name>` containing the Done-means items and the plan steps as `- [ ]` checkboxes. Tick items as they complete and add newly discovered work as new items. This file is the source of truth if context gets summarized mid-run.

## Step 5 — Run

- Keep going between steps. Put status notes in the same message as the next action; never end a turn just to report progress or ask "should I continue?".
- Hand independent plan items to parallel subagents. When each reports back, check its evidence (diff, command output) before accepting it.
- The user may add instructions mid-run — fold them into the checklist and continue, don't restart.
- Stop only when a stop condition from the brief fires. When stopping, state exactly what you need and what you'll do once you have it.

## Step 6 — Verify, then report

Before claiming done, run every Done-means check fresh and capture the output. Then end with:

```
## Blocked on me
<decisions/approvals needed, or "Nothing">

## Done criteria
| Criterion | Status | Evidence |
|---|---|---|
| ... | ✅ / ❌ | command + key output line, or file:line |

## Changed
<what was done, grouped by area>

## Found
<bugs, risks, surprises discovered along the way; anything you couldn't confirm and where you looked>
```

If any criterion is ❌, say so plainly — don't round it up to done.
