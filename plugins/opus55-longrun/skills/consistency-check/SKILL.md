---
name: consistency-check
description: Checks a long document, deck, report, plan, or spreadsheet for internal contradictions — numbers that don't match, totals that don't add up, dates whose weekday is wrong, names or titles spelled inconsistently, charts that disagree with text — and quotes each problem with its location. Use when the user types /consistency-check, or asks to "proofread the numbers", "check this deck/report for errors", "does this add up", or "find contradictions".
argument-hint: "<file path(s) or pasted text> [--strict to also flag ambiguities]"
---

# Consistency Check

Find places where the document disagrees with itself. This isn't a style edit: grammar, tone, and formatting are out of scope unless they change meaning.

## Step 1 — Extract everything, including visuals

- `.pdf` / `.pptx` / `.docx` / `.xlsx`: load the matching skill (`anthropic-skills:pdf`, `pptx`, `docx`, `xlsx`) to extract text, tables, speaker notes, and cell values.
- Charts, diagrams, and screenshots: view the images. Read axis values, labels, and bar heights. Chart-versus-text mismatches are among the most common errors.
- Keep a location for everything: page/slide number, section heading, table cell, or chart title.

## Step 2 — Build a fact ledger

Collect every checkable fact, each with its location:

| Kind | What to capture |
|---|---|
| Numbers | amounts, counts, percentages, and their units and currencies |
| Totals | sums, subtotals, "X of Y", percentages that should add to 100 |
| Dates | full dates, weekdays, quarters, durations, deadlines, "N weeks from" |
| Names | people, companies, products, titles and roles, versions |
| Cross-refs | "see slide 7", "as shown above", figure and table numbers |
| Claims | the same metric stated in more than one place |

## Step 3 — Cross-check

- The same metric stated in more than one place: do the values match, including rounding and units?
- Recompute every total, subtotal, percentage, and growth rate.
- Check every date's weekday. Compute it; don't guess. Check sequences: does a start come before its end, and do stated durations fit?
- Names: spelling, title, and role consistent throughout.
- Cross-refs: does the target exist and say what's claimed?
- Charts versus text, and tables versus narrative.
- Timeline logic: do dependencies happen before the things that depend on them?

Use a quick script (python, or node) for arithmetic and weekday checks when there are more than a handful.

## Step 4 — Report

```
## Consistency check: <document> — N issues

### 1. <short title>   [severity: high | medium | low]
- **Where:** slide 4 (chart "Q3 revenue") vs slide 9 (body text)
- **Says:** "Q3 revenue $4.2M" … "revenue grew to $3.9M in Q3"
- **Problem:** same metric, different values
- **Likely correct:** <if one can be determined, and why; else "can't tell from the document">
```

- Quote exactly and keep quotes short.
- High severity means a number or date a reader would act on. Low means cosmetic inconsistency, such as "Acme Inc." versus "ACME".
- End with **Checked and consistent:** one line on what passed (e.g. "all 14 totals recompute; all 9 dates' weekdays correct"), so the user knows the coverage.
- With `--strict`, add an **Ambiguities** section for things that aren't contradictions but could be read two ways.

Don't edit the file unless asked.
