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

test('preserves task wording that merely contains due', () => {
  const meeting = parseMeetingNotes('# Sync\n## Actions\n- Mina: complete due diligence report');
  assert.deepEqual(meeting.actions, [{ owner: 'Mina', task: 'complete due diligence report', due: null }]);
});

test('removes only the recognized due clause from task wording', () => {
  const meeting = parseMeetingNotes('# Sync\n## Actions\n- Mina: send recap due tomorrow after legal approval');
  assert.deepEqual(meeting.actions, [{ owner: 'Mina', task: 'send recap after legal approval', due: 'tomorrow' }]);
});

test('represents impossible calendar dates as missing', () => {
  const meeting = parseMeetingNotes('# Sync\n## Actions\n- Mina: send recap due 2026-02-29\n- Jay: review due 2026-13-01');
  assert.deepEqual(meeting.actions.map(action => action.due), [null, null]);
});

test('parses attendee section bullets without leaking them into notes', () => {
  const meeting = parseMeetingNotes(`# Weekly Sync
## Attendees
- Sam
* Lee
## Decisions
- Keep the Friday release
## Actions
- [ ] Sam: send recap due tomorrow`);

  assert.deepEqual(meeting.attendees, ['Sam', 'Lee']);
  assert.deepEqual(meeting.notes, []);
  assert.deepEqual(meeting.decisions, ['Keep the Friday release']);
  assert.deepEqual(meeting.actions, [{ owner: 'Sam', task: 'send recap', due: 'tomorrow' }]);
});

test('supports Participants headings and deduplicates inline attendees', () => {
  const meeting = parseMeetingNotes(`# Planning
Attendees: Sam, Lee; Sam
## Participants
- Lee
- Priya
## Questions
- Is Friday still available?`);

  assert.deepEqual(meeting.attendees, ['Sam', 'Lee', 'Priya']);
  assert.deepEqual(meeting.questions, ['Is Friday still available?']);
  assert.deepEqual(meeting.notes, []);
});
