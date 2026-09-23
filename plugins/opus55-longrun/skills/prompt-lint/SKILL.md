---
name: prompt-lint
description: Scans CLAUDE.md files, skills, agents, slash commands, and saved prompts for patterns that are redundant or harmful on Opus 5.5 — "think carefully / step by step / think hard", requests to show internal reasoning, missing stop conditions in autonomous instructions — and proposes rewrites. Use when the user types /prompt-lint, after installing new plugins or skills, when migrating prompts to a new model, or when asked to "clean up", "audit", or "modernize" prompts or CLAUDE.md.
argument-hint: "[paths...] [--fix]"
---

# Prompt Lint

Opus 5.5 reasons before every reply on its own, so "think hard" directives only slow it down. Asking it to reproduce its internal reasoning in the reply can get a message flagged. This skill finds both, plus a few related problems.

## Step 1 — Scan

Run the bundled scanner from this skill's directory:

```bash
bash "<this skill's base directory>/scripts/prompt-lint.sh" [paths...]
```

With no paths it scans `~/.claude/CLAUDE.md`, `~/.claude/{skills,agents,commands}`, and in the current repo `./CLAUDE.md`, `./.claude/`, and `./AGENTS.md`. It prints `file:line: [rule] text`.

Then read each hit in context. The scanner is regex-based, so drop false positives: text that *describes* a pattern (like this skill), quoted examples, and tests.

## Step 2 — Judge the semantic rules

The scanner can't catch these. Check them by reading:

- **R4, no finish line:** instructions that send the model off autonomously ("implement…", "migrate…", "run all phases…") but never say what "done" means or when to stop and ask.
- **R5, stop-happy wording:** instructions that force a pause after every step ("confirm with me after each step", "always ask before proceeding") where that isn't intended. They cause "Want me to continue?" loops.

## Rules and rewrites

| Rule | Pattern | Rewrite |
|---|---|---|
| R1 think-directive | "think carefully", "think step by step", "think hard", "think deeply", "take a deep breath", "ultrathink" | Delete it. If depth matters, raise the effort setting instead. For trivial asks: "Answer directly." |
| R2 show-reasoning | "show your reasoning / thinking / chain of thought / thought process", "explain your thinking before answering", "reason out loud" | Ask for the output you need: "Explain why you chose this approach in three sentences." |
| R3 vague anti-generic | "avoid generic design", "make it not look AI-generated" without named patterns | Replace with named exclusions (see the anti-default-design skill) |
| R4 no finish line | autonomous task with no done criteria or stop rules | Add "Done means: …" and "Stop and ask only if: …" |
| R5 stop-happy | forced check-ins after every step | "Keep going when a step doesn't need my input; stop only when blocked or before destructive actions." |

## Step 3 — Report

```
## Prompt lint — N findings in M files

| File:line | Rule | Current | Suggested |
|---|---|---|---|
```

Group by file. Mark files under `~/.claude/plugins/cache/` or `~/.claude/plugins/marketplaces/` as **read-only (upstream)**. Plugin updates overwrite those files, so report them only, and suggest raising an issue upstream or overriding with the user's own skill.

## Step 4 — Fix (only with `--fix` or when the user approves)

Apply the rewrites to user-owned files only. Change the offending phrase or sentence and nothing else, and show a one-line summary per file. Never edit upstream plugin files.
