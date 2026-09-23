---
name: anti-default-design
description: Maintains a growing, persistent list of named design patterns the user does NOT want (e.g. cream backgrounds, pill buttons, "01/02/03" labels) and applies it to every page, app, landing page, or artifact build — then adds any style the user rejects to the list and regenerates. Use when building or restyling any UI, when the user types /anti-default-design, says a design looks "generic", "templated", "AI-looking", or rejects a visual style ("I don't like the X").
argument-hint: "[list | add <pattern> | remove <pattern> | <design task>]"
---

# Anti-Default Design

Asking the model to "avoid a generic look" just swaps one default for another. What works is **naming the exact patterns to exclude** and adding to that list every time the user rejects something.

## The exclusion list

The list lives in two files. Read both, and merge them with the project file taking precedence:

- **Global:** `~/.claude/design-exclusions.md`
- **Project:** `.design-exclusions.md` in the repo root, if present

If the global file doesn't exist, create it with this seed:

```markdown
# Design exclusions
<!-- One pattern per line. Be specific: name the visual thing, not a vibe. -->
- Cream or off-white page backgrounds
- Italic accent words inside headings
- Numbered "01 / 02 / 03" section labels
- Monospace labels / eyebrow text
- Pill-shaped (fully rounded) buttons
```

## Subcommands

- `list`: print the merged list, marking which file each entry comes from.
- `add <pattern>`: append to the global file (or to the project file if the user says "for this project"), with today's date in a trailing comment. Rewrite vague input into a specific visual pattern, e.g. "too corporate" → "Blue-gradient hero with centered headline and two CTA buttons". Confirm the wording.
- `remove <pattern>`: delete the closest match and confirm which line was removed.

## When building a design

1. Load the exclusion list first.
2. **Pick a direction explicitly** and state it in 3–5 lines before writing code: background, palette (hex values), type pairing, layout structure, and component shape language (corners, borders, buttons).
3. **Check the direction against every entry.** If anything collides, change the direction, not the list.
4. Build it. If `frontend-design` or `ui-ux-pro-max` is available, use it for execution; this skill only governs what to exclude.
5. Before showing it, scan the result against the list once more. Look at CSS values too: `border-radius: 9999px`, `#faf8f5`-ish backgrounds, `font-family: monospace` on labels.

## When the user rejects something

If the user rejects a style (e.g. "don't like the gradient", "the cards look cheap"):

1. Turn the complaint into a specific, named pattern.
2. `add` it to the list. Use the global file by default, or the project file if it's clearly project-specific.
3. Pick a new direction that avoids the whole updated list, state it, and regenerate.
4. Tell the user in one line what was added, so the list stays visible and editable.

Never swap one template default for another. If the replacement direction also feels like a common default, say which one and pick again.
