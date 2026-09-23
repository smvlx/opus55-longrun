# opus55-longrun

A Claude Code plugin for long, unattended runs on **Opus 5.5**. It turns the recommendations in [Getting the Most Out of Opus 5.5 in Claude and Claude Code](https://claude.dev/blog/getting-the-most-out-of-opus-5-5/) (Addy Osmani, Sep 2026) into skills and hooks you can reuse:

- say what "done" means, then let the model run
- tell it when to stop
- split big work across subagents and check what each one reports
- review results starting from what's blocked on you

## Install

In Claude Code:

```
/plugin marketplace add smvlx/opus55-longrun
/plugin install opus55-longrun@opus55-longrun
```

Or from a shell:

```bash
claude plugin marketplace add smvlx/opus55-longrun
claude plugin install opus55-longrun@opus55-longrun
```

Start a new session afterwards so the skills and hooks load.

## Skills

Run a skill as `/opus55-longrun:<name>`. Claude also picks one automatically when your request matches its description.

| Skill | What it does |
|---|---|
| `delegate` | Turns a rough ask into a brief: the task, what "done" means as checks it can run, when to stop and ask, what's out of scope. It confirms the brief once (skip with `--go`), tracks a checklist in `PROGRESS.md`, runs to the end, and finishes with **Blocked on me / Done criteria / Changed / Found**. |
| `merge-blockers` | Reviews the branch's diff and reports only problems worth blocking the merge for, each with file:line, why it's wrong, and how to show it fails. It tries to prove every finding before reporting it. |
| `fleet-audit` | One question across many services or modules. Each unit gets its own parallel subagent, every report's evidence is checked, and the result is one table. |
| `consistency-check` | Finds contradictions in long documents, decks and spreadsheets: mismatched numbers, totals that don't add up, wrong weekdays, inconsistent names, charts that disagree with the text. Each problem is quoted with its location. |
| `anti-default-design` | Keeps a growing list of named design styles you don't want (`~/.claude/design-exclusions.md`) and applies it to every UI build. Styles you reject are added to the list and the design is regenerated. |
| `research-verified` | Research where every claim is labeled Confirmed, Partial, Unconfirmed or Contradicted, and anything unconfirmed says where it was looked for. |
| `prompt-lint` | Scans CLAUDE.md files, skills, agents and commands for "think hard" wording, requests to show internal reasoning, and vague "avoid a generic look" instructions, and suggests rewrites. |

## Hooks

| Hook | Event | Behavior |
|---|---|---|
| `confirm-destructive.js` | `PreToolUse` (Bash) | Asks for confirmation before destructive commands: `rm -rf`, `git push --force`, `git reset --hard`, `git clean -f`, `git branch -D`, SQL `DROP`/`TRUNCATE`/`DELETE` without `WHERE`, `supabase db reset`, `prisma migrate reset`, `terraform destroy`, `kubectl delete`, docker prunes, cloud-resource deletion, and making a GitHub repo public. |
| `longrun-stop.js` | `Stop` | **Checklist check:** if the session started a `## Delegated:` checklist in `PROGRESS.md` and tries to stop with items still open and no "Blocked on me" report, it sends Claude back to work once. **Notification:** if the final message has a non-empty "Blocked on me" section, it shows a desktop notification (macOS, or Linux with `notify-send`). |

The destructive-command hook matches text anywhere in a command, so a commit message that mentions `git reset --hard` also triggers a prompt. That costs a click, not a blocked action. To refuse these commands outright instead of asking, change `"ask"` to `"deny"` in `hooks/confirm-destructive.js`.

Turn off parts of the Stop hook with environment variables:

- `OPUS55_STOP_GUARD=0` disables the checklist check
- `OPUS55_NOTIFY=0` disables the notification

## Recommended CLAUDE.md rules

[`plugins/opus55-longrun/CLAUDE-snippet.md`](plugins/opus55-longrun/CLAUDE-snippet.md) has the matching rules: when to keep going and when to stop, the end-of-run report format, checking subagent evidence, marking unconfirmed claims, and prompt-writing hygiene. Paste it into your global `~/.claude/CLAUDE.md` or a project's `CLAUDE.md`. The plugin doesn't add it for you.

## Requirements

- Claude Code with plugin support
- Node.js, for the hook scripts
- Bash and grep, for `prompt-lint`

## License

MIT
