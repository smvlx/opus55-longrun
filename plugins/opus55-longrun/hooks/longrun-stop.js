#!/usr/bin/env node
// Stop hook for long runs.
// 1. Checklist guard: if THIS session started a "## Delegated:" section in PROGRESS.md,
//    items are still unchecked, and the final message has no "Blocked on me" report,
//    block the stop once and tell Claude to continue or report properly.
// 2. Blocked-on-me notification: if the final message has a non-empty
//    "Blocked on me" section, post a desktop notification (macOS / Linux).
// Opt out per shell: OPUS55_STOP_GUARD=0 / OPUS55_NOTIFY=0.

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

function lastAssistantText(input) {
  if (typeof input.last_assistant_message === 'string') return input.last_assistant_message;
  const p = input.transcript_path;
  if (!p || !fs.existsSync(p)) return '';
  const lines = fs.readFileSync(p, 'utf8').trim().split('\n');
  for (let i = lines.length - 1; i >= 0; i--) {
    try {
      const e = JSON.parse(lines[i]);
      if (e.type !== 'assistant') continue;
      const c = e.message?.content;
      const text = Array.isArray(c)
        ? c.filter((b) => b.type === 'text').map((b) => b.text).join('\n')
        : typeof c === 'string' ? c : '';
      if (text.trim()) return text;
    } catch {}
  }
  return '';
}

function blockedSection(text) {
  const m = text.match(/^#{1,4}\s*\**Blocked on me\**\s*$([\s\S]*?)(?=^#{1,4}\s|\s*$(?![\s\S]))/im);
  if (!m) return null;
  return m[1].trim();
}

function uncheckedDelegated(cwd) {
  const f = path.join(cwd, 'PROGRESS.md');
  if (!fs.existsSync(f)) return [];
  const out = [];
  let section = null;
  for (const line of fs.readFileSync(f, 'utf8').split('\n')) {
    const h = line.match(/^##\s+Delegated:\s*(.+)$/);
    if (h) { section = h[1].trim(); continue; }
    if (/^##\s/.test(line)) { section = null; continue; }
    if (section && /^\s*-\s\[ \]/.test(line)) out.push({ section, item: line.replace(/^\s*-\s\[ \]\s*/, '') });
  }
  return out;
}

function sessionDelegated(input) {
  const p = input.transcript_path;
  if (!p || !fs.existsSync(p)) return false;
  return fs.readFileSync(p, 'utf8').includes('## Delegated:');
}

function notify(title, body) {
  const esc = (s) => s.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  try {
    if (process.platform === 'darwin') {
      execFileSync('osascript', ['-e', `display notification "${esc(body)}" with title "${esc(title)}" sound name "Glass"`], { timeout: 5000 });
    } else if (process.platform === 'linux') {
      execFileSync('notify-send', [title, body], { timeout: 5000 });
    }
  } catch {}
}

let raw = '';
process.stdin.on('data', (c) => (raw += c));
process.stdin.on('end', () => {
  let input;
  try { input = JSON.parse(raw); } catch { process.exit(0); }
  const cwd = input.cwd || process.cwd();
  const text = lastAssistantText(input);
  const blocked = blockedSection(text);

  // 1. Checklist guard
  if (process.env.OPUS55_STOP_GUARD !== '0' && !input.stop_hook_active && blocked === null && sessionDelegated(input)) {
    const open = uncheckedDelegated(cwd);
    if (open.length) {
      const list = open.slice(0, 8).map((o) => `- ${o.item}`).join('\n');
      process.stdout.write(JSON.stringify({
        decision: 'block',
        reason: `PROGRESS.md still has ${open.length} unchecked item(s) under "Delegated: ${open[0].section}":\n${list}\n\nIf you can continue without the user, keep working. If they're done, tick them. If you are blocked, end with the "Blocked on me / Done criteria / Changed / Found" report.`,
      }));
      return;
    }
  }

  // 2. Blocked-on-me notification
  if (process.env.OPUS55_NOTIFY !== '0' && blocked && !/^[-*\s]*(nothing|none|n\/a)\b/i.test(blocked)) {
    const first = blocked.split('\n').map((l) => l.replace(/^[-*\d.\s]+/, '').trim()).find(Boolean) || 'Needs your input';
    notify(`Claude is blocked on you — ${path.basename(cwd)}`, first.slice(0, 180));
  }
});
