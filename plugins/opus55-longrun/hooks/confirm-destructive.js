#!/usr/bin/env node
// PreToolUse hook (Bash): force a confirmation prompt for destructive commands,
// even when the session runs autonomously. Emits permissionDecision "ask".

const RULES = [
  // Filesystem
  [/\brm\s+(-[a-zA-Z]*r[a-zA-Z]*f|-[a-zA-Z]*f[a-zA-Z]*r|(-[a-zA-Z]*[rR][a-zA-Z]*\s+-[a-zA-Z]*f)|(-[a-zA-Z]*f[a-zA-Z]*\s+-[a-zA-Z]*[rR])|--recursive\s+--force|--force\s+--recursive)\b/, 'recursive force delete (rm -rf)'],
  [/\bfind\b.*\s(-delete|-exec\s+rm)\b/, 'find with delete'],
  [/\b(mkfs(\.\w+)?|dd\s+.*\bof=\/dev\/)/, 'disk format/overwrite'],
  // Git history / working tree
  [/\bgit\s+push\b.*(\s--force(-with-lease)?\b|\s-f\b|\s\+\S+)/, 'git force-push'],
  [/\bgit\s+reset\b.*--hard\b/, 'git reset --hard'],
  [/\bgit\s+clean\b.*\s-[a-zA-Z]*f/, 'git clean -f'],
  [/\bgit\s+branch\b.*\s-D\b/, 'force-delete git branch'],
  [/\bgit\s+(checkout\s+--\s+\.|restore\s+(?!--staged)\S*\.)(\s|$)/, 'discard all working-tree changes'],
  [/\bgit\s+stash\s+(drop|clear)\b/, 'drop git stash'],
  // GitHub visibility / deletion
  [/\bgh\s+repo\s+delete\b/, 'delete GitHub repo'],
  [/\bgh\s+repo\s+(create\b.*--public|edit\b.*--visibility[=\s]+public)\b/, 'make GitHub repo public'],
  // Databases
  [/\b(DROP\s+(TABLE|DATABASE|SCHEMA|INDEX|VIEW|COLUMN)|TRUNCATE(\s+TABLE)?\s+\w)/i, 'SQL DROP/TRUNCATE'],
  [/\bDELETE\s+FROM\s+[\w."]+\s*(;|"|'|$)/i, 'SQL DELETE without WHERE'],
  [/\bsupabase\s+db\s+reset\b/, 'supabase db reset'],
  [/\bprisma\s+(migrate\s+reset|db\s+push\b.*(--force-reset|--accept-data-loss))/, 'prisma destructive reset'],
  [/\b(FLUSHALL|FLUSHDB)\b/i, 'redis flush'],
  // Infra / cloud
  [/\bterraform\s+destroy\b/, 'terraform destroy'],
  [/\bkubectl\s+delete\b/, 'kubectl delete'],
  [/\bdocker\s+(system\s+prune|volume\s+(rm|prune))\b/, 'docker prune/volume delete'],
  [/\b(railway|vercel|fly|flyctl|heroku|yc)\b.*\b(delete|destroy|down|remove)\b/, 'cloud resource deletion'],
];

let input = '';
process.stdin.on('data', (c) => (input += c));
process.stdin.on('end', () => {
  let cmd = '';
  try {
    cmd = JSON.parse(input).tool_input?.command || '';
  } catch {
    process.exit(0);
  }
  const hits = RULES.filter(([re]) => re.test(cmd)).map(([, label]) => label);
  if (hits.length === 0) process.exit(0);
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'ask',
        permissionDecisionReason: `Destructive command detected: ${hits.join(', ')}. Confirm before running.`,
      },
    })
  );
});
