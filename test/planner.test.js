import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createFollowupPlan, formatPlan } from '../src/index.js';

test('creates a draft follow-up plan', () => {
  const plan = createFollowupPlan(fs.readFileSync('fixtures/customer-sync.md', 'utf8'), { now: '2026-06-11T00:00:00.000Z' });
  assert.equal(plan.status, 'draft');
  assert.match(plan.followup, /Decisions:/);
  assert.ok(plan.checklist.some(item => item.item.includes('due dates')));
});

test('blocks secret-like input', () => {
  const plan = createFollowupPlan(fs.readFileSync('fixtures/unsafe-notes.md', 'utf8'));
  assert.equal(plan.status, 'blocked');
  assert.ok(plan.safety.some(finding => finding.code === 'sensitive-token'));
});

test('formats markdown output', () => {
  const plan = createFollowupPlan(fs.readFileSync('fixtures/customer-sync.md', 'utf8'));
  assert.match(formatPlan(plan, 'md'), /## CRM Note/);
});
