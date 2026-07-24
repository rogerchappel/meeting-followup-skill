#!/usr/bin/env node
import fs from 'node:fs';
import { createFollowupPlan, formatPlan } from '../src/index.js';

const args = process.argv.slice(2);
const command = args[0] || 'plan';
const failUsage = message => {
  console.error(message);
  process.exit(2);
};
const getArg = (name, fallback = null) => {
  const index = args.indexOf(name);
  if (index === -1) return fallback;
  const value = args[index + 1];
  if (!value || value.startsWith('--')) {
    failUsage(`Option ${name} requires a value.`);
  }
  return value;
};

if (command === 'help' || args.includes('--help')) {
  console.log('Usage: meeting-followup-skill plan --input notes.md [--format json|md]');
  process.exit(0);
}

if (command !== 'plan' && command !== 'validate') {
  failUsage(`Unknown command: ${command}`);
}

const input = getArg('--input');
if (!input) {
  failUsage('Missing required option --input.');
}

const format = getArg('--format', 'json');
if (format !== 'json' && format !== 'md') {
  failUsage(`Unsupported format "${format}". Expected json or md.`);
}

let text;
try {
  text = fs.readFileSync(input, 'utf8');
} catch (error) {
  const reason = error.code === 'ENOENT' ? 'file not found' : `read failed (${error.code || 'unknown error'})`;
  console.error(`Unable to read input "${input}": ${reason}.`);
  process.exit(3);
}

const plan = createFollowupPlan(text);
if (command === 'validate') {
  const blockers = plan.safety.filter(f => f.level === 'blocker');
  console.log(JSON.stringify({ status: blockers.length ? 'blocked' : 'ok', findings: plan.safety }, null, 2));
  process.exit(blockers.length ? 1 : 0);
}
process.stdout.write(formatPlan(plan, format));
