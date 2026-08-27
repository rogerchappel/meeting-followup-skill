import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createFollowupPlan, formatPlan } from '../src/index.js';

test('creates a draft follow-up plan', () => {
  const plan = createFollowupPlan(fs.readFileSync('fixtures/customer-sync.md', 'utf8'), { now: '2026-06-11T00:00:00.000Z' });
  assert.equal(plan.status, 'draft');
  assert.match(plan.followup, /Decisions:/);
  assert.ok(plan.checklist.some(item => item.item.includes('due dates')));
  assert.equal(plan.checklist.find(item => item.item.includes('owner')).done, true);
  assert.equal(plan.checklist.find(item => item.item.includes('due dates')).done, false);
});

test('does not mark action readiness complete when no actions exist', () => {
  const plan = createFollowupPlan('# Empty');
  assert.equal(plan.meeting.actions.length, 0);
  assert.equal(plan.checklist.find(item => item.item.includes('owner')).done, false);
  assert.equal(plan.checklist.find(item => item.item.includes('due dates')).done, false);
});

test('treats an impossible action date as missing', () => {
  const plan = createFollowupPlan('# Sync\n## Actions\n- Mina: send recap due 2026-02-29');
  assert.equal(plan.meeting.actions[0].due, null);
  assert.equal(plan.checklist.find(item => item.item.includes('due dates')).done, false);
});

test('blocks secret-like input', () => {
  const plan = createFollowupPlan(fs.readFileSync('fixtures/unsafe-notes.md', 'utf8'));
  assert.equal(plan.status, 'blocked');
  assert.ok(plan.safety.some(finding => finding.code === 'sensitive-token'));
});

test('approval-gates CRM write actions without flagging ordinary CRM discussion', () => {
  for (const task of ['Log notes in CRM', 'Write to CRM']) {
    const plan = createFollowupPlan(`# Sync\n## Actions\n- Sam: ${task} due tomorrow`);
    assert.ok(plan.safety.some(finding => finding.code === 'external-action'));
    assert.equal(plan.checklist.find(item => item.item.includes('CRM writes')).done, false);
  }

  const discussion = createFollowupPlan('# Sync\n## Actions\n- Sam: Discuss CRM reporting due tomorrow');
  assert.ok(!discussion.safety.some(finding => finding.code === 'external-action'));
  assert.equal(discussion.checklist.find(item => item.item.includes('CRM writes')).done, true);
});

test('formats markdown output', () => {
  const plan = createFollowupPlan(fs.readFileSync('fixtures/customer-sync.md', 'utf8'));
  assert.match(formatPlan(plan, 'md'), /## CRM Note/);
});
