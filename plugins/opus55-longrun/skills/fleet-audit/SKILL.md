---
name: fleet-audit
description: Audits many units (services, packages, modules, apps) for one question by giving each unit its own parallel subagent, verifying every subagent's evidence, and returning one consolidated table. Use when the user types /fleet-audit, or asks to check "every service / all modules / each package" for a bug, pattern, vulnerability, dependency, or migration status.
argument-hint: "<question to answer for each unit> [in <dir or glob>]"
---

# Fleet Audit

One question, many units, one subagent per unit, one table at the end. Every "yes" or "no" needs evidence you have checked yourself.

## Step 1 — Define the audit

Pin down three things before dispatching anything:

- **Question:** the exact yes/no question for each unit, e.g. "Does this service retry non-idempotent POSTs?"
- **Units:** the list of things to audit. Use the dir or glob from the args, or discover them (`services/*`, `packages/*`, `apps/*`, `libs/*`, workspaces in `package.json`, `go.work`, `Cargo.toml`). Print the list.
- **Evidence standard:** what counts as proof. For "yes": file:line plus a code excerpt showing the problem. For "no": what was searched (patterns, entry points) and why that's enough.

If the question is vague, sharpen it yourself and state the interpretation. Only ask the user if two readings would give different results.

## Step 2 — Dispatch in parallel

Spawn one subagent per unit **in a single message** so they run at the same time. If there are more than about 10 units, group small ones so each agent gets a comparable amount of code. Give each subagent this prompt:

```
Audit <unit path> for: <question>
Evidence standard: <standard>
Only read/search; don't modify files.
Return exactly:
VERDICT: yes | no | unclear
EVIDENCE: file:line — short excerpt (for yes), or the searches you ran and their results (for no)
NOTES: anything surprising, max 3 lines
```

## Step 3 — Verify every report

Don't accept any verdict without checking it:

- **yes:** open the cited file:line and confirm the excerpt exists and actually shows the problem.
- **no:** check that the searches cover the unit's real entry points. Re-run one of them yourself for every "no" on a critical unit.
- **unclear**, or evidence that doesn't hold up: investigate it yourself or re-dispatch with a sharper prompt.

Record corrections. If you overturned a subagent's verdict, the table says so.

## Step 4 — Report

```
## <question>

| Unit | Affected | Evidence | Verified |
|---|---|---|---|
| services/billing | ✅ yes | src/client.ts:88 — `retry(post(...))` | ✔ |
| services/auth | ❌ no | no HTTP client; only gRPC stubs | ✔ |
| services/feed | ⚠ unclear | dynamic client from config | — (why) |

**Summary:** N of M affected. <1–2 lines on the pattern across affected units>
**Overturned:** <units where you corrected a subagent, and why>
**Couldn't confirm:** <what, and where you looked>
```

For more than 15 units, also write the table to `AUDIT-<slug>.md` in the repo root and link it.

Don't fix anything unless the user asks. If they do, use the table as the checklist, for example by handing it to /delegate.
