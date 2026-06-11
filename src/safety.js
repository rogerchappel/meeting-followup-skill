const TOKEN_PATTERNS = [
  /sk-[A-Za-z0-9_-]{12,}/,
  /AKIA[0-9A-Z]{12,}/,
  /xox[baprs]-[A-Za-z0-9-]{10,}/,
  /\b(?:password|secret|api[_ -]?key)\s*[:=]/i
];

const EXTERNAL_ACTIONS = /\b(send|email|post|publish|update crm|create ticket|invite|schedule|book)\b/i;

export function inspectSafety(meeting, sourceText = '') {
  const findings = [];
  for (const pattern of TOKEN_PATTERNS) {
    if (pattern.test(sourceText)) findings.push({ level: 'blocker', code: 'sensitive-token', message: 'Input appears to include a credential or secret-like token.' });
  }
  meeting.actions.forEach((action, index) => {
    if (!action.owner) findings.push({ level: 'warn', code: 'missing-owner', message: `Action ${index + 1} has no owner.` });
    if (!action.due) findings.push({ level: 'warn', code: 'missing-due-date', message: `Action ${index + 1} has no due date.` });
    if (EXTERNAL_ACTIONS.test(action.task)) findings.push({ level: 'approval', code: 'external-action', message: `Action ${index + 1} may require approval before external side effects.` });
  });
  if (!meeting.decisions.length) findings.push({ level: 'info', code: 'no-decisions', message: 'No explicit decisions were captured.' });
  return findings;
}

export function hasBlockers(findings) {
  return findings.some(finding => finding.level === 'blocker');
}
