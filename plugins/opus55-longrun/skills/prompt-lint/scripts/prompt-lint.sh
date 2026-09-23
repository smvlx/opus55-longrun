#!/usr/bin/env bash
# Regex scan for prompt patterns that are redundant/harmful on Opus 5.5.
# Usage: prompt-lint.sh [paths...]   (defaults to user + current-repo prompt locations)
set -u

if [ "$#" -gt 0 ]; then
  TARGETS=("$@")
else
  TARGETS=()
  for p in "$HOME/.claude/CLAUDE.md" "$HOME/.claude/skills" "$HOME/.claude/agents" "$HOME/.claude/commands" \
           "./CLAUDE.md" "./.claude" "./AGENTS.md"; do
    [ -e "$p" ] && TARGETS+=("$p")
  done
fi
[ "${#TARGETS[@]}" -eq 0 ] && { echo "No prompt files found."; exit 0; }

R1='think (really |very )?(carefully|hard|harder|deeply|step[- ]by[- ]step)|take a deep breath|ultrathink'
R2='show (me )?(your|its|the) (internal )?(reasoning|thinking|chain[- ]of[- ]thought|thought process)|explain your thinking before|reason (out loud|aloud)|(output|include|write out) (your|the) (full )?(reasoning|chain[- ]of[- ]thought)'
R3='avoid (a |the )?generic (look|design|style)|(not|don.t) look (ai|AI)[- ]generated|make it (look )?less generic'

scan() {
  local rule="$1" re="$2"
  grep -rniE --include='*.md' --include='*.txt' --include='*.json' --include='*.yaml' --include='*.yml' \
    --exclude-dir=node_modules --exclude-dir=.git "$re" "${TARGETS[@]}" 2>/dev/null \
    | grep -v '/skills/prompt-lint/' \
    | sed -E "s/^([^:]+:[0-9]+):[[:space:]]*/\1: [$rule] /" \
    | cut -c1-240
}

OUT="$( { scan R1-think-directive "$R1"; scan R2-show-reasoning "$R2"; scan R3-vague-anti-generic "$R3"; } | sort -u )"
if [ -z "$OUT" ]; then
  echo "prompt-lint: 0 regex findings in: ${TARGETS[*]}"
else
  echo "$OUT"
  echo "---"
  echo "prompt-lint: $(printf '%s\n' "$OUT" | wc -l | tr -d ' ') regex findings (review in context; R4/R5 need manual reading)"
fi
