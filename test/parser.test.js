import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseMeetingNotes } from '../src/index.js';

test('parses attendees decisions and actions', () => {
  const meeting = parseMeetingNotes(fs.readFileSync('fixtures/customer-sync.md', 'utf8'));
  assert.equal(meeting.title, 'Customer Sync');
  assert.deepEqual(meeting.attendees, ['Mina', 'Jay', 'Omar']);
  assert.equal(meeting.decisions.length, 2);
  assert.equal(meeting.actions[0].owner, 'Mina');
  assert.equal(meeting.actions[0].due, '2026-06-14');
});

test('retains supported relative action dates', () => {
  const meeting = parseMeetingNotes('# Sync\n## Actions\n- Mina: send recap due tomorrow\n- Jay: review due next week');
  assert.deepEqual(meeting.actions.map(action => action.due), ['tomorrow', 'next week']);
});

test('represents impossible calendar dates as missing', () => {
  const meeting = parseMeetingNotes('# Sync\n## Actions\n- Mina: send recap due 2026-02-29\n- Jay: review due 2026-13-01');
  assert.deepEqual(meeting.actions.map(action => action.due), [null, null]);
});
