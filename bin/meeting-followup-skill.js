#!/usr/bin/env node
import fs from 'node:fs';
import { createFollowupPlan, formatPlan } from '../src/index.js';

const args = process.argv.slice(2);
const command = args[0] || 'plan';
const getArg = (name, fallback = null) => {
  const index = args.indexOf(name);
  return index === -1 ? fallback : args[index + 1];
};

if (command === 'help' || args.includes('--help')) {
  console.log('Usage: meeting-followup-skill plan --input notes.md [--format json|md]');
  process.exit(0);
}

if (command !== 'plan' && command !== 'validate') {
  console.error(`Unknown command: ${command}`);
  process.exit(2);
}

const input = getArg('--input');
if (!input) {
  console.error('Missing --input');
  process.exit(2);
}
const text = fs.readFileSync(input, 'utf8');
const plan = createFollowupPlan(text);
if (command === 'validate') {
  const blockers = plan.safety.filter(f => f.level === 'blocker');
  console.log(JSON.stringify({ status: blockers.length ? 'blocked' : 'ok', findings: plan.safety }, null, 2));
  process.exit(blockers.length ? 1 : 0);
}
process.stdout.write(formatPlan(plan, getArg('--format', 'json')));
