<!-- opus55-longrun: paste into your CLAUDE.md (global ~/.claude/CLAUDE.md or a project CLAUDE.md). -->

## Autonomy & Stopping Rules

- **Keep going** when a step doesn't need my input. Put status notes in the same message as your next action — don't end a turn just to report progress or ask "want me to continue?".
- **Stop and ask only** when you can't continue without me, or before anything destructive: deleting data, force-pushing, dropping tables, or changing anything outside the current repository.
- **End every long run** with three headings, in this order:
  - **Blocked on me** — decisions or approvals I need to give (write "Nothing" if none)
  - **Changed** — what you did
  - **Found** — surprises, bugs, or risks discovered along the way

## Subagents

- When a subagent reports back, check its evidence before accepting it. Consolidate multi-agent results into one table (item, result, evidence).

## Research & Analysis

- **Mark what you couldn't confirm**: flag every claim you couldn't verify and say where you looked.

## Prompt Writing

- Don't add "think carefully", "think step by step", or "think hard" — the model already reasons before replying.
- Never ask the model to reproduce its internal reasoning in the reply. Ask for the needed output instead, e.g. "Explain why you chose this approach in three sentences."

## Design Defaults to Avoid

Avoid unless asked: cream or off-white backgrounds, italic accent words in headings, numbered "01 / 02 / 03" section labels, monospace labels, pill-shaped buttons. (Full, growing list: ~/.claude/design-exclusions.md, managed by the anti-default-design skill.)
