---
name: merge-blockers
description: Reviews the current branch's diff against the base branch and reports ONLY problems worth blocking the merge for — each with file:line, why it's wrong, and how to demonstrate the failure. Use when the user types /merge-blockers, asks "is this safe to merge?", "anything blocking?", or wants a pre-PR / pre-human-review pass that skips style nits.
argument-hint: "[base branch, default: main] [--fix to apply fixes after the report]"
---

# Merge Blockers

A pre-merge review that reports only what would stop a merge. No style nits, no "consider…" suggestions, no praise.

## Step 1 — Get the diff

- Base = first arg, else `main`, else `master` (check which exists).
- `git fetch origin <base>` if a remote exists (ignore failure), then `git diff <base>...HEAD` plus uncommitted changes (`git diff HEAD`).
- If the diff is empty, say so and stop.
- Read the full changed files around each hunk, not just the hunk — most real bugs live in how new code meets old code.

## Step 2 — Hunt

Check every change for these blocker classes:

1. **Correctness** — logic errors, wrong conditions, off-by-one, null/undefined paths, broken error handling, race conditions, wrong async/await.
2. **Broken contracts** — changed function signatures, API responses, DB schemas, env vars, or config keys whose callers/consumers weren't updated. Grep for callers.
3. **Security** — secrets or keys in the diff, `.env` files, injection (SQL, shell, XSS), missing auth checks, unsafe deserialization.
4. **Data loss** — destructive migrations, missing `WHERE`, deleting without backup, irreversible state changes.
5. **Critical calculations** (if the code handles payments, billing, quotas, or other values where a mistake is costly) — wrong units or rounding, incorrect arithmetic, missing limit checks, retries that could apply an operation twice.
6. **Tests** — existing tests now failing, or new behavior on a critical path with zero coverage.

For large diffs (> ~15 files), split by area and give each area to a parallel subagent with the same blocker classes. Check each subagent's evidence before accepting its findings.

## Step 3 — Verify each finding

Before reporting anything, try to prove it:
- Run the relevant tests / typecheck / lint if available.
- Trace the actual call path, or write a minimal repro if cheap.

Drop anything you can't substantiate. If a finding is real but you couldn't run a proof, keep it and mark it **Unverified** with what you checked.

## Step 4 — Report

```
## Verdict: BLOCK (N issues) | CLEAR TO MERGE

### 1. <one-line title>
- **Where:** path/to/file.ts:42
- **Why it's wrong:** <1–3 sentences>
- **How to show it fails:** <command, test, or input → wrong output>
- **Fix:** <one-line suggestion>
- **Status:** Verified | Unverified (<what you checked>)
```

Order by severity (data loss, security, and critical calculations first). If nothing survives verification: `Verdict: CLEAR TO MERGE`, plus one line listing what you checked (e.g. "tests pass, typecheck clean, 12 files reviewed").

## Step 5 — Optional fix

Only if `--fix` was passed or the user asks afterward: fix Verified blockers one at a time, re-run the proof for each, and report which are now resolved. Never commit or push as part of this skill.
